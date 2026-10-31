import { Modal, Row, Col, Input, Button, Upload, Switch } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

export default function ProjectFormModal({
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
      address: "",
      contact_name: "",
      contact_phone: "",
      contact_fax_phone: "",
      fax: "",
      is_active: true,
      logo: null,
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
          address: "",
          contact_name: "",
          contact_phone: "",
          fax: "",
          is_active: true,
          logo: null,
        });
        setPreview(null);
      }
    }
  }, [open, data, reset]);

  const title =
    mode === "create"
      ? "เพิ่มโครงการ"
      : mode === "edit"
      ? "แก้ไขโครงการ"
      : "รายละเอียดโครงการ";

  const handleFinish = (values: any) => {
    // ✅ ตรวจสอบว่ากรอกชื่อหรือยัง
    if (!values.name?.trim()) {
      setError("name", {
        type: "required",
        message: "กรอกชื่อโครงการ",
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
        message: "ชื่อโครงการนี้ถูกเพิ่มไว้แล้ว",
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
            {/* ✅ Upload โลโก้โครงการ */}
            <Col span={12}>
              <label className="block mb-2 text-gray-700 text-sm font-medium">
                รูปโลโก้โครงการ <span className="text-red-500">*</span>
              </label>

              {/* ✅ View Mode */}
              {isView ? (
                <>
                  {data?.project_logo || data?.logo_url || preview ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #E6E6E6",
                      }}
                    >
                      <img
                        src={data?.project_logo || data?.logo_url || preview}
                        alt="project logo"
                        style={{
                          width: 180,
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        padding: "24px 0",
                        border: "1px dashed #E6E6E6",
                        borderRadius: 8,
                      }}
                    >
                      ไม่มีรูปภาพ
                    </div>
                  )}
                </>
              ) : (
                // ✅ Create/Edit Mode
                <Controller
                  name="logo"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/");
                          const isLt5M = file.size / 1024 / 1024 < 5;

                          if (!isImage) {
                            setError("logo", {
                              type: "manual",
                              message: "กรุณาเลือกเฉพาะไฟล์รูปภาพ (JPG, PNG)",
                            });
                            return Upload.LIST_IGNORE;
                          }

                          if (!isLt5M) {
                            setError("logo", {
                              type: "manual",
                              message: "ไฟล์มีขนาดใหญ่เกินไป กรุณาลองอีกครั้ง",
                            });
                            field.onChange(null);
                            setPreview(null);
                            return Upload.LIST_IGNORE;
                          }

                          // clear error ถ้าผ่านแล้ว
                          setError("logo", { type: "manual", message: "" });

                          field.onChange(file);

                          const reader = new FileReader();
                          reader.onload = (e) => {
                            if (e.target?.result) {
                              setPreview(e.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);

                          return false;
                        }}
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : data?.project_logo || data?.logo_url ? (
                          <img
                            src={data.project_logo || data.logo_url}
                            alt="project logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <PlusOutlined />
                            <div style={{ marginTop: 8, fontSize: 13 }}>
                              อัปโหลดรูปภาพ
                            </div>
                            <div style={{ fontSize: 12, color: "#BFBFBF" }}>
                              ไม่เกิน 5 MB
                            </div>
                          </div>
                        )}
                      </Upload>

                      {/* ⚠ แสดง error ใต้ upload */}
                      {errors.logo && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.logo.message as string}
                        </div>
                      )}
                    </>
                  )}
                />
              )}
            </Col>

            {/* ชื่อโครงการ */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ชื่อโครงการ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกชื่อโครงการ"
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

            {/* ที่อยู่โครงการ */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ที่อยู่โครงการ
              </label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกที่อยู่โครงการ"
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

            {/* ผู้ประสานงาน */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ผู้ประสานงาน
              </label>
              <Controller
                name="contact_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกชื่อ-นามสกุล ผู้ประสานงาน"
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

            {/* เบอร์โทร - โทรสาร */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                เบอร์โทรติดต่อ
              </label>
              <Controller
                name="contact_phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกเบอร์โทรติดต่อ"
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
                โทรสาร
              </label>
              <Controller
                name="contact_fax_phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกโทรสาร"
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
