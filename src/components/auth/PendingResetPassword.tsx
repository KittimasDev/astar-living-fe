import { useState } from "react";
import { Button, Modal, Card, Image } from "antd";
import { useRouter } from "next/router";

export default function PendingResetPassword() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleRedirect = () => {
    router.push("/reset-password"); // ✅ ไปหน้า reset password
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Card
        style={{
          width: 700,
          borderRadius: 20,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <Image
          src="/password-icon.png"
          width={80}
          preview={false}
          alt="Password Reset"
          style={{ marginBottom: 20 }}
        />

        <div
          className="text-3xl text-[#87D2F7]"
          style={{ fontWeight: 600, marginBottom: 8 }}
        >
          คำขอรีเซ็ตรหัสผ่านของคุณ
        </div>
        <div className="my-12">
          คุณได้ร้องขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีนี้
          คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
        </div>

        <Button
          type="primary"
          size="large"
          onClick={handleRedirect}
          style={{
            height: 50,
            borderRadius: 5,
            background: "#87D2F7",
            borderColor: "#87D2F7",
            fontWeight: 600,
            width: "70%",
          }}
        >
          กดเพื่อเปลี่ยนรหัสผ่าน
        </Button>
      </Card>
    </div>
  );
}
