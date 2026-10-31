import { Input, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/router"; // ✅ เพิ่ม

export default function ForgotPasswordForm() {
  const router = useRouter(); // ✅ ใช้งาน Router

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 👉 ตรงนี้คุณสามารถเพิ่ม logic ตรวจสอบอีเมล หรือเรียก API ก่อน redirect ได้ภายหลัง
    router.push("/pending-reset-password");
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div>
        <label className="text-gray-600 text-sm font-medium">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <Input
          size="large"
          placeholder="กรอกอีเมล"
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
  );
}
