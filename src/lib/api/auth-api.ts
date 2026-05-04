import { http } from "@/lib/api/http";

export type AuthRole = 1 | 2 | 3 | 4;

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    role?: AuthRole | string;
  };
}

export interface SignUpPayload {
  fullName: string;
  phoneNumber?: string;
  email: string;
  password: string;
  role: AuthRole;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

function normalizeAuthSession(payload: unknown): AuthSession {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid auth response");
  }

  const maybe = payload as Record<string, unknown>;
  const nested = maybe.data && typeof maybe.data === "object" ? (maybe.data as Record<string, unknown>) : undefined;

  const accessToken =
    (typeof maybe.accessToken === "string" && maybe.accessToken) ||
    (typeof maybe.token === "string" && maybe.token) ||
    (nested && typeof nested.accessToken === "string" && nested.accessToken) ||
    "";

  if (!accessToken) {
    throw new Error("Auth response does not include access token");
  }

  const refreshToken =
    (typeof maybe.refreshToken === "string" && maybe.refreshToken) ||
    (nested && typeof nested.refreshToken === "string" && nested.refreshToken) ||
    undefined;

  const userCandidate =
    (maybe.user && typeof maybe.user === "object" ? (maybe.user as Record<string, unknown>) : undefined) ||
    (nested && nested.user && typeof nested.user === "object" ? (nested.user as Record<string, unknown>) : undefined);

  const user = userCandidate
    ? {
        id: typeof userCandidate.id === "string" ? userCandidate.id : undefined,
        fullName:
          (typeof userCandidate.fullName === "string" && userCandidate.fullName) ||
          (typeof userCandidate.name === "string" && userCandidate.name) ||
          undefined,
        email: typeof userCandidate.email === "string" ? userCandidate.email : undefined,
        role:
          typeof userCandidate.role === "string" || typeof userCandidate.role === "number"
            ? (userCandidate.role as string | AuthRole)
            : undefined,
      }
    : undefined;

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export const authApi = {
  async signup(payload: SignUpPayload) {
    return http.post<unknown>("/api/Auth/signup", payload);
  },

  async signin(payload: SignInPayload) {
    const response = await http.post<unknown>("/api/Auth/signin", payload);
    return normalizeAuthSession(response);
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    return http.post<unknown>("/api/Auth/verify-otp", payload);
  },

  async resendOtp(email: string) {
    return http.post<unknown>("/api/Auth/resend-otp", { email });
  },

  async googleLogin(idToken: string, role?: AuthRole) {
    const response = await http.post<unknown>("/api/Auth/google-login", { idToken, role });
    return normalizeAuthSession(response);
  },

  async forgotPassword(email: string) {
    return http.post<unknown>("/api/Auth/forgot-password", { email });
  },

  async resetPasswordByLink(token: string, payload: ResetPasswordPayload) {
    return http.post<unknown>(`/api/Auth/reset-password-by-link?token=${encodeURIComponent(token)}`, payload);
  },

  async getMe() {
    return http.get<unknown>("/api/Auth/me");
  },

  async changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return http.post<unknown>("/api/Auth/change-password", payload);
  },

  async updatePhone(phoneNumber: string) {
    // BE expects raw string body, not an object
    return http.put<unknown>("/api/Auth/update-phone", phoneNumber);
  },
};
