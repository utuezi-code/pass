"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    { emoji: "💬", title: t("step1Title"), text: t("step1Text") },
    { emoji: "🙋", title: t("step2Title"), text: t("step2Text") },
    { emoji: "🔥", title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <section className="bg-neutral-950 px-4 py-20 text-neutral-50">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold"
        >
          {t("title")}
        </motion.h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
            >
              <span className="text-4xl">{s.emoji}</span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
