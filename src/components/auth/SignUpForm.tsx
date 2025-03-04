"use client";

import * as Yup from "yup";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { loginWithGoogle, loginWithKakao, registerUser } from "@/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { toast as hotToast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

const SignUpForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("SignUpForm");

  // 회원가입 폼 유효성 검증 스키마
  const SignUpSchema = Yup.object().shape({
    name: Yup.string().required(t("validation.nameRequired")),
    email: Yup.string()
      .email(t("validation.emailInvalid"))
      .required(t("validation.emailRequired")),
    password: Yup.string()
      .min(6, t("validation.passwordMinLength"))
      .required(t("validation.passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("validation.passwordMatch"))
      .required(t("validation.confirmPasswordRequired")),
  });

  // 회원가입 폼 초기값
  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  interface ISignUpValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  const handleSignUp = async (
    values: ISignUpValues,
    { setSubmitting }: FormikHelpers<ISignUpValues>
  ) => {
    try {
      setIsLoading(true);
      
      // Server Action을 사용하여 회원가입 처리
      const result = await registerUser(
        values.name,
        values.email,
        values.password
      );

      if (result.success) {
        hotToast.success(t("validation.signupSuccess"));
        
        // 회원가입 성공 후 로그인 페이지로 이동
        router.push("/login");
        router.refresh();
      } else {
        hotToast.error(result.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof Error) {
        hotToast.error(error.message);
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await loginWithGoogle("/");
      
      if (!result.success) {
        hotToast.error(t("validation.googleLoginFailed"));
      }
    } catch (error) {
      hotToast.error(t("validation.googleLoginFailed"));
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await loginWithKakao("/");
      
      if (!result.success) {
        hotToast.error(t("validation.kakaoLoginFailed"));
      }
    } catch (error) {
      hotToast.error(t("validation.kakaoLoginFailed"));
      console.error("Kakao login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={SignUpSchema}
          onSubmit={handleSignUp}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FaUser />
                  </div>
                  <Field
                    as={Input}
                    type="text"
                    name="name"
                    placeholder={t("namePlaceholder")}
                    className="pl-10"
                  />
                </div>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FaEnvelope />
                  </div>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    placeholder={t("email")}
                    className="pl-10"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FaLock />
                  </div>
                  <Field
                    as={Input}
                    type="password"
                    name="password"
                    placeholder={t("password")}
                    className="pl-10"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FaLock />
                  </div>
                  <Field
                    as={Input}
                    type="password"
                    name="confirmPassword"
                    placeholder={t("confirmPassword")}
                    className="pl-10"
                  />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? "Loading..." : t("signupButton")}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center">
          <div className="flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-2 text-xs text-gray-400">{t("or")}</span>
            <Separator className="flex-grow" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {t("googleLogin")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleKakaoSignIn}
            disabled={isLoading}
          >
            {t("kakaoLogin")}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          <span>{t("alreadyHaveAccount")}</span>{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            {t("loginLink")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
