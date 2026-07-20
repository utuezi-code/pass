"use client";

import { motion } from "framer-motion";

export default function CategoriesShowcase({
  categories,
}: {
  categories: { id: string; title: string; emoji: string }[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 px-4 py-20 text-neutral-50">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >
          Des sujets qui font vraiment débattre
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-neutral-400"
        >
          Ceux dont tout le monde parle sur les réseaux — en vrai, en visio, à huit.
        </motion.p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((c, i) => (
            <motion.span
              key={c.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ scale: 1.08, y: -4 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur"
              style={{ animation: `float ${5 + (i % 4)}s ease-in-out ${(i % 5) * 0.4}s infinite` }}
            >
              <span>{c.emoji}</span>
              {c.title}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
