import { Button, Input, Pagination, Table, DatePicker, Select } from "antd";
import { useState, useMemo, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { HiOutlineInbox } from "react-icons/hi2";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import SearchBar from "./Searchbar";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function SystemLogsContent() {
  const [searchText, setSearchText] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [transactionFilter, setTransactionFilter] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const pageSize = 10;

  // ✅ mock data
  useEffect(() => {
    const mock = Array.from({ length: 80 }, (_, i) => {
      const now = dayjs().subtract(i, "hour").format("DD/MM/YYYY HH:mm:ss");
      const transaction =
        i % 2 === 0
          ? "สร้างใบเสร็จรับเงิน"
          : i % 3 === 0
          ? "สร้างใบแจ้งหนี้"
          : "แก้ไขข้อมูลสมาชิก";

      return {
        id: i + 1,
        project: i % 2 === 0 ? "หมู่บ้านการ์เด้นวิว" : "หมู่บ้านการ์เด้นวิว 2",
        name: `ชื่อผู้อยู่อาศัย นามสกุล ${i + 1}`,
        transaction,
        detail: `ทำรายการ "${transaction}" สำหรับบ้านเลขที่ ${550 + i}`,
        date: now,
      };
    });
    setTableData(mock);
  }, []);

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
    { title: "ลำดับ", dataIndex: "id", key: "id", width: 80, align: "center" },
    { title: "ผู้ใช้งาน", dataIndex: "name", key: "name" },
    { title: "โครงการ", dataIndex: "project", key: "project" },
    { title: "รายการ", dataIndex: "transaction", key: "transaction" },
    { title: "รายละเอียด", dataIndex: "detail", key: "detail" },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
    },
  ];

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
    <div style={{ background: "transparent", padding: 20 }}>
      {/* 🔍 Filter Bar */}
      <SearchBar
        searchText={searchText}
        setSearchText={setSearchText}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        transactionFilter={transactionFilter}
        setTransactionFilter={setTransactionFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        setCurrentPage={setCurrentPage}
      />

      <div className="font-bold mb-2">รายการบันทึกการทำงานของระบบ</div>

      <Table
        columns={columns}
        dataSource={paginatedData}
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
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={(page) => setCurrentPage(page)}
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
