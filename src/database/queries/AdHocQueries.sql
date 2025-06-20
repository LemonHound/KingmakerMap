select * from hex;
select * from map;
select * from person;
select * from person_map;

select *
from person_map
where map_id != '14'

select *
from person

insert into person_map (person_id, map_id) values ('3', '14')

alter table kingmaker.person
add column last_name VARCHAR(255) default null;

update person
set first_name = 'Kevin', last_name = 'Zookski'
where username = 'admin'

delete from person
where username != 'admin'

delete from person_map

select *
from kingmaker.person_map

select *
from kingmaker."hex"
where x_coord = '3' and y_coord = '0'

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'kingmaker'
  AND table_name = 'hex'
  AND column_name = 'notes';

select *
from kingmaker."hex"
where x_coord = '1' and y_coord = '1';

UPDATE kingmaker."hex"
SET notes = COALESCE(notes, '[]'::jsonb) || jsonb_build_object(
    'id', COALESCE(jsonb_array_length(notes), 0) + 1,
    'player', 'admin',
    'date', now()::text,
    'text', 'test note 1'
)::jsonb
WHERE x_coord = '1' and y_coord = '1';

UPDATE kingmaker."hex"
SET notes = (
    SELECT jsonb_agg(
        CASE
            WHEN json_extract_path_text(elem::json, 'id') = '1'
            THEN jsonb_set(elem, '{text}', '"test note 1 - edited"')
            ELSE elem
        END
    )
    FROM jsonb_array_elements(notes) AS elem
)
WHERE hex_id = '1596';

UPDATE kingmaker."hex"
SET notes = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(notes) AS elem
    WHERE json_extract_path_text(elem::json, 'id') = '5'
)
WHERE hex_id = '1539';

select *
from kingmaker.map_links;

SELECT *
FROM information_schema.columns
WHERE table_schema = 'kingmaker'
  AND table_name = 'map_links'