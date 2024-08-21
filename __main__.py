import os
import pymodules.__folders

import logging

from logging.handlers import RotatingFileHandler

from pymodules.__config import seed
from pymodules.constants import PhysicalConstants
from pymodules.universe import Universe
from pymodules.image_utils import generate_solar_system_image, generate_planet_image

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    send_from_directory,
)

app = Flask(__name__)

# Configura el manejador de archivo para volcar los errores
file_handler = RotatingFileHandler("logs/error.log", maxBytes=10240, backupCount=10)
file_handler.setLevel(logging.ERROR)
formatter = logging.Formatter(
    "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
)
file_handler.setFormatter(formatter)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.ERROR)

# Configuración inicial
seed = 42
constants = PhysicalConstants()
universe = Universe(seed, constants)
current_galaxy = None
current_system = None


# Data
galaxy_dir = os.path.join(os.getcwd(), "data/galaxy")
system_dir = os.path.join(os.getcwd(), "data/system")
planet_dir = os.path.join(os.getcwd(), "data/planet")


@app.route("/data/galaxy/<filename>")
def galaxy_image(filename):
    return send_from_directory(galaxy_dir, filename)


@app.route("/data/system/<filename>")
def system_image(filename):
    return send_from_directory(system_dir, filename)


@app.route("/data/planet/<filename>")
def planet_image(filename):
    return send_from_directory(planet_dir, filename)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/navigate", methods=["POST"])
def navigate():
    global current_galaxy, current_system
    x = int(request.form["x"])
    y = int(request.form["y"])
    z = int(request.form["z"])

    try:
        current_galaxy = universe.get_galaxy(x, y, z)
        current_system = None
        return redirect(url_for("view_galaxy"))
    except Exception as e:
        return render_template("index.html", error=str(e))


@app.route("/galaxy")
def view_galaxy():
    if not current_galaxy:
        return redirect(url_for("index"))

    # Obtener el parámetro 'page' de la URL; por defecto, se usa la página 1
    page = int(request.args.get("page", 1))
    per_page = 50
    start = (page - 1) * per_page
    end = start + per_page

    # Crear una lista de sistemas solares con sus nombres, índices y números
    systems = [
        {
            "index": i,
            "number": i + 1,
            "name": current_galaxy.get_solar_system(i).name,
        }
        for i in range(start, min(end, current_galaxy.num_systems))
    ]

    next_page = page + 1 if end < current_galaxy.num_systems else None
    prev_page = page - 1 if start > 0 else None

    return render_template(
        "galaxy.html",
        galaxy=current_galaxy,
        image_url=f"/data/galaxy/{current_galaxy.name}.png",
        systems=systems,
        page=page,
        next_page=next_page,
        prev_page=prev_page,
    )


@app.route("/system/<int:system_index>")
def view_system(system_index):
    global current_system
    if not current_galaxy:
        return redirect(url_for("index"))

    try:
        current_system = current_galaxy.get_solar_system(system_index)

        # Generar la imagen del sistema solar si no existe
        system_image_path = os.path.join("data/system", f"{current_system.name}.png")
        if not os.path.exists(system_image_path):
            image = generate_solar_system_image(current_system)
            image.save(system_image_path)

        # Generar la URL para la imagen del sistema solar
        image_url = url_for("system_image", filename=f"{current_system.name}.png")

        # Crear un resumen del sistema solar
        star_summary = [
            {
                "Type": star["Type"],
                "Color": star["Color"],
                "Size": f"{star['Radius Factor']:.2f} solar radii",
            }
            for star in current_system.stars
        ]

        system_summary = {
            "Star System Type": current_system.star_system_type.capitalize(),
            "Number of Planets": current_system.num_planets,
            "Stars": star_summary,
        }

        return render_template(
            "system.html",
            system=current_system,
            galaxy=current_galaxy,
            image_url=image_url,  # Pasar la URL de la imagen a la plantilla
            summary=system_summary,  # Pasar el resumen a la plantilla
        )
    except ValueError as e:
        return render_template("error.html", message=str(e), galaxy=current_galaxy)


@app.route("/planet/<planet_name>")
def view_planet(planet_name):
    if not current_system:
        return redirect(url_for("view_galaxy"))

    planet_name = planet_name.lower()
    for planet in current_system.planets.values():
        if planet["Name"].lower() == planet_name:
            # Generar la imagen del planeta si no existe
            planet_image_path = os.path.join("data/planet", f'{planet["Name"]}.png')
            if not os.path.exists(planet_image_path):
                image = generate_planet_image(planet)
                image.save(planet_image_path)

            # Generar la URL para la imagen del planeta
            image_url = url_for("planet_image", filename=f"{planet['Name']}.png")

            # Crear un resumen del planeta
            planet_summary = {
                "Type": planet["Type"],
                "Atmosphere": planet["Atmosphere"],
                "Mass": f"{planet['Mass']:.2e} kg",
                "Diameter": f"{planet['Diameter'] / 1000:.2f} km",
                "Gravity": f"{planet['Gravity']:.2f} m/s²",
                "Orbital Radius": f"{planet['Orbital Radius']:.2f} AU",
                "Orbital Period": f"{planet['Orbital Period']:.2f} years",
                "Surface Temperature": f"{planet['Surface Temperature']:.2f} K",
                "Elements": ", ".join(planet["Elements"]),
                "Life Forms": planet["Life Forms"],
            }

            return render_template(
                "planet.html",
                planet=planet,
                system=current_system,
                image_url=image_url,
                summary=planet_summary,
            )

    return redirect(url_for("view_system", system_index=current_system.index))


if __name__ == "__main__":
    app.config['ENV'] = 'production' # lmao
    app.config['DEBUG'] = False
    app.run()
