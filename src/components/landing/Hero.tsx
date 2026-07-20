"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EmberField from "./EmberField";
import CircleFormation from "./CircleFormation";
import AuthErrorBanner from "@/components/AuthErrorBanner";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-24 text-center text-neutral-50">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/30 blur-[120px]"
        style={{ animation: "glow-pulse 6s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-red-600/20 blur-[100px]"
        style={{ animation: "glow-pulse 8s ease-in-out infinite 1s" }}
      />
      <EmberField count={35} />

      <div className="relative z-10 mx-auto max-w-xl">
        <AuthErrorBanner />

        <span
          className="inline-block text-6xl"
          style={{ animation: "flame-flicker 3s ease-in-out infinite" }}
        >
          🔥
        </span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 bg-gradient-to-br from-orange-300 via-orange-400 to-red-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl"
        >
          Wiclos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-4 max-w-md text-lg text-neutral-300"
        >
          Politique, argent, amour : les sujets qui fâchent, entre 8 inconnus.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8"
        >
          <CircleFormation />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-10 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="block rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-orange-900/40"
            >
              Créer un compte
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="block rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white/90 backdrop-blur"
            >
              Se connecter
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-5"
        >
          <Link
            href="/themes"
            className="text-sm font-medium text-neutral-400 underline-offset-4 transition hover:text-orange-400 hover:underline"
          >
            Voir les thèmes en direct →
          </Link>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-16 text-neutral-500"
          aria-hidden
        >
          ↓
        </motion.div>
      </div>
    </section>
  );
}
