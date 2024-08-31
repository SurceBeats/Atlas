<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/atlas-logo.png" width="400"></p>

## About The Atlas

The Atlas is a procedural generation engine designed to create vast, complex galaxies and universes. Built with advanced algorithms and some astrophysical phenomena, The Atlas offers an unparalleled toolset for generating realistic and immersive cosmic environments. It has been widely inspired by the team behind No Man's Sky.

## Key Features

- **Procedural Galaxy Creation**: Generate diverse galaxies with unique star systems, planetary bodies, and cosmic events.
- **Universe Simulation**: Simulate the creation of an entire universe.
- **Customizable Parameters**: Fine-tune every aspect of the generation process to create the exact type of universe or galaxy you need, including Physical Constants (pymodules/constants.py).

---

### Version 6: The Dawn of Time

In our latest update, Version 6, we've gone beyond the boundaries of space and added **time** to the universe. Yes, you heard that right. Imagine "The Atlas" not as a square, but as a cube where coordinates span from xyz=0 to xyz=9999999. We've introduced a constant called "cosmic_origin_time" right at the center of the Universe. As minutes tick by, more systems are dynamically added to every galaxy. The closer a galaxy is to the center of the universe, the faster it grows with new systems. The estimated time for the entire universe to fully evolve from the cosmic_origin_time is approximately 2 million years.

<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/cosmic_origin_time_picture.jpg" width="400"></p>

But that's not all. We've also implemented a caching system that stores images for 15 minutes, preventing the need to procedurally generate images for every visit—a resource-intensive task. This cache ensures that if the number of systems dramatically increases since your last visit, it will be reflected in the newly generated images.

Additionally, we've enabled image quality settings for those running on less powerful systems. You can now set the quality from 1 to 100, all in the highly efficient WebP format.

---

## How Big is "The Atlas"?

In "The Atlas," you can explore a universe of staggering proportions. Here's a glimpse of just how immense it is:

- **Number of Galaxies**: The universe can contain up to **1 sextillion** (10²¹) galaxies, each situated within a vast space with coordinates ranging from 0 to 10 million in each direction.
- **Galaxy Types and Sizes**:
  - **Dwarf Galaxies**: Contain between **100,000 and 10 million** solar systems.
  - **Spiral Galaxies**: Typically host between **1 billion and 50 billion** solar systems.
  - **Elliptical Galaxies**: These massive galaxies can contain between **10 billion and 100 billion** solar systems.
- **Total Solar Systems**: Across all galaxies, the universe can have approximately **50 tredecillion** (5 × 10³¹) solar systems.
- **Planets**: Each solar system can have between **1 and 6 planets**, resulting in an estimated **300 tredecillion** (3 × 10³²) planets spread throughout the universe.

These numbers highlight the incredible scale and richness of "The Atlas," where every exploration reveals new galaxies, stars, and worlds within a nearly infinite cosmos.

## Storage Requirements for "The Atlas" Images

If all the image files generated by "The Atlas" during runtime were saved (which is not the case), the storage requirements would be astronomical:

- **Galaxies**: With **1 sextillion** (10²¹) galaxies, each represented by an 800x800px PNG image, the total storage required would be approximately **1,920,000,000 petabytes** (1.92 zettabytes).
- **Solar Systems**: With **50 tredecillion** (5 × 10³¹) solar systems, each represented by an 800x800px PNG image, the total storage required would be approximately **96 yottabytes** (9.6 × 10²² petabytes).
- **Planets**: With **300 tredecillion** (3 × 10³²) planets, each represented by an 800x800px PNG image, the total storage required would be approximately **576 yottabytes** (5.76 × 10²³ petabytes).

### Total Storage

In total, storing the images of all galaxies, solar systems, and planets in "The Atlas" would require around **672 yottabytes** (6.72 × 10²³ petabytes).

These numbers give a sense of the sheer scale of "The Atlas" and the massive data it would generate if fully documented in image form.

### Configuration Made Simple

From the `atlas.ini` file, you can easily disable the cache system or configure the seed of your universe. However, we strongly recommend not altering the cosmic_origin_time—doing so could lead to inconsistencies, and who knows... If you set it high enough, you might just encounter a surprise singularity.

Explore, experiment, and evolve with "The Atlas"—a universe where space and time converge in infinite possibilities.

## How to run it?
- First, install Pillow to enable image generation at runtime and Flask as a webserver. You can do this by running pip install Pillow and pip install Flask, which should work on most systems. After that, run python3 pointing to the folder or python3 __main__.py. Then, open your browser and navigate to the localhost URL. You're all set!
- Alternatively, you can run pip install -r requirements.txt to install both dependencies automatically!

## Demo
- View it live (and slow cause it's free) at https://the-atlas.glitch.me !!!

## Galaxy Screenshots
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/galaxy.png" width="400" alt="The Atlas Logo"></p>
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/galaxy-systems.png" width="400" alt="The Atlas Logo"></p>

## Solar Systems Screenshots
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/system.png" width="400" alt="The Atlas Logo"></p>
<p align="center"><img src="https://github.com/SurceBeats/Atlas/blob/main/public/planets-system.png" width="400" alt="The Atlas Logo"></p>

## Contributing

We welcome contributions to The Atlas! Whether you're fixing bugs, adding features, or improving documentation, your help is greatly appreciated.

## Security Vulnerabilities

If you discover any security vulnerabilities in "Atlas" or "The Atlas", please contact our team immediately at [hello@banshee.pro](mailto:hello@banshee.pro). We take security issues seriously and will address them as quickly as possible.

## License

Copyright © Claudio González Medina
The Atlas is licensed under PolyForm Noncommercial License 1.0.0.
Please refer to the [license overview](https://github.com/SurceBeats/Atlas/blob/main/LICENSE.md) for any questions.

## Important Notice on Commercial Use

This software is licensed under the [PolyForm Noncommercial License 1.0.0](https://github.com/SurceBeats/Atlas/blob/main/LICENSE.md), which prohibits all commercial uses. For clarity, the following activities are considered commercial and are not permitted under this license:

- Creating, selling, or distributing NFTs (Non-Fungible Tokens) or any related digital assets generated by this software.
- Any involvement with cryptocurrencies, including mining, trading, or transactions involving digital currencies.
- Selling artwork, products, assets, or services generated by this software, or distributing them in exchange for tokens, cryptocurrencies, or any other type of blockchain-related compensation.
- Engaging in any activities related to the procedurally generated content produced by this software for commercial gain.

These restrictions ensure the software is used solely for noncommercial purposes, as defined by the license.
