# pymodules/image_utils.py

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps, ImageColor
from pymodules.__config import seed

import math
import random
import hashlib


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)


def generate_abstract_shape(
    draw, center_x, center_y, radius, color, global_seed, planet_name
):

    # Crear un generador de números aleatorios independiente
    planet_seed = consistent_hash(f"{global_seed}-{planet_name}")
    rng = random.Random(planet_seed)

    # Convertir el color a RGB si es una cadena de texto
    if isinstance(color, str):
        color = ImageColor.getrgb(color)

    # Aplicar transparencia del 50%
    color_with_alpha = color + (int(255 * 0.5),)

    # Generar un número aleatorio de puntos basado en el seed
    num_points = rng.randint(5, 250)
    points = []

    for i in range(num_points):
        # Usar el generador independiente para las operaciones
        angle = rng.uniform(0, 2 * math.pi)
        distance = rng.uniform(0.5 * radius, radius)
        x = center_x + distance * math.cos(angle) * 10
        y = center_y + distance * math.sin(angle) * 5
        points.append((x, y))

    temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_image)
    temp_draw.polygon(points, fill=color_with_alpha)

    blurred_image = temp_image.filter(ImageFilter.GaussianBlur(radius=5))

    draw.bitmap((0, 0), blurred_image, fill=None)


