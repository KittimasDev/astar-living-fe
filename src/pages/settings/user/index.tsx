import { Layout } from "antd";
import Navbar from "../../../components/layout/Navbar";
import Header from "../../../components/layout/Header";
import UserContent from "../../../components/settings/user/UserContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "ตั้งค่าผู้ใช้งานระบบ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <UserContent />;
}

ResidentPage.pageTitle = "ตั้งค่าผู้ใช้งานระบบ";
