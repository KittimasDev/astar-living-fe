import { Modal, Button } from "antd";
import Image from "next/image";
import { AiOutlineDownload, AiOutlinePrinter } from "react-icons/ai";

export default function SuccessCancelModal({ open, onClose }: any) {
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
          ยกเลิกใบเสร็จเรียบร้อยแล้ว
        </div>
        <Image src="/check.png" alt="success" width={180} height={180} />

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
