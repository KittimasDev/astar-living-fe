import { Modal, Button } from "antd";
import Image from "next/image"; // หรือ import รูปด้วย <img src="" />

interface ResidentSuccessModalProps {
  open: boolean;
  mode?: any;
  onClose: () => void;
}

export default function ProjectSuccessModal({
  open,
  mode = "create",
  onClose,
}: ResidentSuccessModalProps) {
  const isEdit = mode == "edit";
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
      //   style={{
      //     borderRadius: 20,
      //   }}
    >
      <div className="flex flex-col items-center">
        <div className="mb-8 text-xl font-semibold text-[#4CAF50]">
          {isEdit ? "แก้ไขโครงการสำเร็จ" : "เพิ่มโครงการสำเร็จ"}
        </div>
        <Image
          src="/complete.png" // 🟢 ใส่ path รูปของคุณ
          alt="success"
          width={180}
          height={180}
        />
        <Button
          onClick={onClose}
          style={{
            marginTop: 48,
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
