update kingmaker."map" SET (
    map_name,
    offset_x,
    offset_y,
    hex_scale,
    image_scale,
    image_scale_horizontal,
    image_scale_vertical,
    rows,
    cols
) = (
$2,
$3,
$4,
$5,
$6,
$7,
$8,
$9,
$10
) WHERE map_id = $1
returning map_id