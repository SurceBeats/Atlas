# pymodules/__drawer_class_planet.py

import math
import random
import time

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from pymodules.__atlas_config import config
from pymodules.__atlas_seedmaster import consistent_hash
from pymodules.__atlas_fixed_vars import VISUAL_DEBUG

from pymodules.__drawer_watermark import generate_watermark
from pymodules.__drawer_cplanet_depth import (
    generate_rndback,
    depth_gradient,
    soft_polar_transform,
)
from pymodules.__drawer_cplanet_rings import draw_full_ring, draw_ontop_ring
from pymodules.__drawer_cplanet_type import (
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
from pymodules.__drawer_cplanet_life import (
    draw_intelligent_life,
    draw_silicon_based_life,
    draw_non_physical_entity,
    draw_robotic_entities,
    draw_conscious_gas,
    draw_god,
)


def generate_planet_image(planet):
    spaced_planet_name = planet.name.replace("_", " ")
    planet_type = planet.planet_type.replace("_", " ")

    img_size = 800
    image = Image.new("RGBA", (img_size, img_size), "black")

    planet_surface = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(planet_surface)

    center_x = img_size // 2
    center_y = img_size // 2

    current_time = time.time()
    time_elapsed_seconds = current_time - config.cosmic_origin_time

    angle_velocity_rotation = 2 * math.pi / planet.rotation_period_seconds
    angle_rotation = (
        planet.initial_angle_rotation + time_elapsed_seconds * angle_velocity_rotation
    ) % (2 * math.pi)

    angle_velocity_orbit = 2 * math.pi / planet.orbital_period_seconds
    orbital_angle = (
        planet.initial_orbital_angle + time_elapsed_seconds * angle_velocity_orbit
    ) % (2 * math.pi)

    tilt_factor = math.sin(math.radians(planet.axial_tilt))
    shape_seed = consistent_hash(
        f"{config.seed}-{spaced_planet_name}-{planet_type}-{planet.diameter}-{planet.density}-{planet.gravity}-_safe_shaper"
    )
    planet_radius = int(200 * (planet.diameter / max(planet.diameter, 1)))

    rng = random.Random(shape_seed)

    planet_color_map = get_planet_color_map()
    base_color = planet_color_map.get(planet.planet_type, "white")

    rndback = generate_rndback(planet_radius, base_color, seed=shape_seed)

    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font = ImageFont.load_default()

    planet_surface.paste(
        rndback, (center_x - planet_radius, center_y - planet_radius), rndback
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

    surface_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    surface_draw = ImageDraw.Draw(surface_layer)

    if planet_type in draw_functions:
        draw_functions[planet_type](
            surface_draw,
            center_x,
            center_y,
            planet_radius,
            rng,
            config.seed,
            spaced_planet_name,
        )
    else:
        raise ValueError(f"Unknown planet type: {planet_type}")

    planet_surface = Image.alpha_composite(planet_surface, surface_layer)

    planet_surface_rotated = planet_surface.rotate(
        -math.degrees(angle_rotation),
        resample=Image.BICUBIC,
        center=(center_x, center_y),
    )

    image.paste(planet_surface_rotated, (0, 0), planet_surface_rotated)

    image = soft_polar_transform(image, scale_factor=0.85, depth_factor=0.70)

    depth_gradient(image, planet_radius, img_size, orbital_angle)

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

    image_with_black_background = Image.new("RGBA", (img_size, img_size), "black")
    image = Image.composite(image, image_with_black_background, mask)

    ring_inner_radius = planet_radius + rng.randint(120, 160)
    ring_outer_radius = ring_inner_radius + rng.randint(20, 40)

    if planet.planet_rings:
        draw_full_ring(
            image,
            center_x,
            center_y,
            planet_radius,
            ring_inner_radius,
            ring_outer_radius,
            rng,
            tilt_factor=tilt_factor,
            rotation_angle=angle_rotation,
        )

    if planet.atmosphere != "None":
        atmosphere_type = planet.atmosphere

        if atmosphere_type == "Breathable":
            atmosphere_color = (144, 238, 144, 150)  # lightgreen con opacidad
            atmosphere_width = 13
        elif atmosphere_type == "Thick":
            atmosphere_color = (169, 169, 169, 200)  # gray con opacidad
            atmosphere_width = 17
        elif atmosphere_type == "Thin":
            atmosphere_color = (211, 211, 211, 100)  # lightgray con opacidad
            atmosphere_width = 11
        elif atmosphere_type == "Carbon Dioxide":
            atmosphere_color = (165, 42, 42, 150)  # brown con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Methane":
            atmosphere_color = (0, 0, 139, 150)  # darkblue con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Nitrogen":
            atmosphere_color = (0, 0, 255, 150)  # blue con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Oxygen-Rich":
            atmosphere_color = (255, 255, 255, 150)  # white con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Sulfur Dioxide":
            atmosphere_color = (255, 255, 0, 150)  # yellow con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Superheated":
            atmosphere_color = (255, 0, 0, 200)  # red con opacidad
            atmosphere_width = 18
        elif atmosphere_type == "Acidic":
            atmosphere_color = (0, 100, 0, 150)  # darkgreen con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Toxic":
            atmosphere_color = (128, 0, 128, 150)  # purple con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Hydrogen":
            atmosphere_color = (255, 182, 193, 150)  # lightpink con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Helium":
            atmosphere_color = (255, 255, 224, 150)  # lightyellow con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Ammonia":
            atmosphere_color = (240, 230, 140, 150)  # khaki con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Ionic":
            atmosphere_color = (0, 191, 255, 150)  # deepskyblue con opacidad
            atmosphere_width = 18
        elif atmosphere_type == "Plasma":
            atmosphere_color = (255, 105, 180, 200)  # hotpink con opacidad
            atmosphere_width = 18
        elif atmosphere_type == "Exotic Gases":
            atmosphere_color = (186, 85, 211, 150)  # mediumorchid con opacidad
            atmosphere_width = 18
        elif atmosphere_type == "Water Vapor":
            atmosphere_color = (173, 216, 230, 150)  # lightblue con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "Frozen":
            atmosphere_color = (240, 248, 255, 150)  # aliceblue con opacidad
            atmosphere_width = 15
        elif atmosphere_type == "None":
            atmosphere_width = 0
            atmosphere_color = None
        else:
            atmosphere_color = (169, 169, 169, 150)  # gray con opacidad por defecto
            atmosphere_width = 15

        if atmosphere_color:
            atmosphere_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            atmosphere_draw = ImageDraw.Draw(atmosphere_img)

            atmosphere_draw.ellipse(
                (
                    center_x - planet_radius - atmosphere_width - 5,
                    center_y - planet_radius - atmosphere_width - 5,
                    center_x + planet_radius + atmosphere_width + 5,
                    center_y + planet_radius + atmosphere_width + 5,
                ),
                outline=atmosphere_color,
                width=atmosphere_width,
            )

            atmosphere_img = atmosphere_img.filter(ImageFilter.GaussianBlur(radius=5))

            image.paste(atmosphere_img, (0, 0), atmosphere_img)

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

    life_form_type = planet.life_forms

    if life_form_type in draw_life_functions:
        draw_life_functions[life_form_type](
            life_form_draw,
            center_x,
            center_y,
            planet_radius,
            rng,
            config.seed,
            spaced_planet_name,
            img_size,
        )

    image = Image.alpha_composite(image.convert("RGBA"), life_form_layer)

    if planet.planet_rings:
        draw_ontop_ring(
            image,
            center_x,
            center_y,
            ring_inner_radius,
            ring_outer_radius,
            rng,
            tilt_factor=tilt_factor,
            rotation_angle=angle_rotation,
        )

    if VISUAL_DEBUG:
        draw_main = ImageDraw.Draw(image)
        line_x1 = center_x + planet_radius * math.cos(angle_rotation) / 64
        line_y1 = center_y + planet_radius * math.sin(angle_rotation) / 64
        line_x2 = center_x - planet_radius * math.cos(angle_rotation)
        line_y2 = center_y - planet_radius * math.sin(angle_rotation)
        draw_main.line(
            (line_x1, line_y1, line_x2, line_y2), fill=(138, 138, 138), width=2
        )

    text_x = center_x
    text_y = center_y + planet_radius + 60
    draw = ImageDraw.Draw(image)
    draw.text(
        (text_x, text_y), spaced_planet_name, font=font, fill="white", anchor="mm"
    )

    generate_watermark(image)

    return image
