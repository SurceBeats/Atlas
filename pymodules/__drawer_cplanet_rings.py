# pymodules/__drawer_cplanet_rings.py

from PIL import Image, ImageDraw


def draw_full_ring(
    image,
    center_x,
    center_y,
    planet_radius,
    ring_inner_radius,
    ring_outer_radius,
    rng,
    tilt_factor=0.3,
):

    img_size = image.size[0]

    ring_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring_layer)

    ring_draw.arc(
        [
            (center_x - ring_outer_radius, center_y - ring_outer_radius * tilt_factor),
            (center_x + ring_outer_radius, center_y + ring_outer_radius * tilt_factor),
        ],
        start=180,
        end=360,
        fill=(20, 20, 20, 255),
        width=int(ring_outer_radius - ring_inner_radius),
    )

    ring_mask = Image.new("L", (img_size, img_size), 255)
    mask_draw = ImageDraw.Draw(ring_mask)

    mask_draw.ellipse(
        [
            (center_x - planet_radius, center_y - planet_radius),
            (center_x + planet_radius, center_y + planet_radius),
        ],
        fill=0,
    )

    ring_layer.putalpha(ring_mask)

    image.paste(ring_layer, (0, 0), ring_layer)


def draw_ontop_ring(
    image,
    center_x,
    center_y,
    ring_inner_radius,
    ring_outer_radius,
    rng,
    tilt_factor=0.3,
):

    img_size = image.size[0]

    topring_layer = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))
    topring_draw = ImageDraw.Draw(topring_layer)

    topring_draw.arc(
        [
            (center_x - ring_outer_radius, center_y - ring_outer_radius * tilt_factor),
            (center_x + ring_outer_radius, center_y + ring_outer_radius * tilt_factor),
        ],
        start=0,
        end=180,
        fill=(20, 20, 20, 255),
        width=int(ring_outer_radius - ring_inner_radius),
    )

    image.paste(topring_layer, (0, 0), topring_layer)
