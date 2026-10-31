import { Modal, Button } from "antd";
import Image from "next/image";

export default function ErrorModal({ open, onBack }: any) {
  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onBack}
      width={400}
      bodyStyle={{
        padding: "60px 28px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xl font-bold text-[#EB6142] mb-4">
          ไม่สามารถลดหนี้ได้
        </div>

        <div className="text-gray-500 mb-8 text-sm">
          <div>เนี่องจากลูกบ้านมียอดค้างชำระในเดือนก่อน</div>
        </div>

        <Image src="/cant.png" alt="confirm" width={180} height={180} />

        <div className="flex justify-center mt-12 gap-3">
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
