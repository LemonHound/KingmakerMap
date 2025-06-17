select *
from kingmaker.map
where map_id = $1
fetch first 1 row only