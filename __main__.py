# __main__.py

import os
import sys
import asyncio

from io import BytesIO

from hypercorn.asyncio import serve
from hypercorn.config import Config

from flask import Flask, render_template, request, redirect, url_for, send_file, session

from pymodules.__atlas_fixed_vars import VERSION, VERSION_HASH, PORT, RUN
from pymodules.__atlas_cache import get_cached_image_path
from pymodules.__atlas_cache_daemon import start_cache_daemon
from pymodules.__atlas_config import config
from pymodules.__atlas_observer import observer
from pymodules.__atlas_stargate import (
    generate_planet_url,
    generate_system_url,
    generate_galaxy_url,
    decode_url,
)

from pymodules.__universe_constants import PhysicalConstants
from pymodules.__universe_base import Universe

from pymodules.__drawer_base import handle_image_generation


app = Flask(__name__)
app.secret_key = os.urandom(24)

universe = None
constants = PhysicalConstants()


def RunAtlasProtocol():
    global universe
    if not config.is_initialized:
        if not config.initialize():
            return False

    universe = Universe(config.seed, constants)
    return True


def get_current_galaxy():
    galaxy_data = session.get("galaxy")
    if galaxy_data:
        galaxy = universe.get_galaxy(*galaxy_data["coordinates"])
        return galaxy
    return None


def get_current_system():
    galaxy = get_current_galaxy()
    system_index = session.get("system")
    if galaxy and system_index is not None:
        return galaxy.get_solar_system(system_index)
    return None


@app.route("/")
def index():
    if not config.is_initialized or universe is None:
        if not RunAtlasProtocol():
            return redirect(url_for("onboarding"))
    return render_template("index.html", version=VERSION, versionHash=VERSION_HASH)


@app.route("/onboarding", methods=["GET", "POST"])
def onboarding():
    if os.path.exists("atlas.ini"):
        return redirect(url_for("index"))

    if request.method == "POST":
        universe_type = request.form.get("universe_type")

        if config.setup_universe(universe_type):
            return redirect(url_for("index"))

    return render_template("onboarding.html", version=VERSION, versionHash=VERSION_HASH)


@app.route("/navigate", methods=["POST"])
def navigate():
    x = int(request.form["x"])
    y = int(request.form["y"])
    z = int(request.form["z"])

    try:
        if universe is None:
            raise ValueError("The universe simulation isn't running yet.")
        galaxy = universe.get_galaxy(x, y, z)
        session["galaxy"] = {
            "seed": galaxy.seed,
            "name": galaxy.name,
            "constants": galaxy.constants.__dict__,
            "galaxy_type": galaxy.galaxy_type,
            "coordinates": (x, y, z),
        }
        session["system"] = None
        return redirect(url_for("view_galaxy"))
    except Exception as e:
        return render_template("error.html", message=f"An error occurred: {str(e)}")


@app.route("/galaxy", defaults={"page": 1})
@app.route("/galaxy/<int:page>")
def view_galaxy(page):
    try:
        current_galaxy = get_current_galaxy()
        if not current_galaxy:
            return redirect(url_for("index"))

        session[f"page_{current_galaxy.coordinates}"] = page

        galaxy_url = generate_galaxy_url(current_galaxy.coordinates, page)

        per_page = 50
        start = (page - 1) * per_page
        end = start + per_page
        finish = (current_galaxy.num_systems - 1) // 50 + 1

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
            image_url=url_for("galaxy_blob"),
            systems=systems,
            page=page,
            next_page=next_page,
            prev_page=prev_page,
            galaxy_url=galaxy_url,
            finish=finish,
            version=VERSION,
            versionHash=VERSION_HASH,
        )
    except ValueError as ve:
        return render_template("error.html", message=str(ve))
    except Exception as e:
        return render_template(
            "error.html", message=f"An unexpected error occurred: {str(e)}"
        )


@app.route("/galaxy_blob")
def galaxy_blob():
    current_galaxy = get_current_galaxy()

    coordinates = f"{current_galaxy.coordinates[0]}_{current_galaxy.coordinates[1]}_{current_galaxy.coordinates[2]}"
    system_name = current_galaxy.name.lower()

    cache_filepath = get_cached_image_path("galaxy", coordinates, system_name)

    if config.enable_cache:
        if os.path.exists(cache_filepath):
            return send_file(cache_filepath, mimetype="image/webp")

        image = asyncio.run(handle_image_generation(current_galaxy))
        image.save(cache_filepath, "WEBP", quality=config.image_quality)
        return send_file(cache_filepath, mimetype="image/webp")
    else:
        image = asyncio.run(handle_image_generation(current_galaxy))
        img_io = BytesIO()
        image.save(img_io, "WEBP", quality=config.image_quality)
        img_io.seek(0)
        return send_file(img_io, mimetype="image/webp")


@app.route("/system/<int:system_index>")
def view_system(system_index):
    try:
        current_galaxy = get_current_galaxy()
        if not current_galaxy:
            return redirect(url_for("index"))

        session["system"] = system_index
        current_system = current_galaxy.get_solar_system(system_index)

        page = session.get(f"page_{current_galaxy.coordinates}", 1)

        system_url = generate_system_url(
            current_galaxy.coordinates, current_system.index, page
        )

        image_url = url_for("system_blob")

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
            system_index=system_index,
            system_url=system_url,
            version=VERSION,
            versionHash=VERSION_HASH,
            page=page,
        )
    except ValueError as e:
        return render_template("error.html", message=str(e))


