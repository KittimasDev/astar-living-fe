import { Layout } from "antd";
import Navbar from "../../../components/layout/Navbar";
import Header from "../../../components/layout/Header";
import ProjectContent from "../../../components/settings/project/ProjectContent";
import AuthGuard from "../../../components/auth/AuthGuard";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "ตั้งค่าโครงการ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <ProjectContent />;
}

ResidentPage.pageTitle = "ตั้งค่าโครงการ";
