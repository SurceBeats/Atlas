# pymodules/__drawer_cplanet_depth.py

import random

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


def depth_gradient(planet_img, planet_radius, img_size):
    gradient_img_size = img_size
    gradient_img = Image.new(
        "RGBA", (gradient_img_size, gradient_img_size), (0, 0, 0, 0)
    )

    alpha = Image.new("L", (gradient_img_size, gradient_img_size))
    draw = ImageDraw.Draw(alpha)

    for i in range(planet_radius * 2):
        opacity = int(255 * (1 - i / (planet_radius * 1)))
        draw.ellipse((i, i, gradient_img_size - i, gradient_img_size - i), fill=opacity)

    gradient_img.putalpha(alpha)

    offset = (
        -planet_radius + 60,
        -planet_radius + 60,
    )
    planet_img.paste(gradient_img, offset, gradient_img)

    mask = Image.new("L", (img_size, img_size), 255)
    mask_draw = ImageDraw.Draw(mask)

    mask_draw.ellipse(
        (
            img_size // 2 - planet_radius,
            img_size // 2 - planet_radius,
            img_size // 2 + planet_radius,
            img_size // 2 + planet_radius,
        ),
        fill=255,
    )

    planet_img.putalpha(mask)

    return planet_img
