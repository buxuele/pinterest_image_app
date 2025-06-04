from multiprocessing import Process
import subprocess
import os
import time

def start_api(path):
    """启动 FastAPI 服务，使用 uvicorn。"""
    # 设置工作目录为 api 子目录
    api_dir = os.path.join(path, 'api')
    # 在 api 目录下运行 uvicorn，启动 main.py 中的 app
    subprocess.call(['uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], cwd=api_dir)

def start_frontend(path):
    """启动 React 前端。"""
    # 设置工作目录为 react_image_app 子目录
    react_dir = os.path.join(path, 'react_image_app')
    # 在 react_image_app 目录下运行 npm start
    subprocess.call(['npm', 'start'], cwd=react_dir, shell=(os.name == 'nt'))



if __name__ == '__main__':
    # 获取当前脚本所在目录的绝对路径 (D:\py\just_spiders\image_app)
    path = os.path.realpath(os.path.dirname(__file__))

    # 启动 API 进程
    api = Process(target=start_api, kwargs={'path': path})
    api.start()

    # 延迟 2 秒，确保 API 先启动
    time.sleep(3)

    # 启动 React 前端进程
    frontend = Process(target=start_frontend, kwargs={'path': path})
    frontend.start()

    # 等待两个进程完成，支持优雅关闭
    try:
        api.join()
        frontend.join()
    except KeyboardInterrupt:
        print("\n正在关闭...")
        api.terminate()
        frontend.terminate()



