import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import SystemLogsContent from "../../components/system-logs/SystemLogsContent";

const { Content } = Layout;

export default function SystemLogPage() {
  return <SystemLogsContent />;
}

SystemLogPage.pageTitle = "บันทึกการทำงานของระบบ";
