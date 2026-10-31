import { Modal, Input, Table, Button, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

export default function PaymentSelectModal({
  open,
  onNext,
  onCancel,
  data,
  searchValue,
  onSearchChange,
}: any) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setPagination({ current: 1, pageSize: 10 });
    }
  }, [open]);

  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "house",
      render: (_: any, __: any) => __?.house_no,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      render: (_: any, __: any) => __?.full_name,
    },
    // {
    //   title: "ยอดคงค้าง (บาท)",
    //   dataIndex: "amount_due",
    //   align: "right",
    //   render: (value: any) => {
    //     const num = Number(value) || 0;
    //     return num.toLocaleString("th-TH", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     });
    //   },
    // },
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
    // {
    //   title: "เดือน",
    //   dataIndex: "month",
    //   align: "center",
    //   render: (value: number) => {
    //     const months = [
    //       "ม.ค.",
    //       "ก.พ.",
    //       "มี.ค.",
    //       "เม.ย.",
    //       "พ.ค.",
    //       "มิ.ย.",
    //       "ก.ค.",
    //       "ส.ค.",
    //       "ก.ย.",
    //       "ต.ค.",
    //       "พ.ย.",
    //       "ธ.ค.",
    //     ];
    //     return months[value - 1] || "-";
    //   },
    // },
  ];

  const selectedRows = useMemo(
    () => data?.filter((d: any) => selectedRowKeys.includes(d.id)),
    [data, selectedRowKeys]
  );

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={850}
      onCancel={onCancel}
      bodyStyle={{
        padding: "32px 40px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <div className="text-lg pb-4">รายการทวงถาม</div>

      <Input
        placeholder="ค้นหาลูกบ้าน"
        prefix={<SearchOutlined />}
        value={searchValue || ""}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        style={{ borderRadius: 20, height: 40, marginBottom: 12 }}
      />

      <Checkbox
        indeterminate={
          selectedRowKeys.length > 0 && selectedRowKeys.length < data?.length
        }
        checked={selectedRowKeys.length === data?.length}
        onChange={(e) =>
          setSelectedRowKeys(
            e.target.checked ? data?.map((i: any) => i.id) : []
          )
        }
      >
        เลือกทั้งหมด
      </Checkbox>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{
          position: ["bottomCenter"],
          pageSize: pagination.pageSize,
          current: pagination.current,
          showSizeChanger: false,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
        className="custom-table"
        style={{ marginTop: 12 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          preserveSelectedRowKeys: true,
        }}
      />

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
          onClick={onCancel}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          onClick={() => onNext(selectedRows)}
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
          ถัดไป
        </Button>
      </div>
    </Modal>
  );
}
