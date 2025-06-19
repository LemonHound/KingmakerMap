INSERT INTO kingmaker.hex (
    map_id,
    hex_name,
    x_coord,
    y_coord,
    is_explored,
    is_controlled,
    is_visible,
    resources
) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
)
returning hex_id