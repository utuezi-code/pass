import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import NewThemeForm from "./NewThemeForm";

export default async function NewThemePage() {
  const supabase = await createClient();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("themesNew")]);
  const { data: categories } = await supabase
    .from("categories")
    .select("id, title, emoji")
    .eq("active", true)
    .order("title");

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-md p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-neutral-50">{t("title")}</h1>
        <p className="mt-1 text-neutral-400">{t("subtitle")}</p>

        <div className="mt-8">
          <NewThemeForm categories={categories ?? []} locale={locale} />
        </div>
      </div>
    </div>
  );
}
