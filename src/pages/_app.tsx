import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "antd";
import Navbar from "../components/layout/Navbar";
import Header from "../components/layout/Header";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeQueryClient } from "../lib/queryClient";
import Footer from "../components/layout/Footer";

const { Content } = Layout;

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => makeQueryClient());

  // ถ้าหน้าไหนกำหนดว่าเป็น auth page → ไม่ต้องโชว์ Navbar/Header
  const isAuthPage = (Component as any).isAuthPage === true;

  if (isAuthPage) {
    // ใช้ layout ของหน้า Auth ไปเลย
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    );
  }

  // ใช้ layout ปกติ
  const pageTitle = (Component as any).pageTitle ?? "";

  return (
    <QueryClientProvider client={queryClient}>
      <Layout hasSider>
        <Navbar />

        <Layout
          style={{
            marginLeft: 280,
            minHeight: "100vh",
            background: "#fafdff",
          }}
        >
          <Header menu={pageTitle} />

          <Content>
            <Component {...pageProps} />
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </QueryClientProvider>
  );
}
