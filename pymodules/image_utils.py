# pymodules/image_utils.py

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageColor
from pymodules.__config import seed
from pymodules.__image_utils_planets import (
    get_planet_color_map,
    draw_gas_giant_elements,
    draw_anomaly_elements,
    draw_rocky_elements,
    draw_icy_elements,
    draw_oceanic_elements,
    draw_desert_elements,
    draw_lava_elements,
    draw_arid_elements,
    draw_swamp_elements,
    draw_tundra_elements,
    draw_forest_elements,
    draw_savannah_elements,
    draw_cave_elements,
    draw_crystalline_elements,
    draw_metallic_elements,
    draw_toxic_elements,
    draw_radioactive_elements,
    draw_magma_elements,
    draw_molten_core_elements,
    draw_carbon_elements,
    draw_diamond_elements,
    draw_super_earth_elements,
    draw_sub_earth_elements,
    draw_frozen_gas_giant_elements,
    draw_nebulous_elements,
    draw_aquifer_elements,
    draw_exotic_elements,
)

import math
import random
import hashlib


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)


def generate_gradient(draw, center_x, center_y, planet_radius, base_color, seed):
    rng = random.Random(seed)
    gradient_img = Image.new(
        "RGBA", (2 * planet_radius, 2 * planet_radius), color=(0, 0, 0, 0)
    )
    gradient_draw = ImageDraw.Draw(gradient_img)

    for i in range(planet_radius):
        gradient_color = ImageColor.getrgb(base_color)
        opacity = int(255 * (0.5 + 0.5 * i / planet_radius))
        random_opacity = rng.randint(-20, 20)
        gradient_color = (*gradient_color, max(0, min(255, opacity + random_opacity)))

        gradient_draw.ellipse(
            (
                planet_radius - i,
                planet_radius - i,
                planet_radius + i,
                planet_radius + i,
            ),
            fill=gradient_color,
        )

    return gradient_img


