# pymodules/__drawer_class_system.py

import math
import time
import random
import hashlib

from PIL import Image, ImageDraw, ImageFont

from pymodules.__atlas_config import config

from pymodules.__drawer_watermark import generate_watermark


def generate_solar_system_image(solar_system):

    img_size = 800
    image = Image.new("RGB", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    star_positions = []
    separation = 25
    if solar_system.star_system_type == "single":
        star_positions.append((center_x, center_y))
    elif solar_system.star_system_type == "binary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
    elif solar_system.star_system_type == "tertiary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
        star_positions.append((center_x, center_y - separation))

    max_star_radius = 25
    for i, star in enumerate(solar_system.stars):
        star_x, star_y = star_positions[i]
        star_radius = min(int(10 * star["Radius Factor"]), max_star_radius)
        draw.ellipse(
            (
                star_x - star_radius,
                star_y - star_radius,
                star_x + star_radius,
                star_y + star_radius,
            ),
            fill=star["Color"],
        )

    num_planets = solar_system.num_planets

    min_orbit_radius = star_radius * 2 + 50
    max_orbit_radius = img_size // 2 - 50

    current_time = time.time()

    for i in range(1, num_planets + 1):
        planet = solar_system.get_planet(i - 1)
        if planet:

            planet_rng_seed = int(
                hashlib.md5(f"{solar_system.seed}{i}".encode()).hexdigest(), 16
            )
            planet_rng = random.Random(planet_rng_seed)

            spaced_planet_name = planet.name.replace("_", " ")

            relative_orbit_radius = planet.orbital_radius / max(
                [p.orbital_radius for p in solar_system.planets.values()]
            )
            orbit_radius = min_orbit_radius + int(
                relative_orbit_radius * (max_orbit_radius - min_orbit_radius)
            )

            eccentricity = planet_rng.uniform(0.0, 0.4) * (1 - relative_orbit_radius)

            semi_major_axis = orbit_radius
            semi_minor_axis = semi_major_axis * math.sqrt(1 - eccentricity**2)

            dash_length = 2
            gap_length = 4
            num_segments = 360

            for k in range(0, num_segments, dash_length + gap_length):
                for j in range(k, min(k + dash_length, num_segments - 1)):
                    angle_start = (j / num_segments) * 2 * math.pi
                    angle_end = ((j + 1) / num_segments) * 2 * math.pi

                    x_start = center_x + semi_major_axis * math.cos(angle_start)
                    y_start = center_y + semi_minor_axis * math.sin(angle_start)
                    x_end = center_x + semi_major_axis * math.cos(angle_end)
                    y_end = center_y + semi_minor_axis * math.sin(angle_end)

                    draw.line(
                        [x_start, y_start, x_end, y_end], fill="slategray", width=1
                    )

            orbital_period = planet.orbital_period_seconds
            angle_velocity_orbit = 2 * math.pi / orbital_period

            time_elapsed_seconds = current_time - config.cosmic_origin_time

            initial_angle_orbit = planet_rng.uniform(0, 2 * math.pi)
            initial_angle_rotation = planet_rng.uniform(0, 2 * math.pi)

            angle_orbit = (
                initial_angle_orbit + time_elapsed_seconds * angle_velocity_orbit
            ) % (2 * math.pi)

            planet_x = center_x + semi_major_axis * math.cos(angle_orbit)
            planet_y = center_y + semi_minor_axis * math.sin(angle_orbit)

            rotation_period_seconds = planet.rotation_period_seconds
            angle_velocity_rotation = 2 * math.pi / rotation_period_seconds

            angle_rotation = (
                initial_angle_rotation + time_elapsed_seconds * angle_velocity_rotation
            ) % (2 * math.pi)

            planet_color = {
                "Gas Giant": "#FFA500",
                "Anomaly": "#FFFFFF",
                "Rocky": "#808080",
                "Icy": "#ADD8E6",
                "Oceanic": "#0000FF",
                "Desert": "#FFD700",
                "Lava": "#FF0000",
                "Arid": "#800000",
                "Swamp": "#008000",
                "Tundra": "#F0F8FF",
                "Forest": "#006400",
                "Savannah": "#F4A460",
                "Cave": "#D1D1D1",
                "Crystalline": "#00FFFF",
                "Metallic": "#C0C0C0",
                "Toxic": "#800080",
                "Radioactive": "#00FF00",
                "Magma": "#FF4500",
                "Molten Core": "#FF8C00",
                "Carbon": "#090909",
                "Diamond": "#87CEFA",
                "Super Earth": "#90EE90",
                "Sub Earth": "#006400",
                "Frozen Gas Giant": "#ADD8E6",
                "Nebulous": "#FFC0CB",
                "Aquifer": "#00FFFF",
                "Exotic": "#FF00FF",
            }.get(planet.planet_type, "white")

            max_diameter = max([p.diameter for p in solar_system.planets.values()])
            planet_radius = int(6 * (planet.diameter / max_diameter))

            min_radius = 2
            planet_radius = max(planet_radius, min_radius)
            shadow_radius = planet_radius * 1.50

            draw.ellipse(
                (
                    planet_x - shadow_radius,
                    planet_y - shadow_radius,
                    planet_x + shadow_radius,
                    planet_y + shadow_radius,
                ),
                fill="black",
            )

            draw.ellipse(
                (
                    planet_x - planet_radius,
                    planet_y - planet_radius,
                    planet_x + planet_radius,
                    planet_y + planet_radius,
                ),
                fill=planet_color,
            )

            line_x1 = planet_x + planet_radius * math.cos(angle_rotation) / 8
            line_y1 = planet_y + planet_radius * math.sin(angle_rotation) / 8
            line_x2 = planet_x - planet_radius * math.cos(angle_rotation)
            line_y2 = planet_y - planet_radius * math.sin(angle_rotation)

            draw.line(
                (line_x1, line_y1, line_x2, line_y2), fill=(138, 138, 138), width=1
            )

            text_x = planet_x + planet_radius + 5
            text_y = planet_y - planet_radius / 2
            draw.text((text_x, text_y), spaced_planet_name, font=font, fill="white")

    generate_watermark(image)

    return image
