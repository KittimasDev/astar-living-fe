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
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlineInbox } from "react-icons/hi2";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import SearchBar from "./SearchBar";
import { useMe } from "../../hooks/useMe";
import { CreditNoteAPIs } from "../../networks/credit-note.api";
import { LuEye } from "react-icons/lu";
import { AiOutlineDownload } from "react-icons/ai";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { OptionsAPIs } from "../../networks/option.api";
import { MdCreditCardOff, MdOutlineLocalPrintshop } from "react-icons/md";
import { HiOutlinePencil } from "react-icons/hi2";
import { AiFillFile } from "react-icons/ai";
import { LuClock } from "react-icons/lu";

import PdfDocumentWrapper from "../PdfdocumentWrapper";
import { message } from "antd";
import moment from "moment";
import { ThaiDatePicker } from "../../utils/ThaiDatePicker";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd
import PaymentCreateModal from "../payment/invoice/PaymentCreateModal";
import CreditNoteSelectModal from "./CreditNoteSelectModal";
import ErrorModal from "../credit-note/ErrorModal";
import ConfirmModal from "../credit-note/ConfirmModal";
import { PaymentAPIs } from "../../networks/payment.api";
import SuccessModal from "./SuccessModal";
import PaymentMethodModal from "../credit-note/PaymentMethodModal";

