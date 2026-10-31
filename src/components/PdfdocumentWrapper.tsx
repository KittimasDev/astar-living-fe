import dynamic from "next/dynamic";

const PdfDocumentWrapper = dynamic(() => import("../components/Pdfdocument"), {
  ssr: false,
});

export default PdfDocumentWrapper;
