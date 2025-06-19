UPDATE kingmaker."hex"
SET notes = COALESCE(notes, '[]'::jsonb) || jsonb_build_object(
    'id', COALESCE(jsonb_array_length(notes), 0) + 1,
    'player', (select concat(first_name,' ', last_name) from kingmaker.person where person_id = $4),
    'date', now()::text,
    'text', $5::text
)::jsonb
WHERE x_coord = $1::integer and y_coord = $2::integer and map_id = $3::integer;