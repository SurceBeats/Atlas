# pymodules/__frontendAPI_location_data.py

from flask import Flask, jsonify, session
from pymodules.__atlas_config import config
from pymodules.__atlas_seedmaster import seedmaster, consistent_hash
from pymodules.__universe_constants import PhysicalConstants
from pymodules.__universe_base import Universe
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def generate_ring_data(planet):
    if not planet.planet_rings:
        return None
    spaced_planet_name = planet.name.replace("_", " ")
    planet_type = planet.planet_type.replace("_", " ")

    shape_seed = consistent_hash(f"{config.seed}-{spaced_planet_name}-{planet_type}-{planet.diameter}-{planet.density}-{planet.gravity}-_safe_shaper")

    rng = random.Random(shape_seed)
    planet_radius = int(200 * (planet.diameter / max(planet.diameter, 1)))
    ring_inner_radius = planet_radius + rng.randint(120, 160)
    ring_outer_radius = ring_inner_radius + rng.randint(20, 40)
    tilt_factor = math.sin(math.radians(planet.axial_tilt))
    base_num_full_ring_points = rng.randint(500, 1500)
    num_full_ring_points = int(base_num_full_ring_points * 1.5)
    full_ring_particles = []

    for _ in range(num_full_ring_points):
        angle = rng.uniform(math.pi, 2 * math.pi)
        distance = rng.uniform(ring_inner_radius, ring_outer_radius)

        x = distance * math.cos(angle)
        y = distance * tilt_factor * math.sin(angle)

        point_size = rng.choices([0.5, 1.0, 1.5, 2.0], weights=[0.4, 0.3, 0.2, 0.1], k=1)[0]
        gray_value = rng.randint(20, 50)

        full_ring_particles.append({"x": x, "y": y, "z": 0, "size": point_size, "color": [gray_value, gray_value, gray_value], "angle": angle, "distance": distance})
    base_num_ontop_ring_points = rng.randint(500, 1500)
    num_ontop_ring_points = int(base_num_ontop_ring_points * 1.5)
    ontop_ring_particles = []

    for _ in range(num_ontop_ring_points):
        angle = rng.uniform(0, math.pi)
        distance = rng.uniform(ring_inner_radius, ring_outer_radius)

        x = distance * math.cos(angle)
        y = distance * tilt_factor * math.sin(angle)

        point_size = rng.choices([0.5, 1.0, 1.5, 2.0], weights=[0.4, 0.3, 0.2, 0.1], k=1)[0]
        gray_value = rng.randint(20, 50)

        ontop_ring_particles.append({"x": x, "y": y, "z": 0, "size": point_size, "color": [gray_value, gray_value, gray_value], "angle": angle, "distance": distance})

    return {"has_rings": True, "shape_seed": shape_seed, "planet_radius": planet_radius, "ring_inner_radius": ring_inner_radius, "ring_outer_radius": ring_outer_radius, "tilt_factor": tilt_factor, "full_ring": {"num_particles": num_full_ring_points, "particles": full_ring_particles}, "ontop_ring": {"num_particles": num_ontop_ring_points, "particles": ontop_ring_particles}}


def get_complete_location_data(planet_name):
    try:
        if not config.is_initialized:
            if not config.initialize():
                return {"error": "Failed to initialize config"}

        constants = PhysicalConstants()
        universe = Universe(config.seed, constants)

        galaxy_data = session.get("galaxy")
        system_index = session.get("system")

        if not galaxy_data or system_index is None:
            return {"error": "No galaxy or system data in session"}
        galaxy = universe.get_galaxy(*galaxy_data["coordinates"])
        system = galaxy.get_solar_system(system_index)
        planet = None
        planet_index = None
        planet_name_lower = planet_name.lower()

        for index, planet_obj in system.planets.items():
            if planet_obj.name.lower() == planet_name_lower:
                planet = planet_obj
                planet_index = index
                break

        if planet is None:
            return {"error": f"Planet {planet_name} not found in system"}

        seedmaster_values = {}
        for i in range(1, 13):
            seedmaster_values[f"seedmaster_{i}"] = seedmaster(i)

        system_planets = []
        for idx, planet_obj in system.planets.items():
            system_planets.append({"index": idx, "name": planet_obj.name, "planet_type": planet_obj.planet_type, "has_rings": planet_obj.planet_rings})

        ring_decision_seed = planet.generate_planet_seed()

        ring_data = generate_ring_data(planet)

        return {
            "success": True,
            "universe": {"config_seed": config.seed, "cosmic_origin_time": config.cosmic_origin_time},
            "galaxy": {"name": galaxy.name, "coordinates": galaxy.coordinates, "seed": galaxy.seed, "galaxy_type": galaxy.galaxy_type, "num_systems": galaxy.num_systems},
            "system": {"name": system.name, "index": system.index, "seed": system.seed, "num_planets": system.num_planets, "star_system_type": system.star_system_type, "planets": system_planets},
            "planet": {"name": planet.name, "index": planet_index, "seed": planet.seed, "planet_type": planet.planet_type, "atmosphere": planet.atmosphere, "life_forms": planet.life_forms, "has_rings": planet.planet_rings, "diameter": planet.diameter, "density": planet.density, "gravity": planet.gravity, "mass": planet.mass, "orbital_radius": planet.orbital_radius, "orbital_radius_m": planet.orbital_radius_m, "orbital_period_seconds": planet.orbital_period_seconds, "orbital_speed": planet.orbital_speed, "rotation_period_seconds": planet.rotation_period_seconds, "surface_temperature": planet.surface_temperature, "mean_temperature": planet.mean_temperature, "atmosphere_factor": planet.atmosphere_factor, "axial_tilt": planet.axial_tilt, "elements": planet.elements, "initial_angle_rotation": planet.initial_angle_rotation, "initial_orbital_angle": planet.initial_orbital_angle},
            "rings": ring_data,
            "seeds": {"config_seed": config.seed, "galaxy_seed": galaxy.seed, "system_seed": system.seed, "planet_seed": planet.seed, "ring_decision_seed": ring_decision_seed},
            "seedmaster_values": seedmaster_values,
            "debug": {"galaxy_coordinates_str": f"{galaxy.coordinates[0]},{galaxy.coordinates[1]},{galaxy.coordinates[2]}", "system_name_lower": system.name.lower(), "planet_name_lower": planet.name.lower(), "planet_name_spaced": planet.name.replace("_", " ")},
        }

    except Exception as e:
        import traceback

        return {"error": f"Error generating location data: {str(e)}", "traceback": traceback.format_exc()}


def register_location_api(app):

    @app.route("/api/planet/<planet_name>/location-data")
    def get_planet_location_api(planet_name):
        data = get_complete_location_data(planet_name)
        return jsonify(data)

    @app.route("/api/current-location")
    def get_current_location():
        galaxy_data = session.get("galaxy")
        system_index = session.get("system")

        if not galaxy_data or system_index is None:
            return jsonify({"error": "No current location in session"})

        return jsonify({"galaxy_coordinates": galaxy_data["coordinates"], "system_index": system_index})
