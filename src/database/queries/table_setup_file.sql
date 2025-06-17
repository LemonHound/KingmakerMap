create table person(
    person_id serial primary key,
    username varchar(40) unique,
    password varchar,
    is_dm boolean default false,
    create_time date default current_date,
    update_time date default current_date
)

create table map(
    map_id serial primary key,
    map_name varchar(50) default '',
    offset_x real default 0,
    offset_y real default 0,
    hex_scale real default 1,
    image_scale real default 1,
    image_scale_horizontal real default 1,
    image_scale_vertical real default 1,
    rows integer default 10,
    cols integer default 20
)

create table hex(
    hex_id serial primary key,
    map_id integer references map(map_id),
    is_explored boolean default false,
    is_controlled boolean default false,
    is_visible boolean default true,
    resources jsonb default '[]',
    notes jsonb default '[]'
)

create table person_map(
    person_id integer references person(person_id),
    map_id integer references  map(map_id)
)