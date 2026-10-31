import { Modal, Switch, Button } from "antd";
import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import SuccessModal from "./SuccessModal";
import { PaymentAPIs } from "../../networks/payment.api";

export default function FollowUpEditModal({
  open,
  record,
  onBack,
  onSave,
}: any) {
  const [status, setStatus] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (record) setStatus(record.has_collection_notice || false);
  }, [record]);

  const handleConfirm = () => {
    PaymentAPIs?.update(record?.id, {
      has_collection_notice: !record?.has_collection_notice,
    });

    onSave(status);
  };

  return (
    <>
      {/* 🟢 Modal แก้ไข — render เฉพาะตอนยังไม่เปิด confirm/success */}
      {open && !showConfirm && !showSuccess && (
        <Modal
          open={open}
          centered
          footer={null}
          onCancel={onBack}
          width={400}
          bodyStyle={{
            padding: "48px 40px",
            borderRadius: "20px",
            background: "#fff",
          }}
          style={{
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div className="text-center text-lg font-semibold mb-6">
            แก้ไขการทวงถาม
          </div>

          <div className="flex flex-col items-start mb-6">
            <div className="text-gray-700 font-medium mb-2">สถานะการทวงถาม</div>
            <Switch
              checked={status}
              onChange={setStatus}
              checkedChildren="มีการทวงถาม"
              unCheckedChildren="ไม่มีการทวงถาม"
            />
          </div>

          <div className="flex justify-center mt-8 gap-3">
            <Button
              onClick={onBack}
              style={{
                borderRadius: 20,
                width: 120,
                height: 40,
                borderColor: "#E6E6E6",
                color: "#666",
                background: "#fff",
                fontWeight: 500,
              }}
            >
              ย้อนกลับ
            </Button>
            <Button
              type="primary"
              onClick={() => handleConfirm()} // เปิด confirm
              style={{
                borderRadius: 20,
                width: 120,
                height: 40,
                background: "#87D2F7",
                border: "none",
                color: "#fff",
                fontWeight: 500,
              }}
            >
              แก้ไข
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
