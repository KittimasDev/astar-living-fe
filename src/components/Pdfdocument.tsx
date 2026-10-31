import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ตั้ง workerSrc ให้ตรง version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfDocument({ pdfUrl }: any) {
  if (!pdfUrl) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Document
        file={{ url: pdfUrl }}
        loading="กำลังโหลด..."
        error="โหลดไม่ได้"
        noData="ไม่มีไฟล์"
      >
        <Page pageNumber={1} width={900} />
      </Document>
    </div>
  );
}
