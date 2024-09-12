# pymodules/__drawer_cplanet_rings.py

import math

from PIL import Image, ImageDraw


def draw_full_ring(
    image,
    center_x,
    center_y,
    planet_radius,
    ring_inner_radius,
    ring_outer_radius,
    rng,
    tilt_factor=0.3,
    rotation_angle=0.0,
):
    img_size = image.size[0]
    ring_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring_layer)

    num_points = rng.randint(500, 1500)

    for _ in range(num_points):
        angle = rng.uniform(math.pi, 2 * math.pi)
        distance = rng.uniform(ring_inner_radius, ring_outer_radius)

        x = int(center_x + distance * math.cos(angle))
        y = int(center_y + distance * tilt_factor * math.sin(angle))

        point_size = rng.choices(
            [0.5, 1.0, 1.5, 2.0], weights=[0.4, 0.3, 0.2, 0.1], k=1
        )[0]
        opacity = 255
        gray_value = rng.randint(20, 50)
        color = (gray_value, gray_value, gray_value, opacity)

        ring_draw.ellipse(
            [(x - point_size, y - point_size), (x + point_size, y + point_size)],
            fill=color,
        )

    ring_mask = Image.new("L", (img_size, img_size), 255)
    mask_draw = ImageDraw.Draw(ring_mask)
    mask_draw.ellipse(
        [
            int(center_x - planet_radius),
            int(center_y - planet_radius),
            int(center_x + planet_radius),
            int(center_y + planet_radius),
        ],
        fill=0,
    )
    ring_layer.putalpha(ring_mask)

    rotated_ring_layer = ring_layer.rotate(
        -math.degrees(rotation_angle),
        resample=Image.BICUBIC,
        center=(center_x, center_y),
    )

    image.paste(rotated_ring_layer, (0, 0), rotated_ring_layer)


def draw_ontop_ring(
    image,
    center_x,
    center_y,
    ring_inner_radius,
    ring_outer_radius,
    rng,
    tilt_factor=0.3,
    rotation_angle=0.0,
):
    img_size = image.size[0]
    topring_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    topring_draw = ImageDraw.Draw(topring_layer)

    num_points = rng.randint(500, 1500)

    for _ in range(num_points):
        angle = rng.uniform(0, math.pi)
        distance = rng.uniform(ring_inner_radius, ring_outer_radius)

        x = int(center_x + distance * math.cos(angle))
        y = int(center_y + distance * tilt_factor * math.sin(angle))

        point_size = rng.choices(
            [0.5, 1.0, 1.5, 2.0], weights=[0.4, 0.3, 0.2, 0.1], k=1
        )[0]
        opacity = 255
        gray_value = rng.randint(20, 50)
        color = (gray_value, gray_value, gray_value, opacity)

        topring_draw.ellipse(
            [(x - point_size, y - point_size), (x + point_size, y + point_size)],
            fill=color,
        )

    rotated_topring_layer = topring_layer.rotate(
        -math.degrees(rotation_angle),
        resample=Image.BICUBIC,
        center=(center_x, center_y),
    )

    image.paste(rotated_topring_layer, (0, 0), rotated_topring_layer)