import { Input, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

interface SearchBarProps {
  searchText: string;
  setSearchText: (v: string) => void;
  projectFilter?: string;
  setProjectFilter: (v?: string) => void;
  transactionFilter?: string;
  setTransactionFilter: (v?: string) => void;
  dateRange: [any, any] | null;
  setDateRange: (v: [any, any] | null) => void;
  setCurrentPage: (v: number) => void;
}

export default function SearchBar({
  searchText,
  setSearchText,
  projectFilter,
  setProjectFilter,
  transactionFilter,
  setTransactionFilter,
  dateRange,
  setDateRange,
  setCurrentPage,
}: SearchBarProps) {
  const projectOptions = [
    { label: "หมู่บ้านการ์เด้นวิว", value: "หมู่บ้านการ์เด้นวิว" },
    { label: "หมู่บ้านการ์เด้นวิว 2", value: "หมู่บ้านการ์เด้นวิว 2" },
  ];
  const transactionOptions = [
    { label: "สร้างใบเสร็จรับเงิน", value: "สร้างใบเสร็จรับเงิน" },
    { label: "สร้างใบแจ้งหนี้", value: "สร้างใบแจ้งหนี้" },
    { label: "แก้ไขข้อมูลสมาชิก", value: "แก้ไขข้อมูลสมาชิก" },
  ];

  return (
    <div
      className="flex flex-col gap-3 mb-4"
      style={{ maxWidth: "1250px", margin: "0 auto" }} // ✅ กลางหน้าจอ + ขอบด้านข้างเล็กน้อย
    >
      {/* 🔹 แถวบน */}
      <div className="flex flex-wrap gap-6 items-end justify-center">
        {/* โครงการ */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            โครงการ
          </label>
          <Select
            className="custom-rounded-select"
            placeholder="เลือกโครงการ"
            allowClear
            value={projectFilter}
            onChange={(value) => {
              setProjectFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 400, height: 40 }}
            options={projectOptions}
          />
        </div>

        {/* รายการ */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            รายการ
          </label>
          <Select
            className="custom-rounded-select"
            placeholder="เลือกรายการ"
            allowClear
            value={transactionFilter}
            onChange={(value) => {
              setTransactionFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 400, height: 40 }}
            options={transactionOptions}
          />
        </div>

        {/* วันที่ */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            วันที่
          </label>
          <RangePicker
            className="custom-rounded-select"
            format="DD/MM/YYYY"
            value={dateRange}
            onChange={(value) => {
              setDateRange(value as any);
              setCurrentPage(1);
            }}
            style={{ width: 400, height: 40, borderRadius: 20 }}
          />
        </div>
      </div>

      {/* 🔹 แถวล่าง */}
      <div className="flex flex-wrap justify-center">
        <Input
          placeholder="ค้นหาผู้ใช้งาน"
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: 1250, // ✅ 400 * 3 + ช่องว่างเล็กน้อย
            height: 40,
            borderRadius: 20,
            marginBottom: 20,
          }}
        />
      </div>
    </div>
  );
}
