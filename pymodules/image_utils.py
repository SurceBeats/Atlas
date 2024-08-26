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
    color_with_alpha = color + (int(255 * 0.37),)

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

    blurred_image = temp_image.filter(ImageFilter.GaussianBlur(radius=6))

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
    planet_type = planet["Type"].replace("_", " ")
    planet_diam = planet["Diameter"]
    planet_dens = planet["Density"]
    planet_grav = planet["Gravity"]

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

    shape_seed = consistent_hash(f"{seed}-{spaced_planet_name}-{planet_type}-{planet_diam}-{planet_dens}-{planet_grav}-_safe_shaper")
    rng = random.Random(shape_seed)

    planet_radius = int(150 * (planet["Diameter"] / max(planet["Diameter"], 1)))

    planet_color_map = {
        "Gas Giant": "orange",
        "Rocky": "gray",
        "Icy": "lightblue",
        "Anomaly": "white",
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

    elif planet["Type"] == "Anomaly":
        # Generar patrones caóticos y colores anómalos de manera consistente
        num_anomalies = 1  # Número fijo de anomalías para consistencia
        for i in range(num_anomalies):
            anomaly_radius = 100  # Radio fijo para consistencia
            anomaly_x = center_x + rng.randint(-planet_radius, planet_radius)
            anomaly_y = center_y + rng.randint(-planet_radius, planet_radius)
            anomaly_color = "purple"  # Color fijo para consistencia
            generate_abstract_shape(
                draw,
                anomaly_x,
                anomaly_y,
                anomaly_radius,
                anomaly_color,
                seed,
                spaced_planet_name + f"_anomaly_{i}",
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
            crack_length = rng.randint(100, 130)
            crack_angle = rng.uniform(6, 45 * math.pi)

            # Crear múltiples líneas a partir del centro con ligeras variaciones en el ángulo
            num_cracks = rng.randint(3, 12)  # Número de grietas
            for _ in range(num_cracks):
                angle_variation = rng.uniform(-1, 1)  # Variación de hasta ±0.5 radianes
                adjusted_angle = crack_angle + angle_variation

                crack_x1 = center_x + int(crack_length * math.cos(adjusted_angle))
                crack_y1 = center_y + int(crack_length * math.sin(adjusted_angle))
                crack_x2 = center_x + int(
                    crack_length * math.cos(adjusted_angle + math.pi)
                )
                crack_y2 = center_y + int(
                    crack_length * math.sin(adjusted_angle + math.pi)
                )

                draw.line(
                    (crack_x1, crack_y1, crack_x2, crack_y2), fill="white", width=1
                )

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
            lake_radius = rng.randint(50, 150)
            lake_x = center_x + rng.randint(-planet_radius, planet_radius)
            lake_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar el lago como un círculo sólido
            draw.ellipse(
                (
                    lake_x - lake_radius,
                    lake_y - lake_radius,
                    lake_x + lake_radius,
                    lake_y + lake_radius,
                ),
                fill="darkblue",
                outline="blue",
            )

    elif planet["Type"] == "Desert":
        # Crear una textura de fondo para simular arena
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
        # Dunas de arena y oasis
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

    elif planet["Type"] == "Lava":
        # Flujos de lava curvos
        num_flows = rng.randint(2, 8)
        for i in range(num_flows):
            flow_length = rng.randint(1, int(planet_radius * 2))
            flow_width = rng.randint(1, 20)
            flow_angle = rng.uniform(0, 6 * math.pi)

            # Generar puntos para una trayectoria curva
            num_points = rng.randint(1, 5)
            points = []
            for j in range(num_points):
                angle = flow_angle + rng.uniform(-0.5, 0.5)
                distance = flow_length * (j / num_points)
                x = center_x + int(distance * math.cos(angle))
                y = center_y + int(distance * math.sin(angle))
                points.append((x, y))

            draw.line(points, fill="orangered", width=flow_width)

        # Efecto de brillo en la lava
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
                fill=(255, 69, 0, 50),  # Naranja incandescente con transparencia
            )

        if rng.random() < 0.2:
            # Textura de roca fundida
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

    elif planet["Type"] == "Arid":
        # Crear grietas ramificadas
        num_cracks = rng.randint(10, 50)
        for _ in range(num_cracks):
            crack_length = rng.randint(10, 100)
            crack_angle = rng.uniform(0, 2 * math.pi)
            crack_x = center_x + rng.randint(-planet_radius, planet_radius)
            crack_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar la grieta inicial
            points = [(crack_x, crack_y)]
            for _ in range(5):
                angle_variation = rng.uniform(-math.pi / 4, math.pi / 4)
                adjusted_angle = crack_angle + angle_variation
                next_x = points[-1][0] + int(crack_length * math.cos(adjusted_angle))
                next_y = points[-1][1] + int(crack_length * math.sin(adjusted_angle))
                points.append((next_x, next_y))
                crack_length *= 0.7

            draw.line(points, fill="crimson", width=rng.randint(1, 5))

        # Dunas o montículos de arena
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
            # Añadir charcos o lagunas de agua estancada
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

                    # Dibujar el agua estancada con un azul oscuro
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

    elif planet["Type"] == "Tundra":
        # Grietas en el hielo
        num_cracks = rng.randint(1, 6)
        for _ in range(num_cracks):
            crack_length = rng.randint(30, 60)
            crack_angle = rng.uniform(0, 2 * math.pi)
            crack_x1 = center_x + rng.randint(-planet_radius, planet_radius)
            crack_y1 = center_y + rng.randint(-planet_radius, planet_radius)
            crack_x2 = crack_x1 + int(crack_length * math.cos(crack_angle))
            crack_y2 = crack_y1 + int(crack_length * math.sin(crack_angle))

            # Dibujar la grieta con un color blanco azulado
            draw.line(
                (crack_x1, crack_y1, crack_x2, crack_y2), fill="lightblue", width=10
            )

        # Efecto de viento
        num_wind_lines = rng.randint(5, 20)
        for _ in range(num_wind_lines):
            line_length = rng.randint(2, 15)
            start_x = center_x + rng.randint(-planet_radius, planet_radius)
            start_y = center_y + rng.randint(-planet_radius, planet_radius)
            angle = rng.uniform(-math.pi / 8, math.pi / 8)
            end_x = start_x + int(line_length * math.cos(angle))
            end_y = start_y + int(line_length * math.sin(angle))

            # Dibujar la línea de viento
            draw.line((start_x, start_y, end_x, end_y), fill="white", width=1)

        # Áreas de nieve
        num_snow_areas = rng.randint(3, 6)
        for _ in range(num_snow_areas):
            snow_radius = rng.randint(1, 4)
            snow_x = center_x + rng.randint(-planet_radius, planet_radius)
            snow_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar un área de nieve
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

        # Áreas de tundra con formas orgánicas
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

    elif planet["Type"] == "Forest":
        # Dibujar regiones de bosque usando pequeños puntos verdes
        num_forest_regions = rng.randint(5, 10)
        for i in range(num_forest_regions):
            forest_radius = rng.randint(
                20, 80
            )  # Radio más grande para la región del bosque
            max_offset = planet_radius - forest_radius
            forest_x = center_x + rng.randint(-max_offset, max_offset)
            forest_y = center_y + rng.randint(-max_offset, max_offset)

            # Generar puntos dentro de la región del bosque
            num_points = rng.randint(
                100, 600
            )  # Número de puntos para simular densidad del bosque
            points = []
            for _ in range(num_points):
                angle = rng.uniform(0, 2 * math.pi)
                distance = rng.uniform(0, forest_radius)
                x = forest_x + int(distance * math.cos(angle))
                y = forest_y + int(distance * math.sin(angle))
                points.append((x, y))

            # Dibujar los puntos verdes
            for point in points:
                draw.point(point, fill="darkgreen")

        # Añadir algunas formas abstractas más grandes para representar grandes áreas de bosque
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

    elif planet["Type"] == "Savannah":
        # Áreas de hierba dispersa
        num_grass_clusters = rng.randint(5, 10)
        for i in range(num_grass_clusters):
            grass_cluster_radius = rng.randint(
                20, 50
            )  # Tamaño más grande para las áreas de hierba
            max_offset = planet_radius - grass_cluster_radius
            grass_cluster_x = center_x + rng.randint(-max_offset, max_offset)
            grass_cluster_y = center_y + rng.randint(-max_offset, max_offset)

            # Generar puntos dentro de la región de hierba
            num_points = rng.randint(
                100, 300
            )  # Puntos para simular la vegetación dispersa
            points = []
            for _ in range(num_points):
                angle = rng.uniform(0, 2 * math.pi)
                distance = rng.uniform(0, grass_cluster_radius)
                x = grass_cluster_x + int(distance * math.cos(angle))
                y = grass_cluster_y + int(distance * math.sin(angle))
                points.append((x, y))

            # Dibujar los puntos verdes dispersos
            for point in points:
                draw.point(point, fill="brown")

        # Campos de hierba y árboles dispersos
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

    elif planet["Type"] == "Cave":
        # Grietas en el suelo
        if rng.random() < 0.5:
            num_cracks = rng.randint(1, 3)
            for i in range(num_cracks):
                crack_length = rng.randint(150, 250)
                crack_angle = rng.uniform(0, 2 * math.pi)
                crack_x1 = center_x + rng.randint(-planet_radius, planet_radius)
                crack_y1 = center_y + rng.randint(-planet_radius, planet_radius)
                crack_x2 = crack_x1 + int(crack_length * math.cos(crack_angle))
                crack_y2 = crack_y1 + int(crack_length * math.sin(crack_angle))

                # Dibujar grietas finas y oscuras
                draw.line(
                    (crack_x1, crack_y1, crack_x2, crack_y2), fill="black", width=1
                )

        # Sombras alrededor de las entradas de las cuevas
        num_shadows = rng.randint(3, 7)
        for i in range(num_shadows):
            shadow_radius = rng.randint(5, 15)
            shadow_x = center_x + rng.randint(-planet_radius, planet_radius)
            shadow_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar sombras difusas
            draw.ellipse(
                (
                    shadow_x - shadow_radius,
                    shadow_y - shadow_radius,
                    shadow_x + shadow_radius,
                    shadow_y + shadow_radius,
                ),
                fill=(0, 0, 0, 100),  # Sombra semi-transparente
            )

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

        # Agregar áreas de brillo generalizadas sobre el planeta
        num_bright_areas = rng.randint(30, 250)
        for _ in range(num_bright_areas):
            bright_radius = rng.randint(10, 15)
            bright_x = center_x + rng.randint(-planet_radius, planet_radius)
            bright_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Generar puntos para crear una forma irregular de brillo
            num_points = rng.randint(5, 10)
            points = []
            for _ in range(num_points):
                angle = rng.uniform(0, 2 * math.pi)
                distance = rng.uniform(bright_radius * 0.5, bright_radius)
                x = bright_x + int(distance * math.cos(angle))
                y = bright_y + int(distance * math.sin(angle))
                points.append((x, y))

            # Dibujar la forma brillante
            draw.polygon(
                points, fill=(173, 216, 230, 35)
            )  # Light cyan with some transparency

        # Añadir puntos brillantes (sparkles) en diferentes colores
        sparkle_colors = ["white", "aquamarine", "cyan"]
        num_sparkles = rng.randint(10, 42)
        for _ in range(num_sparkles):
            sparkle_x = center_x + rng.randint(-planet_radius, planet_radius)
            sparkle_y = center_y + rng.randint(-planet_radius, planet_radius)
            sparkle_color = rng.choice(sparkle_colors)  # Selecciona un color aleatorio
            draw.ellipse(
                (sparkle_x - 2, sparkle_y - 2, sparkle_x + 2, sparkle_y + 2),
                fill=sparkle_color,
            )

    elif planet["Type"] == "Metallic":
        # Añadir áreas de alta reflectividad
        num_reflective_areas = rng.randint(1, 100)
        for i in range(num_reflective_areas):
            reflection_radius = rng.randint(4, 16)
            reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
            reflection_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Definir el ángulo de inicio y final para el arco de la cuerda
            start_angle = rng.randint(0, 360)
            end_angle = start_angle + rng.randint(
                10, 200
            )  # El ángulo final es relativo al inicio

            # Dibujar áreas reflectantes usando formas chord (segmentos de un círculo) con transparencia del 55%
            draw.chord(
                (
                    reflection_x - reflection_radius,
                    reflection_y - reflection_radius,
                    reflection_x + reflection_radius,
                    reflection_y + reflection_radius,
                ),
                start=start_angle,
                end=end_angle,
                fill=(211, 211, 211, 1),  # lightgray con transparencia del 55%
            )

        # Capa final usando generate_abstract_shape para superficies metálicas y reflejos
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

    elif planet["Type"] == "Toxic":

        # Añadir áreas de vegetación retorcida y venenosa
        num_twisted_vegetation_areas = rng.randint(2, 5)
        for i in range(num_twisted_vegetation_areas):
            veg_radius = rng.randint(10, 25)
            veg_x = center_x + rng.randint(-planet_radius, planet_radius)
            veg_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar la vegetación venenosa usando pequeños círculos agrupados
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

        # Añadir rastros de líquido tóxico derramado
        num_spills = rng.randint(3, 7)
        for i in range(num_spills):
            spill_length = rng.randint(20, 60)
            spill_width = rng.randint(1, 3)
            spill_angle = rng.uniform(0, 2 * math.pi)
            spill_x1 = center_x + rng.randint(-planet_radius, planet_radius)
            spill_y1 = center_y + rng.randint(-planet_radius, planet_radius)
            spill_x2 = spill_x1 + int(spill_length * math.cos(spill_angle))
            spill_y2 = spill_y1 + int(spill_length * math.sin(spill_angle))

            # Dibujar el rastro de líquido tóxico
            draw.line(
                (spill_x1, spill_y1, spill_x2, spill_y2),
                fill="blueviolet",
                width=spill_width,
            )

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

        # Añadir segmentos de radiación intensa con pieslice
        num_segments = rng.randint(2, 4)
        for i in range(num_segments):
            segment_radius = rng.randint(4, 12)
            segment_start_angle = rng.uniform(0, 2 * math.pi)
            segment_end_angle = segment_start_angle + rng.uniform(
                math.pi / 6, math.pi / 3
            )
            segment_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
            segment_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)

            # Dibujar el segmento radiactivo
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

        # Añadir arcos para representar anillos de radiación con opacidad
        num_arcs = rng.randint(2, 60)

        # Crear una imagen temporal con fondo transparente para los arcos
        temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
        temp_draw = ImageDraw.Draw(temp_image)

        for i in range(num_arcs):
            arc_radius = rng.randint(60, 240)
            arc_width = rng.randint(2, 5)
            arc_start_angle = rng.uniform(0, 2 * math.pi)
            arc_end_angle = arc_start_angle + rng.uniform(math.pi / 4, math.pi / 2)
            arc_x = center_x
            arc_y = center_y

            # Dibujar el arco radiactivo en la capa temporal con baja opacidad
            temp_draw.arc(
                [
                    (arc_x - arc_radius, arc_y - arc_radius),
                    (arc_x + arc_radius, arc_y + arc_radius),
                ],
                start=math.degrees(arc_start_angle),
                end=math.degrees(arc_end_angle),
                fill=(0, 255, 0, 50),  # Verde lima con opacidad de 10 sobre 255
                width=arc_width,
            )

        # Combinar la capa temporal con la imagen principal
        draw.bitmap((0, 0), temp_image, fill=None)

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

        # Añadir un brillo radiactivo adicional
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

        # Añadir chimeneas volcánicas
        num_vents = rng.randint(2, 4)
        for i in range(num_vents):
            vent_radius = rng.randint(2, 6)
            vent_x = center_x + rng.randint(-planet_radius, planet_radius)
            vent_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar la chimenea volcánica
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

            # Añadir columnas de humo ascendentes
            num_smoke_plumes = rng.randint(1, 3)
            for _ in range(num_smoke_plumes):
                plume_width = rng.randint(5, 10)
                plume_height = rng.randint(20, 40)
                plume_x = vent_x + rng.randint(-vent_radius, vent_radius)
                plume_y = vent_y - vent_radius - rng.randint(10, 20)

                # Dibujar la columna de humo como un arco difuminado
                smoke_color = (169, 169, 169, 100)  # Gris oscuro con transparencia
                smoke_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
                smoke_draw = ImageDraw.Draw(smoke_image)
                smoke_draw.ellipse(
                    (
                        plume_x - plume_width,
                        plume_y - plume_height,
                        plume_x + plume_width,
                        plume_y + plume_height,
                    ),
                    fill=(105, 105, 105, 40),  # DimGray con transparencia
                    outline=None,
                )
                draw.bitmap((0, 0), smoke_image, fill=None)

        # Añadir un resplandor de magma adicional
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

    elif planet["Type"] == "Molten Core":

        # Añadir ondas de calor
        num_heat_waves = rng.randint(3, 7)
        for i in range(num_heat_waves):
            wave_radius = rng.randint(1, 450)
            wave_thickness = rng.randint(1, 2)
            wave_x = center_x + rng.randint(-planet_radius, planet_radius)
            wave_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar las ondas de calor
            draw.arc(
                [
                    (wave_x - wave_radius, wave_y - wave_radius),
                    (wave_x + wave_radius, wave_y + wave_radius),
                ],
                start=0,
                end=360,
                fill=(0, 0, 0, 60),  # OrangeRed con transparencia
                width=wave_thickness,
            )

        # Añadir zonas de intensidad térmica
        num_thermal_zones = rng.randint(2, 4)
        for i in range(num_thermal_zones):
            zone_radius = rng.randint(5, 10)
            zone_x = center_x + rng.randint(-planet_radius, planet_radius)
            zone_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar las zonas de intensidad térmica
            draw.ellipse(
                (
                    zone_x - zone_radius,
                    zone_y - zone_radius,
                    zone_x + zone_radius,
                    zone_y + zone_radius,
                ),
                fill=(255, 69, 0, 128),  # OrangeRed con transparencia
                outline=None,
            )

        # Núcleo fundido y cráteres
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

        # Añadir cráteres
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
        # Texturas de carbono (Patrones granulares)
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

        # Estructuras poligonales irregulares
        num_structures = rng.randint(5, 10)
        for _ in range(num_structures):
            structure_radius = rng.randint(30, 70)
            structure_x = center_x + rng.randint(-planet_radius, planet_radius)
            structure_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Generar un polígono fractal para simular estructuras de carbono
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

        # Fragmentos radiales
        num_fragments = rng.randint(3, 5)
        for _ in range(num_fragments):
            fragment_radius = rng.randint(20, 150)
            fragment_x = center_x + rng.randint(-planet_radius // 2, planet_radius // 2)
            fragment_y = center_y + rng.randint(-planet_radius // 2, planet_radius // 2)

            for i in range(5):  # Crear varios fragmentos radiales
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

    elif planet["Type"] == "Diamond":

        # Cristales multifacéticos
        num_diamond_crystals = rng.randint(
            8, 12
        )  # Aumentar la cantidad para mayor complejidad
        for i in range(num_diamond_crystals):
            crystal_height = rng.randint(10, 80)
            crystal_base_width = rng.randint(5, 40)
            crystal_x = center_x + rng.randint(-planet_radius, planet_radius)
            crystal_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Generar un cristal multifacético
            num_facets = rng.randint(5, 20)
            angle_step = 2 * math.pi / num_facets
            points = []
            for j in range(num_facets):
                angle = j * angle_step + rng.uniform(
                    -0.1, 0.1
                )  # Ligeras variaciones en ángulos
                distance = rng.uniform(crystal_base_width // 2, crystal_base_width)
                x = crystal_x + int(distance * math.cos(angle))
                y = crystal_y + int(distance * math.sin(angle))
                points.append((x, y))
            points.append(
                (crystal_x, crystal_y - crystal_height)
            )  # Añadir el vértice superior

            draw.polygon(points, fill="lightskyblue", outline="deepskyblue")

        # Reflejos y dispersión de luz
        num_reflections = rng.randint(5, 14)
        for i in range(num_reflections):
            reflection_radius = rng.randint(10, 100)
            reflection_x = center_x + rng.randint(-planet_radius, planet_radius)
            reflection_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Crear un gradiente radial para simular la dispersión de luz
            temp_image = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
            temp_draw = ImageDraw.Draw(temp_image)
            for r in range(reflection_radius, 0, -1):
                alpha = int(
                    255 * (r / reflection_radius) * 0.5
                )  # Disminuir opacidad gradualmente
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

        # Chispas de luz alrededor del planeta
        num_sparks = rng.randint(50, 75)
        for i in range(num_sparks):
            sparkle_x = center_x + rng.randint(-planet_radius, planet_radius)
            sparkle_y = center_y + rng.randint(-planet_radius, planet_radius)
            sparkle_color = rng.choice(["white", "deepskyblue", "cyan"])

            # Dibujar pequeñas chispas de luz
            draw.ellipse(
                (sparkle_x - 1, sparkle_y - 1, sparkle_x + 1, sparkle_y + 1),
                fill=sparkle_color,
            )

        # Superficies brillantes y cristales (mantener lo que ya estaba)
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

    elif planet["Type"] == "Super Earth":
        # Montañas detalladas
        num_mountains = rng.randint(5, 8)
        for i in range(num_mountains):
            mountain_base_width = rng.randint(4, 8)
            mountain_height = rng.randint(4, 8)
            mountain_x = center_x + rng.randint(-planet_radius, planet_radius)
            mountain_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Generar la base de la montaña
            base_points = [
                (mountain_x - mountain_base_width // 2, mountain_y),
                (mountain_x + mountain_base_width // 2, mountain_y),
                (mountain_x, mountain_y - mountain_height),
            ]

            # Luego dibujar la montaña encima
            draw.polygon(base_points, fill=(0, 0, 0, 80), outline="black")

            # Tierras altas y masas de agua (mantener lo que ya estaba)
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
        # Representación de un paisaje extraño y único
        # Superficies angulares y geométricas inusuales

        num_hills = rng.randint(5, 10)
        for i in range(num_hills):
            hill_base_width = rng.randint(2, 4)
            hill_height = rng.randint(2, 4)
            hill_x = center_x + rng.randint(-planet_radius, planet_radius)
            hill_y = center_y + rng.randint(-planet_radius, planet_radius)

            # Dibujar colinas con triángulos irregulares para dar un aspecto angular
            draw.polygon(
                [
                    (hill_x, hill_y),
                    (hill_x + hill_base_width // 2, hill_y - hill_height),
                    (hill_x - hill_base_width // 2, hill_y - hill_height),
                ],
                fill=(34, 139, 34, 200),  # darkgreen con opacidad
                outline=(0, 100, 0, 255),  # darkgreen outline
            )

        num_valleys = rng.randint(3, 7)
        for i in range(num_valleys):
            valley_radius = rng.randint(2, 10)
            max_offset = planet_radius - valley_radius
            valley_x = center_x + rng.randint(-max_offset, max_offset)
            valley_y = center_y + rng.randint(-max_offset, max_offset)

            # Dibujar valles con formas de "u" o arcos irregulares
            arc_start = rng.uniform(0, math.pi)
            arc_end = arc_start + rng.uniform(math.pi / 4, math.pi / 2)
            draw.arc(
                [
                    (valley_x - valley_radius, valley_y - valley_radius),
                    (valley_x + valley_radius, valley_y + valley_radius),
                ],
                start=math.degrees(arc_start),
                end=math.degrees(arc_end),
                fill=(107, 142, 35, 200),  # olivedrab con opacidad
                width=3,
            )

        # Finalizar con un par de formas abstractas en la superficie
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

    elif planet["Type"] == "Frozen Gas Giant":
        # Capas de gas helado
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

        # Añadir bandas de gas circulares
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

        # Añadir pequeños vórtices de gas en forma de espirales
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

        # Añadir pequeñas partículas heladas dispersas
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

        # Añadir tormentas heladas con generate_abstract_shape (manteniendo el diseño original)
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

    elif planet["Type"] == "Nebulous":
        # Nubes y nebulosas
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

    elif planet["Type"] == "Aquifer":

        # Capa de textura de agua subterránea
        num_water_patterns = rng.randint(2, 16)
        for i in range(num_water_patterns):
            pattern_radius = rng.randint(2, 10)
            pattern_x = center_x + rng.randint(-planet_radius, planet_radius)
            pattern_y = center_y + rng.randint(-planet_radius, planet_radius)
            start_angle = rng.uniform(0, 2 * math.pi)
            end_angle = start_angle + rng.uniform(math.pi / 4, math.pi / 2)

            # Dibujar formas de agua subterránea usando pieslice y arc para crear patrones más complejos
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

    elif planet["Type"] == "Exotic":

        # Formas abstractas y símbolos raros
        num_exotic_symbols = rng.randint(4, 8)
        for i in range(num_exotic_symbols):
            symbol_size = rng.randint(20, 60)
            max_offset = planet_radius - symbol_size
            symbol_x = center_x + rng.randint(-max_offset, max_offset)
            symbol_y = center_y + rng.randint(-max_offset, max_offset)

            # Elegir un color aleatorio para cada símbolo
            symbol_color = f"#{rng.randint(0, 0xFFFFFF):06x}"

            # Dibujar formas exóticas como arcos, líneas, polígonos o fractales
            shape_type = rng.choice(["arc", "polygon", "fractals"])
            if shape_type == "arc":
                symbol_size = 6
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
                    width=rng.randint(2, 5),
                )
            elif shape_type == "polygon":
                num_sides = rng.randint(3, 6)
                angle_step = 4 * math.pi / num_sides
                polygon_points = [
                    (
                        symbol_x + int(symbol_size * math.cos(angle_step * j)),
                        symbol_y + int(symbol_size * math.sin(angle_step * j)),
                    )
                    for j in range(num_sides)
                ]
                draw.polygon(polygon_points, outline=symbol_color, fill=None)
            elif shape_type == "fractals":
                # Un intento básico de representar algo fractal
                for _ in range(rng.randint(50, 100)):
                    fractal_size = rng.randint(1, 4)
                    fractal_x = symbol_x + rng.randint(-symbol_size, symbol_size)
                    fractal_y = symbol_y + rng.randint(-symbol_size, symbol_size)
                    draw.ellipse(
                        [
                            (fractal_x - fractal_size, fractal_y - fractal_size),
                            (fractal_x + fractal_size, fractal_y + fractal_size),
                        ],
                        outline=symbol_color,
                    )

        # Al final, agregar las formas abstractas de colores aleatorios
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
