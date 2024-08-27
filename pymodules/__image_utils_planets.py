# pymodules\__image_utils_planets.py

from PIL import Image, ImageDraw, ImageFilter, ImageColor

import math
import random
import hashlib


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)


def get_planet_color_map():
    return {
        "Gas Giant": "orange",
        "Anomaly": "white",
        "Rocky": "gray",
        "Icy": "lightblue",
        "Oceanic": "blue",
        "Desert": "yellow",
        "Lava": "red",
        "Arid": "brown",
        "Swamp": "green",
        "Tundra": "aliceblue",
        "Forest": "darkgreen",
        "Savannah": "sandybrown",
        "Cave": "dimgray",
        "Crystalline": "cyan",
        "Metallic": "silver",
        "Toxic": "purple",
        "Radioactive": "lime",
        "Magma": "orangered",
        "Molten Core": "darkorange",
        "Carbon": "darkgray",
        "Diamond": "lightskyblue",
        "Super Earth": "lightgreen",
        "Sub Earth": "darkgreen",
        "Frozen Gas Giant": "lightblue",
        "Nebulous": "pink",
        "Aquifer": "aqua",
        "Exotic": "magenta",
    }


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
    draw, center_x, center_y, radius, color, global_seed, planet_name
):
    planet_seed = consistent_hash(f"{global_seed}-{planet_name}-{radius}-{color}")
    rng = random.Random(planet_seed)

    num_segments = rng.randint(1, 3)
    for _ in range(num_segments):
        num_points = rng.randint(40, 60)
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


