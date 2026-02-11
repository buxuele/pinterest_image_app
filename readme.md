
### 目标

1. 查看图片，瀑布流。
2. 删除图片，比如从100个图片里面删除 10个。
3. 你以为很难的地方，其实不难(比如，算法)； 
4. 你以为不重要的地方，其实很重要(比如，前端 app, 展示效果)。

![image1](效果图/a1.jpg)
![image2](效果图/a2.jpg)


### 重要说明

1. 本地图库请放在 `imgs_data/<文件夹名>`，前端会自动读取这些文件夹。
2. 上传图片会保存到 `backend_python_api/user_uploads`。
3. Windows 系统可直接运行 `just_run.bat`。

### 环境要求

1. Python 3.10+（已安装 pip）
2. Node.js 18+ 和 npm

### 配置

1. 默认前端通过代理访问 `http://localhost:8000`。
2. 若前后端不在同一域名/端口，创建 `frontend_react_app/.env` 并设置 `REACT_APP_API_BASE_URL`。

### 清理

1. 删除图片会移动到 `backend_python_api/dustbin`。
2. 需要定期手动清理该目录以释放磁盘空间。


## 分步骤运行

### 1. 启动 server
- api:   uvicorn main:app --reload
- 或者:   
- uvicorn main:app  --reload --host 127.0.0.1 --port 8000

转到:   http://127.0.0.1:8000/docs
转到:   http://127.0.0.1:8000/images

### 2. 启动前端 react client
- npm start 
