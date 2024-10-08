<p align="center"><img style="border-radius: 30px; box-shadow: 0px 5px 5px #7b7b7b;" src="https://github.com/SurceBeats/Atlas/blob/main/public/atlas-logo.jpg" width="400"></p>

<div align="center">
  <img src="https://img.shields.io/github/last-commit/SurceBeats/Atlas" alt="GitHub last commit"/>
  <img src="https://img.shields.io/github/stars/SurceBeats/Atlas?style=social" alt="stars badge"/>
</div>

## About The Atlas

**The Atlas** is a procedural generation engine designed to create vast, complex galaxies and universes. Built with advanced algorithms and inspired by real astrophysical phenomena, _The Atlas_ offers an unparalleled toolset for generating realistic and immersive cosmic environments. It draws inspiration from the team behind _No Man's Sky_ and pushes the boundaries of space simulation.

---

## Key Features

- **Procedural Universe Creation**: Generate diverse galaxies with unique star systems, planetary bodies, and cosmic events.
- **Universe Simulation**: Simulate the creation and evolution of entire universes, complete with expanding galaxies and planetary motion in real time, following real time physics.
- **No Database or Pre-Saved Data**: _The Atlas_ does not rely on any database or predefined data. There is no storage of generated content (other than the cache). Everything is procedurally generated in real-time based purely on algorithms and a single primordial seed, even the images.
- **Procedural Nature of Existence**: The universe, galaxies, planets, and all their characteristics depend on the primal seed and how it is interpreted at the moment of generation. Given the procedural nature everything and nothing exists until we choose to observe it.
- **Customizable Parameters**: Fine-tune every aspect of the generation process, from physical constants to universe seeds, ensuring a personalized experience (editable via `pymodules/__constants.py`).
- **Synchronized Planet and System Rotation**: Planets and systems rotate coherently on screen, with synchronized yet differentiated rotation angles, ensuring visual consistency.
- **Procedural Planetary Ring Generation**: Planets can procedurally generate rings based on Roche limit calculations, with a realistic 5/7% chance of having rings.
- **Optimized Gradient Algorithm**: Automatically aligns the shading gradient with the planet's sun(s), dynamically adjusting transparency and opacity for realistic shadow effects.
- **Fully Synchronized Planetary Rotation**: Planetary rotation and orbital periods are fully synchronized, improving the dynamic accuracy of planetary motion and rendering.
- **Performance Improvements in Image Generation**: Enhanced Pillow-based drawing functions lead to faster rendering and better overall performance.
- **New Universe Initialization System**: Choose between exploring the default universe or creating your own custom universe using a seed-based initialization system.
- **Increased Planet Sizes and Detail**: Planet sizes have been increased by 200%, resulting in more detailed and visually consistent planetary images.
- **Dynamic Seasonal Changes**: Planets experience **seasons**, with temperature variations that depend on the planet's **orbital position** around its star. Temperature recalculations are performed dynamically as the planet moves closer or farther from its star using the **inverse square law of radiation**.

---

### Configuration Made Simple

We've recently introduced the _Atlas Initialization Protocol_, a detailed onboarding process that guides you through configuring your universe on its first start. You can now choose between exploring the `Core Continuum` (the default shared universe) or creating your own unique universe via the `Design the Multiverse` option, which uses a seed-based initialization system.

**Stargate links** will only function properly within the `Core Continuum`. If you opt to create a custom universe using the `Design The Multiverse` feature, for stargates to work with others, both parties must have the same `cosmic_origin_time` and seed configured in their `atlas.ini` files. Without this, stargates won’t connect unless your Atlas server is publicly accessible on the internet.

Explore, experiment, and evolve with _The Atlas_—a universe where space and time converge in infinite possibilities.

---

## How Big is "The Atlas"?

In _The Atlas_, you can explore a universe of staggering proportions:

- **Galaxies**: Up to **1 sextillion** (10²¹) galaxies, each located within a vast 10-million-unit coordinate system.
- **Galaxy Types**:
  - **Dwarf Galaxies**: 100,000 to 10 million solar systems.
  - **Spiral Galaxies**: 1 billion to 50 billion solar systems.
  - **Elliptical Galaxies**: 10 billion to 100 billion solar systems.
- **Solar Systems**: Approximately **50 tredecillion** (5 × 10³¹) solar systems across all galaxies.
- **Planets**: Each solar system has 1 to 6 planets, resulting in an estimated **300 tredecillion** (3 × 10³²) planets.