def draw_gas_giant_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):

    num_cloud_bands = rng.randint(3, 20)

    rotation_angle = math.radians(rng.uniform(-15, 15))
    sin_angle = math.sin(rotation_angle)
    cos_angle = math.cos(rotation_angle)

    for i in range(num_cloud_bands):
        band_width = rng.randint(2, 4)
        band_position_y = rng.randint(
            center_y - planet_radius, center_y + planet_radius
        )
        cloud_color = (255, 165, 0, 1)

        rotated_points = [
            (
                cos_angle * (x - center_x) - sin_angle * (y - center_y) + center_x,
                sin_angle * (x - center_x) + cos_angle * (y - center_y) + center_y,
            )
            for x, y in [
                (center_x - planet_radius, band_position_y - band_width // 2),
                (center_x + planet_radius, band_position_y - band_width // 2),
                (center_x + planet_radius, band_position_y + band_width // 2),
                (center_x - planet_radius, band_position_y + band_width // 2),
            ]
        ]

        draw.polygon(rotated_points, fill=cloud_color, outline=None)

    num_shape_bands = rng.randint(3, 6)
    for i in range(num_shape_bands):
        band_width = planet_radius // 10
        band_offset = (i - num_shape_bands // 2) * band_width * 2
        generate_abstract_shape(
            draw,
            center_x,
            center_y + band_offset,
            band_width,
            "orange",
            seed,
            spaced_planet_name + f"_cloudband_{i}",
        )

    if rng.random() < 0.5:
        storm_radius = rng.randint(30, 50)
        storm_x = center_x + rng.randint(-planet_radius // 3, planet_radius // 3)
        storm_y = center_y + rng.randint(-planet_radius // 3, planet_radius // 3)
        generate_abstract_shape(
            draw,
            storm_x,
            storm_y,
            storm_radius,
            "darkred",
            seed,
            spaced_planet_name + "_storm",
        )


def draw_anomaly_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_anomalies = rng.randint(6, 12)
    max_anomaly_radius = planet_radius // 2

    for i in range(num_anomalies):
        anomaly_radius = rng.randint(max_anomaly_radius // 2, max_anomaly_radius)

        anomaly_x = center_x + rng.randint(-planet_radius, planet_radius)
        anomaly_y = center_y + rng.randint(-planet_radius, planet_radius)

        anomaly_color = (
            rng.randint(0, 10),
            rng.randint(0, 30),
            rng.randint(0, 60),
            rng.randint(0, 90),
        )

        num_points = rng.randint(3, 35)
        angle_step = 2 * math.pi / num_points
        points = []

        for j in range(num_points):
            angle = j * angle_step
            radius_variation = rng.randint(-anomaly_radius // 4, anomaly_radius // 4)
            current_radius = anomaly_radius + radius_variation

            x = anomaly_x + current_radius * math.cos(angle)
            y = anomaly_y + current_radius * math.sin(angle)
            points.append((x, y))

        draw.polygon(points, fill=anomaly_color, outline=None)

        generate_abstract_shape(
            draw,
            anomaly_x,
            anomaly_y,
            max_anomaly_radius,
            "purple",
            seed,
            spaced_planet_name + f"_anomaly_shape_{i}",
        )


def draw_rocky_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    generate_abstract_land(
        draw,
        center_x,
        center_y,
        planet_radius,
        (80, 80, 80, 40),
        seed,
        spaced_planet_name,
    )

    num_mountains = rng.randint(4, 30)
    mountain_color = (130, 130, 130, 1)

    for _ in range(num_mountains):
        mountain_width = rng.randint(5, 10)
        mountain_height = rng.randint(5, 8)
        mountain_x = center_x + rng.randint(-planet_radius, planet_radius)
        mountain_y = center_y + rng.randint(-planet_radius, planet_radius)

        angle = math.radians(rng.uniform(-20, 20))
        cos_angle = math.cos(angle)
        sin_angle = math.sin(angle)

        half_width = mountain_width // 2
        left_x = -half_width
        right_x = half_width

        left_x_rot = cos_angle * left_x + mountain_x
        left_y_rot = sin_angle * left_x + mountain_y
        right_x_rot = cos_angle * right_x + mountain_x
        right_y_rot = sin_angle * right_x + mountain_y

        peak_x_rot = mountain_x
        peak_y_rot = mountain_y - mountain_height

        draw.line(
            [(left_x_rot, left_y_rot), (peak_x_rot, peak_y_rot)],
            fill=mountain_color,
            width=3,
        )
        draw.line(
            [(right_x_rot, right_y_rot), (peak_x_rot, peak_y_rot)],
            fill=mountain_color,
            width=3,
        )

    num_clouds = rng.randint(5, 10)
    for i in range(num_clouds):
        cloud_radius = rng.randint(10, 30)
        cloud_x = center_x + rng.randint(-planet_radius, planet_radius)
        cloud_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            cloud_x,
            cloud_y,
            cloud_radius,
            "gray",
            seed,
            spaced_planet_name + f"_cloud_{i}",
        )

    if rng.random() < 0.7:
        crater_radius = rng.randint(15, 40)
        crater_x = center_x + rng.randint(-planet_radius, planet_radius)
        crater_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            crater_x,
            crater_y,
            crater_radius,
            "darkgray",
            seed,
            spaced_planet_name + "_crater",
        )


def draw_icy_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    generate_abstract_land(
        draw,
        center_x,
        center_y,
        planet_radius,
        (81, 106, 145, 1),
        seed,
        spaced_planet_name,
    )

    two_pi = 2 * math.pi

    num_crystals = rng.randint(20, 30)
    for _ in range(num_crystals):
        crystal_length = rng.randint(5, 15)
        crystal_width = rng.randint(8, 20)
        crystal_angle = rng.uniform(0, two_pi)

        polar_bias = rng.choice([-1, 1])
        polar_offset = rng.uniform(0.5 * planet_radius, planet_radius) * polar_bias
        crystal_x = center_x + rng.uniform(-0.3 * planet_radius, 0.3 * planet_radius)
        crystal_y = center_y + polar_offset

        cos_angle = math.cos(crystal_angle)
        sin_angle = math.sin(crystal_angle)

        x1 = crystal_x + crystal_length * cos_angle
        y1 = crystal_y + crystal_length * sin_angle
        x2 = crystal_x - crystal_length * cos_angle
        y2 = crystal_y - crystal_length * sin_angle

        cos_half_pi = crystal_width * cos_angle
        sin_half_pi = crystal_width * sin_angle

        draw.polygon(
            [
                (x1 + sin_half_pi, y1 - cos_half_pi),
                (x1 - sin_half_pi, y1 + cos_half_pi),
                (x2 - sin_half_pi, y2 + cos_half_pi),
                (x2 + sin_half_pi, y2 - cos_half_pi),
            ],
            fill=(172, 215, 230, 255),
        )

    if rng.random() < 0.5:
        crack_length = 200
        crack_angle = rng.uniform(0, two_pi)

        num_cracks = rng.randint(3, 12)
        for _ in range(num_cracks):
            adjusted_angle = crack_angle + rng.uniform(-1, 1)

            crack_x1 = center_x + int(crack_length * math.cos(adjusted_angle))
            crack_y1 = center_y + int(crack_length * math.sin(adjusted_angle))
            crack_x2 = center_x + int(crack_length * math.cos(adjusted_angle + math.pi))
            crack_y2 = center_y + int(crack_length * math.sin(adjusted_angle + math.pi))

            draw.line(
                (crack_x1, crack_y1, crack_x2, crack_y2), fill=(80, 80, 80, 40), width=1
            )

    num_ice_caps = rng.randint(2, 4)
    for i in range(num_ice_caps):
        cap_radius = rng.randint(20, 50)
        cap_x = center_x + rng.randint(-planet_radius, planet_radius)
        cap_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            cap_x,
            cap_y,
            cap_radius,
            "lightblue",
            seed,
            spaced_planet_name + f"_icecap_{i}",
        )


def draw_oceanic_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):

    num_depths = rng.randint(60, 100)
    for _ in range(num_depths):
        depth_radius = rng.randint(int(0.1 * planet_radius), int(0.3 * planet_radius))
        depth_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
        depth_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)
        depth_color = (0, 0, 139, rng.randint(1, 50))
        draw.ellipse(
            [
                (depth_x - depth_radius, depth_y - depth_radius),
                (depth_x + depth_radius, depth_y + depth_radius),
            ],
            fill=depth_color,
            outline=None,
        )

    generate_abstract_land(
        draw,
        center_x,
        center_y,
        planet_radius,
        (0, 0, 139, 40),
        seed,
        spaced_planet_name,
    )

    base_green = (57, 92, 0)
    base_brown = (92, 58, 0)

    patch_color = (
        rng.randint(
            min(base_green[0], base_brown[0]), max(base_green[0], base_brown[0])
        ),
        rng.randint(
            min(base_green[1], base_brown[1]), max(base_green[1], base_brown[1])
        ),
        rng.randint(
            min(base_green[2], base_brown[2]), max(base_green[2], base_brown[2])
        ),
        150,
    )

    num_green_patches = rng.randint(10, 20)
    for _ in range(num_green_patches):
        patch_size = rng.randint(6, 80)
        patch_angle = rng.uniform(0, 2 * math.pi)
        patch_distance = rng.uniform(1 * planet_radius, planet_radius)

        patch_x = center_x + patch_distance * math.cos(patch_angle)
        patch_y = center_y + patch_distance * math.sin(patch_angle)

        num_sides = rng.randint(20, 30)
        patch_points = []
        for j in range(num_sides):
            angle_offset = 2 * math.pi * j / num_sides
            point_x = patch_x + patch_size * math.cos(
                angle_offset + rng.uniform(-0.2, 0.2)
            )
            point_y = patch_y + patch_size * math.sin(
                angle_offset + rng.uniform(-0.2, 0.2)
            )
            patch_points.append((point_x, point_y))

        draw.polygon(patch_points, fill=patch_color)

    num_clouds = rng.randint(3, 6)
    for i in range(num_clouds):
        cloud_radius = rng.randint(25, int(planet_radius * 0.3))
        max_offset = planet_radius - cloud_radius
        cloud_x = center_x + rng.randint(-max_offset, max_offset)
        cloud_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            cloud_x,
            cloud_y,
            cloud_radius,
            "sandybrown",
            seed,
            spaced_planet_name + f"_cloud_{i}",
        )


def draw_desert_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    for _ in range(rng.randint(20, 50)):
        grain_size = rng.randint(1, 2)
        grain_x = center_x + rng.randint(-planet_radius, planet_radius)
        grain_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.ellipse(
            (
                grain_x - grain_size,
                grain_y - grain_size,
                grain_x + grain_size,
                grain_y + grain_size,
            ),
            fill="khaki",
            outline=None,
        )

    num_dunes = rng.randint(5, 10)
    for i in range(num_dunes):
        dune_radius = rng.randint(10, 25)
        dune_x = center_x + rng.randint(-planet_radius, planet_radius)
        dune_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            dune_x,
            dune_y,
            dune_radius,
            "yellow",
            seed,
            spaced_planet_name + f"_dune_{i}",
        )
    if rng.random() < 0.3:
        oasis_radius = rng.randint(10, 20)
        oasis_x = center_x + rng.randint(-planet_radius, planet_radius)
        oasis_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            oasis_x,
            oasis_y,
            oasis_radius,
            "blue",
            seed,
            spaced_planet_name + "_oasis",
        )


def draw_lava_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_flows = rng.randint(2, 8)
    for i in range(num_flows):
        flow_length = rng.randint(1, int(planet_radius * 2))
        flow_width = rng.randint(1, 20)
        flow_angle = rng.uniform(0, 6 * math.pi)

        num_points = rng.randint(1, 5)
        points = []
        for j in range(num_points):
            angle = flow_angle + rng.uniform(-0.5, 0.5)
            distance = flow_length * (j / num_points)
            x = center_x + int(distance * math.cos(angle))
            y = center_y + int(distance * math.sin(angle))
            points.append((x, y))

        draw.line(points, fill="orangered", width=flow_width)

        glow_radius = rng.randint(2, 4)
        for x, y in points:
            glow_x = x + rng.randint(-glow_radius, glow_radius)
            glow_y = y + rng.randint(-glow_radius, glow_radius)
            draw.ellipse(
                (
                    glow_x - glow_radius,
                    glow_y - glow_radius,
                    glow_x + glow_radius,
                    glow_y + glow_radius,
                ),
                fill=(255, 69, 0, 50),
            )

    if rng.random() < 0.2:
        num_cracks = rng.randint(15, 30)
        for _ in range(num_cracks):
            crack_length = rng.randint(2, 10)
            crack_angle = rng.uniform(0, 8 * math.pi)
            crack_x1 = center_x + rng.randint(-planet_radius, planet_radius)
            crack_y1 = center_y + rng.randint(-planet_radius, planet_radius)
            crack_x2 = crack_x1 + int(crack_length * math.cos(crack_angle))
            crack_y2 = crack_y1 + int(crack_length * math.sin(crack_angle))

            draw.line(
                (crack_x1, crack_y1, crack_x2, crack_y2),
                fill="darkred",
                width=rng.randint(1, 6),
            )


def draw_arid_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_cracks = rng.randint(10, 50)
    for _ in range(num_cracks):
        crack_length = rng.randint(10, 100)
        crack_angle = rng.uniform(0, 2 * math.pi)
        crack_x = center_x + rng.randint(-planet_radius, planet_radius)
        crack_y = center_y + rng.randint(-planet_radius, planet_radius)

        points = [(crack_x, crack_y)]
        for _ in range(5):
            angle_variation = rng.uniform(-math.pi / 4, math.pi / 4)
            adjusted_angle = crack_angle + angle_variation
            next_x = points[-1][0] + int(crack_length * math.cos(adjusted_angle))
            next_y = points[-1][1] + int(crack_length * math.sin(adjusted_angle))
            points.append((next_x, next_y))
            crack_length *= 0.7

        draw.line(points, fill="crimson", width=rng.randint(1, 5))

    num_dunes = rng.randint(2, 5)
    for _ in range(num_dunes):
        dune_radius = rng.randint(1, 3)
        dune_x = center_x + rng.randint(-planet_radius, planet_radius)
        dune_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.polygon(
            [
                (dune_x, dune_y - dune_radius),
                (dune_x - dune_radius, dune_y + dune_radius),
                (dune_x + dune_radius, dune_y + dune_radius),
            ],
            fill="crimson",
        )

    fillier = rng.randint(6, 12)
    max_offset = planet_radius - fillier
    fillie_x = center_x + rng.randint(-max_offset, max_offset)
    swamp_y = center_y + rng.randint(-max_offset, max_offset)
    generate_abstract_shape(
        draw,
        fillie_x,
        swamp_y,
        fillier,
        "black",
        seed,
        spaced_planet_name + "_fillie_",
    )


def draw_swamp_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_swamp_areas = rng.randint(3, 7)
    for i in range(num_swamp_areas):
        swamp_radius = rng.randint(15, 40)
        max_offset = planet_radius - swamp_radius
        swamp_x = center_x + rng.randint(-max_offset, max_offset)
        swamp_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            swamp_x,
            swamp_y,
            swamp_radius,
            "green",
            seed,
            spaced_planet_name + f"_swamp_{i}",
        )
        if rng.random() < 22:
            num_water_areas = rng.randint(3, 6)
            for _ in range(num_water_areas):
                water_radius = rng.randint(2, 8)
                water_x = center_x + rng.randint(-planet_radius, planet_radius)
                water_y = center_y + rng.randint(-planet_radius, planet_radius)
                num_water_points = rng.randint(5, 8)
                water_points = []
                for _ in range(num_water_points):
                    angle = rng.uniform(0, 2 * math.pi)
                    distance = rng.uniform(water_radius * 0.7, water_radius)
                    x = water_x + int(distance * math.cos(angle))
                    y = water_y + int(distance * math.sin(angle))
                    water_points.append((x, y))

                draw.polygon(water_points, fill="forestgreen", outline="darkgreen")

        if rng.random() < 0.6:
            water_radius = rng.randint(1, 20)
            generate_abstract_shape(
                draw,
                swamp_x,
                swamp_y,
                water_radius,
                "white",
                seed,
                spaced_planet_name + f"_water_{i}",
            )


