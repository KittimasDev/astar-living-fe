import { Modal, Button } from "antd";
import Image from "next/image";
import { useState } from "react";

export default function ConfirmModal({ open, onBack, onConfirm }: any) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirm = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await onConfirm(); // ถ้าไม่มี throw -> success
    } catch (err: any) {
      const msg = err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onBack}
      width={400}
      bodyStyle={{
        padding: "40px 32px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xl font-semibold text-[#F56C33] mb-4">
          ยืนยันออกใบแจ้งหนี้
        </div>
        <div className="text-gray-500 mb-6 text-sm">
          <div>การออกใบแจ้งหนี้สามารถทำได้เพียงครั้งเดียวเท่านั้น</div>
          <div>โปรดตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการต่อ</div>
        </div>
        <Image src="/noti-bell.png" alt="confirm" width={180} height={180} />

        {/* ✅ แสดงข้อความ error */}
        {errorMsg && (
          <div
            style={{
              color: "#ff4d4f",
              marginTop: 16,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </div>
        )}

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
            disabled={loading}
          >
            ย้อนกลับ
          </Button>

          <Button
            type="primary"
            onClick={handleConfirm}
            loading={loading}
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
            {loading ? "ยืนยัน" : "ยืนยัน"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
