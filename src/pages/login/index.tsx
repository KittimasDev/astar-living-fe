import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

function LoginPage() {
  return (
    <AuthLayout title="เข้าสู่ระบบ">
      <LoginForm />
    </AuthLayout>
  );
}

LoginPage.isAuthPage = true;

export default LoginPage;
