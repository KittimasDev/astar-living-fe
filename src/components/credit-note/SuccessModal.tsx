import { Modal, Button } from "antd";
import Image from "next/image";
import { AiOutlinePrinter } from "react-icons/ai";
import { PaymentAPIs } from "../../networks/payment.api";
import { useState } from "react";

export default function SuccessModal({
  open,
  onClose,
  pdfUrl,
  invoiceResult,
  me,
}: any) {
  const [printLoading, setPrintLoading] = useState(false);

  const handlePrintInvoice = async () => {
    try {
      const paymentId = invoiceResult?.payment?.id || invoiceResult?.payment_id;

      if (!me?.project_id || !paymentId) {
        console.error("Missing project_id or payment_id", {
          projectId: me?.project_id,
          paymentId,
          invoiceResult,
        });
        return;
      }

      setPrintLoading(true);

      const res = await PaymentAPIs.createPaymentPdf(
        me.project_id,
        paymentId,
        {},
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60_000);
    } catch (err) {
      console.error("PDF print error:", err);
    } finally {
      setPrintLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const date = new Date();
    const stamp = date.toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `ใบเสร็จ_${stamp}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const win = window.open("");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Print PDF</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
            }
            embed {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <embed src="${pdfUrl}" type="application/pdf" />
        </body>
      </html>
    `);

    win.document.close();
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onClose}
      width={400}
      bodyStyle={{
        padding: "72px 40px 48px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xl font-semibold text-[#4CAF50] -mt-4 mb-6">
          ลดหนี้สำเร็จ
        </div>

        <Image src="/check.png" alt="success" width={180} height={180} />

        <div className="flex gap-4">
          <Button
            onClick={onClose}
            style={{
              marginTop: 32,
              borderRadius: 20,
              width: 150,
              height: 40,
              borderColor: "#E6E6E6",
              color: "#666",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            ย้อนกลับ
          </Button>

          <Button
            onClick={handlePrintInvoice}
            loading={printLoading}
            disabled={printLoading}
            // icon={!printLoading ? <AiOutlinePrinter /> : undefined}
            style={{
              marginTop: 32,
              borderRadius: 20,
              width: 170,
              height: 40,
              borderColor: "#E6E6E6",
              color: "#666",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            พิมพ์ใบแจ้งหนี้อีกครั้ง
          </Button>
        </div>
      </div>
    </Modal>
  );
}
