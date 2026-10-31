type ReceiptMode = "common" | "other";

export const ReceiptModeToggle = ({
  value,
  onChange,
}: {
  value: ReceiptMode;
  onChange: any;
}) => (
  <div className="inline-flex bg-white rounded-full mb-4 border border-[#87D2F7] overflow-hidden">
    {[
      { label: "ค่าส่วนกลาง", value: "common" },
      { label: "รายรับอื่นๆ", value: "other" },
    ].map((opt, index) => {
      const active = value === opt.value;
      const isLeft = index === 0;
      const isRight = index === 1;

      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            hover:cursor-pointer px-6 py-1 text-sm font-medium transition
            ${isLeft ? "rounded-l-full" : ""}
            ${isRight ? "rounded-r-full" : ""}
            ${
              active
                ? "bg-[#87D2F7] text-white shadow"
                : "text-[#87D2F7] hover:bg-[#87D2F7]/10"
            }
          `}
        >
          <div
            className={`${active ? "text-white font-semibold text-lg" : "text-[#87D2F7] font-semibold text-lg"}`}
          >
            {" "}
            {opt.label}{" "}
          </div>
        </button>
      );
    })}
  </div>
);
