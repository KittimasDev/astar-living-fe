import { Modal, Button, Row, Col, Input, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined, DeleteFilled } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";

type ItemForm = {
  name: string;
  quantity: number;
  unit_price: number;
};

type FormValues = {
  items: ItemForm[];
};

export default function OtherReceiptFormModal({
  open,
  resident,
  onBack,
  onNext,
  resetKey,
}: {
  open: boolean;
  resident: any;
  onBack: () => void;
  onNext: (payload: any) => void;
  resetKey: any;
}) {
  const lastFocusedRef = useRef<{
    index: number;
    field: "name" | "quantity" | "unit_price";
  } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      items: [
        { name: "", quantity: undefined as any, unit_price: undefined as any },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  const hasInitializedRef = useRef(false);

  const MAX_ITEMS = 6;

  const onSubmit = (data: FormValues) => {
    const mappedItems = data.items.map((it) => ({
      ...it,
      total: it.quantity * it.unit_price,
    }));

    const grand_total = mappedItems.reduce((sum, it) => sum + it.total, 0);

    onNext({
      resident: {
        full_name: resident?.full_name,
        name: resident?.name,
        house_no: resident?.house_no,
      },
      items: mappedItems,
      grand_total,
    });
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={720}
      onCancel={onBack}
      bodyStyle={{
        padding: "28px",
        borderRadius: 16,
        background: "#fff",
      }}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      {/* header */}
      <div className="mb-6">
        <div className="text-lg font-medium text-center">รายการรายรับ</div>
        <div className="text-sm  mt-1">
          {resident?.full_name || resident?.name}
        </div>
        <div className="text-sm ">บ้านเลขที่ {resident?.house_no}</div>
      </div>

      {/* add item */}
      <div className="mt-4 flex justify-end mb-2">
        <Button
          type="primary"
          style={{ height: "40px", borderRadius: 5 }}
          disabled={fields.length >= MAX_ITEMS}
          onClick={() => {
            if (fields.length >= MAX_ITEMS) return;

            const lastFocus = lastFocusedRef.current;
            append({
              name: "",
              quantity: undefined as any,
              unit_price: undefined as any,
            });
            // 🔥 คืน focus กลับ
            if (lastFocus) {
              requestAnimationFrame(() => {
                setFocus(`items.${lastFocus.index}.${lastFocus.field}`);
              });
            }
          }}
          className="!bg-[#74BA3D] !border-[#74BA3D] rounded-md font-medium"
        >
          <div className="px-2">
            <PlusOutlined />
            <span className="ml-2">
              เพิ่มรายการ ({fields.length}/{MAX_ITEMS})
            </span>
          </div>
        </Button>
      </div>

      {/* items */}
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-xl p-4 relative"
          >
            <div className="font-medium mb-6">รายการที่ {index + 1}</div>

            {fields.length > 1 && index != 0 && (
              <button
                // className="border border-[#D6D8D9] p-2 rounded-full absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:cursor-pointer"
                className="
                  w-9 h-9
                  flex items-center justify-center
                  border border-[#D6D8D9]
                  rounded-full
                  absolute top-4 right-4
                  hover:bg-[#edf1ef]
               
                  cursor-pointer
                "
                onClick={() => remove(index)}
              >
                <DeleteFilled
                  style={{
                    color: "#D6D8D9",
                  }}
                  size={20}
                />
              </button>
            )}

            <Row gutter={[16, 16]}>
              {/* รายการรายรับ */}
              <Col span={24}>
                <label className="text-sm block mb-1">
                  รายการรายรับ <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name={`items.${index}.name`}
                  rules={{
                    required: "กรุณากรอกชื่อรายการค่าใช้จ่าย",
                    maxLength: {
                      value: 70,
                      message: "ชื่อรายการต้องไม่เกิน 70 ตัวอักษร",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      maxLength={70}
                      showCount
                      onFocus={() => {
                        lastFocusedRef.current = { index, field: "name" };
                      }}
                      placeholder="กรอกชื่อรายการค่าใช้จ่าย"
                      className="rounded-lg"
                      style={{
                        borderRadius: 20,
                        lineHeight: "40px",
                        height: 40,
                      }}
                    />
                  )}
                />
                {errors.items?.[index]?.name && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.items[index]?.name?.message}
                  </div>
                )}
              </Col>

              {/* จำนวนหน่วย */}
              <Col span={12}>
                <label className="text-sm block mb-1">
                  จำนวนหน่วย <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name={`items.${index}.quantity`}
                  rules={{
                    required: "กรุณากรอกจำนวนหน่วย",
                    min: { value: 1, message: "ต้องมากกว่า 0" },
                  }}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      controls={false}
                      min={1}
                      className="h-10 rounded-lg"
                      style={{
                        paddingTop: 4,
                        borderRadius: 20,
                        width: "100%",
                      }}
                      onFocus={() => {
                        lastFocusedRef.current = { index, field: "quantity" };
                      }}
                      placeholder="กรอกจำนวน"
                    />
                  )}
                />
                {errors.items?.[index]?.quantity && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.items[index]?.quantity?.message}
                  </div>
                )}
              </Col>

              {/* ราคาต่อหน่วย */}
              <Col span={12}>
                <label className="text-sm block mb-1">
                  ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name={`items.${index}.unit_price`}
                  rules={{
                    required: "กรุณากรอกราคาต่อหน่วย",
                    min: { value: 1, message: "ต้องมากกว่า 0" },
                  }}
                  render={({ field }) => (
                    <InputNumber
                      controls={false}
                      {...field}
                      min={1}
                      className="h-10 rounded-lg"
                      onFocus={() => {
                        lastFocusedRef.current = { index, field: "unit_price" };
                      }}
                      style={{
                        paddingTop: 4,
                        borderRadius: 20,
                        width: "100%",
                      }}
                      placeholder="กรอกราคาต่อหน่วย"
                    />
                  )}
                />
                {errors.items?.[index]?.unit_price && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.items[index]?.unit_price?.message}
                  </div>
                )}
              </Col>
            </Row>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="flex justify-center gap-3 mt-8">
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

        <Button
          type="primary"
          onClick={handleSubmit(onSubmit)}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            background: "#87D2F7",
            border: "none",
          }}
        >
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}
