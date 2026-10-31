import { Layout } from "antd";
import Navbar from "../../../components/layout/Navbar";
import Header from "../../../components/layout/Header";
import CollectionNoticeContent from "../../../components/settings/collection-notice-settings/CollectionNoticeContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "เทมเพลตค่าทวงถาม | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <CollectionNoticeContent />;
}

ResidentPage.pageTitle = "ตั้งค่าเทมเพลตค่าทวงถาม";
