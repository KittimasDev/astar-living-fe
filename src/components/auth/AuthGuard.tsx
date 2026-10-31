import { useEffect } from "react";
import { Spin, message } from "antd";
import { useMe } from "../../hooks/useMe";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useMe();

  useEffect(() => {
    if (isError) {
      message.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "/login";
    }
  }, [isError]);

  return (
    <>
      {/* ✅ render content เสมอ เพื่อให้เห็นข้างหลัง */}
      {children}

      {/* ✅ overlay ที่ทับ content จริง */}
      {isLoading && !isError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "none", // ✅ ปล่อยให้ event ข้างหลังทำงานได้ ถ้าอยากให้กดไม่ได้เอาออก
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </>
  );
}
