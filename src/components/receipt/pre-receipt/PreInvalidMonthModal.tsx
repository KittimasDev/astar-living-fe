import { Modal, Button } from "antd";

export default function PreInvalidMonthModal({ open, onBack }: any) {
  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={400}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="text-center pt-6 pb-3">
        <div className="text-[#F44336] text-xl font-semibold mb-4">
          ไม่สามารถเลือกข้ามเดือนได้
        </div>
        <div className=" text-sm mb-12">
          กรุณาเลือกเดือนที่ต่อเนื่องกัน เช่น ม.ค. → ก.พ. → มี.ค.
        </div>
        <Button
          className=""
          onClick={onBack}
          type="primary"
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
      </div>
    </Modal>
  );
}
