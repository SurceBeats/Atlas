# pymodules/constants.py


class PhysicalConstants:
    def __init__(
        self,
        speed_of_light=299792458,
        gravitational_constant=6.67430e-11,
        planck_constant=6.62607015e-34,
        fine_structure_constant=1 / 137,
        earth_mass=5.972e24,  # Masa de la Tierra en kg
        earth_diameter=12742,  # Diámetro de la Tierra en km
        sun_mass=1.989e30,  # Masa del Sol en kg
        tidal_dissipation_number=100,  # Q_PLANET, número de disipación tidal
        love_number=0.3,  # K2_PLANET, número de Love
    ):
        self.c = speed_of_light  # Velocidad de la luz (m/s)
        self.G = gravitational_constant  # Constante de gravitación universal (m^3 kg^-1 s^-2)
        self.h = planck_constant  # Constante de Planck (J·s)
        self.alpha = fine_structure_constant  # Constante de estructura fina
        self.M_EARTH = earth_mass  # Masa de la Tierra
        self.D_EARTH = earth_diameter  # Diámetro de la Tierra
        self.M_SUN = sun_mass  # Masa del Sol
        self.Q_PLANET = tidal_dissipation_number  # Número de disipación tidal (Q)
        self.K2_PLANET = love_number  # Número de Love (K2)

    def update_constants(
        self,
        speed_of_light=None,
        gravitational_constant=None,
        planck_constant=None,
        fine_structure_constant=None,
        earth_mass=None,
        earth_diameter=None,
        sun_mass=None,
        tidal_dissipation_number=None,
        love_number=None,
    ):
        if speed_of_light is not None:
            self.c = speed_of_light
        if gravitational_constant is not None:
            self.G = gravitational_constant
        if planck_constant is not None:
            self.h = planck_constant
        if fine_structure_constant is not None:
            self.alpha = fine_structure_constant
        if earth_mass is not None:
            self.M_EARTH = earth_mass
        if earth_diameter is not None:
            self.D_EARTH = earth_diameter
        if sun_mass is not None:
            self.M_SUN = sun_mass
        if tidal_dissipation_number is not None:
            self.Q_PLANET = tidal_dissipation_number
        if love_number is not None:
            self.K2_PLANET = love_number
