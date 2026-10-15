-- Run once in Supabase SQL editor. Then create your admin user under Authentication > Users.
create table courses (
  slug text primary key,
  position int not null default 0,
  published boolean not null default true,
  blurred boolean not null default false,  -- teaser: blurred photo, masked text, no detail page
  teacher text not null default '',
  price text not null default '',
  lessons int not null default 0,
  weeks int not null default 0,
  hours int not null default 0,
  title_ro text not null default '',       title_en text not null default '',
  text_ro text not null default '',        text_en text not null default '',
  description_ro text not null default '', description_en text not null default '',
  start_ro text not null default '',       start_en text not null default ''
);

alter table courses enable row level security;
create policy "public reads published" on courses for select using (published);
-- ponytail: any signed-in user is admin; keep public sign-ups disabled in Supabase Auth settings
create policy "admins read all" on courses for select to authenticated using (true);
create policy "admins write" on courses for all to authenticated using (true) with check (true);

insert into courses (slug, position, teacher, price, lessons, weeks, hours, title_ro, title_en, text_ro, text_en, description_ro, description_en, start_ro, start_en) values
('space-and-structure',0,'Sergiu Tronciu','1 500 MDL',16,8,32,'Spațiu și structură','Space & Structure','Logica clădirilor pe care oamenii le iubesc.','The logic behind buildings people love.','Descriere în curând.','Description coming soon.','12 octombrie 2026','12 October 2026'),
('form-and-type',1,'Eugeniu Reabenchii','1 200 MDL',12,6,24,'Formă și literă','Form & Type','Tipografie și sisteme care fac ideile lizibile.','Typography and systems that make ideas legible.','Descriere în curând.','Description coming soon.','19 octombrie 2026','19 October 2026'),
('colour-and-line',2,'Alexandru Frunze','1 200 MDL',12,6,24,'Culoare și linie','Colour & Line','Desen și compoziție, practicate săptămânal.','Drawing and composition, practiced weekly.','Descriere în curând.','Description coming soon.','11 ianuarie 2027','11 January 2027'),
('learning-to-look',3,'Valentin Railean','900 MDL',8,4,16,'Învață să privești','Learning to Look','Compară, alege și argumentează-ți alegerile.','Compare, choose and defend your choices.','Descriere în curând.','Description coming soon.','18 ianuarie 2027','18 January 2027'),
('your-story',4,'Gabriel Turețchi','1 000 MDL',10,5,20,'Povestea ta','Your Story','Transformă-ți lucrările într-o poveste pe care alții vor s-o citească.','Shape your work into a story others want to read.','Descriere în curând.','Description coming soon.','15 martie 2027','15 March 2027'),
('rooms-and-light',5,'Sergiu Tronciu','1 500 MDL',16,8,32,'Încăperi și lumină','Rooms & Light','Materiale, lumină și senzația unei încăperi.','Materials, light and the feeling of a room.','Descriere în curând.','Description coming soon.','22 martie 2027','22 March 2027'),
('eyes-open',6,'Alexandru Frunze','900 MDL',8,4,16,'Ochi deschiși','Eyes Open','Mișcări și maeștri, citiți prin creație.','Movements and masters, read through making.','Descriere în curând.','Description coming soon.','29 martie 2027','29 March 2027'),
('hands-on',7,'Alexandru Fana','1 300 MDL',12,6,24,'Cu mâna','Hands On','Machete, tipărituri și prototipuri făcute manual.','Models, prints and prototypes built by hand.','Descriere în curând.','Description coming soon.','14 iunie 2027','14 June 2027');
