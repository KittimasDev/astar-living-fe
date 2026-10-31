import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import PaymentContent from "../../components/payment/PaymentContent";
import { useEffect } from "react";
import OverdueContent from "../../components/overdue/OverdueContent";

const { Content } = Layout;

export default function PaymentPage() {
  useEffect(() => {
    document.title = "รายการค้างชำระ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <OverdueContent />;
}

PaymentPage.pageTitle = "รายการค้างชำระ";
