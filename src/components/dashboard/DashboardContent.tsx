"use client";
import { Card, Col, DatePicker, Row, Table, Tag, Typography } from "antd";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd
import { useEffect, useState } from "react";
import { CalendarOutlined } from "@ant-design/icons"; // ✅ import icon ปฏิทินจาก antd
// import "./moment-buddhist";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import { DashboardAPIs } from "../../networks/dashboard.api";
import { useMe } from "../../hooks/useMe";
import moment from "moment";
import "moment/locale/th";
import { ThaiDatePicker } from "./ThaiDatePicker";
// import "moment/locale/th";
import generatePicker from "antd/lib/date-picker/generatePicker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";

const { Title, Text } = Typography;

export default function DashboardContent() {
  // const { RangePicker } = DatePicker;
  const { RangePicker } = ThaiDatePicker;

  const [dashboardData, setDashboardData] = useState<any>();
  const { data: me } = useMe();

  const [barData, setBarData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  const currentYear = moment().year();

  const [year, setYear] = useState<any>(moment());
  const [dateRange, setDateRange] = useState<any>([
    moment(`${currentYear}-01-01`),
    moment(`${currentYear}-12-31`),
  ]);

  const getFullDateRange = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1] || !year) return null;
    const selectedYear = year.year(); // ค.ศ.
    const start = dateRange[0].year(selectedYear);
    const end = dateRange[1].year(selectedYear);
    return [start, end];
  };

  const fullRange = getFullDateRange();

  const PAYMENT_COLORS: Record<string, string> = {
    CASH: "#EB6142", // เงินสด
    TRANSFER: "#74BA3D", // โอน
    CHEQUE: "#F4B740", // เช็ค
  };

  const PAYMENT_METHODS = [
    { key: "TRANSFER", label: "โอนธนาคาร", color: "#74BA3D" },
    { key: "CASH", label: "เงินสด", color: "#EB6142" },
    { key: "CHEQUE", label: "เช็ค", color: "#F4B740" },
  ];

  const fetchData = async () => {
    try {
      const projectId = me?.project_id;
      if (projectId == null) return;

      const range = getApiDateRange();

      const res = await DashboardAPIs.getAll({
        start_date: range.start_date,
        end_date: range.end_date,
        year: range.year,
        project_id: Number(projectId),
      });

      const body = res?.data?.body || {};

      setDashboardData(body);
      setBarData(normalizeMonthlyTrend(body.monthlyTrend || []));
      // setPieData(body.paymentMethod || []);
      setPieData(
        (body.paymentMethod || []).map((p: any) => ({
          ...p,
          color: PAYMENT_COLORS[p.key] ?? "#999999", // กันหลุด
        })),
      );
      setTableData(body.outstandings || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [me?.project_id]);

  console.log(pieData);

  useEffect(() => {
    if (dateRange && year) {
      fetchData();
    }
  }, [dateRange, year, me?.project_id]);

  const summaryItems = [
    { label: "จำนวนลูกบ้าน", value: dashboardData?.summary?.total_resident },
    {
      label: "ยอดรวมค่าส่วนกลาง (บาท)",
      value: dashboardData?.summary?.total_billed,
    },
    {
      label: "ยอดที่ชำระแล้ว (บาท)",
      value: dashboardData?.summary?.total_paid,
    },
    { label: "ยอดค้างชำระ (บาท)", value: dashboardData?.summary?.total_unpaid },
    { label: "อัตราการชำระ (%)", value: dashboardData?.summary?.payment_rate },
  ];

  const columns: any = [
    { title: "บ้านเลขที่", dataIndex: "house_no", key: "house_no", width: 100 },
    { title: "ชื่อ-นามสกุล", dataIndex: "full_name", key: "full_name" },
    {
      title: "จำนวนเดือน",
      dataIndex: "count",
      key: "count",
      align: "right",
    },
    {
      title: "ค่าปรับ (บาท)",
      dataIndex: "fine",
      key: "fine",
      align: "right",
      render: (value: number) =>
        value?.toLocaleString("th-TH", { minimumFractionDigits: 0 }),
    },
    {
      title: "ค่าทวงถาม (บาท)",
      dataIndex: "collection_fee",
      key: "collection_fee",
      align: "right",
      render: (value: any) => formatNumber(value),
    },
    {
      title: "ยอดที่ต้องชำระ (บาท)",

      dataIndex: "total_due",
      key: "total_due",
      align: "right",
      render: (value: any) => formatNumber(value),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      // className: "status-column",
      align: "center" as const,
      width: 180,
      render: (status: string) =>
        status != "ยังไม่ชำระเงิน" ? (
          <Tag
            style={{
              backgroundColor: "#22c55e",
              color: "white",
              borderRadius: "20px",
              padding: "2px 12px",
              fontWeight: 500,
            }}
          >
            ชำระเงินแล้ว
          </Tag>
        ) : (
          <Tag
            style={{
              backgroundColor: "#CDCDCD",
              color: "white",
              borderRadius: "20px",
              padding: "2px 12px",
              fontWeight: 500,
            }}
          >
            ยังไม่ชำระเงิน
          </Tag>
        ),
    },
  ];

  const getApiDateRange = () => {
    const adYear = year.year(); // ค.ศ.
    const buddhistYear = adYear + 543; // พ.ศ.

    return {
      // start_date / end_date ส่งเป็น ค.ศ. ตามมาตรฐาน ISO เดิม
      start_date: dateRange[0].format("YYYY-MM-DD"),
      end_date: dateRange[1].format("YYYY-MM-DD"),

      // year ส่งเป็น พ.ศ. ตามที่นายต้องการ
      year: String(buddhistYear),
    };
  };

  const formatNumber = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return value ?? "-";
    return num.toLocaleString("th-TH", { minimumFractionDigits: 0 });
  };

  const normalizeMonthlyTrend = (rows: any[]) => {
    const map: any = {};

    rows.forEach((item) => {
      if (!map[item.label]) {
        map[item.label] = { label: item.label, billed: 0, paid: 0, unpaid: 0 };
      }
      map[item.label][item.key] = item.value;
    });

    return Object.values(map);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        {/* 🗓 เลือกช่วงวัน-เดือน */}

        <RangePicker
          locale={th_TH}
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          allowClear={false}
          format={(value) => {
            if (!value) return "";
            const buddhistYear = value.year() + 543;
            return `${value.format("DD MMM")} ${buddhistYear}`;
          }}
          style={{
            width: 260,
            height: 40,
            borderColor: "#87D2F7",
            borderRadius: 6,
            boxShadow: "0 0 0 2px rgba(135, 210, 247, 0.3)",
          }}
        />

        {/* 📅 เลือกปี */}
        {/* <DatePicker
          locale={th_TH}
          picker="year"
          value={year}
          allowClear={false}
          format={(v) => (v ? (v.year() + 543).toString() : "")}
          onChange={(y) => setYear(y)}
          style={{
            width: 120,
            height: 40,
            borderColor: "#87D2F7",
            borderRadius: 6,
            boxShadow: "0 0 0 2px rgba(135, 210, 247, 0.3)",
          }}
        /> */}
        <ThaiDatePicker
          picker="year"
          locale={th_TH}
          value={year}
          onChange={(v) => setYear(v)}
          format={(v) => (v ? String(v.year() + 543) : "")}
          style={{
            width: 120,
            height: 40,
            borderColor: "#87D2F7",
            borderRadius: 6,
            boxShadow: "0 0 0 2px rgba(135, 210, 247, 0.3)",
          }}
        />
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {summaryItems?.map((item: any, i: any) => (
          <div
            key={i}
            className="bg-white text-center rounded-lg px-6 py-4 border border-[#87D2F7] shadow-md"
            style={{
              boxShadow: "0 4px 12px rgba(135, 210, 247, 0.3)",
              borderRadius: 10,
            }}
          >
            <div className="text-gray-600 text-base whitespace-nowrap">
              {item.label}
            </div>
            <div className="text-xl font-semibold text-gray-800 whitespace-nowrap">
              {formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <Row gutter={32} className="mt-6 mb-4">
        {/* ✅ กราฟแนวโน้ม */}
        <Col span={16}>
          <Card
            bordered
            style={{
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(135, 210, 247, 0.3)",
              height: 400, // ✅ Fix ความสูง card ให้เท่ากับอีกฝั่ง
            }}
            bodyStyle={{
              borderRadius: 10,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="text-lg  rounded-4xl">
              กราฟแนวโน้ม (Monthly Trend)
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={barData}
                margin={{ top: 0, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 13, fill: "#4D4C4C" }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#4D4C4C" }}
                  tickLine={false}
                  // domain={[0, maxY]}
                  // ticks={[0, step, step * 2, step * 3, step * 4, step * 5]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#e5e7eb",
                    backgroundColor: "#fff",
                  }}
                />

                <Bar
                  dataKey="paid"
                  fill="#74BA3D"
                  name="ชำระแล้ว"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="paid"
                    position="top"
                    fill="#333"
                    fontSize={12}
                    formatter={(value: any) => Math.round(value)}
                  />
                </Bar>
                <Bar
                  dataKey="unpaid"
                  fill="#EB6142"
                  name="ค้างชำระ"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="unpaid"
                    position="top"
                    fill="#333"
                    fontSize={12}
                    formatter={(value: any) => Math.round(value)}
                  />
                </Bar>
                <Legend
                  verticalAlign="top"
                  align="center"
                  content={() => (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          backgroundColor: "#74BA3D",
                          borderRadius: "50%",
                          marginRight: 6,
                          transform: "translateY(1px)",
                          border: "1px solid #D9D9D9",
                        }}
                      />
                      <span style={{ marginRight: 16 }}>ชำระเงินแล้ว</span>

                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          backgroundColor: "#EB6142",
                          borderRadius: "50%",
                          marginRight: 6,
                          transform: "translateY(1px)",
                          border: "1px solid #D9D9D9",
                        }}
                      />
                      <span>ค้างชำระ</span>
                    </div>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* ✅ วิธีการชำระเงิน */}
        <Col span={8}>
          <Card
            style={{
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(135, 210, 247, 0.3)",
              height: 400, // ✅ เท่ากับ card ซ้าย
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className=" text-lg py-2 rounded-4xl">วิธีการชำระเงิน</div>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="55%"
                  innerRadius={45} // ✅ เพิ่มความอ้วนของวงกลม (จาก 55 → 45)
                  outerRadius={90}
                  paddingAngle={pieData.length > 1 ? 2 : 0}
                  dataKey="value"
                  nameKey="name"
                  label={({ value, percent, x, y }: any) => {
                    const percentage = (percent * 100)
                      .toFixed(1)
                      .replace(".0", "");
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#333"
                        fontSize={14}
                      >
                        <tspan x={x} dy="-0.4em" fontWeight="bold">
                          {value}
                        </tspan>
                        <tspan x={x} dy="1.2em" fontSize={12} fill="#888">
                          {percentage}%
                        </tspan>
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                {/* <Legend
                  verticalAlign="top"
                  align="center"
                  content={() => (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          backgroundColor: "#74BA3D",
                          borderRadius: "50%",
                          marginRight: 6,
                          transform: "translateY(1px)",
                          border: "1px solid #D9D9D9",
                        }}
                      />
                      <span style={{ marginRight: 16 }}>โอนธนาคาร</span>

                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          backgroundColor: "#EB6142",
                          borderRadius: "50%",
                          marginRight: 6,
                          transform: "translateY(1px)",
                          border: "1px solid #D9D9D9",
                        }}
                      />
                      <span>เงินสด</span>
                    </div>
                  )}
                /> */}
                <Legend
                  verticalAlign="top"
                  align="center"
                  content={() => (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {PAYMENT_METHODS.map((item) => {
                        const found = pieData.find((p) => p.key === item.key);

                        return (
                          <span
                            key={item.key}
                            style={{
                              marginRight: 16,
                              opacity: found ? 1 : 0.4, // 🔑 ไม่มีข้อมูล = จาง
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                backgroundColor: item.color,
                                borderRadius: "50%",
                                marginRight: 6,
                                transform: "translateY(1px)",
                                border: "1px solid #D9D9D9",
                              }}
                            />
                            {item.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Table */}

      <div className="mt-6" style={{}}>
        <div className="text-lg py-2 rounded-4xl mb-4">รายการ Outstandings</div>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          bordered={false}
          className="custom-table"
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
