// Les catégories sont des données (table `categories`), pas des messages
// next-intl : ce sont les 10 libellés fixes définis en base, traduits ici
// plutôt que par une table de traduction côté DB pour éviter une migration.
const EN_CATEGORY_TITLES: Record<string, string> = {
  "Amour & Relations": "Love & Relationships",
  "Bien-être": "Wellbeing",
  Carrière: "Career",
  "Culture & Divertissement": "Culture & Entertainment",
  Économie: "Economy",
  "Humour & Buzz": "Humor & Buzz",
  Politique: "Politics",
  Société: "Society",
  Sport: "Sport",
  Technologie: "Technology",
};

export function localizeCategoryTitle(title: string, locale: string): string {
  if (locale !== "en") return title;
  return EN_CATEGORY_TITLES[title] ?? title;
}
