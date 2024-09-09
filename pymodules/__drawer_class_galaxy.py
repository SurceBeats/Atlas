# pymodules/__drawer_class_galaxy.py

import math
import random

from PIL import Image, ImageDraw, ImageFilter

from pymodules.__drawer_watermark import generate_watermark


def generate_galaxy_image(galaxy):
    img_size = 800
    image = Image.new("RGBA", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    center_x = img_size // 2
    center_y = img_size // 2

    rng = random.Random(galaxy.seed)

    rotation_angle = rng.uniform(0, 2 * math.pi)

    if galaxy.galaxy_type == "Spiral":
        num_arms = 4
        arm_offset = 2 * math.pi / num_arms
        max_radius = img_size // 2
        spread = 0.15
        arm_tightness = 0.5
        core_density = 0.1

        if galaxy.num_systems < 50000:
            num_points = galaxy.num_systems
        else:
            num_points = 50000

        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)

        for i in range(int(num_points * core_density)):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius * 0.1, max_radius * 0.05)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            draw.point((x, y), fill="white")

        for i in range(num_points):
            theta = arm_tightness * math.sqrt(i / num_points) * 2 * math.pi
            arm_angle = i % num_arms * arm_offset

            radius = max_radius * math.sqrt(i / num_points)
            x = (
                center_x
                + radius * math.cos(theta + arm_angle + rotation_angle)
                + rng.uniform(-spread * radius, spread * radius)
            )
            y = (
                center_y
                + radius * math.sin(theta + arm_angle + rotation_angle)
                + rng.uniform(-spread * radius, spread * radius)
            )

            draw.point((x, y), fill="white")

            if radius > max_radius * 0.6:
                mask_draw.point((x, y), fill="white")

        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=5))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "Elliptical":

        if galaxy.num_systems < 100000:
            num_points = galaxy.num_systems
        else:
            num_points = 100000

        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(img_size // 4, img_size // 8)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.point((x, y), fill="white")

        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        outer_radius = img_size // 2
        inner_radius = img_size // 3

        for r in range(inner_radius, outer_radius):
            alpha = int(255 * (r - inner_radius) / (outer_radius - inner_radius))
            mask_draw.ellipse(
                (center_x - r, center_y - r, center_x + r, center_y + r),
                outline=alpha,
                width=2,
            )

        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=10))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "Dwarf":
        max_radius = img_size // 3
        spread = 0.3

        for i in range(galaxy.num_systems // 100):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius / 2, spread * max_radius)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.ellipse((x, y, x + 1, y + 1), fill="white")

    elif galaxy.galaxy_type == "Singularity Void":
        max_radius = img_size // 2

        for i in range(120):
            size = rng.uniform(20, 90)
            x = rng.uniform(center_x - max_radius, center_x + max_radius)
            y = rng.uniform(center_y - max_radius, center_y + max_radius)
            draw.polygon(
                [
                    (x, y),
                    (
                        x + size * rng.uniform(0.5, 1.5),
                        y + size * rng.uniform(0.5, 1.5),
                    ),
                    (
                        x + size * rng.uniform(-0.5, 1.5),
                        y + size * rng.uniform(-0.5, 1.5),
                    ),
                ],
                outline=(
                    rng.randint(150, 255),
                    rng.randint(150, 255),
                    rng.randint(150, 255),
                    rng.randint(50, 150),
                ),
            )

        for i in range(5):
            offset = rng.randint(-5, 5)
            glitch_line = rng.uniform(center_y - max_radius, center_y + max_radius)
            draw.line(
                (0, glitch_line, img_size, glitch_line + offset),
                fill=(
                    rng.randint(0, 255),
                    rng.randint(0, 255),
                    rng.randint(0, 255),
                    255,
                ),
                width=3,
            )

        distorted_image = image.filter(ImageFilter.GaussianBlur(radius=20))
        image.paste(distorted_image, (0, 0))

        tunnel_radius = max_radius // 2

        draw.ellipse(
            (
                center_x - tunnel_radius - 150,
                center_y - tunnel_radius - 150,
                center_x + tunnel_radius + 150,
                center_y + tunnel_radius + 150,
            ),
            fill=(0, 0, 0, 255),
        )

        for i in range(tunnel_radius, tunnel_radius + 90):
            alpha = int(255 * (90 - (i - tunnel_radius)) / 90)
            draw.ellipse(
                (center_x - i, center_y - i, center_x + i, center_y + i),
                outline=(
                    rng.randint(50, 150),
                    rng.randint(0, 100),
                    rng.randint(50, 150),
                    alpha,
                ),
                width=3,
            )

        for i in range(1000):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius / 3, max_radius / 6)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.ellipse(
                (x, y, x + 2, y + 2),
                fill=(
                    rng.randint(100, 255),
                    rng.randint(0, 100),
                    rng.randint(100, 255),
                    rng.randint(50, 150),
                ),
            )

    black_hole_positions = []
    distance_threshold = 20

    rng = random.Random(galaxy.seed)

    for _ in range(galaxy.black_holes):
        x = rng.randint(center_x - 30, center_x + 30)
        y = rng.randint(center_y - 30, center_y + 30)

        grouped = False
        for i, (bx, by, size_offset) in enumerate(black_hole_positions):
            distance = math.sqrt((x - bx) ** 2 + (y - by) ** 2)
            if distance < distance_threshold:
                black_hole_positions[i] = (bx, by, size_offset + 1.75)
                grouped = True
                break

        if not grouped:
            black_hole_positions.append((x, y, 5))

    for x, y, size_offset in black_hole_positions:
        for i in range(10):
            alpha = int(255 * (0.6 - i * 0.05))
            size = 1.2 * (i + 1) + size_offset
            temp_image = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            temp_draw = ImageDraw.Draw(temp_image)
            temp_draw.ellipse(
                (x - size, y - size, x + size, y + size), fill=(0, 0, 0, alpha)
            )
            image = Image.alpha_composite(image, temp_image)

        blue_dot_image = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        blue_dot_draw = ImageDraw.Draw(blue_dot_image)
        blue_dot_draw.ellipse((x - 1, y - 1, x + 1, y + 1), fill="cyan")
        image = Image.alpha_composite(image, blue_dot_image)

    pulsars_quasars_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    pulsars_quasars_draw = ImageDraw.Draw(pulsars_quasars_layer)

    for _ in range(galaxy.pulsars):
        x = rng.randint(0, img_size)
        y = rng.randint(0, img_size)
        pulsars_quasars_draw.ellipse((x, y, x + 5, y + 5), fill="yellow")
        pulsars_quasars_draw.line(
            (x - 3, y + 2.5, x + 8, y + 2.5), fill="white", width=1
        )
        pulsars_quasars_draw.line(
            (x + 2.5, y - 3, x + 2.5, y + 8), fill="white", width=1
        )

    for _ in range(galaxy.quasars):
        x = rng.randint(0, img_size)
        y = rng.randint(0, img_size)

        pulsars_quasars_draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill="white")

        for i in range(5):
            alpha = int(255 * (0.5 - i * 0.1))
            size = 7 + i * 2
            temp_image = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            temp_draw = ImageDraw.Draw(temp_image)
            temp_draw.ellipse(
                (x - size, y - size, x + size, y + size),
                fill=(255, 0, 0, alpha),
            )
            image = Image.alpha_composite(image, temp_image)

        pulsars_quasars_draw.line((x - 10, y, x + 10, y), fill="yellow", width=2)
        pulsars_quasars_draw.line((x, y - 10, x, y + 10), fill="yellow", width=2)

    image = Image.alpha_composite(image, pulsars_quasars_layer)

    generate_watermark(image)

    return image
