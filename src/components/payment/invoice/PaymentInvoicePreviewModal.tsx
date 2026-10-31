import { Modal, Button } from "antd";
import Image from "next/image";
import { useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PaymentInvoicePreviewModal({
  open,
  invoices = [],
  onBack,
  onConfirm,
  pdfUrl,
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Modal
      open={open}
      centered
      footer={null}
      style={{ maxWidth: "900px" }}
      bodyStyle={{ padding: 0, background: "#fff" }}
      width={900}
      closable={false}

      //   style={{
      //     borderRadius: 5,
      //     overflow: "hidden",
      //   }}
    >
      {/* ✅ scroll section */}
      <div
        style={{
          height: "65vh",
          background: "#fff",
          // display: "flex",
          overflow: "auto",
        }}
      >
        {pdfUrl && (
          <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} defaultScale={1.48} />
          </Worker>
        )}
      </div>

      {/* ✅ Footer fixed (แยกจากส่วน scroll) */}
      <div
        className="flex justify-center gap-3  py-4 bg-white"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "16px 0",
        }}
      >
        <Button
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
            background: "#fff",
            fontWeight: 500,
          }}
          onClick={onBack}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          onClick={onConfirm}
          //   className="!bg-[#74BA3D] !border-[#74BA3D] w-28"
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            background: "#87D2F7",
            border: "none",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}
