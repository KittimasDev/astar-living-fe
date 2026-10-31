import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import PaymentContent from "../../components/payment/PaymentContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function PaymentPage() {
  useEffect(() => {
    document.title = "ใบแจ้งหนี้ | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <PaymentContent />;
}

PaymentPage.pageTitle = "ใบแจ้งหนี้";
