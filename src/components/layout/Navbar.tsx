import { Layout, Menu, Image } from "antd";
import { useRouter } from "next/router";
import { FaSackDollar } from "react-icons/fa6";
import { RiSettings3Fill } from "react-icons/ri";
import { MdCreditCardOff, MdDashboard } from "react-icons/md";
import { FaFileInvoiceDollar, FaListAlt, FaUserFriends } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import { BiSolidReport } from "react-icons/bi";
import { IoReceipt } from "react-icons/io5";
import { LuFileClock } from "react-icons/lu";
import { FaUserLarge } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { AiFillCreditCard } from "react-icons/ai";
import { TbMoneybag, TbTemplate, TbTemplateOff } from "react-icons/tb";
import { RiBillFill } from "react-icons/ri";
import { useMe } from "../../hooks/useMe";
import { useProjectById } from "../../hooks/useProject";

const { Sider } = Layout;

type MenuItem = {
  key: string;
  label: string;
  icon?: any;
  path?: string;
  children?: MenuItem[];
};

export default function Navbar() {
  const router = useRouter();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>();
  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const { data: project } = useProjectById(me?.project_id, {
    enabled: Boolean(me && me.role !== "SUPERADMIN" && me.project_id != null),
  });

  const renderMenuItems = (menus: MenuItem[]) => {
    return menus.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.label}
        </Menu.Item>
      );
    });
  };

  /** ✅ ตรวจสอบสิทธิ์ */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ ดึง user จาก localStorage ก่อน เพื่อไม่ให้กระพริบ
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setIsAuthenticated(true);
          setLoading(false); // render ได้ทันที
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (meLoading) return;

    if (meError || !me) {
      window.location.href = "/login";
      return;
    }

    setUser(me);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(me));
  }, [meLoading, meError, me]);

  useEffect(() => {
    if (!loading && user?.role === "SUPERADMIN") {
      if (router.pathname === "/" || router.pathname === "/dashboard") {
        router.replace("/settings/project");
      }
    }
  }, [loading, user?.role, router.pathname, router]);

  /** ✅ กำหนด items โดยคำนึงถึง role */
  const items = useMemo<MenuItem[]>(() => {
    if (!user) return [];

    const role = user.role;

    // base ของเมนูใน "การตั้งค่า"
    const allSettingsChildren = [
      {
        key: "settings-project",
        label: "ตั้งค่าโครงการ",
        path: "/settings/project",
        icon: <GoHomeFill size={16} />,
      },
      {
        key: "settings-payment-method",
        label: "ตั้งค่าวิธีการชำระเงิน",
        path: "/settings/payment-method",
        icon: <AiFillCreditCard size={16} />,
      },
      {
        key: "settings-project-rate",
        label: "ตั้งค่าอัตราค่าบริการ",
        path: "/settings/project-rate",
        icon: <FaSackDollar size={16} />,
      },
      {
        key: "settings-collection-notice-settings",
        label: "เทมเพลตค่าทวงถาม",
        path: "/settings/collection-notice-settings",
        icon: <TbTemplate size={16} />,
      },
      {
        key: "settings-user",
        label: "ผู้ใช้งาน",
        path: "/settings/user",
        icon: <FaUserLarge size={16} />,
      },
    ];

    let settingsChildren: any[] = [];

    if (role === "SUPERADMIN") {
      // SUPERADMIN เห็นแค่ 2 เมนูใน "การตั้งค่า"
      settingsChildren = allSettingsChildren.filter((item) =>
        ["settings-project", "settings-user"].includes(item.key),
      );

      // SUPERADMIN ต้องเห็นเมนูหลักแค่เมนูการตั้งค่าเท่านั้น
      return [
        {
          key: "settings",
          icon: <RiSettings3Fill size={18} />,
          label: "การตั้งค่า",
          path: "/settings",
          children: settingsChildren,
        },
      ];
    }

    // ADMIN และ MANAGER
    if (role === "ADMIN" || role === "MANAGER") {
      settingsChildren = allSettingsChildren.filter(
        (item) => item.key !== "settings-project",
      );
    }

    // USER
    if (role === "USER") {
      settingsChildren = []; // ไม่มีเมนูการตั้งค่าทั้งก้อน
    }

    // เมนูหลักปกติ (ทุกคนยกเว้น SUPERADMIN)
    const baseMenu: MenuItem[] = [
      {
        key: "dashboard",
        icon: <MdDashboard size={18} />,
        label: "แดชบอร์ด",
        path: "/dashboard",
      },
      {
        key: "resident",
        icon: <FaUserFriends size={18} />,
        label: "ข้อมูลลูกบ้าน / ผู้อยู่อาศัย",
        path: "/resident",
      },
      {
        key: "payment",
        icon: <FaFileInvoiceDollar size={18} />,
        label: "ใบแจ้งหนี้",
        path: "/payment",
      },
      {
        key: "credit-note",
        icon: <MdCreditCardOff size={18} />,
        label: "ลดหนี้",
        path: "/credit-note",
      },
      {
        key: "overdue",
        icon: <FaListAlt size={18} />,
        label: "รายการค้างชำระ",
        path: "/overdue",
      },
      {
        key: "collection-notice",
        icon: <RiBillFill size={18} />,
        label: "ใบทวงถาม",
        path: "/collection-notice",
      },
      {
        key: "receipt",
        icon: <IoReceipt size={18} />,
        label: "ใบเสร็จรับเงิน",
        path: "/receipt",
      },
      {
        key: "report",
        icon: <BiSolidReport size={18} />,
        label: "รายงาน",
        path: "/report",
      },
    ];

    // USER → ตัดเมนู settings & system logs
    if (role === "USER") {
      return baseMenu;
    }

    // ADMIN & MANAGER → เห็น settings + system logs
    baseMenu.push({
      key: "settings",
      icon: <RiSettings3Fill size={18} />,
      label: "การตั้งค่า",
      path: "/settings",
      children: settingsChildren,
    });

    baseMenu.push({
      key: "system-logs",
      icon: <LuFileClock size={18} />,
      label: "บันทึกการทำงานของระบบ",
      path: "/system-logs",
    });

    return baseMenu;
  }, [user]);

  /** ✅ current key */
  const currentKey =
    router.pathname.split("/").slice(1).join("-") || "dashboard";

  /** ✅ เปิด submenu ปัจจุบัน */
  useEffect(() => {
    const parent = items.find((item: any) =>
      item.children?.some((child: any) => router.pathname === child.path),
    );
    if (parent) setOpenKeys([parent.key]);
  }, [router.pathname, items]);

  const handleMenuClick = (e: any) => {
    const findPath = (arr: any[]): string | undefined => {
      for (const item of arr) {
        if (item.key === e.key) return item.path;
        if (item.children) {
          const childPath = findPath(item.children);
          if (childPath) return childPath;
        }
      }
    };
    const path = findPath(items);
    if (path) router.push(path);
  };

  if (loading) return null;

  let projectUrl = "";

  if (project?.project_logo) {
    projectUrl = project.project_logo;
  }

  return (
    <Sider
      width={280}
      style={{
        background: "#fff",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: "0 20px",
      }}
    >
      <div className="flex justify-center items-center mb-8">
        {user?.role === "SUPERADMIN" ? (
          <Image
            src="/living-logo.png"
            // width={160}
            height={150}
            preview={false}
            alt="Logo"
            className="mt-4"
          />
        ) : (
          <Image
            src={projectUrl}
            height={150}
            // width={160}
            preview={false}
            alt="Logo"
            className="mt-4"
          />
        )}
        {/* <Image src="/logo.png" width={180} preview={false} alt="Garden View" /> */}
      </div>

      <Menu
        className="no-menu-border"
        mode="inline"
        selectedKeys={[currentKey]}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={handleMenuClick}
      >
        {renderMenuItems(items)}
      </Menu>
      <style jsx global>{`
        .ant-menu {
          border-inline-end: none !important;
        }

        .no-menu-border .ant-menu {
          border-inline-end: none !important;
        }
      `}</style>
    </Sider>
  );
}
