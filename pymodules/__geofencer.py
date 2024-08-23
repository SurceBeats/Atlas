# pymodules/_geofencer.py

def generate_galaxy_url(galaxy_coordinates):
    """
    Genera una URL única para una galaxia basada en sus coordenadas (x, y, z).

    :param galaxy_coordinates: Tuple con las coordenadas (x, y, z) de la galaxia.
    :return: URL única de la galaxia.
    """
    x, y, z = galaxy_coordinates
    return f"/galaxy/{x}/{y}/{z}"

def generate_system_url(galaxy_coordinates, system_index):
    """
    Genera una URL única para un sistema solar basado en las coordenadas de la galaxia
    y el índice del sistema solar.

    :param galaxy_coordinates: Tuple con las coordenadas (x, y, z) de la galaxia.
    :param system_index: Índice del sistema solar dentro de la galaxia.
    :return: URL única del sistema solar.
    """
    galaxy_url = generate_galaxy_url(galaxy_coordinates)
    return f"{galaxy_url}/system/{system_index}"

def generate_planet_url(galaxy_coordinates, system_index, planet_name):
    """
    Genera una URL única para un planeta basado en las coordenadas de la galaxia,
    el índice del sistema solar y el nombre del planeta.

    :param galaxy_coordinates: Tuple con las coordenadas (x, y, z) de la galaxia.
    :param system_index: Índice del sistema solar dentro de la galaxia.
    :param planet_name: Nombre del planeta.
    :return: URL única del planeta.
    """
    galaxy_url = generate_galaxy_url(galaxy_coordinates)
    system_url = generate_system_url(galaxy_coordinates, system_index)
    formatted_name = planet_name.lower()
    return f"{system_url}/planet/{formatted_name}"
