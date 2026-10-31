import { Modal, Button } from "antd";
import Image from "next/image";
import { useState } from "react";

export default function ErrorModal({ open, onBack, message }: any) {
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
          ออกใบแจ้งหนี้
        </div>
        <Image src="/noti-bell.png" alt="confirm" width={180} height={180} />

        <div className="text-gray-500 mt-6 text-sm">
          <div>{message}</div>
        </div>

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
        </div>
      </div>
    </Modal>
  );
}
