UPDATE kingmaker."hex"
SET notes = (
    SELECT jsonb_agg(
        CASE
            WHEN json_extract_path_text(elem::json, 'id') = $2
            THEN jsonb_set(elem, '{text}', $3)
            ELSE elem
        END
    )
    FROM jsonb_array_elements(notes) AS elem
)
WHERE hex_id = $1