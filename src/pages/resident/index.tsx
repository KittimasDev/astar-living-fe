import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import ResidentContent from "../../components/resident/ResidentContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "ข้อมูลลูกบ้าน | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);

  return <ResidentContent />;
}

ResidentPage.pageTitle = "ข้อมูลลูกบ้าน / ผู้อยู่อาศัย";