def draw_tundra_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_cracks = rng.randint(1, 6)
    for _ in range(num_cracks):
        crack_length = rng.randint(30, 60)
        crack_angle = rng.uniform(0, 2 * math.pi)
        crack_x1 = center_x + rng.randint(-planet_radius, planet_radius)
        crack_y1 = center_y + rng.randint(-planet_radius, planet_radius)
        crack_x2 = crack_x1 + int(crack_length * math.cos(crack_angle))
        crack_y2 = crack_x1 + int(crack_length * math.sin(crack_angle))

        draw.line((crack_x1, crack_y1, crack_x2, crack_y2), fill="lightblue", width=10)

    num_wind_lines = rng.randint(5, 20)
    for _ in range(num_wind_lines):
        line_length = rng.randint(2, 15)
        start_x = center_x + rng.randint(-planet_radius, planet_radius)
        start_y = center_y + rng.randint(-planet_radius, planet_radius)
        angle = rng.uniform(-math.pi / 8, math.pi / 8)
        end_x = start_x + int(line_length * math.cos(angle))
        end_y = start_y + int(line_length * math.sin(angle))

        draw.line((start_x, start_y, end_x, end_y), fill="white", width=1)

    num_snow_areas = rng.randint(3, 6)
    for _ in range(num_snow_areas):
        snow_radius = rng.randint(1, 4)
        snow_x = center_x + rng.randint(-planet_radius, planet_radius)
        snow_y = center_y + rng.randint(-planet_radius, planet_radius)

        draw.ellipse(
            (
                snow_x - snow_radius,
                snow_y - snow_radius,
                snow_x + snow_radius,
                snow_y + snow_radius,
            ),
            fill="whitesmoke",
            outline="lightgray",
        )

    num_tundra_areas = rng.randint(5, 10)
    for i in range(num_tundra_areas):
        tundra_radius = rng.randint(25, 50)
        max_offset = planet_radius - tundra_radius
        tundra_x = center_x + rng.randint(-max_offset, max_offset)
        tundra_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            tundra_x,
            tundra_y,
            tundra_radius,
            "whitesmoke",
            seed,
            spaced_planet_name + f"_tundra_{i}",
        )


