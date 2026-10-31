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
} from "antd";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { HiOutlinePencil } from "react-icons/hi2";
import { HiOutlineInbox } from "react-icons/hi2";
import { AiFillFile } from "react-icons/ai";
import { LuClock } from "react-icons/lu";
import { AiOutlineDownload } from "react-icons/ai";
import { LuEye } from "react-icons/lu";
import PaymentCreateModal from "./invoice/PaymentCreateModal";
import PaymentInvoicePreviewModal from "./invoice/PaymentInvoicePreviewModal";
import ConfirmExitModal from "../ConfirmExitModal";
import PaymentSelectModal from "./invoice/PaymentSelectModal";
import PreSelectResidentModal from "./pre-invoice/PreSelectResidentModal";
import PreSelectMonthModal from "./pre-invoice/PreSelectMonthModal";
import PreInvalidMonthModal from "./pre-invoice/PreInvalidMonthModal";
import PreInvoiceSummaryModal from "./pre-invoice/PreInvoiceSummaryModal";
import PreInvoicePreviewModal from "./pre-invoice/PreInvoicePreviewModal";
import ConfirmModal from "./ConfirmModal";
import SuccessModal from "./SuccessModal";
import FollowUpEditModal from "./FollowUpEditModal";
import FollowUpHistoryModal from "./FollowUpHistoryModal";
import { PaymentAPIs } from "../../networks/payment.api";
import PaymentViewModal from "./PaymentViewModal";
import PdfDocumentWrapper from "../PdfdocumentWrapper";
import { message } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { OptionsAPIs } from "../../networks/option.api";
import moment from "moment";
import "moment/locale/th";
import { ThaiDatePicker } from "../../utils/ThaiDatePicker";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd
import ErrorModal from "./ErrorModal";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { useMe } from "../../hooks/useMe";

const { Option } = Select;

