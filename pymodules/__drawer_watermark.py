# pymodules/__drawer_watermark.py

import time

from PIL import ImageDraw, ImageFont


def generate_watermark(image):
    draw = ImageDraw.Draw(image)
    img_size = image.size[0]

    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    footer_text = f"© {time.strftime('%Y')} The Atlas by Banshee · All Rights Reserved"
    text_bbox = draw.textbbox((0, 0), footer_text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_x = img_size - text_width - 20
    text_y = img_size - 30
    draw.text((text_x, text_y), footer_text, font=font, fill="#404040")
