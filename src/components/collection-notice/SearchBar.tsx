import { Input, DatePicker, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AiOutlineDownload } from "react-icons/ai";
import { FaFile, FaRegFile } from "react-icons/fa6";
const { RangePicker } = DatePicker;
import moment from "moment";
import "moment/locale/th";
import { ThaiDatePicker } from "../../utils/ThaiDatePicker";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd
import { useState } from "react";

interface SearchBarProps {
  draftFilters: {
    house_no?: string;
    status?: string;
    year?: number;
    month?: number;
  };
  setDraftFilters: React.Dispatch<React.SetStateAction<any>>;

  houseOptions: {
    label: string;
    value: string | number;
  }[];

  selectedIds: number[];
  onPrint: () => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchBar({
  draftFilters,
  setDraftFilters,
  onSearch,
  onReset,
  selectedIds,
  onPrint,
  houseOptions,
}: SearchBarProps) {
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

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex justify-end items-center mb-4 gap-3">
        <div className="flex gap-3">
          <Button
            type="primary"
            disabled={selectedIds.length === 0}
            onClick={onPrint}
            style={{
              height: 42,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                selectedIds?.length === 0 ? "#d9d9d9" : "#74BA3D",
              borderColor: selectedIds?.length === 0 ? "#d9d9d9" : "#74BA3D",
              color: selectedIds?.length === 0 ? "#888" : "#fff",
              padding: "0 20px",
            }}
          >
            พิมพ์ใบทวงถาม
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center mb-4 gap-3">
        <Select
          allowClear
          showSearch
          placeholder="เลือกบ้านเลขที่"
          optionFilterProp="label"
          value={draftFilters.house_no}
          options={houseOptions}
          onChange={(val) =>
            setDraftFilters((prev: any) => ({
              ...prev,
              house_no: val || undefined,
            }))
          }
          style={{ width: 500, height: 38 }}
          className="custom-rounded-select"
        />

        <Select
          placeholder="สถานะ"
          allowClear
          value={draftFilters.status}
          className="custom-rounded-select"
          onChange={(v) =>
            setDraftFilters((prev: any) => ({
              ...prev,
              status: v || undefined,
            }))
          }
          style={{ width: 500, height: 38 }}
          options={[
            { label: "ยังไม่ชำระ", value: "PENDING" },
            { label: "ชำระเงินแล้ว", value: "PAID" },
          ]}
        />
      </div>
      <div className="flex justify-center items-center mb-4 gap-3">
        <ThaiDatePicker
          picker="year"
          locale={th_TH}
          value={
            draftFilters.year ? moment().year(draftFilters.year - 543) : null
          }
          onChange={(v) =>
            setDraftFilters((prev: any) => ({
              ...prev,
              year: v ? v.year() + 543 : undefined,
            }))
          }
          format={(v) => (v ? String(v.year() + 543) : "")}
          style={{ width: 500, height: 38, borderRadius: 20 }}
          className="custom-rounded-select"
        />

        <Select
          placeholder="เลือกเดือน"
          allowClear
          value={draftFilters.month}
          className="custom-rounded-select"
          onChange={(v) =>
            setDraftFilters((prev: any) => ({
              ...prev,
              month: v ? Number(v) : undefined,
            }))
          }
          style={{ width: 500, height: 38 }}
        >
          {months.map((m, i) => (
            <Select.Option key={i + 1} value={i + 1}>
              {m}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={onReset}
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
        >
          ล้างข้อมูล
        </Button>

        <Button
          type="primary"
          onClick={onSearch}
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
        >
          ค้นหา
        </Button>
      </div>
    </div>
  );
}
