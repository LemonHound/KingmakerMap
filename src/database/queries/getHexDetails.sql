select *
from kingmaker."hex"
where x_coord = $1::integer and y_coord = $2::integer and map_id = $3::integer