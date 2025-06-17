insert into kingmaker.person (
username,
"password",
is_dm
) values (
    $1,
    $2,
    $3
) returning person_id