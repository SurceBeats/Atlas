# pymodules\__image_utils_planets_forms.py

from PIL import Image, ImageDraw, ImageFilter, ImageColor

import math
import random
import hashlib


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)


def generate_noise_texture(draw, center_x, center_y, planet_radius, seed, opacity):
    size = planet_radius * 2
    random.seed(seed)

    noise = [[random.random() for _ in range(size)] for _ in range(size)]

    def smooth_noise(x, y):
        corners = (
            noise[x - 1][y - 1]
            + noise[x + 1][y - 1]
            + noise[x - 1][y + 1]
            + noise[x + 1][y + 1]
        ) / 16
        sides = (
            noise[x - 1][y] + noise[x + 1][y] + noise[x][y - 1] + noise[x][y + 1]
        ) / 8
        center = noise[x][y] / 4
        return corners + sides + center

    smooth_noise_data = [
        [smooth_noise(x, y) for y in range(1, size - 1)] for x in range(1, size - 1)
    ]

    noise_image = Image.new("L", (size, size))
    noise_pixels = noise_image.load()

    for i in range(size - 2):
        for j in range(size - 2):
            value = int(smooth_noise_data[i][j] * opacity)
            noise_pixels[i, j] = value

    draw.bitmap(
        (center_x - planet_radius, center_y - planet_radius), noise_image, fill=None
    )


def generate_abstract_shape(
    draw, center_x, center_y, radius, color, global_seed, planet_name
):

    planet_seed = consistent_hash(f"{global_seed}-{planet_name}")
    rng = random.Random(planet_seed)

    if isinstance(color, str):
        color = ImageColor.getrgb(color)

    color_with_alpha = color + (int(255 * 0.37),)

    num_points = rng.randint(5, 250)
    points = []

    for i in range(num_points):
        angle = rng.uniform(0, 2 * math.pi)
        distance = rng.uniform(0.5 * radius, radius)
        x = center_x + distance * math.cos(angle) * 10
        y = center_y + distance * math.sin(angle) * 5
        points.append((x, y))

    temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_image)
    temp_draw.polygon(points, fill=color_with_alpha)

    blurred_image = temp_image.filter(ImageFilter.GaussianBlur(radius=6))

    draw.bitmap((0, 0), blurred_image, fill=None)


def generate_abstract_land(
    draw,
    center_x,
    center_y,
    radius,
    color,
    global_seed,
    planet_name,
    points_min=40,
    points_max=60,
    seg_min=1,
    seg_max=3,
):
    planet_seed = consistent_hash(
        f"{global_seed}-{planet_name}-{radius}-{color}-{points_max}-{points_min}-{seg_min}-{seg_max}-abstract_land"
    )
    rng = random.Random(planet_seed)

    num_segments = rng.randint(seg_min, seg_max)
    for _ in range(num_segments):
        num_points = rng.randint(points_min, points_max)
        angle_offset = rng.uniform(0, 2 * math.pi)
        angle_step = 2 * math.pi / num_points
        points = []

        origin_angle = rng.uniform(0, 2 * math.pi)
        origin_distance = rng.uniform(radius * 0.8, radius * 1.1)
        origin_x = center_x + origin_distance * math.cos(origin_angle)
        origin_y = center_y + origin_distance * math.sin(origin_angle)

        for i in range(num_points):
            angle = angle_offset + i * angle_step + rng.uniform(-0.05, 0.05)
            dist = rng.uniform(0.3 * radius, 0.6 * radius)
            x = origin_x + dist * math.cos(angle)
            y = origin_y + dist * math.sin(angle)
            points.append((x, y))

        draw.polygon(points, fill=color)


def draw_planet_rings(
    draw, planet_radius, center_x, center_y, rng, color=(50, 0, 0, 100)
):
    linebreaker = rng.randint(40, 60)
    for i in range(linebreaker):
        edge_radius = planet_radius - i * (planet_radius // linebreaker)
        opacity = linebreaker - (i * 2)
        draw.ellipse(
            [
                (center_x - edge_radius, center_y - edge_radius),
                (center_x + edge_radius, center_y + edge_radius),
            ],
            outline=(
                *color[:3],
                opacity,
            ),
            width=1,
        )
