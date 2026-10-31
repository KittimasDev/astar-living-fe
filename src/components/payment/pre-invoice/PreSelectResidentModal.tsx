import { Modal, Table, Input, Button, Radio } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

export default function PreSelectResidentModal({
  open,
  onNext,
  onCancel,
  data,
}: any) {
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchText("");
      setSelectedId(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!searchText) return data;
    return data.filter((d: any) =>
      d.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, data]);

  const columns: any = [
    {
      title: "บ้านเลขที่",
      dataIndex: "house_no",
      key: "house_no",
      align: "center",
      width: 120,
      render: (house: any, record: any) => (
        <Radio
          checked={selectedId === record.id}
          onChange={() => setSelectedId(record.id)}
        >
          {house}
        </Radio>
      ),
    },
    { title: "ชื่อ-นามสกุล", dataIndex: "full_name", key: "full_name" },
  ];

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onCancel}
      width={480}
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
      <div className="text-lg font-medium mb-4">เลือกลูกบ้าน</div>

      <Input
        placeholder="ค้นหาลูกบ้าน"
        prefix={<SearchOutlined />}
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          borderRadius: 20,
          height: 40,
          marginBottom: 16,
        }}
      />

      {/* ✅ ตารางแบบ scroll เห็นประมาณ 5 รายการ */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="id"
        scroll={{ y: 260 }} // ← กำหนดความสูงตาราง (ประมาณ 5 แถว)
        style={{
          marginBottom: 24,
          //   borderRadius: 10,
          //   border: "1px solid #f0f0f0",
        }}
        size="small"
        className="custom-table"
      />

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
          disabled={!selectedId}
          onClick={() => {
            const selected = data.find((d: any) => d.id === selectedId);
            if (selected) onNext(selected);
          }}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            background: "#87D2F7",
            border: "none",
          }}
        >
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}
