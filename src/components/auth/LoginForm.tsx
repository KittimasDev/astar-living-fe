import { Input, Button, message, Modal, Spin, Alert, Image } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { AuthAPIs } from "../../networks/auth.api";
import { meQueryKey } from "../../hooks/useMe";

type LoginFormInputs = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null); // ✅ error message จาก API

  const methods = useForm<LoginFormInputs>({
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: LoginFormInputs) => {
    setAuthError(null);
    setLoading(true);
    setIsModalVisible(true);

    try {
      const res = await AuthAPIs.login({
        username: data.username.trim(),
        password: data.password.trim(),
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      const me = await AuthAPIs.getMe();
      const meBody = me.data.body;
      localStorage.setItem("user", JSON.stringify(meBody));
      queryClient.setQueryData(meQueryKey, meBody);

      if (meBody.role === "SUPERADMIN") {
        return router.replace("/settings/project");
      }

      return router.push("/dashboard");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setAuthError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setAuthError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      }
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Username */}

        <div>
          <label className="text-gray-600 text-sm font-medium">
            ชื่อผู้ใช้ <span className="text-red-500">*</span>
          </label>
          <Controller
            name="username"
            control={control}
            rules={{
              required: "กรุณากรอกชื่อผู้ใช้",
              minLength: {
                value: 3,
                message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="กรอกชื่อผู้ใช้"
                prefix={<UserOutlined />}
                style={{ borderRadius: 20 }}
              />
            )}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-gray-600 text-sm font-medium">
            รหัสผ่าน <span className="text-red-500">*</span>
          </label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "กรุณากรอกรหัสผ่าน",
              minLength: {
                value: 4,
                message: "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร",
              },
            }}
            render={({ field }) => (
              <Input.Password
                {...field}
                size="large"
                placeholder="กรอกรหัสผ่าน"
                prefix={<LockOutlined />}
                style={{ borderRadius: 20 }}
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}

          <div
            className="text-gray-300 text-right hover:underline cursor-pointer"
            onClick={() => router.push("/forgot-password")}
          >
            ลืมรหัสผ่าน?
          </div>
        </div>

        {/* Error จาก API */}
        {authError && (
          <Alert
            message={authError}
            type="error"
            showIcon
            style={{ borderRadius: 10, marginTop: 10 }}
          />
        )}

        {/* Submit */}
        <div className="flex justify-center mt-16">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            style={{
              height: 50,
              borderRadius: 25,
              background: "#87D2F7",
              borderColor: "#87D2F7",
              fontWeight: 600,
              width: "40%",
              textAlign: "center",
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </form>

      {/* Modal Loading */}
      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        centered
        maskClosable={false}
        bodyStyle={{
          textAlign: "center",
          padding: "40px 20px",
        }}
        style={{
          overflow: "hidden",
          borderRadius: 20,
        }}
      >
        <Spin size="large" />
        <div
          style={{
            marginTop: 20,
            fontSize: 18,
            fontWeight: 500,
            color: "#333",
          }}
        >
          กำลังเข้าสู่ระบบ กรุณารอสักครู่...
        </div>
      </Modal>
    </>
  );
}