def generate_gradient(draw, center_x, center_y, planet_radius, base_color, seed):
    rng = random.Random(seed)
    gradient_img = Image.new(
        "RGBA", (2 * planet_radius, 2 * planet_radius), color=(0, 0, 0, 0)
    )
    gradient_draw = ImageDraw.Draw(gradient_img)

    for i in range(planet_radius):
        gradient_color = ImageColor.getrgb(base_color)
        # Gradiente con opacidad variable
        gradient_color = (*gradient_color, int(255 * (0.5 + 0.5 * i / planet_radius)))
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

    img_size = 800  # Tamaño de la imagen
    image = Image.new("RGB", (img_size, img_size), "black")
    planet_surface = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(planet_surface)

    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    rng = random.Random(seed)

    planet_radius = int(150 * (planet["Diameter"] / max(planet["Diameter"], 1)))

    planet_color_map = {
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
    }

    base_color = planet_color_map.get(planet["Type"], "white")

    # Generar el gradiente y pegarlo en la imagen principal
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

    # Dibujar los elementos abstractos en el planeta
    if planet["Type"] == "Gas Giant":
        # Bandas de nubes y tormentas
        num_cloud_bands = rng.randint(3, 6)
        for i in range(num_cloud_bands):
            band_width = planet_radius // 10
            band_offset = (i - num_cloud_bands // 2) * band_width * 2
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

    elif planet["Type"] == "Rocky":
        # Montañas y cráteres
        num_mountains = rng.randint(5, 10)
        for i in range(num_mountains):
            mountain_radius = rng.randint(10, 30)
            mountain_x = center_x + rng.randint(-planet_radius, planet_radius)
            mountain_y = center_y + rng.randint(-planet_radius, planet_radius)
            generate_abstract_shape(
                draw,
                mountain_x,
                mountain_y,
                mountain_radius,
                "gray",
                seed,
                spaced_planet_name + f"_mountain_{i}",
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

    elif planet["Type"] == "Icy":
        # Hielo y grietas
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
        if rng.random() < 0.5:
            crack_length = rng.randint(50, 100)
            crack_angle = rng.uniform(0, 2 * math.pi)
            crack_x1 = center_x + int(crack_length * math.cos(crack_angle))
            crack_y1 = center_y + int(crack_length * math.sin(crack_angle))
            crack_x2 = center_x + int(crack_length * math.cos(crack_angle + math.pi))
            crack_y2 = center_y + int(crack_length * math.sin(crack_angle + math.pi))
            draw.line((crack_x1, crack_y1, crack_x2, crack_y2), fill="white", width=2)

    elif planet["Type"] == "Oceanic":
        # Masas de agua y pequeños continentes
        num_islands = rng.randint(3, 7)
        for i in range(num_islands):
            island_radius = rng.randint(20, int(planet_radius * 0.5))
            max_offset = planet_radius - island_radius
            island_x = center_x + rng.randint(-max_offset, max_offset)
            island_y = center_y + rng.randint(-max_offset, max_offset)
            generate_abstract_shape(
                draw,
                island_x,
                island_y,
                island_radius,
                "brown",
                seed,
                spaced_planet_name + f"_island_{i}",
            )
        if rng.random() < 0.7:
            lake_radius = rng.randint(10, 30)
            lake_x = center_x + rng.randint(-planet_radius, planet_radius)
            lake_y = center_y + rng.randint(-planet_radius, planet_radius)
            generate_abstract_shape(
                draw,
                lake_x,
                lake_y,
                lake_radius,
                "blue",
                seed,
                spaced_planet_name + "_lake",
            )

    elif planet["Type"] == "Desert":
        # Dunas de arena y oasis
        num_dunes = rng.randint(5, 10)
        for i in range(num_dunes):
            dune_radius = rng.randint(20, 50)
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

    elif planet["Type"] == "Lava":
        # Flujos de lava y volcanes
        num_flows = rng.randint(5, 10)
        for i in range(num_flows):
            flow_length = rng.randint(20, int(planet_radius * 0.8))
            flow_angle = rng.uniform(0, 2 * math.pi)
            flow_x = center_x + int(flow_length * math.cos(flow_angle))
            flow_y = center_y + int(flow_length * math.sin(flow_angle))
            generate_abstract_shape(
                draw,
                flow_x,
                flow_y,
                rng.randint(5, 15),
                "red",
                seed,
                spaced_planet_name + f"_flow_{i}",
            )
        if rng.random() < 0.5:
            volcano_radius = rng.randint(20, 40)
            volcano_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
            volcano_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)
            generate_abstract_shape(
                draw,
                volcano_x,
                volcano_y,
                volcano_radius,
                "darkorange",
                seed,
                spaced_planet_name + f"_volcano_{i}",
            )

    elif planet["Type"] == "Arid":
        # Terreno árido con grietas
        num_cracks = rng.randint(5, 15)
        for i in range(num_cracks):
            crack_length = rng.randint(30, 60)
            crack_angle = rng.uniform(0, 2 * math.pi)
            crack_x1 = center_x + int(crack_length * math.cos(crack_angle))
            crack_y1 = center_y + int(crack_length * math.sin(crack_angle))
            crack_x2 = center_x + int(crack_length * math.cos(crack_angle + math.pi))
            crack_y2 = center_y + int(crack_length * math.sin(crack_angle + math.pi))
            draw.line((crack_x1, crack_y1, crack_x2, crack_y2), fill="brown", width=2)

    elif planet["Type"] == "Swamp":
        # Masas de tierra pantanosa y agua estancada
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
            if rng.random() < 0.6:
                water_radius = rng.randint(10, 20)
                generate_abstract_shape(
                    draw,
                    swamp_x,
                    swamp_y,
                    water_radius,
                    "blue",
                    seed,
                    spaced_planet_name + f"_water_{i}",
                )

    elif planet["Type"] == "Tundra":
        # Hielo y tundra
        num_tundra_areas = rng.randint(5, 10)
        for i in range(num_tundra_areas):
            tundra_radius = rng.randint(20, 50)
            max_offset = planet_radius - tundra_radius
            tundra_x = center_x + rng.randint(-max_offset, max_offset)
            tundra_y = center_y + rng.randint(-max_offset, max_offset)
            generate_abstract_shape(
                draw,
                tundra_x,
                tundra_y,
                tundra_radius,
                "aliceblue",
                seed,
                spaced_planet_name + f"_tundra_{i}",
            )

    elif planet["Type"] == "Forest":
        # Bosques y árboles
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
                "darkgreen",
                seed,
                spaced_planet_name + f"_forest_{i}",
            )
            if rng.random() < 0.6:
                tree_radius = rng.randint(5, 15)
                generate_abstract_shape(
                    draw,
                    forest_x,
                    forest_y,
                    tree_radius,
                    "green",
                    seed,
                    spaced_planet_name + f"_tree_{i}",
                )

    elif planet["Type"] == "Savannah":
        # Campos de hierba y árboles dispersos
        num_grass_areas = rng.randint(5, 10)
        for i in range(num_grass_areas):
            grass_radius = rng.randint(15, 40)
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
        num_trees = rng.randint(3, 7)
        for i in range(num_trees):
            tree_radius = rng.randint(5, 15)
            tree_x = center_x + rng.randint(-planet_radius, planet_radius)
            tree_y = center_y + rng.randint(-planet_radius, planet_radius)
            generate_abstract_shape(
                draw,
                tree_x,
                tree_y,
                tree_radius,
                "darkgreen",
                seed,
                spaced_planet_name + f"_tree_{i}",
            )

    elif planet["Type"] == "Cave":
        # Entradas de cuevas y cavernas
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

    elif planet["Type"] == "Crystalline":
        # Formaciones de cristales
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
            if rng.random() < 0.5:
                reflection_x = crystal_x + rng.randint(-5, 5)
                reflection_y = crystal_y - crystal_height + rng.randint(-5, 5)
                draw.ellipse(
                    (
                        reflection_x - 2,
                        reflection_y - 2,
                        reflection_x + 2,
                        reflection_y + 2,
                    ),
                    fill="white",
                )

    elif planet["Type"] == "Metallic":
        # Superficies metálicas y reflejos
        num_metal_areas = rng.randint(3, 6)
        for i in range(num_metal_areas):
            metal_radius = rng.randint(20, 50)
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

    elif planet["Type"] == "Toxic":
        # Nubes tóxicas y charcos
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

    elif planet["Type"] == "Radioactive":
        # Regiones radiactivas y brillantes
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

    elif planet["Type"] == "Magma":
        # Lagos de magma y flujos
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

    elif planet["Type"] == "Molten Core":
        # Núcleo fundido y cráteres
        num_core_spots = rng.randint(3, 6)
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

    elif planet["Type"] == "Carbon":
        # Depósitos de carbono y manchas oscuras
        num_deposits = rng.randint(5, 10)
        for i in range(num_deposits):
            deposit_radius = rng.randint(20, 40)
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

    elif planet["Type"] == "Diamond":
        # Superficies brillantes y cristales
        num_diamond_crystals = rng.randint(3, 6)
        for i in range(num_diamond_crystals):
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

    elif planet["Type"] == "Super Earth":
        # Tierras altas y masas de agua
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

    elif planet["Type"] == "Sub Earth":
        # Colinas y valles
        num_hills = rng.randint(5, 10)
        for i in range(num_hills):
            hill_radius = rng.randint(20, 50)
            max_offset = planet_radius - hill_radius
            hill_x = center_x + rng.randint(-max_offset, max_offset)
            hill_y = center_y + rng.randint(-max_offset, max_offset)
            generate_abstract_shape(
                draw,
                hill_x,
                hill_y,
                hill_radius,
                "darkgreen",
                seed,
                spaced_planet_name + f"_hill_{i}",
            )
        if rng.random() < 0.5:
            valley_radius = rng.randint(20, 50)
            valley_x = center_x + rng.randint(-planet_radius, planet_radius)
            valley_y = center_y + rng.randint(-planet_radius, planet_radius)
            generate_abstract_shape(
                draw,
                valley_x,
                valley_y,
                valley_radius,
                "green",
                seed,
                spaced_planet_name + "_valley",
            )

    elif planet["Type"] == "Frozen Gas Giant":
        # Bandas de hielo y tormentas heladas
        num_ice_bands = rng.randint(3, 6)
        for i in range(num_ice_bands):
            band_width = planet_radius // 10
            band_offset = (i - num_ice_bands // 2) * band_width * 2
            generate_abstract_shape(
                draw,
                center_x,
                center_y + band_offset,
                band_width,
                "lightblue",
                seed,
                spaced_planet_name + f"_iceband_{i}",
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
                "white",
                seed,
                spaced_planet_name + "_ice_storm",
            )

    elif planet["Type"] == "Nebulous":
        # Nubes y nebulosas
        num_nebulae = rng.randint(3, 6)
        for i in range(num_nebulae):
            nebula_radius = rng.randint(30, 60)
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

    elif planet["Type"] == "Aquifer":
        # Acuíferos subterráneos y pozos de agua
        num_aquifers = rng.randint(3, 6)
        for i in range(num_aquifers):
            aquifer_radius = rng.randint(20, 50)
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

    elif planet["Type"] == "Exotic":
        # Formas abstractas y colores inusuales
        num_exotic_shapes = rng.randint(4, 8)
        for i in range(num_exotic_shapes):
            exotic_radius = rng.randint(20, 50)
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

    # Aplicar una máscara para recortar lo que sobresalga del planeta
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

    # Añadir atmósfera si tiene
    if planet["Atmosphere"] != "None":
        atmosphere_type = planet["Atmosphere"]

        # Definir color y grosor según el tipo de atmósfera
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

        # Solo dibujar si hay atmósfera
        if atmosphere_color:
            # Crear una imagen separada para la atmósfera
            atmosphere_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            atmosphere_draw = ImageDraw.Draw(atmosphere_img)

            # Dibujar la atmósfera con un borde difuminado y opacidad
            atmosphere_draw.ellipse(
                (
                    center_x
                    - planet_radius
                    - atmosphere_width
                    - 5,  # Separar más del planeta
                    center_y - planet_radius - atmosphere_width - 5,
                    center_x + planet_radius + atmosphere_width + 5,
                    center_y + planet_radius + atmosphere_width + 5,
                ),
                outline=atmosphere_color,
                width=atmosphere_width,
            )

            # Aplicar un desenfoque gaussiano para suavizar la atmósfera
            atmosphere_img = atmosphere_img.filter(ImageFilter.GaussianBlur(radius=5))

            # Componer la atmósfera sobre la imagen del planeta
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

    # Crear una imagen separada para los satélites y sus órbitas
    satellite_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    satellite_draw = ImageDraw.Draw(satellite_layer)

    if planet["Life Forms"] == "Intelligent Life":
        # Crear un seed único para cada planeta basado en el seed global y el nombre del planeta
        planet_seed = f"{seed}-{planet['Name']}"
        rng = random.Random(
            consistent_hash(planet_seed)
        )  # Usar un hash consistente para el seed

        num_satellites = rng.randint(1, 5)
        for i in range(num_satellites):
            satellite_distance = planet_radius + rng.randint(20, 40)
            satellite_angle = rng.uniform(0, 2 * math.pi)
            satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
            satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

            # Dibujar la línea orbital punteada
            num_dots = 50  # Número de segmentos punteados
            for j in range(num_dots):
                start_angle = 2 * math.pi * j / num_dots
                end_angle = 2 * math.pi * (j + 0.5) / num_dots  # 0.5 para dejar hueco
                start_x = center_x + satellite_distance * math.cos(start_angle)
                start_y = center_y + satellite_distance * math.sin(start_angle)
                end_x = center_x + satellite_distance * math.cos(end_angle)
                end_y = center_y + satellite_distance * math.sin(end_angle)
                satellite_draw.line(
                    (start_x, start_y, end_x, end_y), fill=(255, 255, 255, 100), width=1
                )  # Opacidad baja

            # Dibujar el satélite
            satellite_draw.ellipse(
                (satellite_x - 2, satellite_y - 2, satellite_x + 2, satellite_y + 2),
                fill="white",
            )

    if planet["Life Forms"] == "Silicon-Based Life":
        # Crear un seed único para cada planeta basado en el seed global y el nombre del planeta
        planet_seed = f"{seed}-{planet['Name']}"
        rng = random.Random(
            consistent_hash(planet_seed)
        )  # Usar un hash consistente para el seed

        # Cristales flotantes
        num_crystals = rng.randint(2, 4)  # Aumentar el número de cristales
        for i in range(num_crystals):
            crystal_distance = planet_radius + rng.randint(20, 60)
            crystal_angle = rng.uniform(0, 2 * math.pi)
            crystal_x = center_x + int(crystal_distance * math.cos(crystal_angle))
            crystal_y = center_y + int(crystal_distance * math.sin(crystal_angle))

            # Dibujar el cristal flotante con mayor detalle
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

        # Anillo de escombros de silicio
        num_debris = rng.randint(10, 20)  # Variar el número de escombros
        for _ in range(num_debris):
            rad_angle = rng.uniform(0, 2 * math.pi)
            ring_distance = planet_radius + rng.randint(45, 60)
            ring_x = center_x + int(ring_distance * math.cos(rad_angle))
            ring_y = center_y + int(ring_distance * math.sin(rad_angle))

            # Dibujar escombros de silicio
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
        # Crear un seed único para cada planeta basado en el seed global y el nombre del planeta
        planet_seed = f"{seed}-{planet['Name']}"
        rng = random.Random(
            consistent_hash(planet_seed)
        )  # Usar un hash consistente para el seed

        # Cinturón de Plasma Fantasmal
        plasma_ring_width = rng.randint(10, 20)
        plasma_ring_radius = planet_radius + 30  # Ajustar según el tamaño del planeta

        # Crear una imagen temporal para el plasma ring
        plasma_ring_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        plasma_ring_draw = ImageDraw.Draw(plasma_ring_img)

        plasma_ring_draw.ellipse(
            (
                center_x - plasma_ring_radius,
                center_y - plasma_ring_radius,
                center_x + plasma_ring_radius,
                center_y + plasma_ring_radius,
            ),
            outline=(135, 206, 250, 150),  # Color azul claro con transparencia
            width=plasma_ring_width,
        )

        # Aplicar un desenfoque para crear el efecto fantasmal
        plasma_ring_img = plasma_ring_img.filter(ImageFilter.GaussianBlur(radius=5))

        # Pegar la imagen del plasma ring en la imagen principal
        satellite_draw.bitmap((0, 0), plasma_ring_img, fill=None)

        # Ondas de Distorsión Gravitacional
        num_waves = rng.randint(3, 5)
        wave_radius_start = planet_radius + 50

        for i in range(num_waves):
            wave_radius = wave_radius_start + i * 10  # Cada onda es un poco más lejos

            # Crear una imagen temporal para cada onda
            wave_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            wave_draw = ImageDraw.Draw(wave_img)

            wave_draw.arc(
                [
                    (center_x - wave_radius, center_y - wave_radius),
                    (center_x + wave_radius, center_y + wave_radius),
                ],
                start=rng.randint(0, 360),
                end=rng.randint(180, 360),
                fill=(255, 255, 255, 100),  # Color blanco con baja opacidad
            )

            # Aplicar un leve desenfoque para suavizar la onda
            wave_img = wave_img.filter(ImageFilter.GaussianBlur(radius=2))

            # Pegar la imagen de la onda en la imagen principal
            satellite_draw.bitmap((0, 0), wave_img, fill=None)

    if planet["Life Forms"] == "Robotic Entities":
        # Crear un seed único para cada planeta basado en el seed global y el nombre del planeta
        planet_seed = f"{seed}-{planet['Name']}"
        rng = random.Random(
            consistent_hash(planet_seed)
        )  # Usar un hash consistente para el seed

        # Satélites de Control y Vigilancia
        num_satellites = rng.randint(2, 4)
        for i in range(num_satellites):
            satellite_distance = planet_radius + rng.randint(30, 50)
            satellite_angle = rng.uniform(0, 2 * math.pi)
            satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
            satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))

            # Dibujar el satélite de forma geométrica
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

        # Red de Drones Industriales
        drone_positions = []  # Asegúrate de inicializar esta lista antes de usarla
        num_drones = rng.randint(10, 20)
        for i in range(num_drones):
            drone_distance = planet_radius + rng.randint(60, 80)
            drone_angle = rng.uniform(0, 2 * math.pi)
            drone_x = center_x + int(drone_distance * math.cos(drone_angle))
            drone_y = center_y + int(drone_distance * math.sin(drone_angle))

            # Dibujar el dron como un pequeño punto con líneas que los conectan
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

            # Dibujar líneas conectando drones cercanos
            if i > 0:
                previous_drone_x, previous_drone_y = drone_positions[-1]
                satellite_draw.line(
                    (previous_drone_x, previous_drone_y, drone_x, drone_y),
                    fill="lightgray",
                    width=1,
                )
            drone_positions.append((drone_x, drone_y))

        # Anillo de Energía o Transmisión
        ring_width = rng.randint(10, 15)
        ring_radius = planet_radius + 100

        # Crear una imagen temporal para el anillo
        energy_ring_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        energy_ring_draw = ImageDraw.Draw(energy_ring_img)

        energy_ring_draw.ellipse(
            (
                center_x - ring_radius,
                center_y - ring_radius,
                center_x + ring_radius,
                center_y + ring_radius,
            ),
            outline=(0, 255, 0, 150),  # Verde brillante para sugerir energía
            width=ring_width,
        )

        # Aplicar un desenfoque para simular energía
        energy_ring_img = energy_ring_img.filter(ImageFilter.GaussianBlur(radius=3))

        # Pegar la imagen del anillo de energía en la imagen principal
        satellite_draw.bitmap((0, 0), energy_ring_img, fill=None)

    if planet["Life Forms"] == "Conscious Gas":
        rng = random.Random(consistent_hash(f"{seed}-{planet['Name']}"))

        # Nubes Luminosas en Movimiento
        num_clouds = rng.randint(3, 6)
        for _ in range(num_clouds):
            cloud_distance = planet_radius + rng.randint(30, 50)
            cloud_angle = rng.uniform(0, 2 * math.pi)
            cloud_x = center_x + int(cloud_distance * math.cos(cloud_angle))
            cloud_y = center_y + int(cloud_distance * math.sin(cloud_angle))

            # Crear la nube luminosa
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

            # Aplicar desenfoque para suavizar la nube
            cloud_img = cloud_img.filter(ImageFilter.GaussianBlur(radius=5))

            # Pegar la imagen de la nube en la imagen principal
            satellite_draw.bitmap((0, 0), cloud_img, fill=None)

        # Cinturones de Energía Fluctuante
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

            # Aplicar un leve desenfoque para crear un efecto de energía fluctuante
            belt_img = belt_img.filter(ImageFilter.GaussianBlur(radius=3))

            # Pegar la imagen del cinturón en la imagen principal
            satellite_draw.bitmap((0, 0), belt_img, fill=None)

    if planet["Life Forms"] == "Have I just found God?":
        rng = random.Random(consistent_hash(f"{seed}-{planet['Name']}"))

        # Triángulo central (sin ojo)
        triangle_size = (
            planet_radius * 0.5
        )  # Ajustar el tamaño del triángulo basado en el radio del planeta
        triangle_center_x = center_x
        triangle_center_y = center_y

        # Dibujar el triángulo centrado dentro del planeta
        satellite_draw.polygon(
            [
                (triangle_center_x, triangle_center_y - triangle_size),
                (triangle_center_x - triangle_size, triangle_center_y + triangle_size),
                (triangle_center_x + triangle_size, triangle_center_y + triangle_size),
            ],
            outline="yellow",
            width=4,  # Borde definido
        )

        # Añadir rayos dorados variables alrededor del triángulo
        num_rays = rng.randint(10, 20)  # Variar el número de rayos
        for i in range(num_rays):
            angle = math.radians(
                i * (360 / num_rays) + rng.uniform(-10, 10)
            )  # Añadir un ligero desfase aleatorio
            ray_length = triangle_size + rng.randint(30, 60)  # Longitud variable
            ray_x = triangle_center_x + int(ray_length * math.cos(angle))
            ray_y = triangle_center_y + int(ray_length * math.sin(angle))
            satellite_draw.line(
                (triangle_center_x, triangle_center_y, ray_x, ray_y),
                fill="yellow",
                width=3,  # Rayos gruesos y definidos
            )

        # Anillo de Luz Dorada Ampliado
        halo_radius = planet_radius + 180  # Halo 3 veces más grande
        halo_width = 15  # Ancho del halo más grande

        # Crear una imagen temporal para el anillo de luz
        halo_img = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
        halo_draw = ImageDraw.Draw(halo_img)

        halo_draw.ellipse(
            (
                center_x - halo_radius,
                center_y - halo_radius,
                center_x + halo_radius,
                center_y + halo_radius,
            ),
            outline=(255, 255, 0, 200),  # Amarillo más intenso
            width=halo_width,
        )

        # Aplicar un desenfoque ligero para suavizar el halo
        halo_img = halo_img.filter(ImageFilter.GaussianBlur(radius=10))

        # Pegar la imagen del halo en la imagen principal
        satellite_draw.bitmap((0, 0), halo_img, fill=None)

        # Variabilidad adicional: añadir pequeños símbolos aleatorios alrededor del planeta
        num_symbols = rng.randint(5, 10)
        for _ in range(num_symbols):
            symbol_size = rng.randint(10, 20)
            symbol_angle = rng.uniform(0, 2 * math.pi)
            symbol_distance = planet_radius + rng.randint(50, 100)
            symbol_x = center_x + int(symbol_distance * math.cos(symbol_angle))
            symbol_y = center_y + int(symbol_distance * math.sin(symbol_angle))

            # Dibujar un símbolo simple como un círculo o cruz
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

    # Pegar la capa de satélites sobre la imagen principal
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

    img_size = 800  # Tamaño de la imagen para acomodar órbitas más grandes
    image = Image.new("RGB", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    # Configuración para estrellas
    star_positions = []
    separation = 50  # Mayor separación entre estrellas en binarios/terciarios
    if solar_system.star_system_type == "single":
        star_positions.append((center_x, center_y))
    elif solar_system.star_system_type == "binary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
    elif solar_system.star_system_type == "tertiary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
        star_positions.append((center_x, center_y - separation))

    # Dibujar las estrellas con un tamaño máximo limitado
    max_star_radius = 50  # Tamaño máximo de la estrella
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
    min_orbit_radius = star_radius * 2 + 50  # Separación inicial desde la estrella
    max_orbit_radius = img_size // 2 - 50  # Tamaño máximo de la órbita

    for i in range(1, num_planets + 1):
        planet = solar_system.get_planet(i - 1)
        if planet:

            spaced_planet_name = planet["Name"].replace("_", " ")

            # Determinar el radio orbital usando la constante física
            relative_orbit_radius = planet["Orbital Radius"] / max(
                [p["Orbital Radius"] for p in solar_system.planets.values()]
            )
            orbit_radius = min_orbit_radius + int(
                relative_orbit_radius * (max_orbit_radius - min_orbit_radius)
            )

            # Ajustar la excentricidad de la órbita (debe ser menor para planetas interiores)
            eccentricity = random.uniform(0.0, 0.3) * (1 - relative_orbit_radius)

            # Calcular los semiejes mayor y menor de la órbita
            semi_major_axis = orbit_radius
            semi_minor_axis = semi_major_axis * math.sqrt(1 - eccentricity**2)

            # Dibujar la órbita como una elipse
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

            # Determinar la posición del planeta en la órbita usando la velocidad orbital
            # Cambiar el uso de random.uniform por un ángulo calculado con una semilla consistente
            angle_seed = hash((solar_system.seed, i))
            rng = random.Random(angle_seed)
            angle = rng.uniform(0, 2 * math.pi)
            planet_x = center_x + semi_major_axis * math.cos(angle)
            planet_y = center_y + semi_minor_axis * math.sin(angle)

            # Determinar el color del planeta según su tipo
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

            # Ajustar el tamaño del planeta según su diámetro y características
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
    image = Image.new(
        "RGBA", (img_size, img_size), "black"
    )  # Imagen con fondo transparente
    draw = ImageDraw.Draw(image)

    center_x = img_size // 2
    center_y = img_size // 2

    # Inicializa un generador de números aleatorios con la semilla de la galaxia
    rng = random.Random(galaxy.seed)

    if galaxy.galaxy_type == "spiral":
        num_arms = 4
        arm_offset = 2 * math.pi / num_arms
        max_radius = img_size // 2
        spread = 0.15
        arm_tightness = 0.5
        core_density = 0.1

        num_points = 50000

        # Crear una máscara para aplicar desenfoque en las áreas externas
        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)

        # Dibujar el núcleo con alta densidad
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

            # Dibujar la estrella
            draw.point((x, y), fill="white")

            # Agregar desenfoque progresivo a las partes externas
            if (
                radius > max_radius * 0.6
            ):  # Aplicar desenfoque solo en las áreas externas
                mask_draw.point((x, y), fill="white")

        # Aplicar desenfoque ligero a las partes externas usando la máscara
        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=5))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "elliptical":
        num_points = 100000  # Representar con 1000 sistemas máximo
        for _ in range(num_points):
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(img_size // 4, img_size // 8)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.point((x, y), fill="white")

        # Crear una máscara para aplicar desenfoque solo en las partes externas
        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        outer_radius = img_size // 2
        inner_radius = img_size // 3

        # Dibujar un gradiente radial en la máscara
        for r in range(inner_radius, outer_radius):
            alpha = int(255 * (r - inner_radius) / (outer_radius - inner_radius))
            mask_draw.ellipse(
                (center_x - r, center_y - r, center_x + r, center_y + r),
                outline=alpha,
                width=2,
            )

        # Aplicar desenfoque solo a las áreas externas usando la máscara
        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=10))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "dwarf":
        # Ajuste para galaxias enanas
        max_radius = img_size // 3  # Tamaño más pequeño, dispersión moderada
        spread = 0.3

        for i in range(
            galaxy.num_systems // 100
        ):  # Representar con 100 veces menos densidad
            angle = rng.uniform(0, 2 * math.pi)
            radius = rng.gauss(max_radius / 2, spread * max_radius)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.ellipse((x, y, x + 1, y + 1), fill="white")

    # Dibuja agujeros negros agrupados
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

    # Crear una capa temporal para púlsares y cuásares
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

        # Dibujar el núcleo brillante del cuásar
        pulsars_quasars_draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill="white")

        # Dibujar el halo alrededor del cuásar
        for i in range(5):
            alpha = int(255 * (0.5 - i * 0.1))  # Opacidad decreciente
            size = 7 + i * 2  # Aumentar el tamaño en 2px por capa
            temp_image = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
            temp_draw = ImageDraw.Draw(temp_image)
            temp_draw.ellipse(
                (x - size, y - size, x + size, y + size),
                fill=(255, 0, 0, alpha),  # Rojo con transparencia
            )
            image = Image.alpha_composite(image, temp_image)

        # Dibujar rayos de radiación que salen del cuásar
        pulsars_quasars_draw.line(
            (x - 10, y, x + 10, y), fill="yellow", width=2
        )  # Rayo horizontal
        pulsars_quasars_draw.line(
            (x, y - 10, x, y + 10), fill="yellow", width=2
        )  # Rayo vertical

    # Componer la capa de púlsares y cuásares sobre la imagen principal
    image = Image.alpha_composite(image, pulsars_quasars_layer)

    return image


# Assisted by GPT4o yoo!