const { Option } = Select;

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function CreditNoteContent() {
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
    inv_no?: string;
  }>({});

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [pdfErrorModal, setPdfErrorModal] = useState(false);
  const [pdfErrorMessage, setPdfErrorMessage] = useState("");

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openOutstandingErrorModal, setOpenOutstandingErrorModal] =
    useState(false);

  const [outstandingErrorMessage, setOutstandingErrorMessage] =
    useState<string>("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [selectedForInvoice, setSelectedForInvoice] = useState<any[]>([]);

  const [searchPaymentNo, setSearchPaymentNo] = useState("");
  const [searchHouse, setSearchHouse] = useState("");
  const [followUpEditOpen, setFollowUpEditOpen] = useState(false);

  const [serverSearch, setServerSearch] = useState("");

  const [reminderSearch, setReduceListSearch] = useState<string | undefined>();
  const reminderDebounceRef = useRef<any>(null);

  const [paymentData, setPaymentData] = useState<any>();
  const [reduceList, setReduceList] = useState<any>();
  const [invoice, setInvoice] = useState<any>();
  const [projectData, setProjectData] = useState<any>();
  const [monthData, setMonthData] = useState<any>(null);
  const [creditNoteFormData, setCreditNoteFormData] = useState<any>(null);

  const fetchData = useCallback(
    async (
      page = 1,
      filters: {
        inv_no?: string;
        house_no?: string;
        month?: number;
        year?: number;
      } = {},
    ) => {
      if (!me?.project_id) return;

      try {
        const res = await CreditNoteAPIs.getAll({
          page,
          limit: pageSize,
          status: "CANCELLED",

          inv_no: filters.inv_no,
          resident_id: filters.house_no,
          month: filters.month,
          year: filters.year,

          // order_field: sorter.field,
          // order_type: sorter.order,
        });

        setPaymentData(res?.data?.body ?? []);
        setPageInfo(res?.data?.page_information ?? null);
      } catch (e) {
        console.error(e);
      }
    },
    [me?.project_id, sorter.field, sorter.order],
  );

  const fetchHouseNoOption = useCallback(async () => {
    if (!me?.project_id) return;

    try {
      const res = await OptionsAPIs?.getHouseNumberByProject(me?.project_id);
      setHouseNoOptionData(res?.data);
    } catch (error) {}
  }, [me?.project_id]);

  // useEffect(() => {
  //   fetchData(currentPage, appliedFilters);
  // }, [currentPage, appliedFilters, sorter, me?.project_id]);

  useEffect(() => {
    if (!me?.project_id) return;

    fetchData(1, {});
    fetchHouseNoOption();
  }, [me?.project_id, fetchData, fetchHouseNoOption]);

  useEffect(() => {
    fetchData(currentPage, appliedFilters);
  }, [currentPage, appliedFilters, sorter, fetchData]);

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

  const onReminderSearchChange = (value: string) => {
    const val = value.trim();

    if (reminderDebounceRef.current) {
      clearTimeout(reminderDebounceRef.current);
    }

    reminderDebounceRef.current = setTimeout(() => {
      setReduceListSearch(val || undefined);
    }, 300);
  };

  const columns: any = [
    {
      title: "ลำดับที่",
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
      render: (_: any, __: any) => __?.payment?.inv_no,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "resident_id",
      key: "resident_id",
      width: 120,
      render: (_: any, __: any) => __?.resident?.house_no,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "full_name",
      key: "full_name",
      render: (_: any, __: any) => __?.resident?.full_name,
    },
    {
      title: "ค่าเบี้ยปรับ (บาท)",
      dataIndex: "fee_amount_fine",
      key: "fee_amount_fine",
      align: "right",

      render: (_value: any, record: any) => {
        const totalDue = Number(record.fee_amount_fine) || 0;
        // const collectionFee = Number(record.collection_fee) || 0;

        const finalAmount = totalDue;

        return finalAmount.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "fee_amount_collection",
      key: "fee_amount_collection",
      align: "right",

      render: (_value: any, record: any) => {
        const totalDue = Number(record.fee_amount_collection) || 0;
        // const collectionFee = Number(record.collection_fee) || 0;

        const finalAmount = totalDue;

        return finalAmount.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      title: "ยอดที่ลด (บาท)",
      dataIndex: "fee_amount_total",
      key: "fee_amount_total",
      align: "right",

      render: (_value: any, record: any) => {
        const totalDue = Number(record?.fee_amount_total) || 0;
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
    },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      <div className="flex justify-end items-center mb-4 gap-3">
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={async () => {
              try {
                setModalMode("create");
                setSelectedRecord(null);

                setStep(1);
              } catch (err: any) {
                setErrorMessage(err.message);
                setErrorModalOpen(true);
              }
            }}
            icon={<MdCreditCardOff size={16} style={{ marginRight: 8 }} />}
            style={{
              height: 42,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#74BA3D",
              borderColor: "#74BA3D",
              padding: "0 28px",
            }}
            className="hover:bg-[#6CAF37]! transition-all duration-150 font-medium"
          >
            ลดหนี้
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center mb-4 gap-3">
        <div className="flex gap-3">
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
          // if (!sorter?.order) {
          //   setSorter({});
          //   setCurrentPage(1);
          //   return;
          // }

          // setSorter({
          //   field: sorter.field, // ← ต้องตรงกับ backend
          //   order: sorter.order === "ascend" ? "ASC" : "DESC",
          // });

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

      <CreditNoteSelectModal
        open={step === 1}
        data={reduceList}
        searchValue={reminderSearch}
        onSearchChange={onReminderSearchChange}
        onCancel={() => setStep(0)}
        onNext={(invoice: any) => {
          setSelectedForInvoice([invoice]);
          setInvoice(invoice);
          setStep(2);
        }}
        onOutstandingError={(message?: string) => {
          setOutstandingErrorMessage(
            message ||
              "มีรายการค้างชำระของเดือนก่อนหน้า ไม่สามารถดำเนินการต่อได้",
          );
          setOpenOutstandingErrorModal(true);
        }}
      />

      <ErrorModal
        open={openOutstandingErrorModal}
        message={outstandingErrorMessage}
        onBack={() => {
          setOpenOutstandingErrorModal(false);
          setStep(0);
        }}
      />

      <PaymentMethodModal
        open={step === 2}
        invoiceId={invoice?.id}
        onBack={() => setStep(1)}
        onNext={(formData: any) => {
          setCreditNoteFormData(formData);
          setStep(3);
        }}
      />

      {step === 3 && (
        <ConfirmModal
          open
          onBack={() => setStep(2)}
          onConfirm={async () => {
            try {
              if (!invoice?.id) {
                throw new Error("ไม่พบข้อมูลใบลดหนี้");
              }

              await CreditNoteAPIs.confirm(invoice.id, {
                deducted_reason: creditNoteFormData?.note,
              });

              setStep(4);
              fetchData();
            } catch (error: any) {
              console.error(error);

              throw new Error(
                error?.response?.data?.message ||
                  error?.response?.data?.body?.message ||
                  error?.message ||
                  "ไม่สามารถยืนยันการลดหนี้ได้",
              );
            }
          }}
        />
      )}

      {step === 4 && (
        <SuccessModal
          open={step === 4}
          pdfUrl={pdfUrl}
          invoiceResult={invoice}
          me={me}
          onClose={() => {
            setStep(0);
            fetchData();
          }}
        />
      )}

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
