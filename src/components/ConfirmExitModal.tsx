import { Modal, Button } from "antd";
import Image from "next/image";

export default function ConfirmExitModal({ open, onCancel, onConfirm }: any) {
  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onCancel}
      width={400}
      zIndex={2000}
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
      <div className="flex flex-col items-center">
        <div className=" text-xl font-semibold text-[#F56C33]">
          ยืนยันออกจากหน้านี้
        </div>
        <div className="mb-8 text-gray-500 text-sm mt-2">
          การเปลี่ยนแปลงอาจไม่ถูกบันทึก
        </div>
        <Image
          src="/exit.png" // 🔶 ใส่ path รูปประตูส้ม
          alt="exit"
          width={180}
          height={180}
        />
        <div className="flex justify-center gap-3 mt-12">
          <Button
            onClick={onCancel}
            style={{
              borderRadius: 20,
              width: 120,
              height: 40,
              borderColor: "#E6E6E6",
              color: "#666",
              background: "#fff",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            style={{
              borderRadius: 20,
              width: 120,
              height: 40,
              background: "#F56C33",
              border: "none",
            }}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </Modal>
  );
}
