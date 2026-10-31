import {
  Modal,
  Button,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import { InputNumber } from "antd";

export type PreReceiptFormValues = {
  method: "cash" | "transfer" | "cheque";
  amount: string;
  bank: string | null;
  cheque_no: string;
  issue_date: any;
  remark: string;
};

export default function PreReceiptSummaryModal({
  open,
  preview,
  onBack,
  onNext,
}: {
  open: boolean;
  preview: any;
  onBack: () => void;
  onNext: (values: PreReceiptFormValues) => void;
}) {
  const methods = useForm<PreReceiptFormValues>({
    defaultValues: {
      method: "cash",
      amount: preview?.summary?.total ?? "",
      bank: null,
      cheque_no: "",
      issue_date: moment(),
      remark: "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const method = watch("method");
  const [loading, setLoading] = useState(false);
  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <div className="text-red-500 text-xs mt-1">{msg}</div> : null;

  const columns: any = [
    { title: "รายการ", dataIndex: "desc", key: "desc" },
    { title: "จำนวนหน่วย", dataIndex: "unit", align: "right" },
    { title: "ราคาต่อหน่วย (บาท)", dataIndex: "price", align: "right" },
    { title: "รวมทั้งหมด (บาท)", dataIndex: "total", align: "right" },
  ];

  useEffect(() => {
    if (method === "cash") {
      methods.setValue("issue_date", moment()); // วันนี้
    } else {
      methods.setValue("issue_date", null); // reset เมื่อไม่ใช่ cash
    }
  }, [method]);

  const summary = preview?.summary ?? {};
  const resident = preview?.resident ?? {};

  const MONTH_LABELS = [
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

  function formatMonthRange(months: number[], year: number) {
    if (!months.length) return "-";
    const first = MONTH_LABELS[months[0]];
    const last = MONTH_LABELS[months[months.length - 1]];
    const shortYear = String(year).slice(-2);
    if (months.length === 1) {
      return `ค่าส่วนกลางเดือน ${first} ${shortYear}`;
    }
    return `ค่าส่วนกลางเดือน ${first} ${shortYear} - ${last} ${shortYear}`;
  }

  const formattedDesc = (() => {
    const months = summary?.months;
    const year = summary?.year;
    if (Array.isArray(months) && typeof year === "number") {
      return formatMonthRange(months, year);
    }
    return months || "-";
  })();

  const data = [
    {
      desc: formattedDesc,
      unit: summary?.units || 0,
      price: summary?.price_per_unit?.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
      }),
      total: summary?.total?.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
      }),
    },
  ];

  const onSubmit = (values: PreReceiptFormValues) => {
    try {
      setLoading(true);
      onNext(values);

      // methods.reset();
      methods.setValue("issue_date", moment());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && preview?.summary?.total != null) {
      methods.reset();
      methods.setValue("amount", String(preview.summary.total));
    }
  }, [open, preview]);

  return (
    <Modal
      open={open}
      onCancel={onBack}
      centered
      footer={null}
      width={800}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <div className="mb-4">
        <div className="text-center font-semibold text-lg mt-4">
          ใบเสร็จการชำระเงินล่วงหน้า
        </div>

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

      <div className="flex justify-between text-right font-semibold py-1 px-4 border-b border-gray-200 bg-[#f0f9ff]">
        <div>รวม</div>
        <div>
          {summary?.total?.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Row gutter={[16, 16]}>
          {/* METHOD */}
          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              วิธีการชำระเงิน <span className="text-red-500">*</span>
            </label>
            <Controller
              name="method"
              control={control}
              rules={{ required: "กรุณาเลือกวิธีการชำระเงิน" }}
              render={({ field }) => (
                <>
                  <Select
                    {...field}
                    placeholder="เลือกวิธีการชำระเงิน"
                    style={{ width: "100%", height: 40 }}
                    options={[
                      { value: "cash", label: "เงินสด" },
                      { value: "transfer", label: "โอนเงินผ่านธนาคาร" },
                      { value: "cheque", label: "เช็ค" },
                    ]}
                    className="custom-rounded-select"
                  />
                  <ErrorText msg={errors.method?.message as string} />
                </>
              )}
            />
          </Col>

          {/* AMOUNT */}
          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              จำนวนเงินที่จ่าย (บาท) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "กรุณากรอกจำนวนเงิน",
                validate: (v) =>
                  (v && Number(v) > 0) || "จำนวนเงินต้องมากกว่า 0",
              }}
              render={({ field }) => (
                <>
                  <InputNumber
                    {...field}
                    value={summary?.total ?? 0} // ✅ ดึงจาก summary
                    disabled // ❌ แก้ไม่ได้
                    readOnly
                    stringMode
                    precision={2}
                    // className="custom-rounded-select text-center-number"
                    formatter={(value) => {
                      const n = Number(value ?? 0);
                      return n.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    style={{
                      width: "100%",
                      // height: 40,
                      padding: "3px 0",
                      borderRadius: 20,
                      borderColor: "#E6E6E6",
                    }}
                  />
                  <ErrorText msg={errors.amount?.message as string} />
                </>
              )}
            />
          </Col>

          {/* CHEQUE NO */}
          {method === "cheque" && (
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                เลขที่เช็ค <span className="text-red-500">*</span>
              </label>
              <Controller
                name="cheque_no"
                control={control}
                rules={{ required: "กรุณากรอกเลขที่เช็ค" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกเลขที่เช็ค"
                      style={{ height: 40, borderRadius: 20 }}
                    />
                    <ErrorText msg={errors.cheque_no?.message as string} />
                  </>
                )}
              />
            </Col>
          )}

          {/* BANK (transfer or cheque) */}
          {(method === "transfer" || method === "cheque") && (
            <Col span={method === "transfer" ? 24 : 12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ธนาคาร <span className="text-red-500">*</span>
              </label>
              <Controller
                name="bank"
                control={control}
                rules={{
                  required: "กรุณาเลือกธนาคาร",
                }}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      placeholder="เลือกธนาคาร"
                      style={{ width: "100%", height: 40 }}
                      options={[
                        {
                          value: "ธนาคารกสิกรไทย (Kasikornbank / KBank)",
                          label: "ธนาคารกสิกรไทย (Kasikornbank / KBank)",
                        },
                        {
                          value:
                            "ธนาคารไทยพาณิชย์ (Siam Commercial Bank / SCB)",
                          label:
                            "ธนาคารไทยพาณิชย์ (Siam Commercial Bank / SCB)",
                        },
                        {
                          value: "ธนาคารกรุงไทย (Krungthai Bank)",
                          label: "ธนาคารกรุงไทย (Krungthai Bank)",
                        },
                        {
                          value: "ธนาคารกรุงเทพ (Bangkok Bank)",
                          label: "ธนาคารกรุงเทพ (Bangkok Bank)",
                        },
                        {
                          value:
                            "ธนาคารกรุงศรีอยุธยา (Bank of Ayudhya / Krungsri)",
                          label:
                            "ธนาคารกรุงศรีอยุธยา (Bank of Ayudhya / Krungsri)",
                        },
                        {
                          value:
                            "ธนาคารทหารไทยธนชาต (TTB / TMBThanachart Bank)",
                          label:
                            "ธนาคารทหารไทยธนชาต (TTB / TMBThanachart Bank)",
                        },
                        {
                          value: "ธนาคารออมสิน (Government Savings Bank)",
                          label: "ธนาคารออมสิน (Government Savings Bank)",
                        },
                        {
                          value: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)",
                          label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)",
                        },
                        {
                          value: "ธนาคารยูโอบี (UOB)",
                          label: "ธนาคารยูโอบี (UOB)",
                        },
                        {
                          value: "ธนาคารซีไอเอ็มบีไทย (CIMB Thai Bank)",
                          label: "ธนาคารซีไอเอ็มบีไทย (CIMB Thai Bank)",
                        },
                        {
                          value: "ธนาคารอิสลามแห่งประเทศไทย",
                          label: "ธนาคารอิสลามแห่งประเทศไทย",
                        },
                        {
                          value: "ธนาคารอาคารสงเคราะห์",
                          label: "ธนาคารอาคารสงเคราะห์",
                        },
                      ]}
                      className="custom-rounded-select"
                    />
                    <ErrorText msg={errors.bank?.message as string} />
                  </>
                )}
              />
            </Col>
          )}

          {/* PAID DATE */}
          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              วันที่ชำระเงิน <span className="text-red-500">*</span>
            </label>
            <Controller
              name="issue_date"
              control={control}
              rules={{ required: "กรุณาเลือกวันที่ชำระเงิน" }}
              render={({ field: { value, onChange } }) => (
                <>
                  <DatePicker
                    value={value}
                    placeholder="เลือกวันที่ชำระเงิน"
                    onChange={onChange}
                    format="DD/MM/YYYY"
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 20,
                      // background: method === "cash" ? "#f5f5f5" : "#fff",
                    }}
                    className="custom-rounded-select"
                    // disabled={methodCode === "CASH"}
                    disabledDate={(current) =>
                      current && current.isAfter(moment().endOf("day"))
                    }
                  />
                  <ErrorText msg={errors.issue_date?.message as string} />
                </>
              )}
            />
          </Col>

          {/* REMARK */}
          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              หมายเหตุ
            </label>
            <Controller
              name="remark"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="กรอกหมายเหตุ"
                  style={{ height: 40, borderRadius: 20 }}
                />
              )}
            />
          </Col>
        </Row>

        {/* BUTTONS */}
        <div className="flex justify-center gap-3 mt-8">
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
    </Modal>
  );
}
