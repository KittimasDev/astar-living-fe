import { Modal, Row, Col, Input, Button, Switch } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect } from "react";

export default function CollectionNoticeFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
}: any) {
  const methods = useForm({
    defaultValues: {
      topic_name: "",
      introduction_detail: "",
      additional_detail: "",
      closing_word: "",
      closure_text: "",
      remark: "",
      active: true,
    },
  });

  const { control, handleSubmit, reset } = methods;
  const isView = mode === "view";

  useEffect(() => {
    if (open) {
      if (data) {
        // convert HTML -> plain text for textarea + view
        const convertForEdit = (html?: string) => {
          if (!html) return "";

          return (
            html
              // ลบ <p> และ </p>
              .replace(/<\/?p[^>]*>/gi, "")
              // <div> เปิด: ไม่ต้องขึ้นบรรทัดใหม่
              .replace(/<div[^>]*>/gi, "")
              // </div> ปิด: ให้เป็นขึ้นบรรทัดใหม่
              .replace(/<\/div>/gi, "\n")
              // ทุกแบบของ <br>, <br/>, <br /> → ขึ้นบรรทัดใหม่
              .replace(/<br\s*\/?>/gi, "\n")
              // space พิเศษ
              .replace(/&nbsp;/gi, " ")
              .trim()
          );
        };

        reset({
          ...data,
          introduction_detail: convertForEdit(data.introduction_detail),
          additional_detail: convertForEdit(data.additional_detail),
          closing_word: convertForEdit(data.closing_word),
          remark: convertForEdit(data.remark),
        });
      } else {
        reset({
          topic_name: "",
          introduction_detail: "",
          additional_detail: "",
          closing_word: "",
          closure_text: "",
          remark: "",
          active: true,
        });
      }
    }
  }, [open, data, reset]);

  const prepareTextToHtml = (txt: string) => {
    if (!txt) return "";

    const lines = txt.split("\n");
    return `<div>${lines.join("<br>")}</div>`;
  };

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      introduction_detail: prepareTextToHtml(values.introduction_detail),
      additional_detail: prepareTextToHtml(values.additional_detail),
      closing_word: prepareTextToHtml(values.closing_word),
      remark: prepareTextToHtml(values.remark),
    };

    onSubmit?.(payload);
  };

  const title =
    mode === "create"
      ? "เพิ่มเทมเพลตค่าทวงถาม"
      : mode === "edit"
      ? "แก้ไขเทมเพลตค่าทวงถาม"
      : "รายละเอียดเทมเพลตค่าทวงถาม";

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      width={700}
      bodyStyle={{
        padding: "32px 40px",
        borderRadius: 20,
        background: "#fff",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
      destroyOnClose
    >
      <div className="pb-8 text-center text-lg font-semibold text-gray-700">
        {title}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFinish)}>
          <div className="text-gray-600 font-medium mb-2">เอกสาร</div>

          <div className="text-gray-600 font-medium mt-3 mb-1">
            ส่วนหัวเอกสาร
          </div>

          <div className="text-gray-600 font-medium mt-3 mb-1">เรื่อง</div>
          <Controller
            name="topic_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isView}
                placeholder="แก้ไขเรื่อง"
                style={{
                  borderRadius: 20,
                  height: 42,
                  borderColor: "#E6E6E6",
                }}
              />
            )}
          />

          <div className="text-gray-600 font-medium mt-6 mb-2">ส่วนเนื้อหา</div>

          <TextSection
            label="ข้อความเกริ่นนำ"
            name="introduction_detail"
            control={control}
            isView={isView}
          />
          <TextSection
            label="รายละเอียดเพิ่มเติม"
            name="additional_detail"
            control={control}
            isView={isView}
          />
          <TextSection
            label="ข้อความปิดท้าย"
            name="closing_word"
            control={control}
            isView={isView}
          />

          <div className="text-gray-600 font-medium mt-6 mb-2">ส่วนลายเซ็น</div>
          <div className="text-gray-600 font-medium mb-2">คำลงท้าย</div>

          <Controller
            name="closure_text"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled={isView}
                placeholder="คำลงท้าย (เช่น ขอแสดงความนับถือ)"
                style={{
                  borderRadius: 20,
                  height: 42,
                  borderColor: "#E6E6E6",
                  marginBottom: "10px",
                }}
              />
            )}
          />

          <TextSection
            label="หมายเหตุ"
            name="remark"
            control={control}
            isView={isView}
          />

          <div className="mt-4">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isView}
                  checkedChildren="กำลังใช้งาน"
                  unCheckedChildren="ไม่ใช้งาน"
                  style={{
                    backgroundColor: field.value ? "#74BA3D" : "#D9D9D9",
                  }}
                />
              )}
            />
          </div>

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
                {mode === "edit" ? "แก้ไข" : "เพิ่ม"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
      <style jsx global>{`
        .tox-tinymce {
          border-radius: 10px !important;
          border-color: #e6e6e6 !important;
          overflow: hidden;
        }
        .tox .tox-toolbar {
          background: #fafafa !important;
          border-bottom: 1px solid #eee !important;
        }
        .tox .tox-toolbar__primary {
          padding: 4px 8px !important;
        }
      `}</style>
    </Modal>
  );
}

/* ----------------- textarea component ----------------- */
function TextSection({ label, name, control, isView }: any) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-gray-700 text-sm font-medium">
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input.TextArea
            {...field}
            value={field.value}
            placeholder={`กรอก${label}`}
            autoSize={{ minRows: 4, maxRows: 8 }}
            style={{
              borderRadius: 12,
              borderColor: "#E6E6E6",
            }}
            disabled={isView}
          />
        )}
      />
    </div>
  );
}
