import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

type ReceiptStatusTagProps = {
  rejectedReason?: string | null;
  tooltip?: boolean;
};

type ReceiptStatus = "ACTIVE" | "REJECTED";

const STATUS_COLOR: Record<ReceiptStatus, string> = {
  ACTIVE: "#74BA3D",
  REJECTED: "#EA3D3D",
};

export function ReceiptStatusTag({
  rejectedReason,
  tooltip = true,
}: ReceiptStatusTagProps) {
  const status: ReceiptStatus = rejectedReason ? "REJECTED" : "ACTIVE";
  const showTooltip = tooltip && status === "REJECTED" && !!rejectedReason;

  if (status === "ACTIVE") {
    return <span style={{ color: STATUS_COLOR.ACTIVE }}>ใช้งาน</span>;
  }

  return (
    <span
      className="status-text"
      style={{
        color: STATUS_COLOR.REJECTED,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ยกเลิก
      {showTooltip && (
        <Tooltip
          title={<span style={{ color: "#000" }}>{rejectedReason}</span>}
          color="#fff"
          overlayInnerStyle={{
            borderRadius: 8,
            padding: "4px 8px",
          }}
        >
          <InfoCircleOutlined
            style={{
              fontSize: 14,
              cursor: "help",
              color: STATUS_COLOR.REJECTED,
            }}
          />
        </Tooltip>
      )}
    </span>
  );
}
