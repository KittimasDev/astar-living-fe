import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import CollectionNoticeContent from "../../components/collection-notice/CollectionNoticeContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function CollectionNoticePage() {
  useEffect(() => {
    document.title = "ใบทวงถาม | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);

  return <CollectionNoticeContent />;
}

CollectionNoticePage.pageTitle = "ใบทวงถาม";
