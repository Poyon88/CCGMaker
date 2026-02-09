import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { ForgotPasswordFormData } from "@/lib/validators";
import { forgotPasswordSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const { t } = useTranslation("auth");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const { resetPassword } = await import("@/services/auth.service");
      await resetPassword(data.email);
      setSent(true);
    } catch {
      setSent(true); // Show success even on error to avoid email enumeration
    }
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">
            {t("forgot_password.success")}
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("forgot_password.back_to_login")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t("forgot_password.title")}
        </CardTitle>
        <CardDescription>{t("forgot_password.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("forgot_password.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {t("forgot_password.submit")}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("forgot_password.back_to_login")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
