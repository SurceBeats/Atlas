# __main__.py

import os
import sys
import time
import atexit
import asyncio

from hypercorn.asyncio import serve
from hypercorn.config import Config
from hypercorn.middleware import AsyncioWSGIMiddleware

from flask import Flask, g
from flask_compress import Compress

from vite_fusion import register_vite_assets

from pymodules.__atlas_fixed_vars import PORT, RUN
from pymodules.__atlas_config import config
from pymodules.__atlas_observer import observer
from pymodules.__atlas_ssl import ssl_enabled, get_ssl_cert_info

from pymodules.__frontendAPI_location_data import register_location_api
from pymodules.__frontendAPI_planet_renderer import register_planet_renderer_api
from pymodules.__frontendAPI_arecibo import register_arecibo_api
from pymodules.__universe_routes_api import register_universe_routes
from pymodules.__universe_routes_pages import register_universe_page_routes
from pymodules.__universe_routes_static import register_static_routes
from pymodules.__universe_routes_multiverse import register_multiverse_routes
from pymodules.__universe_routes_explore import register_explore_routes
from pymodules.__universe_routes_uip import initialize_uip
from pymodules.__atlas_p2pv2_integration import initialize_p2pv2_system, sync_atlas_universe_data_v2, cleanup_p2pv2_system
from pymodules.__atlas_p2pv2_anim import animate_initialization, stop_animation
from pymodules.__atlas_startup_mode import set_startup_complete


template_folder = os.path.join(os.getcwd(), "atlas-ui", "template")

app = Flask(__name__, static_folder=None, template_folder=template_folder)
app.secret_key = os.urandom(24)

Compress(app)

register_vite_assets(app, dev_mode=(RUN == "DEV"), dev_server_url="http://localhost:5173", dist_path="/atlas-ui/react/dist", manifest_path="atlas-ui/react/dist/.vite/manifest.json", nonce_provider=lambda: g.get("nonce"), logger=None)
register_location_api(app)
register_planet_renderer_api(app)
register_arecibo_api(app)
register_static_routes(app)

universe = None
uip = initialize_uip(config)
p2p_initialized = False


def ensure_p2p_initialized():
    global p2p_initialized

    enable_p2p = os.getenv("ENABLE_P2P", "true").lower() == "true"
    if p2p_initialized or "--no-p2p" in sys.argv or universe is None or not enable_p2p:
        return

    try:
        print()
        stop_event, anim_thread = animate_initialization("Initializing Multiverse Protocol...")

        p2p_manager = initialize_p2pv2_system(app)

        if p2p_manager:
            sync_atlas_universe_data_v2(universe)
            time.sleep(0.5)

            try:
                p2p_status = p2p_manager.get_status()

                stop_animation(stop_event, anim_thread)

                print("🪐 \033[1mAtlas Multiverse Protocol:\033[0m")
                print("\033[94m" + "=" * 50 + "\033[0m")

                discovery_stats = p2p_status.get("discovery_stats", {})
                if discovery_stats:
                    atlas_infohash = discovery_stats.get("atlas_infohash", "Generating...")
                    print(f"\033[1m    Atlas Infohash\033[0m         : \033[93m{atlas_infohash}\033[0m")
                    print(f"\033[1m    BitTorrent DHT\033[0m         : \033[92mEnabled\033[0m")

                print(f"\033[1m    Node ID\033[0m                : \033[93m{p2p_status['node_id']}\033[0m")
                print(f"\033[1m    External IP\033[0m            : \033[93m{p2p_status.get('external_ip', 'Detecting...')}\033[0m")
                print(f"\033[1m    P2P Port\033[0m               : \033[93m{p2p_status['port']}\033[0m")

                known_peers = p2p_status.get("known_peers", {})
                failed_peers = p2p_status.get("failed_peers", {})

                total_known = known_peers.get("total_known_peers", 0)
                if total_known > 0:
                    print(f"\033[1m    Known Multiverses\033[0m      : \033[96m{total_known} peers\033[0m")

                    active = known_peers.get("active_peers", 0)
                    inactive = known_peers.get("inactive_peers", 0)
                    stale = known_peers.get("stale_peers", 0)
                    archived = known_peers.get("archived_peers", 0)

                    if any([active, inactive, stale, archived]):
                        if active > 0:
                            print(f"\033[1m       ├─ Recently Active\033[0m  : \033[92m{active}\033[0m")
                        if inactive > 0:
                            print(f"\033[1m       ├─ Recently Offline\033[0m : \033[93m{inactive}\033[0m")
                        if stale > 0:
                            print(f"\033[1m       ├─ Long Offline\033[0m     : \033[94m{stale}\033[0m")
                        if archived > 0:
                            print(f"\033[1m       └─ Archived\033[0m         : \033[90m{archived}\033[0m")
                else:
                    print(f"\033[1m    Known Multiverses\033[0m      : \033[90mEmpty (first run)\033[0m")

                total_failed = failed_peers.get("total_failed_peers", 0)
                if total_failed > 0:
                    print(f"\033[1m    Blocked Peers\033[0m          : \033[91m{total_failed} peers\033[0m")
                    banned = failed_peers.get("currently_banned", 0)
                    if banned > 0:
                        print(f"\033[1m      └─ Active Bans\033[0m       : \033[91m{banned}\033[0m")

                print("\033[94m" + "=" * 50 + "\033[0m")

            except Exception as e:
                if "stop_event" in locals():
                    stop_animation(stop_event, anim_thread)
                pass
        else:
            if "stop_event" in locals():
                stop_animation(stop_event, anim_thread)

        atexit.register(cleanup_p2pv2_system)
        p2p_initialized = True

    except Exception as e:
        if "stop_event" in locals():
            stop_animation(stop_event, anim_thread)
        print(f"❌ P2P system initialization failed: {e}")
        print("   Use --no-p2p to disable P2P functionality")


