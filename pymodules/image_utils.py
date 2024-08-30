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

from pymodules.__image_utils_life_forms import (
    draw_intelligent_life,
    draw_silicon_based_life,
    draw_non_physical_entity,
    draw_robotic_entities,
    draw_conscious_gas,
    draw_god,
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

    draw_life_functions = {
        "Intelligent Life": draw_intelligent_life,
        "Silicon-Based Life": draw_silicon_based_life,
        "Non-Physical Entity": draw_non_physical_entity,
        "Robotic Entities": draw_robotic_entities,
        "Conscious Gas": draw_conscious_gas,
        "Have I just found God?": draw_god,
    }

    life_form_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    life_form_draw = ImageDraw.Draw(life_form_layer)

    life_form_type = planet.get("Life Forms")

    if life_form_type in draw_life_functions:
        draw_life_functions[life_form_type](
            life_form_draw,
            center_x,
            center_y,
            planet_radius,
            rng,
            seed,
            spaced_planet_name,
            img_size,
        )

    image = Image.alpha_composite(image.convert("RGBA"), life_form_layer)

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

        # Dibujar los brazos espirales con rotación
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

    return image
