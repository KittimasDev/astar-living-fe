import {
  Button,
  Input,
  Pagination,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlinePencil, HiOutlineInbox } from "react-icons/hi2";
import { LuEye } from "react-icons/lu";
import ProjectFormModal from "./ProjectFormModal"; // ✅ import modal
import ProjectSuccessModal from "./ProjectSuccessModal";
import ConfirmExitModal from "../../ConfirmExitModal";
import { ProjectAPIs } from "../../../networks/project.api";
import { useMe } from "../../../hooks/useMe";

export default function ProjectContent() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [showSuccess, setShowSuccess] = useState(false); // ✅ success modal
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const pageSize = 10;

  const [projectData, setProjectData] = useState<any>();
  const { data: me } = useMe();
  const [pageInfo, setPageInfo] = useState<any>(null);

  const [search, setSearch] = useState<{
    name?: string;
  }>({});

  const fetchData = useCallback(
    async (page = 1, filters: { name?: string } = {}) => {
      try {
        const response = await ProjectAPIs.getAll({
          page,
          name: filters.name,
        });
        const pageInfo = response?.data?.page_information;

        setProjectData(response?.data?.body);
        setPageInfo(pageInfo);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    },
    []
  );

  const debounceRef = useRef<any>(null);

  const onSearchChange = (field: "name", value: string) => {
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
  }, [currentPage, search, fetchData]);

  const handleOpenModal = (mode: "create" | "edit" | "view", record?: any) => {
    setModalMode(mode);
    setSelectedRecord(record || null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (modalMode === "create") {
      try {
        const payload = {
          active: values.is_active, // ✅ ใช้ค่าจาก switch
          created_by: me?.id,
          updated_by: me?.id,
          name: values.name,
          address: values.address,
          contact_name: values.contact_name,
          contact_phone: values.contact_phone,
          contact_fax_phone: values.contact_fax_phone,
        };

        // ✅ 1. สร้าง project
        const res = await ProjectAPIs.create(payload);
        const newProjectId = res?.data?.body?.id;

        if (!newProjectId) {
          message.error("สร้างโครงการไม่สำเร็จ (ไม่พบ ID)");
          return;
        }

        // ✅ 2. ถ้ามีรูป ให้ upload ต่อ
        if (values.logo) {
          try {
            await ProjectAPIs.upload(newProjectId, values.logo); // ✅ ส่งไฟล์ตรง ๆ
          } catch (uploadErr) {
            console.error("Upload logo failed:", uploadErr);
            message.warning("อัปโหลดรูปไม่สำเร็จ แต่สร้างโครงการเรียบร้อยแล้ว");
          }
        }

        // ✅ 3. โหลดข้อมูลใหม่ + ปิด modal
        await fetchData();
        setModalOpen(false);
        setShowSuccess(true);
        message.success("เพิ่มโครงการสำเร็จ");
      } catch (error) {
        console.error("Error creating project:", error);
        message.error("ไม่สามารถเพิ่มโครงการได้");
      }
    } else if (modalMode === "edit" && selectedRecord) {
      try {
        const payload = {
          active: values.is_active, // ✅ ใช้ค่าจาก switch
          created_by: me?.id,
          updated_by: me?.id,
          name: values.name,
          address: values.address,
          contact_name: values.contact_name,
          contact_phone: values.contact_phone,
          contact_fax_phone: values.contact_fax_phone,
        };

        // ✅ 1. สร้าง project
        const res = await ProjectAPIs.update(selectedRecord.id, payload);

        // ✅ 2. ถ้ามีรูป ให้ upload ต่อ
        if (values.logo) {
          try {
            await ProjectAPIs.upload(selectedRecord.id, values.logo); // ✅ ส่งไฟล์ตรง ๆ
          } catch (uploadErr) {
            console.error("Upload logo failed:", uploadErr);
            // message.warning("อัปโหลดรูปไม่สำเร็จ แต่สร้างโครงการเรียบร้อยแล้ว");
          }
        }

        // ✅ 3. โหลดข้อมูลใหม่ + ปิด modal
        await fetchData();
        setModalOpen(false);
        setShowSuccess(true);
        // message.success("แก้ไขโครงการสำเร็จ");
      } catch (error) {
        console.error("Error creating project:", error);
        message.error("ไม่สามารถแก้ไขโครงการได้");
      }

      await fetchData();

      setModalOpen(false);
      setShowSuccess(true);
    }
  };

  const handleCancelForm = () => {
    // ✅ ถ้าอยู่ในโหมด create/edit ให้ถามยืนยันก่อน
    if (modalMode === "create" || modalMode === "edit") {
      setShowConfirmExit(true);
    } else {
      setModalOpen(false); // view ปิดได้เลย
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    setModalOpen(false);
  };

  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    { title: "ชื่อโครงการ", dataIndex: "name", key: "name" },
    { title: "ที่อยู่โครงการ", dataIndex: "address", key: "address" },
    { title: "ผู้ประสานงาน", dataIndex: "contact_name", key: "contact_name" },
    {
      title: "เบอร์โทรติดต่อ",
      dataIndex: "contact_phone",
      key: "contact_phone",
    },
    {
      title: "สถานะการใช้งาน",
      dataIndex: "active",
      key: "active",
      align: "center",
      width: 160,
      render: (isActive: boolean) => (
        <div
          className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm font-medium w-fit mx-auto ${
            isActive
              ? "bg-[#E8F8EC] text-[#3CB371]"
              : "bg-[#F5F5F5] text-[#8C8C8C]"
          }`}
          style={{
            minWidth: 110,
            textAlign: "center",
            border: `1px solid ${isActive ? "#B6E3BF" : "#D9D9D9"}`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isActive ? "#52C41A" : "#BFBFBF",
            }}
          ></span>
          {isActive ? "กำลังใช้งาน" : "ปิดการใช้งาน"}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "center",
      width: 120,
      render: (_: any, record: any) => (
        <Space size={16}>
          <Tooltip title="ดูรายละเอียด">
            <button
              onClick={() => handleOpenModal("view", record)}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              <LuEye />
            </button>
          </Tooltip>
          <Tooltip title="แก้ไข">
            <button
              onClick={() => handleOpenModal("edit", record)}
              className="text-[#52c41a] hover:text-green-400 transition cursor-pointer"
            >
              <HiOutlinePencil />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Search + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="ค้นหาโครงการ"
          prefix={<SearchOutlined />}
          allowClear
          value={search.name || ""}
          onChange={(e) => onSearchChange("name", e.target.value)}
          style={{
            paddingLeft: "20px",
            borderRadius: "20px",
            height: "40px",
          }}
          className="w-80 rounded-full mr-4"
        />
        <Button
          type="primary"
          onClick={() => handleOpenModal("create")}
          style={{
            height: "40px",
            borderRadius: 5,
          }}
          className="bg-[#74BA3D]! border-[#74BA3D]! lg:w-36 rounded-md font-medium"
        >
          <div>
            <PlusOutlined />
            <span className="ml-2">เพิ่มโครงการ</span>
          </div>
        </Button>
      </div>

      <div className="mb-2 font-bold">รายการโครงการ</div>

      {/* 📋 Table */}
      <Table
        className="custom-table"
        columns={columns}
        dataSource={projectData}
        rowKey="id"
        pagination={false}
        bordered={false}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center justify-center py-10">
              <HiOutlineInbox size={48} color="#d1d5dc" />
              <p className="text-gray-300 text-lg mt-2">ไม่มีข้อมูล</p>
            </div>
          ),
        }}
      />

      {/* ✅ Custom pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Pagination
          current={currentPage}
          total={pageInfo?.total || 0}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* ✅ Modal */}
      <ProjectFormModal
        open={modalOpen}
        mode={modalMode}
        data={selectedRecord}
        onCancel={handleCancelForm} // ✅ ใช้ handler ใหม่
        onSubmit={handleSubmit}
        existingProjects={tableData}
      />

      {/* ✅ Success Modal */}
      <ProjectSuccessModal
        open={showSuccess}
        mode={modalMode}
        onClose={() => setShowSuccess(false)}
      />

      {/* ✅ Confirm Exit Modal */}
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
