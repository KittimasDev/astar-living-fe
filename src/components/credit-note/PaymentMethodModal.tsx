import {
  Modal,
  Button,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Table,
  InputNumber,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ReceiptAPIs } from "../../networks/receipt.api";
import { PaymentMethodAPIs } from "../../networks/payment_method.api";
import { useMe } from "../../hooks/useMe";
import moment from "moment";
import { CreditNoteAPIs } from "../../networks/credit-note.api";

type InvoiceRow = {
  id: number;
  number: string;
  monthLabel: string;
  items: { id: string; label: string }[];
  total_amount: number;
};

type FormValues = {
  method: any;
  total_amount: string;
  bank?: any;
  bank_name?: string;
  cheque_no?: string;
  issue_date?: any;
  note?: string;
  discount?: any;
};

export default function PaymentMethodModal({
  open,
  invoiceId,
  onBack,
  onNext,
}: {
  open: boolean;
  invoiceId?: number;
  onBack: () => void;
  onNext: (formData: any) => void;
}) {
  // ✅ ใช้ React Hook Form
  const methods = useForm<FormValues>({
    defaultValues: {
      method: null,
      total_amount: "",
      bank: null,
      bank_name: "",
      cheque_no: "",
      issue_date: "",
      note: "",
      discount: 0,
    },
  });

  // const { control, handleSubmit, watch, setValue, reset } = methods;
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;
  const { data: me } = useMe();
  const method = watch("method");
  const [methodOptions, setMethodOptions] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<any>();
  const selectedMethod = methodOptions.find((m) => m.value === method);
  const methodCode = selectedMethod?.code?.toUpperCase();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creditNoteDetail, setCreditNoteDetail] = useState<any>(null);

  const fetchData = async (page = 1, full_name = "") => {
    try {
      const id = me?.project_id;
      setProjectId(id);
      if (!id) return;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [me?.project_id]);

  useEffect(() => {
    if (!open || !invoiceId) return;

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);

        const res = await CreditNoteAPIs.detail(invoiceId);
        const body = res?.data?.body;

        setCreditNoteDetail(body);

        reset({
          method: null,
          total_amount: body?.payment?.total_due || "",
          bank: null,
          bank_name: "",
          cheque_no: "",
          issue_date: moment(),
          note: body?.note || "",
          discount: 0,
        });
      } catch (error) {
        console.error("Fetch credit note detail error:", error);
        setCreditNoteDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [open, invoiceId, reset]);

  useEffect(() => {
    if (!open) return;

    PaymentMethodAPIs.getAll({})
      .then((res) => {
        const data = res?.data?.body || [];
        const opts = data
          .filter((x: any) => x.active)
          .map((x: any) => ({
            value: x.id,
            label: x.name,
            code: x.code,
          }));
        setMethodOptions(opts);

        // ✅ ตั้ง default เป็น "เงินสด" ถ้ามี
        const cash = opts.find((x: any) => x.code.toUpperCase() === "CASH");
        if (cash) {
          setValue("method", cash.value);
          setValue("issue_date", moment()); // ← แก้แล้ว
        }
      })
      .catch((err) => {
        console.error("Failed to load payment methods:", err);
        setMethodOptions([]);
      });
  }, [open, setValue]);

  useEffect(() => {
    const selected = methodOptions.find((m) => m.value === method);
    const code = selected?.code?.toUpperCase();

    if (code === "CASH") {
      setValue("issue_date", moment());
    } else {
      setValue("issue_date", null);
    }
  }, [method, methodOptions, setValue]);

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <div className="text-red-500 text-xs mt-1">{msg}</div> : null;

  //   const total = invoices.reduce((sum, x) => sum + (x.amount || 0), 0);
  const columns = [
    {
      title: "รายการ",
      dataIndex: "description",
      key: "description",
      width: "55%",
    },
    {
      title: "จำนวนหน่วย",
      dataIndex: "quantity",
      key: "quantity",
      align: "right" as const,
      width: "15%",
    },
    {
      title: "ราคาต่อหน่วย (บาท)",
      dataIndex: "unit_price",
      key: "unit_price",
      align: "right" as const,
      width: "15%",
      render: (value: number) =>
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "รวมทั้งหมด (บาท)",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      width: "15%",
      render: (value: number) =>
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const payload = {
        note: data.note,
      };

      onNext(payload);
    } finally {
      setLoading(false);
    }
  };

  const payment = creditNoteDetail?.payment;
  const resident = creditNoteDetail?.resident;

  const thaiShortMonths = [
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

  const formatMonthYearLabel = (
    month?: number | string,
    year?: number | string,
  ) => {
    const m = Number(month);
    const y = Number(year);
    if (!m || !y) return "";

    return `${thaiShortMonths[m - 1]} ${String(y).slice(-2)}`;
  };

  const currentMonthYearLabel = formatMonthYearLabel(
    payment?.month,
    payment?.year,
  );
  const previousMonthYearLabel = formatMonthYearLabel(
    payment?.month && payment?.year
      ? Number(payment.month) === 1
        ? 12
        : Number(payment.month) - 1
      : undefined,
    payment?.month && payment?.year
      ? Number(payment.month) === 1
        ? Number(payment.year) - 1
        : Number(payment.year)
      : undefined,
  );

  const detailRows = creditNoteDetail
    ? [
        {
          id: "amount_due",
          name: `ค่าส่วนกลาง${currentMonthYearLabel ? ` (${currentMonthYearLabel})` : ""}`,
          unit: 1,
          price: Number(payment?.amount_due || 0),
          total: Number(payment?.amount_due || 0),
        },
        {
          id: "collection_fee",
          name: `ค่าทวงถาม${previousMonthYearLabel ? ` (${previousMonthYearLabel})` : ""}`,
          unit: 1,
          price: 0,
          total: 0,
          isRed: true,
        },
        {
          id: "fine",
          name: `ค่าเบี้ยปรับ${previousMonthYearLabel ? ` (${previousMonthYearLabel})` : ""}`,
          unit: 1,
          price: 0,
          total: 0,
          isRed: true,
        },
      ]
    : [];

  const totalAmount = detailRows.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  <Table
    columns={columns}
    dataSource={detailRows}
    rowKey="id"
    pagination={false}
    rowClassName={(record: any) => (record.isRed ? "credit-note-red-row" : "")}
  />;

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={1100}
      onCancel={onBack}
      bodyStyle={{
        padding: "24px 32px",
        borderRadius: 16,
        maxHeight: "80vh",
        overflowY: "auto",
        background: "#fff",
      }}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      <div className="text-center text-[18px] font-semibold mb-2 mt-4">
        การลดหนี้
      </div>

      <div className="text-[14px] mb-6">
        <div>เลขที่ใบแจ้งหนี้: {payment?.inv_no || "-"}</div>
        <div>ชื่อ: {resident?.full_name || "-"}</div>
        <div>บ้านเลขที่: {resident?.house_no || "-"}</div>
        <div>
          ยอดเงินที่ชำระ (เดิม){" "}
          <span className="font-bold">
            {Number(payment?.total_due || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>{" "}
          บาท
        </div>
      </div>

      {/* ✅ Table */}
      <Table
        columns={[
          {
            title: "รายการ",
            dataIndex: "name",
            key: "name",
            width: "55%",
            render: (value: string, record: any) => (
              <span className={record.isRed ? "text-red-500" : ""}>
                {value}
              </span>
            ),
          },
          {
            title: "จำนวนหน่วย",
            dataIndex: "unit",
            key: "unit",
            align: "right" as const,
            width: "15%",
            render: (value: string, record: any) => (
              <span className={record.isRed ? "text-red-500" : ""}>
                {value}
              </span>
            ),
          },
          {
            title: "ราคาต่อหน่วย (บาท)",
            dataIndex: "price",
            key: "price",
            align: "right" as const,
            width: "15%",
            render: (value: string, record: any) => (
              <span className={record.isRed ? "text-red-500" : ""}>
                {Number(value || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ),
          },
          {
            title: "รวมทั้งหมด (บาท)",
            dataIndex: "total",
            key: "total",
            align: "right" as const,
            width: "15%",
            render: (value: string, record: any) => (
              <span className={record.isRed ? "text-red-500" : ""}>
                {Number(value || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ),
          },
        ]}
        dataSource={detailRows}
        loading={detailLoading}
        rowKey="id"
        pagination={false}
        bordered
        size="middle"
        className="custom-table"
      />

      {/* ✅ แสดงยอดรวมไว้นอก Table */}
      <div className="flex justify-end mt-4 text-base font-semibold">
        <div className="mr-8">รวมเงินทั้งสิ้น</div>
        <div>
          {totalAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          บาท
        </div>
      </div>

      {/* ✅ ฟอร์ม React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              หมายเหตุ
            </label>
            <Controller
              name="note"
              control={control}
              rules={{
                required: "กรุณากรอกหมายเหตุ",
                maxLength: {
                  value: 50,
                  message: "หมายเหตุต้องไม่เกิน 50 ตัวอักษร",
                },
              }}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    placeholder="กรอกหมายเหตุได้สูงสุด 50 ตัวอักษร"
                    style={{
                      height: 40,
                      borderRadius: 20,
                      borderColor: errors.note ? "#ff4d4f" : "#E6E6E6",
                    }}
                    maxLength={50}
                  />
                  <ErrorText msg={errors.note?.message} />
                </>
              )}
            />
          </Col>
        </Row>

        <div className="text-red-500 text-sm mt-3">
          🔔 กรุณาตรวจสอบยอดก่อนยืนยัน การลดหนี้ไม่สามารถย้อนกลับได้*
        </div>

        {/* ✅ ปุ่ม */}
        <div className="flex justify-center gap-3 mt-4">
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
            htmlType="submit"
            // disabled={!method}
            loading={loading}
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
      </form>
      <style jsx>{`
        .custom-rounded-select .ant-select-selector {
          border-radius: 20px !important;
          height: 40px !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
        }

        .ant-picker {
          border-radius: 20px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }

        .ant-input {
          border-radius: 20px !important;
          height: 40px !important;
        }

        .ant-select-selection-item,
        .ant-select-selection-placeholder {
          line-height: 38px !important;
        }

        .custom-rounded-select.ant-select-focused .ant-select-selector {
          border-color: #87d2f7 !important;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3) !important;
        }

        .text-center-number input {
          text-align: center;
        }

        .custom-rounded-select input {
          height: 40px;
          line-height: 40px; /* ⭐ ตัวนี้แหละตัวการ */
          padding: 0 0px; /* ตัด padding แนวตั้งทิ้ง */
          text-align: center; /* ถ้าต้องการ */
        }
      `}</style>
    </Modal>
  );
}
