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

# 图片根目录
IMGS_DATA_DIR = Path("../imgs_data")
# 当前选择的图片目录
current_img_dir = Path("../imgs_data/cool_imgs")

# 动态挂载图片目录的字典
mounted_dirs = {}

# 创建用户上传图片的目录
UPLOAD_DIR = "./user_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 挂载用户上传的图片目录
app.mount("/user_images", StaticFiles(directory=UPLOAD_DIR), name="user_images")


# 获取可用的图片文件夹列表
@app.get("/api/folders")
def get_folders():
    try:
        folders = []
        imgs_data_path = IMGS_DATA_DIR
        if imgs_data_path.exists():
            for item in imgs_data_path.iterdir():
                if item.is_dir():
                    folders.append(item.name)
        return {"status": "success", "folders": folders}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 获取图片列表（支持分页和文件夹选择）
@app.get("/images", response_model=List[dict])
def get_images(skip: int = 0, limit: int = 5, folder: str = "cool_imgs"):
    try:
        # 构建图片目录路径
        image_dir = IMGS_DATA_DIR / folder
        
        # 检查目录是否存在
        if not image_dir.exists():
            return []
        
        # 动态挂载该文件夹（如果还没挂载）
        mount_path = f"/images/{folder}"
        if mount_path not in mounted_dirs:
            try:
                app.mount(mount_path, StaticFiles(directory=str(image_dir)), name=f"images_{folder}")
                mounted_dirs[mount_path] = str(image_dir)
            except Exception as e:
                print(f"挂载目录失败: {e}")
        
        # 获取图片文件列表
        images = [
            {"filename": f, "url": f"{mount_path}/{f}"}
            for f in os.listdir(image_dir)
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.tif'))
        ]
        
        # 分页
        total = len(images)
        images = images[skip:skip + limit]
        return images
    except Exception as e:
        print(f"获取图片列表失败: {e}")
        return []

@app.post("/api/reshuffle-images")
async def reshuffle_images(folder: str = "cool_imgs"):
    try:
        image_dir = IMGS_DATA_DIR / folder
        if not image_dir.exists():
            return {"status": "error", "message": "文件夹不存在"}
        just_rename_imgs(image_dir)
        return {"status": "success", "message": "Images have been reshuffled"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 直接使用原始文件名，不重命名
        original_filename = file.filename
        
        # 如果文件已存在，添加数字后缀
        file_path = os.path.join(UPLOAD_DIR, original_filename)
        counter = 1
        name, ext = os.path.splitext(original_filename)
        while os.path.exists(file_path):
            new_filename = f"{name}_{counter}{ext}"
            file_path = os.path.join(UPLOAD_DIR, new_filename)
            counter += 1
        
        final_filename = os.path.basename(file_path)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "status": "success",
            "filename": final_filename,
            "url": f"/user_images/{final_filename}"
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



