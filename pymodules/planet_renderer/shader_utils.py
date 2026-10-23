# pymodules/planet_renderer/shader_utils.py

from typing import Dict, Any, List

from pymodules.__universe_init_planet import FRONTIER_TYPES


class ShaderUtils:

    @staticmethod
    def generate_shader_uniforms(planet_type: str, shape_seed: int, angle_rotation: float, base_color: str, planet_data: Dict[str, Any]) -> Dict[str, Any]:
        base_rgb = ShaderUtils.hex_to_rgb(base_color)

        uniforms = {"time": {"value": 0.0, "type": "float"}, "seed": {"value": shape_seed * 0.001, "type": "float"}, "rotationAngle": {"value": angle_rotation, "type": "float"}, "baseColor": {"value": base_rgb, "type": "vec3"}, "planetType": {"value": planet_type, "type": "string"}}

        if planet_type in ["Gas Giant", *FRONTIER_TYPES] and "cloud_bands" in planet_data:
            bands_data = planet_data["cloud_bands"]
            uniforms.update({"numBands": {"value": bands_data["num_bands"], "type": "float"}, "bandPositions": {"value": bands_data["positions"], "type": "float[]"}, "bandWidths": {"value": bands_data["widths"], "type": "float[]"}, "bandRotation": {"value": bands_data["rotation"], "type": "float"}})

        return uniforms

    @staticmethod
    def hex_to_rgb(hex_color: str) -> List[float]:
        hex_color = hex_color.lstrip("#")
        return [int(hex_color[i : i + 2], 16) / 255.0 for i in (0, 2, 4)]
