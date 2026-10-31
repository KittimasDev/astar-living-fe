import { Modal, Button } from "antd";
import Image from "next/image";

export default function ViewReceiptModal({
  open,
  resident,
  months,
  onBack,
  onConfirm,
}: any) {
  const total = (months?.length * 3787.5).toFixed(2);

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={900}
      onCancel={onBack}
      bodyStyle={{
        padding: "24px 32px",
        borderRadius: 16,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div className="rounded-lg bg-white mb-8 p-6">
        <div className="flex items-start justify-between">
          <div className="flex">
            <div>
              <Image src="/logo.png" alt="GardenView" width={160} height={60} />
            </div>
            <div className="text-sm ml-2 mt-2">
              <div className="font-bold mb-2">
                นิติบุคคลหมู่บ้านจัดสรร หมู่บ้านการ์เด้นวิว
              </div>
              <div>
                ซอยลาดพร้าว 112 ถนนลาดพร้าว เขตวังทองหลาง กรุงเทพฯ 10320
              </div>
              <div>โทร. 0-2935-2772 โทรสาร. 0-2935-2772</div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <div className="text-3xl font-bold text-[#4D4C4C]">
              ใบเสร็จรับเงิน
            </div>
            <div className="text-xl font-bold text-[#4D4C4C] text-center">
              (ฉบับจริง)
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3 text-sm leading-relaxed">
          <div className=" flex justify-between items-start">
            {/* 🟩 ฝั่งซ้าย */}
            <div className="w-2/3 flex flex-col gap-1">
              <div className="grid grid-cols-[110px_1fr]">
                <div className="font-semibold">ชื่อ / Name</div>
                <div>{resident?.name}</div>
              </div>
              <div className="grid grid-cols-[110px_1fr]">
                <div className="font-semibold">บ้านเลขที่</div>
                <div>{resident?.house}</div>
              </div>
              <div className="grid grid-cols-[110px_1fr] items-start">
                <div className="font-semibold">ที่อยู่ / Address</div>
                <div className="leading-snug">{resident?.address} 10320</div>
              </div>
            </div>
            <div className=" flex flex-col gap-1">
              <div className="grid grid-cols-[160px_1fr]">
                <div className="font-semibold">เลขที่ใบเสร็จรับเงิน / No.</div>
                <div>{resident?.payment_no || "6811100001"}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr]">
                <div className="font-semibold">วันที่ / Date</div>
                <div>01/01/2568</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] items-start">
                <div className="font-semibold">เดือน / Month</div>
                <div className="leading-snug">01/2568</div>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full mt-5 text-sm">
          <thead className="bg-[#EFEFEF]">
            <tr>
              <th className="py-2 text-left pl-3">รายการ</th>
              <th className="py-2 text-right">จำนวนหน่วย</th>
              <th className="py-2 text-right pr-3">ราคาต่อหน่วย</th>
              <th className="py-2 text-right pr-3">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr className="">
              <td className="py-1 pl-3">ค่าส่วนกลาง (ม.ค. 68 - มิ.ย. 68)</td>
              <td className="py-1 text-right">4</td>
              <td className="py-1 text-right">3,787.50</td>
              <td className="py-1 text-right pr-3">15,150.00</td>
            </tr>
          </tbody>
          <tbody>
            <tr className="">
              <td className="py-1 pl-3">ค่าทวงถาม (ม.ค. 68 - มิ.ย. 68)</td>
              <td className="py-1 text-right">3</td>
              <td className="py-1 text-right">200.00</td>
              <td className="py-1 text-right pr-3">600.00</td>
            </tr>
          </tbody>
          <tbody>
            <tr className="">
              <td className="py-1 pl-3">ค่าเบี้ยปรับ (ม.ค. 68 - มิ.ย. 68)</td>
              <td className="py-1 text-right">1</td>
              <td className="py-1 text-right">1,136.25</td>
              <td className="py-1 text-right pr-3">1,136.25</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-2 text-base font-semibold mr-2">
          <div className="mr-52">รวมเงินทั้งสิ้น</div>
          <div>16,886.25</div>
        </div>

        <div className="mt-4   pt-3 text-sm leading-relaxed">
          <div className=" flex justify-between items-start">
            {/* 🟩 ฝั่งซ้าย */}
            <div className="w-2/3 flex flex-col gap-1">
              <div className="grid grid-cols-[110px_1fr]">
                <div className="font-semibold">ชำระเงินโดย</div>
                <div>{resident?.name}</div>
              </div>
              <div className="grid grid-cols-[110px_1fr]">
                <div className="font-semibold">เงินสด</div>
                <div>09/11/2568</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="w-2/3 border border-[#D9D9D9] p-3 mt-4 text-xs leading-relaxed rounded-md text-[#747474]">
            <div className="font-medium mb-1">หมายเหตุ :</div>
          </div>
          <div className="flex justify-between mt-10 text-sm mr-4">
            <div />
            <div className="text-center">
              <div>__________________________</div>
              <div className="font-bold text-lg">นายกอ นามสกุลขอ</div>
              <div>ผู้รับเงิน</div>
              <div className="mt-4">วันที่ _______________</div>
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-center mt-6 gap-3 sticky bottom-0 bg-white py-3">
        <Button
          onClick={onBack}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
            background: "#fff",
            fontWeight: 500,
          }}
        >
          ย้อนกลับ
        </Button>
      </div>
    </Modal>
  );
}
