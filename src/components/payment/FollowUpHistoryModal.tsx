import { Modal, Table, Button, Tag } from "antd";

export default function FollowUpHistoryModal({ open, onBack, record }: any) {
  // mock data — สมมติว่ามาจาก record หรือ API
  const data: any = [
    // {
    //   id: 1,
    //   invoiceNo: "680901010",
    //   year: 2568,
    //   date: "01/09/2568",
    //   fee: 200,
    //   status: "ยังไม่ชำระเงิน",
    // },
    // {
    //   id: 2,
    //   invoiceNo: "680801010",
    //   year: 2568,
    //   date: "01/08/2568",
    //   fee: 200,
    //   status: "ยังไม่ชำระเงิน",
    // },
    // {
    //   id: 3,
    //   invoiceNo: "680701010",
    //   year: 2568,
    //   date: "01/07/2568",
    //   fee: 200,
    //   status: "ชำระเงินแล้ว",
    // },
  ];

  const columns: any = [
    { title: "เลขที่ใบแจ้งหนี้", dataIndex: "invoiceNo", key: "invoiceNo" },
    { title: "ปี (พ.ศ.)", dataIndex: "year", key: "year" },
    { title: "วันที่", dataIndex: "date", key: "date" },
    { title: "ค่าทวงถาม (บาท)", dataIndex: "fee", key: "fee", align: "right" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text: string) =>
        text === "ชำระเงินแล้ว" ? (
          <Tag
            color="#4CAF50"
            className="px-3 py-1 rounded-full text-white"
            style={{ borderRadius: 20, width: 80 }}
          >
            ชำระเงินแล้ว
          </Tag>
        ) : (
          <Tag
            color="#BDBDBD"
            className="px-3 py-1 rounded-full text-gray-600"
            style={{ borderRadius: 20, width: 80 }}
          >
            ยังไม่ชำระเงิน
          </Tag>
        ),
    },
  ];

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={800}
      onCancel={onBack}
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
      <div className="text-lg mb-4">ประวัติการออกใบค่าทวงถาม</div>

      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey="id"
        bordered={false}
        className="custom-table"
      />

      <div className="flex justify-center mt-6">
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
      </div>
    </Modal>
  );
}
