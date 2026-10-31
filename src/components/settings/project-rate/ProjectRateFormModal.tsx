import { Modal, Row, Col, Input, Button, Upload, Switch, Select } from "antd";
import ReactDatePicker from "react-datepicker";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
// import { Editor } from "@tinymce/tinymce-react"; // ✅ เพิ่ม TinyMCE
import { PlusOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { ProjectAPIs } from "../../../networks/project.api";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { ensureMe } from "../../../hooks/useMe";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

type FormValues = {
  project_id: number | null;
  maintenance_fee_rate: string;
  collection_fee: string;
  fine_rate: string;
  invoice_prefix: string;
  receipt_prefix: string;
  active: boolean;
  invoice_note: string;
  receipt_note: string;
  effective_date: any;
  discount_rate: any;
};

export default function ProjectRateFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
  existingProjects = [], // ✅ สำหรับ dropdown โครงการ
}: any) {
  const queryClient = useQueryClient();
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY ?? "";
  const methods = useForm<FormValues>({
    defaultValues: {
      project_id: null,
      maintenance_fee_rate: "",
      collection_fee: "",
      fine_rate: "",
      invoice_prefix: "",
      receipt_prefix: "",
      active: true,
      invoice_note: "",
      receipt_note: "",
      effective_date: "",
      discount_rate: "",
    },
  });

  const { control, handleSubmit, reset, setError, formState } = methods;
  const { errors } = formState;
  const isView = mode === "view";

  const [projectOptions, setProjectOptions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const htmlToPlain = (html?: string) => {
    if (!html) return "";
    return html
      .replace(/<\/?p[^>]*>/gi, "")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<\/div>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&nbsp;/gi, " ")
      .trim();
  };

  const plainToHtml = (txt: string) => {
    if (!txt) return "";
    const lines = txt.split("\n");
    return `<div>${lines.join("<br>")}</div>`;
  };

  // ✅ ดึงข้อมูลโครงการจาก API
  const fetchData = async () => {
    try {
      const me = await ensureMe(queryClient);
      setCurrentUser(me || null);

      const userProjectId = me?.project_id;
      const userRole = me?.role;

      const response = await ProjectAPIs.getAll({ limit: 999 });
      const list = response?.data?.body || [];

      let filtered = list;

      if (userRole !== "SUPERADMIN") {
        filtered = list.filter((proj: any) => proj.id === userProjectId);
      }

      const formatted = filtered.map((proj: any) => ({
        label: proj.name,
        value: proj.id,
      }));

      setProjectOptions(formatted);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (open && mode === "create" && currentUser) {
      reset({
        project_id:
          currentUser.role === "SUPERADMIN" ? null : currentUser.project_id,
        maintenance_fee_rate: "",
        collection_fee: "",
        fine_rate: "",
        invoice_prefix: "",
        receipt_prefix: "",
        active: true,
        invoice_note: "",
        receipt_note: "",
        effective_date: null,
        discount_rate: "",
      });
    }
  }, [open, reset]);

  // useEffect(() => {
  //   if (open && data) {
  //     const matchedProject = projectOptions.find(
  //       (p) => p.value === data.project_id
  //     );
  //     reset({
  //       project_id: matchedProject ? matchedProject.value : null,
  //       maintenance_fee_rate: data.maintenance_fee_rate || "",
  //       collection_fee: data.collection_fee || "",
  //       fine_rate: data.fine_rate || "",
  //       invoice_prefix: data.invoice_prefix || "",
  //       receipt_prefix: data.receipt_prefix || "",
  //       active: data.active ?? true,
  //       invoice_note: data.invoice_note || "",
  //       receipt_note: data.receipt_note || "",
  //       effective_date: data.effective_date
  //         ? dayjs(data.effective_date) // <-- ควรให้อ่าน date ได้ทุกแบบ
  //         : null,
  //     });
  //   }
  // }, [open, data, projectOptions, reset]);

  useEffect(() => {
    if (!open || !projectOptions.length || !currentUser) return;

    // CREATE MODE
    if (mode === "create") {
      reset({
        project_id:
          currentUser.role === "SUPERADMIN" ? null : currentUser.project_id,
        maintenance_fee_rate: "",
        collection_fee: "",
        fine_rate: "",
        invoice_prefix: "",
        receipt_prefix: "",
        active: true,
        invoice_note: "",
        receipt_note: "",
        effective_date: null,
        discount_rate: "",
      });
      return;
    }

    // EDIT MODE
    if (data) {
      const matchedProject = projectOptions.find(
        (p) => p.value === data.project_id
      );

      reset({
        project_id: matchedProject ? matchedProject.value : null,
        maintenance_fee_rate: data.maintenance_fee_rate || "",
        collection_fee: data.collection_fee || "",
        fine_rate: data.fine_rate || "",
        invoice_prefix: data.invoice_prefix || "",
        receipt_prefix: data.receipt_prefix || "",
        active: data.active ?? true,
        discount_rate: data.discount_rate || "",

        invoice_note: htmlToPlain(data.invoice_note),
        receipt_note: htmlToPlain(data.receipt_note),

        effective_date: data.effective_date
          ? new Date(data.effective_date)
          : null,
      });
    }
  }, [open, data, projectOptions, currentUser]);

  const title =
    mode === "create"
      ? "เพิ่มอัตราค่าบริการ"
      : mode === "edit"
      ? "แก้ไขอัตราค่าบริการ"
      : "รายละเอียดอัตราค่าบริการ";

  // ✅ Validation และ Submit
  const handleFinish = (values: any) => {
    const payload = {
      ...values,

      invoice_note: plainToHtml(values.invoice_note),
      receipt_note: plainToHtml(values.receipt_note),
    };

    onSubmit?.(payload);
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose={false}
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
      <div className="pb-8 text-center text-lg font-semibold text-gray-700">
        {title}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFinish)}>
          <Row gutter={[20, 20]}>
            {/* ✅ Dropdown โครงการ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                โครงการ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value} // ✅ ใช้ value จาก react-hook-form
                      onChange={(val) => field.onChange(val)} // ✅ เมื่อเลือก -> เก็บ id
                      placeholder="เลือกโครงการ"
                      options={projectOptions}
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        width: "100%",
                        borderColor: errors.project_id ? "#ff4d4f" : "#E6E6E6",
                      }}
                      className="custom-rounded-select"
                    />
                    {errors.project_id && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.project_id.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ✅ ค่าส่วนกลางต่อตารางวา */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ค่าส่วนกลางต่อตารางวา <span className="text-red-500">*</span>
              </label>
              <Controller
                name="maintenance_fee_rate"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="กรอกค่าส่วนกลางต่อตารางวา"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.maintenance_fee_rate
                          ? "#ff4d4f"
                          : "#E6E6E6",
                      }}
                    />
                    {errors.maintenance_fee_rate && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.maintenance_fee_rate.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ✅ ค่าทวงถามต่อเดือน */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ค่าทวงถามต่อเดือน <span className="text-red-500">*</span>
              </label>
              <Controller
                name="collection_fee"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="กรอกค่าทวงถามต่อเดือน"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.collection_fee
                          ? "#ff4d4f"
                          : "#E6E6E6",
                      }}
                    />
                    {errors.collection_fee && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.collection_fee.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ✅ ค่าเบี้ยปรับ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ค่าเบี้ยปรับ (%) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="fine_rate"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="กรอกค่าเบี้ยปรับ"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.fine_rate ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.fine_rate && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.fine_rate.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ✅ Prefix ใบแจ้งหนี้ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                Prefix ใบแจ้งหนี้
              </label>
              <Controller
                name="invoice_prefix"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอก Prefix ใบแจ้งหนี้"
                    disabled={isView}
                    style={{
                      height: 42,
                      borderRadius: 20,
                      borderColor: "#E6E6E6",
                    }}
                  />
                )}
              />
            </Col>

            {/* ✅ Prefix ใบเสร็จ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                Prefix ใบเสร็จ
              </label>
              <Controller
                name="receipt_prefix"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอก Prefix ใบเสร็จ"
                    disabled={isView}
                    style={{
                      height: 42,
                      borderRadius: 20,
                      borderColor: "#E6E6E6",
                    }}
                  />
                )}
              />
            </Col>

            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                วันที่มีผลบังคับใช้
              </label>
              <Controller
                name="effective_date"
                control={control}
                render={({ field }) => {
                  return (
                    <div className="date-input-wrapper">
                      <ReactDatePicker
                        selected={field.value ?? null}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="dd/MM/yyyy"
                        disabled={isView}
                        placeholderText="กรุณาเลือกวันที่"
                        className="custom-date-input hover:cursor-pointer"
                        wrapperClassName="w-full"
                      />
                      <CalendarOutlined className="calendar-icon" />
                    </div>
                  );
                }}
              />
            </Col>

            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ส่วนลด (%)
              </label>
              <Controller
                name="discount_rate"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      placeholder="กรอกส่วนลด"
                      disabled={isView}
                      type="number"
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: "#E6E6E6",
                      }}
                    />
                  );
                }}
              />
            </Col>

            {/* ✅ หมายเหตุใบแจ้งหนี้ */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                หมายเหตุใบแจ้งหนี้
              </label>
              <Controller
                name="invoice_note"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    autoSize={{ minRows: 5, maxRows: 12 }}
                    placeholder="กรอกหมายเหตุใบแจ้งหนี้"
                    style={{
                      borderRadius: 12,
                      borderColor: "#E6E6E6",
                    }}
                    disabled={isView}
                  />
                )}
              />
            </Col>

            {/* ✅ หมายเหตุใบเสร็จ */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                หมายเหตุใบเสร็จ
              </label>
              <Controller
                name="receipt_note"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    autoSize={{ minRows: 5, maxRows: 12 }}
                    placeholder="กรอกหมายเหตุใบเสร็จ"
                    style={{
                      borderRadius: 12,
                      borderColor: "#E6E6E6",
                    }}
                    disabled={isView}
                  />
                )}
              />
            </Col>

            {/* ✅ สถานะ */}
            <Col span={24}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={(checked) => field.onChange(checked)}
                    disabled={isView}
                    checkedChildren="กำลังใช้งาน"
                    unCheckedChildren="ไม่ใช้งาน"
                    style={{
                      backgroundColor: field.value ? "#74BA3D" : "#D9D9D9",
                    }}
                  />
                )}
              />
            </Col>
          </Row>

          {/* ✅ ปุ่ม */}
          <div className="flex justify-center mt-8 gap-3">
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
              onClick={(e) => {
                e.preventDefault();
                onCancel();
              }}
            >
              ย้อนกลับ
            </Button>

            {!isView && (
              <Button
                type="primary"
                htmlType="submit"
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
                {mode === "edit" ? "ยืนยัน" : "เพิ่ม"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 99999 !important;
        }

        /* ปิด highlight เด้งทุกเดือน */
        .react-datepicker__day--keyboard-selected {
          background-color: transparent !important;
          color: inherit !important;
        }

        /* disabled state */
        .react-datepicker-wrapper .custom-date-input:disabled {
          background-color: #f0f0f0 !important;
          color: #999 !important;
          cursor: not-allowed !important;
        }

        .custom-date-input {
          width: 100%;
          height: 40px; /* ให้สูงเท่า input Ant */
          padding: 0 14px;
          border-radius: 20px; /* โค้งมนแบบชาววาเลนไทน์ */
          border: 1px solid #e6e6e6;
          font-size: 14px;
          outline: none;
        }

        .custom-date-input:focus {
          border-color: #87d2f7;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3);
        }

        /* ไม่ให้ TinyMCE บังปฏิทิน */
        .react-datepicker-popper {
          z-index: 99999 !important;
        }

        /* ทำปฏิทินให้เข้าธีมหน่อย */
        .react-datepicker {
          border-radius: 12px;
          overflow: hidden;
        }

        .custom-rounded-select .ant-select-selector {
          border-radius: 20px !important;
          height: 38px !important; /* ✅ ให้เท่ากับ input */
          padding: 0 12px !important;
          display: flex;
          align-items: center;
        }

        .custom-rounded-select .ant-select-selection-item,
        .custom-rounded-select .ant-select-selection-placeholder {
          line-height: 38px !important; /* ✅ ทำให้ text อยู่ตรงกลาง */
        }

        .custom-rounded-select.ant-select-focused .ant-select-selector {
          border-color: #87d2f7 !important;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3) !important;
        }

        .tox-tinymce {
          border-radius: 10px !important;
          border-color: #e6e6e6 !important;
          overflow: hidden;
        }
        .tox-editor-container {
          border-radius: 10px !important;
        }
        .tox .tox-toolbar {
          background: #fafafa !important;
          border-bottom: 1px solid #eee !important;
        }
        .tox .tox-toolbar__primary {
          padding: 4px 8px !important;
        }
        .tox .tox-toolbar__group {
          margin-right: 8px !important;
        }
        .tox .tox-edit-area__iframe {
          background-color: #fff !important;
        }

        .date-input-wrapper {
          position: relative;
          width: 100%;
        }

        .custom-date-input {
          width: 100%;
          height: 42px;
          padding-right: 36px; /* กันชน icon */
          border-radius: 20px;
          border: 1px solid #e6e6e6;
        }

        /* icon */
        .calendar-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #999;
          pointer-events: none; /* ให้คลิกทะลุไปที่ datepicker */
        }

        /* disabled state */
        .react-datepicker-wrapper .custom-date-input:disabled {
          background-color: #f0f0f0 !important;
          color: #999 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </Modal>
  );
}
