import {
  Button,
  Input,
  Pagination,
  Space,
  Table,
  Tooltip,
  Select,
  Modal,
  Spin,
  notification,
  DatePicker,
} from "antd";
import { useState, useMemo, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlineInbox } from "react-icons/hi2";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import SearchBar from "./SearchBar";
import { useMe } from "../../hooks/useMe";
import { NoticeTemplateAPIs } from "../../networks/notice_template.api";
import { CollectionAPIs } from "../../networks/collections.api";
import { LuEye } from "react-icons/lu";
import { AiOutlineDownload } from "react-icons/ai";
import { ResidentsAPIs } from "../../networks/resident.api";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { OptionsAPIs } from "../../networks/option.api";
import { MdOutlineLocalPrintshop } from "react-icons/md";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function CollectionNoticeContent() {
  const { data: me } = useMe();
  const [searchText, setSearchText] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [transactionFilter, setTransactionFilter] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [collectionNotice, setCollectionNotice] = useState<any>();
  const [resident, setResident] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();
  const pageSize = 10;

  const [houseNoOptionData, setHouseNoOptionData] = useState<any[]>([]);

  const [draftFilters, setDraftFilters] = useState<{
    house_no?: string;
    status?: string;
    year?: number;
    month?: number;
  }>({});

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const rowSelection = {
    selectedRowKeys: selectedRowIds,
    onChange: (keys: React.Key[]) => {
      setSelectedRowIds(keys as number[]);
    },
  };

  const [filters, setFilters] = useState<{
    house_no?: string;
    status?: string;
  }>({});

  const [printLoading, setPrintLoading] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState<number | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [pdfErrorModal, setPdfErrorModal] = useState(false);
  const [pdfErrorMessage, setPdfErrorMessage] = useState("");

  const fetchData = async (
    page = 1,
    filters: {
      house_no?: string;
      status?: string;
      year?: number;
      month?: number;
    } = {}
  ) => {
    try {
      const projectId = me?.project_id;
      if (!projectId) return;

      const response = await CollectionAPIs.getAll(projectId, {
        page,
        limit: pageSize,

        resident_id: filters.house_no,
        status: filters.status,
        year: filters.year,
        month: filters.month,

        order_field: sorter.field,
        order_type: sorter.order,
      });

      setCollectionNotice(response?.data?.body || []);
      setPageInfo(response?.data?.page_information);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const fetchHouseNoOption = async () => {
    if (!me?.project_id) return;
    const res = await OptionsAPIs.getHouseNumberByProject(me.project_id);
    setHouseNoOptionData(res?.data ?? []);
  };

  const onPrint = async () => {
    if (selectedRowIds.length === 0) return;

    try {
      setCreateLoading(true);

      const res = await CollectionAPIs.createMultiPdf({
        collection_ids: selectedRowIds,
      });
      const blob = new Blob([res.data]);

      // เช็กว่า backend ส่ง error JSON มาหรือไม่
      const text = await blob.text();
      if (text.startsWith("{") && text.includes("message")) {
        const json = JSON.parse(text);
        notification.error({
          message: "ไม่สามารถพิมพ์เอกสารได้",
          description: json.message,
        });
        return;
      }

      // เป็น PDF จริง
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ใบทวงถาม_${dayjs().format("YYYYMMDD_HHmm")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      notification.error({
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบทวงถามได้",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, appliedFilters);
  }, [currentPage, appliedFilters, sorter, me?.project_id]);

  useEffect(() => {
    if (!me?.project_id) return;
    fetchHouseNoOption();
  }, [me?.project_id]);

  const houseOptions = useMemo(() => {
    return (houseNoOptionData ?? [])
      .slice()
      .sort((a: any, b: any) => Number(a.value) - Number(b.value))
      .map((h: any) => ({
        label: h.label,
        value: h.value,
      }));
  }, [houseNoOptionData]);

  // ✅ filter logic
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchName = item.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchProject = projectFilter
        ? item.project === projectFilter
        : true;
      const matchTransaction = transactionFilter
        ? item.transaction === transactionFilter
        : true;

      // แปลง string date จาก mock -> dayjs object
      const itemDate = dayjs(item.date, "DD/MM/YYYY HH:mm:ss");

      const matchDate =
        dateRange && dateRange[0] && dateRange[1]
          ? itemDate.isSameOrAfter(dateRange[0], "day") &&
            itemDate.isSameOrBefore(dateRange[1], "day")
          : true;

      return matchName && matchProject && matchTransaction && matchDate;
    });
  }, [searchText, projectFilter, transactionFilter, dateRange, tableData]);

  // ✅ pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

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
      title: "บ้านเลขที่",
      key: "resident_id",
      render: (_: any, record: any) => record?.resident?.house_no || "",
      sorter: true,
    },
    {
      title: "ชื่อ-นามสกุล",
      key: "full_name",
      render: (_: any, record: any) => record?.resident?.full_name || "",
    },

    {
      title: "ค่าดำเนินการทวงถาม (บาท)",
      dataIndex: "fee_amount",
      key: "fee_amount",
      align: "right",
      sorter: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "เดือน",
      dataIndex: "month",
      key: "month",
      width: 80,
      sorter: true,

      render: (value: number) => {
        const months = [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
          "ก.ย.",
          "ต.ค.",
          "พ.ย.",
          "ธ.ค.",
        ];
        return months[value - 1] || "-";
      },
    },
    {
      title: "ปี",
      width: 80,
      dataIndex: "year",
      key: "year",
      sorter: true,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      sorter: true,

      render: (_: any, record: any) => {
        if (_ == "PENDING")
          return <div className="text-[#EB6142]">ยังไม่ชำระ</div>;
        if (_ == "PAID")
          return <div className="text-[#74BA3D]">ชำระเงินแล้ว</div>;
      },
    },
    {
      title: " ",
      dataIndex: " ",
      key: " ",
      width: 120,
      render: (_: any, record: any) => (
        <Space size={16}>
          <Tooltip title="ดูรายละเอียด">
            <button
              onClick={async () => {
                try {
                  setPdfLoading(record.id);
                  console.log(record);

                  const res = await CollectionAPIs.createPdf(record?.id);

                  const blob = new Blob([res.data]);

                  // ลองอ่าน blob text ว่าเป็น error JSON ไหม
                  const text = await blob.text();
                  if (text.startsWith("{") && text.includes("message")) {
                    const json = JSON.parse(text);
                    setPdfErrorMessage(
                      json.message || "เกิดข้อผิดพลาดในการโหลดเอกสาร"
                    );
                    setPdfErrorModal(true);
                    return;
                  }

                  // ถ้าไม่ใช่ JSON ก็ถือว่าเป็น PDF
                  const url = URL.createObjectURL(blob);
                  setPdfUrl(url);
                  setPdfModalOpen(true);
                } catch (err: any) {
                  setPdfErrorMessage("ไม่พบข้อมูลสำหรับสร้างใบทวงถาม");
                  setPdfErrorModal(true);
                } finally {
                  setPdfLoading(null);
                }
              }}
              disabled={pdfLoading === record.id}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              {pdfLoading === record.id ? <Spin size="small" /> : <LuEye />}
            </button>
          </Tooltip>
          <Tooltip title="ดาวน์โหลด">
            <button
              onClick={async () => {
                try {
                  setDownloadLoading(record.id);

                  const res = await CollectionAPIs.createPdf(record?.id);
                  const blob = new Blob([res.data]);

                  const text = await blob.text();
                  if (text.startsWith("{") && text.includes("message")) {
                    const json = JSON.parse(text);
                    setPdfErrorMessage(
                      json.message || "ดาวน์โหลดเอกสารไม่สำเร็จ"
                    );
                    setPdfErrorModal(true);
                    return;
                  }

                  // PDF จริง
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ใบทวงถาม ${
                    record?.resident?.full_name
                  } ${String(record?.month).padStart(2, "0")}-${
                    record?.year
                  }.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  setPdfErrorMessage(
                    "ไม่สามารถดาวน์โหลดเอกสารได้\nเนี่องจากไม่พบข้อมูลสำหรับสร้างใบทวงถาม"
                  );
                  setPdfErrorModal(true);
                } finally {
                  setDownloadLoading(null);
                }
              }}
              disabled={downloadLoading === record.id}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              {downloadLoading === record.id ? (
                <Spin size="small" />
              ) : (
                <AiOutlineDownload />
              )}
            </button>
          </Tooltip>
          <Tooltip title="พิมพ์ใบทวงถาม">
            <button
              onClick={async () => {
                try {
                  setPrintLoading(record.id);

                  const res = await CollectionAPIs.createPdf(record?.id);

                  const blob = new Blob([res.data], {
                    type: "application/pdf",
                  });

                  const url = window.URL.createObjectURL(blob);

                  window.open(url, "_blank", "noopener,noreferrer");

                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                  }, 60_000);
                } catch (err) {
                  console.error("PDF print error:", err);
                } finally {
                  setPrintLoading(null);
                }
              }}
              disabled={printLoading === record.id}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              {printLoading === record.id ? (
                <Spin size="small" />
              ) : (
                <MdOutlineLocalPrintshop />
              )}
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Filter Bar */}
      <SearchBar
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        onSearch={() => {
          setCurrentPage(1);
          setAppliedFilters(draftFilters);
        }}
        onReset={() => {
          setDraftFilters({});
          setAppliedFilters({});
          setCurrentPage(1);
        }}
        selectedIds={selectedRowIds}
        onPrint={onPrint}
        houseOptions={houseOptions}
      />

      <Table
        columns={columns}
        dataSource={collectionNotice}
        rowSelection={rowSelection}
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
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Pagination
          current={currentPage}
          total={pageInfo?.total || 0}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal
        open={pdfModalOpen}
        closable={false}
        onCancel={() => {
          setPdfModalOpen(false);
          setPdfUrl(null);
        }}
        // width={900}
        width="100%"
        style={{ maxWidth: "900px" }}
        bodyStyle={{ padding: 0, background: "#fff" }}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "8px 0",
            }}
          >
            <Button
              style={{
                borderRadius: 20,
                width: 120,
                height: 40,
                borderColor: "#E6E6E6",
                color: "#666",
                background: "#fff",
                fontWeight: 600,
              }}
              onClick={() => {
                setPdfModalOpen(false);
                setPdfUrl(null);
              }}
            >
              ย้อนกลับ
            </Button>
          </div>
        }
      >
        {/* <div style={{ width: 900, margin: "0 auto", background: "#fff" }}>
                {pdfUrl && (
                  <embed
                    src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type="application/pdf"
                    style={{
                      width: 900,
                      height: "65vh",
                      display: "block",
                      background: "#fff",
                    }}
                  />
                )}
              </div> */}

        {/* <PdfDocumentWrapper pdfUrl={pdfUrl} /> */}

        <div
          style={{
            height: "70vh",
            background: "#fff",
            // display: "flex",
            overflow: "auto",
          }}
        >
          {pdfUrl && (
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} defaultScale={1.48} />
            </Worker>
          )}
        </div>
      </Modal>

      <Modal
        open={pdfErrorModal}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setPdfErrorModal(false)}
          >
            ตกลง
          </Button>,
        ]}
        onCancel={() => setPdfErrorModal(false)}
        closable={false}
      >
        <p style={{ fontSize: 16 }}>{pdfErrorMessage}</p>
      </Modal>

      <style jsx global>{`
        .rpv-core__viewer {
          box-shadow: none !important;
        }

        .rpv-core__inner {
          background: #fff !important;
        }

        .rpv-core__page-layer {
          background-color: #fff !important;
        }

        .rpv-core__canvas-layer {
          background: #fff !important;
        }

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
        .custom-rounded-select .ant-select-selector {
          border-radius: 20px !important;
          height: 38px !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
        }

        .custom-rounded-select .ant-select-selection-item,
        .custom-rounded-select .ant-select-selection-placeholder {
          line-height: 38px !important;
        }

        .custom-rounded-select.ant-select-focused .ant-select-selector {
          border-color: #87d2f7 !important;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
