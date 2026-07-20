import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import NewThemeForm from "./NewThemeForm";

export default async function NewThemePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, title, emoji")
    .eq("active", true)
    .order("title");

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-md p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-neutral-50">Proposer un thème</h1>
        <p className="mt-1 text-neutral-400">
          Choisissez une catégorie, décrivez votre sujet et fixez une date d&apos;échange. Le
          cercle se forme dès que 8 personnes vous ont rejoint avant cette date.
        </p>

        <div className="mt-8">
          <NewThemeForm categories={categories ?? []} />
        </div>
      </div>
    </div>
  );
}
