import { Modal, Button } from "antd";
import Image from "next/image";

export default function ConfirmModal({ open, onBack, onConfirm }: any) {
  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onBack}
      width={400}
      bodyStyle={{
        padding: " 40px 32px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xl font-semibold text-[#F56C33] mb-4">
          ยืนยันออกใบแจ้งหนี้ใหม่อีกครั้ง
        </div>
        <div className="text-gray-500 mb-6 text-sm">
          <div>โปรดตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการต่อ</div>
        </div>
        <Image src="/noti-bell.png" alt="confirm" width={180} height={180} />
        <div className="flex justify-center mt-8 gap-3">
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
            onClick={onConfirm} // ✅ ต้องมี
            style={{
              borderRadius: 20,
              width: 120,
              height: 40,
              background: "#F56C33",
              border: "none",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </Modal>
  );
}
