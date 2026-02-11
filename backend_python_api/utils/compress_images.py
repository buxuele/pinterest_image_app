from PIL import Image
import os
from pathlib import Path

def compress_image(image_path, max_width=2000, quality=90):
    try:
        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            if img.width > max_width:
                aspect_ratio = img.height / img.width
                new_height = int(max_width * aspect_ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                img.save(image_path, 'JPEG', quality=quality, optimize=True)
                print(f"压缩: {image_path.name} -> {max_width}px")
                return True
            else:
                print(f"跳过: {image_path.name} (已经足够小)")
                return False
    except Exception as e:
        print(f"压缩失败 {image_path}: {e}")
        return False

def compress_folder(folder_path, max_width=2000, quality=90):
    folder_path = Path(folder_path)
    if not folder_path.exists():
        print(f"文件夹不存在: {folder_path}")
        return
    
    count = 0
    for file in folder_path.iterdir():
        if file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.tif']:
            if compress_image(file, max_width, quality):
                count += 1
    
    print(f"\n完成！共压缩 {count} 张图片")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        folder = sys.argv[1]
    else:
        folder = "../../imgs_data/cool_imgs"
    
    print(f"开始压缩文件夹: {folder}")
    compress_folder(folder, max_width=2000, quality=90)
