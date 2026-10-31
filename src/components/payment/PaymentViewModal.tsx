import { Modal, Button } from "antd";
import Image from "next/image";
import { useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export default function PaymentViewModal({
  open,
  invoices = [],
  onBack,
  record,
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  dayjs.extend(utc);
  dayjs.extend(timezone);

  return (
    <Modal
      open={open}
      centered
      onCancel={onBack}
      footer={null}
      width={900}
      bodyStyle={{
        padding: "24px 32px 100px", // ✅ เผื่อพื้นที่ให้ footer ไม่โดนบัง
        borderRadius: 16,
      }}
      //   style={{
      //     borderRadius: 5,
      //     overflow: "hidden",
      //   }}
    >
      {/* ✅ scroll section */}
      <div ref={containerRef}>
        <div className="rounded-lg bg-white mb-8 p-6">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div>
                <Image
                  src="/logo.png"
                  alt="GardenView"
                  width={120}
                  height={10}
                />
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
                ใบแจ้งหนี้
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
                  <div>{record?.resident?.full_name}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="font-semibold">บ้านเลขที่</div>
                  <div>{record?.resident?.house_no}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] items-start">
                  <div className="font-semibold">ที่อยู่ / Address</div>
                  <div>{record?.resident?.address}</div>
                </div>
              </div>
              <div className=" flex flex-col gap-1">
                <div className="grid grid-cols-[140px_1fr]">
                  <div className="font-semibold">เลขที่ใบแจ้งหนี้ / No.</div>
                  <div>{record?.inv_no}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <div className="font-semibold">วันที่ / Date</div>
                  <div>
                    {dayjs(record?.created_at)
                      .tz("Asia/Bangkok")
                      .format("DD/MM/") +
                      (dayjs(record?.created_at).tz("Asia/Bangkok").year() +
                        543)}
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start">
                  <div className="font-semibold">เดือน / Month</div>
                  <div className="leading-snug">
                    {String(record?.month).padStart(2, "0")}/{record?.year}
                  </div>
                </div>
              </div>

              {/* 🟦 ฝั่งขวา — กล่องทั้งก้อนชิดขวา */}
              {/* <div className="w-1/2 text-left ">
                    <div className="font-semibold">เลขที่ใบแจ้งหนี้ / No.:</div>
                    <div className=" mb-1">680101000{index + 1}</div>

                    <div className="font-semibold">วันที่ / Date:</div>
                    <div className=" mb-1">01/01/2568</div>

                    <div className="font-semibold">เดือน / Month:</div>
                    <div className="">01/2568</div>
                  </div> */}
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
                <td className="py-2 pl-3"> </td>
                <td className="py-2 text-right"> </td>
                <td className="py-2 text-right"> </td>
                <td className="py-2 text-right pr-3"> </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-2 text-base font-semibold mr-2">
            <div className="mr-52">รวมเงินทั้งสิ้น</div>
            <div>0.00</div>
          </div>

          <div className="flex justify-between">
            <div className="w-2/3 border border-[#D9D9D9] p-3 mt-4 text-xs leading-relaxed rounded-md text-[#747474]">
              <div className="font-medium mb-1">หมายเหตุ :</div>
              <div>
                1. กรุณาชำระผ่านบัญชีธนาคารยูโอบี (UOB) เลขที่บัญชี :
                960-363-6607 ชื่อบัญชี : นิติบุคคลหมู่บ้านจัดสรร
                หมู่บ้านการ์เด้นวิว สาขา : สี่แยกศรีวรา
              </div>

              <div>
                2. กำหนดชำระภายในวันที่ 10 ของทุกเดือน หลังได้รับใบแจ้งหนี้
              </div>
              <div>
                3. กรณีชำระล่าช้า จะมีค่าเบี้ยปรับ 10% และค่าทวงถามครั้งละ 200
                บาท/เดือน ตามข้อบังคับนิติบุคคล
              </div>
            </div>
            <div className="flex justify-between mt-10 text-sm mr-4">
              <div />
              <div className="text-center">
                <div>__________________________</div>
                <div className="font-bold text-lg">นายกอ นามสกุลขอ</div>
                <div>นิติบุคคล</div>
                <div className="mt-4">วันที่ _______________</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Footer fixed (แยกจากส่วน scroll) */}
      <div
        className="flex justify-center gap-3  py-8 bg-white"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          //   borderTop: "1px solid #f0f0f0",
        }}
      >
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
      </div>
    </Modal>
  );
}
