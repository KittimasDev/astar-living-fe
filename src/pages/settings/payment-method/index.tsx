import { Layout } from "antd";
import Navbar from "../../../components/layout/Navbar";
import Header from "../../../components/layout/Header";
import PaymentMethodContent from "../../../components/settings/payment-method/PaymentMethodContent";
import { useEffect } from "react";

const { Content } = Layout;

export default function ResidentPage() {
  useEffect(() => {
    document.title = "ตั้งค่าวิธีการชำระเงิน | A star Living"; // ตั้งชื่อแท็บตรงนี้
  }, []);
  return <PaymentMethodContent />;
}

ResidentPage.pageTitle = "ตั้งค่าวิธีการชำระเงิน";
