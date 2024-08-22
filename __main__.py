# __main__.py

from flask import Flask, render_template, request, redirect, url_for, send_file
from io import BytesIO
import os

from pymodules.__config import seed
from pymodules.constants import PhysicalConstants
from pymodules.universe import Universe
from pymodules.image_utils import (
    generate_solar_system_image,
    generate_planet_image,
    generate_galaxy_image,
)

app = Flask(__name__)

# Configuración inicial
seed = 42
constants = PhysicalConstants()
universe = Universe(seed, constants)
current_galaxy = None
current_system = None


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
        print("No galaxy found, redirecting to index.")
        return redirect(url_for("index"))

    page = int(request.args.get("page", 1))
    per_page = 50
    start = (page - 1) * per_page
    end = start + per_page

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

    print(f"Rendering galaxy with image_url: {url_for('galaxy_image_blob')}")

    return render_template(
        "galaxy.html",
        galaxy=current_galaxy,
        image_url=url_for("galaxy_image_blob"),
        systems=systems,
        page=page,
        next_page=next_page,
        prev_page=prev_page,
    )


@app.route("/galaxy_image_blob")
def galaxy_image_blob():
    if not current_galaxy:
        print("No galaxy found, redirecting to index.")
        return redirect(url_for("index"))

    try:
        print(f"Generating image for galaxy: {current_galaxy.name}")
        # Usa la función correcta para generar la imagen de la galaxia
        image = generate_galaxy_image(current_galaxy)
        img_io = BytesIO()
        image.save(img_io, "PNG")
        img_io.seek(0)
        print("Image generated successfully.")
        return send_file(img_io, mimetype="image/png")
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return redirect(url_for("index"))


@app.route("/system/<int:system_index>")
def view_system(system_index):
    global current_system
    if not current_galaxy:
        return redirect(url_for("index"))

    try:
        current_system = current_galaxy.get_solar_system(system_index)

        image_url = url_for("system_image_blob")

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
            image_url=image_url,
            summary=system_summary,
        )
    except ValueError as e:
        return render_template("error.html", message=str(e), galaxy=current_galaxy)


@app.route("/system_image_blob")
def system_image_blob():
    if not current_system:
        return redirect(url_for("index"))

    image = generate_solar_system_image(current_system)
    img_io = BytesIO()
    image.save(img_io, "PNG")
    img_io.seek(0)
    return send_file(img_io, mimetype="image/png")


@app.route("/planet/<planet_name>")
def view_planet(planet_name):
    if not current_system:
        return redirect(url_for("view_galaxy"))

    planet_name = planet_name.lower()
    for planet in current_system.planets.values():
        if planet["Name"].lower() == planet_name:
            image_url = url_for("planet_image_blob", planet_name=planet_name)

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


@app.route("/planet_image_blob/<planet_name>")
def planet_image_blob(planet_name):
    planet_name = planet_name.lower()
    for planet in current_system.planets.values():
        if planet["Name"].lower() == planet_name:
            image = generate_planet_image(planet)
            img_io = BytesIO()
            image.save(img_io, "PNG")
            img_io.seek(0)
            return send_file(img_io, mimetype="image/png")

    return redirect(url_for("view_system", system_index=current_system.index))


if __name__ == "__main__":
    app.config["ENV"] = "production"
    app.config["DEBUG"] = False
    app.run()
