# Changelog

## [0.6.143] - 2024-08-31
- Enhanced seed handling by deriving the provided seed from `atlas.ini` into a SHA-256 hash and converting it to a base-10 integer, ensuring consistency and eliminating issues related to floating-point precision.
- Added `__boot_messaging.py` to handle and display detailed application boot information in a structured format.
- Implemented a more informative boot message that includes both the raw UNIX timestamp (`cosmic_origin_time`) and its human-readable date-time equivalent.
- Improved the display of cache cleanup time by showing the value in both seconds and minutes for better clarity.

## [0.6.142] - 2024-08-31
- Synchronization of project files.

## [0.6.141] - 2024-08-31
- Repeated commit, no new changes.

## [0.6.140] - 2024-08-31
- Updated versioning information in the README.

## [0.6.139] - 2024-08-31
- Reshaped and refined the structure of the README file.

## [0.6.138] - 2024-08-31
- General updates and improvements to the README content.

## [0.6.137] - 2024-08-31
- Clarified the non-commercial use policy in the README.

## [0.6.136] - 2024-08-31
- Explicitly stated that NFTs and cryptocurrencies fall under commercial purposes and are restricted.

## [0.6.135] - 2024-08-31
- Updated the software license to further restrict commercial use, including NFTs and cryptocurrencies.

## [0.6.131] - 2024-08-30
- Fixed a logic issue where `atlas.ini` was accessed before it was created, preventing potential errors if it wasn't there yet.

## [0.6.130] - 2024-08-30
- Major update: Introduced cosmic_origin_time and a time-based generative process for the universe (2my to fully expand). Added new galaxy type "Singularity Void" for exploring pre-creation states.

## [0.6.12] - 2024-08-30
- Fixed automatic generation of `atlas.ini` if it is missing to ensure proper configuration setup.

## [0.6.5] - 2024-08-30
- Implemented autogeneration of `atlas.ini` and ensured smoother initialization.

## [0.6.2] - 2024-08-30
- Implemented caching system and configuration file (`atlas.ini`). Made minor tweaks to `spaceTravel.js`. Added daemon thread for cache cleanup. Updated versioning.

## [0.6.1] - 2024-08-30
- Updated versioning information. Transitioned from development to production mode. Why is this happening all the time?

## [0.5.54] - 2024-08-30
- Added placeholder image content below stars animation throughout the project for future use.

## [0.5.53] - 2024-08-30
- Revamped the CSS for a more modern and consistent design.

## [0.5.52] - 2024-08-30
- Added stars loading animations to enhance user experience during data processing and image generation.

## [0.5.49] - 2024-08-29
- Updated versioning system. Redesigned the cave structures to eliminate redundancies and improve performance.

## [0.5.48] - 2024-08-29
- Improved readability of planet summary numbers using Jinja2.

## [0.5.42] - 2024-08-29
- Added molten core features and extra layers for procedural functions. Improved versioning consistency.

## [0.5.35] - 2024-08-29
- Enhanced magma type planet effects and refined planet formation logic.

## [0.5.34] - 2024-08-29
- Fixed some __constants.py on summaries, added more planet forms, improved toxic planet representation, and enhanced observer search functionality.

## [0.5.33] - 2024-08-28
- Minor non-development related changes.

## [0.5.30] - 2024-08-28
- Improved element selection for versioning, refined weights, duplicated element removal, enhanced planet statistics and toxic planet representation.

## [0.5.29] - 2024-08-28
- Continued development on toxic planet generation, addressing additional challenges.

## [0.5.26] - 2024-08-28
- Added new metallic forms for planets, improving complexity and super-hyper-2d-realism.

## [0.5.25] - 2024-08-28
- Redesigned cave structures using new design methods for better procedural generation.

## [0.5.24] - 2024-08-28
- Continued versioning improvements and redesigned up to forest environments. Separated and refactored planet formation logic.

## [0.5.21] - 2024-08-28
- Enhanced swamp representation and updated versioning system, one more time.

## [0.5.20] - 2024-08-28
- Improved representation of arid environments and added noise effects for better "realism" lol.

## [0.5.19] - 2024-08-28
- Enhanced lava world design and fixed missing error template in CSS.

## [0.5.17] - 2024-08-27
- Updated versioning and transitioned from development to production mode, ensuring debug mode is disabled... Again.

## [0.5.16] - 2024-08-27
- Added tritium as a new element and made minor tweaks to the Icy planets generation formula.

## [0.5.13] - 2024-08-27
- Added multiseed functionality in `__config.py` to enhance randomness and variety in generated content.

## [0.5.9] - 2024-08-27
- Updated versioning information.

## [0.5.4] - 2024-08-27
- Implemented different image quality settings for various types of images and improved desert representation.

## [0.5.2] - 2024-08-27
- Refined oceanic shapes for better accuracy and visual appeal.

## [0.5.1] - 2024-08-27
- Enhanced the representation of rocky and icy planets for greater "realism".

## [0.4.34] - 2024-08-27
- Minor production-related update with no significant changes.