def draw_forest_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_forest_regions = rng.randint(5, 10)
    for i in range(num_forest_regions):
        forest_radius = rng.randint(20, 80)
        max_offset = planet_radius - forest_radius
        forest_x = center_x + rng.randint(-max_offset, max_offset)
        forest_y = center_y + rng.randint(-max_offset, max_offset)

        num_points = rng.randint(100, 600)
        points = []
        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            distance = rng.uniform(0, forest_radius)
            x = forest_x + int(distance * math.cos(angle))
            y = forest_y + int(distance * math.sin(angle))
            points.append((x, y))

        for point in points:
            draw.point(point, fill="darkgreen")

    num_forests = rng.randint(5, 10)
    for i in range(num_forests):
        forest_radius = rng.randint(15, 40)
        max_offset = planet_radius - forest_radius
        forest_x = center_x + rng.randint(-max_offset, max_offset)
        forest_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            forest_x,
            forest_y,
            forest_radius,
            "black",
            seed,
            spaced_planet_name + f"_forest_{i}",
        )


def draw_savannah_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_grass_clusters = rng.randint(5, 10)
    for i in range(num_grass_clusters):
        grass_cluster_radius = rng.randint(20, 50)
        max_offset = planet_radius - grass_cluster_radius
        grass_cluster_x = center_x + rng.randint(-max_offset, max_offset)
        grass_cluster_y = center_y + rng.randint(-max_offset, max_offset)

        num_points = rng.randint(100, 300)
        points = []
        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            distance = rng.uniform(0, grass_cluster_radius)
            x = grass_cluster_x + int(distance * math.cos(angle))
            y = grass_cluster_y + int(distance * math.sin(angle))
            points.append((x, y))

        for point in points:
            draw.point(point, fill="brown")

    num_grass_areas = rng.randint(5, 10)
    for i in range(num_grass_areas):
        grass_radius = rng.randint(15, 60)
        max_offset = planet_radius - grass_radius
        grass_x = center_x + rng.randint(-max_offset, max_offset)
        grass_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            grass_x,
            grass_y,
            grass_radius,
            "sandybrown",
            seed,
            spaced_planet_name + f"_grass_{i}",
        )


def draw_cave_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    if rng.random() < 0.5:
        num_cracks = rng.randint(1, 3)
        for i in range(num_cracks):
            crack_length = rng.randint(150, 250)
            crack_angle = rng.uniform(0, 2 * math.pi)
            crack_x1 = center_x + rng.randint(-planet_radius, planet_radius)
            crack_y1 = center_y + rng.randint(-planet_radius, planet_radius)
            crack_x2 = crack_x1 + int(crack_length * math.cos(crack_angle))
            crack_y2 = crack_y1 + int(crack_length * math.sin(crack_angle))
            draw.line((crack_x1, crack_y1, crack_x2, crack_y2), fill="black", width=1)

    num_shadows = rng.randint(3, 7)
    for i in range(num_shadows):
        shadow_radius = rng.randint(5, 15)
        shadow_x = center_x + rng.randint(-planet_radius, planet_radius)
        shadow_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.ellipse(
            (
                shadow_x - shadow_radius,
                shadow_y - shadow_radius,
                shadow_x + shadow_radius,
                shadow_y + shadow_radius,
            ),
            fill=(0, 0, 0, 100),
        )

    num_caves = rng.randint(3, 7)
    for i in range(num_caves):
        cave_radius = rng.randint(15, 40)
        max_offset = planet_radius - cave_radius
        cave_x = center_x + rng.randint(-max_offset, max_offset)
        cave_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            cave_x,
            cave_y,
            cave_radius,
            "dimgray",
            seed,
            spaced_planet_name + f"_cave_{i}",
        )


def draw_crystalline_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_crystals = rng.randint(5, 10)
    for i in range(num_crystals):
        crystal_height = rng.randint(20, 50)
        crystal_base_width = rng.randint(10, 20)
        crystal_x = center_x + rng.randint(-planet_radius, planet_radius)
        crystal_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.polygon(
            [
                (crystal_x, crystal_y),
                (crystal_x + crystal_base_width, crystal_y),
                (crystal_x + crystal_base_width // 2, crystal_y - crystal_height),
            ],
            fill="cyan",
        )

    num_bright_areas = rng.randint(30, 250)
    for _ in range(num_bright_areas):
        bright_radius = rng.randint(10, 15)
        bright_x = center_x + rng.randint(-planet_radius, planet_radius)
        bright_y = center_y + rng.randint(-planet_radius, planet_radius)
        num_points = rng.randint(5, 10)
        points = []
        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            distance = rng.uniform(bright_radius * 0.5, bright_radius)
            x = bright_x + int(distance * math.cos(angle))
            y = bright_y + int(distance * math.sin(angle))
            points.append((x, y))
        draw.polygon(points, fill=(173, 216, 230, 35))

    sparkle_colors = ["white", "aquamarine", "cyan"]
    num_sparkles = rng.randint(10, 42)
    for _ in range(num_sparkles):
        sparkle_x = center_x + rng.randint(-planet_radius, planet_radius)
        sparkle_y = center_y + rng.randint(-planet_radius, planet_radius)
        sparkle_color = rng.choice(sparkle_colors)
        draw.ellipse(
            (sparkle_x - 2, sparkle_y - 2, sparkle_x + 2, sparkle_y + 2),
            fill=sparkle_color,
        )


def draw_metallic_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_reflective_areas = rng.randint(1, 100)
    for i in range(num_reflective_areas):
        reflection_radius = rng.randint(4, 16)
        reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
        reflection_y = center_y + rng.randint(-planet_radius, planet_radius)
        start_angle = rng.randint(0, 360)
        end_angle = start_angle + rng.randint(10, 200)
        draw.chord(
            (
                reflection_x - reflection_radius,
                reflection_y - reflection_radius,
                reflection_x + reflection_radius,
                reflection_y + reflection_radius,
            ),
            start=start_angle,
            end=end_angle,
            fill=(211, 211, 211, 1),
        )

    num_metal_areas = rng.randint(3, 6)
    for i in range(num_metal_areas):
        metal_radius = rng.randint(20, 150)
        max_offset = planet_radius - metal_radius
        metal_x = center_x + rng.randint(-max_offset, max_offset)
        metal_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            metal_x,
            metal_y,
            metal_radius,
            "silver",
            seed,
            spaced_planet_name + f"_metal_{i}",
        )

    if rng.random() < 0.5:
        reflection_radius = rng.randint(10, 20)
        reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
        reflection_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            reflection_x,
            reflection_y,
            reflection_radius,
            "white",
            seed,
            spaced_planet_name + "_reflection",
        )


