import os
import shutil

def move_small_images(src_folder='imgs', dst_folder='small_imgs', size_threshold_kb=200):
    """
    检查 src_folder 中的图片文件，如果文件小于 size_threshold_kb KB 
    就移动到 dst_folder 中。
    
    参数：
        src_folder (str): 原始图片文件夹路径
        dst_folder (str): 小图片目标文件夹路径
        size_threshold_kb (int): 文件大小阈值  单位 KB
    """
    # 支持的图片格式
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tiff'}

    # 如果目标文件夹不存在，就创建
    if not os.path.exists(dst_folder):
        os.makedirs(dst_folder)

    for filename in os.listdir(src_folder):
        src_path = os.path.join(src_folder, filename)

        # 跳过文件夹
        if not os.path.isfile(src_path):
            continue

        # 检查扩展名
        _, ext = os.path.splitext(filename)
        if ext.lower() not in image_extensions:
            continue

        # 获取文件大小（字节），转换为 KB
        file_size_kb = os.path.getsize(src_path) / 1024

        # 判断是否小于阈值
        if file_size_kb < size_threshold_kb:
            dst_path = os.path.join(dst_folder, filename)
            shutil.move(src_path, dst_path)
            print(f"Moved: {filename} ({file_size_kb:.1f} KB)")


if __name__ == "__main__":
    # 示例：移动小于 200 KB 的图片
    # 参数是: 源文件夹、目标文件夹、大小阈值 kb
    src = r'D:\1_dd_videos\ebay_good_imgs'
    move_small_images(src, 'small_imgs', 100)
