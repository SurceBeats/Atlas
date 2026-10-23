# pymodules/__universe_init_moons.py

import math
import random
import hashlib
from enum import Enum
from typing import List, Dict, Tuple
from pymodules.__atlas_seedmaster import seedmaster, consistent_hash
from pymodules.__universe_init_planet import FRONTIER_TYPES


class MoonOrigin(Enum):
    COFORMATION = "co-formation"
    GIANT_IMPACT = "giant_impact"
    CAPTURE = "capture"


class Moon:
    def __init__(self, seed: int, index: int, parent_planet, origin: MoonOrigin, roche_limit: float, hill_radius: float):
        self.seed = seed
        self.index = index
        self.parent_planet = parent_planet
        self.origin = origin
        self.roche_limit = roche_limit
        self.hill_radius = hill_radius

        self.moon_rng = random.Random(seed)

        self.generate_properties()

        self._apply_tidal_evolution()

    def generate_properties(self):
        max_mass_ratio = self._get_max_mass_ratio()

        if self.origin == MoonOrigin.GIANT_IMPACT:
            mass_ratio = self.moon_rng.uniform(1e-3, min(max_mass_ratio, 1e-2))
        elif self.origin == MoonOrigin.COFORMATION:
            mass_ratio = self.moon_rng.uniform(1e-6, min(max_mass_ratio, 1e-3))
        else:
            mass_ratio = self.moon_rng.uniform(1e-7, min(max_mass_ratio, 1e-4))

        self.mass = self.parent_planet.mass * mass_ratio

        if self.origin == MoonOrigin.COFORMATION:
            if self.parent_planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
                self.moon_type = "icy"
                self.density = self.moon_rng.uniform(900, 1500)
            else:
                self.moon_type = "rocky"
                self.density = self.moon_rng.uniform(2500, 3500)
        elif self.origin == MoonOrigin.GIANT_IMPACT:
            self.moon_type = "rocky"
            self.density = self.moon_rng.uniform(3000, 3500)
        else:
            if self.moon_rng.random() < 0.4:
                self.moon_type = "asteroidal"
                self.density = self.moon_rng.uniform(800, 2200)
            else:
                self.moon_type = "captured"
                self.density = self.moon_rng.uniform(1000, 3000)

        self.radius = (3 * self.mass / (4 * math.pi * self.density)) ** (1 / 3) / 1000

        self.semi_major_axis = self._calculate_orbit()
        self.eccentricity = self._calculate_eccentricity()
        self.inclination = self._calculate_inclination()

        self.orbital_period = 2 * math.pi * math.sqrt((self.semi_major_axis * 1000) ** 3 / (self.parent_planet.constants.G * self.parent_planet.mass))

        self.rotation_period = self._calculate_rotation_period()
        self.angular_velocity = 2 * math.pi / self.rotation_period if self.rotation_period > 0 else 0

        self.name = self._generate_name()

    def _apply_tidal_evolution(self):
        from pymodules.__atlas_config import config
        import time

        current_time = time.time()
        time_elapsed_seconds = current_time - config.cosmic_origin_time
        time_elapsed_years = time_elapsed_seconds / (365.25 * 24 * 3600)
        planet_radius_m = self.parent_planet.diameter * 500
        moon_distance_m = self.semi_major_axis * 1000

        tidal_strength = (planet_radius_m**5) / (moon_distance_m**6)

        base_migration_rate = 3.8e-2

        mass_scaling = (self.parent_planet.mass / 5.97e24) ** 0.5
        moon_mass_scaling = (self.mass / 7.35e22) ** (-0.5)

        migration_rate = base_migration_rate * tidal_strength * mass_scaling * moon_mass_scaling

        max_migration_km = self.semi_major_axis * 0.1
        migration_distance_m = min(migration_rate * time_elapsed_years, max_migration_km * 1000)

        if self.origin.value in ["co-formation", "giant_impact"]:
            self.semi_major_axis += migration_distance_m / 1000

            self.orbital_period = 2 * math.pi * math.sqrt((self.semi_major_axis * 1000) ** 3 / (self.parent_planet.constants.G * self.parent_planet.mass))

            if self.semi_major_axis > self.hill_radius * 0.3:
                self.semi_major_axis = self.hill_radius * 0.3
                self.orbital_period = 2 * math.pi * math.sqrt((self.semi_major_axis * 1000) ** 3 / (self.parent_planet.constants.G * self.parent_planet.mass))

    def _get_max_mass_ratio(self) -> float:
        if self.parent_planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
            return 1e-3
        else:
            return 1e-2

    def _calculate_orbit(self) -> float:
        min_orbit = self.roche_limit * 1.05
        max_orbit = self.hill_radius * 0.4

        if self.origin == MoonOrigin.COFORMATION:
            if self.parent_planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
                planet_radius_km = self.parent_planet.diameter / 2
                min_realistic = max(min_orbit, planet_radius_km * 3)
                max_realistic = min(max_orbit, planet_radius_km * 25)
                orbit_range = (min_realistic, max_realistic)
            else:
                orbit_range = (min_orbit, min(max_orbit, self.hill_radius * 0.25))
        elif self.origin == MoonOrigin.GIANT_IMPACT:
            planet_radius_km = self.parent_planet.diameter * 1000 / 2
            orbit_range = (max(min_orbit, planet_radius_km * 20), min(max_orbit, planet_radius_km * 100))
        else:
            orbit_range = (max(min_orbit, self.hill_radius * 0.3), min(max_orbit, self.hill_radius * 0.4))

        log_min = math.log10(orbit_range[0])
        log_max = math.log10(orbit_range[1])
        return 10 ** self.moon_rng.uniform(log_min, log_max)

    def _calculate_eccentricity(self) -> float:
        if self.origin == MoonOrigin.COFORMATION:
            return self.moon_rng.uniform(0, 0.05)
        elif self.origin == MoonOrigin.GIANT_IMPACT:
            return self.moon_rng.uniform(0, 0.1)
        else:
            return self.moon_rng.uniform(0.1, 0.4)

    def _calculate_inclination(self) -> float:
        origin_hash = consistent_hash(f"origin_{self.origin.value}_{self.index}")
        moon_rng = random.Random(self.seed + self.index * 1000 + origin_hash)

        if self.origin == MoonOrigin.COFORMATION:
            return moon_rng.uniform(0, 5)
        elif self.origin == MoonOrigin.GIANT_IMPACT:
            return moon_rng.uniform(0, 30)
        else:
            return moon_rng.uniform(0, 180)

    def _calculate_rotation_period(self) -> float:
        distance_m = self.semi_major_axis * 1000
        moon_radius_m = self.radius * 1000
        planet_radius_m = self.parent_planet.diameter * 500

        if self.moon_type == "icy":
            Q_factor = 12
            k2 = 0.1
        elif self.moon_type == "asteroidal":
            Q_factor = 25
            k2 = 0.25
        elif self.moon_type == "captured":
            Q_factor = 40
            k2 = 0.2
        else:
            Q_factor = 80
            k2 = 0.3

        if self.moon_type == "asteroidal":
            moment_factor = 0.5
        else:
            moment_factor = 0.4

        rotation_rng = random.Random(self.seed + consistent_hash("rotation_period"))
        if self.moon_type == "asteroidal":
            initial_period = rotation_rng.uniform(4, 18) * 3600
        else:
            initial_period = rotation_rng.uniform(8, 20) * 3600

        initial_angular_velocity = 2 * math.pi / initial_period
        moment_of_inertia = moment_factor * self.mass * (moon_radius_m**2)

        denominator = 3 * k2 * self.parent_planet.constants.G * (self.parent_planet.mass**2) * (moon_radius_m**5) / Q_factor

        if denominator > 0:
            tidal_timescale = (moment_of_inertia * initial_angular_velocity * (distance_m**6)) / denominator
        else:
            tidal_timescale = float("inf")

        from pymodules.__atlas_config import config
        import time

        current_time = time.time()
        cosmic_age = current_time - config.cosmic_origin_time

        if distance_m < 10 * planet_radius_m:
            quick_lock_factor = (planet_radius_m / distance_m) ** 3
            effective_timescale = tidal_timescale / max(1, quick_lock_factor * 100)
        else:
            effective_timescale = tidal_timescale

        if cosmic_age > effective_timescale or effective_timescale < 1e6:
            self.is_tidally_locked = True
            return self.orbital_period
        else:
            locking_progress = cosmic_age / effective_timescale
            decay_factor = 1 - math.exp(-3 * locking_progress)

            current_period = initial_period + (self.orbital_period - initial_period) * decay_factor

            period_difference = abs(current_period - self.orbital_period)
            self.is_tidally_locked = period_difference < 0.05 * self.orbital_period

            return current_period

    def _generate_name(self) -> str:
        from pymodules.__universe_name_generator import generate_moon_name

        name_seed = self.seed + consistent_hash(f"{self.parent_planet.name}_{self.index}_{self.moon_type}")

        return generate_moon_name(name_seed, self.moon_type, self.index)

    def calculate_current_orbital_position(self, current_time: float, cosmic_origin_time: float) -> Dict[str, float]:
        time_elapsed = current_time - cosmic_origin_time

        phase_hash = consistent_hash(f"orbital_phase_{self.name}_{self.index}")
        initial_phase = (phase_hash % 1000) * 2 * math.pi / 1000

        mean_motion = (2 * math.pi) / self.orbital_period
        mean_anomaly = (mean_motion * time_elapsed + initial_phase) % (2 * math.pi)

        e = self.eccentricity
        eccentric_anomaly = mean_anomaly
        for _ in range(5):
            eccentric_anomaly = mean_anomaly + e * math.sin(eccentric_anomaly)

        true_anomaly = 2 * math.atan2(math.sqrt(1 + e) * math.sin(eccentric_anomaly / 2), math.sqrt(1 - e) * math.cos(eccentric_anomaly / 2))
        periapsis_hash = consistent_hash(f"periapsis_{self.name}_{self.index}")
        argument_of_periapsis = ((periapsis_hash * 7) % 360) * math.pi / 180

        node_rng = random.Random(self.seed + consistent_hash(f"node_{self.name}_{self.index}"))

        if self.origin.value == "co-formation":
            base_angle = node_rng.uniform(0, 360)
            longitude_of_ascending_node = math.radians(base_angle)
        elif self.origin.value == "giant_impact":
            base_angle = node_rng.uniform(0, 360)
            longitude_of_ascending_node = math.radians(base_angle)
        else:
            base_angle = node_rng.uniform(0, 360)
            longitude_of_ascending_node = math.radians(base_angle)

        r = self.semi_major_axis * (1 - e * math.cos(eccentric_anomaly))

        x_orbital = r * math.cos(true_anomaly + argument_of_periapsis)
        y_orbital = r * math.sin(true_anomaly + argument_of_periapsis)
        z_orbital = 0

        cos_inc = math.cos(math.radians(self.inclination))
        sin_inc = math.sin(math.radians(self.inclination))
        cos_node = math.cos(longitude_of_ascending_node)
        sin_node = math.sin(longitude_of_ascending_node)

        x1 = x_orbital
        y1 = y_orbital * cos_inc - z_orbital * sin_inc
        z1 = y_orbital * sin_inc + z_orbital * cos_inc

        x = x1 * cos_node - y1 * sin_node
        y = x1 * sin_node + y1 * cos_node
        z = z1

        return {"current_angle": true_anomaly, "initial_phase": initial_phase, "argument_of_periapsis": argument_of_periapsis, "longitude_of_ascending_node": longitude_of_ascending_node, "position": {"x": x, "y": y, "z": z}}

    def calculate_tidal_heating(self) -> Dict[str, float]:
        mean_motion = (2 * math.pi) / self.orbital_period

        if self.density < 2000:
            k2 = 0.3
            tidal_q = 100
        else:
            k2 = 0.1
            tidal_q = 300

        radius_m = self.radius * 1000
        distance_m = self.semi_major_axis * 1000

        io_reference_power = 1e14
        tidal_power = io_reference_power * ((self.eccentricity / 0.004) ** 2 * (mean_motion / 4.1e-5) ** 2 * (radius_m / 1821.6e3) ** 5 * (421.7e6 / distance_m) ** 6)

        stefan_boltzmann = 5.67e-8
        surface_area = 4 * math.pi * (radius_m**2)

        background_temp = max(50, 300 / math.sqrt(self.parent_planet.orbital_radius))

        if tidal_power > 0 and surface_area > 0:
            tidal_flux = tidal_power / surface_area
            total_temp_4th = (background_temp**4) + (tidal_flux / stefan_boltzmann)
            total_temperature = total_temp_4th**0.25
            temp_increase = total_temperature - background_temp
        else:
            temp_increase = 0
            total_temperature = background_temp

        volcanism_threshold = 1e12
        atmosphere_enhancement = min(3.0, max(1.0, tidal_power / 1e11))

        return {"tidal_power_watts": tidal_power, "surface_temperature_k": total_temperature, "temperature_increase_k": temp_increase, "has_volcanism": tidal_power > volcanism_threshold, "volcanism_intensity": min(1.0, tidal_power / volcanism_threshold), "atmosphere_enhancement": atmosphere_enhancement, "tidal_bulge_amplitude_m": 2 * k2 * (self.parent_planet.mass / 5.97e24) * (radius_m / distance_m) ** 3, "eccentricity_contribution": self.eccentricity**2, "q_factor": tidal_q}


