import { Layout } from "antd";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import ReceiptContent from "../../components/receipt/ReceiptContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function PaymentPage() {
  useEffect(() => {
    document.title = "ใบเสร็จรับเงิน | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);

  return <ReceiptContent />;
}

PaymentPage.pageTitle = "ใบเสร็จรับเงิน";