## [0.4.30] - 2024-08-27
- Added new element "Divinium" (from now on Z-Divinium), improved gas giant and anomaly shapes, fully refactored planet and atmosphere generators, and standardized auxiliary function naming conventions.

## [0.4.29] - 2024-08-27
- Improved WebP image quality for better performance and visual clarity.

## [0.4.27] - 2024-08-26
- Fixed inconsistencies in life form generation due to hashing issues.

## [0.4.26] - 2024-08-26
- Testing new ideas.

## [0.4.25] - 2024-08-26
- Nearly completed refactor of `image_utils` to remove unnecessary GPT code and improve efficiency.

## [0.4.20] - 2024-08-26
- Minor production-related update hehehehe.

## [0.4.19] - 2024-08-26
- Addressed missing version information in project files.

## [0.4.14] - 2024-08-26
- Enhanced naming conventions and added complex drawing patterns linked to derived seed hashes.

## [0.4.12] - 2024-08-26
- Fixed a significant issue where "the observer" module (to scan the universe when launched with the args --observer) was incorrectly interpreted.

## [0.4.11] - 2024-08-25
- Minor CSS fixes to improve overall user interface and styling.

## [0.4.10] - 2024-08-25
- Updated version hash loaded in JS, added more names and suffixes for planets, improved planet type diversity, and ensured consistent seed generation and reseeding.

## [0.4.8] - 2024-08-25
- Synchronized typo fixes across the project.

## [0.4.4] - 2024-08-25
- Fixed naming issues, enhanced seedmaster functionality by using base64 derived seeds, improved representations, and added new names.

## [0.4.3] - 2024-08-23
- Corrected issues with visited links in version history.

## [0.4.2] - 2024-08-23
- Removed unused images and cleaned up project resources.

## [0.4.1] - 2024-08-23
- Major update: Introduced stargate system, improved mapper logic (stargate in new versions), refactored JavaScript code, enhanced content generation stability, and added historical view and session detection.

## [0.3.30] - 2024-08-23
- Fixed URL issues to ensure proper functioning.

## [0.3.29] - 2024-08-22
- Updated Glitch.me URL and project information.

## [0.3.28] - 2024-08-22
- Fixed issues related to version control that were previously overlooked.

## [0.3.26] - 2024-08-22
- Added localization support, enhanced Vanilla JS integration.

## [0.3.24] - 2024-08-22
- Introduced new life forms, improved representations, and enhanced versioning.

## [0.3.21] - 2024-08-22
- Improved storage management, optimizing performance.

## [0.3.20] - 2024-08-22
- Additional improvements to storage capabilities.

## [0.3.19] - 2024-08-22
- Further enhancements to storage systems.

## [0.3.17] - 2024-08-22
- Corrected calculation errors to improve accuracy.

## [0.3.14] - 2024-08-22
- Updated the README to reflect new features and improvements.

## [0.3.11] - 2024-08-22
- Added demo link to Glitch for live testing.

## [0.3.10] - 2024-08-22
- Removed unnecessary placeholder images.

## [0.3.9] - 2024-08-22
- Added favicon partial to Jinja2 for better project branding.

## [0.3.8] - 2024-08-22
- Fixed issues related to pip3 usage, improving dependency management.

## [0.3.7] - 2024-08-22
- Minor README updates to correct information.

## [0.3.4] - 2024-08-22
- Updated project requirements to ensure compatibility with latest dependencies.

## [0.3.3] - 2024-08-22
- Improved Flask session management for better user experience.

## [0.3.1] - 2024-08-22
- Enhanced representation of black holes, quasars, and pulsars. Replaced storage with image blobs for better performance.

## [0.2.37] - 2024-08-21
- New synchronization of project files.

## [0.2.36] - 2024-08-21
- Continued synchronization to ensure all files are up-to-date. I hate this, more.

## [0.2.35] - 2024-08-21
- Final sync to confirm all changes are properly integrated. I hate this.

## [0.2.31] - 2024-08-21
- Test commit using pre-commit hook for code quality assurance.

## [0.2.29] - 2024-08-21
- Further synchronization to align all project files.

## [0.2.22] - 2024-08-21
- Completed synchronization to ensure consistency across the project.

## [0.2.16] - 2024-08-21
- Finished alpha stage, moving towards beta. Improved planet generation accuracy.

## [0.2.15] - 2024-08-21
- Made significant progress on planet generation, ensuring stability and performance.

## [0.2.14] - 2024-08-21
- Captured and added screenshots of generated planets.

## [0.2.12] - 2024-08-21
- There's no 3D yet so... No support due to performance concerns.

## [0.2.4] - 2024-08-21
- Made general improvements and refinements to the project.

## [0.2.1] - 2024-08-21
- Fixed issues related to image generation and display.

## [0.1.3] - 2024-08-21
- Initial updates to the README for better documentation.

## [0.1.2] - 2024-08-21
- Resynchronized files to ensure consistency after initial commit.

## [0.1.1] - 2024-08-21
- Reset the project to resolve previous issues and prepare for further development.

## [0.0.2] - 2024-08-21
- Initial commit to set up the project structure.

## [0.0.1] - 2024-08-21
- Created initial setup files for project initialization.
