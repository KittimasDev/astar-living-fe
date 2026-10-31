import { Layout } from "antd";
import Navbar from "../../../components/layout/Navbar";
import Header from "../../../components/layout/Header";
import ProjectRateContent from "../../../components/settings/project-rate/ProjectRateContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "ตั้งค่าอัตราค่าบริการ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <ProjectRateContent />;
}

ResidentPage.pageTitle = "ตั้งค่าอัตราค่าบริการ";
