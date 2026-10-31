import AuthGuard from "../../components/auth/AuthGuard";
import DashboardContent from "../../components/dashboard/DashboardContent";

function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

DashboardPage.pageTitle = "แดชบอร์ด";

export default DashboardPage;
