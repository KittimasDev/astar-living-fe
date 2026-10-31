import { Button, Select, Input, MenuProps, Dropdown } from "antd";
import { Controller, useForm, useWatch } from "react-hook-form";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { ThaiDatePicker } from "../dashboard/ThaiDatePicker";
import { useState } from "react";
import moment from "moment";
// import "moment/locale/th";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd
import { SearchOutlined } from "@ant-design/icons";

dayjs.locale("th");

const { Option } = Select;
// const { RangePicker } = DatePicker;
// const { RangePicker } = ThaiDatePicker;

const { RangePicker: DateRangePicker } = DatePicker; // สำหรับ date
const { RangePicker: ThaiRangePicker } = ThaiDatePicker; // สำหรับ year

interface SearchBarProps {
  activeTab: string;
  control: any;
  setValue: any;
  handleSubmit: any;
  reset: any;
  onSearch: (values: any) => void;
  onReset: () => void;
  onExport: (format: "excel" | "csv" | "pdf") => void;
  allHouseNumbers: (string | number)[];
  months: string[];
  onTabChange: (tabKey: string) => void;
  reportTabs: { key: string; label: string }[];
  houseOptions: { label: string; value: string | number }[];
}

export default function SearchBar({
  houseOptions,
  activeTab,
  control,
  setValue,
  handleSubmit,
  reset,
  onSearch,
  onReset,
  allHouseNumbers,
  months,
  onTabChange,
  reportTabs,
  onExport,
}: SearchBarProps) {
  // 🔹 เมนู dropdown สำหรับส่งออก
  const exportMenu: MenuProps = {
    items: [
      { key: "excel", label: "ไฟล์ Excel" },
      { key: "csv", label: "ไฟล์ CSV" },
      { key: "pdf", label: "ไฟล์ PDF" },
    ],
    onClick: ({ key }) => {
      if (key === "excel" || key === "csv" || key === "pdf") {
        onExport(key);
      }
    },
  };

  const paymentStartDate = useWatch({
    control,
    name: "payment_start_date",
  });

  const paymentEndDate = useWatch({
    control,
    name: "payment_end_date",
  });

  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <div style={{ width: "100%", maxWidth: 960 }}>
        {/* 🔹 Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {reportTabs.map((tab, index) => {
            const isLastTwoTabs = index >= reportTabs.length - 2;
            return (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? "primary" : "default"}
                onClick={() => onTabChange(tab.key)}
                style={{
                  flex: isLastTwoTabs ? "0 0 calc(25% - 6px)" : "1 0 220px",
                  minWidth: isLastTwoTabs ? "auto" : 220,
                  borderRadius: 30,
                  height: 48,
                  background: activeTab === tab.key ? "#8DD3F4" : "#fff",
                  color: activeTab === tab.key ? "#fff" : "#555",
                  border: activeTab === tab.key ? "none" : "1px solid #E5E5E5",
                  fontSize: 15,
                  fontWeight: 500,
                  boxShadow:
                    activeTab === tab.key
                      ? "0 2px 6px rgba(135,210,247,0.35)"
                      : "none",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    activeTab === tab.key ? "#8DD3F4" : "#F5FBFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    activeTab === tab.key ? "#8DD3F4" : "#fff";
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* 🔹 Filters */}
        <form onSubmit={handleSubmit(onSearch)}>
          <div className="flex flex-col gap-6 items-center justify-center">
            {/* ✅ รายงานค้างชำระ */}
            {(activeTab === "arrears" ||
              activeTab === "arrears_board" ||
              activeTab === "arrears_resident") && (
              <div className="flex flex-wrap justify-between gap-6 w-[940px]">
                {/* บ้านเลขที่ */}
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">
                    บ้านเลขที่
                  </label>
                  <Controller
                    name="house_no"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        showSearch
                        placeholder="เลือกบ้านเลขที่"
                        options={houseOptions}
                        optionFilterProp="label"
                        style={{ width: "100%", height: 38 }}
                        className="custom-rounded-select"
                      />
                    )}
                  />
                </div>
                {/* ปี พ.ศ. */}
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">ปี พ.ศ.</label>

                  <Controller
                    name="year"
                    control={control}
                    defaultValue={null} // ⭐ default ว่างจริง
                    render={({ field }) => (
                      <ThaiDatePicker
                        picker="year"
                        locale={th_TH}
                        value={
                          field.value
                            ? moment(String(Number(field.value) - 543), "YYYY")
                            : null
                        }
                        onChange={(v) => {
                          if (!v) return field.onChange(null);
                          field.onChange(String(v.year() + 543)); // เก็บเป็น พ.ศ.
                        }}
                        format={(v) => (v ? String(v.year() + 543) : "")}
                        allowClear
                        style={{ width: "100%", height: 38, borderRadius: 20 }}
                        className="custom-rounded-select"
                      />
                    )}
                  />
                </div>

                {/* เดือน */}
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">เดือน</label>
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="เลือกเดือน"
                        style={{ width: "100%", height: 38 }}
                        className="custom-rounded-select"
                        allowClear
                      >
                        {months.map((m, idx) => (
                          <Option key={idx + 1} value={String(idx + 1)}>
                            {m}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ✅ รายงานการชำระเงิน */}
            {(activeTab === "payment" || activeTab === "other") && (
              <>
                <div className="grid grid-cols-3 gap-6 w-[940px]">
                  {/* บ้านเลขที่ */}
                  <div className="flex flex-col flex-1">
                    <label className="text-gray-600 text-sm mb-1">
                      บ้านเลขที่
                    </label>
                    <Controller
                      name="house_no"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          allowClear
                          showSearch
                          placeholder="เลือกบ้านเลขที่"
                          options={houseOptions}
                          optionFilterProp="label"
                          style={{ width: "100%", height: 38 }}
                          className="custom-rounded-select"
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-gray-600 text-sm mb-1">
                      เลขที่ใบเสร็จ
                    </label>
                    <Controller
                      name="receipt_no"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="ค้นหาเลขที่ใบเสร็จ"
                          prefix={<SearchOutlined />}
                          allowClear
                          style={{ height: 38, borderRadius: 20 }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <label className="text-gray-600 text-sm mb-1">สถานะ</label>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          allowClear
                          showSearch
                          placeholder="เลือกสถานะ"
                          optionFilterProp="label"
                          style={{ width: "100%", height: 38 }}
                          className="custom-rounded-select"
                          options={[
                            { label: "ใช้งาน", value: true },
                            { label: "ยกเลิก", value: false },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 w-[940px]">
                  {/* บ้านเลขที่ */}

                  {/* วิธีการชำระเงิน */}
                  <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">
                      วิธีการชำระเงิน
                    </label>
                    <Controller
                      name="payment_method_name"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="เลือกวิธีการชำระเงิน"
                          allowClear
                          style={{ width: "100%", height: 38 }}
                          className="custom-rounded-select"
                          onChange={(val) => field.onChange(val)} // val = number
                        >
                          <Option value={"เช็ค"}>เช็ค</Option>
                          <Option value={"เงินสด"}>เงินสด</Option>
                          <Option value={"โอนเงินผ่านธนาคาร"}>
                            โอนเงินผ่านธนาคาร
                          </Option>
                        </Select>
                      )}
                    />
                  </div>

                  {/* วันที่ชำระเงิน */}
                  <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">
                      วันที่ชำระเงิน
                    </label>
                    <Controller
                      name="payment_date_range" // virtual field
                      control={control}
                      render={() => (
                        <DateRangePicker
                          picker="date"
                          locale={th_TH}
                          className="custom-rounded-select"
                          style={{
                            width: "100%",
                            height: 38,
                            borderRadius: 20,
                          }}
                          value={[
                            paymentStartDate ?? null,
                            paymentEndDate ?? null,
                          ]}
                          onChange={(dates) => {
                            if (!dates) {
                              setValue("payment_start_date", null);
                              setValue("payment_end_date", null);
                              return;
                            }

                            const [start, end] = dates;

                            // ✅ เก็บ moment ตรง ๆ
                            setValue("payment_start_date", start);
                            setValue("payment_end_date", end);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ✅ รายงานใบแจ้งค่าใช้จ่าย */}
            {activeTab === "usage" && (
              <div className="grid grid-cols-2 gap-6 w-[940px]">
                {/* ช่วงปี */}
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm mb-1">ช่วงปี</label>
                  <Controller
                    name="year_range"
                    control={control}
                    render={({ field }) => (
                      <ThaiRangePicker
                        picker="year"
                        locale={th_TH}
                        className="custom-rounded-select"
                        style={{ width: "100%", height: 38, borderRadius: 20 }}
                        value={
                          field.value
                            ? [
                                field.value[0]
                                  ? moment(
                                      String(Number(field.value[0]) - 543),
                                      "YYYY",
                                    )
                                  : null,
                                field.value[1]
                                  ? moment(
                                      String(Number(field.value[1]) - 543),
                                      "YYYY",
                                    )
                                  : null,
                              ]
                            : null
                        }
                        onChange={(dates) => {
                          if (!dates) return field.onChange(null);

                          const [start, end] = dates;
                          field.onChange([
                            start ? String(start.year() + 543) : null,
                            end ? String(end.year() + 543) : null,
                          ]);
                        }}
                        format={(v) => (v ? String(v.year() + 543) : "")}
                      />
                    )}
                  />
                </div>

                {/* ผู้ออกใบแจ้งหนี้ */}
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm mb-1">
                    ผู้ออกใบแจ้งหนี้
                  </label>
                  {/* <Controller
                    name="invoiced_by"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="เลือกผู้ออกใบแจ้งหนี้"
                        allowClear
                        style={{ width: "100%", height: 38 }}
                        className="custom-rounded-select"
                      >
                        {["น.ส.สมพร", "นายปิยะพงษ์", "น.ส.จิตรา"].map((p) => (
                          <Option key={p} value={p}>
                            {p}
                          </Option>
                        ))}
                      </Select>
                    )}
                  /> */}
                  <Controller
                    name="user_full_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="ผู้ออกใบแจ้งหนี้"
                        style={{
                          width: "100%",
                          height: 38,
                          borderRadius: 20,
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* ✅ รายงานค่าเบี้ยปรับและค่าทวงถาม */}
            {activeTab === "discount" && (
              <div className="grid grid-cols-3 gap-6 w-[940px]">
                {/* บ้านเลขที่ */}
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">
                    บ้านเลขที่
                  </label>
                  <Controller
                    name="house_no"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        showSearch
                        placeholder="เลือกบ้านเลขที่"
                        options={houseOptions}
                        optionFilterProp="label"
                        style={{ width: "100%", height: 38 }}
                        className="custom-rounded-select"
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">ปี พ.ศ.</label>

                  <Controller
                    name="year"
                    control={control}
                    defaultValue={null} // ⭐ default ว่างจริง
                    render={({ field }) => (
                      <ThaiDatePicker
                        picker="year"
                        locale={th_TH}
                        value={
                          field.value
                            ? moment(String(Number(field.value) - 543), "YYYY")
                            : null
                        }
                        onChange={(v) => {
                          if (!v) return field.onChange(null);
                          field.onChange(String(v.year() + 543)); // เก็บเป็น พ.ศ.
                        }}
                        format={(v) => (v ? String(v.year() + 543) : "")}
                        allowClear
                        style={{ width: "100%", height: 38, borderRadius: 20 }}
                        className="custom-rounded-select"
                      />
                    )}
                  />
                </div>

                {/* เดือน */}
                <div className="flex flex-col flex-1">
                  <label className="text-gray-600 text-sm mb-1">เดือน</label>
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="เลือกเดือน"
                        style={{ width: "100%", height: 38 }}
                        className="custom-rounded-select"
                        allowClear
                      >
                        {months.map((m, idx) => (
                          <Option key={idx + 1} value={String(idx + 1)}>
                            {m}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}

            {/* 🔘 ปุ่มส่วนล่าง */}
            <div className="flex gap-3 justify-center mt-4">
              <Button
                onClick={() => {
                  // reset(undefined, { keepDefaultValues: true });
                  reset({
                    year: null,
                    month: null,
                    house_no: null,
                    date_year: null,
                    payment_method_name: null,
                    payment_date_range: null,
                    year_range: null,
                    invoiced_by: null,
                    user_full_name: null,
                  });
                  setTimeout(onReset, 0);
                }}
                style={{
                  borderRadius: 20,
                  width: 150,
                  height: 40,
                  borderColor: "#E6E6E6",
                  color: "#666",
                  background: "#fff",
                  fontWeight: 500,
                }}
              >
                ล้างข้อมูล
              </Button>
              <Button
                htmlType="submit"
                style={{
                  borderRadius: 20,
                  width: 150,
                  height: 40,
                  border: "none",
                  background: "#8DD3F4",
                  color: "white",
                  fontWeight: 500,
                  boxShadow: "0 2px 4px rgba(135,210,247,0.3)",
                }}
              >
                ค้นหา
              </Button>
              <Dropdown menu={exportMenu} trigger={["click"]}>
                <Button
                  style={{
                    borderRadius: 20,
                    width: 180,
                    height: 40,
                    border: "1px solid #74BA3D",
                    color: "#74BA3D",
                    background: "white",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  ส่งออกข้อมูล
                </Button>
              </Dropdown>
            </div>
          </div>
        </form>
      </div>
      <style jsx global>{`
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
