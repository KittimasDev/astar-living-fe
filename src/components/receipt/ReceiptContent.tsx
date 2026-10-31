// ReceiptContent.tsx
import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
  message,
} from "antd";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiFillFile } from "react-icons/ai";
import { HiOutlineInbox } from "react-icons/hi2";
import { LuEye, LuFileX2 } from "react-icons/lu";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { AiOutlineDownload } from "react-icons/ai";
import { useMe } from "../../hooks/useMe";
import { OptionsAPIs } from "../../networks/option.api";
import { PaymentAPIs } from "../../networks/payment.api";
import { ReceiptAPIs } from "../../networks/receipt.api";
import ConfirmExitModal from "../ConfirmExitModal";
import CancelModal from "./cancel-receipt/CancelModal";
import ConfirmCancelModal from "./cancel-receipt/ConfirmCancelModal";
import SuccessCancelModal from "./cancel-receipt/SuccessCancelModal";
import PaymentMethodModal from "./PaymentMethodModal";
import PreInvalidMonthModal from "./pre-receipt/PreInvalidMonthModal";
import PreReceiptSummaryModal, {
  PreReceiptFormValues,
} from "./pre-receipt/PreReceiptSummaryModal";
import PreSelectMonthModal from "./pre-receipt/PreSelectMonthModal";
import PreSelectResidentModal from "./pre-receipt/PreSelectResidentModal";

