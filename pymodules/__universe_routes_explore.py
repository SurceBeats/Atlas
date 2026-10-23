# pymodules/__universe_routes_explore.py

import math
import time
import hashlib
import threading
import traceback

from flask import jsonify, request

from pymodules.__atlas_stargate import generate_galaxy_url, generate_system_url, generate_planet_url

MAX_BATCH_SYSTEMS = 512
MAX_COORDINATE = 10**7


def register_explore_routes(app, config):
    """Stateless (session-free) API used by the 3D universe client.

    Every resource is addressed by its full location, so the client can stream
    any galaxy, system or planet without navigating through Flask sessions.
    """
    from pymodules.__universe_routes_uip import get_universe

    # Generation reseeds the global `random` module, so two requests generating at the
    # same time (threaded server, and the explorer fires several in parallel) would
    # corrupt each other's results. Serialise everything that generates.
    generation_lock = threading.RLock()

    def load_galaxy(x, y, z):
        universe = get_universe()
        if universe is None:
            raise RuntimeError("Universe not initialized")
        with generation_lock:
            return universe.get_galaxy(x, y, z)

    def load_system(galaxy, index, keep_cached=True):
        # get_solar_system caches every system forever; batch lookups must not grow that cache
        with generation_lock:
            was_cached = index in galaxy.solar_systems
            system = galaxy.get_solar_system(index)
            if not keep_cached and not was_cached:
                galaxy.solar_systems.pop(index, None)
            return system

    def galaxy_payload(galaxy):
        spatial_seed = hashlib.sha256(f"atlas-explore-{galaxy.seed}".encode()).hexdigest()[:16]
        growth_per_minute = galaxy.proximity_factor * 10 if galaxy.num_systems < getattr(galaxy, "base_max_systems", 0) else 0
        return {
            "name": galaxy.name,
            "galaxy_type": galaxy.galaxy_type,
            "coordinates": list(galaxy.coordinates),
            "num_systems": galaxy.num_systems,
            "max_systems": getattr(galaxy, "base_max_systems", galaxy.num_systems),
            "growth_per_minute": growth_per_minute,
            "black_holes": galaxy.black_holes,
            "pulsars": galaxy.pulsars,
            "quasars": galaxy.quasars,
            "spatial_seed": spatial_seed,
            "stargate_url": generate_galaxy_url(galaxy.coordinates, 1),
        }

    def system_summary(system):
        return {
            "index": system.index,
            "name": system.name,
            "star_system_type": system.star_system_type,
            "num_planets": system.num_planets,
            "stars": [{"Type": star["Type"], "Color": star["Color"], "Size": star.get("Radius Factor", 1.0)} for star in system.stars],
        }

    def timing_payload():
        return {"cosmic_origin_time": config.cosmic_origin_time, "current_time": int(time.time())}

    def error(message, status=400):
        return jsonify({"success": False, "error": message}), status

    def valid_coordinates(x, y, z):
        return all(0 <= c <= MAX_COORDINATE for c in (x, y, z))

    @app.route("/api/v2/galaxy/<int:x>/<int:y>/<int:z>")
    def api_v2_galaxy(x, y, z):
        if not valid_coordinates(x, y, z):
            return error(f"Coordinates out of range. Must be between 0 and {MAX_COORDINATE}.")
        try:
            galaxy = load_galaxy(x, y, z)
            if galaxy.galaxy_type != "Singularity Void":
                galaxy.calculate_num_systems()
            return jsonify({"success": True, "galaxy": galaxy_payload(galaxy), "timing": timing_payload()})
        except Exception as e:
            return error(str(e), 500)

    @app.route("/api/v2/galaxies", methods=["POST"])
    def api_v2_galaxies():
        """Lightweight batch lookup for neighbouring galaxies (intergalactic view)."""
        body = request.get_json(silent=True) or {}
        coordinates = body.get("coordinates", [])[:216]
        result = []
        for coords in coordinates:
            try:
                x, y, z = (int(c) for c in coords)
                if not valid_coordinates(x, y, z):
                    continue
                galaxy = load_galaxy(x, y, z)
                result.append({"coordinates": [x, y, z], "name": galaxy.name, "galaxy_type": galaxy.galaxy_type, "num_systems": galaxy.num_systems})
            except Exception:
                continue
        return jsonify({"success": True, "galaxies": result})

    @app.route("/api/v2/galaxy/<int:x>/<int:y>/<int:z>/systems", methods=["POST"])
    def api_v2_systems(x, y, z):
        if not valid_coordinates(x, y, z):
            return error("Coordinates out of range.")
        body = request.get_json(silent=True) or {}
        indices = body.get("indices", [])
        if not isinstance(indices, list):
            return error("indices must be a list")
        try:
            galaxy = load_galaxy(x, y, z)
            galaxy.calculate_num_systems()
            systems = []
            for raw in indices[:MAX_BATCH_SYSTEMS]:
                try:
                    index = int(raw)
                except (TypeError, ValueError):
                    continue
                if 0 <= index < galaxy.num_systems:
                    systems.append(system_summary(load_system(galaxy, index, keep_cached=False)))
            return jsonify({"success": True, "systems": systems})
        except Exception as e:
            return error(str(e), 500)

    @app.route("/api/v2/galaxy/<int:x>/<int:y>/<int:z>/system/<int:index>")
    def api_v2_system(x, y, z, index):
        if not valid_coordinates(x, y, z):
            return error("Coordinates out of range.")
        try:
            galaxy = load_galaxy(x, y, z)
            system = load_system(galaxy, index)
            current_time = int(time.time())
            elapsed = current_time - config.cosmic_origin_time
            max_orbital_radius = max(p.orbital_radius for p in system.planets.values())

            planets = []
            for planet_index, planet in system.planets.items():
                angle_velocity = (2 * math.pi) / planet.orbital_period_seconds
                current_orbital_angle = (planet.initial_orbital_angle + angle_velocity * elapsed) % (2 * math.pi)
                planets.append(
                    {
                        "index": planet_index,
                        "name": planet.name,
                        "planet_type": planet.planet_type,
                        "diameter": planet.diameter,
                        "mass": planet.mass,
                        "density": planet.density,
                        "gravity": planet.gravity,
                        "orbital_radius": planet.orbital_radius,
                        "orbital_period_seconds": planet.orbital_period_seconds,
                        "orbital_speed": planet.orbital_speed,
                        "axial_tilt": planet.axial_tilt,
                        "rotation_period_seconds": planet.rotation_period_seconds,
                        "surface_temperature": planet.surface_temperature,
                        "mean_temperature": planet.mean_temperature,
                        "atmosphere_factor": planet.atmosphere_factor,
                        "atmosphere": planet.atmosphere,
                        "life_forms": planet.life_forms,
                        "elements": planet.elements,
                        "eccentricity_factor": getattr(planet, "eccentricity_factor", 0.1),
                        "initial_orbital_angle": planet.initial_orbital_angle,
                        "current_orbital_angle": current_orbital_angle,
                        "relative_orbital_radius": planet.orbital_radius / max_orbital_radius if max_orbital_radius > 0 else 0,
                        "stargate_url": generate_planet_url(galaxy.coordinates, system.index, planet.name),
                    }
                )

            payload = system_summary(system)
            payload["planets"] = planets
            payload["max_orbital_radius"] = max_orbital_radius
            payload["stargate_url"] = generate_system_url(galaxy.coordinates, system.index)

            return jsonify({"success": True, "system": payload, "galaxy": {"name": galaxy.name, "coordinates": list(galaxy.coordinates)}, "timing": timing_payload()})
        except ValueError as e:
            return error(str(e), 404)
        except Exception as e:
            return error(str(e), 500)

    @app.route("/api/v2/galaxy/<int:x>/<int:y>/<int:z>/system/<int:index>/planet/<int:planet_index>/rendering-data")
    def api_v2_planet_rendering(x, y, z, index, planet_index):
        """Same response shape as /api/planet/rendering-data, but addressed by location."""
        from pymodules.__frontendAPI_planet_renderer import planet_translator

        if not valid_coordinates(x, y, z):
            return error("Coordinates out of range.")
        try:
            galaxy = load_galaxy(x, y, z)
            system = load_system(galaxy, index)
            planet = system.get_planet(planet_index)
            if planet is None:
                return error("Planet not found", 404)

            current_time_seconds = math.floor(time.time())
            elapsed_time = current_time_seconds - config.cosmic_origin_time
            max_orbital_radius = max(p.orbital_radius for p in system.planets.values())
            angle_velocity_orbit = (2 * math.pi) / planet.orbital_period_seconds
            current_orbital_angle = (planet.initial_orbital_angle + elapsed_time * angle_velocity_orbit) % (2 * math.pi)

            planet_data = {"name": planet.name, "planet_type": planet.planet_type, "diameter": planet.diameter, "mass": planet.mass, "density": planet.density, "gravity": planet.gravity, "orbital_radius": planet.orbital_radius, "orbital_period_seconds": planet.orbital_period_seconds, "orbital_speed": planet.orbital_speed, "rotation_period_seconds": planet.rotation_period_seconds, "surface_temperature": planet.surface_temperature, "mean_temperature": planet.mean_temperature, "atmosphere_factor": planet.atmosphere_factor, "axial_tilt": planet.axial_tilt, "atmosphere": planet.atmosphere, "life_forms": planet.life_forms, "elements": planet.elements, "eccentricity_factor": getattr(planet, "eccentricity_factor", 0.1), "initial_orbital_angle": planet.initial_orbital_angle, "current_orbital_angle": current_orbital_angle, "relative_orbital_radius": planet.orbital_radius / max_orbital_radius if max_orbital_radius > 0 else 0, "system_max_orbital_radius": max_orbital_radius}

            timing_data = {"cosmic_origin_time": config.cosmic_origin_time, "current_time_seconds": current_time_seconds, "elapsed_time": elapsed_time, "max_orbital_radius": max_orbital_radius}

            try:
                with generation_lock:
                    rendered_data = planet_translator.translate_planet_rendering(planet)
            except Exception:
                rendered_data = {"planet_info": {"name": planet.name, "type": planet.planet_type, "base_color": "#808080", "radius": planet.diameter / 15000}}

            rendered_data.setdefault("stellar_composition", {})["stars"] = system.stars

            return jsonify({"success": True, "planet_name": planet.name, "planet_data": planet_data, "rendering_data": rendered_data, "timing": timing_data, "coordinates": {"galaxy_coordinates": list(galaxy.coordinates), "system_index": index, "planet_index": planet_index}})
        except ValueError as e:
            return error(str(e), 404)
        except Exception as e:
            return jsonify({"success": False, "error": f"Error generating planet rendering data: {str(e)}", "traceback": traceback.format_exc()}), 500
