import { Modal, Checkbox, Button } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function PreSelectMonthModal({
  open,
  resident,
  onBack,
  onNext,
}: any) {
  const currentMonth = dayjs().month(); // 0 = ม.ค.
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

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setShowError(false);
    }
  }, [open]);

  const handleCheck = (i: number, checked: boolean) => {
    setSelected((prev) => {
      const updated = checked ? [...prev, i] : prev.filter((m) => m !== i);
      if (updated.length > 0) setShowError(false); // clear error ถ้าเริ่มเลือก
      return updated;
    });
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setShowError(true);
      return;
    }

    const sorted = [...selected].sort((a, b) => a - b);
    let valid = true;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) valid = false;
    }

    onNext(sorted, valid);
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

      <div className="">เลือกเดือน ปี พ.ศ. 2568</div>

      {showError && (
        <div className="text-red-500 text-[11px] mb-2">
          กรุณาเลือกอย่างน้อย 1 เดือน
        </div>
      )}

      <div className="flex flex-col gap-2">
        {months.map((m, i) => (
          <div key={i} className="flex items-center">
            <Checkbox
              disabled={i < currentMonth}
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