import SelectInvoiceModal from "./SelectInvoiceModal";
import SelectResidentModal from "./SelectResidentModal";
import SuccessModal from "./SuccessModal";
import ViewReceiptModal from "./ViewReceiptModal";
import { ReceiptStatusTag } from "./ReceiptStatusTag";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import OtherReceiptFormModal from "./OtherReceiptFormModal";
import OtherReceiptSummaryModal from "./OtherReceiptSummaryModal";
import { ReceiptModeToggle } from "./ReceiptModeToggle";
import { ResidentsAPIs } from "../../networks/resident.api";
const { Option } = Select;

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const MONTH_LABELS = [
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

export default function ReceiptContent() {
  const [searchReceiptNo, setSearchReceiptNo] = useState("");
  const [searchHouse, setSearchHouse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [draftFilters, setDraftFilters] = useState<{
    receipt_no?: string;
    house_no?: string;
    month?: number;
    year?: number;
    issue_start_date?: string;
    issue_end_date?: string;
    active?: boolean;
  }>({});

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [houseNoOptionData, setHouseNoOptionData] = useState<any>();

  const [tableData, setTableData] = useState<any[]>([]);

  // ✅ state modal เดิม (ออกใบเสร็จจาก invoice)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [search, setSearch] = useState<{
    receipt_no?: string;
    house_no?: string;
  }>({});

  const [residentSearch, setResidentSearch] = useState<string | undefined>();
  const residentSearchRef = useRef<any>(null);

  type ReceiptMode = "common" | "other";

  const [receiptMode, setReceiptMode] = useState<ReceiptMode>("common");
  const [step, setStep] = useState<0 | 1 | 2 | 2.5 | 3 | 3.5 | 5 | null>(null);

  const [receiptType, setReceiptType] = useState<"common" | "other" | null>(
    null,
  );
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [otherPayload, setOtherPayload] = useState<any>(null);
  const [flowId, setFlowId] = useState(0);
  // const [step, setStep] = useState<0 | 1 | 2 | 2.5 | 3 | 3.5 | 4 | 5>(0);
  // const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [preSelectedYear, setPreSelectedYear] = useState<number | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [receiptPreview, setReceiptPreview] = useState<any>(null); // ✅ เพิ่มตรงนี้
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const [exitMainFlowOpen, setExitMainFlowOpen] = useState(false);
  const [exitPreFlowOpen, setExitPreFlowOpen] = useState(false);

  const [pdfLoading, setPdfLoading] = useState<number | null>(null);
  const [printLoading, setPrintLoading] = useState<number | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [successCancelOpen, setSuccessCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRecord, setCancelRecord] = useState<any>(null);

  // ✅ pre-payment flow state (ชำระล่วงหน้า)
  const [preStep, setPreStep] = useState<0 | 1 | 2 | 2.5 | 3 | 4 | 5 | 6>(0);
  const [preSelectedResident, setPreSelectedResident] = useState<any | null>(
    null,
  );
  const [paidMonth, setPaidMonth] = useState<any>();
  const [minYear, setMinYear] = useState<any>();
  const [preSelectedMonths, setPreSelectedMonths] = useState<number[]>([]);
  const [prePreview, setPrePreview] = useState<any | null>(null);
  const [preInvalidOpen, setPreInvalidOpen] = useState(false);
  const [preSuccessOpen, setPreSuccessOpen] = useState(false);
  const [invoice, setInvoice] = useState<any>();
  const [invoiceResult, setInvoiceResult] = useState<any>();

  const { data: me } = useMe();
  const [receiptData, setReceiptData] = useState<any>();
  const [transactionData, setTransactionData] = useState<any>();
  const [paidResident, setPaidResident] = useState();
  const [notPayResident, setNotPayResident] = useState();
  const [pageInfo, setPageInfo] = useState<any>();
  const [receiptPageInfo, setReceiptPageInfo] = useState<any>(null);
  const [transactionPageInfo, setTransactionPageInfo] = useState<any>(null);

  const [isAdvancePayment, setIsAdvancePayment] = useState(false);

  const { RangePicker: DateRangePicker } = DatePicker; // สำหรับ date

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const fetchData = async (
    page = 1,
    filters: {
      receipt_no?: string;
      house_no?: string;
      issue_start_date?: any;
      issue_end_date?: any;
      active?: any;
    } = {},
  ) => {
    try {
      const projectId = me?.project_id;
      if (!projectId) return;

      // ----- RECEIPT -----
      const receiptRes = await ReceiptAPIs.getAllReceiptsByProject(projectId, {
        page,
        receipt_no: filters.receipt_no,
        resident_id: filters.house_no,
        issue_start_date: filters.issue_start_date,
        issue_end_date: filters.issue_end_date,
        order_field: sorter.field,
        order_type: sorter.order,
        active: filters.active,
      });

      setReceiptData(receiptRes?.data?.body ?? []);
      setReceiptPageInfo(receiptRes?.data?.page_information ?? null);

      // ----- TRANSACTION -----
      const trxRes = await ReceiptAPIs.getAllTransactions(projectId, {
        page,
        receipt_no: filters.receipt_no,
        resident_id: filters.house_no,
        house_no: filters.house_no,
        issue_start_date: filters.issue_start_date,
        issue_end_date: filters.issue_end_date,
        order_field: sorter.field,
        order_type: sorter.order,
        active: filters.active,
      });

      setTransactionData(trxRes?.data?.body ?? []);
      setTransactionPageInfo(trxRes?.data?.page_information ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPaidResident = async (full_name?: string) => {
    if (!me?.project_id) return;

    // แสดงลูกบ้านที่จ่ายแล้ว
    // const res = await PaymentAPIs.getPaidResident(me.project_id, {
    //   full_name,
    // });

    // แสดงลูกบ้านทั้งหมดในโปรเจคนั้นๆ
    const res = await ResidentsAPIs.getAllOneProject(me.project_id, {
      full_name,
      limit: 999999,
    });

    setPaidResident(res?.data?.body ?? []);
  };

  const fetchNotPayResident = async (full_name?: string) => {
    if (!me?.project_id) return;

    // Include `type: 'RECEIPT'` only when in common receipt mode.
    const params: any = {
      // status: "NOT_PAY",
      full_name,
    };

    if (receiptMode === "common") {
      params.type = "RECEIPT";
    }

    const res = await ReceiptAPIs.getPaidResident(me.project_id, params);

    setNotPayResident(res?.data?.body ?? []);
  };

  useEffect(() => {
    if (step === 1) {
      fetchNotPayResident(residentSearch);
    }
  }, [step, residentSearch]);

  useEffect(() => {
    if (preStep === 1) {
      fetchPaidResident(residentSearch);
    }
  }, [preStep, residentSearch]);

  const onResidentSearchChange = (value: string) => {
    const val = value.trim();

    if (residentSearchRef.current) {
      clearTimeout(residentSearchRef.current);
    }

    residentSearchRef.current = setTimeout(() => {
      setResidentSearch(val || undefined);
    }, 300);
  };

  const fetchHouseNoOption = async () => {
    if (!me?.project_id) return;

    try {
      const res = await OptionsAPIs?.getHouseNumberByProject(me?.project_id);
      setHouseNoOptionData(res?.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData(currentPage, appliedFilters);
  }, [currentPage, appliedFilters, sorter, me?.project_id]);

  useEffect(() => {
    if (!me?.project_id) return;

    fetchData(1, {});
    fetchHouseNoOption();
  }, [me?.project_id]);

  const tableSource = receiptMode === "common" ? receiptData : transactionData;

  const currentPageInfo =
    receiptMode === "common" ? receiptPageInfo : transactionPageInfo;

  // ✅ resident list สำหรับ pre-payment (map จาก tableData ให้ตรงกับ modal ล่วงหน้า)
  const preResidents = useMemo(
    () =>
      tableData.map((t) => ({
        id: t.id,
        house_no: t.house,
        full_name: t.name,
        name: t.name, // ให้ search ใน PreSelectResidentModal ทำงานได้
      })),
    [tableData],
  );

  const houseOptions = useMemo(() => {
    return (houseNoOptionData ?? [])
      .slice() // กัน side effect เผื่อ data มาจาก state ตรง ๆ
      .sort((a: any, b: any) => Number(a.value) - Number(b.value))
      .map((h: any) => ({
        label: h.label,
        value: h.value,
      }));
  }, [houseNoOptionData]);

  const renderText = (text: React.ReactNode, record: any) => {
    const isRejected =
      record?.rejected_reason != null && record?.rejected_reason != "";

    return (
      <span style={{ color: isRejected ? "#C7C7C7" : "inherit" }}>{text}</span>
    );
  };

  const columns: any = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (_: any, record: any, index: number) =>
        renderText((currentPage - 1) * pageSize + index + 1, record),
    },
    {
      title: "เลขที่ใบเสร็จรับเงิน",
      dataIndex: "receipt_no",
      key: "receipt_no",
      render: (value: any, record: any) => renderText(value, record),
      sorter: true,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "resident_id",
      key: "resident_id",
      render: (_: any, record: any) =>
        renderText(record?.resident?.house_no, record),
      width: 120,
      sorter: true,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "full_name",
      key: "full_name",
      render: (_: any, record: any) =>
        renderText(record?.resident?.full_name, record),
    },
    {
      title: "ยอดที่ชำระทั้งหมด (บาท)",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      render: (value: any, record: any) => {
        const num = Number(value) || 0;
        const formatted = num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        return renderText(formatted, record);
      },
      sorter: true,
    },
    {
      title: "วันที่ออกใบเสร็จ",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: any, record: any) =>
        renderText(value ? dayjs(value).format("YYYY-MM-DD") : value, record),
      sorter: true,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: any, record: any) => (
        <ReceiptStatusTag rejectedReason={record?.rejected_reason} />
      ),
    },
    {
      title: "",
      key: "actions",
      align: "center",
      width: 60,
      render: (_: any, record: any) => {
        const isRejected =
          record?.rejected_reason != null && record?.rejected_reason != "";

        const viewDisabled = isRejected || pdfLoading === record.id;
        const downloadDisabled = isRejected || downloadLoading === record.id;

        const disabledBtnClass = "text-[#C7C7C7] cursor-not-allowed opacity-60";
        const enabledBtnClass =
          "text-[#1677ff] hover:text-blue-400 transition cursor-pointer";

        return (
          <Space size={16}>
            <Tooltip
              title={isRejected ? "รายการนี้ถูกยกเลิก" : "ยกเลิกใบเสร็จ"}
            >
              <button
                disabled={isRejected}
                className={isRejected ? disabledBtnClass : enabledBtnClass}
                onClick={() => {
                  setCancelRecord(record);
                  setCancelReason("");
                  setCancelOpen(true);
                }}
              >
                <LuFileX2 />
              </button>
            </Tooltip>

            <Tooltip title={"ดูรายละเอียด"}>
              <button
                onClick={async () => {
                  try {
                    setPdfLoading(record.id);

                    let res;

                    if (receiptMode === "common") {
                      res = await ReceiptAPIs.printPdf(record?.id);
                    } else {
                      res = await ReceiptAPIs.printTransactionPdf(record?.id);
                    }

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
                className={enabledBtnClass}
              >
                {pdfLoading === record.id ? <Spin size="small" /> : <LuEye />}
              </button>
            </Tooltip>

            <Tooltip title={"ดาวน์โหลด"}>
              <button
                onClick={async () => {
                  try {
                    setDownloadLoading(record.id);

                    let res;

                    if (receiptMode === "common") {
                      res = await ReceiptAPIs.printPdf(record?.id);
                    } else {
                      res = await ReceiptAPIs.printTransactionPdf(record?.id);
                    }

                    const blob = new Blob([res.data], {
                      type: "application/pdf",
                    });
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    if (receiptMode === "common") {
                      a.download = `ใบเสร็จรับเงิน ${record?.resident?.full_name}.pdf`;
                    } else {
                      a.download = `ใบเสร็จรายรับอื่นๆ ${record?.resident?.full_name}.pdf`;
                    }
                    a.click();

                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error("PDF download error:", err);
                  } finally {
                    setDownloadLoading(null);
                  }
                }}
                className={enabledBtnClass}
              >
                {downloadLoading === record.id ? (
                  <Spin size="small" />
                ) : (
                  <AiOutlineDownload />
                )}
              </button>
            </Tooltip>

            <Tooltip title="พิมพ์ใบเสร็จ">
              <button
                onClick={async () => {
                  try {
                    setPrintLoading(record.id);

                    let res;

                    if (receiptMode === "common") {
                      res = await ReceiptAPIs.printPdf(record?.id);
                    } else {
                      res = await ReceiptAPIs.printTransactionPdf(record?.id);
                    }

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
        );
      },
    },
  ];

  const resetPreInvoiceFlow = () => {
    setShowConfirmExit(true);
  };

  const resetOtherReceiptFlow = () => {
    setStep(0); // หรือ 0 ตาม design
    setReceiptType(null);
    setSelectedResident(null);
    setOtherPayload(null);
  };

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (preStep !== 2) return;

    if (!selectedResident?.id || !selectedYear) return;

    const fetchPaidMonth = async () => {
      try {
        const projectId = me?.project_id;

        const res = await PaymentAPIs.getMonthPaidResident(projectId, {
          resident_id: selectedResident.id,
          year: selectedYear,
        });

        setPaidMonth(res.data.body);
      } catch (err) {
        console.error("Load paidMonth error:", err);
      }
    };

    fetchPaidMonth();
  }, [preStep, selectedYear, selectedResident?.id]);

  return (
    <div style={{ padding: 20 }}>
      {/* header */}
      <div className="flex justify-end items-center mb-4 gap-3">
        <div className="flex gap-3">
          {/* 🔹 ปุ่มชำระล่วงหน้า */}
          {receiptMode === "common" && (
            <Button
              type="primary"
              onClick={() => {
                setPreStep(1);
              }}
              icon={
                <AiFillFile
                  size={16}
                  style={{ marginRight: 8 }}
                  color="#6CAF37"
                />
              }
              style={{
                height: 42,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                color: "#6CAF37",
                borderColor: "#6CAF37",
                padding: "0 20px",
              }}
              className="transition-all duration-150 font-medium"
            >
              ชำระค่าส่วนกลางล่วงหน้า
            </Button>
          )}

          {/* ปุ่ม flow ออกใบเสร็จเดิม */}
          <Button
            type="primary"
            onClick={() => {
              // setStep(0);
              setStep(1);
              setModalMode("create");
              setSelectedRecord(null);
              setFlowId((x) => x + 1);
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
            className="hover:!bg-[#6CAF37] transition-all duration-150 font-medium"
          >
            {receiptMode === "common"
              ? "ออกใบเสร็จค่าส่วนกลาง"
              : "ออกใบเสร็จรายรับอื่นๆ"}
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
            style={{ width: 325, height: 38 }}
            className="custom-rounded-select"
          />

          <Input
            placeholder="ค้นหาเลขที่ใบเสร็จรับเงิน"
            prefix={<SearchOutlined />}
            allowClear
            value={draftFilters.receipt_no || ""}
            onChange={(e) =>
              setDraftFilters((prev) => ({
                ...prev,
                receipt_no: e.target.value || undefined,
              }))
            }
            style={{ width: 325, height: 38, borderRadius: 20 }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center mb-4 gap-3">
        <div className="flex gap-3">
          <div className="flex flex-col">
            <DateRangePicker
              picker="date"
              format="DD/MM/YYYY" // แสดงผลเฉย ๆ
              placeholder={[
                "วันที่ออกใบเสร็จเริ่มต้น",
                "วันที่ออกใบเสร็จสิ้นสุด",
              ]}
              className="custom-rounded-select"
              style={{ width: 325, height: 38, borderRadius: 20 }}
              value={
                draftFilters.issue_start_date && draftFilters.issue_end_date
                  ? [
                      moment(draftFilters.issue_start_date, "YYYY-MM-DD", true),
                      moment(draftFilters.issue_end_date, "YYYY-MM-DD", true),
                    ]
                  : null
              }
              onChange={(dates: any) => {
                if (!dates) {
                  setDraftFilters((prev) => ({
                    ...prev,
                    issue_start_date: undefined,
                    issue_end_date: undefined,
                  }));
                  return;
                }

                setDraftFilters((prev) => ({
                  ...prev,
                  issue_start_date: dates[0].format("YYYY-MM-DD"), // ค.ศ. ล้วน
                  issue_end_date: dates[1].format("YYYY-MM-DD"),
                }));
              }}
            />
          </div>
          <div>
            <Select
              allowClear
              placeholder="สถานะ"
              value={draftFilters.active}
              style={{ width: 325, height: 38 }}
              className="custom-rounded-select"
              options={[
                { label: "ใช้งาน", value: true },
                { label: "ยกเลิก", value: false },
              ]}
              onChange={(val) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  active: val !== undefined ? val : undefined,
                }))
              }
            />
          </div>
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

      <ReceiptModeToggle
        value={receiptMode}
        onChange={(v: any) => {
          setReceiptMode(v);
          setCurrentPage(1);
          setStep(null);
          setSelectedResident(null);
        }}
      />

      {/* table */}
      <Table
        className="custom-table"
        columns={columns}
        // dataSource={receiptData}
        dataSource={tableSource}
        rowKey="id"
        pagination={false}
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
        bordered={false}
        onRow={(record) => ({
          className: record?.rejected_reason ? "row-rejected" : "",
        })}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center justify-center py-10">
              <HiOutlineInbox size={48} color="#d1d5dc" />
              <p className="text-gray-300 text-lg mt-2">ไม่มีข้อมูล</p>
            </div>
          ),
        }}
      />

      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Pagination
          current={currentPage}
          // total={filteredData.length}
          // total={pageInfo?.total || 0}
          total={currentPageInfo?.total || 0}
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

      <SelectResidentModal
        open={step === 1}
        onCancel={() => setStep(0)}
        // data={paidResident}
        data={notPayResident}
        onSearch={onResidentSearchChange}
        searchValue={residentSearch}
        // onNext={(resident: any) => {
        //   setSelectedResident(resident);
        //   setStep(2);
        // }}
        onNext={(resident: any) => {
          setSelectedResident(resident);

          if (receiptMode === "common") {
            setStep(2); // SelectInvoiceModal
          } else {
            setStep(2.5); // OtherReceiptFormModal
          }
        }}
      />

      <SelectInvoiceModal
        open={step === 2}
        resident={selectedResident}
        onBack={() => setStep(1)}
        onNext={async ({ invoices, payAdvance12Months, haveDiscount }: any) => {
          setIsAdvancePayment(!!payAdvance12Months);
          // onNext={async (selected: any[]) => {
          //   console.log("ss", selected);

          const paymentsPayload = invoices.map((s: any) => ({
            payment_id: Number(s?.invoice?.id), // ← ต้องมี และต้องเป็นตัวเลข
            items: s.invoice.items.map((it: any) => ({
              id: it?.id, // ← ต้องเป็น number
              type: it.label.includes("ส่วนกลาง")
                ? "MAINTENANCE"
                : it.label.includes("เบี้ยปรับ")
                  ? "FINE"
                  : it.label.includes("ทวงถาม")
                    ? "COLLECTION"
                    : "OTHER",
              selected: s.selectedItems.includes(it.id),
            })),
          }));

          try {
            const res = await ReceiptAPIs.postReceiptResident(
              selectedResident.id,
              {
                payments: paymentsPayload,
                have_discount: payAdvance12Months,
              },
            );

            const invoicesPayload = invoices.map((s: any) => ({
              payment_id: Number(s.invoice.id),
              month: s.invoice.month, // เก็บไว้ใน STATE เท่านั้น
              year: s.invoice.year,
              items: s.invoice.items.map((it: any) => ({
                id: it?.id,
                type: it.label.includes("ส่วนกลาง")
                  ? "MAINTENANCE"
                  : it.label.includes("เบี้ยปรับ")
                    ? "FINE"
                    : it.label.includes("ทวงถาม")
                      ? "COLLECTION"
                      : "OTHER",
                selected: s.selectedItems.includes(it.id),
              })),
            }));

            setSelectedInvoices(invoicesPayload);

            setReceiptPreview(res?.data?.body || null);
            // setSelectedInvoices(paymentsPayload);
            setStep(3);
          } catch (err) {
            console.error("Error calling postReceiptResident:", err);
          }
        }}
      />

      <PaymentMethodModal
        open={step === 3}
        resident={selectedResident}
        receiptPreview={receiptPreview}
        selectedInvoices={selectedInvoices}
        isAdvancePayment={isAdvancePayment}
        onBack={() => setStep(2)}
        onNext={() => {
          setStep(5);
          fetchData();
        }}
        onSuccessPdf={(url) => setPdfUrl(url)} // ✅ เพิ่ม
      />

      {/* <ReceiptPreviewModal
        open={step === 4}
        resident={selectedResident}
        months={selectedMonths}
        onBack={() => setStep(3)}
        onConfirm={() => setStep(5)}
      /> */}

      {/* alternate flow ใบเสร็จรายรับอื่นๆ */}

      <OtherReceiptFormModal
        key={flowId}
        open={step === 2.5}
        resetKey={flowId}
        resident={selectedResident}
        onBack={() => setStep(1)}
        onNext={(payload) => {
          setOtherPayload(payload);
          setStep(3.5);
        }}
      />

      <OtherReceiptSummaryModal
        open={step === 3.5}
        resident={selectedResident}
        otherPayload={otherPayload} // ✅ ใช้ตัวนี้แทน
        onBack={() => setStep(2.5)}
        onNext={() => {
          setStep(5);
          fetchData();
        }}
        onSuccessPdf={(url) => setPdfUrl(url)}
      />

      <ViewReceiptModal
        open={viewOpen}
        onBack={() => setViewOpen(false)}
        resident={selectedRecord}
      />

      {/* <SuccessModal
        open={step === 5}
        onClose={() => setStep(0)}
        pdfUrl={pdfUrl}
      /> */}

      <SuccessModal
        open={step === 5}
        onClose={() => {
          resetOtherReceiptFlow(); // ✅ เพิ่ม
        }}
        pdfUrl={pdfUrl}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={() => setShowConfirmExit(false)}
        onConfirm={() => {
          resetOtherReceiptFlow();

          setStep(0);
          setPreStep(0);
          setSelectedResident(null);
          setSelectedMonths([]);
          setShowConfirmExit(false);
        }}
      />
      {/* STEP 1: เลือกผู้อาศัย */}
      <PreSelectResidentModal
        open={preStep === 1}
        data={paidResident}
        onCancel={resetPreInvoiceFlow}
        onSearch={onResidentSearchChange}
        searchValue={residentSearch}
        onNext={async (resident: any) => {
          const projectId = me?.project_id;
          const resYear = await PaymentAPIs?.getYearPaidResident(projectId, {
            resident_id: resident?.id,
          });

          const minYear = resYear?.data?.body?.min;
          setMinYear(minYear);

          const resMonth = await PaymentAPIs?.getMonthPaidResident(projectId, {
            resident_id: resident?.id,
            year: minYear,
          });

          const paidMonth = resMonth?.data?.body;
          setPaidMonth(paidMonth);
          console.log("paidMonth", paidMonth);

          setSelectedResident(resident);
          setPreStep(2);
        }}
      />

      {/* STEP 2: เลือกเดือนล่วงหน้า */}
      <PreSelectMonthModal
        open={preStep === 2}
        resident={selectedResident}
        minYear={minYear}
        paidMonth={paidMonth}
        onBack={() => setPreStep(1)}
        onYearChange={setSelectedYear}
        onNext={async (
          payload: { months: number[]; year: number },
          valid: boolean,
        ) => {
          if (!valid) {
            setPreStep(2.5);
            return;
          }

          try {
            const projectId = me?.project_id;

            // months จาก modal เป็น index 0-11 ต้อง +1 ก่อนส่ง API
            const apiMonths = payload.months.map((m) => m + 1);

            // ↓↓↓ ใช้ API เก่ามาแทน Preview ของ Flow ใหม่ ↓↓↓
            const res = await PaymentAPIs.previewInvoice(projectId, {
              resident_id: selectedResident?.id,
              year: payload.year,
              months: apiMonths,
            });

            setSelectedMonths(apiMonths);
            setPreSelectedYear(payload.year);
            setPreviewData(res.data.body);
            setPreStep(3);
          } catch (err) {
            console.error("Preview Error:", err);
          }
        }}
      />

      {/* STEP 2.5: เดือนผิด */}
      <PreInvalidMonthModal
        open={preStep === 2.5}
        onBack={() => setPreStep(2)}
      />

      {/* STEP 3: Summary */}
      <PreReceiptSummaryModal
        open={preStep === 3}
        preview={previewData}
        onBack={() => setPreStep(2)}
        onNext={async (values: PreReceiptFormValues) => {
          try {
            const projectId = me?.project_id;

            // แปลงวิธีชำระเงินให้เป็น payment_method_id
            const PAYMENT_METHOD_MAP: any = {
              cash: 2,
              transfer: 1,
              cheque: 3,
            };

            const payment_method_id = PAYMENT_METHOD_MAP[values.method];

            // amount เป็น string → ส่งตรง หรือจะแปลง number ก็ได้
            const total_amount = values.amount;

            // issue_date (dayjs) → YYYY-MM-DD
            const issue_date = values.issue_date
              ? values.issue_date.format("YYYY-MM-DD")
              : null;

            // ถ้าเป็น transfer → ต้องใช้ bank_name
            const bank_name = values?.bank ? values.bank : "";

            // ถ้า cheque → ต้องใช้ cheque_no
            const cheque_no =
              values.method === "cheque" ? values.cheque_no : "";

            // สร้าง invoice จริง (รวมฟิลด์ใหม่)
            const res = await PaymentAPIs.confirmInvoice(projectId, {
              resident_id: selectedResident?.id,
              year: preSelectedYear || 2568,
              months: selectedMonths,
              total_amount, // ← เพิ่ม
              issue_date, // ← เพิ่ม
              payment_method_id, // ← เพิ่ม
              note: values.remark || "",
              bank_name,
              cheque_no,
            });

            const invNo = res.data.body?.inv_no;
            setInvoiceResult(res.data.body);

            // generate PDF
            const pdfRes = await PaymentAPIs.createPdf(projectId, {
              inv_no: Number(invNo),
            });

            const blob = new Blob([pdfRes.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            setPreStep(6);
            fetchData();
          } catch (err) {
            console.error("Confirm Error:", err);
            message.error("มีข้อมูลใบแจ้งหนี้ในเดือนและปีที่ระบุแล้ว");
          }
        }}
      />

      {/* STEP 6: Success */}
      <SuccessModal
        open={preStep === 6}
        invoiceResult={invoiceResult}
        pdfUrl={pdfUrl}
        onClose={() => {
          setPreStep(0);
          setSelectedResident(null);
          setSelectedMonths([]);
          setInvoiceResult(null); // << reset ด้วย
        }}
      />

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

      <CancelModal
        open={cancelOpen}
        onBack={() => {
          setCancelOpen(false);
          setShowConfirmExit(true);
        }}
        onNext={(reason: string) => {
          setCancelReason(reason);
          setCancelOpen(false);
          setConfirmCancelOpen(true);
        }}
      />

      {/* <ConfirmExitModal
        open={showConfirmExit}
        onCancel={() => setShowConfirmExit(false)}
        onConfirm={() => {
          setShowConfirmExit(false);
          setCancelOpen(false);
          setCancelReason("");
          setCancelRecord(null);
        }}
      /> */}

      <ConfirmExitModal
        open={exitPreFlowOpen}
        onCancel={() => setExitPreFlowOpen(false)}
        onConfirm={() => {
          resetOtherReceiptFlow();

          setExitPreFlowOpen(false);
          setPreStep(0);
          setSelectedResident(null);
          setSelectedMonths([]);
        }}
      />

      <ConfirmExitModal
        open={exitMainFlowOpen}
        onCancel={() => setExitMainFlowOpen(false)}
        onConfirm={() => {
          resetOtherReceiptFlow();

          setExitMainFlowOpen(false);
          setStep(0);
          setSelectedResident(null);
          setSelectedMonths([]);
        }}
      />

      <ConfirmCancelModal
        open={confirmCancelOpen}
        onBack={() => {
          setConfirmCancelOpen(false);
          setCancelOpen(true);
        }}
        onConfirm={async () => {
          if (receiptMode === "common") {
            await ReceiptAPIs.rejectReceipt(cancelRecord.id, {
              rejected_reason: cancelReason,
            });
          } else {
            await ReceiptAPIs.rejectTransaction(cancelRecord.id, {
              rejected_reason: cancelReason,
            });
          }
          setConfirmCancelOpen(false);
          setSuccessCancelOpen(true);
          fetchData(); // refresh table
        }}
      />

      <SuccessCancelModal
        open={successCancelOpen}
        onClose={() => {
          setSuccessCancelOpen(false);
          setCancelRecord(null);
          setCancelReason("");
        }}
      />

      {/* global styles เดิม */}
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

        .receipt-search-input .ant-input-affix-wrapper {
          border-radius: 20px !important;
          height: 38px !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
