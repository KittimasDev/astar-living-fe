import { Modal, Input, Table, Button, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { CreditNoteAPIs } from "../../networks/credit-note.api";

export default function CreditNoteSelectModal({
  open,
  onNext,
  onCancel,
  onOutstandingError,
}: any) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [data, setData] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>();
  const pageSize = 10;
  const [searchValue, setSearchValue] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  const fetchReduceList = async (page = 1, inv_no?: string) => {
    const res = await CreditNoteAPIs.getReduceList({
      payment_status: "NOT_PAY,PARTIAL_PAY",
      inv_no,
      page,
    });

    setData(res?.data?.body ?? []);
    setPageInfo(res?.data?.page_information ?? null);
  };

  useEffect(() => {
    fetchReduceList();
  }, []);

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);

    fetchReduceList(1, value);
  };

  const columns: any = [
    {
      title: "ลำดับที่",
      dataIndex: "id",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "เลขที่ใบแจ้งหนี้",
      dataIndex: "house",
      render: (_: any, __: any) => __?.payment?.inv_no,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "house",
      render: (_: any, __: any) => __?.resident?.house_no,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      render: (_: any, __: any) => __?.resident?.full_name,
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
      title: "ค่าส่วนกลาง (บาท)",
      dataIndex: "",
      align: "right",
      render: (value: any) => {
        const num = Number(value?.payment?.amount_due) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ค่าเบี้ยปรับ (บาท)",
      dataIndex: "",
      align: "right",
      render: (value: any) => {
        const num = Number(value?.payment?.fine) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "",
      align: "right",
      render: (value: any) => {
        const num = Number(value?.payment?.collection_fee) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ยอดที่ต้องชำระ (บาท)",
      dataIndex: "",
      align: "right",
      render: (value: any) => {
        const num = Number(value?.payment.total_due) || 0;
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
    {
      title: "เดือนและปี",
      align: "center",
      render: (_: any, record: any) => {
        const months = [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
          "ก.ย.",
          "ต.ค.",
          "พ.ย.",
          "ธ.ค.",
        ];

        return `${months[record.month - 1]} ${record.year}`;
      },
    },
  ];

  // const selectedRows = useMemo(
  //   () => data?.filter((d: any) => selectedRowKeys.includes(d.id)),
  //   [data, selectedRowKeys],
  // );

  const handleNext = async () => {
    if (!selectedInvoice) {
      Modal.warning({
        title: "กรุณาเลือกใบแจ้งหนี้",
      });
      return;
    }

    try {
      setLoadingCheck(true);

      const res = await CreditNoteAPIs.check(selectedInvoice.id);

      const previousMonthHasOutstanding =
        res?.data?.body?.previous_month_has_outstanding;

      const message =
        res?.data?.body?.message ||
        "มีรายการค้างชำระของเดือนก่อนหน้า ไม่สามารถดำเนินการต่อได้";

      if (previousMonthHasOutstanding) {
        onOutstandingError(message);
        return;
      }

      onNext(selectedInvoice);
    } catch (error: any) {
      onOutstandingError(
        error?.response?.data?.message || "ไม่สามารถตรวจสอบใบแจ้งหนี้ได้",
      );
    } finally {
      setLoadingCheck(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={1280}
      onCancel={onCancel}
      bodyStyle={{
        padding: "32px 40px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <div className="text-lg pb-2">รายการใบแจ้งหนี้</div>

      <Input
        placeholder="ค้นหาใบแจ้งหนี้"
        prefix={<SearchOutlined />}
        value={searchValue || ""}
        allowClear
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ borderRadius: 20, height: 40, marginBottom: 24 }}
      />

      {/* <Checkbox
        indeterminate={
          selectedRowKeys.length > 0 && selectedRowKeys.length < data?.length
        }
        checked={selectedRowKeys.length === data?.length}
        onChange={(e) =>
          setSelectedRowKeys(
            e.target.checked ? data?.map((i: any) => i.id) : [],
          )
        }
      >
        เลือกทั้งหมด
      </Checkbox> */}
      <div>รายการใบแจ้งหนี้</div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize,
          total: pageInfo?.total ?? 0,
          // onChange: onPageChange,
          onChange: (page) => {
            setCurrentPage(page);
            fetchReduceList(page, searchValue);
          },
          showSizeChanger: false,
        }}
        className="custom-table"
        style={{ marginTop: 12 }}
        rowSelection={{
          type: "radio",
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedInvoice(rows[0] ?? null);
          },
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
          loading={loadingCheck}
          onClick={handleNext}
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
