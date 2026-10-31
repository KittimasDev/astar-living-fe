import { Layout } from "antd";
import { useEffect } from "react";
import CreditNoteContent from "../../components/credit-note/CreditNoteContent";

const { Content } = Layout;

export default function CreditNotePage() {
  useEffect(() => {
    document.title = "ลดหนี้ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);

  return <CreditNoteContent />;
}

CreditNotePage.pageTitle = "ลดหนี้";
