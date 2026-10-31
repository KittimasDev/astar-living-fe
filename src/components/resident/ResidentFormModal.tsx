import { Modal, Row, Col, Input, Button, Select } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectAPIs } from "../../networks/project.api";
import { ensureMe } from "../../hooks/useMe";

export default function ResidentFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
}: any) {
  const queryClient = useQueryClient();
  const methods = useForm({
    defaultValues: {
      project_id: null,
      house_no: "",
      full_name: "",
      ownership_ratio: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const { control, handleSubmit, reset, formState } = methods;
  const { errors } = formState;

  const isView = mode === "view";

  const [projectOptions, setProjectOptions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ดึงโครงการเฉพาะของผู้ใช้คนนี้
  const fetchData = async () => {
    try {
      const me = await ensureMe(queryClient);
      const userProjectId = me?.project_id;
      setCurrentUser(me || null);

      const response = await ProjectAPIs.getAll({ limit: 999 });
      const list = response?.data?.body || [];

      const filtered = list.filter((proj: any) => proj.id === userProjectId);

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
    if (!open || !currentUser || !projectOptions.length) return;

    if (mode === "create") {
      // AUTO SET project สำหรับ user ที่ไม่ใช่ superadmin
      reset({
        project_id:
          currentUser.role === "SUPERADMIN" ? null : currentUser.project_id,
        house_no: "",
        full_name: "",
        ownership_ratio: "",
        phone: "",
        email: undefined,
        address: "",
      });
    } else if (data) {
      reset({
        project_id: data.project_id || null,
        house_no: data.house_no || "",
        full_name: data.full_name || "",
        ownership_ratio: data.ownership_ratio || "",
        phone: data.phone || "",
        email: data.email || undefined,
        address: data.address || "",
      });
    }
  }, [open, mode, data, currentUser, projectOptions]);

  const title =
    mode === "create"
      ? "เพิ่มลูกบ้าน"
      : mode === "edit"
        ? "แก้ไขลูกบ้าน"
        : "รายละเอียดลูกบ้าน";

  const handleFinish = (values: any) => {
    if (onSubmit) onSubmit(values);
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      width={720}
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
            {/* โครงการ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                โครงการ <span className="text-red-500">*</span>
              </label>

              <Controller
                name="project_id"
                control={control}
                rules={{ required: "กรุณาเลือกโครงการ" }}
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
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

            {/* บ้านเลขที่ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                บ้านเลขที่ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="house_no"
                control={control}
                rules={{ required: "กรุณากรอกบ้านเลขที่" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกบ้านเลขที่"
                      disabled={isView}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        borderColor: errors.house_no ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.house_no && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.house_no.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ชื่อ - นามสกุล */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>
              </label>
              <Controller
                name="full_name"
                control={control}
                rules={{ required: "กรุณากรอกชื่อ - นามสกุล" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกชื่อ - นามสกุล"
                      disabled={isView}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        borderColor: errors.full_name ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.full_name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.full_name.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* อัตราส่วนกรรมสิทธิ์ */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                อัตราส่วนกรรมสิทธิ์ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="ownership_ratio"
                control={control}
                rules={{ required: "กรุณากรอกอัตราส่วนกรรมสิทธิ์" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกอัตราส่วนกรรมสิทธิ์"
                      disabled={isView}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        borderColor: errors.ownership_ratio
                          ? "#ff4d4f"
                          : "#E6E6E6",
                      }}
                    />
                    {errors.ownership_ratio && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.ownership_ratio.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* เบอร์โทร */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                เบอร์โทร
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกเบอร์โทร"
                    disabled={isView}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      borderColor: "#E6E6E6",
                    }}
                  />
                )}
              />
            </Col>

            {/* อีเมล */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                อีเมล
              </label>
              <Controller
                name="email"
                control={control}
                // rules={{
                //   required: "กรุณากรอกอีเมล",
                //   pattern: {
                //     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                //     message: "รูปแบบอีเมลไม่ถูกต้อง",
                //   },
                // }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกอีเมล"
                      disabled={isView}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        borderColor: errors.email ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {/* {errors.email && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.email.message as string}
                      </div>
                    )} */}
                  </>
                )}
              />
            </Col>

            {/* ที่อยู่ */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ที่อยู่
              </label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    rows={3}
                    placeholder="กรอกที่อยู่"
                    disabled={isView}
                    style={{
                      borderRadius: 8,
                      borderColor: "#E6E6E6",
                    }}
                  />
                )}
              />
            </Col>
          </Row>

          {/* ปุ่ม */}
          <div className="flex justify-center mt-8 gap-3">
            <Button
              onClick={onCancel}
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
        .custom-rounded-select .ant-select-selector {
          border-radius: 5px !important;
          height: 38px !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
        }

        .custom-rounded-select .ant-select-selection-item,
        .custom-rounded-select .ant-select-selection-placeholder {
          line-height: 38px !important;
        }

        .custom-rounded-select.ant-select-focused .ant-select-selector {
          border-color: #87d2f7 !important;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3) !important;
        }
      `}</style>
    </Modal>
  );
}
