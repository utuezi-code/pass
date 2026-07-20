-- CERCLE — catégories alignées sur les sujets qui font débat sur les
-- réseaux sociaux (politique, sport, économie, etc.), plutôt qu'un simple
-- angle "développement personnel". Aucune ligne de `themes` ne référence
-- encore de catégorie à ce stade : remplacement direct sans migration de
-- données.

delete from public.categories;

insert into public.categories (slug, title, description, emoji) values
  ('politique', 'Politique', 'Actualité politique, débats de société, élections.', '🏛️'),
  ('sport', 'Sport', 'Football et tous les sports qui font vibrer les tribunes.', '⚽'),
  ('economie', 'Économie', 'Marchés, crypto, entrepreneuriat, argent et pouvoir d''achat.', '💰'),
  ('technologie', 'Technologie', 'IA, gadgets, réseaux sociaux, tout ce qui change vite.', '💻'),
  ('culture', 'Culture & Divertissement', 'Films, séries, musique, célébrités, buzz du moment.', '🎬'),
  ('societe', 'Société', 'Actualité, faits de société, débats qui divisent.', '🌍'),
  ('amour', 'Amour & Relations', 'Couple, célibat, amitié, tout ce qui touche au cœur.', '❤️'),
  ('humour', 'Humour & Buzz', 'Memes, tendances virales, ce qui fait rire le timeline.', '😂'),
  ('carriere', 'Carrière', 'Ambitions professionnelles, reconversions, business.', '💼'),
  ('bien-etre', 'Bien-être', 'Santé mentale, habitudes, équilibre de vie.', '🌱')
on conflict (slug) do update
  set title = excluded.title,
      description = excluded.description,
      emoji = excluded.emoji;
