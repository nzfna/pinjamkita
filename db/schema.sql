create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  wa text unique,
  wa_verified boolean not null default false,
  password_hash text,
  google_id text unique,
  notify boolean not null default true,
  reputation int not null default 100,
  created_at timestamptz not null default now()
);
create table if not exists otps (
  user_id int primary key references users(id) on delete cascade,
  wa text not null,
  code text not null,
  expires_at timestamptz not null
);
create table if not exists items (
  id serial primary key,
  name text not null,
  category text not null,
  location text not null,
  price_per_day int not null,
  deposit int not null,
  description text,
  stock int not null default 1,
  available boolean not null default true
);
create table if not exists collections (
  user_id int not null references users(id) on delete cascade,
  item_id int not null references items(id) on delete cascade,
  kind text not null check (kind in ('favorit','tersimpan','waitlist')),
  primary key (user_id, item_id, kind)
);
create table if not exists cart_items (
  user_id int not null references users(id) on delete cascade,
  item_id int not null references items(id) on delete cascade,
  start_date date not null,
  days int not null default 1,
  added_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create table if not exists orders (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  status text not null default 'diajukan' check (status in ('diajukan','bisa_dipinjam','dipinjam','dikembalikan','dibatalkan')),
  start_date date not null,
  end_date date not null,
  rent_total int not null,
  deposit_total int not null,
  pickup_address text,
  pickup_note text,
  pickup_lat double precision,
  pickup_lng double precision,
  return_note text,
  cancel_reason text,
  created_at timestamptz not null default now()
);
create table if not exists order_items (
  order_id int not null references orders(id) on delete cascade,
  item_id int not null references items(id),
  days int not null,
  price int not null,
  start_date date not null,
  primary key (order_id, item_id)
);