class MoonSystem:
    def __init__(self, planet, star_mass: float):
        self.planet = planet
        self.star_mass = star_mass
        self.moons: List[Moon] = []

        self.system_seed = int(
            hashlib.sha256(f"{planet.seed}-{seedmaster(2)}-moon_system".encode()).hexdigest(),
            16,
        )

        self.system_rng = random.Random(self.system_seed)

        self.roche_limit = self._calculate_roche_limit()
        self.hill_radius = self._calculate_hill_sphere()

        self._generate_moons()

    def _calculate_roche_limit(self) -> float:
        planet_radius_km = self.planet.diameter / 2

        if self.planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
            satellite_density = 1000
        else:
            satellite_density = 3000

        roche_limit = 2.456 * planet_radius_km * (self.planet.density / satellite_density) ** (1 / 3)

        return roche_limit

    def _calculate_hill_sphere(self) -> float:
        planet_semi_major_axis = self.planet.orbital_radius * 1.496e8

        hill_radius = planet_semi_major_axis * (self.planet.mass / (3 * self.star_mass)) ** (1 / 3)

        return hill_radius

    def _should_have_moons(self) -> bool:
        system_rng = random.Random(self.system_seed + consistent_hash("moon_system_decisions"))

        if self.planet.mass < 1e22:
            return system_rng.random() < 0.1

        planet_radius_km = self.planet.diameter / 2

        if self.hill_radius < 10 * planet_radius_km:
            return False

        if self.hill_radius < 2 * self.roche_limit:
            return False

        mass_factor = min(1.0, math.log10(max(1, self.planet.mass / 1e23)))

        if self.planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
            base_probability = 0.95
        elif self.planet.planet_type in ["Super Earth", "Rocky", "Oceanic"]:
            base_probability = 0.5
        elif self.planet.planet_type in ["Sub Earth", "Icy", "Desert"]:
            base_probability = 0.3
        else:
            base_probability = 0.2

        return system_rng.random() < (base_probability * mass_factor)

    def _determine_moon_origins(self) -> List[Tuple[MoonOrigin, int]]:
        origins = []

        planet_mass_earth = self.planet.mass / self.planet.constants.M_EARTH

        origin_rng = random.Random(self.system_seed + consistent_hash("moon_origins"))

        if self.planet.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
            # At least 2: a Super Puff (a giant of very low density) can weigh under 20 Earths
            num_regular = origin_rng.randint(2, max(2, min(8, int(planet_mass_earth / 10))))
            origins.extend([(MoonOrigin.COFORMATION, i) for i in range(num_regular)])
        elif planet_mass_earth > 0.5:
            if origin_rng.random() < 0.3:
                num_regular = origin_rng.randint(0, 2)
                origins.extend([(MoonOrigin.COFORMATION, i) for i in range(num_regular)])

        if 0.1 < planet_mass_earth < 100 and origin_rng.random() < 0.2:
            origins.append((MoonOrigin.GIANT_IMPACT, 0))

        capture_probability = min(0.5, planet_mass_earth / 300)
        if origin_rng.random() < capture_probability:
            max_captured = min(5, int(planet_mass_earth / 50))
            num_captured = origin_rng.randint(1, max(1, max_captured))
            origins.extend([(MoonOrigin.CAPTURE, i) for i in range(num_captured)])

        return origins

    def _generate_moons(self):
        if not self._should_have_moons():
            return

        moon_specs = self._determine_moon_origins()

        if not moon_specs:
            return

        for i, (origin, origin_index) in enumerate(moon_specs):
            moon_seed = int(hashlib.sha256(f"{self.planet.seed}-{seedmaster(1)}-moon-{i}-{origin.value}-{origin_index}".encode()).hexdigest(), 16)

            moon = Moon(seed=moon_seed, index=i, parent_planet=self.planet, origin=origin, roche_limit=self.roche_limit, hill_radius=self.hill_radius)

            self.moons.append(moon)

        self.moons.sort(key=lambda m: m.semi_major_axis)

        self._ensure_orbital_stability()

    def _ensure_orbital_stability(self):
        if len(self.moons) <= 1:
            return

        stable_moons = [self.moons[0]]

        for moon in self.moons[1:]:
            previous_moon = stable_moons[-1]
            mutual_hill = ((moon.mass + previous_moon.mass) / (3 * self.planet.mass)) ** (1 / 3)
            min_separation = 3.5 * mutual_hill * (moon.semi_major_axis + previous_moon.semi_major_axis) / 2

            actual_separation = moon.semi_major_axis - previous_moon.semi_major_axis

            if actual_separation > min_separation:
                stable_moons.append(moon)

        self.moons = stable_moons

        self._detect_and_adjust_resonances()

    def _detect_and_adjust_resonances(self):
        if len(self.moons) <= 1:
            return

        for i in range(len(self.moons) - 1):
            moon1 = self.moons[i]
            moon2 = self.moons[i + 1]

            period_ratio = moon2.orbital_period / moon1.orbital_period

            resonance_ratios = [2.0, 1.5, 5 / 3, 3.0, 4 / 3]
            resonance_tolerance = 0.05

            for target_ratio in resonance_ratios:
                if abs(period_ratio - target_ratio) < resonance_tolerance:
                    adjustment_factor = 1.02 if period_ratio > target_ratio else 0.98
                    moon2.semi_major_axis *= adjustment_factor

                    moon2.orbital_period = 2 * math.pi * math.sqrt((moon2.semi_major_axis * 1000) ** 3 / (self.planet.constants.G * self.planet.mass))

                    break

    def get_moon_data(self) -> List[Dict]:
        moon_data = []
        for moon in self.moons:
            data = {
                "name": moon.name,
                "properties": {
                    "mass_kg": moon.mass,
                    "radius_km": moon.radius,
                    "density_kg_m3": moon.density,
                    "type": moon.moon_type,
                    "origin": moon.origin.value,
                },
                "orbit": {
                    "semi_major_axis_km": moon.semi_major_axis,
                    "eccentricity": moon.eccentricity,
                    "inclination_deg": moon.inclination,
                    "orbital_period_seconds": moon.orbital_period,
                    "orbital_period_days": moon.orbital_period / 86400,
                    "current_angle": 0,
                },
                "rotation": {
                    "rotation_period_s": moon.rotation_period,
                    "rotation_period_hours": moon.rotation_period / 3600,
                    "angular_velocity_rad_s": moon.angular_velocity,
                    "is_tidally_locked": abs(moon.rotation_period - moon.orbital_period) < 0.01 * moon.orbital_period,
                },
                "visuals": {
                    "base_color": "#8B8680",
                    "roughness": 0.8,
                    "metalness": 0.1,
                    "normal_strength": 1.0,
                    "relative_size": moon.radius / (self.planet.diameter / 2),
                    "has_atmosphere": False,
                },
                "procedural": {
                    "seed": moon.seed,
                    "noise_scale": 0.5,
                    "crater_density": 1.0,
                    "surface_variation": 0.5,
                },
            }
            moon_data.append(data)
        return moon_data
