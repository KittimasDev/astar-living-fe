import { SearchOutlined } from "@ant-design/icons";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button, Input, Pagination, Select, Table } from "antd";
import th_TH from "antd/lib/date-picker/locale/th_TH";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineInbox } from "react-icons/hi2";
import { useMe } from "../../hooks/useMe";
import { OptionsAPIs } from "../../networks/option.api";
import { PaymentAPIs } from "../../networks/payment.api";
import { ReceiptAPIs } from "../../networks/receipt.api";
import { ThaiDatePicker } from "../../utils/ThaiDatePicker";
import ConfirmExitModal from "../ConfirmExitModal";
import PaymentMethodModal from "./PaymentMethodModal";
import SelectInvoiceModal from "./SelectInvoiceModal";
import SuccessModal from "./SuccessModal";
import ViewReceiptModal from "./ViewReceiptModal";

const { Option } = Select;

export default function OverdueContent() {
  const { data: me } = useMe();
  const router = useRouter();
  const [searchPaymentNo, setSearchPaymentNo] = useState("");
  const [searchHouse, setSearchHouse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [followUpEditOpen, setFollowUpEditOpen] = useState(false);

  const [draftFilters, setDraftFilters] = useState<{
    inv_no?: string;
    house_no?: string;
    month?: number;
    year?: number;
  }>({});

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [houseNoOptionData, setHouseNoOptionData] = useState<any>();

  const [paymentData, setPaymentData] = useState<any>();
  const [reminder, setReminder] = useState<any>();
  const [invoice, setInvoice] = useState<any>();
  const [projectData, setProjectData] = useState<any>();
  const [pageInfo, setPageInfo] = useState<any>();
  const [monthData, setMonthData] = useState<any>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const fetchData = async (
    page = 1,
    filters: {
      inv_no?: string;
      house_no?: string;
      year?: any;
      month?: any;
    } = {}
  ) => {
    const projectId = me?.project_id;
    if (!projectId) return;

    const res = await PaymentAPIs.getAllPaymentByProject(projectId, {
      page,
      limit: pageSize,
      // status: "NOT_PAY",
      type: "OVERDUE",
      advance: false,
      inv_no: filters.inv_no,
      resident_id: filters.house_no,
      year: filters.year,
      month: filters.month,
      order_field: sorter.field,
      order_type: sorter.order,
    });

    setPaymentData(res?.data?.body ?? []);
    setPageInfo(res?.data?.page_information ?? null);
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

  const pageSize = 10;

  const [tableData, setTableData] = useState<any[]>([]);

  // ✅ state modal
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [followUpHistoryOpen, setFollowUpHistoryOpen] = useState(false);
  const [paymentViewOpen, setPaymentViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  //   invoice step
  const [viewOpen, setViewOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] = useState<any[]>([]);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [receiptPreview, setReceiptPreview] = useState<any>(null); // ✅ เพิ่มตรงนี้

  //   pre-invoice step
  const [preStep, setPreStep] = useState<0 | 1 | 2 | 2.5 | 3 | 4 | 5 | 6>(0);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const houseOptions = useMemo(() => {
    return (houseNoOptionData ?? [])
      .slice() // กัน side effect เผื่อ data มาจาก state ตรง ๆ
      .sort((a: any, b: any) => Number(a.value) - Number(b.value))
      .map((h: any) => ({
        label: h.label,
        value: h.value,
      }));
  }, [houseNoOptionData]);

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
      sorter: true,
      render: (_: any, __: any) => __?.resident?.house_no,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
      render: (_: any, __: any) => __?.resident?.full_name,
    },
    {
      title: "ยอดที่ต้องชำระ (บาท)",
      dataIndex: "total_due",
      key: "total_due",
      sorter: true,
      align: "right",
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
      sorter: true,
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
      sorter: true,
      key: "year",
    },
    {
      title: "",
      key: "actions",
      align: "center",
      width: 120,
      render: (_: any, record: any) => (
        <button
          className="bg-[#87D2F7] px-5 py-1 rounded-lg text-white hover:cursor-pointer"
          onClick={() => {
            console.log(record?.resident);
            setSelectedResident(record?.resident);
            setStep(2);
          }}
        >
          <span className="text-white">ชำระเงิน</span>
        </button>
      ),
    },
  ];

  return (
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Search + Add Button */}

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
        locale={{
          emptyText: (
            <div className="flex flex-col items-center justify-center py-10">
              <HiOutlineInbox size={48} color="#d1d5dc" />
              <p className="text-gray-300 text-lg mt-2">ไม่มีข้อมูล</p>
            </div>
          ),
        }}
      />

      <SelectInvoiceModal
        open={step === 2}
        resident={selectedResident}
        onBack={() => setStep(1)}
        onNext={async (selected: any[]) => {
          console.log(selected);

          const paymentsPayload = selected.map((s) => ({
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
              }
            );

            const invoicesPayload = selected.map((s) => ({
              payment_id: Number(s.invoice.id),
              month: s.invoice.month, // เก็บไว้ใน STATE เท่านั้น
              year: s.invoice.year,
              items: s.invoice.items.map((it: any) => ({
                id: it.id,
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
        onBack={() => setStep(2)}
        onNext={() => {
          setStep(5);
          fetchData();
        }}
        onSuccessPdf={(url) => setPdfUrl(url)} // ✅ เพิ่ม
      />

      <ViewReceiptModal
        open={viewOpen}
        onBack={() => setViewOpen(false)}
        resident={selectedRecord}
      />

      <SuccessModal
        open={step === 5}
        onClose={() => setStep(0)}
        pdfUrl={pdfUrl}
      />

      <ConfirmExitModal
        open={showConfirmExit}
        onCancel={() => setShowConfirmExit(false)}
        onConfirm={() => {
          setStep(0);
          setPreStep(0);
          setSelectedResident(null);
          setSelectedMonths([]);
          setShowConfirmExit(false);
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
