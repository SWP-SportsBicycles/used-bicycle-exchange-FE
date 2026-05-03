"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { adminApi } from "@/lib/api/admin-api";
import { useLanguage } from "@/lib/language-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const createInspectorSchema = z.object({
  fullName: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
  phoneNumber: z.string().trim().regex(/^\d{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 ký tự in hoa")
    .regex(/[a-z]/, "Cần ít nhất 1 ký tự thường")
    .regex(/\d/, "Cần ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt"),
});

type CreateInspectorFormValues = z.infer<typeof createInspectorSchema>;

export default function CreateInspectorPage() {
  const { language } = useLanguage();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateInspectorFormValues>({
    resolver: zodResolver(createInspectorSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  const createInspectorMutation = useMutation({
    mutationFn: adminApi.createInspector,
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage(
        language === "vi" ? "Tạo tài khoản kiểm định viên thành công." : "Inspector account created successfully.",
      );
      form.reset();
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "Create inspector failed.");
    },
  });

  const onSubmit = (values: CreateInspectorFormValues) => {
    createInspectorMutation.mutate(values);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === "vi" ? "Tạo Tài Khoản Kiểm Định Viên" : "Create Inspector Account"}
        </h1>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Tạo mới tài khoản kiểm định viên để phân công nhiệm vụ kiểm định."
            : "Create inspector accounts for listing verification assignments."}
        </p>
      </div>

      {successMessage && (
        <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {language === "vi" ? "Thông Tin Kiểm Định Viên" : "Inspector Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "vi" ? "Họ và tên" : "Full name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyen Van A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "vi" ? "Số điện thoại" : "Phone number"}</FormLabel>
                    <FormControl>
                      <Input placeholder="0437655644" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "vi" ? "Mật khẩu" : "Password"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Abc@12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto" disabled={createInspectorMutation.isPending}>
                {createInspectorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === "vi" ? "Tạo Kiểm Định Viên" : "Create Inspector"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
