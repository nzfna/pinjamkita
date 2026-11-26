-- Opsional: contoh peminjaman supaya kalender menampilkan label "Dipinjam" saat demo.
-- Memakai akun pertama yang terdaftar. Jalankan di Neon SQL Editor.
with o as (
  insert into orders (user_id, status, start_date, end_date, rent_total, deposit_total)
  select (select min(id) from users), 'dipinjam', current_date + 3, current_date + 6, 75000 * 3, 300000
  returning id
)
insert into order_items (order_id, item_id, days, price, start_date)
select o.id, (select id from items where name = 'Proyektor 3600 lumens'), 3, 75000, current_date + 3 from o;

with o as (
  insert into orders (user_id, status, start_date, end_date, rent_total, deposit_total)
  select (select min(id) from users), 'bisa_dipinjam', current_date + 2, current_date + 4, 80000 * 2, 300000
  returning id
)
insert into order_items (order_id, item_id, days, price, start_date)
select o.id, (select id from items where name = 'Tenda dome kapasitas 4'), 2, 40000, current_date + 2 from o;
