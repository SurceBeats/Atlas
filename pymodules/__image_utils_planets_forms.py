# pymodules\__image_utils_planets_forms.py

from PIL import Image, ImageDraw, ImageFilter, ImageColor

import math
import random
import hashlib


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)


def generate_noise_texture(
    draw, center_x, center_y, planet_radius, seed, opacity, blur_radius=1
):
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

    noise_image = noise_image.filter(ImageFilter.GaussianBlur(blur_radius))

    draw.bitmap(
        (center_x - planet_radius, center_y - planet_radius), noise_image, fill=None
    )


def generate_clouds(draw, center_x, center_y, radius, color, global_seed, planet_name):

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


def draw_cluster(
    draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    color,
    min_radius=20,
    max_radius=50,
    min_points=100,
    max_points=300,
    min_opacity=30,
    max_opacity=120,
    cluster_count_range=(5, 10),
):
    num_clusters = rng.randint(cluster_count_range[0], cluster_count_range[1])
    for i in range(num_clusters):
        cluster_radius = rng.randint(min_radius, max_radius)
        max_offset = planet_radius - cluster_radius
        cluster_x = center_x + rng.randint(-max_offset, max_offset)
        cluster_y = center_y + rng.randint(-max_offset, max_offset)

        num_points = rng.randint(min_points, max_points)
        points = []
        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            distance = rng.uniform(0, cluster_radius)
            x = cluster_x + int(distance * math.cos(angle))
            y = cluster_y + int(distance * math.sin(angle))
            points.append((x, y))

        for point in points:
            opacity = rng.randint(min_opacity, max_opacity)
            size = rng.choice([1, 2])
            point_color = (*color[:3], opacity)

            if size == 1:
                draw.point(point, fill=point_color)
            else:
                draw.rectangle([point, (point[0] + 1, point[1] + 1)], fill=point_color)


def draw_toxic_vegetation(draw, center_x, center_y, planet_radius, rng):
    num_plants = rng.randint(4, 8)
    for _ in range(num_plants):
        plant_x = center_x + rng.randint(-planet_radius, planet_radius)
        plant_y = center_y + rng.randint(-planet_radius, planet_radius)
        plant_height = rng.randint(20, 100)
        plant_width = rng.randint(10, 20)

        plant_color = (255, 0, 255, 255)

        for _ in range(rng.randint(3, 5)):
            leaf_length = rng.randint(10, plant_height)
            leaf_width = rng.randint(10, 20)
            leaf_curve = [
                (plant_x, plant_y),
                (
                    plant_x + rng.randint(-leaf_width, leaf_width),
                    plant_y - leaf_length // 2,
                ),
                (plant_x + leaf_width, plant_y - leaf_length),
            ]

            draw.line(leaf_curve, fill=plant_color, width=2)

        for _ in range(rng.randint(10, 30)):
            spike_start_x = plant_x + rng.randint(-plant_width, plant_width)
            spike_start_y = plant_y - rng.randint(0, plant_height)
            spike_length = rng.randint(15, 35)
            spike_curve = [
                (spike_start_x, spike_start_y),
                (spike_start_x + rng.randint(-5, 5), spike_start_y - spike_length // 2),
                (spike_start_x + rng.randint(-10, 10), spike_start_y - spike_length),
            ]

            draw.line(spike_curve, fill=plant_color, width=2)

        glow_color = (255, 0, 255, 200)
        for _ in range(rng.randint(2, 4)):
            glow_radius = rng.randint(6, 10)
            glow_x = plant_x + rng.randint(-plant_width, plant_width)
            glow_y = plant_y - rng.randint(0, plant_height)
            draw.ellipse(
                [
                    (glow_x - glow_radius, glow_y - glow_radius),
                    (glow_x + glow_radius, glow_y + glow_radius),
                ],
                fill=glow_color,
            )


def draw_arcs(
    draw,
    center_x,
    center_y,
    color,
    rng,
    num_arcs_range=(2, 60),
    radius_range=(60, 240),
    arc_width_range=(2, 5),
):
    num_arcs = rng.randint(*num_arcs_range)
    temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_image)

    for i in range(num_arcs):
        arc_radius = rng.randint(*radius_range)
        arc_width = rng.randint(*arc_width_range)
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
            fill=color,
            width=arc_width,
        )

    draw.bitmap((0, 0), temp_image, fill=None)


