import os
from PIL import Image


#  遍历图片文件夹，打印每张图片的文件名、文件大小（KB）和尺寸（像素）。
def print_image_info(folder_path='imgs'):
    # 支持的图片格式
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tiff'}

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        # 跳过非文件
        if not os.path.isfile(file_path):
            continue

        # 检查文件扩展名
        _, ext = os.path.splitext(filename)
        if ext.lower() not in image_extensions:
            continue

        try:
            # 获取文件大小（单位 KB）
            file_size_kb = os.path.getsize(file_path) / 1024

            # 打开图片获取尺寸
            with Image.open(file_path) as img:
                width, height = img.size

            # 打印信息
            print(f"{filename:<30} | {file_size_kb:7.1f} KB | {width} x {height} px")

        except Exception as e:
            print(f"无法处理文件 {filename}：{e}")


if __name__ == "__main__":
    src = r" D:\fullStack\image_app\small_imgs ".strip()
    print_image_info(src)
    
