import { Modal, Button } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CancelModal({ open, onBack, onNext }: any) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await onNext();
    } catch (err: any) {
      const msg = err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setReason("");
      setErrorMsg(null);
      setLoading(false);
    }
  }, [open]);

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
        <div className="text-xl font-bold text-[#F56C33] mt-4">
          กรุณาระบุเหตุผล
        </div>
        <div className="text-xl font-bold text-[#F56C33] mb-4">
          ในการยกเลิกใบเสร็จ
        </div>
        <TextArea
          rows={4}
          placeholder="ระบุเหตุผลในการยกเลิก"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ marginTop: 12 }}
        />

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
            onClick={() => onNext(reason)}
            disabled={!reason.trim()}
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
            ถัดไป
          </Button>
        </div>
      </div>
    </Modal>
  );
}