def generate_planet_image(planet):
    spaced_planet_name = planet["Name"].replace("_", " ")
    planet_type = planet["Type"].replace("_", " ")
    planet_diam = planet["Diameter"]
    planet_dens = planet["Density"]
    planet_grav = planet["Gravity"]

    img_size = 800
    image = Image.new("RGB", (img_size, img_size), "black")
    planet_surface = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(planet_surface)

    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    shape_seed = consistent_hash(
        f"{seed}-{spaced_planet_name}-{planet_type}-{planet_diam}-{planet_dens}-{planet_grav}-_safe_shaper"
    )
    rng = random.Random(shape_seed)

    planet_radius = int(150 * (planet["Diameter"] / max(planet["Diameter"], 1)))

    planet_color_map = get_planet_color_map()

    base_color = planet_color_map.get(planet["Type"], "white")

    gradient = generate_gradient(
        draw,
        center_x,
        center_y,
        planet_radius,
        base_color,
        seed=hash(spaced_planet_name),
    )
    image.paste(
        gradient, (center_x - planet_radius, center_y - planet_radius), gradient
    )

    draw_functions = {
        "Gas Giant": draw_gas_giant_elements,
        "Anomaly": draw_anomaly_elements,
        "Rocky": draw_rocky_elements,
        "Icy": draw_icy_elements,
        "Oceanic": draw_oceanic_elements,
        "Desert": draw_desert_elements,
        "Lava": draw_lava_elements,
        "Arid": draw_arid_elements,
        "Swamp": draw_swamp_elements,
        "Tundra": draw_tundra_elements,
        "Forest": draw_forest_elements,
        "Savannah": draw_savannah_elements,
        "Cave": draw_cave_elements,
        "Crystalline": draw_crystalline_elements,
        "Metallic": draw_metallic_elements,
        "Toxic": draw_toxic_elements,
        "Radioactive": draw_radioactive_elements,
        "Magma": draw_magma_elements,
        "Molten Core": draw_molten_core_elements,
        "Carbon": draw_carbon_elements,
        "Diamond": draw_diamond_elements,
        "Super Earth": draw_super_earth_elements,
        "Sub Earth": draw_sub_earth_elements,
        "Frozen Gas Giant": draw_frozen_gas_giant_elements,
        "Nebulous": draw_nebulous_elements,
        "Aquifer": draw_aquifer_elements,
        "Exotic": draw_exotic_elements,
    }

    if planet_type in draw_functions:
        draw_functions[planet_type](
            draw, center_x, center_y, planet_radius, rng, seed, spaced_planet_name
        )
    else:
        raise ValueError(f"Unknown planet type: {planet_type}")

    mask = Image.new("L", (img_size, img_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse(
        (
            center_x - planet_radius,
            center_y - planet_radius,
            center_x + planet_radius,
            center_y + planet_radius,
        ),
        fill=255,
    )

    planet_surface = Image.composite(
        planet_surface, Image.new("RGBA", planet_surface.size, (0, 0, 0, 0)), mask
    )

    if planet["Atmosphere"] != "None":
        atmosphere_type = planet["Atmosphere"]

        if atmosphere_type == "Breathable":
            atmosphere_color = (144, 238, 144, 150)  # lightgreen con opacidad
            atmosphere_width = 10
        elif atmosphere_type == "Thick":
            atmosphere_color = (169, 169, 169, 200)  # gray con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Thin":
            atmosphere_color = (211, 211, 211, 100)  # lightgray con opacidad
            atmosphere_width = 8
        elif atmosphere_type == "Carbon Dioxide":
            atmosphere_color = (165, 42, 42, 150)  # brown con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Methane":
            atmosphere_color = (0, 0, 139, 150)  # darkblue con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Nitrogen":
            atmosphere_color = (0, 0, 255, 150)  # blue con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Oxygen-Rich":
            atmosphere_color = (255, 255, 255, 150)  # white con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Sulfur Dioxide":
            atmosphere_color = (255, 255, 0, 150)  # yellow con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Superheated":
            atmosphere_color = (255, 0, 0, 200)  # red con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Acidic":
            atmosphere_color = (0, 100, 0, 150)  # darkgreen con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Toxic":
            atmosphere_color = (128, 0, 128, 150)  # purple con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Hydrogen":
            atmosphere_color = (255, 182, 193, 150)  # lightpink con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Helium":
            atmosphere_color = (255, 255, 224, 150)  # lightyellow con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Ammonia":
            atmosphere_color = (240, 230, 140, 150)  # khaki con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Ionic":
            atmosphere_color = (0, 191, 255, 150)  # deepskyblue con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Plasma":
            atmosphere_color = (255, 105, 180, 200)  # hotpink con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Exotic Gases":
            atmosphere_color = (186, 85, 211, 150)  # mediumorchid con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Water Vapor":
            atmosphere_color = (173, 216, 230, 150)  # lightblue con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "Frozen":
            atmosphere_color = (240, 248, 255, 150)  # aliceblue con opacidad
            atmosphere_width = 12
        elif atmosphere_type == "None":
            atmosphere_width = 0
            atmosphere_color = None
        else:
            atmosphere_color = (169, 169, 169, 150)  # gray con opacidad por defecto
            atmosphere_width = 12

        if atmosphere_color:
            atmosphere_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            atmosphere_draw = ImageDraw.Draw(atmosphere_img)

            atmosphere_draw.ellipse(
                (
                    center_x
                    - planet_radius
                    - atmosphere_width
                    - 5,  # separar del planeta
                    center_y - planet_radius - atmosphere_width - 5,
                    center_x + planet_radius + atmosphere_width + 5,
                    center_y + planet_radius + atmosphere_width + 5,
                ),
                outline=atmosphere_color,
                width=atmosphere_width,
            )

            atmosphere_img = atmosphere_img.filter(ImageFilter.GaussianBlur(radius=5))

            image.paste(atmosphere_img, (0, 0), atmosphere_img)

    draw.line(
        (
            center_x - planet_radius * math.sin(math.radians(planet["Axial Tilt"])),
            center_y - planet_radius * math.cos(math.radians(planet["Axial Tilt"])),
            center_x + planet_radius * math.sin(math.radians(planet["Axial Tilt"])),
            center_y + planet_radius * math.cos(math.radians(planet["Axial Tilt"])),
        ),
        fill="white",
        width=2,
    )

    satellite_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    satellite_draw = ImageDraw.Draw(satellite_layer)

    if planet["Life Forms"] == "Intelligent Life":

        num_satellites = rng.randint(1, 5)
        for i in range(num_satellites):
            satellite_distance = planet_radius + rng.randint(20, 40)
            satellite_angle = rng.uniform(0, 2 * math.pi)
            satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
            satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

            num_dots = 50
            for j in range(num_dots):
                start_angle = 2 * math.pi * j / num_dots
                end_angle = 2 * math.pi * (j + 0.5) / num_dots  # 0.5 para dejar hueco
                start_x = center_x + satellite_distance * math.cos(start_angle)
                start_y = center_y + satellite_distance * math.sin(start_angle)
                end_x = center_x + satellite_distance * math.cos(end_angle)
                end_y = center_y + satellite_distance * math.sin(end_angle)
                satellite_draw.line(
                    (start_x, start_y, end_x, end_y), fill=(255, 255, 255, 100), width=1
                )

            satellite_draw.ellipse(
                (satellite_x - 2, satellite_y - 2, satellite_x + 2, satellite_y + 2),
                fill="white",
            )

    if planet["Life Forms"] == "Silicon-Based Life":
        num_crystals = rng.randint(2, 4)
        for i in range(num_crystals):
            crystal_distance = planet_radius + rng.randint(20, 60)
            crystal_angle = rng.uniform(0, 2 * math.pi)
            crystal_x = center_x + int(crystal_distance * math.cos(crystal_angle))
            crystal_y = center_y + int(crystal_distance * math.sin(crystal_angle))

            crystal_size = rng.randint(3, 9)
            satellite_draw.polygon(
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
            satellite_draw.ellipse(
                (
                    ring_x - debris_size,
                    ring_y - debris_size,
                    ring_x + debris_size,
                    ring_y + debris_size,
                ),
                fill="#121212",
            )

    if planet["Life Forms"] == "Non-Physical Entity":
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

        satellite_draw.bitmap((0, 0), plasma_ring_img, fill=None)

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
                fill=(255, 255, 255, 100),
            )

            wave_img = wave_img.filter(ImageFilter.GaussianBlur(radius=2))

            satellite_draw.bitmap((0, 0), wave_img, fill=None)

    if planet["Life Forms"] == "Robotic Entities":
        num_satellites = rng.randint(2, 4)
        for i in range(num_satellites):
            satellite_distance = planet_radius + rng.randint(30, 50)
            satellite_angle = rng.uniform(0, 2 * math.pi)
            satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
            satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

            satellite_size = rng.randint(5, 8)
            satellite_draw.polygon(
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
            satellite_draw.ellipse(
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
                satellite_draw.line(
                    (previous_drone_x, previous_drone_y, drone_x, drone_y),
                    fill="lightgray",
                    width=1,
                )
            drone_positions.append((drone_x, drone_y))

        ring_width = rng.randint(10, 15)
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

        satellite_draw.bitmap((0, 0), energy_ring_img, fill=None)

    if planet["Life Forms"] == "Conscious Gas":
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

            satellite_draw.bitmap((0, 0), cloud_img, fill=None)

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

            satellite_draw.bitmap((0, 0), belt_img, fill=None)

    if planet["Life Forms"] == "Have I just found God?":
        triangle_size = planet_radius * 0.5
        triangle_center_x = center_x
        triangle_center_y = center_y

        satellite_draw.polygon(
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
            satellite_draw.line(
                (triangle_center_x, triangle_center_y, ray_x, ray_y),
                fill="yellow",
                width=3,
            )

        halo_radius = planet_radius + 180
        halo_width = 15

        halo_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        halo_draw = ImageDraw.Draw(halo_img)

        halo_draw.ellipse(
            (
                center_x - halo_radius,
                center_y - halo_radius,
                center_x + halo_radius,
                center_y + halo_radius,
            ),
            outline=(255, 255, 0, 200),
            width=halo_width,
        )

        halo_img = halo_img.filter(ImageFilter.GaussianBlur(radius=10))

        satellite_draw.bitmap((0, 0), halo_img, fill=None)

        num_symbols = rng.randint(5, 10)
        for _ in range(num_symbols):
            symbol_size = rng.randint(10, 20)
            symbol_angle = rng.uniform(0, 2 * math.pi)
            symbol_distance = planet_radius + rng.randint(50, 100)
            symbol_x = center_x + int(symbol_distance * math.cos(symbol_angle))
            symbol_y = center_y + int(symbol_distance * math.sin(symbol_angle))

            symbol_type = rng.choice(["circle", "cross"])
            if symbol_type == "circle":
                satellite_draw.ellipse(
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
                satellite_draw.line(
                    (
                        symbol_x - symbol_size // 2,
                        symbol_y,
                        symbol_x + symbol_size // 2,
                        symbol_y,
                    ),
                    fill="yellow",
                    width=2,
                )
                satellite_draw.line(
                    (
                        symbol_x,
                        symbol_y - symbol_size // 2,
                        symbol_x,
                        symbol_y + symbol_size // 2,
                    ),
                    fill="yellow",
                    width=2,
                )

    image = Image.alpha_composite(image.convert("RGBA"), satellite_layer)

    image.paste(planet_surface, (0, 0), planet_surface)

    text_x = center_x
    text_y = center_y + planet_radius + 40
    draw = ImageDraw.Draw(image)
    draw.text(
        (text_x, text_y), spaced_planet_name, font=font, fill="white", anchor="mm"
    )

    return image


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
    separation = 50
    if solar_system.star_system_type == "single":
        star_positions.append((center_x, center_y))
    elif solar_system.star_system_type == "binary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
    elif solar_system.star_system_type == "tertiary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
        star_positions.append((center_x, center_y - separation))

    max_star_radius = 50
    for i, star in enumerate(solar_system.stars):
        star_x, star_y = star_positions[i]
        star_radius = min(int(15 * star["Radius Factor"]), max_star_radius)
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

    for i in range(1, num_planets + 1):
        planet = solar_system.get_planet(i - 1)
        if planet:

            spaced_planet_name = planet["Name"].replace("_", " ")

            relative_orbit_radius = planet["Orbital Radius"] / max(
                [p["Orbital Radius"] for p in solar_system.planets.values()]
            )
            orbit_radius = min_orbit_radius + int(
                relative_orbit_radius * (max_orbit_radius - min_orbit_radius)
            )

            eccentricity = random.uniform(0.0, 0.3) * (1 - relative_orbit_radius)

            semi_major_axis = orbit_radius
            semi_minor_axis = semi_major_axis * math.sqrt(1 - eccentricity**2)

            draw.ellipse(
                (
                    center_x - semi_major_axis,
                    center_y - semi_minor_axis,
                    center_x + semi_major_axis,
                    center_y + semi_minor_axis,
                ),
                outline="white",
                width=1,
            )

            angle_seed = hash((solar_system.seed, i))
            rng = random.Random(angle_seed)
            angle = rng.uniform(0, 2 * math.pi)
            planet_x = center_x + semi_major_axis * math.cos(angle)
            planet_y = center_y + semi_minor_axis * math.sin(angle)

            planet_color = {
                "Gas Giant": "orange",
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
            }.get(planet["Type"], "white")

            max_diameter = max([p["Diameter"] for p in solar_system.planets.values()])
            planet_radius = int(5 * (planet["Diameter"] / max_diameter))

            draw.ellipse(
                (
                    planet_x - planet_radius,
                    planet_y - planet_radius,
                    planet_x + planet_radius,
                    planet_y + planet_radius,
                ),
                fill=planet_color,
            )

            text_x = planet_x + planet_radius + 5
            text_y = planet_y - planet_radius / 2
            draw.text((text_x, text_y), spaced_planet_name, font=font, fill="white")

    return image


def generate_galaxy_image(galaxy):
    img_size = 800
    image = Image.new("RGBA", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    center_x = img_size // 2
    center_y = img_size // 2

    rng = random.Random(galaxy.seed)

    if galaxy.galaxy_type == "spiral":
        num_arms = 4
        arm_offset = 2 * math.pi / num_arms
        max_radius = img_size // 2
        spread = 0.15
        arm_tightness = 0.5
        core_density = 0.1

        num_points = 50000

        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)

        for i in range(int(num_points * core_density)):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius * 0.1, max_radius * 0.05)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            draw.point((x, y), fill="white")

        # Dibujar los brazos espirales
        for i in range(num_points):
            theta = arm_tightness * math.sqrt(i / num_points) * 2 * math.pi
            arm_angle = i % num_arms * arm_offset

            radius = max_radius * math.sqrt(i / num_points)
            x = (
                center_x
                + radius * math.cos(theta + arm_angle)
                + rng.uniform(-spread * radius, spread * radius)
            )
            y = (
                center_y
                + radius * math.sin(theta + arm_angle)
                + rng.uniform(-spread * radius, spread * radius)
            )

            draw.point((x, y), fill="white")

            if radius > max_radius * 0.6:
                mask_draw.point((x, y), fill="white")

        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=5))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "elliptical":
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

    elif galaxy.galaxy_type == "dwarf":
        max_radius = img_size // 3
        spread = 0.3

        for i in range(galaxy.num_systems // 100):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius / 2, spread * max_radius)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.ellipse((x, y, x + 1, y + 1), fill="white")

    black_hole_positions = []
    distance_threshold = 20

    for _ in range(galaxy.black_holes):
        x = rng.randint(center_x - 30, center_x + 30)
        y = rng.randint(center_y - 30, center_y + 30)

        grouped = False
        for i, (bx, by, size_offset) in enumerate(black_hole_positions):
            distance = math.sqrt((x - bx) ** 2 + (y - by) ** 2)
            if distance < distance_threshold:
                black_hole_positions[i] = (bx, by, size_offset + 1.5)
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

    return image
