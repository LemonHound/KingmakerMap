-- Insert a new map record
INSERT INTO kingmaker.map (
map_name,
cols,
rows,
hex_scale,
image_scale,
image_scale_horizontal,
image_scale_vertical,
offset_x,
offset_y
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9
)
returning map_id;