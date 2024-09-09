# pymodules/__drawer_cplanet_life.py

import math

from PIL import Image, ImageDraw, ImageFilter


def draw_intelligent_life(
    life_form_draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name, img_size
):
    num_satellites = rng.randint(1, 5)
    for i in range(num_satellites):
        satellite_distance = planet_radius + rng.randint(20, 40)
        satellite_angle = rng.uniform(0, 2 * math.pi)
        satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
        satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

        num_dots = 50
        for j in range(num_dots):
            start_angle = 2 * math.pi * j / num_dots
            end_angle = 2 * math.pi * (j + 0.5) / num_dots
            start_x = center_x + satellite_distance * math.cos(start_angle)
            start_y = center_y + satellite_distance * math.sin(start_angle)
            end_x = center_x + satellite_distance * math.cos(end_angle)
            end_y = center_x + satellite_distance * math.sin(end_angle)
            life_form_draw.line(
                (start_x, start_y, end_x, end_y), fill=(255, 255, 255, 100), width=1
            )

        life_form_draw.ellipse(
            (satellite_x - 2, satellite_y - 2, satellite_x + 2, satellite_y + 2),
            fill="white",
        )


def draw_silicon_based_life(
    life_form_draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name, img_size
):
    num_crystals = rng.randint(2, 4)
    for i in range(num_crystals):
        crystal_distance = planet_radius + rng.randint(20, 60)
        crystal_angle = rng.uniform(0, 2 * math.pi)
        crystal_x = center_x + int(crystal_distance * math.cos(crystal_angle))
        crystal_y = center_y + int(crystal_distance * math.sin(crystal_angle))

        crystal_size = rng.randint(3, 9)
        life_form_draw.polygon(
            [
                (crystal_x, crystal_y - crystal_size),
                (crystal_x + crystal_size, crystal_y + crystal_size),
                (crystal_x - crystal_size, crystal_y + crystal_size),
            ],
            fill="black",
            outline="white",
        )

    num_debris = rng.randint(10, 20)
    for _ in range(num_debris):
        rad_angle = rng.uniform(0, 2 * math.pi)
        ring_distance = planet_radius + rng.randint(45, 60)
        ring_x = center_x + int(ring_distance * math.cos(rad_angle))
        ring_y = center_y + int(ring_distance * math.sin(rad_angle))

        debris_size = rng.randint(1, 4)
        life_form_draw.ellipse(
            (
                ring_x - debris_size,
                ring_y - debris_size,
                ring_x + debris_size,
                ring_y + debris_size,
            ),
            fill="#121212",
        )


def draw_non_physical_entity(
    life_form_draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    seed,
    spaced_planet_name,
    img_size,
):
    plasma_ring_width = rng.randint(10, 20)
    plasma_ring_radius = planet_radius + 30

    plasma_ring_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    plasma_ring_draw = ImageDraw.Draw(plasma_ring_img)

    plasma_ring_draw.ellipse(
        (
            center_x - plasma_ring_radius,
            center_y - plasma_ring_radius,
            center_x + plasma_ring_radius,
            center_y + plasma_ring_radius,
        ),
        outline=(135, 206, 250, 150),
        width=plasma_ring_width,
    )

    plasma_ring_img = plasma_ring_img.filter(ImageFilter.GaussianBlur(radius=5))

    life_form_draw.bitmap((0, 0), plasma_ring_img, fill=None)

    num_waves = rng.randint(3, 5)
    wave_radius_start = planet_radius + 50

    for i in range(num_waves):
        wave_radius = wave_radius_start + i * 10

        wave_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        wave_draw = ImageDraw.Draw(wave_img)

        wave_draw.arc(
            [
                (center_x - wave_radius, center_y - wave_radius),
                (center_x + wave_radius, center_y + wave_radius),
            ],
            start=rng.randint(0, 360),
            end=rng.randint(180, 360),
            fill=(255, 255, 255, 255),
        )

        wave_img = wave_img.filter(ImageFilter.GaussianBlur(radius=2))

        life_form_draw.bitmap((0, 0), wave_img, fill=None)


def draw_robotic_entities(
    life_form_draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    seed,
    spaced_planet_name,
    img_size,
):
    num_satellites = rng.randint(2, 4)
    for i in range(num_satellites):
        satellite_distance = planet_radius + rng.randint(30, 50)
        satellite_angle = rng.uniform(0, 2 * math.pi)
        satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
        satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

        satellite_size = rng.randint(5, 8)
        life_form_draw.polygon(
            [
                (satellite_x, satellite_y - satellite_size),
                (satellite_x + satellite_size, satellite_y),
                (satellite_x, satellite_y + satellite_size),
                (satellite_x - satellite_size, satellite_y),
            ],
            fill="gray",
            outline="white",
        )

    drone_positions = []
    num_drones = rng.randint(10, 20)
    for i in range(num_drones):
        drone_distance = planet_radius + rng.randint(60, 80)
        drone_angle = rng.uniform(0, 2 * math.pi)
        drone_x = center_x + int(drone_distance * math.cos(drone_angle))
        drone_y = center_y + int(drone_distance * math.sin(drone_angle))

        drone_size = rng.randint(1, 3)
        life_form_draw.ellipse(
            (
                drone_x - drone_size,
                drone_y - drone_size,
                drone_x + drone_size,
                drone_y + drone_size,
            ),
            fill="lightgray",
        )

        if i > 0:
            previous_drone_x, previous_drone_y = drone_positions[-1]
            life_form_draw.line(
                (previous_drone_x, previous_drone_y, drone_x, drone_y),
                fill="lightgray",
                width=1,
            )
        drone_positions.append((drone_x, drone_y))

    ring_width = rng.randint(5, 25)
    ring_radius = planet_radius + 100

    energy_ring_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    energy_ring_draw = ImageDraw.Draw(energy_ring_img)

    energy_ring_draw.ellipse(
        (
            center_x - ring_radius,
            center_y - ring_radius,
            center_x + ring_radius,
            center_y + ring_radius,
        ),
        outline=(0, 255, 0, 150),
        width=ring_width,
    )

    energy_ring_img = energy_ring_img.filter(ImageFilter.GaussianBlur(radius=3))

    life_form_draw.bitmap((0, 0), energy_ring_img, fill=None)


