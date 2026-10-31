import AuthLayout from "../../components/auth/AuthLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="ลืมรหัสผ่าน">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

ForgotPasswordPage.isAuthPage = true;
