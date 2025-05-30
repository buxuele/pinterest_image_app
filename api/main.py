from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from typing import List

app = FastAPI(title="Image API")

# 这个是最关键的地方！
# 根目录，存放图片的文件夹！！！ 修改为你的图片目录
img_root_dir = "./face"   
# img_root_dir = "./imgs"   
# img_root_dir = "./pretty_nice"   

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



# 运行命令: 

# 确保 FastAPI 服务器已经在电脑上启动，并且绑定到 0.0.0.0（而不是默认的 127.0.0.1），命令如下：
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 下面这个命令，会导致手机上无法访问图片！！！ 不推荐！
# uvicorn main:app --reload
# http://127.0.0.1:8000




