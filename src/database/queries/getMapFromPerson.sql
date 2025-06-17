select map_id
from kingmaker.person_map
where (
person_id = $1
)