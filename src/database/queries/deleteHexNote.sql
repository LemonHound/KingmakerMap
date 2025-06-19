UPDATE kingmaker."hex"
SET notes = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(notes) AS elem
    WHERE json_extract_path_text(elem::json, 'id') != $2
)
WHERE hex_id = $1;