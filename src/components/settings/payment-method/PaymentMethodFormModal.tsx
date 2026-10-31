import { Modal, Row, Col, Input, Button, Upload, Switch } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function PaymentMethodFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
  existingProjects = [], // ✅ เพิ่ม prop สำหรับตรวจชื่อซ้ำ
}: any) {
  const methods = useForm({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      coordinator: "",
      phone: "",
      fax: "",
      is_active: true,
      logo: null,
      created_at: "",
      updated_at: "",
    },
  });
  const { control, handleSubmit, reset, setError, formState } = methods;
  const [preview, setPreview] = useState<string | null>(null);
  const isView = mode === "view";

  useEffect(() => {
    if (open) {
      if (data) {
        reset({ ...data });
        setPreview(data.logo_url || null);
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          coordinator: "",
          phone: "",
          fax: "",
          is_active: true,
          logo: null,
          created_at: "",
          updated_at: "",
        });
        setPreview(null);
      }
    }
  }, [open, data, reset]);

  const title =
    mode === "create"
      ? "เพิ่มวิธีการชำระเงิน"
      : mode === "edit"
      ? "แก้ไขวิธีการชำระเงิน"
      : "รายละเอียดวิธีการชำระเงิน";

  const handleFinish = (values: any) => {
    // ✅ ตรวจสอบว่ากรอกชื่อหรือยัง
    if (!values.name?.trim()) {
      setError("name", {
        type: "required",
        message: "กรอกวิธีการชำระเงิน",
      });
      return;
    }

    // ✅ ตรวจสอบชื่อซ้ำ (ยกเว้นกรณี edit ที่เป็นชื่อเดิมของตัวเอง)
    const duplicate = existingProjects.some(
      (proj: any) =>
        proj.name.trim() === values.name.trim() && proj.id !== data?.id
    );

    if (duplicate) {
      setError("name", {
        type: "duplicate",
        message: "วิธีชำระเงินนี้ถูกเพิ่มไว้แล้ว",
      });
      return;
    }

    // ✅ ผ่าน validation แล้ว submit
    if (onSubmit) onSubmit(values);
  };

  const { errors } = formState;

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      width={600}
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
      {/* Title */}
      <div className="pb-8 text-center text-lg font-semibold text-gray-700">
        {title}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFinish)}>
          <Row gutter={[20, 20]}>
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                วิธีการชำระเงิน <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกวิธีการชำระเงิน"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.name ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.name.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                รหัสย่อของวิธีการชำระเงิน{" "}
                <span className="text-red-500">*</span>
              </label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกวิธีการชำระเงิน"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.code ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.code && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.code.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                รายละเอียดเพิ่มเติม
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกรายละเอียดเพิ่มเติม"
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

            {isView && (
              <>
                <Col span={12}>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">
                    วันที่สร้าง
                  </label>
                  <Controller
                    name="created_at"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          field.value
                            ? dayjs(field.value)
                                .tz("Asia/Bangkok")
                                .format("DD/MM/") +
                              (dayjs(field.value).tz("Asia/Bangkok").year() +
                                543) +
                              dayjs(field.value)
                                .tz("Asia/Bangkok")
                                .format(" HH:mm:ss")
                            : "-"
                        }
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
                    วันที่อัปเดทล่าสุด
                  </label>
                  <Controller
                    name="updated_at"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="-"
                        disabled={isView}
                        style={{
                          height: 42,
                          borderRadius: 20,
                          borderColor: "#E6E6E6",
                        }}
                        value={
                          field.value
                            ? dayjs(field.value)
                                .tz("Asia/Bangkok")
                                .format("DD/MM/") +
                              (dayjs(field.value).tz("Asia/Bangkok").year() +
                                543) +
                              dayjs(field.value)
                                .tz("Asia/Bangkok")
                                .format(" HH:mm:ss")
                            : "-"
                        }
                      />
                    )}
                  />
                </Col>
              </>
            )}

            {/* สถานะ */}
            <Col span={24}>
              <Controller
                name="is_active"
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

          {/* ปุ่ม */}
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
    </Modal>
  );
}
