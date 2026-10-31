import { Modal, Table, Button } from "antd";
import { useState } from "react";
import ConfirmExitModal from "../../ConfirmExitModal";

export default function PaymentCreateModal({
  open,
  allData = [], // ✅ แสดงทั้งหมด
  month = "",
  selectedItems = [], // ✅ รายการที่เลือกมาจาก step แรก
  onNext,
  onBack,
  loading,
}: any) {
  const [exitOpen, setExitOpen] = useState(false); // ✅ modal ยืนยันออก
  const [modalPage, setModalPage] = useState(1);

  const pageSize = 10;
  // ✅ columns
  const columns: any = [
    {
      title: "ลำดับที่",
      dataIndex: "no",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (modalPage - 1) * pageSize + index + 1,
    },
    { title: "บ้านเลขที่", dataIndex: "house_no" },
    { title: "ชื่อ-นามสกุล", dataIndex: "full_name" },
    {
      title: "ค่าส่วนกลาง (บาท)",
      dataIndex: "maintenance",
      align: "right",
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ค่าเบี้ยปรับ (บาท)",
      dataIndex: "fine_amount_preview_current_year",
      align: "right",
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "collection_amount",
      align: "right",
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ยอดค้างชำระ (บาท)",
      dataIndex: "debt_total",
      align: "right",
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ยอดที่ต้องชำระ (บาท)",
      dataIndex: "total_preview_current_year",
      align: "right",
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
  ];

  // // ✅ ใช้ข้อมูลทั้งหมด ไม่กรอง
  // const dataSource = allData.map((it: any, idx: number) => ({
  //   key: it.id,
  //   no: idx + 1,
  //   house: it.house,
  //   name: it.name,
  //   fee: "3,787.50",
  //   fine: "378.75",
  //   follow: "200.00",
  //   total: it.amount ?? "4,366.25",
  //   followUpStatus: it.followUpStatus, // แสดงสถานะปัจจุบัน (optional)
  // }));

  // console.log(month);

  return (
    <>
      {/* 🧾 Modal หลัก */}
      <Modal
        open={open}
        onCancel={onBack}
        centered
        footer={null}
        width={1200}
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
        <div className="text-lg mb-4 font-medium">
          รายการออกใบแจ้งหนี้ เดือน{month?.monthTH}
        </div>
        {month?.isSupplement && (
          <div className="text-sm text-[#0054a5] mb-3">
            ออกใบแจ้งหนี้บ้านที่ชำระล่วงหน้าแล้วยังมียอดค้างชำระปีก่อน
            เพื่อส่งให้ทราบจนกว่าจะชำระ
          </div>
        )}

        <Table
          rowKey="key"
          columns={columns}
          dataSource={allData}
          pagination={{
            position: ["bottomCenter"],
            pageSize: pageSize,
            showSizeChanger: false,
            onChange: (page) => setModalPage(page),
          }}
          className="custom-table"
        />

        <div className="text-red-500 text-sm mt-3">
          🔔 การออกใบแจ้งหนี้สามารถทำได้เพียงครั้งเดียวเท่านั้น
          โปรดตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการต่อ *
        </div>

        <div className="flex justify-center mt-6 gap-3">
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
            onClick={() => setExitOpen(true)}
          >
            ย้อนกลับ
          </Button>
          <Button
            type="primary"
            loading={loading} // ⭐ ใส่ loading ของ modal
            disabled={loading} // กันกดซ้ำ
            onClick={() => {
              onNext(selectedItems);
            }} // ✅ ส่งเฉพาะที่เลือกกลับไป
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

      {/* 🚪 Modal ยืนยันออกจากหน้านี้ */}
      <ConfirmExitModal
        open={exitOpen}
        onCancel={() => setExitOpen(false)}
        onConfirm={() => {
          setExitOpen(false);
          onBack(); // ✅ กลับ step ก่อนหน้า
        }}
      />
    </>
  );
}
