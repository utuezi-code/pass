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

export const forgotPasswordSchema = z.object({
  email: z.email("Email invalide"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const joinThemeSchema = z.object({
  themeId: z.uuid(),
});
export type JoinThemeInput = z.infer<typeof joinThemeSchema>;

export const createThemeSchema = z.object({
  categoryId: z.uuid("Choisissez une catégorie"),
  title: z.string().trim().min(3, "Titre trop court").max(120),
  description: z.string().trim().min(10, "Décrivez un peu plus le sujet").max(1000),
  scheduledAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Date invalide")
    .refine((v) => new Date(v).getTime() > Date.now(), "La date doit être dans le futur"),
});
export type CreateThemeInput = z.infer<typeof createThemeSchema>;

export const reportUserSchema = z.object({
  reportedId: z.uuid(),
  circleId: z.uuid(),
  reason: z.string().trim().min(5, "Décrivez un peu plus la raison").max(500),
});
export type ReportUserInput = z.infer<typeof reportUserSchema>;
