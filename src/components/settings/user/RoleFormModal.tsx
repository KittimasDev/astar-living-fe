import { Modal, Row, Col, Input, Button, Switch, Table, Checkbox } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect } from "react";

type RoleFormValues = {
  role_name: string;
  permissions: Record<string, Record<string, boolean>>;
  is_active: boolean;
};

const PERMISSION_COLUMNS = [
  { key: "menu", label: "แสดงเมนู" },
  { key: "view", label: "เรียกดู" },
  { key: "create", label: "เพิ่ม" },
  { key: "edit", label: "แก้ไข" },
  { key: "delete", label: "ลบ" },
];

const PERMISSION_GROUPS = [
  {
    group: "เมนูหลัก",
    items: [
      "แดชบอร์ด",
      "ข้อมูลลูกบ้าน / ผู้อาศัย",
      "ใบแจ้งหนี้",
      "ใบเสร็จรับเงิน",
      "รายงาน",
      "บันทึกการทำงานของระบบ",
    ],
  },
  {
    group: "การตั้งค่า",
    items: [
      "ตั้งค่าโครงการ",
      "ตั้งค่าวิธีการชำระเงิน",
      "ตั้งค่าอัตราค่าบริการ",
      "ผู้ใช้งาน",
    ],
  },
];

export default function RoleFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
  existingRoles = [],
}: any) {
  const methods = useForm<RoleFormValues>({
    defaultValues: {
      role_name: "",
      permissions: {},
      is_active: true,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState,
    setError,
  } = methods;
  const { errors } = formState;
  const isView = mode === "view";

  useEffect(() => {
    if (open) {
      if (data) {
        // ✅ โหลดข้อมูล permission เดิม ถ้ามี
        reset({
          role_name: data.role_name || "",
          permissions: data.permissions || {},
          is_active: data.is_active ?? true,
        });
      } else {
        reset({ role_name: "", permissions: {}, is_active: true });
      }
    }
  }, [open, data, reset]);

  const title =
    mode === "create"
      ? "เพิ่มสิทธิ์ผู้ใช้งาน"
      : mode === "edit"
      ? "แก้ไขสิทธิ์ผู้ใช้งาน"
      : "รายละเอียดสิทธิ์ผู้ใช้งาน";

  const handleFinish = (values: RoleFormValues) => {
    const name = values.role_name.trim();

    if (!name) {
      setError("role_name", {
        type: "required",
        message: "กรุณากรอกชื่อสิทธิ์ผู้ใช้งาน",
      });
      return;
    }

    // ✅ ตรวจสอบชื่อซ้ำ (ไม่สนตัวที่กำลังแก้ไข)
    const duplicate = existingRoles.some(
      (r: any) =>
        r.role_name.trim() === name && (mode === "create" || r.id !== data?.id)
    );

    if (duplicate) {
      setError("role_name", {
        type: "duplicate",
        message: "ชื่อสิทธิ์ผู้ใช้งานนี้ถูกใช้แล้ว",
      });
      return;
    }

    onSubmit(values);
  };

  const handleCheck = (menu: string, action: string, checked: boolean) => {
    const current = getValues("permissions") || {};
    setValue(`permissions.${menu}.${action}`, checked);
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      width={1000}
      bodyStyle={{ padding: "32px 40px", borderRadius: 20, background: "#fff" }}
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
            {/* ชื่อสิทธิ์ผู้ใช้งาน */}
            <Col span={24}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ชื่อสิทธิ์ผู้ใช้งาน <span className="text-red-500">*</span>
              </label>
              <Controller
                name="role_name"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกชื่อสิทธิ์ผู้ใช้งาน"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.role_name ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.role_name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.role_name.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {/* ตารางสิทธิ์การใช้งาน */}
            <Col span={24}>
              <div
                style={{
                  border: "1px solid #E8EEF3",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#F9FBFD",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#F9FBFD" }}>
                      <th
                        style={{
                          width: "30%",
                          textAlign: "left",
                          padding: "10px 16px",
                          fontWeight: 600,
                          borderBottom: "1px solid #E8EEF3",

                          borderRight: "1px solid #E8EEF3", // ✅ เพิ่มเส้นแนวตั้ง
                        }}
                      >
                        สิทธิ์การใช้งาน
                      </th>
                      {PERMISSION_COLUMNS.map((col, idx) => (
                        <th
                          key={col.key}
                          style={{
                            textAlign: "center",
                            // padding: "8px 4px",
                            width: "100px",
                            color: "#666",
                            fontWeight: 600,
                            borderBottom: "1px solid #E8EEF3",

                            borderRight:
                              idx !== PERMISSION_COLUMNS.length - 1
                                ? "1px solid #E8EEF3"
                                : "none", // ✅ เพิ่มเส้นแนวตั้งเว้นคอลัมน์สุดท้าย
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {PERMISSION_GROUPS.map((group) => (
                      <>
                        <tr
                          key={group.group}
                          style={{
                            background: "#F9FBFD",
                            fontWeight: 600,
                            color: "#333",
                            borderBottom: "1px solid #E8EEF3",
                          }}
                        >
                          <td colSpan={6} style={{ padding: "8px 16px" }}>
                            {group.group}
                          </td>
                        </tr>

                        {group.items.map((item) => (
                          <tr
                            key={item}
                            style={{ borderBottom: "1px solid #F1F1F1" }}
                          >
                            <td
                              style={{
                                padding: "8px 16px",
                                borderRight: "1px solid #E8EEF3", // ✅ เส้นแบ่งแนวตั้งคอลัมน์แรก
                              }}
                            >
                              <Checkbox
                                disabled={isView}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  PERMISSION_COLUMNS.forEach((col) =>
                                    handleCheck(item, col.key, checked)
                                  );
                                }}
                              >
                                {item}
                              </Checkbox>
                            </td>

                            {PERMISSION_COLUMNS.map((col, idx) => (
                              <td
                                key={col.key}
                                style={{
                                  textAlign: "center",
                                  borderRight:
                                    idx !== PERMISSION_COLUMNS.length - 1
                                      ? "1px solid #E8EEF3"
                                      : "none", // ✅ เส้นแนวตั้งในแต่ละช่อง
                                }}
                              >
                                <Controller
                                  name={`permissions.${item}.${col.key}`}
                                  control={control}
                                  render={({ field }) => (
                                    <Checkbox
                                      {...field}
                                      checked={!!field.value}
                                      disabled={isView}
                                      onChange={(e) =>
                                        handleCheck(
                                          item,
                                          col.key,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  )}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>

            {/* สถานะ */}
            <Col span={24} className="flex justify-start items-center mt-4">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={!field.value}
                    onChange={(checked) => field.onChange(!checked)}
                    disabled={isView}
                    checkedChildren="ไม่ใช้งาน"
                    unCheckedChildren="กำลังใช้งาน"
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
                  background: "#8DD3F4",
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
