import { Button, Input, Pagination, Space, Table, Tooltip } from "antd";
import { useState, useMemo, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { HiOutlinePencil, HiOutlineInbox } from "react-icons/hi2";
import { LuEye } from "react-icons/lu";
import CollectionNoticeFormModal from "./CollectionNoticeFormModal";
import CollectionNoticeSuccessModal from "./CollectionNoticeSuccessModal";
import ConfirmExitModal from "../../ConfirmExitModal";
import { NoticeTemplateAPIs } from "../../../networks/notice_template.api";
import { useMe } from "../../../hooks/useMe";
import { ProjectAPIs } from "../../../networks/project.api";

export default function CollectionNoticeContent() {
  const { data: me } = useMe();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const pageSize = 10;

  const [noticeTemplate, setNoticeTemplate] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();

  const fetchData = async () => {
    try {
      const response = await NoticeTemplateAPIs.getAll({
        page: currentPage,
        limit: 999,
      });

      const pageInfo = response?.data?.page_information;

      setNoticeTemplate(response?.data?.body);
      setPageInfo(pageInfo);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, me?.project_id]);

  const handleOpenModal = (mode: "create" | "edit" | "view", record?: any) => {
    setModalMode(mode);
    setSelectedRecord(record || null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (modalMode === "create") {
      const payload = {
        active: values?.active,
        created_by: me?.id,
        updated_by: me?.id,
        topic_name: values?.topic_name,
        project_id: values?.project_id,
        introduction_detail: values?.introduction_detail,
        additional_detail: values?.additional_detail,
        closure_text: values?.closure_text,
        closing_word: values?.closing_word,
        remark: values?.remark,
      };

      await NoticeTemplateAPIs.create(payload);

      // setTableData([...tableData, newItem]);
      fetchData();
      setModalOpen(false);
      setShowSuccess(true);
    } else if (modalMode === "edit" && selectedRecord) {
      const payload = {
        active: values?.active,
        created_by: me?.id,
        updated_by: me?.id,
        topic_name: values?.topic_name,
        project_id: values?.project_id,
        introduction_detail: values?.introduction_detail,
        additional_detail: values?.additional_detail,
        closure_text: values?.closure_text,
        closing_word: values?.closing_word,
        remark: values?.remark,
      };

      await NoticeTemplateAPIs.update(selectedRecord?.id, payload);

      fetchData();
      setModalOpen(false);
      setShowSuccess(true);
    }
  };

  const handleCancelForm = () => {
    if (modalMode === "create" || modalMode === "edit") {
      setShowConfirmExit(true);
    } else {
      setModalOpen(false);
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    setModalOpen(false);
  };

  const handleCancelExit = () => {
    setShowConfirmExit(false);
  };

  // ✅ Columns ใหม่
  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "รหัสใบทวงถาม",
      dataIndex: "id",
      key: "id",
      width: 160,
    },
    {
      title: "โครงการ",
      dataIndex: "project.name",
      key: "project.name",
      render: (_: any, __: any) => __?.project?.name,
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
      {/* 🔍 Search bar */}
      <div className="flex justify-between items-center mb-4"></div>

      <div className="mb-2 font-bold">รายการเทมเพลตค่าทวงถาม</div>

      {/* 📋 Table */}
      <Table
        className="custom-table"
        columns={columns}
        // dataSource={noticeTemplate}
        dataSource={noticeTemplate?.filter(
          (item: any) => item.project_id === me?.project?.id
        )}
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

      {/* ✅ Pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Pagination
          current={currentPage}
          total={pageInfo?.total || 0}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* ✅ Modals */}
      <CollectionNoticeFormModal
        open={modalOpen}
        mode={modalMode}
        data={selectedRecord}
        onCancel={handleCancelForm}
        onSubmit={handleSubmit}
        existingProjects={tableData}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
      />

      <CollectionNoticeSuccessModal
        open={showSuccess}
        mode={modalMode}
        onClose={() => setShowSuccess(false)}
      />

      {/* ✅ Custom Pagination Style */}
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
      `}</style>
    </div>
  );
}
