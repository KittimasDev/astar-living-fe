import {
  Layout,
  Avatar,
  Typography,
  Dropdown,
  Menu,
  message,
  Spin,
} from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthAPIs } from "../../networks/auth.api";
import { meQueryKey, useMe } from "../../hooks/useMe";

const { Text } = Typography;

export default function Header(props: any) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useMe();
  const [logoutLoading, setLogoutLoading] = useState(false); // โหลดตอน logout

  useEffect(() => {
    if (!isError) return;
    message.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    router.push("/login");
  }, [isError, router]);

  // ✅ handle logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AuthAPIs.logout();
      message.success("ออกจากระบบสำเร็จ");
    } catch {
      message.warning("เซิร์ฟเวอร์ไม่ตอบสนอง แต่ระบบได้ออกจากระบบแล้ว");
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      queryClient.removeQueries({ queryKey: meQueryKey });
      setTimeout(() => {
        router.push("/login");
      }, 800); // หน่วงนิดเพื่อให้ spinner แสดงสวยๆ
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: "logout",
          label: (
            <div
              className="flex items-center justify-center gap-2 text-[#A4A4A4] font-light"
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: "8px 0",
              }}
            >
              <RiLogoutBoxRLine size={16} />
              ออกจากระบบ
            </div>
          ),
          onClick: handleLogout,
        },
      ]}
    />
  );

  // ✅ Loading ระหว่าง getMe
  if (isLoading) {
    return (
      <div
        style={{
          height: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <Spin size="small" />
      </div>
    );
  }

  // ✅ Overlay Loading ตอน Logout
  if (logoutLoading) {
    return (
      <>
        <div
          className="flex justify-between items-center bg-white px-6 py-4"
          style={{
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="text-[#4D4C4C] font-bold lg:text-lg">
            {props?.menu}
          </div>
          <div className="flex items-center gap-3 select-none">
            <Avatar size={40} icon={<UserOutlined />} />
            <div className="ml-2 mr-8">
              <Text className="text-[#4D4C4C]">กำลังออกจากระบบ...</Text>
              <div className="text-[#4D4C4C] text-xs">กรุณารอสักครู่</div>
            </div>
          </div>
        </div>

        {/* 🔄 Overlay spinner กลางจอ */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Spin size="large" tip="กำลังออกจากระบบ..." />
        </div>
      </>
    );
  }

  return (
    <div
      className="flex justify-between items-center bg-white px-6 py-4"
      style={{
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="text-[#4D4C4C] font-bold lg:text-lg">{props?.menu}</div>

      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomRight"
        overlayClassName="custom-user-dropdown"
      >
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="ml-2 mr-8">
            <Text className="text-[#4D4C4C]">
              {user?.full_name || user?.username || "-"}
            </Text>
            <div className="text-[#4D4C4C] text-xs">
              {user?.role == "SUPERADMIN"
                ? "Astar"
                : user?.role == "ADMIN"
                ? "ผู้จัดการโครงการ"
                : user?.role == "MANAGER"
                ? "หัวหน้านิติ"
                : "นิติ"}
            </div>
          </div>
          <DownOutlined className="text-gray-400 text-xs" />
        </div>
      </Dropdown>
    </div>
  );
}
