import {
  Button,
  Input,
  message,
  Pagination,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useState, useMemo, useEffect, useRef } from "react";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { HiOutlinePencil } from "react-icons/hi2";
import ResidentFormModal from "./ResidentFormModal";
import { HiOutlineInbox } from "react-icons/hi2";
import ResidentSuccessModal from "./ResidentSuccessModal";
import { PlusOutlined } from "@ant-design/icons";
import { LuEye } from "react-icons/lu";
import ConfirmExitModal from "../ConfirmExitModal";
import { ResidentsAPIs } from "../../networks/resident.api";
import { useMe } from "../../hooks/useMe";

export default function ResidentContent() {
  const [searchText, setSearchText] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [tableData, setTableData] = useState<any[]>([]);

  // ✅ state modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const { data: me } = useMe();
  const [residentData, setResidentData] = useState<any>();
  const [resident, setResident] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>(null);

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const fetchData = async (page = 1, full_name = "") => {
    try {
      const projectId = me?.project_id;
      if (!projectId) return;

      const res = await ResidentsAPIs.getAllOneProject(projectId, {
        page,
        full_name: full_name || undefined,

        order_field: sorter.field,
        order_type: sorter.order,
      });
      setResidentData(res?.data?.body ?? []);
      setPageInfo(res?.data?.page_information ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  const getOne = async (id: any) => {
    try {
      const response = await ResidentsAPIs.getOne(id);
      const data = response?.data?.body;
      setResident(data);
      return data;
    } catch (err) {
      console.error("getOne error", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData(currentPage, serverSearch);
  }, [currentPage, serverSearch, sorter, me?.project_id]);

  const debounceRef = useRef<any>(null);

  const onSearchChange = (val: string) => {
    setSearchText(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1); // ✅ reset หน้า
      setServerSearch(val.trim()); // ✅ trigger fetch
    }, 300);
  };

  const handleOpenModal = async (
    mode: "create" | "edit" | "view",
    record?: any,
  ) => {
    setModalMode(mode);
    setSelectedRecord(record || null);

    if (mode !== "create" && record?.id) {
      try {
        const res = await getOne(record.id);
        setResident(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดข้อมูลโครงการได้");
        return;
      }
    }

    setModalOpen(true);
  };

  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "full_name",
      key: "full_name",
      sorter: true,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "house_no",
      key: "house_no",
      sorter: true,
    },
    {
      title: "เบอร์โทร",
      dataIndex: "phone",
      key: "phone",
      sorter: true,
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
      sorter: true,
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
              onClick={() => {
                handleOpenModal("view", record);
              }}
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

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        project_id: values?.project_id,
        house_no: values?.house_no || "",
        full_name: values?.full_name || "",
        ownership_ratio: values?.ownership_ratio || "",
        phone: values?.phone || "",
        email: values?.email || undefined,
        address: values?.address || "",
        created_by: Number(me?.id) || "",
        updated_by: Number(me?.id) || "",
      };

      const payloadEdit = {
        project_id: values?.project_id,
        house_no: values?.house_no || "",
        full_name: values?.full_name || "",
        ownership_ratio: values?.ownership_ratio || "",
        phone: values?.phone || "",
        email: values?.email || undefined,
        address: values?.address || "",
        updated_by: Number(me?.id) || "",
      };

      if (modalMode === "create") {
        await ResidentsAPIs.create(payload);
        message.success("เพิ่มลูกบ้านสำเร็จ");
      } else if (modalMode === "edit" && selectedRecord) {
        await ResidentsAPIs.update(selectedRecord.id, payloadEdit);
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

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Search + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="ค้นหาลูกบ้าน"
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            paddingLeft: "20px",
            borderRadius: "20px",
            height: "40px",
          }}
          className="w-80 rounded-full mr-4"
        />
        <Button
          type="primary"
          onClick={() => {
            handleOpenModal("create");
          }}
          style={{
            height: "40px",
            borderRadius: 5,
          }}
          className="!bg-[#74BA3D] !border-[#74BA3D] lg:w-36 rounded-md font-medium"
        >
          <div className="">
            <PlusOutlined />
            <span className="ml-2">เพิ่มลูกบ้าน</span>
          </div>
        </Button>
      </div>
      <ResidentFormModal
        open={modalOpen}
        mode={modalMode}
        data={resident}
        onCancel={(reason?: string) => {
          if (modalMode != "view") setShowConfirmExit(true);
          else setModalOpen(false);
        }}
        onSubmit={handleSubmit}
      />
      <ResidentSuccessModal
        open={showSuccess}
        mode={modalMode}
        onClose={() => setShowSuccess(false)}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={() => setShowConfirmExit(false)}
        onConfirm={() => {
          setShowConfirmExit(false);
          setModalOpen(false);
        }}
      />

      {/* 📋 Table */}
      <Table
        className="custom-table"
        columns={columns}
        dataSource={residentData}
        rowKey="id"
        pagination={false}
        bordered={false}
        onChange={(_, __, sorter: any) => {
          if (!sorter?.order) {
            setSorter({});
            setCurrentPage(1);
            return;
          }

          setSorter({
            field: sorter.field, // ← ต้องตรงกับ backend
            order: sorter.order === "ascend" ? "ASC" : "DESC",
          });

          setCurrentPage(1);
        }}
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
          itemRender={(page, type, originalElement) => {
            if (type === "prev") return <span>{"<"}</span>;
            if (type === "next") return <span>{">"}</span>;
            return originalElement;
          }}
        />
      </div>

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
      `}</style>
    </div>
  );
}
