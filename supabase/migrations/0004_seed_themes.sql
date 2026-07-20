-- CERCLE — thèmes de départ (données de démonstration)

insert into public.themes (slug, title, description, emoji) values
  ('creativite', 'Créativité', 'Partagez vos projets créatifs et trouvez de l''inspiration à huit.', '🎨'),
  ('carriere', 'Carrière', 'Discutez ambitions professionnelles et transitions de carrière.', '💼'),
  ('bien-etre', 'Bien-être', 'Un espace pour parler santé mentale, habitudes et équilibre de vie.', '🌱'),
  ('voyage', 'Voyage', 'Échangez récits de voyage et projets d''expatriation.', '✈️')
on conflict (slug) do nothing;