def draw_toxic_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_twisted_vegetation_areas = rng.randint(2, 5)
    for i in range(num_twisted_vegetation_areas):
        veg_radius = rng.randint(10, 25)
        veg_x = center_x + rng.randint(-planet_radius, planet_radius)
        veg_y = center_y + rng.randint(-planet_radius, planet_radius)
        for _ in range(rng.randint(5, 10)):
            offset_x = rng.randint(-veg_radius, veg_radius)
            offset_y = rng.randint(-veg_radius, veg_radius)
            draw.ellipse(
                (
                    veg_x + offset_x - 1,
                    veg_y + offset_y - 1,
                    veg_x + offset_x + 1,
                    veg_y + offset_y + 1,
                ),
                fill="darkmagenta",
            )

    num_spills = rng.randint(3, 7)
    for i in range(num_spills):
        spill_length = rng.randint(20, 60)
        spill_width = rng.randint(1, 3)
        spill_angle = rng.uniform(0, 2 * math.pi)
        spill_x1 = center_x + rng.randint(-planet_radius, planet_radius)
        spill_y1 = center_y + rng.randint(-planet_radius, planet_radius)
        spill_x2 = spill_x1 + int(spill_length * math.cos(spill_angle))
        spill_y2 = spill_y1 + int(spill_length * math.sin(spill_angle))
        draw.line(
            (spill_x1, spill_y1, spill_x2, spill_y2),
            fill="blueviolet",
            width=spill_width,
        )

    num_clouds = rng.randint(3, 6)
    for i in range(num_clouds):
        cloud_radius = rng.randint(20, 50)
        max_offset = planet_radius - cloud_radius
        cloud_x = center_x + rng.randint(-max_offset, max_offset)
        cloud_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            cloud_x,
            cloud_y,
            cloud_radius,
            "purple",
            seed,
            spaced_planet_name + f"_cloud_{i}",
        )

    if rng.random() < 0.5:
        pool_radius = rng.randint(10, 30)
        pool_x = center_x + rng.randint(-planet_radius, planet_radius)
        pool_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            pool_x,
            pool_y,
            pool_radius,
            "darkgreen",
            seed,
            spaced_planet_name + "_toxic_pool",
        )


def draw_radioactive_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_segments = rng.randint(2, 4)
    for i in range(num_segments):
        segment_radius = rng.randint(4, 12)
        segment_start_angle = rng.uniform(0, 2 * math.pi)
        segment_end_angle = segment_start_angle + rng.uniform(math.pi / 6, math.pi / 3)
        segment_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
        segment_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)
        draw.pieslice(
            [
                (segment_x - segment_radius, segment_y - segment_radius),
                (segment_x + segment_radius, segment_y + segment_radius),
            ],
            start=math.degrees(segment_start_angle),
            end=math.degrees(segment_end_angle),
            fill="chartreuse",
            outline="mediumspringgreen",
        )

    num_arcs = rng.randint(2, 60)
    temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_image)
    for i in range(num_arcs):
        arc_radius = rng.randint(60, 240)
        arc_width = rng.randint(2, 5)
        arc_start_angle = rng.uniform(0, 2 * math.pi)
        arc_end_angle = arc_start_angle + rng.uniform(math.pi / 4, math.pi / 2)
        arc_x = center_x
        arc_y = center_y
        temp_draw.arc(
            [
                (arc_x - arc_radius, arc_y - arc_radius),
                (arc_x + arc_radius, arc_y + arc_radius),
            ],
            start=math.degrees(arc_start_angle),
            end=math.degrees(arc_end_angle),
            fill=(0, 255, 0, 50),
            width=arc_width,
        )
    draw.bitmap((0, 0), temp_image, fill=None)

    num_zones = rng.randint(3, 6)
    for i in range(num_zones):
        zone_radius = rng.randint(15, 40)
        max_offset = planet_radius - zone_radius
        zone_x = center_x + rng.randint(-max_offset, max_offset)
        zone_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            zone_x,
            zone_y,
            zone_radius,
            "lime",
            seed,
            spaced_planet_name + f"_radioactive_zone_{i}",
        )

    if rng.random() < 0.5:
        glow_radius = rng.randint(10, 20)
        glow_x = center_x + rng.randint(-planet_radius, planet_radius)
        glow_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            glow_x,
            glow_y,
            glow_radius,
            "yellow",
            seed,
            spaced_planet_name + "_glow",
        )


def draw_magma_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_lakes = rng.randint(3, 5)
    for i in range(num_lakes):
        lake_radius = rng.randint(30, 60)
        max_offset = planet_radius - lake_radius
        lake_x = center_x + rng.randint(-max_offset, max_offset)
        lake_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            lake_x,
            lake_y,
            lake_radius,
            "orangered",
            seed,
            spaced_planet_name + f"_magma_lake_{i}",
        )

    num_flows = rng.randint(3, 6)
    for i in range(num_flows):
        flow_length = rng.randint(20, 50)
        flow_angle = rng.uniform(0, 2 * math.pi)
        flow_x = center_x + int(flow_length * math.cos(flow_angle))
        flow_y = center_y + int(flow_length * math.sin(flow_angle))
        generate_abstract_shape(
            draw,
            flow_x,
            flow_y,
            rng.randint(10, 20),
            "red",
            seed,
            spaced_planet_name + f"_magma_flow_{i}",
        )

    num_vents = rng.randint(2, 4)
    for i in range(num_vents):
        vent_radius = rng.randint(2, 6)
        vent_x = center_x + rng.randint(-planet_radius, planet_radius)
        vent_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.ellipse(
            (
                vent_x - vent_radius,
                vent_y - vent_radius,
                vent_x + vent_radius,
                vent_y + vent_radius,
            ),
            fill="maroon",
            outline="darkred",
        )
        num_smoke_plumes = rng.randint(1, 3)
        for _ in range(num_smoke_plumes):
            plume_width = rng.randint(5, 10)
            plume_height = rng.randint(20, 40)
            plume_x = vent_x + rng.randint(-vent_radius, vent_radius)
            plume_y = vent_y - vent_radius - rng.randint(10, 20)
            smoke_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
            smoke_draw = ImageDraw.Draw(smoke_image)
            smoke_draw.ellipse(
                (
                    plume_x - plume_width,
                    plume_y - plume_height,
                    plume_x + plume_width,
                    plume_y + plume_height,
                ),
                fill=(105, 105, 105, 40),
                outline=None,
            )
            draw.bitmap((0, 0), smoke_image, fill=None)

    if rng.random() < 0.5:
        glow_radius = rng.randint(10, 20)
        glow_x = center_x + rng.randint(-planet_radius, planet_radius)
        glow_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            glow_x,
            glow_y,
            glow_radius,
            "orange",
            seed,
            spaced_planet_name + "_magma_glow",
        )


