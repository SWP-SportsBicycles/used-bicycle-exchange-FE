"use client";

import { type ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { createQueryClient } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  if (!googleClientId) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
}
