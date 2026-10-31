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

export default function OtherReceiptSummaryModal({
  open,
  resident,
  otherPayload,
  onBack,
  onNext,
  onSuccessPdf, // ✅ เพิ่ม
}: {
  open: boolean;
  resident: any;
  onBack: () => void;
  onNext: () => void;
  onSuccessPdf?: (url: string) => void; // ✅ เพิ่ม
  otherPayload: {
    items: {
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[];
    grand_total: number;
  };
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

  const items = otherPayload?.items || [];
  const total = otherPayload?.grand_total || 0;

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
    if (!open) return;
    setValue("total_amount", String(total));
  }, [open, total, setValue]);

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
    setLoading(true); // เริ่มโหลด
    try {
      // 🔥 แปลงเดือน -> code เดือน เช่น DEC
      const monthToCode = (month: number) => {
        const map: Record<number, string> = {
          1: "JAN",
          2: "FEB",
          3: "MAR",
          4: "APR",
          5: "MAY",
          6: "JUN",
          7: "JUL",
          8: "AUG",
          9: "SEP",
          10: "OCT",
          11: "NOV",
          12: "DEC",
        };
        return map[month] || "";
      };

      const payload = {
        active: true,
        project_id: Number(projectId),
        resident_id: Number(resident.id),

        issue_date: data.issue_date
          ? moment(data.issue_date).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        payment_date: data.issue_date
          ? moment(data.issue_date).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),

        payment_method_id: Number(method),
        bank_name: data.bank_name || data.bank || "",
        cheque_no: data.cheque_no || "-",
        note: data.note || "",

        payment_detail: {
          items: otherPayload.items.map((item, index) => ({
            itemNo: index + 1,
            description: item.name,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unit_price),
            total: Number(item.total),
          })),
        },
      };
      console.log("pay", payload);

      // alert("Complete");

      // 🔥 ยิงสร้างใบเสร็จ
      const createRes = await ReceiptAPIs.createTransaction(payload);
      const receiptId = createRes?.data?.body?.id;

      if (!receiptId) {
        console.error("❌ Receipt ID missing");
        return;
      }

      // 🔥 ยิง PDF ด้วย receiptId
      const pdfRes = await ReceiptAPIs.printTransactionPdf(receiptId);
      const blob = new Blob([pdfRes.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      if (onSuccessPdf) onSuccessPdf(url);

      reset();
      setValue("issue_date", moment());
      onNext();
    } catch (err) {
      console.error("❌ Payment submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={900}
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
        ใบเสร็จรายรับอื่นๆ
      </div>

      <div className="text-[14px] mb-6">
        <div>{resident?.name || resident?.full_name}</div>
        <div>บ้านเลขที่ {resident?.house_no}</div>
        <div className="mt-4 font-medium">รายการชำระเงิน</div>
      </div>

      {/* ✅ Table */}
      <Table
        className="custom-table"
        columns={[
          {
            title: "รายการ",
            dataIndex: "name",
          },
          {
            title: "จำนวนหน่วย",
            dataIndex: "quantity",
            align: "right",
          },
          {
            title: "ราคาต่อหน่วย (บาท)",
            dataIndex: "unit_price",
            align: "right",
            render: (v: number) =>
              v?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          },
          {
            title: "รวมทั้งหมด (บาท)",
            dataIndex: "total",
            align: "right",
            render: (v: number) =>
              v.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          },
        ]}
        dataSource={items}
        pagination={false}
      />

      {/* ✅ แสดงยอดรวมไว้นอก Table */}
      <div className="flex justify-end mt-4 text-base font-semibold">
        <div className="mr-8">รวมเงินทั้งสิ้น</div>
        <div>
          {total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* ✅ ฟอร์ม React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Row gutter={[16, 16]}>
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
                    options={methodOptions}
                    className="custom-rounded-select"
                  />
                  <ErrorText msg={errors.method?.message as string} />
                </>
              )}
            />
          </Col>

          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              จำนวนเงินที่จ่าย (บาท) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="total_amount"
              control={control}
              rules={{
                required: "กรุณากรอกจำนวนเงิน",
                validate: (val) =>
                  (!!val && Number(val) > 0) || "จำนวนเงินต้องมากกว่า 0",
              }}
              render={({ field }) => (
                <>
                  <InputNumber
                    value={field.value} // เก็บค่าเลขล้วน
                    disabled // ✅ ปิดการแก้ไข
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
                  <ErrorText msg={errors.total_amount?.message as string} />
                </>
              )}
            />
          </Col>

          {methodCode === "TRANSFER" && (
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ธนาคาร <span className="text-red-500">*</span>
              </label>
              <Controller
                name="bank"
                control={control}
                rules={{
                  required:
                    methodCode === "TRANSFER" || methodCode === "CHEQUE"
                      ? "กรุณาเลือกธนาคาร"
                      : false,
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

          {methodCode === "CHEQUE" && (
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                เลขที่เช็ค <span className="text-red-500">*</span>
              </label>
              <Controller
                name="cheque_no"
                control={control}
                rules={{
                  required:
                    methodCode === "CHEQUE" ? "กรุณากรอกเลขที่เช็ค" : false,
                }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกเลขที่เช็ค"
                      style={{
                        height: 40,
                        borderRadius: 20,
                        borderColor: "#E6E6E6",
                      }}
                    />
                    <ErrorText msg={errors.cheque_no?.message as string} />
                  </>
                )}
              />
            </Col>
          )}

          {methodCode === "CHEQUE" && (
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ธนาคาร <span className="text-red-500">*</span>
              </label>
              <Controller
                name="bank"
                control={control}
                rules={{
                  required:
                    methodCode === "TRANSFER" || methodCode === "CHEQUE"
                      ? "กรุณาเลือกธนาคาร"
                      : false,
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
                      ]}
                      className="custom-rounded-select"
                    />
                    <ErrorText msg={errors.bank?.message as string} />
                  </>
                )}
              />
            </Col>
          )}

          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              วันที่ชำระเงิน <span className="text-red-500">*</span>
            </label>
            <Controller
              name="issue_date"
              control={control}
              rules={{
                required: "กรุณาเลือกวันที่ชำระเงิน",
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่ชำระเงิน"
                    style={{ width: "100%", height: 40, borderRadius: 20 }}
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

          <Col span={12}>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              หมายเหตุ
            </label>
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="กรอกหมายเหตุ"
                  style={{
                    height: 40,
                    borderRadius: 20,
                    borderColor: "#E6E6E6",
                  }}
                />
              )}
            />
          </Col>
        </Row>

        {/* ✅ ปุ่ม */}
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
            disabled={!method}
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
