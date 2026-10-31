import { Modal, Button } from "antd";
import Image from "next/image";
import { AiOutlineDownload, AiOutlinePrinter } from "react-icons/ai";

export default function SuccessModal({
  open,
  onClose,
  pdfUrl,
  invoiceResult,
}: any) {
  const handleDownload = () => {
    if (!pdfUrl) return;

    const date = new Date();
    const stamp = date.toISOString().slice(0, 10); // 2025-11-19
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `ใบแจ้งหนี้_${stamp}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const win = window.open("");
    if (!win) return; // บราวเซอร์บล็อก popup → ออกเลย

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
        padding: "64px 40px 32px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xl font-semibold text-[#4CAF50] mb-6">
          ออกใบแจ้งหนี้สำเร็จ
        </div>
        <Image src="/check.png" alt="success" width={180} height={180} />

        <div className="flex flex-col gap-3 mt-8 w-2/3">
          <Button
            icon={<AiOutlineDownload size={18} />}
            type="default"
            onClick={handleDownload}
            style={{
              height: 44,
              borderRadius: 8,
              borderColor: "#2196F3",
              color: "#2196F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 8,
              paddingLeft: 20,
            }}
            className="hover:!bg-[#BBDEFB] hover:!border-[#1976D2] hover:!text-[#1976D2]"
          >
            ดาวน์โหลดไฟล์ PDF
          </Button>

          <Button
            icon={<AiOutlinePrinter size={18} />}
            type="default"
            onClick={handlePrint}
            style={{
              height: 44,
              borderRadius: 8,
              borderColor: "#4CAF50",
              color: "#4CAF50",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 8,
              paddingLeft: 20,
            }}
            className="hover:!bg-[#C8E6C9] hover:!border-[#388E3C] hover:!text-[#388E3C]"
          >
            พิมพ์ไฟล์ PDF
          </Button>
        </div>

        <Button
          onClick={onClose}
          style={{
            marginTop: 32,
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
            background: "#fff",
            fontWeight: 600,
          }}
        >
          ย้อนกลับ
        </Button>
      </div>
    </Modal>
  );
}
