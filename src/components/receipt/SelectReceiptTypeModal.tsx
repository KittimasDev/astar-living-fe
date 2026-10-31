import { Modal, Button, Radio } from "antd";
import { useEffect, useState } from "react";

export default function SelectReceiptTypeModal({
  open,
  onNext,
  onCancel,
  data,
}: any) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [receiptType, setReceiptType] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setReceiptType(null);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onCancel}
      width={400}
      bodyStyle={{
        padding: "32px 40px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="text-lg font-medium mb-6">เลือกประเภทใบเสร็จ</div>

      <div
        className="flex flex-col gap-2 mb-4 select-receipt-types"
        style={{ paddingBottom: 12 }}
      >
        <Radio.Group
          value={receiptType}
          onChange={(e) => setReceiptType(e.target.value)}
        >
          <div className="pb-1 mb-4 border-b border-gray-200">
            <Radio value="common">
              <span className="text-[#747474]">ใบเสร็จค่าส่วนกลาง</span>
            </Radio>
          </div>
          <div className="pb-1 mb-2 border-b border-gray-200">
            <Radio value="other">
              <span className="text-[#747474]">ใบเสร็จรายรับอื่นๆ</span>
            </Radio>
          </div>
        </Radio.Group>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <Button
          onClick={onCancel}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
          }}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          disabled={!receiptType}
          onClick={() => onNext(receiptType!)}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            background: "#87D2F7",
            border: "none",
          }}
        >
          ถัดไป
        </Button>
      </div>
    </Modal>
  );
}
