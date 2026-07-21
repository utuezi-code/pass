import { z } from "zod";

type T = (key: string) => string;

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

function e164PhoneSchema(t: T) {
  return z.string().trim().regex(E164_REGEX, t("phoneInvalid"));
}

export function createRegisterSchema(t: T) {
  return z.object({
    fullName: z.string().trim().min(2, t("nameTooShort")).max(100),
    email: z.email(t("emailInvalid")),
    password: z.string().min(8, t("passwordTooShort")),
    whatsappNumber: z
      .union([e164PhoneSchema(t), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    inviteCode: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined)),
  });
}
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

export function createLoginSchema(t: T) {
  return z.object({
    email: z.email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createForgotPasswordSchema(t: T) {
  return z.object({
    email: z.email(t("emailInvalid")),
  });
}
export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export function createResetPasswordSchema(t: T) {
  return z
    .object({
      password: z.string().min(8, t("passwordTooShort")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type ResetPasswordInput = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export const joinThemeSchema = z.object({
  themeId: z.uuid(),
});
export type JoinThemeInput = z.infer<typeof joinThemeSchema>;

export function createThemeSchema(t: T) {
  return z.object({
    categoryId: z.uuid(t("categoryRequired")),
    title: z.string().trim().min(3, t("titleTooShort")).max(120),
    description: z.string().trim().min(10, t("descriptionTooShort")).max(1000),
    scheduledAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), t("dateInvalid"))
      .refine((v) => new Date(v).getTime() > Date.now(), t("dateMustBeFuture")),
  });
}
export type CreateThemeInput = z.infer<ReturnType<typeof createThemeSchema>>;

export function createReportUserSchema(t: T) {
  return z.object({
    reportedId: z.uuid(),
    circleId: z.uuid(),
    reason: z.string().trim().min(5, t("reasonTooShort")).max(500),
  });
}
export type ReportUserInput = z.infer<ReturnType<typeof createReportUserSchema>>;
