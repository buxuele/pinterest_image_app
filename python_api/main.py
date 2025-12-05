from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from typing import List
import sys
from pathlib import Path
import shutil
from datetime import datetime
from utils.rename_imgs import just_rename_imgs
from utils.rename_imgs import *

app = FastAPI(title="Image API")

# 修图片目录  street star 
 
img_root_dir = r" cool_imgs ".strip()   


# 配置 CORS，允许 React 访问
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000", "http://localhost:3001",
    #                "http://192.168.1.*",  # 或者用通配符匹配局域网范围（视框架支持）
    #                "*"],

    
    allow_origins=[ "*" ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
app.mount("/images", StaticFiles(directory=img_root_dir), name="images")

# 创建用户上传图片的目录
UPLOAD_DIR = "./user_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 挂载用户上传的图片目录
app.mount("/user_images", StaticFiles(directory=UPLOAD_DIR), name="user_images")

# 获取图片列表（支持分页）
@app.get("/images", response_model=List[dict])
def get_images(skip: int = 0, limit: int = 5):
    # 获取 imgs/ 文件夹中的图片文件
    image_dir = img_root_dir 
    images = [
        {"filename": f, "url": f"/images/{f}"}
        for f in os.listdir(image_dir)
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))
    ]
    # 分页
    total = len(images)
    images = images[skip:skip + limit]
    return images

@app.post("/api/reshuffle-images")
async def reshuffle_images():
    try:
        just_rename_imgs(img_root_dir)
        return {"status": "success", "message": "Images have been reshuffled"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 生成唯一的文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1].lower()
        new_filename = f"{timestamp}_{file.filename}"
        
        # 保存文件
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "status": "success",
            "filename": new_filename,
            "url": f"/user_images/{new_filename}"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/user-images")
async def get_user_images():
    try:
        images = []
        for filename in os.listdir(UPLOAD_DIR):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                images.append({
                    "filename": filename,
                    "url": f"/user_images/{filename}",
                    "upload_time": datetime.fromtimestamp(
                        os.path.getctime(os.path.join(UPLOAD_DIR, filename))
                    ).strftime("%Y-%m-%d %H:%M:%S")
                })
        # 按上传时间倒序排序
        images.sort(key=lambda x: x["upload_time"], reverse=True)
        return images
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/user-images/{filename}")
async def delete_user_image(filename: str):
    try:
        # 构建完整的文件路径
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="图片不存在")
            
        # 检查文件是否在允许的目录中
        if not os.path.abspath(file_path).startswith(os.path.abspath(UPLOAD_DIR)):
            raise HTTPException(status_code=403, detail="无权删除此文件")
            
        # 检查文件扩展名
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            raise HTTPException(status_code=400, detail="不支持的文件类型")
            
        # 删除文件
        # os.remove(file_path)

        # 构建目标文件夹路径（桌面上的 del_me 文件夹）
        desktop_path = os.path.expanduser("~/Desktop")
        del_me_path = os.path.join(desktop_path, "del_me")
        
        # 如果 del_me 文件夹不存在，创建它
        if not os.path.exists(del_me_path):
            os.makedirs(del_me_path)
        
        # 构建目标文件的完整路径
        target_path = os.path.join(del_me_path, filename)
        
        # 移动文件到 del_me 文件夹
        shutil.move(file_path, target_path)
        
        return {"status": "success", "message": "图片已删除"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



"""
下面这个命令，会导致手机上无法访问图片！！！ 不推荐！
uvicorn main:app --reload
http://127.0.0.1:8000


正确的运行命令: 

确保 FastAPI 服务器已经在电脑上启动，并且绑定到 0.0.0.0，
而不是默认的 127.0.0.1，命令如下：

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

进入  http://127.0.0.1:8000
查看效果

"""