def draw_molten_core_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_heat_waves = rng.randint(3, 7)
    for i in range(num_heat_waves):
        wave_radius = rng.randint(1, 450)
        wave_thickness = rng.randint(1, 2)
        wave_x = center_x + rng.randint(-planet_radius, planet_radius)
        wave_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.arc(
            [
                (wave_x - wave_radius, wave_y - wave_radius),
                (wave_x + wave_radius, wave_y + wave_radius),
            ],
            start=0,
            end=360,
            fill=(0, 0, 0, 60),
            width=wave_thickness,
        )

    num_thermal_zones = rng.randint(2, 4)
    for i in range(num_thermal_zones):
        zone_radius = rng.randint(5, 10)
        zone_x = center_x + rng.randint(-planet_radius, planet_radius)
        zone_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.ellipse(
            (
                zone_x - zone_radius,
                zone_y - zone_radius,
                zone_x + zone_radius,
                zone_y + zone_radius,
            ),
            fill=(255, 69, 0, 128),
            outline=None,
        )

    num_core_spots = rng.randint(3, 20)
    for i in range(num_core_spots):
        core_radius = rng.randint(20, 40)
        core_x = center_x + rng.randint(-planet_radius, planet_radius)
        core_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            core_x,
            core_y,
            core_radius,
            "darkorange",
            seed,
            spaced_planet_name + f"_core_spot_{i}",
        )

    if rng.random() < 0.5:
        crater_radius = rng.randint(20, 40)
        crater_x = center_x + rng.randint(-planet_radius, planet_radius)
        crater_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            crater_x,
            crater_y,
            crater_radius,
            "darkred",
            seed,
            spaced_planet_name + "_molten_crater",
        )


def draw_carbon_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_textures = rng.randint(50, 100)
    for _ in range(num_textures):
        texture_radius = rng.randint(1, 2)
        texture_x = center_x + rng.randint(-planet_radius, planet_radius)
        texture_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.ellipse(
            (
                texture_x - texture_radius,
                texture_y - texture_radius,
                texture_x + texture_radius,
                texture_y + texture_radius,
            ),
            fill="dimgray",
            outline=None,
        )

    num_structures = rng.randint(5, 10)
    for _ in range(num_structures):
        structure_radius = rng.randint(30, 70)
        structure_x = center_x + rng.randint(-planet_radius, planet_radius)
        structure_y = center_y + rng.randint(-planet_radius, planet_radius)
        num_sides = rng.randint(5, 9)
        angle_step = 2 * math.pi / num_sides
        points = []
        for i in range(num_sides):
            angle = i * angle_step
            distance = rng.uniform(structure_radius * 0.7, structure_radius)
            x = structure_x + int(distance * math.cos(angle))
            y = structure_y + int(distance * math.sin(angle))
            points.append((x, y))
        draw.polygon(points, fill="black", outline="darkslategray")

    num_fragments = rng.randint(3, 5)
    for _ in range(num_fragments):
        fragment_radius = rng.randint(20, 150)
        fragment_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
        fragment_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)
        for i in range(5):
            angle = rng.uniform(0, 2 * math.pi)
            end_x = fragment_x + int(fragment_radius * math.cos(angle))
            end_y = fragment_y + int(fragment_radius * math.sin(angle))
            draw.line(
                (fragment_x, fragment_y, end_x, end_y),
                fill="black",
                width=rng.randint(1, 5),
            )

    num_deposits = rng.randint(5, 10)
    for i in range(num_deposits):
        deposit_radius = rng.randint(20, 60)
        max_offset = planet_radius - deposit_radius
        deposit_x = center_x + rng.randint(-max_offset, max_offset)
        deposit_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            deposit_x,
            deposit_y,
            deposit_radius,
            "darkgray",
            seed,
            spaced_planet_name + f"_carbon_deposit_{i}",
        )

    if rng.random() < 0.5:
        dark_spot_radius = rng.randint(10, 20)
        dark_spot_x = center_x + rng.randint(-planet_radius, planet_radius)
        dark_spot_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            dark_spot_x,
            dark_spot_y,
            dark_spot_radius,
            "black",
            seed,
            spaced_planet_name + "_dark_spot",
        )


