import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const PHONE_REGEX = /^0\d{9}$/;

export const loginSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(1, "Vui long nhap mat khau"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Ho ten toi thieu 2 ky tu"),
  phoneNumber: z.string().regex(PHONE_REGEX, "So dien thoai phai theo dinh dang 0xxxxxxxxx"),
  email: z.string().email("Email khong hop le"),
  password: z.string().regex(PASSWORD_REGEX, "Mat khau can chu hoa, so, ky tu dac biet va toi thieu 6 ky tu"),
  role: z.union([z.literal("2"), z.literal("3")]),
});

export const otpSchema = z.object({
  email: z.string().email("Email khong hop le"),
  otp: z.string().length(6, "OTP phai gom 6 ky tu"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email khong hop le"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(PASSWORD_REGEX, "Mat khau can chu hoa, so, ky tu dac biet va toi thieu 6 ky tu"),
    confirmPassword: z.string().min(1, "Vui long xac nhan mat khau"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