def draw_conscious_gas(
    life_form_draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    seed,
    spaced_planet_name,
    img_size,
):
    num_clouds = rng.randint(3, 6)
    for _ in range(num_clouds):
        cloud_distance = planet_radius + rng.randint(30, 50)
        cloud_angle = rng.uniform(0, 2 * math.pi)
        cloud_x = center_x + int(cloud_distance * math.cos(cloud_angle))
        cloud_y = center_y + int(cloud_distance * math.sin(cloud_angle))

        cloud_size = rng.randint(20, 40)
        cloud_color = (
            rng.randint(100, 200),
            rng.randint(100, 255),
            rng.randint(150, 255),
            150,
        )
        cloud_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        cloud_draw = ImageDraw.Draw(cloud_img)

        cloud_draw.ellipse(
            (
                cloud_x - cloud_size,
                cloud_y - cloud_size,
                cloud_x + cloud_size,
                cloud_y + cloud_size,
            ),
            fill=cloud_color,
        )

        cloud_img = cloud_img.filter(ImageFilter.GaussianBlur(radius=5))

        life_form_draw.bitmap((0, 0), cloud_img, fill=None)

    num_belts = rng.randint(2, 3)
    for i in range(num_belts):
        belt_radius = planet_radius + 70 + i * 10
        belt_color = (
            rng.randint(150, 255),
            rng.randint(150, 255),
            rng.randint(150, 255),
            120,
        )

        belt_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        belt_draw = ImageDraw.Draw(belt_img)

        belt_draw.ellipse(
            (
                center_x - belt_radius,
                center_y - belt_radius,
                center_x + belt_radius,
                center_y + belt_radius,
            ),
            outline=belt_color,
            width=5,
        )

        belt_img = belt_img.filter(ImageFilter.GaussianBlur(radius=3))

        life_form_draw.bitmap((0, 0), belt_img, fill=None)


def draw_god(
    life_form_draw,
    center_x,
    center_y,
    planet_radius,
    rng,
    seed,
    spaced_planet_name,
    img_size,
):
    triangle_size = planet_radius * 0.5
    triangle_center_x = center_x
    triangle_center_y = center_y

    life_form_draw.polygon(
        [
            (triangle_center_x, triangle_center_y - triangle_size),
            (triangle_center_x - triangle_size, triangle_center_y + triangle_size),
            (triangle_center_x + triangle_size, triangle_center_y + triangle_size),
        ],
        outline="yellow",
        width=4,
    )

    num_rays = rng.randint(10, 20)
    for i in range(num_rays):
        angle = math.radians(i * (360 / num_rays) + rng.uniform(-10, 10))
        ray_length = triangle_size + rng.randint(30, 60)
        ray_x = triangle_center_x + int(ray_length * math.cos(angle))
        ray_y = triangle_center_y + int(ray_length * math.sin(angle))
        life_form_draw.line(
            (triangle_center_x, triangle_center_y, ray_x, ray_y),
            fill="yellow",
            width=3,
        )

    halo_radius = planet_radius + 140
    halo_width = rng.randint(15, 30)

    halo_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    halo_draw = ImageDraw.Draw(halo_img)

    halo_draw.ellipse(
        (
            center_x - halo_radius,
            center_y - halo_radius,
            center_x + halo_radius,
            center_y + halo_radius,
        ),
        outline=(255, 255, 0, 255),
        width=halo_width,
    )

    halo_img = halo_img.filter(ImageFilter.GaussianBlur(radius=20))

    life_form_draw.bitmap((0, 0), halo_img, fill="yellow")

    num_symbols = rng.randint(5, 20)
    for _ in range(num_symbols):
        symbol_size = rng.randint(5, 35)
        symbol_angle = rng.uniform(0, 2 * math.pi)
        symbol_distance = planet_radius + rng.randint(150, 210)
        symbol_x = center_x + int(symbol_distance * math.cos(symbol_angle))
        symbol_y = center_y + int(symbol_distance * math.sin(symbol_angle))

        symbol_type = rng.choice(["circle", "cross"])
        if symbol_type == "circle":
            life_form_draw.ellipse(
                (
                    symbol_x - symbol_size // 2,
                    symbol_y - symbol_size // 2,
                    symbol_x + symbol_size // 2,
                    symbol_y + symbol_size // 2,
                ),
                outline="yellow",
                width=2,
            )
        elif symbol_type == "cross":
            life_form_draw.line(
                (
                    symbol_x - symbol_size // 2,
                    symbol_y,
                    symbol_x + symbol_size // 2,
                    symbol_y,
                ),
                fill="yellow",
                width=2,
            )
            life_form_draw.line(
                (
                    symbol_x,
                    symbol_y - symbol_size // 2,
                    symbol_x,
                    symbol_y + symbol_size // 2,
                ),
                fill="yellow",
                width=2,
            )
