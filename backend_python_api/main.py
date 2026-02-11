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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "*" ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMGS_DATA_DIR = Path("../imgs_data")
current_img_dir = Path("../imgs_data/cool_imgs")

mounted_dirs = {}

UPLOAD_DIR = "./user_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

@app.get("/images", response_model=List[dict])
def get_images(skip: int = 0, limit: int = 5, folder: str = "cool_imgs"):
    try:
        image_dir = IMGS_DATA_DIR / folder
        
        if not image_dir.exists():
            return []
        
        mount_path = f"/images/{folder}"
        if mount_path not in mounted_dirs:
            try:
                app.mount(mount_path, StaticFiles(directory=str(image_dir)), name=f"images_{folder}")
                mounted_dirs[mount_path] = str(image_dir)
            except Exception as e:
                print(f"挂载目录失败: {e}")
        
        images = [
            {"filename": f, "url": f"{mount_path}/{f}"}
            for f in os.listdir(image_dir)
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.tif'))
        ]
        
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
        original_filename = file.filename
        
        file_path = os.path.join(UPLOAD_DIR, original_filename)
        counter = 1
        name, ext = os.path.splitext(original_filename)
        while os.path.exists(file_path):
            new_filename = f"{name}_{counter}{ext}"
            file_path = os.path.join(UPLOAD_DIR, new_filename)
            counter += 1
        
        final_filename = os.path.basename(file_path)
        
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
        images.sort(key=lambda x: x["upload_time"], reverse=True)
        return images
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/user-images/{filename}")
async def delete_user_image(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="图片不存在")
            
        if not os.path.abspath(file_path).startswith(os.path.abspath(UPLOAD_DIR)):
            raise HTTPException(status_code=403, detail="无权删除此文件")
            
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.jfif', '.tif')):
            raise HTTPException(status_code=400, detail="不支持的文件类型")
            
        dustbin_path = "./dustbin"
        
        if not os.path.exists(dustbin_path):
            os.makedirs(dustbin_path)
        
        target_path = os.path.join(dustbin_path, filename)
        shutil.move(file_path, target_path)
        
        return {"status": "success", "message": "图片已删除"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/images/{folder}/{filename}")
async def delete_folder_image(folder: str, filename: str):
    try:
        image_dir = IMGS_DATA_DIR / folder
        file_path = image_dir / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="图片不存在")
            
        if not str(file_path.resolve()).startswith(str(image_dir.resolve())):
            raise HTTPException(status_code=403, detail="无权删除此文件")
            
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.jfif', '.tif')):
            raise HTTPException(status_code=400, detail="不支持的文件类型")
            
        dustbin_path = "./dustbin"
        
        if not os.path.exists(dustbin_path):
            os.makedirs(dustbin_path)
        
        target_path = os.path.join(dustbin_path, filename)
        shutil.move(str(file_path), target_path)
        
        return {"status": "success", "message": "图片已删除"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



"""
本应用推荐使用本地回环地址以避免代理软件（如 Clash Verge）拦截导致的 502 问题。

运行命令: 

uvicorn main:app --host 127.0.0.1 --port 8000 --reload

访问: 
http://127.0.0.1:8000
"""



