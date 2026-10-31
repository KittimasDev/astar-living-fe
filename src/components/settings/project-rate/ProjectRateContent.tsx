import {
  Button,
  Input,
  Pagination,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useState, useMemo, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlinePencil, HiOutlineInbox } from "react-icons/hi2";
import { LuEye } from "react-icons/lu";
import ProjectFormModal from "./ProjectRateFormModal"; // ✅ import modal
import ProjectSuccessModal from "./ProjectRateSuccessModal";
import ConfirmExitModal from "../../ConfirmExitModal";
import { ProjectAPIs } from "../../../networks/project.api";
import { SettingsAPIs } from "../../../networks/setting.api";
import { authAPIs } from "../../../networks/auth";
import { useMe } from "../../../hooks/useMe";
import dayjs from "dayjs";

export default function ProjectRateContent() {
  const { data: me } = useMe();
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
  const [settingData, setSettingData] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();

  const fetchData = async () => {
    try {
      const projectId = me?.project_id;

      if (!projectId) {
        console.warn("ไม่พบ project_id จาก getMe()");
        return;
      }

      // ✅ ส่ง project_id ไปเรียก settings ของโครงการนั้น
      const settingRes = await SettingsAPIs.getOneProjectSettings(projectId, {
        page: currentPage,
      });
      const settingData = settingRes?.data?.body;
      const pageInfo = settingRes?.data?.page_information;

      // ✅ เอาไว้เก็บใน state ถ้ามี
      setProjectData([settingData]);
      setPageInfo(pageInfo);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, me?.project_id]);

  const handleOpenModal = async (
    mode: "create" | "edit" | "view",
    record?: any
  ) => {
    setModalMode(mode);
    setSelectedRecord(record || null);

    if (mode !== "create" && record?.project_id) {
      // ดึงข้อมูล settings ของ project นี้มาก่อนเปิด modal
      try {
        const res = await getOne(record.project_id);
        setSettingData(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดข้อมูลโครงการได้");
        return;
      }
    }

    setModalOpen(true);
  };

  console.log("s", settingData);

  const getOne = async (id: any) => {
    try {
      const responseSetting = await SettingsAPIs.getOneProjectSettings(id, {});
      const data = responseSetting?.data?.body;
      setSettingData(data);
      return data;
    } catch (err) {
      console.error("getOne error", err);
      throw err;
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        project_id: values?.project_id,
        maintenance_fee_rate: Number(values.maintenance_fee_rate || ""),
        collection_fee: Number(values.collection_fee || ""),
        fine_rate: Number(values.fine_rate || ""),
        invoice_prefix: values.invoice_prefix || "",
        receipt_prefix: values.receipt_prefix || "",
        active: values.active ?? true,
        invoice_note: values.invoice_note || "",
        receipt_note: values.receipt_note || "",
        effective_date: values.effective_date
          ? dayjs(values.effective_date).format("YYYY-MM-DD")
          : null,
        discount_rate: Number(values.discount_rate) || 0,
      };

      if (modalMode === "create") {
        await SettingsAPIs.create(payload);
        message.success("เพิ่มอัตราค่าบริการสำเร็จ");
      } else if (modalMode === "edit" && selectedRecord) {
        await SettingsAPIs.updateProjectSettings(
          selectedRecord.project_id,
          payload
        );
        message.success("อัปเดตข้อมูลเรียบร้อย");
      }
      setModalOpen(false);
      setShowSuccess(true);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ✅ ไม่ปิดฟอร์ม แค่เปิด confirm ซ้อนทับ
  const handleCancelForm = () => {
    if (modalMode === "create" || modalMode === "edit") {
      setShowConfirmExit(true); // เปิดกล่องยืนยัน
    } else {
      setModalOpen(false); // view ปิดได้เลย
    }
  };

  // ✅ กดยืนยันออก -> ปิดทั้ง confirm และ form
  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    setModalOpen(false);
  };

  // ✅ กดยกเลิก -> ปิดเฉพาะ confirm (ฟอร์มยังค้างอยู่)
  const handleCancelExit = () => {
    setShowConfirmExit(false);
  };

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

  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    // { title: "โครงการ", dataIndex: "name", key: "name" },
    {
      title: "โครงการ",
      dataIndex: "project",
      render: () => me?.project?.name,
    },
    {
      title: "ค่าส่วนกลางต่อตารางวา",
      dataIndex: "maintenance_fee_rate",
      key: "maintenance_fee_rate",
      align: "right",
    },
    {
      title: "ค่าเบี้ยปรับ (%)",
      dataIndex: "fine_rate",
      key: "fine_rate",
      align: "right",
    },
    {
      title: "ค่าทวงถามต่อเดือน",
      dataIndex: "collection_fee",
      key: "collection_fee",
      align: "right",
    },
    {
      title: "Prefix ใบแจ้งหนี้",
      dataIndex: "invoice_prefix",
      key: "invoice_prefix",
      align: "right",
    },
    {
      title: "Prefix ใบเสร็จ",
      dataIndex: "receipt_prefix",
      key: "receipt_prefix",
      align: "right",
    },
    {
      title: "ส่วนลด (%)",
      dataIndex: "discount_rate",
      key: "discount_rate",
      align: "right",
    },
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
      render: (_: any, record: any) => (
        <Space size={16}>
          {" "}
          <Tooltip title="ดูรายละเอียด">
            {" "}
            <button
              onClick={() => handleOpenModal("view", record)}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              {" "}
              <LuEye />{" "}
            </button>{" "}
          </Tooltip>{" "}
          <Tooltip title="แก้ไข">
            {" "}
            <button
              onClick={() => handleOpenModal("edit", record)}
              className="text-[#52c41a] hover:text-green-400 transition cursor-pointer"
            >
              {" "}
              <HiOutlinePencil />{" "}
            </button>{" "}
          </Tooltip>{" "}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Search + Add Button */}
      <div className="flex justify-between items-center mb-4">
        {/* <Button
          type="primary"
          onClick={() => handleOpenModal("create")}
          style={{
            height: "40px",
            borderRadius: 5,
          }}
          className="!bg-[#74BA3D] !border-[#74BA3D] lg:w-48 rounded-md font-medium"
        >
          <div className="">
            <PlusOutlined />
            <span className="ml-2">เพิ่มอัตราค่าบริการ</span>
          </div>
        </Button> */}
      </div>

      <div className="mb-2 font-bold">รายการอัตราค่าบริการ</div>

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
      <ProjectFormModal
        open={modalOpen}
        mode={modalMode}
        // data={selectedRecord}
        data={settingData}
        onCancel={handleCancelForm}
        onSubmit={handleSubmit}
        existingProjects={tableData}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={handleCancelExit} // ปิดเฉพาะ confirm
        onConfirm={handleConfirmExit} // ปิดทั้ง confirm + form
      />

      {/* ✅ Success Modal */}
      <ProjectSuccessModal
        open={showSuccess}
        mode={modalMode}
        onClose={() => setShowSuccess(false)}
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
