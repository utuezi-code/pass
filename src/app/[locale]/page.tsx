import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import CategoriesShowcase from "@/components/landing/CategoriesShowcase";
import FinalCTA from "@/components/landing/FinalCTA";

export default async function Home() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect({ href: "/themes", locale });
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, title, emoji")
    .eq("active", true)
    .order("title");

  return (
    <div>
      <Hero />
      <HowItWorks />
      <CategoriesShowcase categories={categories ?? []} locale={locale} />
      <FinalCTA />
    </div>
  );
}
