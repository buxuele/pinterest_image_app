from PIL import Image
import os
from pathlib import Path

def generate_thumbnail(image_path, thumbnail_path, width=300):
    try:
        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            aspect_ratio = img.height / img.width
            new_height = int(width * aspect_ratio)
            
            img.thumbnail((width, new_height), Image.Resampling.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
            return True
    except Exception as e:
        print(f"生成缩略图失败 {image_path}: {e}")
        return False

def ensure_thumbnail(image_path, thumbnail_dir, width=1000):
    image_path = Path(image_path)
    thumbnail_dir = Path(thumbnail_dir)
    
    thumbnail_dir.mkdir(parents=True, exist_ok=True)
    
    thumbnail_name = image_path.stem + '.jpg'
    thumbnail_path = thumbnail_dir / thumbnail_name
    
    if not thumbnail_path.exists():
        generate_thumbnail(image_path, thumbnail_path, width)
    
    return thumbnail_path