def RunAtlasProtocol():
    global universe
    if uip.initialize_if_needed():
        universe = uip.universe

        ensure_p2p_initialized()

        return True
    return False


register_universe_routes(app, universe, config)
register_universe_page_routes(app, universe, config)
register_multiverse_routes(app)
register_explore_routes(app, config)

enable_p2p = os.getenv("ENABLE_P2P", "true").lower() == "true"
if "--no-p2p" not in sys.argv and enable_p2p:
    try:
        from pymodules.__atlas_p2pv2_routes import AtlasP2PRoutes
        from pymodules.__atlas_p2pv2_integration import register_p2pv2_api

        os.makedirs("internal_data/logs", exist_ok=True)
        os.makedirs("internal_data/p2p", exist_ok=True)

        p2p_routes = AtlasP2PRoutes("internal_data/p2p")
        p2p_routes.register_routes(app)
        register_p2pv2_api(app)

        import pymodules.__atlas_p2pv2_routes as p2p_module

        p2p_module._p2p_routes = p2p_routes
    except ImportError:
        pass


def display_server_configuration():
    """Display server configuration information"""
    ssl_enabled_var = ssl_enabled()
    protocol = "https" if ssl_enabled_var else "http"

    print()
    print("🚀 \033[1mAtlas Server Configuration:\033[0m")
    print("\033[94m" + "=" * 50 + "\033[0m")
    print(f"\033[1m    SSL Enabled\033[0m: \033[92m{ssl_enabled_var}\033[0m")
    print(f"\033[1m    Development Mode\033[0m: \033[92m{RUN == 'DEV'}\033[0m")
    print(f"\033[1m    Protocol\033[0m: \033[92m{protocol}\033[0m")
    print(f"\033[1m    Port\033[0m: \033[92m{PORT}\033[0m")

    if ssl_enabled_var:
        cert_path = os.path.join(os.getcwd(), "ssl", "fullchain.pem")
        cert_info = get_ssl_cert_info(cert_path)
        print(f"\033[1m    SSL Certificate Information\033[0m:")
        if "error" in cert_info:
            print(f'      └─ \033[91mError: {cert_info["error"]}\033[0m')
        else:
            print(f'      ├─ \033[93mValid Until: {cert_info["notAfter"]}\033[0m')
            print(f'      └─ \033[93mIssuer: {cert_info["issuerO"]} V{cert_info["version"]} ({cert_info["issuerCN"]})\033[0m')

    print("\033[94m" + "=" * 50 + "\033[0m")
    print()


def initialize_atlas_sequential():
    ssl_status = ssl_enabled()

    if not RunAtlasProtocol():
        if not os.path.exists("atlas.ini"):
            print("\n🛸  Atlas Onboarding Sequence:")
            print("\033[94m" + "=" * 50 + "\033[0m")
            print(f"\033[1m    Please visit your Atlas to complete the onboarding\033[0m")
            print(f"\033[1m    It's dangerous to go alone!\033[0m")
            print("\033[94m" + "=" * 50 + "\033[0m")
            print()
            return True, ssl_status
        print("❌ Atlas Protocol initialization failed!")
        return False, ssl_status

    if "--observer" in sys.argv:
        print("🔭 Starting Observer mode...")
        observer(universe)
        exit("Observer out!")

    print()
    print("✅ \033[1mAtlas Initialization Protocol Finished\033[0m")
    print()

    set_startup_complete()

    return True, ssl_status


if __name__ == "__main__":

    if "--debug" in sys.argv:
        from pymodules.__atlas_debug_flag import AtlasDebugger

        debug_index = sys.argv.index("--debug")
        if debug_index + 1 < len(sys.argv):
            stargate_url = sys.argv[debug_index + 1]

            debugger = AtlasDebugger()

            if "--json" in sys.argv:
                output_file = debugger.export_to_json(stargate_url)
                print(f"💾 Debug data exported to: {output_file}")
            else:
                debugger.debug_planet_rendering(stargate_url)

            exit("Debug complete!")
        else:
            print("❌ Error: --debug requires a stargate URL")
            print("Usage: python __main__.py --debug 'stargate_url' [--json]")
            exit(1)

    display_server_configuration()

    result = initialize_atlas_sequential()
    if not result[0]:
        print("❌ Atlas initialization failed!")
        exit(1)

    ssl_enabled_var = result[1]

    if RUN == "DEV":
        app.run(host="0.0.0.0", port=PORT, debug=True, use_reloader=True, threaded=True)
    else:
        hypercorn_config = Config()
        hypercorn_config.loglevel = "WARNING"
        hypercorn_config.include_server_header = False
        hypercorn_config.bind = [f"0.0.0.0:{PORT}"]

        if ssl_enabled_var:
            ssl_dir = os.path.join(os.getcwd(), "ssl")
            hypercorn_config.certfile = os.path.join(ssl_dir, "fullchain.pem")
            hypercorn_config.keyfile = os.path.join(ssl_dir, "privkey.pem")
            hypercorn_config.ca_certs = os.path.join(ssl_dir, "chain.pem")

        async def atlas_app_asgi(scope, receive, send):
            app_asgi = AsyncioWSGIMiddleware(app, max_body_size=1 * 1024 * 1024 * 1024)
            await app_asgi(scope, receive, send)

        asyncio.run(serve(atlas_app_asgi, hypercorn_config))
