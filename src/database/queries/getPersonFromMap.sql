select person_id
from kingmaker.person_map
where (
map_id = $1
)