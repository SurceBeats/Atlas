# pymodules/__drawer_cplanet_depth.py

import math
import random

from pymodules.__atlas_fixed_vars import VISUAL_DEBUG

from PIL import Image, ImageDraw, ImageColor


def generate_rndback(planet_radius, base_color, seed):
    rng = random.Random(seed)
    gradient_img = Image.new(
        "RGBA", (2 * planet_radius, 2 * planet_radius), color=(0, 0, 0, 0)
    )
    gradient_draw = ImageDraw.Draw(gradient_img)

    base_rgb = ImageColor.getrgb(base_color)

    random_r = rng.randint(-13, 13)
    random_g = rng.randint(-13, 13)
    random_b = rng.randint(-13, 13)

    modified_color = (
        max(0, min(255, base_rgb[0] + random_r)),
        max(0, min(255, base_rgb[1] + random_g)),
        max(0, min(255, base_rgb[2] + random_b)),
    )

    opacity = rng.randint(240, 255)
    gradient_color = (*modified_color, opacity)
    gradient_draw.ellipse(
        (0, 0, 2 * planet_radius, 2 * planet_radius), fill=gradient_color, outline=None
    )

    return gradient_img


def depth_gradient(planet_img, planet_radius, img_size, sun_angle, opacity=255):
    gradient_img_size = int(planet_radius * 2.2)
    gradient_img = Image.new(
        "RGBA", (gradient_img_size, gradient_img_size), (0, 0, 0, 0)
    )

    alpha = Image.new("L", (gradient_img_size, gradient_img_size))
    draw = ImageDraw.Draw(alpha)

    for i in range(gradient_img_size):
        if i < 50:
            decrement = 1 if i % 5 == 1 else 0
        else:
            decrement = 2 if 100 <= i < 150 else 1

        opacity = max(0, opacity - decrement)
        draw.line([(i, 0), (i, gradient_img_size)], fill=opacity)

    gradient_img.putalpha(alpha)

    rotated_gradient = gradient_img.rotate(
        180 - math.degrees(sun_angle), resample=Image.BICUBIC
    )

    offset = (
        (img_size // 2) - (gradient_img_size // 2),
        (img_size // 2) - (gradient_img_size // 2),
    )
    planet_img.paste(rotated_gradient, offset, rotated_gradient)

    if VISUAL_DEBUG:
        center_x, center_y = img_size // 2, img_size // 2
        sun_x = center_x + planet_radius * math.cos(sun_angle)
        sun_y = center_y + planet_radius * math.sin(sun_angle)
        draw_debug = ImageDraw.Draw(planet_img)
        draw_debug.line((center_x, center_y, sun_x, sun_y), fill="yellow", width=3)

    return planet_img


def soft_polar_transform(image, scale_factor=1.0, depth_factor=0.5):
    width, height = image.size
    center_x, center_y = width // 2, height // 2
    radius = min(center_x, center_y)

    new_image = Image.new("RGBA", (width, height), (0, 0, 0, 0))

    for y in range(height):
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            distance = math.sqrt(dx * dx + dy * dy)

            if distance < radius:
                angle = math.atan2(dy, dx)

                depth_adjustment = 1 + depth_factor * ((distance / radius) ** 2)

                polar_x = int(
                    center_x
                    + distance * math.cos(angle) * scale_factor * depth_adjustment
                )
                polar_y = int(
                    center_y
                    + distance * math.sin(angle) * scale_factor * depth_adjustment
                )

                if 0 <= polar_x < width and 0 <= polar_y < height:
                    new_image.putpixel((x, y), image.getpixel((polar_x, polar_y)))

    return new_image
