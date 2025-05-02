-- Insert a new map record
INSERT INTO map (
name,
col_count,
row_count,
hex_scale,
image_scale,
image_scale_horizontal,
image_scale_vertical,
offset_x,
offset_y
)
VALUES (
    '$_name$_',
    '$_col_count$_',
    '$_row_count$_',
    '$_hex_scale$_',
    '$_image_scale$_',
    '$_image_scale_horizontal$_',
    '$_image_scale_vertical$_',
    '$_offset_x$_',
    '$_offset_y$_'
);

-- Return the newly inserted map ID
SELECT last_insert_rowid() AS id;