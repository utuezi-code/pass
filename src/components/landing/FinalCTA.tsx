"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function FinalCTA() {
  const t = useTranslations("finalCTA");

  return (
    <section className="relative overflow-hidden bg-neutral-900 px-4 py-24 text-center text-neutral-50">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/20 blur-[100px]"
        style={{ animation: "glow-pulse 7s ease-in-out infinite" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-lg"
      >
        <h2 className="text-3xl font-bold">{t("title")}</h2>
        <p className="mt-3 text-neutral-400">{t("subtitle")}</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 inline-block"
        >
          <Link
            href="/register"
            className="block rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/40"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