@app.route("/system_blob")
def system_blob():
    current_system = get_current_system()
    current_galaxy = get_current_galaxy()

    coordinates = f"{current_galaxy.coordinates[0]}_{current_galaxy.coordinates[1]}_{current_galaxy.coordinates[2]}"
    system_name = current_system.name.lower()

    cache_filepath = get_cached_image_path("system", coordinates, system_name)

    if config.enable_cache:
        if os.path.exists(cache_filepath):
            return send_file(cache_filepath, mimetype="image/webp")

        image = asyncio.run(handle_image_generation(current_system))
        image.save(cache_filepath, "WEBP", quality=config.image_quality)
        return send_file(cache_filepath, mimetype="image/webp")
    else:
        image = asyncio.run(handle_image_generation(current_system))
        img_io = BytesIO()
        image.save(img_io, "WEBP", quality=config.image_quality)
        img_io.seek(0)
        return send_file(img_io, mimetype="image/webp")


@app.route("/planet/<planet_name>")
def view_planet(planet_name):
    current_system = get_current_system()
    if not current_system:
        return redirect(url_for("view_galaxy"))

    current_galaxy = get_current_galaxy()

    planet_name = planet_name.lower()

    page = session.get(f"page_{current_galaxy.coordinates}", 1)

    for planet in current_system.planets.values():
        if planet.name.lower() == planet_name:
            image_url = url_for("planet_blob", planet_name=planet_name)
            planet_url = generate_planet_url(
                current_galaxy.coordinates, current_system.index, planet_name, page
            )

            planet_summary = {
                "Type": planet.planet_type,
                "Atmosphere": planet.atmosphere,
                "Mass": f"{planet.mass:.2e} kg",
                "Diameter": f"{planet.diameter / 1000:.2f} km",
                "Gravity": f"{planet.gravity:.2f} m/s²",
                "Orbital Radius": f"{planet.orbital_radius:.2f} AU",
                "Orbital Period": f"{planet.orbital_period_seconds / (365.25 * 24 * 3600):.2f} years",
                "Surface Temperature": f"{planet.surface_temperature:.2f} K",
                "Elements": ", ".join(planet.elements),
                "Life Forms": planet.life_forms,
            }

            return render_template(
                "planet.html",
                planet=planet,
                system=current_system,
                galaxy=current_galaxy,
                image_url=image_url,
                summary=planet_summary,
                planet_url=planet_url,
                version=VERSION,
                versionHash=VERSION_HASH,
            )

    return redirect(url_for("view_system", system_index=current_system.index))


@app.route("/planet_blob/<planet_name>")
def planet_blob(planet_name):
    current_system = get_current_system()
    current_galaxy = get_current_galaxy()

    coordinates = f"{current_galaxy.coordinates[0]}_{current_galaxy.coordinates[1]}_{current_galaxy.coordinates[2]}"
    system_name = current_system.name.lower()
    planet_name = planet_name.lower()

    cache_filepath = get_cached_image_path(
        "planet", coordinates, system_name, planet_name
    )

    if config.enable_cache:
        if os.path.exists(cache_filepath):
            return send_file(cache_filepath, mimetype="image/webp")

        for planet in current_system.planets.values():
            if planet.name.lower() == planet_name:
                image = asyncio.run(handle_image_generation(planet))
                image.save(cache_filepath, "WEBP", quality=config.image_quality)
                return send_file(cache_filepath, mimetype="image/webp")
    else:
        for planet in current_system.planets.values():
            if planet.name.lower() == planet_name:
                image = asyncio.run(handle_image_generation(planet))
                img_io = BytesIO()
                image.save(img_io, "WEBP", quality=config.image_quality)
                img_io.seek(0)
                return send_file(img_io, mimetype="image/webp")

    return redirect(url_for("view_system", system_index=current_system.index))


@app.route("/stargate/<encoded_url>", endpoint="stargate")
def stargate(encoded_url):
    try:
        decoded_data = decode_url(encoded_url)
        if decoded_data is None:
            return redirect(url_for("index"))

        params = {}
        for param in decoded_data.split("&"):
            key, value = param.split("=")
            params[key] = value

        coordinates = params.get("coordinates")
        system_index = params.get("system")
        planet_name = params.get("planet")
        page = params.get("page", 1)

        x, y, z = map(int, coordinates.split(","))

        session["galaxy"] = {
            "coordinates": (x, y, z),
        }

        if system_index:
            session["system"] = int(system_index)

        if page:
            session[f"page_{(x, y, z)}"] = int(page)

        if not system_index and not planet_name:
            return redirect(url_for("view_galaxy", page=page))

        elif system_index and not planet_name:
            return redirect(url_for("view_system", system_index=int(system_index)))

        elif system_index and planet_name:
            return redirect(url_for("view_planet", planet_name=planet_name))

        else:
            raise ValueError("Malformed URL")

    except Exception as e:
        print(f"Error: {e}")
        return redirect(url_for("index", error=str(e)))


if __name__ == "__main__":

    if RunAtlasProtocol():
        if "--observer" in sys.argv:
            observer(universe)
            exit("Observer out!")

        if config.enable_cache:
            start_cache_daemon()

    if RUN == "DEV":
        app.run(host="0.0.0.0", port=PORT, debug=True, use_reloader=True, threaded=True)
    else:
        HyperCornfig = Config()
        HyperCornfig.bind = [f"0.0.0.0:{PORT}"]
        asyncio.run(serve(app, HyperCornfig))
