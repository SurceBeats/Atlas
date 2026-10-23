# pymodules/planet_renderer/api_endpoints.py

import math
import time
import traceback
from flask import jsonify, session
from typing import Dict, Any

from pymodules.__atlas_config import config
from pymodules.__universe_base import Universe
from pymodules.__universe_constants import PhysicalConstants


class PlanetRendererAPI:

    def __init__(self, planet_translator):
        self.planet_translator = planet_translator

    def register_endpoints(self, app):

        @app.route("/api/planet/<planet_name>/rendering-data")
        def get_planet_rendering_api(planet_name):
            return self._get_planet_rendering_data(planet_name)

        @app.route("/api/system/rendering-data")
        def get_system_rendering_api():
            return self._get_system_rendering_data()

        @app.route("/api/planet/rendering-data")
        def get_planet_rendering_data():
            return self._get_individual_planet_rendering_data()

    def _get_planet_rendering_data(self, planet_name: str) -> Dict[str, Any]:
        try:
            if not config.is_initialized:
                if not config.initialize():
                    return jsonify({"error": "Failed to initialize config"})

            constants = PhysicalConstants()
            universe = Universe(config.seed, constants)

            galaxy_data = session.get("galaxy")
            system_index = session.get("system")

            if not galaxy_data or system_index is None:
                return jsonify({"error": "No galaxy or system data in session"})

            galaxy = universe.get_galaxy(*galaxy_data["coordinates"])
            system = galaxy.get_solar_system(system_index)

            planet = None
            planet_name_lower = planet_name.lower()

            for index, planet_obj in system.planets.items():
                if planet_obj.name.lower() == planet_name_lower:
                    planet = planet_obj
                    break

            if planet is None:
                return jsonify({"error": f"Planet {planet_name} not found in system"})

            rendering_data = self.planet_translator.translate_planet_rendering(planet)

            max_orbital_radius = max(p.orbital_radius for p in system.planets.values())

            if "timing" not in rendering_data:
                rendering_data["timing"] = {}
            rendering_data["timing"]["max_orbital_radius"] = max_orbital_radius
            rendering_data["timing"]["system_planets_count"] = len(system.planets)

            if "stellar_composition" not in rendering_data:
                rendering_data["stellar_composition"] = {}
            rendering_data["stellar_composition"]["stars"] = system.stars if hasattr(system, "stars") else []

            return jsonify({"success": True, "planet_name": planet_name, "rendering_data": rendering_data})

        except Exception as e:
            return jsonify({"error": f"Error generating rendering data: {str(e)}", "traceback": traceback.format_exc()})

    def _get_system_rendering_data(self) -> Dict[str, Any]:
        try:
            if not config.is_initialized:
                if not config.initialize():
                    return jsonify({"error": "Failed to initialize config"})

            constants = PhysicalConstants()
            universe = Universe(config.seed, constants)

            galaxy_data = session.get("galaxy")
            system_index = session.get("system")

            if not galaxy_data or system_index is None:
                return jsonify({"error": "No galaxy or system data in session"})

            galaxy = universe.get_galaxy(*galaxy_data["coordinates"])
            system = galaxy.get_solar_system(system_index)

            cosmic_origin_time = config.cosmic_origin_time
            current_time = int(time.time())

            max_orbital_radius = max(p.orbital_radius for p in system.planets.values())

            system_data = {"name": system.name, "star_system_type": system.star_system_type, "num_planets": system.num_planets, "stars": [{"Type": star["Type"], "Size": str(star.get("Radius Factor", 1.0)), "Color": star["Color"]} for star in system.stars], "planets": [], "timing": {"cosmic_origin_time": cosmic_origin_time, "current_time": current_time, "max_orbital_radius": max_orbital_radius, "system_planets_count": len(system.planets)}}

            for planet in system.planets.values():

                initial_orbital_angle = planet.initial_orbital_angle

                orbital_period = planet.orbital_period_seconds
                time_elapsed = current_time - cosmic_origin_time
                angle_velocity = (2 * math.pi) / orbital_period
                current_orbital_angle = (initial_orbital_angle + angle_velocity * time_elapsed) % (2 * math.pi)

                planet_data = {"name": planet.name, "planet_type": planet.planet_type, "diameter": planet.diameter, "mass": planet.mass, "density": planet.density, "gravity": planet.gravity, "orbital_radius": planet.orbital_radius, "orbital_period_seconds": planet.orbital_period_seconds, "orbital_speed": planet.orbital_speed, "axial_tilt": planet.axial_tilt, "rotation_period_seconds": planet.rotation_period_seconds, "surface_temperature": planet.surface_temperature, "mean_temperature": planet.mean_temperature, "atmosphere_factor": planet.atmosphere_factor, "atmosphere": planet.atmosphere, "life_forms": planet.life_forms, "elements": planet.elements, "eccentricity_factor": getattr(planet, "eccentricity_factor", 0.1), "initial_orbital_angle": initial_orbital_angle, "current_orbital_angle": current_orbital_angle, "relative_orbital_radius": planet.orbital_radius / max_orbital_radius if max_orbital_radius > 0 else 0}

                system_data["planets"].append(planet_data)

            return jsonify({"success": True, "system_name": system.name, "system_data": system_data})

        except Exception as e:
            return jsonify({"error": f"Error generating system rendering data: {str(e)}", "traceback": traceback.format_exc()})

    def _get_individual_planet_rendering_data(self) -> Dict[str, Any]:
        try:
            if not config.is_initialized:
                if not config.initialize():
                    return jsonify({"error": "Failed to initialize config"})

            constants = PhysicalConstants()
            universe = Universe(config.seed, constants)

            galaxy_data = session.get("galaxy")
            system_index = session.get("system")
            planet_index = session.get("planet")

            if not galaxy_data or system_index is None or planet_index is None:
                return jsonify({"error": "No galaxy, system, or planet data in session"})

            galaxy = universe.get_galaxy(*galaxy_data["coordinates"])
            system = galaxy.get_solar_system(system_index)
            planet = system.get_planet(planet_index)

            cosmic_origin_time = config.cosmic_origin_time
            current_time_seconds = math.floor(time.time())
            elapsed_time = current_time_seconds - cosmic_origin_time

            max_orbital_radius = max([p.orbital_radius for p in system.planets.values()]) if system.planets else 1.0

            initial_orbital_angle = planet.initial_orbital_angle

            orbital_period = planet.orbital_period_seconds
            angle_velocity_orbit = (2 * math.pi) / orbital_period
            current_orbital_angle = (initial_orbital_angle + elapsed_time * angle_velocity_orbit) % (2 * math.pi)

            planet_data = {"name": planet.name, "planet_type": planet.planet_type, "diameter": planet.diameter, "mass": planet.mass, "density": planet.density, "gravity": planet.gravity, "orbital_radius": planet.orbital_radius, "orbital_period_seconds": planet.orbital_period_seconds, "orbital_speed": planet.orbital_speed, "rotation_period_seconds": planet.rotation_period_seconds, "surface_temperature": planet.surface_temperature, "mean_temperature": planet.mean_temperature, "atmosphere_factor": planet.atmosphere_factor, "axial_tilt": planet.axial_tilt, "atmosphere": planet.atmosphere, "life_forms": planet.life_forms, "elements": planet.elements, "eccentricity_factor": getattr(planet, "eccentricity_factor", 0.1), "initial_orbital_angle": initial_orbital_angle, "current_orbital_angle": current_orbital_angle, "relative_orbital_radius": planet.orbital_radius / max_orbital_radius if max_orbital_radius > 0 else 0, "system_max_orbital_radius": max_orbital_radius}

            timing_data = {"cosmic_origin_time": cosmic_origin_time, "current_time_seconds": current_time_seconds, "elapsed_time": elapsed_time, "max_orbital_radius": max_orbital_radius}

            try:
                rendered_data = self.planet_translator.translate_planet_rendering(planet)
            except Exception as e:
                rendered_data = {"planet_info": {"name": planet.name, "type": planet.planet_type, "base_color": "#808080", "radius": planet.diameter / 15000}}

            return jsonify({"success": True, "planet_name": planet.name, "planet_data": planet_data, "rendering_data": rendered_data, "timing": timing_data, "coordinates": {"galaxy_coordinates": galaxy_data["coordinates"], "system_index": system_index, "planet_index": planet_index}})

        except Exception as e:
            return jsonify({"error": f"Error generating planet rendering data: {str(e)}", "traceback": traceback.format_exc()})
