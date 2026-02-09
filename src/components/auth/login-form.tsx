import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleAuthButton } from "./google-auth-button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/config/routes";
import type { LoginFormData } from "@/lib/validators";
import { loginSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/services/auth.service";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      await signIn(data.email, data.password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setAuthError(message);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleAuthButton mode="login" />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            {t("login.or")}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div aria-live="polite">
            {authError && (
              <p className="rounded bg-destructive/10 p-2 text-sm text-destructive" role="alert">
                {authError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("login.email")}</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary hover:underline"
              >
                {t("login.forgot_password")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {t("login.submit")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {t("login.no_account")}{" "}
          <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
            {t("login.sign_up_link")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
