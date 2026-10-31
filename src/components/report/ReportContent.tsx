import {
  DatePicker,
  Pagination,
  Select,
  Table,
  Tag,
  Collapse,
  Spin,
  Empty,
  Button,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th"; // ถ้าอยากให้เป็นภาษาไทย
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as XLSX from "xlsx";
import THSarabunNew from "../../fonts/THSarabunNew-normal.js";
import { useMe } from "../../hooks/useMe";
import { OptionsAPIs } from "../../networks/option.api";
import { ReportAPIs } from "../../networks/report.api";
import { ReceiptStatusTag } from "../receipt/ReceiptStatusTag";
import SearchBar from "./SearchBar";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

dayjs.locale("th");

const { Option } = Select;

const { RangePicker } = DatePicker;

type FilterForm = {
  year?: any;
  month?: any;
  house_no?: any;

  // 🔹 รายงานการชำระเงิน
  date_year?: any;
  method?: any;
  //   payment_date_range?: [string, string] | undefined;
  //   payment_date_range?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  payment_date_range?: any;

  // 🔹 รายงานใบแจ้งค่าใช้จ่าย
  year_range?: any;
  invoiced_by?: any;

  year_start?: any;
  year_end?: any;

  payment_start_date?: any;
  payment_end_date?: any;

  user_full_name?: any;

  // 🔹 รายงานค่าปรับและค่าทวงถาม
  // (ใช้ date_year, house_no ซ้ำได้)
};

const REPORT_TABS = [
  { key: "arrears", label: "รายงานค้างชำระ" },
  { key: "payment", label: "รายงานการชำระเงินส่วนกลาง" },
  // { key: "other", label: "รายงานการชำระเงินอื่นๆ" },
  { key: "usage", label: "รายงานใบแจ้งค่าใช้จ่าย" },
  { key: "discount", label: "รายงานค่าปรับและค่าทวงถาม" },
  { key: "arrears_board", label: "รายงานค้างชำระแจ้งกรรมการ" },
  { key: "arrears_resident", label: "รายงานค้างชำระแจ้งลูกบ้าน" },
];

const names = [
  "นายสมชาย จิตดี",
  "นางสาวพรทิพย์ จันทร์แสง",
  "นายอริย์กร สุวรรณโชติ",
  "นางสาวกมลชนก ศรีวินา",
  "นายอิทธิพล พงศ์เดชา",
  "นางสมศรี จันทร์เพ็ญ",
  "นายวิชัย ทองมาก",
  "นางสาวนุชนารถ มงคล",
  "นายสมบัติ ใจดี",
  "นายปิยะพงษ์ จันทรา",
  "นางสาวอรนภา นิลรัตน์",
  "นายจิรศักดิ์ สังข์ทอง",
  "นางสาวจิตรา คงเมือง",
  "นายศักดา จันทร์เจริญ",
  "นางสาวกัญญารัตน์ พรมดี",
];

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

export const DATA_BY_TAB = {
  arrears: [],
  payment: [],
  other: [],
  usage: [],
  discount: [],
  arrears_board: [],
  arrears_resident: [],
};

const EX_TYPE_BY_TAB = {
  arrears: "REPORT_OUTSTANDING",
  payment: "REPORT_PAYMENT",
  other: "REPORT_REVENUE",
  usage: "REPORT_INVOICE",
  discount: "REPORT_FINE",
  arrears_board: "REPORT_OUTSTANDING",
  arrears_resident: "REPORT_OUTSTANDING",
};

export default function ReportContent() {
  const { data: me } = useMe();
  const [activeTab, setActiveTab] =
    useState<keyof typeof DATA_BY_TAB>("arrears");
  const [data, setData] = useState<any[]>(DATA_BY_TAB["arrears"]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportData, setReportData] = useState<any>();
  const [houseNoOptionData, setHouseNoOptionData] = useState<any>();
  const [currentPage, setCurrentPage] = useState<any>(1);

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const { control, handleSubmit, reset, getValues, setValue } =
    useForm<FilterForm>({
      defaultValues: {
        year: null,
        month: null,
        house_no: null,
        date_year: null,
        method: null,

        // 🔴 สำคัญมาก
        payment_start_date: null,
        payment_end_date: null,

        payment_date_range: null,
        year_range: null,
        invoiced_by: null,
        user_full_name: null,
      },
    });

  const [pageInfo, setPageInfo] = useState<any>();
  const [summaryTotals, setSummaryTotals] = useState<any>(null);
  const [residentData, setResidentData] = useState<any>(null);
  const [expandedYears, setExpandedYears] = useState<string[]>([]);

  const fetchData = async (customFilters?: any) => {
    console.log("c", customFilters);

    try {
      const projectId = me?.project_id;
      if (!projectId) return;

      const formValues = customFilters ?? getValues();

      // Special handling for arrears_resident
      if (activeTab === "arrears_resident") {
        const resident_id = formValues.house_no;
        if (!resident_id) {
          setResidentData(null);
          setData([]);
          return;
        }

        const payload = {
          year: formValues.year,
          month: formValues.month,
        };

        try {
          const res = await ReportAPIs.getSummaryExpensesReportById(
            resident_id,
            payload,
          );
          setResidentData(res?.data?.body ?? null);
          setSummaryTotals(res?.data?.body?.total ?? null);
          setData([]);
        } catch (error) {
          console.error(error);
          setResidentData(null);
        }
        return;
      }

      const ex_type = EX_TYPE_BY_TAB[activeTab] ?? "REPORT_OUTSTANDING";

      const payload = {
        year: formValues.year,
        month: formValues.month,
        resident_id: formValues.house_no,
        receipt_no: formValues.receipt_no,
        active: formValues.active,
        date_year: formValues.date_year,
        payment_method_id: formValues.method ?? undefined,
        payment_method_name: formValues.payment_method_name ?? undefined,
        payment_date_range: formValues.payment_date_range,
        invoiced_by: formValues.invoiced_by,

        year_start: formValues?.year_start,
        year_end: formValues?.year_end,

        payment_start_date: formValues.payment_start_date
          ? formValues.payment_start_date
              .clone()
              .locale("en")
              .format("YYYY-MM-DD")
          : null,
        payment_end_date: formValues.payment_end_date
          ? formValues.payment_end_date
              .clone()
              .locale("en")
              .format("YYYY-MM-DD")
          : null,
        user_full_name: formValues?.user_full_name,

        page: currentPage,

        order_field: sorter.field,
        order_type: sorter.order,
      };

      let reportRes;
      let raw: any[] = [];

      if (activeTab === "arrears_board") {
        reportRes = await ReportAPIs.getSummaryExpensesReport(payload);
        const body = reportRes?.data?.body ?? {};
        raw = (body.by_house ?? []).map((item: any, index: number) => ({
          key: index + 1,
          house_no: item.house_no ?? "",
          full_name: item.full_name ?? "",
          common_fee: Number(item.common_fee || 0),
          fine: Number(item.fine || 0),
          collection_fee: Number(item.collection_fee || 0),
          total: Number(item.total || 0),
        }));

        setSummaryTotals(body.total ?? null);
        setPageInfo(reportRes?.data?.page_information ?? null);
        setResidentData(null);
      } else {
        reportRes = await ReportAPIs.getReport(projectId, ex_type, payload);
        raw = reportRes?.data?.body ?? [];

        // mapping เฉพาะ REPORT_OUTSTANDING (tab: arrears)
        if (activeTab === "arrears") {
          raw = raw.map((item: any, index: number) => ({
            key: index + 1,
            house_no: item.resident?.house_no ?? "",
            name: item.resident?.full_name ?? "",
            month: convertMonth(item.month),
            year: item.year,
            amount: Number(item.amount_due),
            vat: Number(item.fine),
            dunning_fee: Number(item.collection_fee),
            total_amount: Number(item.total_due),
          }));
        }

        if (activeTab === "discount") {
          raw = raw.map((item: any, index: number) => ({
            ...item,
            key: index + 1,
            resident_id: item.resident_id,
            total_amount:
              Number(item.fine || 0) + Number(item.collection_fee || 0),
          }));
        }

        setPageInfo(reportRes?.data?.page_information ?? null);
        setSummaryTotals(null);
      }

      setData(raw);
      setPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  // function buildReportPayload(
  //   formValues: any,
  //   opts?: { page?: number; limit?: number; sorter?: any },
  // ) {
  //   return {
  //     year: formValues.year,
  //     month: formValues.month,
  //     resident_id: formValues.house_no,
  //     receipt_no: formValues.receipt_no,
  //     active: formValues.active,
  //     date_year: formValues.date_year,
  //     payment_method_id: formValues.method ?? undefined,
  //     invoiced_by: formValues.invoiced_by,
  //     user_full_name: formValues.user_full_name,

  //     year_start: formValues.year_start,
  //     year_end: formValues.year_end,

  //     payment_start_date: formValues.payment_start_date
  //       ? formValues.payment_start_date.clone().format("YYYY-MM-DD")
  //       : null,
  //     payment_end_date: formValues.payment_end_date
  //       ? formValues.payment_end_date.clone().format("YYYY-MM-DD")
  //       : null,

  //     page: opts?.page ?? 1,
  //     limit: opts?.limit,

  //     order_field: opts?.sorter?.field,
  //     order_type: opts?.sorter?.order,
  //   };
  // }

  function buildReportPayload(
    formValues: any,
    opts?: { page?: number; limit?: number; sorter?: any },
  ) {
    return {
      year: formValues.year || undefined,
      month: formValues.month || undefined,

      // ใช้ค้นหาได้ทุก tab ที่มี field บ้านเลขที่
      resident_id: formValues.house_no || undefined,

      receipt_no: formValues.receipt_no || undefined,
      active: formValues.active ?? undefined,
      date_year: formValues.date_year || undefined,
      payment_method_id: formValues.method ?? undefined,
      invoiced_by: formValues.invoiced_by || undefined,
      user_full_name: formValues.user_full_name || undefined,

      year_start: formValues.year_start || undefined,
      year_end: formValues.year_end || undefined,

      payment_start_date: formValues.payment_start_date
        ? formValues.payment_start_date.clone().format("YYYY-MM-DD")
        : undefined,

      payment_end_date: formValues.payment_end_date
        ? formValues.payment_end_date.clone().format("YYYY-MM-DD")
        : undefined,

      page: opts?.page ?? 1,
      limit: opts?.limit,

      order_field: opts?.sorter?.field,
      order_type: opts?.sorter?.order,
    };
  }

  const houseOptions = useMemo(() => {
    return (houseNoOptionData ?? [])
      .slice() // กัน side effect เผื่อ data มาจาก state ตรง ๆ
      .sort((a: any, b: any) => Number(a.value) - Number(b.value))
      .map((h: any) => ({
        label: h.label,
        value: h.value,
      }));
  }, [houseNoOptionData]);

  useEffect(() => {
    const filters = getValues();
    fetchData(filters);
  }, [currentPage, activeTab, sorter]);

  // useEffect(() => {
  //   reset({
  //     year: null,
  //     month: null,
  //     house_no: null,
  //     date_year: null,
  //     method: null,
  //     payment_date_range: null,
  //     year_range: null,
  //     invoiced_by: null,
  //     year_start: null,
  //     year_end: null,
  //     payment_start_date: null,
  //     payment_end_date: null,
  //     user_full_name: null,
  //   });

  //   setCurrentPage(1);
  // }, [activeTab]);

  const convertMonth = (m: number) => {
    const MAP = [
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
    return MAP[m - 1] ?? "";
  };

  const fetchHouseNoOption = async () => {
    if (!me?.project_id) return;

    try {
      const res = await OptionsAPIs?.getHouseNumberByProject(me?.project_id);
      setHouseNoOptionData(res?.data);
    } catch (error) {}
  };

  useEffect(() => {
    if (!me?.project_id) return;

    fetchData(1);
    fetchHouseNoOption();
  }, [me?.project_id]);

  const defaultFilterValues = {
    year: null,
    month: null,
    house_no: null,
    date_year: null,
    method: null,
    payment_date_range: null,
    year_range: null,
    invoiced_by: null,
    year_start: null,
    year_end: null,
    payment_start_date: null,
    payment_end_date: null,
    user_full_name: null,
  };

  const handleTabChange = (key: keyof typeof DATA_BY_TAB) => {
    reset(defaultFilterValues);

    setData([]);
    setResidentData(null);
    setSummaryTotals(null);
    setSorter({});
    setCurrentPage(1);
    setPage(1);

    setActiveTab(key);
  };
  const handleExport = async (format: "excel" | "csv" | "pdf") => {
    const projectId = me?.project_id;
    if (!projectId) return;

    const formValues = getValues();
    const ex_type = EX_TYPE_BY_TAB[activeTab];

    const payload = buildReportPayload(formValues, {
      page: 1,
      limit: 999999,
    });

    const currentReportLabel =
      REPORT_TABS.find((t) => t.key === activeTab)?.label || "รายงาน";

    const sanitizeFileNamePart = (value: any) =>
      String(value ?? "")
        .trim()
        .replace(/[\\:*?"<>|]/g, "")
        .replace(/\//g, "-");

    const buildArrearsResidentFileName = (body?: any) => {
      if (activeTab !== "arrears_resident") {
        return currentReportLabel;
      }

      const houseNo = sanitizeFileNamePart(body?.house_no);
      const fullName = sanitizeFileNamePart(body?.full_name);

      return `รายงานค้างชำระแจ้งลูกบ้านเลขที่_${houseNo || "-"}_${fullName || "-"}`;
    };

    let exportData: any[] = [];
    let rawExportResponse: any = null;

    if (activeTab === "arrears_board") {
      if (format === "pdf") {
        const pdfRes = await ReportAPIs.getSummaryExpensesReportPDF(payload);
        const blob = new Blob([pdfRes?.data], { type: "application/pdf" });
        saveAs(
          blob,
          `${REPORT_TABS.find((t) => t.key === activeTab)?.label || "report"}.pdf`,
        );
        return;
      }

      rawExportResponse = await ReportAPIs.getSummaryExpensesReport(payload);
      exportData = rawExportResponse?.data?.body?.by_house ?? [];
    } else if (activeTab === "arrears_resident") {
      const residentId = formValues.house_no;
      if (!residentId) {
        alert("โปรดเลือกบ้านเลขที่ก่อน");
        return;
      }

      if (format === "pdf") {
        const residentSummaryRes =
          await ReportAPIs.getSummaryExpensesReportById(residentId, {
            month: formValues.month,
            year: formValues.year,
          });

        const residentBody = residentSummaryRes?.data?.body ?? {};

        const pdfRes = await ReportAPIs.getSummaryExpensesReportPDFById(
          residentId,
          {
            month: formValues.month,
            year: formValues.year,
          },
        );
        const blob = new Blob([pdfRes?.data], { type: "application/pdf" });

        saveAs(blob, `${buildArrearsResidentFileName(residentBody)}.pdf`);
        return;
      }

      rawExportResponse = await ReportAPIs.getSummaryExpensesReportById(
        residentId,
        // payload,
        {
          month: formValues.month,
          year: formValues.year,
        },
      );

      // For resident, we need to flatten by_year array and month arrays
      const flattenedData: any[] = [];
      (rawExportResponse?.data?.body?.by_year ?? []).forEach((year: any) => {
        (year.months ?? []).forEach((month: any) => {
          flattenedData.push(month);
        });
      });
      exportData = flattenedData;
    } else {
      const res = await ReportAPIs.getReport(projectId, ex_type, payload);
      exportData = res?.data?.body ?? [];
    }

    if (!exportData.length) {
      alert("ไม่มีข้อมูลให้ส่งออก");
      return;
    }

    // if (!data || data.length === 0) {
    //   return alert("ไม่มีข้อมูลให้ส่งออก");
    // }

    let mappedData: any[] = [];

    switch (activeTab) {
      case "arrears":
        mappedData = exportData.map((item: any, index: number) => ({
          index: index + 1,
          house_no: item.resident?.house_no ?? "",
          name: item.resident?.full_name ?? "",
          month: convertMonth(item.month),
          year: item.year,
          amount: Number(item.amount_due),
          vat: Number(item.fine),
          dunning_fee: Number(item.collection_fee),
          total_amount: Number(item.total_due),
        }));
        break;

      case "arrears_board": {
        mappedData = exportData.map((item: any, index: number) => ({
          index: index + 1,
          house_no: item.house_no ?? "",
          full_name: item.full_name ?? "",
          common_fee: Number(item.common_fee || 0),
          fine: Number(item.fine || 0),
          collection_fee: Number(item.collection_fee || 0),
          total: Number(item.total || 0),
        }));

        const boardSummaryTotal = rawExportResponse?.data?.body?.total;

        if (boardSummaryTotal) {
          mappedData.push({
            isSummary: true,
            index: "สรุปยอดรวมค้างชำระ",
            house_no: "",
            full_name: "",
            common_fee: Number(boardSummaryTotal.common_fee || 0),
            fine: Number(boardSummaryTotal.fine || 0),
            collection_fee: Number(boardSummaryTotal.collection_fee || 0),
            total: Number(boardSummaryTotal.total || 0),
          });
        }

        break;
      }

      case "arrears_resident":
        mappedData = exportData.map((item: any, index: number) => ({
          index: index + 1,
          month_name: convertMonth(item.month),
          year: item.year,
          inv_no: item.inv_no ?? "",
          common_fee: Number(item.common_fee || 0),
          fine: Number(item.fine || 0),
          collection_fee: Number(item.collection_fee || 0),
          total: Number(item.total || 0),
        }));
        break;

      case "discount":
        mappedData = exportData.map((item: any, index: number) => {
          const totalAmount = item.total_due;

          let paymentStatus = "-";

          if (item.status_notices === "CANCELLED") {
            paymentStatus = "ลดหนี้";
          } else if (item.status_payments === "PAID") {
            paymentStatus = "ชำระแล้ว";
          } else if (item.status_payments === "NOT_PAY") {
            paymentStatus = "ยังไม่ชำระ";
          }

          return {
            index: index + 1,

            monthTH: item.monthTH,
            resident_house_no: item.resident_house_no,
            resident_full_name: item.resident_full_name,

            fine: Number(item.fine || 0),
            collection_fee: Number(item.collection_fee || 0),

            total_amount: totalAmount,

            // ต้องชื่อเดียวกับ dataIndex
            payment_status: paymentStatus,

            // ต้องชื่อเดียวกับ dataIndex
            note: item.note ?? "-",

            // ต้องชื่อเดียวกับ dataIndex
            created_at: item.created_at
              ? dayjs(item.created_at).format("DD/MM/YY")
              : "-",

            created_by_name: item.created_by_name ?? "-",
          };
        });

        break;

      case "other":
        mappedData = exportData.map((item: any, index: number) => ({
          index: index + 1,
          receipt_no: item.receipt_no ?? "",
          house_no: item.resident?.house_no ?? "",
          full_name: item.resident?.full_name ?? "",
          detail: item.payment_detail?.items?.length
            ? item.payment_detail.items
                .map(
                  (i: any) =>
                    `${i.description} (${i.quantity} หน่วย ${Number(
                      i.unitPrice,
                    ).toLocaleString(
                      "th-TH",
                    )} บาท รวม ${i.quantity * i.unitPrice} บาท)`,
                )
                .join(", ")
            : "",
          total_amount: Number(item.total_amount),
          payment_date: item.payment_date ?? "",
          status: item.status ?? "",
          rejected_reason: item.rejected_reason ?? "",
        }));
        break;

      default:
        mappedData = exportData;
    }

    const columnsForTab =
      activeTab === "arrears_resident"
        ? columnsResidentDetail
        : columnsByTab[activeTab];

    const headers = columnsForTab.map((c: any) => ({
      header: c.title,
      dataKey: c.dataIndex,
    }));

    const reportLabel = currentReportLabel;

    const formatExportNumber = (value: any) => {
      const num = Number(value);

      return Number.isFinite(num)
        ? num.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : (value ?? "");
    };

    // const exportRows = mappedData.map((row: any) => {
    //   const result: any = {};

    //   columnsForTab.forEach((column: any) => {
    //     const title = String(column.title);
    //     const dataIndex = column.dataIndex;

    //     if (!dataIndex) return;

    //     const value = row[dataIndex];

    //     result[title] = column.isAmount
    //       ? formatExportNumber(value)
    //       : (value ?? "");
    //   });

    //   return result;
    // });

    const exportRows = mappedData.map((row: any, rowIndex: number) => {
      const result: any = {};

      columnsForTab.forEach((column: any) => {
        const title = String(column.title);
        const dataIndex = column.dataIndex;

        if (!dataIndex) return;

        const value =
          dataIndex === "index"
            ? row?.isSummary
              ? row.index
              : rowIndex + 1
            : row[dataIndex];

        result[title] = column.isAmount
          ? formatExportNumber(value)
          : (value ?? "");
      });

      return result;
    });

    // 🧩 Export Excel / CSV
    if (format === "excel" || format === "csv") {
      const ws = XLSX.utils.json_to_sheet(exportRows);

      if (format === "csv") {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(["\ufeff", csv], {
          type: "text/csv;charset=utf-8;",
        });

        const csvFileName =
          activeTab === "arrears_resident"
            ? buildArrearsResidentFileName(rawExportResponse?.data?.body)
            : reportLabel;

        saveAs(blob, `${csvFileName}.csv`);
        return;
      }

      const ExcelJSModule = await import("exceljs");
      const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
      const workbook = new ExcelJS.Workbook();

      workbook.creator = "Astar Living";
      workbook.created = new Date();
      workbook.modified = new Date();

      const EXCEL_FONT = "TH Sarabun New";
      const REPORT_COL_COUNT = Math.max(columnsForTab.length, 8);
      const LAST_COL = String.fromCharCode(64 + REPORT_COL_COUNT);
      const HEADER_FILL = "D9EAF7";
      const SUMMARY_FILL = "F8FAFC";
      const projectName =
        me?.project?.name || "นิติบุคคลหมู่บ้านจัดสรร หมู่บ้านการ์เด้นวิว";
      const now = dayjs();
      const buddhistYear = now.year() + 543;
      const reportDate = `ณ วันที่ ${now.format("D MMMM")} ${buddhistYear}`;

      const normalizeHeader = (title: string) =>
        String(title)
          .replace("ค่าเบี้ยปรับ", "ค่าปรับ")
          .replace("ค่าส่วนกลาง (บาท)", "ค่าส่วนกลาง\n(บาท)")
          .replace("ค่าทวงถาม (บาท)", "ค่าทวงถาม\n(บาท)")
          .replace("ยอดที่ต้องชำระ (บาท)", "ยอดที่ต้องชำระ\n(บาท)")
          .replace("ยอดชำระ (บาท)", "ยอดชำระ\n(บาท)")
          .replace("ยอดรวมทั้งหมด (บาท)", "ยอดรวมทั้งหมด\n(บาท)")
          .replace("ชำระแล้ว (บาท)", "ชำระแล้ว\n(บาท)")
          .replace("ค้างชำระ (บาท)", "ค้างชำระ\n(บาท)");

      const isNumericValue = (value: any) => {
        if (value === null || value === undefined || value === "") return false;
        return Number.isFinite(Number(value));
      };

      const toNumber = (value: any) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
      };

      const getColumnLetter = (columnNumber: number) => {
        let temp = columnNumber;
        let letter = "";

        while (temp > 0) {
          const remainder = (temp - 1) % 26;
          letter = String.fromCharCode(65 + remainder) + letter;
          temp = Math.floor((temp - 1) / 26);
        }

        return letter;
      };

      const isLeftAlignedTextColumn = (column: any) => {
        const title = String(column?.title ?? "").trim();
        const dataIndex = String(column?.dataIndex ?? "").trim();

        return (
          title.includes("ชื่อ-นามสกุล") ||
          title.includes("ชื่อผู้") ||
          title.includes("ผู้ออก") ||
          title.includes("ผู้ทำรายการ") ||
          dataIndex === "name" ||
          dataIndex === "full_name" ||
          dataIndex === "resident_full_name" ||
          dataIndex === "user_full_name" ||
          dataIndex === "created_by_name" ||
          dataIndex === "createdUser" ||
          dataIndex.endsWith("_name")
        );
      };

      const getExcelHorizontalAlign = (column: any) => {
        if (isLeftAlignedTextColumn(column)) return "left";
        if (column?.dataIndex === "index") return "center";
        if (column?.isAmount) return "right";

        return "center";
      };
      const applyBaseSheetStyle = (
        worksheet: any,
        colCount = REPORT_COL_COUNT,
      ) => {
        worksheet.properties.defaultRowHeight = 18;
        worksheet.views = [{ showGridLines: false }];

        for (let i = 1; i <= colCount; i += 1) {
          worksheet.getColumn(i).font = { name: EXCEL_FONT, size: 10 };
          worksheet.getColumn(i).alignment = { vertical: "middle" };
        }
      };

      const applyReportTitle = (
        worksheet: any,
        title: string,
        subtitle: string,
      ) => {
        const lastCol = getColumnLetter(REPORT_COL_COUNT);

        worksheet.mergeCells(`A1:${lastCol}1`);
        worksheet.mergeCells(`A2:${lastCol}2`);
        worksheet.mergeCells(`A3:${lastCol}3`);
        worksheet.mergeCells(`A4:${lastCol}4`);

        worksheet.getCell("A1").value = projectName;
        worksheet.getCell("A2").value = title;
        worksheet.getCell("A3").value = subtitle;
        worksheet.getCell("A4").value = reportDate;

        [1, 2].forEach((rowNumber) => {
          const row = worksheet.getRow(rowNumber);
          row.height = rowNumber === 2 ? 18 : 20;
          row.font = { name: EXCEL_FONT, size: 14, bold: true };
          row.alignment = { horizontal: "center", vertical: "middle" };
        });

        [3, 4].forEach((rowNumber) => {
          const row = worksheet.getRow(rowNumber);
          row.font = { name: EXCEL_FONT, size: 11 };
          row.alignment = { horizontal: "center", vertical: "middle" };
        });
      };

      const styleHeaderRow = (row: any) => {
        row.height = 34;
        row.eachCell((cell: any) => {
          cell.font = { name: EXCEL_FONT, size: 10, bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: HEADER_FILL },
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
        });
      };

      const styleBodyRow = (
        row: any,
        amountColumnStart = 5,
        columns: any[] = [],
      ) => {
        row.eachCell((cell: any, colNumber: number) => {
          const column = columns[colNumber - 1];

          cell.font = { name: EXCEL_FONT, size: 10 };
          cell.alignment = {
            horizontal: column
              ? getExcelHorizontalAlign(column)
              : colNumber === 1
                ? "center"
                : colNumber >= amountColumnStart
                  ? "right"
                  : "center",
            vertical: "middle",
            wrapText: true,
          };

          if (isNumericValue(cell.value) && colNumber >= amountColumnStart) {
            cell.value = toNumber(cell.value);
            cell.numFmt = "#,##0.00";
          }
        });
      };

      const styleSummaryRow = (row: any, amountColumnStart = 5) => {
        row.eachCell((cell: any, colNumber: number) => {
          cell.font = { name: EXCEL_FONT, size: 10, bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: SUMMARY_FILL },
          };
          cell.alignment = {
            horizontal: colNumber >= amountColumnStart ? "right" : "left",
            vertical: "middle",
            wrapText: true,
          };

          if (colNumber >= amountColumnStart) {
            cell.numFmt = "#,##0.00";
          }
        });
      };

      const saveWorkbook = async (fileName: string) => {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `${fileName}.xlsx`);
      };

      if (activeTab === "arrears_resident") {
        const body = rawExportResponse?.data?.body ?? {};
        const byYear = body?.by_year ?? [];
        const houseNo = body?.house_no ?? "";
        const fullName = body?.full_name ?? "";

        const worksheet = workbook.addWorksheet("Report");
        const dataWorksheet = workbook.addWorksheet("Data");

        applyBaseSheetStyle(worksheet, 8);
        applyBaseSheetStyle(dataWorksheet, 9);

        worksheet.columns = [
          { key: "index", width: 8 },
          { key: "month", width: 12 },
          { key: "year", width: 10 },
          { key: "inv_no", width: 22 },
          { key: "common_fee", width: 18 },
          { key: "fine", width: 16 },
          { key: "collection_fee", width: 16 },
          { key: "total", width: 18 },
        ];

        applyReportTitle(
          worksheet,
          "รายงานสรุปรายการค้างชำระลูกบ้านต่อหลัง",
          `บ้านเลขที่ ${houseNo || "-"} ${fullName || ""} ปี:ทั้งหมด`,
        );

        worksheet.addRow([]);

        const residentHeaders = [
          "ลำดับ",
          "เดือน",
          "ปี (พ.ศ.)",
          "เลขที่ใบแจ้งหนี้",
          "ค่าส่วนกลาง\n(บาท)",
          "ค่าปรับ (10%)",
          "ค่าทวงถาม\n(บาท)",
          "ยอดที่ต้องชำระ\n(บาท)",
        ];

        dataWorksheet.addRow([
          "บ้านเลขที่",
          "ปี (พ.ศ.)",
          "เดือนที่",
          "เดือน",
          "เลขที่ใบแจ้งหนี้",
          "ค่าส่วนกลาง (บาท)",
          "ค่าปรับ (10%)",
          "ค่าทวงถาม (บาท)",
          "ยอดที่ต้องชำระ (บาท)",
        ]);
        styleHeaderRow(dataWorksheet.getRow(1));

        let dataRowNumber = 2;

        byYear.forEach((yearData: any) => {
          const sectionRowNumber = worksheet.rowCount + 1;
          const sectionRow = worksheet.addRow([
            `รายการค้างชำระ: พ.ศ. ${yearData?.year ?? ""}`,
          ]);
          worksheet.mergeCells(`A${sectionRowNumber}:H${sectionRowNumber}`);
          sectionRow.font = { name: EXCEL_FONT, size: 10, bold: true };
          sectionRow.alignment = { vertical: "middle" };

          const headerRow = worksheet.addRow(residentHeaders);
          styleHeaderRow(headerRow);

          const startDataRow = worksheet.rowCount + 1;

          (yearData?.months ?? []).forEach((month: any, index: number) => {
            const monthName = convertMonth(month?.month);
            const dataRow = worksheet.addRow([
              index + 1,
              monthName,
              month?.year ?? yearData?.year ?? "",
              month?.inv_no ?? "",
              toNumber(month?.common_fee),
              toNumber(month?.fine),
              toNumber(month?.collection_fee),
              toNumber(month?.total),
            ]);

            styleBodyRow(dataRow);

            dataWorksheet.addRow([
              houseNo,
              month?.year ?? yearData?.year ?? "",
              month?.month ?? "",
              monthName,
              month?.inv_no ?? "",
              toNumber(month?.common_fee),
              toNumber(month?.fine),
              toNumber(month?.collection_fee),
              toNumber(month?.total),
            ]);
            styleBodyRow(dataWorksheet.getRow(dataRowNumber), 6);
            dataRowNumber += 1;
          });

          const endDataRow = worksheet.rowCount;
          const summaryRowNumber = worksheet.rowCount + 1;
          const summaryRow = worksheet.addRow([
            `ยอดรวมค้างชำระ: บ้านเลขที่ ${houseNo || "-"} พ.ศ. ${yearData?.year ?? ""}`,
            "",
            "",
            "",
            {
              formula: `SUM(E${startDataRow}:E${endDataRow})`,
              result: toNumber(yearData?.common_fee),
            },
            {
              formula: `SUM(F${startDataRow}:F${endDataRow})`,
              result: toNumber(yearData?.fine),
            },
            {
              formula: `SUM(G${startDataRow}:G${endDataRow})`,
              result: toNumber(yearData?.collection_fee),
            },
            {
              formula: `SUM(H${startDataRow}:H${endDataRow})`,
              result: toNumber(yearData?.total),
            },
          ]);

          worksheet.mergeCells(`A${summaryRowNumber}:D${summaryRowNumber}`);
          styleSummaryRow(summaryRow);
          worksheet.addRow([]);
        });

        const summaryTitleRowNumber = worksheet.rowCount + 1;
        const summaryTitleRow = worksheet.addRow(["สรุปรายการค้างชำระ"]);
        worksheet.mergeCells(
          `A${summaryTitleRowNumber}:H${summaryTitleRowNumber}`,
        );
        summaryTitleRow.font = { name: EXCEL_FONT, size: 10, bold: true };
        summaryTitleRow.alignment = { horizontal: "left", vertical: "middle" };

        const summaryHeaderRow = worksheet.addRow([
          "รายการ",
          "",
          "",
          "",
          "",
          "",
          "",
          "จำนวนเงิน (บาท)",
        ]);
        styleHeaderRow(summaryHeaderRow);

        // const dataLastRow = Math.max(dataRowNumber - 1, 2);
        // const summaryRows = [
        //   ["ยอดรวมค่าส่วนกลาง", `SUM(Data!F2:F${dataLastRow})`],
        //   ["ยอดรวมค่าเบี้ยปรับ", `SUM(Data!G2:G${dataLastRow})`],
        //   ["ยอดรวมค่าทวงถาม", `SUM(Data!H2:H${dataLastRow})`],
        //   ["ยอดรวมค้างชำระทั้งหมด", `SUM(Data!I2:I${dataLastRow})`],
        // ];

        const totalSummary = body?.total ?? {};

        const summaryRows = [
          ["ยอดรวมค่าส่วนกลาง", toNumber(totalSummary?.common_fee)],
          ["ยอดรวมค่าเบี้ยปรับ", toNumber(totalSummary?.fine)],
          ["ยอดรวมค่าทวงถาม", toNumber(totalSummary?.collection_fee)],
          ["ยอดรวมค้างชำระทั้งหมด", toNumber(totalSummary?.total)],
        ];

        // summaryRows.forEach(([label, formula]) => {
        //   const row = worksheet.addRow([
        //     label,
        //     "",
        //     "",
        //     "",
        //     "",
        //     "",
        //     "",
        //     { formula },
        //   ]);
        //   row.getCell(1).font = { name: EXCEL_FONT, size: 10 };
        //   row.getCell(8).font = { name: EXCEL_FONT, size: 10 };
        //   row.getCell(8).alignment = {
        //     horizontal: "right",
        //     vertical: "middle",
        //   };
        //   row.getCell(8).numFmt = "#,##0.00";
        // });

        summaryRows.forEach(([label, amount]) => {
          const row = worksheet.addRow([]);

          const rowNumber = row.number;

          worksheet.mergeCells(`A${rowNumber}:G${rowNumber}`);

          const labelCell = worksheet.getCell(`A${rowNumber}`);
          const amountCell = worksheet.getCell(`H${rowNumber}`);

          labelCell.value = label;
          labelCell.font = {
            name: EXCEL_FONT,
            size: 10,
          };
          labelCell.alignment = {
            horizontal: "left",
            vertical: "middle",
          };

          amountCell.value = toNumber(amount);

          amountCell.font = {
            name: EXCEL_FONT,
            size: 10,
          };
          amountCell.alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          row.getCell(8).numFmt = "#,##0.00";
        });

        dataWorksheet.columns = [
          { width: 14 },
          { width: 12 },
          { width: 10 },
          { width: 12 },
          { width: 22 },
          { width: 18 },
          { width: 16 },
          { width: 16 },
          { width: 18 },
        ];

        worksheet.addRow([]);

        await saveWorkbook(buildArrearsResidentFileName(body));
        return;
      }

      const worksheet = workbook.addWorksheet("Report");
      applyBaseSheetStyle(worksheet, REPORT_COL_COUNT);

      worksheet.columns = columnsForTab.map((column: any) => ({
        key: column.dataIndex,
        width:
          column.dataIndex === "index"
            ? 8
            : isLeftAlignedTextColumn(column)
              ? 28
              : column.isAmount
                ? 18
                : column.width
                  ? Math.min(Math.max(Math.floor(column.width / 8), 12), 28)
                  : 18,
      }));

      const filterYear = formValues?.year || formValues?.date_year;
      const subtitle = filterYear
        ? `ประจำปี พ.ศ. ${Number(filterYear) > 2500 ? filterYear : Number(filterYear) + 543}`
        : "ประจำปี พ.ศ. ทั้งหมด";

      applyReportTitle(worksheet, reportLabel, subtitle);
      worksheet.addRow([]);

      const genericHeaderRow = worksheet.addRow(
        columnsForTab.map((column: any) => normalizeHeader(column.title)),
      );
      styleHeaderRow(genericHeaderRow);

      mappedData.forEach((row: any, rowIndex: number) => {
        const excelRow = worksheet.addRow(
          columnsForTab.map((column: any) => {
            const dataIndex = column.dataIndex;
            const value =
              dataIndex === "index"
                ? row?.isSummary
                  ? row.index
                  : rowIndex + 1
                : row[dataIndex];

            return column.isAmount ? toNumber(value) : (value ?? "");
          }),
        );

        if (activeTab === "arrears_board" && row?.isSummary) {
          const summaryRowNumber = excelRow.number;
          worksheet.mergeCells(`A${summaryRowNumber}:C${summaryRowNumber}`);
          excelRow.getCell(1).value = "สรุปยอดรวมค้างชำระ";
          styleSummaryRow(excelRow, 4);
          return;
        }

        excelRow.eachCell((cell: any, colNumber: number) => {
          const column = columnsForTab[colNumber - 1];
          cell.font = { name: EXCEL_FONT, size: 10 };
          cell.alignment = {
            horizontal: getExcelHorizontalAlign(column),
            vertical: "middle",
            wrapText: true,
          };

          if (column?.isAmount) {
            cell.numFmt = "#,##0.00";
          }
        });
      });

      if (activeTab === "arrears_board") {
        const normalRows = mappedData.filter((row: any) => !row?.isSummary);
        const apiSummaryTotal = rawExportResponse?.data?.body?.total;

        const boardSummaryTotal = apiSummaryTotal ?? {
          common_fee: normalRows.reduce(
            (sum: number, row: any) => sum + Number(row.common_fee || 0),
            0,
          ),
          fine: normalRows.reduce(
            (sum: number, row: any) => sum + Number(row.fine || 0),
            0,
          ),
          collection_fee: normalRows.reduce(
            (sum: number, row: any) => sum + Number(row.collection_fee || 0),
            0,
          ),
          total: normalRows.reduce(
            (sum: number, row: any) => sum + Number(row.total || 0),
            0,
          ),
        };

        worksheet.addRow([]);

        // const summaryAmountColumn = REPORT_COL_COUNT;
        // const summaryAmountColumnLetter = getColumnLetter(summaryAmountColumn);
        // const summaryLabelEndColumnLetter = getColumnLetter(
        //   summaryAmountColumn - 1,
        // );
        const summaryColCount = columnsForTab.length;
        const summaryAmountColumn = summaryColCount;
        const summaryAmountColumnLetter = getColumnLetter(summaryAmountColumn);
        const summaryLabelEndColumnLetter = getColumnLetter(
          summaryAmountColumn - 1,
        );

        worksheet.getColumn(summaryAmountColumn).width = 18;

        const summaryTitleRowNumber = worksheet.rowCount + 1;
        const summaryTitleRow = worksheet.addRow(["สรุปรายการค้างชำระ"]);
        worksheet.mergeCells(
          `A${summaryTitleRowNumber}:${summaryAmountColumnLetter}${summaryTitleRowNumber}`,
        );
        summaryTitleRow.font = { name: EXCEL_FONT, size: 10, bold: true };
        summaryTitleRow.alignment = {
          horizontal: "left",
          vertical: "middle",
        };

        const summaryHeaderValues = Array.from(
          { length: summaryColCount },
          () => "",
        );
        summaryHeaderValues[0] = "รายการ";
        summaryHeaderValues[summaryAmountColumn - 1] = "จำนวนเงิน (บาท)";

        const summaryHeaderRow = worksheet.addRow(summaryHeaderValues);
        worksheet.mergeCells(
          `A${summaryHeaderRow.number}:${summaryLabelEndColumnLetter}${summaryHeaderRow.number}`,
        );
        styleHeaderRow(summaryHeaderRow);

        const summaryRows = [
          ["ยอดรวมค่าส่วนกลาง", Number(boardSummaryTotal.common_fee || 0)],
          ["ยอดรวมค่าเบี้ยปรับ", Number(boardSummaryTotal.fine || 0)],
          ["ยอดรวมค่าทวงถาม", Number(boardSummaryTotal.collection_fee || 0)],
          ["ยอดรวมค้างชำระทั้งหมด", Number(boardSummaryTotal.total || 0)],
        ];

        summaryRows.forEach(([label, amount]) => {
          // const rowValues = Array.from({ length: REPORT_COL_COUNT }, () => "");
          const rowValues: (string | number)[] = Array.from(
            { length: summaryColCount },
            () => "",
          );
          rowValues[0] = label;
          rowValues[summaryAmountColumn - 1] = amount;

          const row = worksheet.addRow(rowValues);
          worksheet.mergeCells(
            `A${row.number}:${summaryLabelEndColumnLetter}${row.number}`,
          );

          row.getCell(1).font = { name: EXCEL_FONT, size: 10 };
          row.getCell(1).alignment = {
            horizontal: "left",
            vertical: "middle",
          };

          row.getCell(summaryAmountColumn).font = {
            name: EXCEL_FONT,
            size: 10,
          };
          row.getCell(summaryAmountColumn).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          row.getCell(summaryAmountColumn).numFmt = "#,##0.00";
        });
      }

      await saveWorkbook(reportLabel);
      return;
    }

    // 🧩 Export PDF (ภาษาไทย)
    if (format === "pdf") {
      const now = dayjs();
      const buddhistYear = now.year() + 543;
      const monthTHFull = now.format("MMMM"); // ธันวาคม
      const day = now.format("D");
      const reportLabel =
        REPORT_TABS.find((t) => t.key === activeTab)?.label || "รายงาน";

      const headerReportYear = `${reportLabel} ประจำปี พ.ศ. ${buddhistYear}`;
      const headerReportDate = `ณ วันที่ ${day} ${monthTHFull} ${buddhistYear}`;

      const printDate = `${now.format(
        "DD MMM",
      )} ${buddhistYear} เวลา ${now.format("HH:mm")} น.`;

      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
        putOnlyUsedFonts: true,
      });

      doc.addFileToVFS("THSarabunNew.ttf", THSarabunNew);
      doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
      doc.setFont("THSarabunNew");
      doc.setFontSize(14);

      // 👉 ตัวแปร placeholder สำหรับจำนวนหน้าทั้งหมด
      const totalPagesExp = "{total_pages_count_string}";

      const numbered = mappedData.map((row: any, i: number) => ({
        ...row,
        index: i + 1,
      }));

      // ฟังก์ชัน format ตัวเลขให้มีทศนิยม 2 จุดเหมือน UI
      const formatNumber = (v: any) => {
        const num = Number(v);
        return Number.isFinite(num)
          ? num.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : (v ?? "");
      };

      // สร้างหัวและเนื้อหาให้ autoTable
      const head = [columnsForTab.map((c: any) => String(c.title))];

      const body = numbered.map((row: any) =>
        columnsForTab.map((c: any) => {
          const val = row[c.dataIndex];

          // ถ้าเป็นคอลัมน์ตัวเลข แต่ไม่ใช่ลำดับ
          if (c.isAmount) return formatNumber(val);

          // ถ้าเป็น string/อื่นๆ
          return val !== undefined && val !== null ? String(val) : "";
        }),
      );

      autoTable(doc, {
        head,
        body,
        styles: {
          font: "THSarabunNew",
          fontStyle: "normal",
          fontSize: 12,
          lineColor: [220, 220, 220],
          textColor: [116, 116, 116],
        },
        headStyles: {
          fillColor: [240, 249, 255],
          textColor: [0, 84, 165],
          cellPadding: { top: 8, bottom: 8 },
        },
        alternateRowStyles: { fillColor: [245, 247, 249] },
        margin: { top: 100, left: 10, right: 10, bottom: 60 },

        // ✅ Header + Footer
        didDrawPage: (dataArg) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const marginRight = dataArg.settings.margin.right || 40;
          const marginLeft = dataArg.settings.margin.left || 40;
          const currentPage = dataArg.pageNumber;
          const totalPagesExp = "{total_pages_count_string}";
          // const printDate = dayjs().format("DD MMM YYYY เวลา HH:mm น.");

          // 🔹 Header (จัดกลาง)
          doc.setFont("THSarabunNew");
          doc.setFontSize(16);
          doc.text(
            `${
              me?.project?.name || "นิติบุคคลหมู่บ้านจัดสรร หมู่บ้านการ์เด้นวิว"
            }`,
            pageWidth / 2,
            40,
            {
              align: "center",
            },
          );
          doc.setFontSize(14);

          const now = dayjs();
          const buddhistYear = now.year() + 543;
          const monthTH = now.format("MMMM"); // เช่น ธันวาคม
          const day = now.format("D");

          doc.text(headerReportYear, pageWidth / 2, 60, { align: "center" });
          doc.text(headerReportDate, pageWidth / 2, 80, { align: "center" });

          // doc.text(
          //   `${reportLabel} ประจำปี พ.ศ. ${buddhistYear}`,
          //   pageWidth / 2,
          //   60,
          //   {
          //     align: "center",
          //   }
          // );
          // doc.text(
          //   `ณ วันที่ ${day} ${monthTH} ${buddhistYear}`,
          //   pageWidth / 2,
          //   80,
          //   {
          //     align: "center",
          //   }
          // );

          // 🔹 Footer (ชิดขวาจริง)
          doc.setFontSize(12);
          doc.setTextColor(100);

          const footerText1 = `หน้า ${currentPage}/${totalPagesExp}`;
          const footerText2 = `วันที่พิมพ์รายงาน ${printDate}`;

          const textWidth1 = doc.getTextWidth(footerText1);

          const xRightEdge = pageWidth - (marginRight + 30);

          doc.text(footerText1, xRightEdge, pageHeight - 40);
          doc.text(footerText2, xRightEdge - textWidth1, pageHeight - 25);
        },
      });

      // ✅ หลังสร้างตารางเสร็จ ให้แทนค่าจำนวนหน้าจริง
      if (typeof (doc as any).putTotalPages === "function") {
        (doc as any).putTotalPages(totalPagesExp);
      }

      doc.save(`${reportLabel}.pdf`);
    }
  };

  //   const year = useWatch({ control, name: "year" });
  //   const month = useWatch({ control, name: "month" });
  //   const house_no = useWatch({ control, name: "house_no" });
  const year = useWatch<any>({ control, name: "year" });
  const month = useWatch<any>({ control, name: "month" });
  const house_no = useWatch<any>({ control, name: "house_no" });

  const allHouseNumbers = Array.from(
    new Set(
      Object.values(DATA_BY_TAB)
        .flatMap((arr: any) => arr.map((d: any) => d.house_no))
        .filter(Boolean), // ✅ กรองค่า falsy ทั้งหมด เช่น undefined, null, 0, ""
    ),
  );

  const onSearch = () => {
    const values = getValues();

    if (values.year_range?.length === 2) {
      setValue("year_start", values.year_range[0]);
      setValue("year_end", values.year_range[1]);
    } else {
      setValue("year_start", null);
      setValue("year_end", null);
    }

    delete values.year_range;

    setCurrentPage(1);
    fetchData(getValues());
  };

  const resetSearch = () => {
    reset({
      year: null,
      month: null,
      house_no: null,
      date_year: null,
      method: null,
      payment_date_range: null,
      year_range: null,
      invoiced_by: null,
      year_start: null,
      year_end: null,
    });

    setCurrentPage(1);

    fetchData(); // โหลดใหม่แบบไม่มี filter
  };

  // 🔹 เพิ่ม Columns แยกตามรายงาน
  const columnsArrears: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },

    {
      title: "บ้านเลขที่",
      dataIndex: "house_no",
      width: 120,
      sorter: true,
    },
    { title: "ชื่อ-นามสกุล", dataIndex: "name" },
    { title: "เดือน", dataIndex: "month", width: 120, sorter: true },
    { title: "ปี (พ.ศ.)", dataIndex: "year", width: 120, sorter: true },
    {
      title: "ค่าส่วนกลาง (บาท)",
      dataIndex: "amount",
      align: "right",
      isAmount: true,
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
      title: "ค่าเบี้ยปรับ (10%)",
      dataIndex: "vat",
      align: "right",
      isAmount: true,
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
      title: "ค่าทวงถาม",
      dataIndex: "dunning_fee",
      align: "right",
      isAmount: true,
      sorter: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    // {
    //   title: "รวมทั้งหมด (บาท)",
    //   dataIndex: "total_amount",
    //   align: "right",
    //   isAmount: true,
    //   sorter: true,
    //   render: (value: any) => {
    //     const num = Number(value) || 0;
    //     return num.toLocaleString("th-TH", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     });
    //   },
    // },
  ];

  const columnsPayment: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "เลขที่ใบเสร็จ",
      width: 150,
      dataIndex: "receipt_no",
      sorter: true,
    },
    { title: "บ้านเลขที่", dataIndex: "house_no", sorter: true },
    { title: "ชื่อ-นามสกุล", dataIndex: "full_name" },
    {
      title: "ยอดชำระ (บาท)",
      dataIndex: "total_amount",
      align: "right",
      isAmount: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      sorter: true,
    },
    { title: "วันที่ชำระ", dataIndex: "issue_date" },
    {
      title: "วิธีการชำระเงิน",
      dataIndex: "payment_method_name",
    },
    { title: "ผู้ออกใบเสร็จ", dataIndex: "user_full_name" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: any, record: any) => (
        <ReceiptStatusTag
          rejectedReason={record?.rejected_reason}
          tooltip={false}
        />
      ),
    },
    { title: "หมายเหตุ ", dataIndex: "rejected_reason" },
  ];

  const columnsSummaryExpenses: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "house_no",
      width: 120,
      sorter: true,
    },
    { title: "ชื่อ-นามสกุล", dataIndex: "full_name" },
    {
      title: "ค่าส่วนกลาง (บาท)",
      dataIndex: "common_fee",
      align: "right",
      isAmount: true,
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
      title: "ค่าเบี้ยปรับ (10%)",
      dataIndex: "fine",
      align: "right",
      isAmount: true,
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
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "collection_fee",
      align: "right",
      isAmount: true,
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
      title: "รวมทั้งหมด (บาท)",
      dataIndex: "total",
      align: "right",
      isAmount: true,
      sorter: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
  ];

  const columnsOther: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "เลขที่ใบเสร็จ",
      width: 150,
      dataIndex: "receipt_no",
      sorter: true,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "house_no",
      sorter: true,
      width: 100,
      render: (_: any, record: any) => record?.resident?.house_no ?? "",
    },

    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "full_name",
      width: 200,
      render: (_: any, record: any) => record?.resident?.full_name ?? "",
    },
    {
      title: "รายละเอียด",
      dataIndex: "detail",
      render: (_: any, record: any) =>
        record?.payment_detail?.items?.length
          ? record.payment_detail.items
              .map(
                (i: any) =>
                  `${i.description} (${i.quantity} หน่วย ${Number(i.unitPrice).toLocaleString("th-TH")} บาท รวม ${i.quantity * i.unitPrice} บาท)`,
              )
              .join(", ")
          : "-",
    },
    {
      title: "ยอดชำระ (บาท)",
      dataIndex: "total_amount",
      align: "right",
      width: 150,
      isAmount: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      sorter: true,
    },
    { title: "วันที่ชำระ", dataIndex: "issue_date", width: 120 },
    // {
    //   title: "วิธีการชำระเงิน",
    //   dataIndex: "payment_method_name",
    // },
    // { title: "ผู้ออกใบเสร็จ", dataIndex: "user_full_name" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: any, record: any) => (
        <ReceiptStatusTag
          rejectedReason={record?.rejected_reason}
          tooltip={false}
        />
      ),
    },
    { title: "หมายเหตุ ", dataIndex: "rejected_reason" },
  ];

  const columnsUsage: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    { title: "เดือนและปี", dataIndex: "monthTH", sorter: true },
    {
      title: "จำนวนใบแจ้งหนี้",
      dataIndex: "countPm",
      align: "right",
      width: 150,
      sorter: true,
    },
    {
      title: "ผู้ออกใบแจ้งหนี้",
      dataIndex: "createdUser",
      align: "right",
      sorter: true,
    },
    {
      title: "ยอดรวมทั้งหมด (บาท)",
      dataIndex: "total",
      align: "right",
      isAmount: true,
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
      title: "ชำระแล้ว (บาท)",
      dataIndex: "totalPaid",
      align: "right",
      isAmount: true,
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
      title: "ค้างชำระ (บาท)",
      dataIndex: "totalNotPaid",
      align: "right",
      isAmount: true,
      sorter: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
  ];

  // const columnsDiscount: any = [
  //   {
  //     title: "ลำดับ",
  //     dataIndex: "index",
  //     key: "index",
  //     width: 80,
  //     align: "center",
  //     render: (_: any, __: any, index: number) =>
  //       (currentPage - 1) * pageSize + index + 1,
  //   },
  //   {
  //     title: "เดือนและปี",
  //     dataIndex: "monthTH",
  //     sorter: true,
  //   },
  //   {
  //     title: "บ้านเลขที่",
  //     dataIndex: "resident_house_no",
  //     sorter: true,
  //   },
  //   {
  //     title: "ชื่อ-นามสกุล",
  //     dataIndex: "resident_full_name",
  //     sorter: true,
  //   },
  //   {
  //     title: "ค่าเบี้ยปรับ (10%)",
  //     dataIndex: "fine",
  //     align: "right",
  //     isAmount: true,
  //     sorter: true,
  //     render: (value: any) => {
  //       const num = Number(value) || 0;
  //       return num.toLocaleString("th-TH", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       });
  //     },
  //   },
  //   {
  //     title: "ค่าทวงถาม (บาท)",
  //     dataIndex: "collection_fee",
  //     align: "right",
  //     isAmount: true,
  //     sorter: true,
  //     render: (value: any) => {
  //       const num = Number(value) || 0;
  //       return num.toLocaleString("th-TH", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       });
  //     },
  //   },
  //   {
  //     title: "รวมทั้งหมด (บาท)",
  //     dataIndex: "total_amount",
  //     key: "total_amount",
  //     align: "right",
  //     isAmount: true,
  //     sorter: true,
  //     render: (_: any, record: any) => {
  //       const fine = Number(record.fine) || 0;
  //       const collection_fee = Number(record.collection_fee) || 0;

  //       const total = fine + collection_fee;

  //       return total.toLocaleString("th-TH", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       });
  //     },
  //   },
  // ];

  const columnsDiscount: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "เดือนและปี",
      dataIndex: "monthTH",
      sorter: true,
    },
    {
      title: "บ้านเลขที่",
      dataIndex: "resident_house_no",
      sorter: true,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "resident_full_name",
      sorter: true,
    },
    {
      title: "ค่าเบี้ยปรับ (10%)",
      dataIndex: "fine",
      align: "right",
      isAmount: true,
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
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "collection_fee",
      align: "right",
      isAmount: true,
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
      title: "รวมทั้งหมด (บาท)",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      isAmount: true,
      sorter: true,
      render: (_: any, record: any) => {
        const fine = Number(record.fine) || 0;
        const collection_fee = Number(record.collection_fee) || 0;

        let total = record?.total_due || 0;

        return total.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },

    // เพิ่มต่อท้ายตรงนี้
    {
      title: "สถานะการชำระ",
      dataIndex: "payment_status",
      key: "payment_status",
      align: "center",
      sorter: true,
      render: (_: any, record: any) => {
        const statusPayment = record?.status_payments;
        const statusNotice = record?.status_notices;

        // ถ้า CANCELLED ให้แสดง ลดหนี้ ก่อนเสมอ
        if (statusNotice === "CANCELLED") {
          return <div className="">ลดหนี้</div>;
        }

        // เช็คสถานะการชำระ
        if (statusPayment === "PAID") {
          return <div className="text-[#74BA3D]">ชำระแล้ว</div>;
        }

        if (statusPayment === "NOT_PAY") {
          return <div className="text-[#EA3D3D]">ยังไม่ชำระ</div>;
        }

        return "-";
      },
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      sorter: true,
      render: (value: string) => value || "-",
    },
    {
      title: "วันที่ทำรายการ",
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
      render: (value: string) => {
        if (!value) return "-";

        return dayjs(value).format("DD/MM/YY");
      },
    },
    {
      title: "ผู้ทำรายการ",
      dataIndex: "created_by_name",
      key: "created_by_name",
      sorter: true,
      render: (value: string) => value || "-",
    },
  ];

  const columnsResidentDetail: any = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (_: any, record: any, index: number) => {
        if (record?.isSummary) {
          return <span className="font-semibold">รวม</span>;
        }

        return index + 1;
      },
    },
    { title: "เดือน", dataIndex: "month_name", width: 80, sorter: true },
    { title: "ปี (พ.ศ.)", dataIndex: "year", width: 80, sorter: true },
    {
      title: "เลขที่ใบแจ้งหนี้",
      dataIndex: "inv_no",
      width: 130,
      sorter: true,
    },
    {
      title: "ค่าส่วนกลาง (บาท)",
      dataIndex: "common_fee",
      align: "right",
      isAmount: true,
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
      title: "ค่าเบี้ยปรับ (10%)",
      dataIndex: "fine",
      align: "right",
      isAmount: true,
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
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "collection_fee",
      align: "right",
      isAmount: true,
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
      title: "ยอดที่ต้องชำระ (บาท)",
      dataIndex: "total",
      align: "right",
      isAmount: true,
      sorter: true,
      render: (value: any) => {
        const num = Number(value) || 0;
        return num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
  ];

  const columnsByTab: Record<string, any> = {
    arrears: columnsArrears,
    payment: columnsPayment,
    other: columnsOther,
    usage: columnsUsage,
    discount: columnsDiscount,
    arrears_board: columnsSummaryExpenses,
    arrears_resident: columnsSummaryExpenses,
  };

  // Component for resident detail with collapsible years
  // const ResidentDetailDisplay = () => {
  //   if (!residentData) {
  //     return (
  //       <div className="flex justify-center items-center py-12">
  //         <Empty
  //           description="โปรดเลือกบ้านเลขที่ก่อน"
  //           image={Empty.PRESENTED_IMAGE_SIMPLE}
  //         />
  //       </div>
  //     );
  //   }

  //   const { by_year = [], house_no, full_name } = residentData;

  //   if (!by_year.length) {
  //     return (
  //       <div className="flex justify-center items-center py-12">
  //         <Empty description="ไม่มีข้อมูล" />
  //       </div>
  //     );
  //   }

  //   const defaultActiveKeys = by_year.map((y: any) => y.year.toString());

  //   return (
  //     <div className="space-y-6">
  //       <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
  //         <p className="text-sm">
  //           <span className="font-semibold">บ้านเลขที่:</span> {house_no} |{" "}
  //           <span className="font-semibold">ชื่อ:</span> {full_name}
  //         </p>
  //       </div>
  //       <Collapse defaultActiveKey={defaultActiveKeys}>
  //         {by_year.map((yearData: any) => {
  //           const yearMonths = (yearData.months || []).map(
  //             (m: any, mIdx: number) => ({
  //               index: mIdx,
  //               month_name: convertMonth(m.month),
  //               year: m.year,
  //               inv_no: m.inv_no,
  //               common_fee: Number(m.common_fee || 0),
  //               fine: Number(m.fine || 0),
  //               collection_fee: Number(m.collection_fee || 0),
  //               total: Number(m.total || 0),
  //             }),
  //           );

  //           return (
  //             <Collapse.Panel
  //               key={yearData.year.toString()}
  //               header={`ปี ${yearData.year} (${yearData.month_count} เดือน) - รวม ${Number(
  //                 yearData.total || 0,
  //               ).toLocaleString("th-TH", {
  //                 minimumFractionDigits: 2,
  //                 maximumFractionDigits: 2,
  //               })} บาท`}
  //             >
  //               <Table
  //                 dataSource={yearMonths}
  //                 columns={columnsResidentDetail}
  //                 pagination={false}
  //                 size="middle"
  //                 rowKey="index"
  //                 className="custom-table"
  //               />
  //             </Collapse.Panel>
  //           );
  //         })}
  //       </Collapse>
  //     </div>
  //   );
  // };

  const ResidentDetailDisplay = () => {
    if (!residentData) {
      return (
        <div className="flex justify-center items-center py-12">
          <Empty
            description="โปรดเลือกบ้านเลขที่ก่อน"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    const { by_year = [], house_no, full_name } = residentData;

    if (!by_year.length) {
      return (
        <div className="flex justify-center items-center py-12">
          <Empty description="ไม่มีข้อมูล" />
        </div>
      );
    }

    const defaultActiveKeys = by_year.map((y: any) => y.year.toString());

    const formatAmount = (value: any) =>
      Number(value || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return (
      <div className="space-y-3">
        <Collapse
          ghost
          bordered={false}
          defaultActiveKey={defaultActiveKeys}
          expandIconPosition="end"
          className="resident-year-collapse"
          expandIcon={({ isActive }) =>
            isActive ? (
              <UpOutlined className="text-[#4D4C4C]" />
            ) : (
              <DownOutlined className="text-[#4D4C4C]" />
            )
          }
        >
          {by_year.map((yearData: any) => {
            const yearMonths = (yearData.months || []).map(
              (m: any, mIdx: number) => ({
                key: `month-${yearData.year}-${mIdx}`,
                index: mIdx,
                month_name: convertMonth(m.month),
                year: m.year,
                inv_no: m.inv_no,
                common_fee: Number(m.common_fee || 0),
                fine: Number(m.fine || 0),
                collection_fee: Number(m.collection_fee || 0),
                total: Number(m.total || 0),
              }),
            );

            const tableRows = [
              ...yearMonths,
              {
                key: `summary-${yearData.year}`,
                isSummary: true,
                index: "รวม",
                month_name: "",
                year: "",
                inv_no: "",
                common_fee: Number(yearData.common_fee || 0),
                fine: Number(yearData.fine || 0),
                collection_fee: Number(yearData.collection_fee || 0),
                total: Number(yearData.total || 0),
              },
            ];

            return (
              <Collapse.Panel
                key={yearData.year.toString()}
                header={`รายงานค้างชำระ พ.ศ. ${yearData.year}`}
              >
                <Table
                  dataSource={tableRows}
                  columns={columnsResidentDetail}
                  pagination={false}
                  size="middle"
                  rowKey="key"
                  className="custom-table"
                  rowClassName={(record: any) =>
                    record?.isSummary ? "resident-summary-row" : ""
                  }
                />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </div>
    );
  };

  return (
    <div className="p-6  rounded-lg shadow-sm">
      {/* 🔹 Main Container (Center Align ทุกอย่าง) */}
      <div className="flex flex-col items-center justify-center w-full mb-8">
        <div style={{ width: "100%", maxWidth: 960 }}>
          {/* 🔹 Tabs */}

          <SearchBar
            houseOptions={houseOptions}
            activeTab={activeTab}
            control={control}
            setValue={setValue}
            handleSubmit={handleSubmit}
            reset={reset}
            onSearch={onSearch}
            onReset={resetSearch}
            onExport={handleExport}
            allHouseNumbers={allHouseNumbers}
            months={months}
            // onTabChange={(key) => setActiveTab(key as keyof typeof DATA_BY_TAB)}
            onTabChange={(key) =>
              handleTabChange(key as keyof typeof DATA_BY_TAB)
            }
            reportTabs={REPORT_TABS}
          />
        </div>
      </div>

      {/* Table / Content */}
      <div className="font-bold mt-4  mb-2">
        {REPORT_TABS.find((t) => t.key === activeTab)?.label}
      </div>

      {activeTab === "arrears_resident" ? (
        <ResidentDetailDisplay />
      ) : (
        <>
          <Table
            dataSource={data.slice((page - 1) * pageSize, page * pageSize)}
            columns={columnsByTab[activeTab]}
            pagination={false}
            size="middle"
            className="custom-table"
            onChange={(_, __, sorter: any) => {
              if (!sorter?.order) {
                setSorter({});
                setCurrentPage(1);
                return;
              }

              let backendField: string;

              switch (sorter.field) {
                case "house_no":
                  backendField = "resident_id";
                  break;

                case "amount":
                  backendField = "amount_due";
                  break;

                case "vat":
                  backendField = "fine";
                  break;

                case "dunning_fee":
                  backendField = "collection_fee";
                  break;

                case "total_amount":
                  if (activeTab === "arrears") {
                    backendField = "total_due";
                  } else {
                    backendField = "total_amount";
                  }
                  break;

                default:
                  backendField = sorter.field;
                  break;
              }

              setSorter({
                field: backendField,
                order: sorter.order === "ascend" ? "ASC" : "DESC",
              });

              setCurrentPage(1);
            }}
          />

          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={pageInfo?.total || 0}
              pageSize={pageSize}
              showSizeChanger={false}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}

      {(activeTab === "arrears_board" || activeTab === "arrears_resident") &&
        summaryTotals && (
          <div
            className="p-6 rounded-xl border border-[#87D2F7] bg-white shadow-sm mt-6"
            style={{ maxWidth: "35%" }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center border-gray-100">
                <div className="text-sm text-gray-600">ยอดรวมค่าส่วนกลาง</div>
                <div className="  text-gray-800">
                  {Number(summaryTotals.common_fee || 0).toLocaleString(
                    "th-TH",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center  border-gray-100">
                <div className="text-sm text-gray-600">ยอดรวมค่าเบี้ยปรับ</div>
                <div className="  text-gray-800">
                  {Number(summaryTotals.fine || 0).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center  border-gray-100">
                <div className="text-sm text-gray-600">ยอดรวมค่าทวงถาม</div>
                <div className="  text-gray-800">
                  {Number(summaryTotals.collection_fee || 0).toLocaleString(
                    "th-TH",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center ">
                <div className="text-base font-semibold text-[#747474]">
                  ยอดรวมค้างชำระทั้งหมด
                </div>
                <div className="text-xl font-bold text-[#4D4C4C]">
                  {Number(summaryTotals.total || 0).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

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
      `}</style>
    </div>
  );
}
