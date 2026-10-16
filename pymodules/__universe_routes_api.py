# pymodules/__universe_routes.py

import random
import json
import os
import time
import html
from pathlib import Path

from flask import jsonify, request, redirect, url_for, session, render_template

from pymodules.__atlas_fixed_vars import RUN


def register_universe_routes(app, universe, config):
    from pymodules.__universe_routes_uip import get_universe

    @app.route("/api/universe/config")
    def get_universe_config():
        try:
            if not config.is_initialized:
                if not config.initialize():
                    return jsonify({"error": "Config not initialized"})

            return jsonify({"success": True, "config_seed": config.seed, "seed_str": config.seed_str, "seed_hash": config.seed_hash, "seed_decimal": str(config.seed), "cosmic_origin_time": config.cosmic_origin_time, "cosmic_origin_datetime": str(config.cosmic_origin_datetime)})
        except Exception as e:
            return jsonify({"error": str(e)})

    @app.route("/api/generate-random-location", methods=["GET"])
    def generate_random_location():
        try:
            if get_universe() is None:
                return jsonify({"error": "Universe not initialized"}), 500

            x = random.randint(0, 10000000)
            y = random.randint(0, 10000000)
            z = random.randint(0, 10000000)

            galaxy = get_universe().get_galaxy(x, y, z)

            response_data = {"success": True, "coordinates": {"x": x, "y": y, "z": z}, "galaxy_name": galaxy.name, "galaxy_type": galaxy.galaxy_type, "num_systems": galaxy.num_systems, "navigation_data": {"x": x, "y": y, "z": z}}

            rand = random.random()

            if rand > 0.05 and galaxy.num_systems > 0:
                random_system = random.randint(0, galaxy.num_systems - 1)
                system = galaxy.get_solar_system(random_system)

                response_data["system_name"] = system.name
                response_data["system_index"] = random_system
                response_data["navigation_data"]["system"] = random_system

                if rand > 0.15:
                    planets_list = []
                    for index, planet in system.planets.items():
                        planets_list.append({"name": planet.name, "index": index})

                    if planets_list:
                        random_planet = random.choice(planets_list)
                        response_data["planet_name"] = random_planet["name"]
                        response_data["planet_index"] = random_planet["index"]
                        response_data["navigation_data"]["planet"] = random_planet["name"]

            return jsonify(response_data)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/random-jump", methods=["POST"])
    def handle_random_jump():
        try:
            if get_universe() is None:
                return jsonify({"error": "Universe not initialized"}), 500

            x = int(request.form["x"])
            y = int(request.form["y"])
            z = int(request.form["z"])

            from pymodules.__universe_routes_pages import explore_url

            system_index = request.form.get("system")
            planet_index = None
            planet_name = request.form.get("planet")
            if system_index and planet_name:
                system = get_universe().get_galaxy(x, y, z).get_solar_system(int(system_index))
                planet_index = next((i for i, p in system.planets.items() if p.name.lower() == planet_name.lower()), None)

            return redirect(explore_url((x, y, z), int(system_index) if system_index else None, planet_index))

        except Exception as e:
            return render_template("error.html", message=f"Random jump failed: {str(e)}", run_mode=RUN)

    @app.route("/api/multiverse/peers")
    def get_multiverse_peers():

        try:
            peers_file = Path("internal_data/p2p/known_peers.json")

            if not peers_file.exists():
                return jsonify({"success": False, "error": "Peers data not available", "peers": []}), 404

            with open(peers_file, "r") as f:
                data = json.load(f)

            sanitized_peers = []

            if "peers" in data:
                peers_data = data.get("peers", [])
            elif "known_peers" in data:
                peers_data = list(data.get("known_peers", {}).values())
            else:
                peers_data = []

            for peer in peers_data:
                try:
                    peer_id = peer.get("peer_id") or peer.get("node_id", "unknown")
                    seed_value = peer.get("seed", 0)

                    seed_value = str(seed_value)

                    last_seen = peer.get("last_seen") or peer.get("last_connected", 0)
                    cosmic_origin = peer.get("cosmic_origin_time", 0)

                    status = peer.get("status", "unknown").upper()
                    if status == "ACTIVE":
                        status = "ACTIVE"
                    else:
                        status = "INACTIVE"

                    sanitized_peer = {"peer_id": html.escape(str(peer_id)[:100]), "seed": seed_value, "cosmic_origin_time": float(cosmic_origin), "last_seen": int(last_seen), "status": status}

                    if seed_value == "1.618033988749895":
                        sanitized_peer["seed_name"] = "Core Continuum"
                    else:
                        sanitized_peer["seed_name"] = "Atlas Multiverse"

                    valid_statuses = ["ACTIVE", "INACTIVE", "STALE", "ARCHIVED"]
                    if sanitized_peer["status"] not in valid_statuses:
                        sanitized_peer["status"] = "UNKNOWN"

                    sanitized_peers.append(sanitized_peer)

                except (ValueError, TypeError) as e:
                    continue

            seed_groups = {}
            for peer in sanitized_peers:
                seed = peer["seed"]
                if seed not in seed_groups:
                    seed_groups[seed] = []
                seed_groups[seed].append(peer)

            processed_groups = []
            for seed, peers in seed_groups.items():
                peers.sort(key=lambda x: x["cosmic_origin_time"])

                group_data = {"seed": seed, "seed_name": peers[0]["seed_name"], "cosmic_origin_time": peers[0]["cosmic_origin_time"], "count": len(peers), "peers": peers}
                processed_groups.append(group_data)

            def sort_key(group):
                if group["seed_name"] == "Core Continuum":
                    return (0, -max(p["last_seen"] for p in group["peers"]))
                else:
                    return (1, -max(p["last_seen"] for p in group["peers"]))

            processed_groups.sort(key=sort_key)

            return jsonify({"success": True, "groups": processed_groups, "total_peers": len(sanitized_peers), "timestamp": int(time.time())})

        except Exception as e:
            return jsonify({"success": False, "error": f"Failed to retrieve peer data: {str(e)}", "peers": []}), 500
