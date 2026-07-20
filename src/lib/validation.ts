import { z } from "zod";

// Format E.164 : + suivi de 8 à 15 chiffres, pas de zéro en tête après l'indicatif
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const e164PhoneSchema = z
  .string()
  .trim()
  .regex(E164_REGEX, "Numéro invalide — utilisez le format international, ex: +2250700000000");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  whatsappNumber: e164PhoneSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const joinThemeSchema = z.object({
  themeId: z.uuid(),
});
export type JoinThemeInput = z.infer<typeof joinThemeSchema>;
