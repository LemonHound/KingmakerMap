select * from hex;
select * from map;
select * from person;
select * from person_map;

delete from person_map
where person_id is null

delete from person
where username = 'tom'

select *
from kingmaker.map
where map_id = '14'
fetch first 1 row only