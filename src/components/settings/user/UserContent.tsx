import { Button, Input, Pagination, Space, Table, Tooltip } from "antd";
import { useState, useMemo, useEffect, useRef } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlinePencil, HiOutlineInbox } from "react-icons/hi2";
import { LuEye } from "react-icons/lu";
import UserFormModal from "./UserFormModal";
import UserSuccessModal from "./UserSuccessModal";
import ConfirmExitModal from "../../ConfirmExitModal";
import RoleFormModal from "./RoleFormModal";
import RoleSuccessModal from "./RoleSuccessModal";
import { UserAPIs } from "../../../networks/user.api";
import { useMe } from "../../../hooks/useMe";

export default function UserContent() {
  const { data: me } = useMe();
  const [activeTab, setActiveTab] = useState<"user" | "role" | "activity">(
    "user"
  );
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [viewActivityDetail, setViewActivityDetail] = useState<null | any>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRoleSuccess, setShowRoleSuccess] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const pageSize = 10;

  const [userData, setUserData] = useState<any>();
  const [projectData, setProjectData] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();

  const [search, setSearch] = useState<{
    username?: string;
    full_name?: string;
  }>({});

  const fetchData = async (
    page = 1,
    filters: { username?: string; full_name?: string } = {}
  ) => {
    try {
      const response = await UserAPIs.getAll({
        page: currentPage,
        limit: 9999,
        // username: filters.full_name,
        full_name: filters.full_name,
      });
      const pageInfo = response?.data?.page_information;

      const myProjectId = me?.project_id ?? null;

      if (me?.role != "SUPERADMIN") {
        setUserData(
          (response?.data?.body || []).filter(
            (u: any) => u.project_id === myProjectId
          )
        );
      } else {
        setUserData(response?.data?.body);
      }

      setPageInfo(pageInfo);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const debounceRef = useRef<any>(null);

  const onSearchChange = (field: "username" | "full_name", value: string) => {
    const val = value.trim();

    setSearch((prev) => ({
      ...prev,
      [field]: val || undefined,
    }));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
  };

  useEffect(() => {
    fetchData(currentPage, search);
  }, [currentPage, search, me?.project_id, me?.role]);

  // ✅ แยก columns ตามแท็บ
  const getColumnsByTab = (): any => {
    if (activeTab === "user") {
      return [
        {
          title: "ลำดับ",
          dataIndex: "id",
          width: 80,
          render: (_: any, __: any, index: number) =>
            (currentPage - 1) * pageSize + index + 1,
        },
        { title: "รหัสผู้ใช้งาน", dataIndex: "id", width: 150 },
        { title: "ชื่อเต็ม", dataIndex: "full_name" },
        { title: "โครงการ", dataIndex: "project", render: (d: any) => d?.name },
        { title: "ชื่อผู้ใช้งาน", dataIndex: "username" },
        {
          title: "สิทธิ์ผู้ใช้งาน",
          dataIndex: "role",
          render: (data: any) => {
            return (
              <>
                {data == "SUPERADMIN"
                  ? "Astar"
                  : data == "ADMIN"
                  ? "ผู้จัดการโครงการ"
                  : data == "MANAGER"
                  ? "หัวหน้านิติ"
                  : "นิติ"}
              </>
            );
          },
        },
        { title: "อีเมล", dataIndex: "email" },
        { title: "เบอร์โทร", dataIndex: "phone" },
        {
          title: "สถานะการใช้งาน",
          dataIndex: "active",
          align: "center",
          width: 160,
          render: (isActive: boolean) => renderStatusBadge(isActive),
        },
        {
          title: "",
          key: "actions",
          align: "center",
          width: 120,
          render: (_: any, record: any) => renderActions(record, true),
        },
      ];
    }

    if (activeTab === "role") {
      return [
        { title: "ลำดับ", dataIndex: "id", width: 80 },
        { title: "สิทธิ์", dataIndex: "role_name" },
        {
          title: "สถานะการใช้งาน",
          dataIndex: "active",
          align: "center",
          width: 160,
          render: (isActive: boolean) => renderStatusBadge(isActive),
        },
        {
          title: "",
          key: "actions",
          align: "center",
          width: 120,
          render: (_: any, record: any) => renderActions(record, true),
        },
      ];
    }

    // ✅ Activity Log
    return [
      { title: "ลำดับ", dataIndex: "id", width: 80 },
      { title: "ผู้ใช้งาน", dataIndex: "full_name" },
      { title: "โครงการ", dataIndex: "project_name" },
      { title: "สิทธิ์", dataIndex: "role" },
      {
        title: "สถานะการใช้งาน",
        dataIndex: "active",
        align: "center",
        width: 160,
        render: (isActive: boolean) => renderStatusBadge(isActive),
      },
      {
        title: "",
        key: "actions",
        align: "center",
        width: 120,
        render: (_: any, record: any) => renderActions(record, false),
      },
    ];
  };

  // ✅ ส่วน render ปุ่ม action
  // const renderActions = (record: any, canEdit: boolean) => (
  //   <Space size={16}>
  //     <Tooltip title="ดูรายละเอียด">
  //       <button
  //         onClick={() => handleOpenModal("view", record)}
  //         className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
  //       >
  //         <LuEye />
  //       </button>
  //     </Tooltip>
  //     {canEdit && (
  //       <Tooltip title="แก้ไข">
  //         <button
  //           onClick={() => handleOpenModal("edit", record)}
  //           className="text-[#52c41a] hover:text-green-400 transition cursor-pointer"
  //         >
  //           <HiOutlinePencil />
  //         </button>
  //       </Tooltip>
  //     )}
  //   </Space>
  // );

  const renderStatusBadge = (isActive: boolean) => (
    <div
      className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm font-medium w-fit mx-auto ${
        isActive ? "bg-[#E8F8EC] text-[#3CB371]" : "bg-[#F5F5F5] text-[#8C8C8C]"
      }`}
      style={{
        minWidth: 110,
        textAlign: "center",
        border: `1px solid ${isActive ? "#B6E3BF" : "#D9D9D9"}`,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: isActive ? "#52C41A" : "#BFBFBF",
        }}
      ></span>
      {isActive ? "กำลังใช้งาน" : "ปิดการใช้งาน"}
    </div>
  );

  // ✅ เปิด/ปิด modal
  const handleOpenModal = (mode: "create" | "edit" | "view", record?: any) => {
    setModalMode(mode);
    setSelectedRecord(record || null);
    setModalOpen(true);
  };

  const handleCancelForm = () => {
    if (modalMode === "create" || modalMode === "edit")
      setShowConfirmExit(true);
    else setModalOpen(false);
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    setModalOpen(false);
  };

  const handleSubmitUser = async (values: any) => {
    if (modalMode === "create") {
      // ✅ เพิ่ม user ใหม่
      const newUser = {
        id: tableData.length + 1,
        user_code: `U-${tableData.length + 1}`,
        full_name: values.full_name,
        project_name: values.project_name,
        username: values.username,
        role: values.role,
        email: values.email,
        phone: values.phone,
        is_active: values.is_active,
      };

      const payload = {
        username: values.username,
        password_hash: String(values.password),
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        project_id: values.project_id,
        active: true,
        created_by: userData?.id,
        updated_by: userData?.id,
      };

      await UserAPIs.create(payload);

      fetchData();

      // setTableData([payload, ...tableData]);
    } else if (modalMode === "edit" && selectedRecord) {
      const payload = {
        username: values.username,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        project_id: values.project_id,
        active: true,
        updated_by: userData?.id,
      };

      await UserAPIs.update(selectedRecord.id, payload);

      fetchData();

      // setTableData(updated);
    }

    setModalOpen(false);
    setShowSuccess(true);
  };

  // ฟังก์ชัน submit ของ Role
  const handleSubmitRole = (values: any) => {
    if (modalMode === "create") {
      const newRole = {
        id: tableData.length + 1,
        role_name: values.role_name,
        is_active: values.is_active,
        permissions: values.permissions || {}, // ✅ เก็บ permissions ด้วย
      };
      setTableData([...tableData, newRole]);
    } else if (modalMode === "edit" && selectedRecord) {
      const updated = tableData.map((item) =>
        item.id === selectedRecord.id
          ? {
              ...item,
              role_name: values.role_name,
              is_active: values.is_active,
              permissions: values.permissions || {}, // ✅ อัปเดต permissions ด้วย
            }
          : item
      );
      setTableData(updated);
    }
    setModalOpen(false);
    setShowRoleSuccess(true);
  };

  const renderActions = (record: any, canEdit: boolean) => (
    <Space size={16}>
      <Tooltip title="ดูรายละเอียด">
        <button
          onClick={() => {
            if (activeTab === "activity") {
              setViewActivityDetail(record); // ✅ ไปหน้า detail
            } else {
              handleOpenModal("view", record);
            }
          }}
          className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
        >
          <LuEye />
        </button>
      </Tooltip>
      {canEdit && activeTab !== "activity" && (
        <Tooltip title="แก้ไข">
          <button
            onClick={() => handleOpenModal("edit", record)}
            className="text-[#52c41a] hover:text-green-400 transition cursor-pointer"
          >
            <HiOutlinePencil />
          </button>
        </Tooltip>
      )}
    </Space>
  );

  // ✅ Tabs config
  const TABS = [
    { key: "user", label: "ผู้ใช้งาน" },
    { key: "role", label: "จัดการสิทธิ์ผู้ใช้งาน" },
    { key: "activity", label: "Activity Log" },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🧭 Tabs */}
      <div className="flex mb-6 gap-3">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            type={activeTab === tab.key ? "primary" : "default"}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              borderRadius: 40,
              height: 52,
              width: 180,
              padding: "0 20px",
              background: activeTab === tab.key ? "#8DD3F4" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#555",
              border: activeTab === tab.key ? "none" : "1px solid #87D2F7",
              fontSize: 14,
              fontWeight: 500,
              boxShadow:
                activeTab === tab.key
                  ? "0 2px 6px rgba(135,210,247,0.35)"
                  : "none",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                activeTab === tab.key ? "#8DD3F4" : "#F5FBFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                activeTab === tab.key ? "#8DD3F4" : "#fff";
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 🔍 Search + Add */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder={`ค้นหา${
            activeTab === "user"
              ? "ผู้ใช้งาน"
              : activeTab === "role"
              ? "สิทธิ์"
              : "ผู้ใช้งาน"
          }`}
          prefix={<SearchOutlined />}
          allowClear
          value={search.username || search.full_name || ""}
          onChange={(e) => onSearchChange("full_name", e.target.value)}
          style={{
            borderRadius: 20,
            height: 40,
            // width: 320,
          }}
        />
        {activeTab !== "activity" && (
          <Button
            type="primary"
            onClick={() => handleOpenModal("create")}
            style={{
              height: 40,
              borderRadius: 5,
              marginLeft: 20,
            }}
            className="!bg-[#74BA3D] !border-[#74BA3D] lg:w-40 font-medium"
          >
            <div>
              <PlusOutlined />
              <span className="ml-2">
                {activeTab === "user" ? "เพิ่มผู้ใช้งาน" : "เพิ่มสิทธิ์"}
              </span>
            </div>
          </Button>
        )}
      </div>

      <div className="mb-2 font-bold">
        {activeTab === "user"
          ? "รายการผู้ใช้งานระบบ"
          : activeTab === "role"
          ? "รายการสิทธิ์ผู้ใช้งาน"
          : "รายการการใช้งานระบบ"}
      </div>

      {!viewActivityDetail && (
        <Table
          columns={getColumnsByTab()}
          dataSource={userData}
          rowKey="id"
          pagination={false}
          className="custom-table"
          locale={{
            emptyText: (
              <div className="flex flex-col items-center justify-center py-10">
                <HiOutlineInbox size={48} color="#d1d5dc" />
                <p className="text-gray-300 text-lg mt-2">ไม่มีข้อมูล</p>
              </div>
            ),
          }}
        />
      )}

      {activeTab === "activity" && viewActivityDetail && (
        <div className="">
          <div className="mb-2 text-gray-700">
            {viewActivityDetail.full_name}
          </div>

          <Table
            columns={[
              {
                title: "ลำดับ",
                dataIndex: "id",
                width: 80,
              },
              {
                title: "โครงการ",
                dataIndex: "project_name",
              },
              {
                title: "รายการ",
                dataIndex: "action_name",
              },
              {
                title: "วันที่",
                dataIndex: "action_date",
              },
            ]}
            dataSource={viewActivityDetail.activities || []}
            rowKey="id"
            pagination={false}
            bordered={false}
            className="custom-table"
          />

          <div className="flex justify-end mt-6">
            <Button
              type="default"
              onClick={() => setViewActivityDetail(null)} // ✅ กลับไปหน้าหลัก
              style={{
                borderRadius: 20,
                width: 120,
                height: 40,
                background: "#fff",
                borderColor: "#E6E6E6",
                fontWeight: 500,
              }}
            >
              ย้อนกลับ
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        {!viewActivityDetail && (
          <Pagination
            current={currentPage}
            // total={pageInfo?.total || 0}
            total={0}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {activeTab === "user" ? (
        <UserFormModal
          open={modalOpen}
          mode={modalMode}
          data={selectedRecord}
          onCancel={handleCancelForm}
          onSubmit={handleSubmitUser}
          existingUsers={userData}
        />
      ) : activeTab === "role" ? (
        <RoleFormModal
          open={modalOpen}
          mode={modalMode}
          data={selectedRecord}
          onCancel={handleCancelForm}
          onSubmit={handleSubmitRole}
          existingRoles={tableData}
        />
      ) : null}

      <UserSuccessModal
        open={showSuccess}
        mode={modalMode}
        onClose={() => setShowSuccess(false)}
      />

      <RoleSuccessModal
        open={showRoleSuccess}
        mode={modalMode}
        onClose={() => setShowRoleSuccess(false)}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={() => setShowConfirmExit(false)}
        onConfirm={handleConfirmExit}
      />

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

        .ant-switch-inner {
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
