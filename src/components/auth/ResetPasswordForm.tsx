import { useState } from "react";
import { Input, Button, Modal } from "antd";
import { LockOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useRouter } from "next/router";
import Image from "next/image";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: ตรวจสอบรหัสผ่าน และเรียก API เปลี่ยนรหัสได้ภายหลัง
    setOpen(true); // ✅ แสดง modal
  };

  const handleClose = () => {
    setOpen(false);
    router.push("/login"); // ✅ กลับไปหน้า login
  };

  return (
    <>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-gray-600 text-sm font-medium">
            รหัสผ่านใหม่ <span className="text-red-500">*</span>
          </label>
          <Input.Password
            size="large"
            placeholder="กรอกรหัสผ่านใหม่"
            // prefix={<LockOutlined />}
            style={{ borderRadius: 20 }}
          />
        </div>

        <div>
          <label className="text-gray-600 text-sm font-medium">
            ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
          </label>
          <Input.Password
            size="large"
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            // prefix={<LockOutlined />}
            style={{ borderRadius: 20 }}
          />
        </div>

        <div className="flex justify-center mt-16">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
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
            ยืนยัน
          </Button>
        </div>
      </form>

      {/* ✅ Modal สำเร็จ */}
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        closable={false}
        width={400}
        zIndex={2000}
        bodyStyle={{
          padding: "64px 40px 32px",
          borderRadius: "20px",
          background: "#fff",
        }}
        style={{
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="mb-8 text-xl font-semibold text-[#4CAF50]">
            เปลี่ยนรหัสผ่านสำเร็จ
          </div>
          <div className="flex justify-center mb-6">
            <Image
              src="/check.png" // 🔶 ใส่ path รูปประตูส้ม
              alt="check"
              width={180}
              height={180}
            />
          </div>
          <Button
            onClick={handleClose}
            style={{
              borderRadius: 20,
              width: 140,
              height: 40,
              borderColor: "#E6E6E6",
              color: "#333",
              background: "#fff",
              fontWeight: 500,
            }}
          >
            ย้อนกลับ
          </Button>
        </div>
      </Modal>
    </>
  );
}
