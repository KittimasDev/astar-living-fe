import AuthLayout from "../../components/auth/AuthLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="เปลี่ยนรหัสผ่าน">
      <ResetPasswordForm />
    </AuthLayout>
  );
}

ResetPasswordPage.isAuthPage = true;
