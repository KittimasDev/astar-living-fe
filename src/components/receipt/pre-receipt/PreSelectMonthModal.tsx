import { Modal, Checkbox, Button, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ThaiDatePicker } from "./ThaiDatePicker";
import moment from "moment";
import "moment/locale/th";
import th_TH from "antd/lib/date-picker/locale/th_TH"; // ✅ locale ภาษาไทยของ antd

export default function PreSelectMonthModal({
  open,
  resident,
  onBack,
  onNext,
  paidMonth,
  minYear,
  onYearChange,
}: any) {
  const currentMonth = dayjs().month();

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

  const [selected, setSelected] = useState<number[]>([]);
  const [showError, setShowError] = useState(false);

  const currentYearTH = dayjs().year() + 543;

  const [year, setYear] = useState<number | null>(minYear ?? currentYearTH);

  // const [year, setYear] = useState<number | null>(dayjs().year() + 543);
  // const currentYearTH = dayjs().year() + 543;

  const paidMonthMap = new Map<number, boolean>(
    (paidMonth ?? []).map((m: any) => [m.month - 1, m.active])
  );

  useEffect(() => {
    if (open && minYear) {
      setYear(minYear);
      setSelected([]);
      setShowError(false);
    }
  }, [open, minYear]);

  const handleCheck = (i: number, checked: boolean) => {
    setSelected((prev) => {
      const updated = checked ? [...prev, i] : prev.filter((m) => m !== i);
      if (updated.length > 0) setShowError(false);
      return updated;
    });
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setShowError(true);
      return;
    }

    const sorted = [...selected].sort((a, b) => a - b);

    // ✅ ตรวจว่าเลือกเดือนติดกันหรือไม่
    let valid = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        valid = false;
        break;
      }
    }

    onNext(
      {
        months: sorted,
        year,
      },
      valid
    );
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={onBack}
      width={400}
      bodyStyle={{
        padding: "32px 40px",
        borderRadius: "20px",
        background: "#fff",
      }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div className="mt-4">{resident?.full_name}</div>
      <div className="mb-4">บ้านเลขที่ {resident?.house_no}</div>

      {/* 🔥 Dropdown เลือกปี */}
      <label className="block mb-1 text-gray-700 text-sm font-medium">
        เลือกปี พ.ศ.
      </label>
      <div className="mb-3">
        <ThaiDatePicker
          picker="year"
          locale={th_TH}
          value={year ? moment(String(year - 543), "YYYY") : null}
          onChange={(v) => {
            if (!v) {
              setYear(null);
              return;
            }

            const buddhistYear = v.year() + 543;

            // ห้ามเลือกปีย้อนหลัง และเลือกได้เฉพาะ minYear เป็นต้นไป
            if (buddhistYear < minYear) {
              return;
            }

            setYear(buddhistYear);
            setSelected([]); // reset เดือนเมื่อเปลี่ยนปี
            setShowError(false);

            onYearChange?.(buddhistYear);
          }}
          disabledDate={(current) => {
            if (!current) return false;

            const yearTH = current.year() + 543;
            return yearTH < minYear; // ❌ ต่ำกว่า minYear = disabled
          }}
          format={(v) => (v ? String(v.year() + 543) : "")}
          style={{
            width: "100%",
            height: 40,
            borderColor: "#87D2F7",
            borderRadius: 6,
            boxShadow: "0 0 0 2px rgba(135, 210, 247, 0.3)",
          }}
        />
      </div>

      <div className="">เลือกเดือน</div>

      {showError && (
        <div className="text-red-500 text-[11px] mb-2">
          กรุณาเลือกอย่างน้อย 1 เดือน
        </div>
      )}

      <div className="flex flex-col gap-2">
        {months.map((m, i) => (
          <div key={i} className="flex items-center">
            <Checkbox
              disabled={
                !paidMonthMap.get(i) || // ❌ active = false
                (year === currentYearTH && i < currentMonth) // ❌ เดือนย้อนหลังปีปัจจุบัน
              }
              checked={selected.includes(i)}
              onChange={(e) => handleCheck(i, e.target.checked)}
            >
              {m}
            </Checkbox>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <Button
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
            background: "#fff",
            fontWeight: 500,
          }}
          onClick={onBack}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          onClick={handleNext}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            background: "#87D2F7",
            border: "none",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          ถัดไป
        </Button>
      </div>
    </Modal>
  );
}
