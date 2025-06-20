update kingmaker."hex" SET (
    hex_name,
    is_explored,
    is_controlled,
    is_visible
) = (
$4,
$5,
$6,
$7
)
where map_id = $1 and x_coord = $2 and y_coord = $3
returning hex_id