def draw_diamond_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_diamond_crystals = rng.randint(8, 12)
    for i in range(num_diamond_crystals):
        crystal_height = rng.randint(10, 80)
        crystal_base_width = rng.randint(5, 40)
        crystal_x = center_x + rng.randint(-planet_radius, planet_radius)
        crystal_y = center_y + rng.randint(-planet_radius, planet_radius)
        num_facets = rng.randint(5, 20)
        angle_step = 2 * math.pi / num_facets
        points = []
        for j in range(num_facets):
            angle = j * angle_step + rng.uniform(-0.1, 0.1)
            distance = rng.uniform(crystal_base_width // 2, crystal_base_width)
            x = crystal_x + int(distance * math.cos(angle))
            y = crystal_y + int(distance * math.sin(angle))
            points.append((x, y))
        points.append((crystal_x, crystal_y - crystal_height))
        draw.polygon(points, fill="lightskyblue", outline="deepskyblue")

    num_reflections = rng.randint(5, 14)
    for i in range(num_reflections):
        reflection_radius = rng.randint(10, 100)
        reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
        reflection_y = center_y + rng.randint(-planet_radius, planet_radius)
        temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
        temp_draw = ImageDraw.Draw(temp_image)
        for r in range(reflection_radius, 0, -1):
            alpha = int(255 * (r / reflection_radius) * 0.5)
            temp_draw.ellipse(
                (
                    reflection_x - r,
                    reflection_y - r,
                    reflection_x + r,
                    reflection_y + r,
                ),
                fill=(255, 255, 255, alpha),
            )
        blurred_reflection = temp_image.filter(ImageFilter.GaussianBlur(radius=10))
        draw.bitmap((0, 0), blurred_reflection, fill=None)

    num_sparks = rng.randint(50, 75)
    for i in range(num_sparks):
        sparkle_x = center_x + rng.randint(-planet_radius, planet_radius)
        sparkle_y = center_y + rng.randint(-planet_radius, planet_radius)
        sparkle_color = rng.choice(["white", "deepskyblue", "cyan"])
        draw.ellipse(
            (sparkle_x - 1, sparkle_y - 1, sparkle_x + 1, sparkle_y + 1),
            fill=sparkle_color,
        )

    num_diamond_crystals = rng.randint(3, 10)
    for i in range(num_diamond_crystals):
        crystal_height = rng.randint(2, 20)
        crystal_base_width = rng.randint(2, 20)
        crystal_x = center_x + rng.randint(-planet_radius, planet_radius)
        crystal_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.polygon(
            [
                (crystal_x, crystal_y),
                (crystal_x + crystal_base_width, crystal_y),
                (crystal_x + crystal_base_width // 2, crystal_y - crystal_height),
            ],
            fill="lightskyblue",
        )

    if rng.random() < 0.5:
        reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
        reflection_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            reflection_x,
            reflection_y,
            rng.randint(10, 20),
            "white",
            seed,
            spaced_planet_name + "_diamond_reflection",
        )


def draw_super_earth_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_mountains = rng.randint(5, 8)
    for i in range(num_mountains):
        mountain_base_width = rng.randint(4, 8)
        mountain_height = rng.randint(4, 8)
        mountain_x = center_x + rng.randint(-planet_radius, planet_radius)
        mountain_y = center_y + rng.randint(-planet_radius, planet_radius)
        base_points = [
            (mountain_x - mountain_base_width // 2, mountain_y),
            (mountain_x + mountain_base_width // 2, mountain_y),
            (mountain_x, mountain_y - mountain_height),
        ]
        draw.polygon(base_points, fill=(0, 0, 0, 80), outline="black")

    num_highlands = rng.randint(5, 10)
    for i in range(num_highlands):
        highland_radius = rng.randint(20, 50)
        max_offset = planet_radius - highland_radius
        highland_x = center_x + rng.randint(-max_offset, max_offset)
        highland_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            highland_x,
            highland_y,
            highland_radius,
            "lightgreen",
            seed,
            spaced_planet_name + f"_highland_{i}",
        )

    if rng.random() < 0.5:
        water_radius = rng.randint(10, 30)
        water_x = center_x + rng.randint(-planet_radius, planet_radius)
        water_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            water_x,
            water_y,
            water_radius,
            "blue",
            seed,
            spaced_planet_name + "_water",
        )


def draw_sub_earth_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_hills = rng.randint(5, 10)
    for i in range(num_hills):
        hill_base_width = rng.randint(2, 4)
        hill_height = rng.randint(2, 4)
        hill_x = center_x + rng.randint(-planet_radius, planet_radius)
        hill_y = center_y + rng.randint(-planet_radius, planet_radius)
        draw.polygon(
            [
                (hill_x, hill_y),
                (hill_x + hill_base_width // 2, hill_y - hill_height),
                (hill_x - hill_base_width // 2, hill_y - hill_height),
            ],
            fill=(34, 139, 34, 200),
            outline=(0, 100, 0, 255),
        )

    num_valleys = rng.randint(3, 7)
    for i in range(num_valleys):
        valley_radius = rng.randint(2, 10)
        max_offset = planet_radius - valley_radius
        valley_x = center_x + rng.randint(-max_offset, max_offset)
        valley_y = center_y + rng.randint(-max_offset, max_offset)
        arc_start = rng.uniform(0, math.pi)
        arc_end = arc_start + rng.uniform(math.pi / 4, math.pi / 2)
        draw.arc(
            [
                (valley_x - valley_radius, valley_y - valley_radius),
                (valley_x + valley_radius, valley_y + valley_radius),
            ],
            start=math.degrees(arc_start),
            end=math.degrees(arc_end),
            fill=(107, 142, 35, 200),
            width=3,
        )

    generate_abstract_shape(
        draw,
        center_x + rng.randint(-planet_radius, planet_radius),
        center_y + rng.randint(-planet_radius, planet_radius),
        rng.randint(10, 60),
        "darkgreen",
        seed,
        spaced_planet_name + "_abstract_shape_1",
    )

    generate_abstract_shape(
        draw,
        center_x + rng.randint(-planet_radius, planet_radius),
        center_y + rng.randint(-planet_radius, planet_radius),
        rng.randint(10, 60),
        "green",
        seed,
        spaced_planet_name + "_abstract_shape_2",
    )


def draw_frozen_gas_giant_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_gas_layers = rng.randint(4, 800)
    for i in range(num_gas_layers):
        layer_radius = planet_radius - (i * 20)
        if layer_radius > 0:
            draw.ellipse(
                [
                    (center_x - layer_radius, center_y - layer_radius),
                    (center_x + layer_radius, center_y + layer_radius),
                ],
                outline=(255, 255, 255, 1),
                width=1,
            )

    num_ice_bands = rng.randint(3, 40)
    for i in range(num_ice_bands):
        band_width = rng.randint(1, 40)
        band_radius = rng.randint(planet_radius // 2, planet_radius)
        band_x_offset = rng.randint(-planet_radius // 3, planet_radius // 3)
        band_y_offset = rng.randint(-planet_radius // 3, planet_radius // 3)
        draw.arc(
            [
                (
                    center_x - band_radius + band_x_offset,
                    center_y - band_radius + band_y_offset,
                ),
                (
                    center_x + band_radius + band_x_offset,
                    center_y + band_radius + band_y_offset,
                ),
            ],
            start=rng.randint(0, 360),
            end=rng.randint(180, 360),
            fill="skyblue",
            width=band_width,
        )

    num_vortices = rng.randint(3, 20)
    for i in range(num_vortices):
        vortex_radius = rng.randint(2, 10)
        vortex_center_x = center_x + rng.randint(
            -planet_radius // 2, planet_radius // 2
        )
        vortex_center_y = center_y + rng.randint(
            -planet_radius // 2, planet_radius // 2
        )
        draw.arc(
            [
                (vortex_center_x - vortex_radius, vortex_center_y - vortex_radius),
                (vortex_center_x + vortex_radius, vortex_center_y + vortex_radius),
            ],
            start=rng.randint(0, 360),
            end=rng.randint(180, 360),
            fill="white",
            width=2,
        )
        draw.arc(
            [
                (
                    vortex_center_x - vortex_radius // 2,
                    vortex_center_y - vortex_radius // 2,
                ),
                (
                    vortex_center_x + vortex_radius // 2,
                    vortex_center_y + vortex_radius // 2,
                ),
            ],
            start=rng.randint(0, 360),
            end=rng.randint(180, 360),
            fill="lightcyan",
            width=4,
        )

    num_ice_particles = rng.randint(10, 20)
    for i in range(num_ice_particles):
        particle_x = center_x + rng.randint(-planet_radius, planet_radius)
        particle_y = center_y + rng.randint(-planet_radius, planet_radius)
        particle_size = rng.randint(2, 5)
        draw.ellipse(
            [
                (particle_x - particle_size, particle_y - particle_size),
                (particle_x + particle_size, particle_y + particle_size),
            ],
            fill="aliceblue",
            outline=None,
        )

    storm_radius = rng.randint(30, 150)
    storm_x = center_x + rng.randint(-planet_radius // 3, planet_radius // 3)
    storm_y = center_y + rng.randint(-planet_radius // 3, planet_radius // 3)
    generate_abstract_shape(
        draw,
        storm_x,
        storm_y,
        storm_radius,
        "white",
        seed,
        spaced_planet_name + "_ice_storm",
    )


def draw_nebulous_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_nebulae = rng.randint(3, 10)
    for i in range(num_nebulae):
        nebula_radius = rng.randint(30, 40)
        max_offset = planet_radius - nebula_radius
        nebula_x = center_x + rng.randint(-max_offset, max_offset)
        nebula_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            nebula_x,
            nebula_y,
            nebula_radius,
            "pink",
            seed,
            spaced_planet_name + f"_nebula_{i}",
        )
    if rng.random() < 0.5:
        star_radius = rng.randint(10, 20)
        star_x = center_x + rng.randint(-planet_radius, planet_radius)
        star_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            star_x,
            star_y,
            star_radius,
            "white",
            seed,
            spaced_planet_name + "_star",
        )


def draw_aquifer_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_water_patterns = rng.randint(2, 16)
    for i in range(num_water_patterns):
        pattern_radius = rng.randint(2, 10)
        pattern_x = center_x + rng.randint(-planet_radius, planet_radius)
        pattern_y = center_y + rng.randint(-planet_radius, planet_radius)
        start_angle = rng.uniform(0, 2 * math.pi)
        end_angle = start_angle + rng.uniform(math.pi / 4, math.pi / 2)
        draw.pieslice(
            [
                (pattern_x - pattern_radius, pattern_y - pattern_radius),
                (pattern_x + pattern_radius, pattern_y + pattern_radius),
            ],
            start=math.degrees(start_angle),
            end=math.degrees(end_angle),
            fill="aqua",
            outline="DeepSkyBlue",
        )

    num_aquifers = rng.randint(3, 12)
    for i in range(num_aquifers):
        aquifer_radius = rng.randint(4, 10)
        max_offset = planet_radius - aquifer_radius
        aquifer_x = center_x + rng.randint(-max_offset, max_offset)
        aquifer_y = center_y + rng.randint(-max_offset, max_offset)
        generate_abstract_shape(
            draw,
            aquifer_x,
            aquifer_y,
            aquifer_radius,
            "aqua",
            seed,
            spaced_planet_name + f"_aquifer_{i}",
        )

    if rng.random() < 0.5:
        well_radius = rng.randint(10, 20)
        well_x = center_x + rng.randint(-planet_radius, planet_radius)
        well_y = center_y + rng.randint(-planet_radius, planet_radius)
        generate_abstract_shape(
            draw,
            well_x,
            well_y,
            well_radius,
            "darkblue",
            seed,
            spaced_planet_name + "_well",
        )


def draw_exotic_elements(
    draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
):
    num_exotic_shapes = rng.randint(4, 8)
    for i in range(num_exotic_shapes):
        exotic_radius = rng.randint(10, 20)
        max_offset = planet_radius - exotic_radius
        exotic_x = center_x + rng.randint(-max_offset, max_offset)
        exotic_y = center_y + rng.randint(-max_offset, max_offset)
        exotic_color = f"#{rng.randint(0, 0xFFFFFF):06x}"  # Color aleatorio
        generate_abstract_shape(
            draw,
            exotic_x,
            exotic_y,
            exotic_radius,
            exotic_color,
            seed,
            spaced_planet_name + f"_exotic_{i}",
        )

    num_exotic_symbols = rng.randint(4, 8)
    for i in range(num_exotic_symbols):
        symbol_size = rng.randint(20, 60)
        max_offset = planet_radius - symbol_size
        symbol_x = center_x + rng.randint(-max_offset, max_offset)
        symbol_y = center_y + rng.randint(-max_offset, max_offset)
        symbol_color = f"#{rng.randint(200, 255):02x}{rng.randint(0, 100):02x}{rng.randint(150, 255):02x}"

        shape_type = rng.choice(["arc", "polygon", "fractals"])
        if shape_type == "arc":
            symbol_size = rng.randint(20, 50)
            start_angle = rng.uniform(0, 2 * math.pi)
            end_angle = start_angle + rng.uniform(math.pi / 4, math.pi)
            draw.arc(
                [
                    (symbol_x - symbol_size, symbol_y - symbol_size),
                    (symbol_x + symbol_size, symbol_y + symbol_size),
                ],
                start=math.degrees(start_angle),
                end=math.degrees(end_angle),
                fill=symbol_color,
                width=rng.randint(2, 8),
            )
        elif shape_type == "polygon":
            symbol_size = rng.randint(6, 10)
            num_sides = rng.randint(3, 8)
            angle_step = 4 * math.pi / num_sides
            polygon_points = [
                (
                    symbol_x + int(symbol_size * math.cos(angle_step * j)),
                    symbol_y + int(symbol_size * math.sin(angle_step * j)),
                )
                for j in range(num_sides)
            ]
            r, g, b = ImageColor.getrgb(symbol_color)
            fill_color = (r, g, b, 25)
            draw.polygon(polygon_points, outline=symbol_color, fill=fill_color)
        elif shape_type == "fractals":
            for _ in range(rng.randint(1, 80)):
                fractal_size = rng.randint(1, 80)
                fractal_x = symbol_x + rng.randint(-symbol_size, symbol_size)
                fractal_y = symbol_y + rng.randint(-symbol_size, symbol_size)
                draw.ellipse(
                    [
                        (fractal_x - fractal_size, fractal_y - fractal_size),
                        (fractal_x + fractal_size, fractal_y + fractal_size),
                    ],
                    outline=symbol_color,
                )

    num_exotic_shapes = rng.randint(12, 18)
    for i in range(num_exotic_shapes):
        exotic_radius = rng.randint(4, 16)
        max_offset = planet_radius - exotic_radius
        exotic_x = center_x + rng.randint(-max_offset, max_offset)
        exotic_y = center_y + rng.randint(-max_offset, max_offset)
        exotic_color = f"#{rng.randint(0, 0xFFFFFF):06x}"  # Color aleatorio
        generate_abstract_shape(
            draw,
            exotic_x,
            exotic_y,
            exotic_radius,
            exotic_color,
            seed,
            spaced_planet_name + f"_exotic_{i}",
        )

    if rng.random() < 0.5:
        additional_radius = rng.randint(10, 30)
        additional_x = center_x + rng.randint(-planet_radius, planet_radius)
        additional_y = center_y + rng.randint(-planet_radius, planet_radius)
        additional_color = f"#{rng.randint(0, 0xFFFFFF):06x}"
        generate_abstract_shape(
            draw,
            additional_x,
            additional_y,
            additional_radius,
            additional_color,
            seed,
            spaced_planet_name + "_additional",
        )