export default function PaymentContent() {
  const [searchPaymentNo, setSearchPaymentNo] = useState("");
  const [searchHouse, setSearchHouse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [followUpEditOpen, setFollowUpEditOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [serverSearch, setServerSearch] = useState("");

  const [draftFilters, setDraftFilters] = useState<{
    inv_no?: string;
    house_no?: string;
    month?: number;
    year?: number;
  }>({});

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [reminderSearch, setReminderSearch] = useState<string | undefined>();
  const reminderDebounceRef = useRef<any>(null);

  const [paymentData, setPaymentData] = useState<any>();
  const [reminder, setReminder] = useState<any>();
  const [houseNoOptionData, setHouseNoOptionData] = useState<any>();
  const [invoice, setInvoice] = useState<any>();
  const [projectData, setProjectData] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();
  const { data: me } = useMe();
  const [monthData, setMonthData] = useState<any>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSize = 10;

  const fetchData = useCallback(
    async (
      page = 1,
      filters: {
        inv_no?: string;
        house_no?: string;
        month?: number;
        year?: number;
      } = {}
    ) => {
      if (!me?.project_id) return;

      try {
        const res = await PaymentAPIs.getAllPaymentByProject(me.project_id, {
          page,
          limit: pageSize,
          advance: false,

          inv_no: filters.inv_no,
          resident_id: filters.house_no,
          month: filters.month,
          year: filters.year,

          order_field: sorter.field,
          order_type: sorter.order,
        });

        setPaymentData(res?.data?.body ?? []);
        setPageInfo(res?.data?.page_information ?? null);
      } catch (e) {
        console.error(e);
      }
    },
    [me?.project_id, sorter.field, sorter.order]
  );

  const fetchMonthRange = useCallback(async () => {
    if (!me?.project_id) return null;

    try {
      const res = await PaymentAPIs.getMonthRange(me.project_id);
      const period = res?.data?.body ?? null;
      setMonthData(period);
      return period;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400) {
        throw new Error(
          error?.response?.data?.message || "ไม่สามารถออกใบแจ้งหนี้ได้ในขณะนี้"
        );
      }

      throw error; // เคสอื่นปล่อยให้ caller จัดการ
    }
  }, [me?.project_id]);

  const fetchHouseNoOption = useCallback(async () => {
    if (!me?.project_id) return;

    try {
      const res = await OptionsAPIs?.getHouseNumberByProject(me?.project_id);
      setHouseNoOptionData(res?.data);
    } catch (error) {}
  }, [me?.project_id]);

  useEffect(() => {
    if (!me?.project_id) return;

    fetchData(1, {});
    fetchHouseNoOption();
  }, [me?.project_id, fetchData, fetchHouseNoOption]);

  const fetchReminder = useCallback(
    async (full_name?: string) => {
      if (!me?.project_id) return;

      const res = await PaymentAPIs.getReminder(me.project_id, {
        page: 1,
        limit: 99999,
        full_name: full_name || undefined,
      });

      setReminder(res?.data?.body ?? []);
    },
    [me?.project_id]
  );

  const fetchInvoice = useCallback(async (resident_ids?: any) => {
    const resInvoice = await PaymentAPIs.getPaymentInvoice(
      me?.project_id,
      {
        resident_ids: resident_ids,
      },
      { limit: 999999 }
    );
    setInvoice(resInvoice?.data?.body ?? []);
  }, [me?.project_id]);

  const debounceRef = useRef<any>(null);

  const onReminderSearchChange = (value: string) => {
    const val = value.trim();

    if (reminderDebounceRef.current) {
      clearTimeout(reminderDebounceRef.current);
    }

    reminderDebounceRef.current = setTimeout(() => {
      setReminderSearch(val || undefined);
    }, 300);
  };

  useEffect(() => {
    fetchData(currentPage, appliedFilters);
  }, [currentPage, appliedFilters, sorter, fetchData]);

  useEffect(() => {
    fetchReminder(reminderSearch);
  }, [reminderSearch, fetchReminder]);

  const [tableData, setTableData] = useState<any[]>([]);

  // ✅ state modal
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [followUpHistoryOpen, setFollowUpHistoryOpen] = useState(false);
  const [paymentViewOpen, setPaymentViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  //   invoice step
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] = useState<any[]>([]);

  //   pre-invoice step
  const [preStep, setPreStep] = useState<0 | 1 | 2 | 2.5 | 3 | 4 | 5 | 6>(0);
  // const [paidResident, setPaidResident] = useState();
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const [pdfLoading, setPdfLoading] = useState<number | null>(null);
  const [printLoading, setPrintLoading] = useState<number | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [invoiceResult, setInvoiceResult] = useState<any>(null);

  useEffect(() => {
    if (step === 1) {
      fetchReminder();
    }
  }, [step]);

  const resetPreInvoiceFlow = () => {
    setPreStep(0);
    setSelectedResident(null);
    setSelectedMonths([]);
  };

  const houseOptions = useMemo(() => {
    return (houseNoOptionData ?? [])
      .slice() // กัน side effect เผื่อ data มาจาก state ตรง ๆ
      .sort((a: any, b: any) => Number(a.value) - Number(b.value))
      .map((h: any) => ({
        label: h.label,
        value: h.value,
      }));
  }, [houseNoOptionData]);

  const currentYear = moment().year();

  const [year, setYear] = useState<any>(null);
  const [dateRange, setDateRange] = useState<any>([
    moment(`${currentYear}-01-01`),
    moment(`${currentYear}-12-31`),
  ]);

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
      title: "เลขที่ใบแจ้งหนี้",
      dataIndex: "inv_no",
      key: "inv_no",
      width: 200,
      sorter: true,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "resident_id",
      key: "resident_id",
      width: 120,
      render: (_: any, __: any) => __?.resident?.house_no,
      sorter: true,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "full_name",
      key: "full_name",
      render: (_: any, __: any) => __?.resident?.full_name,
    },
    {
      title: "ยอดที่ต้องชำระ (บาท)",
      dataIndex: "total_due",
      key: "total_due",
      align: "right",
      sorter: true,

      render: (_value: any, record: any) => {
        const totalDue = Number(record.total_due) || 0;
        // const collectionFee = Number(record.collection_fee) || 0;

        const finalAmount = totalDue;

        return finalAmount.toLocaleString("th-TH", {
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
      title: "",
      key: "actions",
      align: "center",
      width: 120,
      render: (_: any, record: any) => (
        <Space size={16}>
          {/* ไม่ใช้ */}
          {/* <Tooltip title="ดูประวัติการทวงถาม">
            <button
              onClick={() => {
                setSelectedRecord(record);
                setFollowUpHistoryOpen(true);
              }}
              className="text-[#1677ff] hover:text-blue-400 transition cursor-pointer"
            >
              <LuClock />
            </button>
          </Tooltip> */}
          <Tooltip title="ดูรายละเอียด">
            <button
              onClick={async () => {
                try {
                  setPdfLoading(record.id);
                  const res = await PaymentAPIs.createPaymentPdf(
                    me?.project_id,
                    record?.id,
                    {}
                  );

                  const blob = new Blob([res.data], {
                    type: "application/pdf",
                  });
                  const url = window.URL.createObjectURL(blob);

                  setPdfUrl(url);
                  setPdfModalOpen(true);
                } catch (err) {
                  console.error("PDF view error:", err);
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

          {/* <Tooltip title="แก้ไขการทวงถาม">
            <button
              onClick={() => {
                setSelectedRecord(record);
                setFollowUpEditOpen(true);
              }}
              className="text-[#52c41a] hover:text-green-400 transition cursor-pointer"
            >
              <HiOutlinePencil />
            </button>
          </Tooltip> */}
          <Tooltip title="ดาวน์โหลด">
            <button
              onClick={async () => {
                try {
                  setDownloadLoading(record.id);

                  const res = await PaymentAPIs.createPaymentPdf(
                    me?.project_id,
                    record?.id,
                    {}
                  );

                  const blob = new Blob([res.data], {
                    type: "application/pdf",
                  });
                  const url = window.URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ใบแจ้งหนี้ ${
                    record?.resident?.full_name
                  } ${String(record?.month).padStart(2, "0")}-${
                    record?.year
                  }.pdf`;
                  a.click();

                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("PDF download error:", err);
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
          <Tooltip title="พิมพ์ใบแจ้งหนี้">
            <button
              onClick={async () => {
                try {
                  setPrintLoading(record.id);

                  const res = await PaymentAPIs.createPaymentPdf(
                    me?.project_id,
                    record?.id,
                    {}
                  );

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
      {/* 🔍 Search + Add Button */}
      <div className="flex justify-end items-center mb-4 gap-3">
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={async () => {
              try {
                setModalMode("create");
                setSelectedRecord(null);

                const period = await fetchMonthRange();

                if (period?.isSupplement) {
                  setSelectedForInvoice([]);
                  await fetchInvoice([]);
                  setStep(2);
                  return;
                }

                setStep(1);
              } catch (err: any) {
                setErrorMessage(err.message);
                setErrorModalOpen(true);
              }
            }}
            icon={<AiFillFile size={16} style={{ marginRight: 8 }} />}
            style={{
              height: 42,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#74BA3D",
              borderColor: "#74BA3D",
              padding: "0 20px",
            }}
            className="hover:bg-[#6CAF37]! transition-all duration-150 font-medium"
          >
            ออกใบแจ้งหนี้
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center mb-4 gap-3">
        <div className="flex gap-3">
          <Select
            allowClear
            showSearch
            placeholder="เลือกบ้านเลขที่"
            optionFilterProp="label"
            value={draftFilters.house_no}
            options={houseOptions}
            onChange={(val) =>
              setDraftFilters((prev) => ({
                ...prev,
                house_no: val || undefined,
              }))
            }
            style={{ width: 500, height: 38 }}
            className="custom-rounded-select"
          />

          <Input
            placeholder="ค้นหาเลขที่ใบแจ้งหนี้"
            prefix={<SearchOutlined />}
            allowClear
            value={draftFilters.inv_no || ""}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                inv_no: e.target.value || undefined,
              }))
            }
            style={{ width: 500, height: 38, borderRadius: 20 }}
          />
        </div>
      </div>
      <div className="flex justify-center items-center mb-4 gap-3">
        <div className="flex gap-3">
          <ThaiDatePicker
            picker="year"
            locale={th_TH}
            value={
              draftFilters.year ? moment().year(draftFilters.year - 543) : null
            }
            onChange={(v) =>
              setDraftFilters((prev) => ({
                ...prev,
                year: v ? v.year() + 543 : undefined,
              }))
            }
            format={(v) => (v ? String(v.year() + 543) : "")}
            style={{ width: 500, height: 38, borderRadius: 20 }}
          />
          <Select
            placeholder="เลือกเดือน"
            allowClear
            value={draftFilters.month}
            onChange={(val) =>
              setDraftFilters((prev) => ({
                ...prev,
                month: val ? Number(val) : undefined,
              }))
            }
            style={{ width: 500, height: 38 }}
            className="custom-rounded-select"
          >
            {months.map((m, idx) => (
              <Option key={idx + 1} value={idx + 1}>
                {m}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex justify-center items-center mb-6 gap-3">
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={() => {
              setDraftFilters({});
              setAppliedFilters({});
              setCurrentPage(1);
            }}
            style={{
              width: 150,
              height: 38,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              borderColor: "#D9D9D9",
              padding: "0 20px",
              color: "#4D4C4C",
              fontWeight: 700,
            }}
            className="transition-all duration-150 font-bold"
          >
            ล้างข้อมูล
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setCurrentPage(1);
              setAppliedFilters(draftFilters);
            }}
            style={{
              width: 150,
              height: 38,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#87D2F7",
              borderColor: "#87D2F7",
              padding: "0 20px",
              fontWeight: 700,
            }}
            className="bg-[#87D2F7] transition-all duration-150 font-bold"
          >
            ค้นหา
          </Button>
        </div>
      </div>

      {/* 📋 Table */}
      <Table
        className="custom-table"
        columns={columns}
        dataSource={paymentData}
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

      {/* 🔄 Payment Flow */}
      <PaymentSelectModal
        open={step === 1}
        data={reminder}
        searchValue={reminderSearch}
        onSearchChange={onReminderSearchChange}
        onCancel={() => setStep(0)}
        onNext={(rows: any[]) => {
          const residentIds = rows.map((r) => r.resident_id);
          fetchInvoice(residentIds);
          setSelectedForInvoice(rows);
          setStep(2);
        }}
      />

      {/* <PaymentCreateModal
        open={step === 2}
        // allData={tableData} // ✅ ข้อมูลทั้งหมด
        allData={invoice} // ✅ ข้อมูลทั้งหมด
        selectedItems={selectedForInvoice} // ✅ เฉพาะที่เลือกใน step 1
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
      /> */}

      <PaymentCreateModal
        open={step === 2}
        allData={invoice}
        month={monthData}
        selectedItems={selectedForInvoice}
        loading={createLoading}
        onBack={() => setStep(1)}
        onNext={async () => {
          try {
            setCreateLoading(true);

            // const monthRes = await PaymentAPIs.getMonthRange(me?.project_id);

            // const res = await PaymentAPIs.downloadPdf(me?.project_id, {});
            // const res = await PaymentAPIs.downloadPdf(me?.project_id, {
            //   resident_ids: selectedForInvoice.map((x: any) => x.resident_id),
            //   year: 2568,
            //   month: monthRes.data.body?.month || 10,
            // });
            // const blob = new Blob([res.data], { type: "application/pdf" });
            // const url = URL.createObjectURL(blob);

            // setPdfUrl(url);
            setStep(3);
          } catch (err) {
            console.error(err);
          } finally {
            setCreateLoading(false);
          }
        }}
      />

      {/* {step === 3 && (
        <PaymentInvoicePreviewModal
          open
          //   invoices={selectedForInvoice}
          invoices={tableData}
          pdfUrl={pdfUrl}
          onBack={() => setStep(2)}
          onConfirm={() => setStep(4)}
        />
      )} */}

      {step === 3 && (
        <ConfirmModal
          open
          onBack={() => setStep(2)}
          onConfirm={async () => {
            const now = new Date();
            const buddhistYear = now.getFullYear() + 543;
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const formattedDate = `${buddhistYear}${month}${day}`;

            try {
              const resPayment = await PaymentAPIs.createInvoice(
                me?.project_id,
                {
                  resident_ids: selectedForInvoice.map((x) => x.resident_id),
                }
              );

              const { month, year, payment_ids } = resPayment?.data?.body || {};

              if (!month || !year) {
                throw new Error(
                  "ระบบไม่สามารถดึงค่า month/year จาก createInvoice ได้"
                );
              }

              const res = await PaymentAPIs.downloadPdf(me?.project_id, {
                month,
                year,
                ...(Array.isArray(payment_ids) && payment_ids.length
                  ? { payment_ids }
                  : {}),
              });

              const blob = new Blob([res.data], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              setPdfUrl(url);

              setStep(4);
              fetchData();
            } catch (error: any) {
              console.error(error);
              throw new Error(
                error?.response?.data?.message ||
                  "มีข้อมูลใบแจ้งหนี้ในเดือนและปีที่ระบุแล้ว"
              );
            }
          }}
        />
      )}

      {/* {step === 5 && <SuccessModal open onClose={() => setStep(0)} />} */}
      {step === 4 && (
        <SuccessModal
          open={step === 4}
          pdfUrl={pdfUrl}
          onClose={() => {
            setStep(0);
            fetchData();
          }}
        />
      )}

      {exitOpen && (
        <ConfirmExitModal
          open
          onConfirm={() => {
            setExitOpen(false);
            setStep(0);
            fetchData();
          }}
          onCancel={() => setExitOpen(false)}
        />
      )}

      <FollowUpEditModal
        open={followUpEditOpen}
        record={selectedRecord}
        onBack={() => setFollowUpEditOpen(false)}
        onSave={(newStatus: boolean) => {
          setTableData((prev) =>
            prev.map((item) =>
              item.id === selectedRecord.id
                ? { ...item, followUpStatus: newStatus }
                : item
            )
          );
          setFollowUpEditOpen(false);
        }}
      />

      <FollowUpHistoryModal
        open={followUpHistoryOpen}
        record={selectedRecord}
        onBack={() => setFollowUpHistoryOpen(false)}
      />

      <PaymentViewModal
        open={paymentViewOpen}
        record={selectedRecord}
        onBack={() => setPaymentViewOpen(false)}
      />

      <ErrorModal
        open={errorModalOpen}
        message={errorMessage}
        onBack={() => {
          setErrorModalOpen(false);
          setErrorMessage(null);
        }}
      />

      {/* view invoice payment detail */}

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
          height: 38px !important; /* ✅ ให้เท่ากับ input */
          padding: 0 12px !important;
          display: flex;
          align-items: center;
        }

        .custom-rounded-select .ant-select-selection-item,
        .custom-rounded-select .ant-select-selection-placeholder {
          line-height: 38px !important; /* ✅ ทำให้ text อยู่ตรงกลาง */
        }

        .custom-rounded-select.ant-select-focused .ant-select-selector {
          border-color: #87d2f7 !important;
          box-shadow: 0 0 0 2px rgba(135, 210, 247, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
