import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/schemas/auth-schema";

describe("loginSchema", () => {
  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "MyP@ss1" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "MyP@ss1" });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    fullName: "Nguyen Van A",
    phoneNumber: "0912345678",
    email: "user@example.com",
    password: "Pass@1word",
    role: "2",
  };

  it("should accept valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("should reject short name", () => {
    expect(registerSchema.safeParse({ ...valid, fullName: "A" }).success).toBe(false);
  });

  it("should reject invalid phone format", () => {
    expect(registerSchema.safeParse({ ...valid, phoneNumber: "123456789" }).success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    expect(registerSchema.safeParse({ ...valid, password: "pass@1word" }).success).toBe(false);
  });

  it("should reject password without digit", () => {
    expect(registerSchema.safeParse({ ...valid, password: "Pass@word" }).success).toBe(false);
  });

  it("should reject password without special char", () => {
    expect(registerSchema.safeParse({ ...valid, password: "Pass1word" }).success).toBe(false);
  });

  it("should only accept role 2 or 3", () => {
    expect(registerSchema.safeParse({ ...valid, role: "2" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...valid, role: "3" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...valid, role: "1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, role: "4" }).success).toBe(false);
  });
});

describe("otpSchema", () => {
  it("should accept valid OTP", () => {
    expect(otpSchema.safeParse({ email: "t@e.com", otp: "123456" }).success).toBe(true);
  });

  it("should reject OTP not exactly 6 chars", () => {
    expect(otpSchema.safeParse({ email: "t@e.com", otp: "12345" }).success).toBe(false);
    expect(otpSchema.safeParse({ email: "t@e.com", otp: "1234567" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("should accept valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "u@e.com" }).success).toBe(true);
  });

  it("should reject invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("should accept matching valid passwords", () => {
    expect(resetPasswordSchema.safeParse({ newPassword: "NewP@ss1", confirmPassword: "NewP@ss1" }).success).toBe(true);
  });

  it("should reject mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({ newPassword: "NewP@ss1", confirmPassword: "Diff@ss1" });
    expect(result.success).toBe(false);
  });

  it("should reject weak new password", () => {
    expect(resetPasswordSchema.safeParse({ newPassword: "weak", confirmPassword: "weak" }).success).toBe(false);
  });
});
