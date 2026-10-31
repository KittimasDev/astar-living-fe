import { Modal, Row, Col, Input, Button, Switch, Select } from "antd";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { ProjectAPIs } from "../../../networks/project.api";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useQueryClient } from "@tanstack/react-query";
import { ensureMe } from "../../../hooks/useMe";

type UserFormValues = {
  username: string;
  password?: string;
  project_id: any;
  full_name: string;
  role: any;
  email: string;
  phone?: string;
  is_active: boolean;
};

export default function UserFormModal({
  open,
  mode,
  data,
  onCancel,
  onSubmit,
  existingUsers = [],
}: any) {
  const queryClient = useQueryClient();
  const methods = useForm<UserFormValues>({
    defaultValues: {
      username: "",
      password: "",
      project_id: null,
      full_name: "",
      role: null,
      email: "",
      phone: "",
      is_active: true,
    },
  });

  const [projectData, setProjectData] = useState<any>();
  const [projectOptions, setProjectOptions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchCurrentUser = async () => {
    try {
      const me = await ensureMe(queryClient);
      setCurrentUser(me || null);
    } catch (err) {
      console.error("Failed to get user info", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ✅ ดึงข้อมูลโครงการจาก API
  const fetchData = async () => {
    try {
      const response = await ProjectAPIs.getAll({ limit: 999 });
      const list = response?.data?.body || [];

      // ✅ options ใช้ id เป็น value, name เป็น label
      const formatted = list.map((proj: any) => ({
        label: proj.name, // แสดงใน dropdown
        value: proj.id, // เก็บใน form
      }));

      setProjectOptions(formatted);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(currentUser);

  useEffect(() => {
    if (data?.role) {
      setSelectedRole(data.role);
    } else {
      setSelectedRole(null);
    }
  }, [data, open]);

  useEffect(() => {
    if (!currentUser) return;

    const loadProjects = async () => {
      try {
        const response = await ProjectAPIs.getAll({ limit: 999 });

        const list = response?.data?.body || [];

        // SUPERADMIN มองเห็นทุก project
        let filtered = list;
        if (currentUser.role !== "SUPERADMIN") {
          filtered = list.filter(
            (proj: any) => proj.id === currentUser.project_id
          );
        }

        setProjectOptions(
          filtered.map((proj: any) => ({
            label: proj.name,
            value: proj.id,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch project list", error);
      }
    };

    loadProjects();
  }, [currentUser]);

  console.log("proj", projectData);

  const { control, handleSubmit, reset, setError, formState } = methods;
  const { errors } = formState;
  const isView = mode === "view";
  const [selectedRole, setSelectedRole] = useState(null);

  console.log("select", selectedRole);

  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const roleOptions = [
    { label: "Astar", value: "SUPERADMIN" }, // Astar
    { label: "ผู้จัดการโครงการ", value: "ADMIN" }, // Admin โครงการ = ผู้จัดการโครงการ
    { label: "หัวหน้านิติ", value: "MANAGER" }, // Admin = หัวหน้านิติ
    { label: "นิติ", value: "USER" }, // User
  ];
  const filteredRoleOptions = isSuperAdmin
    ? roleOptions
    : roleOptions.filter((r) => r.value !== "SUPERADMIN");

  useEffect(() => {
    if (!open || !projectOptions.length) return;

    if (data) {
      // user กำลังแก้ไข
      const matchedProject = projectOptions.find(
        (p) => p.value === data.project_id
      );

      reset({
        username: data.username || "",
        password: "",
        project_id: matchedProject ? matchedProject.value : null,
        full_name: data.full_name || "",
        role: data.role || null,
        email: data.email || "",
        phone: data.phone || "",
        is_active: data.active ?? true,
      });
    } else {
      // user ใหม่
      reset({
        username: "",
        password: "",
        project_id: currentUser?.project_id ?? null,
        full_name: "",
        role: null,
        email: "",
        phone: "",
        is_active: true,
      });
    }
  }, [open, data, projectOptions]);

  const title =
    mode === "create"
      ? "เพิ่มผู้ใช้งาน"
      : mode === "edit"
      ? "แก้ไขข้อมูลผู้ใช้งาน"
      : "รายละเอียดผู้ใช้งาน";

  const handleFinish = (values: any) => {
    const requiredFields = [
      { name: "username", label: "ชื่อผู้ใช้งาน" },
      ...(values.role !== "SUPERADMIN"
        ? [{ name: "project_id", label: "โครงการ" }]
        : []),
      { name: "full_name", label: "ชื่อเต็ม" },
      { name: "role", label: "สิทธิ์ผู้ใช้งาน" },
      { name: "email", label: "อีเมล" },
      ...(mode === "create" ? [{ name: "password", label: "รหัสผ่าน" }] : []),
    ];

    let hasError = false;

    for (const field of requiredFields) {
      const key = field.name as keyof UserFormValues;
      const value = values[key];

      if (value === null || value === undefined || value === "") {
        setError(key, {
          type: "required",
          message: `กรุณากรอก${field.label}`,
        });
        hasError = true;
      }
    }

    if (hasError) return;

    // Duplicate checks…
    const duplicateUsername = existingUsers.some(
      (u: any) =>
        u.username.trim() === values.username.trim() && u.id !== data?.id
    );
    const duplicateFullName = existingUsers.some(
      (u: any) =>
        u.full_name.trim() === values.full_name.trim() && u.id !== data?.id
    );

    if (duplicateUsername) {
      setError("username", {
        type: "duplicate",
        message: "ชื่อผู้ใช้งานนี้ถูกใช้แล้ว",
      });
      return;
    }

    if (duplicateFullName) {
      setError("full_name", {
        type: "duplicate",
        message: "ชื่อเต็มนี้ถูกใช้แล้ว",
      });
      return;
    }

    if (onSubmit) onSubmit(values);
  };

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
      <div className="pb-6 text-center text-lg font-semibold text-gray-700">
        {title}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFinish)}>
          <Row gutter={[20, 20]}>
            {/* username */}

            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ชื่อผู้ใช้งาน <span className="text-red-500">*</span>
              </label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกชื่อผู้ใช้งาน"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
                        borderColor: errors.username ? "#ff4d4f" : "#E6E6E6",
                      }}
                    />
                    {errors.username && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.username.message as string}
                      </div>
                    )}
                  </>
                )}
              />
            </Col>

            {mode === "create" && (
              <Col span={12}>
                <label className="block mb-1 text-gray-700 text-sm font-medium">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input.Password
                        {...field}
                        placeholder="กรอกรหัสผ่าน"
                        disabled={isView}
                        visibilityToggle={true}
                        iconRender={(visible) =>
                          visible ? (
                            <LuEye style={{ cursor: "pointer" }} />
                          ) : (
                            <LuEyeOff style={{ cursor: "pointer" }} />
                          )
                        }
                        style={{
                          height: 42,
                          borderRadius: 20,
                          borderColor: errors.password ? "#ff4d4f" : "#E6E6E6",
                        }}
                      />
                      {errors.password && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.password.message as string}
                        </div>
                      )}
                    </>
                  )}
                />
              </Col>
            )}

            {/* role */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                สิทธิ์ผู้ใช้งาน <span className="text-red-500">*</span>
              </label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? null}
                    onChange={(val) => {
                      field.onChange(val);
                      setSelectedRole(val);
                    }}
                    placeholder="เลือกสิทธิ์ผู้ใช้งาน"
                    options={filteredRoleOptions}
                    disabled={isView}
                    style={{
                      height: 42,
                      borderRadius: 20,
                      width: "100%",
                      borderColor: errors.role ? "#ff4d4f" : "#E6E6E6",
                    }}
                    className="custom-rounded-select"
                  />
                )}
              />
              {errors.role && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.role.message as string}
                </div>
              )}
            </Col>

            {/* full name */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                ชื่อเต็ม <span className="text-red-500">*</span>
              </label>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="กรอกชื่อเต็ม"
                      disabled={isView}
                      style={{
                        height: 42,
                        borderRadius: 20,
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

            {/* name */}
            {selectedRole !== "SUPERADMIN" && (
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
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        placeholder="เลือกโครงการ"
                        options={projectOptions}
                        disabled={isView}
                        style={{
                          height: 42,
                          borderRadius: 20,
                          width: "100%",
                          borderColor: errors.project_id
                            ? "#ff4d4f"
                            : "#E6E6E6",
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
            )}

            {/* email */}
            <Col span={12}>
              <label className="block mb-1 text-gray-700 text-sm font-medium">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="กรอกอีเมล"
                    disabled={isView}
                    style={{
                      height: 42,
                      borderRadius: 20,
                      borderColor: errors.email ? "#ff4d4f" : "#E6E6E6",
                    }}
                  />
                )}
              />
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.email.message as string}
                </div>
              )}
            </Col>

            {/* phone */}
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
                      height: 42,
                      borderRadius: 20,
                      borderColor: "#E6E6E6",
                    }}
                  />
                )}
              />
            </Col>

            {/* status */}
            <Col span={24} className="mt-2">
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
      <style jsx global>{`
        .ant-pagination {
          display: flex;
          gap: 6px;
        }
        .ant-pagination-item {
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }
        .ant-pagination-item a {
          color: #333;
        }
        .ant-pagination-item-active {
          border-color: #1677ff;
          background: #e6f4ff;
        }
        .ant-pagination-item-active a {
          color: #1677ff;
          font-weight: 600;
        }
        .ant-pagination-prev,
        .ant-pagination-next {
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }
        .ant-pagination-disabled {
          opacity: 0.4;
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
      `}</style>
    </Modal>
  );
}
