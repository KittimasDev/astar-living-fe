import { Modal, Button, Table } from "antd";

export default function PreInvoiceSummaryModal({
  open,
  preview, // ← รับข้อมูลจาก API previewInvoice
  onBack,
  onNext,
}: any) {
  const columns: any = [
    { title: "รายการ", dataIndex: "desc", key: "desc" },
    { title: "จำนวนหน่วย", dataIndex: "unit", align: "right" },
    { title: "ราคาต่อหน่วย (บาท)", dataIndex: "price", align: "right" },
    { title: "รวมทั้งหมด (บาท)", dataIndex: "total", align: "right" },
  ];

  // ป้องกันไม่มีข้อมูล
  const summary = preview?.summary ?? {};
  const resident = preview?.resident ?? {};

  const data = [
    {
      desc: summary?.months || "-",
      unit: summary?.units || 0,
      price: summary?.price_per_unit?.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
      }),
      total: summary?.total?.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
      }),
    },
  ];

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={800}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="mb-4">
        <div className="text-center font-semibold text-lg mt-4">ใบแจ้งหนี้</div>

        <div>{resident?.name}</div>
        <div>บ้านเลขที่ {resident?.house_no}</div>

        <div className="mt-4 -mb-2">รายการชำระเงิน</div>
      </div>

      <Table
        className="custom-table"
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      {/* total row */}
      <div className="flex justify-between text-right font-semibold py-1 px-4 border-b border-gray-200 bg-[#f0f9ff]">
        <div>รวม</div>
        <div>
          {summary?.total?.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-6">
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
          onClick={onNext}
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
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}