These numbers showcase the incredible scale of _The Atlas_, where every exploration reveals new cosmic wonders within a nearly infinite cosmos.

---

## Storage Requirements for "The Atlas" Images

If all the images generated by _The Atlas_ were stored (which isn't the case), the storage requirements would be astronomical:

- **Galaxies**: **1.92 zettabytes** for 1 sextillion galaxies.
- **Solar Systems**: **96 yottabytes** for 50 tredecillion solar systems.
- **Planets**: **576 yottabytes** for 300 tredecillion planets.

### Total Storage

In total, fully documenting _The Atlas_ in images would require **672 yottabytes** (6.72 × 10²³ petabytes). However, thanks to our cache system, storage isn't an issue.

Even with the cache disabled, images are generated as BLOBs and sent in real-time during execution. While this is not recommended due to the increased server load, it remains an option. When the cache is disabled, no images are stored—everything is generated on-the-fly and discarded after being sent.

---

## Daemon Cache Thread

To optimize performance, we've implemented a **daemon cache thread** that renders and stores images temporarily in `static/cache` for 15 minutes before deleting them. This reduces server load and ensures that images are updated and regenerated with each view, reflecting dynamic changes such as galaxy expansion and planetary rotation.

You can disable the cache in the `atlas.ini` file by setting `enable_cache` to `False` and also adjust the default cache cleanup interval by modifying the `cache_cleanup_time` to suit your preferred time limit.

---

### Important News

Since Version 0.6, we've added **time** to the space, making it possible for you to finally travel through space-time—just as it sounds! The _cosmic_origin_time_ marks the beginning, with `xyz4999999` as the center of the universe, which we named as the **Bit Bang**. As time passes, galaxies dynamically grow and evolve. According to our calculations, the estimated time for the universe to fully evolve from the _cosmic_origin_time_ is **around 4.2 million years**. However, there are artifacts at the edges of the universe, as the growth factor, which is based on distance from the center, approaches zero.

New systems are continually added to galaxies, especially those near the center of the universe, which grow faster than outer systems. Additionally, we've introduced a **real-time simulation** of planetary orbits and rotations. Planets move in real-time based on their physical properties, with dynamic orbital paths and rotations.

<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/cosmic_origin_time_picture.jpg" width="400"></p>

---

## Installation and Running Atlas

To get started with _The Atlas_:

1. Install the required dependencies: `pip install Pillow Flask Hypercorn`.
2. Run `python3 __main__.py`.
3. Open your browser and navigate to `localhost` to select your Universe through the Atlas Initialization Protocol and explore your universe.

Alternatively, you can install all dependencies by running: `pip install -r requirements.txt`.

---

## Demo

Explore _The Atlas_ live at Koyeb.com (and free, so it might be a bit slow):
[The Atlas Demo live on Koyeb.com](https://the-atlas.koyeb.app/)

---

## Screenshots

### Galaxy Screenshots

<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/galaxy.png" width="400"></p>
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/galaxy-systems.png" width="400"></p>

### Solar Systems Screenshots

<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/system.png" width="400"></p>
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/planets-system.png" width="400"></p>

---

## Contributing

We welcome contributions to _The Atlas_! Whether you are fixing bugs, adding features, or improving documentation, your input is greatly appreciated.

---

## Security Vulnerabilities

If you discover any security vulnerabilities, please contact us at [hello@banshee.pro](mailto:hello@banshee.pro). We take security seriously and will address any issues as soon as possible.

---

## License

Created by [Claudio González](https://github.com/SurceBeats) for [Banshee](https://www.banshee.pro/).  
_The Atlas_ is licensed under the PolyForm Noncommercial License 1.0.0.  
Refer to the [license overview](https://github.com/SurceBeats/Atlas/blob/main/LICENSE.md) for more details.

### Important Notice on Commercial Use

This software is licensed under the [PolyForm Noncommercial License 1.0.0](https://github.com/SurceBeats/Atlas/blob/main/LICENSE.md), which prohibits all commercial uses, including but not limited to:

- Creating, selling, or distributing NFTs.
- Using the software for cryptocurrency-related activities.
- Selling artwork or services generated by the software for commercial gain.

These restrictions ensure the software is used solely for noncommercial purposes.

---

## Changelog

Refer to the full [Changelog](https://github.com/SurceBeats/Atlas/blob/main/CHANGELOG.md) for details on all updates, including new features, fixes, and improvements.
