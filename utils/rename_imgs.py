import os
import uuid

def rename_images_with_uuid_prefix(folder_path):
    """
    将指定文件夹中的所有图片文件重命名，
    在原始文件名前加上8位随机 UUID 前缀。
    
    参数：
        folder_path (str): 图片所在文件夹的路径
    """
    # 支持的图片文件扩展名
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tiff'}

    for filename in os.listdir(folder_path):
        # 获取文件的完整路径
        file_path = os.path.join(folder_path, filename)
        
        # 跳过文件夹，只处理文件
        if not os.path.isfile(file_path):
            continue

        # 获取文件扩展名（小写）
        _, ext = os.path.splitext(filename)
        if ext.lower() not in image_extensions:
            continue

        # 生成 UUID 的前8位
        uuid_prefix = str(uuid.uuid4())[:8]

        # 构造新文件名
        new_filename = f"{uuid_prefix}_{filename}"
        new_file_path = os.path.join(folder_path, new_filename)

        # 重命名文件
        os.rename(file_path, new_file_path)
        print(f"Renamed: {filename} -> {new_filename}")


if __name__ == "__main__":
    # 示例：重命名指定文件夹中的图片
    folder_path = r"D:\fullStack\image_app\api\imgs"   
    rename_images_with_uuid_prefix(folder_path)

