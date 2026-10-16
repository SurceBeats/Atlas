# pymodules/__universe_routes_pages.py

import os
from flask import render_template, request, redirect, url_for, session
from pymodules.__atlas_fixed_vars import VERSION, VERSION_HASH, RUN
from pymodules.__atlas_stargate import decode_url


def explore_url(coordinates, system_index=None, planet_index=None):
    """Deep link into the 3D universe (handled client-side from the URL hash)."""
    url = "/#g=" + ",".join(str(int(c)) for c in coordinates)
    if system_index is not None:
        url += f"&s={int(system_index)}"
        if planet_index is not None:
            url += f"&p={int(planet_index)}"
    return url


def register_universe_page_routes(app, universe, config):
    from pymodules.__universe_routes_uip import get_universe

    def universe_config():
        return {"remote": config.remote, "seed_name": config.seed_name, "node_id": config.node_id, "seed_str": config.seed_str, "cosmic_origin_time": config.cosmic_origin_time}

    def planet_index_by_name(coordinates, system_index, planet_name):
        try:
            system = get_universe().get_galaxy(*coordinates).get_solar_system(int(system_index))
        except Exception:
            return None
        planet_name = planet_name.lower()
        for index, planet in system.planets.items():
            if planet.name.lower() == planet_name:
                return index
        return None

    def location_url(coordinates, system_index=None, planet_name=None):
        planet_index = planet_index_by_name(coordinates, system_index, planet_name) if (system_index is not None and planet_name) else None
        return explore_url(coordinates, system_index, planet_index)

    @app.route("/")
    def index():
        import __main__
        from pymodules.__atlas_startup_mode import is_p2p_discovery_enabled, set_startup_complete

        if not config.is_initialized or get_universe() is None:
            if os.path.exists("atlas.ini"):
                if __main__.RunAtlasProtocol():
                    if not is_p2p_discovery_enabled():
                        print()
                        print("✅ \033[1mAtlas Initialization Protocol Finished\033[0m")
                        print()
                        set_startup_complete()
            else:
                return redirect(url_for("onboarding"))

        return render_template("explore.html", version=VERSION, versionHash=VERSION_HASH, run_mode=RUN, universe_config=universe_config())

    @app.route("/onboarding", methods=["GET", "POST"])
    def onboarding():
        if os.path.exists("atlas.ini"):
            return redirect(url_for("index"))

        if request.method == "POST":
            universe_type = request.form.get("universe_type")
            custom_seed = request.form.get("custom_seed")

            if config.setup_universe(universe_type, custom_seed):
                import __main__
                from pymodules.__atlas_startup_mode import set_startup_complete

                if __main__.RunAtlasProtocol():
                    print()
                    print("✅ \033[1mAtlas Initialization Protocol Finished\033[0m")
                    print()
                    set_startup_complete()

                return redirect(url_for("index"))
            else:
                return render_template("onboarding.html", error="Failed to create configuration", run_mode=RUN)

        return render_template("onboarding.html", version=VERSION, versionHash=VERSION_HASH, run_mode=RUN)

    @app.route("/universe-faq")
    def universe_faq():
        # The F.A.Q. lives in the explorer now (a panel over the universe)
        return redirect("/#faq")

    @app.route("/multiverse")
    def multiverse():
        # The multiverse lives in the explorer now (a panel over the universe)
        return redirect("/#multiverse")

    # ---- Legacy page URLs: the 2D galaxy/system/planet pages are gone, but every old
    # link (bookmarks, shared stargate URLs, forms) still lands in the right place.

    @app.route("/explore")
    def explore_alias():
        return redirect(url_for("index"))

    @app.route("/navigate", methods=["POST"])
    def navigate():
        try:
            coordinates = request.form.get("coordinates")
            if coordinates:
                x, y, z = map(int, coordinates.split(","))
            else:
                x = int(request.form.get("x", 0))
                y = int(request.form.get("y", 0))
                z = int(request.form.get("z", 0))
            return redirect(location_url((x, y, z), request.form.get("system") or None, request.form.get("planet")))
        except Exception:
            return redirect(url_for("index"))

    def session_location():
        galaxy_data = session.get("galaxy")
        return galaxy_data["coordinates"] if galaxy_data else None

    @app.route("/galaxy", defaults={"page": 1})
    @app.route("/galaxy/<int:page>")
    def view_galaxy(page):
        coordinates = session_location()
        return redirect(explore_url(coordinates) if coordinates else url_for("index"))

    @app.route("/system/<int:system_index>")
    def view_system(system_index):
        coordinates = session_location()
        return redirect(explore_url(coordinates, system_index) if coordinates else url_for("index"))

    @app.route("/planet/<planet_name>")
    def view_planet(planet_name):
        coordinates = session_location()
        system_index = session.get("system")
        if not coordinates or system_index is None:
            return redirect(url_for("index"))
        return redirect(location_url(coordinates, system_index, planet_name))

    @app.route("/stargate/<encoded_url>", endpoint="stargate")
    def stargate(encoded_url):
        decoded_data = decode_url(encoded_url)
        if decoded_data is None:
            return redirect(url_for("index"))
        try:
            params = dict(param.split("=") for param in decoded_data.split("&"))
            x, y, z = map(int, params["coordinates"].split(","))
            # The explorer plays the gate opening when it sees where the link came from
            return redirect(location_url((x, y, z), params.get("system"), params.get("planet")) + "&via=stargate")
        except Exception:
            return redirect(url_for("index"))