def draw_depths(
    draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    num_depths_range=(60, 100),
    depth_radius_range=(0.1, 0.3),
    depth_color_base=(0, 0, 139),
):

    num_depths = rng.randint(*num_depths_range)

    for _ in range(num_depths):
        depth_radius = rng.randint(
            int(depth_radius_range[0] * planet_radius),
            int(depth_radius_range[1] * planet_radius),
        )
        depth_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
        depth_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)
        depth_alpha = rng.randint(1, 50)
        depth_color = (*depth_color_base, depth_alpha)

        draw.ellipse(
            [
                (depth_x - depth_radius, depth_y - depth_radius),
                (depth_x + depth_radius, depth_y + depth_radius),
            ],
            fill=depth_color,
            outline=None,
        )


def draw_vents_with_smoke(
    draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    num_vents_range=(8, 18),
    num_smoke_plumes_range=(4, 12),
    vent_radius_range=(2, 4),
    smoke_opacity=20,
):

    num_vents = rng.randint(*num_vents_range)

    for _ in range(num_vents):
        vent_radius = rng.randint(*vent_radius_range)
        vent_x = center_x + rng.randint(-planet_radius, planet_radius)
        vent_y = center_y + rng.randint(-planet_radius, planet_radius)

        draw.ellipse(
            (
                vent_x - vent_radius,
                vent_y - vent_radius,
                vent_x + vent_radius,
                vent_y + vent_radius,
            ),
            fill=(255, 115, 0, 20),
        )

        num_smoke_plumes = rng.randint(*num_smoke_plumes_range)

        for _ in range(num_smoke_plumes):
            plume_width = rng.randint(10, 15)
            plume_height = rng.randint(20, 150)
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
                fill=(105, 105, 105, smoke_opacity),
                outline=None,
            )

            draw.bitmap((0, 0), smoke_image, fill=None)


def draw_flows(
    draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    base_color=(255, 69, 0),
    num_flows_range=(8, 16),
    flow_opacity_range=(200, 255),
):

    num_flows = rng.randint(*num_flows_range)

    for _ in range(num_flows):
        flow_length = rng.randint(2, int(planet_radius * 3))
        flow_width = rng.randint(6, 20)
        flow_angle = rng.uniform(0, 5 * math.pi)

        num_points = rng.randint(1, 5)
        points = []

        for j in range(num_points):
            angle = flow_angle + rng.uniform(-0.5, 0.5)
            distance = flow_length * (j / num_points)
            x = center_x + int(distance * math.cos(angle))
            y = center_y + int(distance * math.sin(angle))
            points.append((x, y))

        # Sobrescribir opacidad si se desea
        coloropac = rng.randint(*flow_opacity_range)
        color_with_opacity = (*base_color[:3], coloropac)

        draw.line(points, fill=color_with_opacity, width=flow_width)


def draw_random_lines(
    draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    min_lines=100,
    max_lines=160,
    min_length=2,
    max_length=15,
    color="red",
    line_width=1,
):

    num_wind_lines = rng.randint(min_lines, max_lines)

    for _ in range(num_wind_lines):
        line_length = rng.randint(min_length, max_length)
        start_x = center_x + rng.randint(-planet_radius, planet_radius)
        start_y = center_y + rng.randint(-planet_radius, planet_radius)
        angle = rng.uniform(-math.pi / 8, math.pi / 8)
        end_x = start_x + int(line_length * math.cos(angle))
        end_y = start_y + int(line_length * math.sin(angle))

        draw.line((start_x, start_y, end_x, end_y), fill=color, width=line_width)
