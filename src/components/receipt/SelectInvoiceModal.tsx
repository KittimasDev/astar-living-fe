import { Modal, Button, Spin, Table, Checkbox, Radio } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ReceiptAPIs } from "../../networks/receipt.api";
import moment from "moment";

type InvoiceItemType = "MAINTENANCE" | "FINE" | "COLLECTION";

type InvoiceRow = {
  id: number;
  year: number;
  month: number;
  monthLabel: string;
  invoiceNo: string;
  items: {
    MAINTENANCE?: { id: number; amount: number; status?: string };
    FINE?: { id: number; amount: number; status?: string };
    COLLECTION?: { id: number; amount: number; status?: string };
  };
  have_discount: boolean;
};

type SelectedState = {
  [invoiceId: number]: {
    MAINTENANCE?: boolean;
    FINE?: boolean;
    COLLECTION?: boolean;
  };
};

type SelectInvoiceResult = {
  invoices: {
    invoice: {
      id: number;
      month: number;
      year: number;
      items: { id: number; label: string }[];
    };
    selectedItems: number[];
  }[];
  payAdvance12Months: boolean;
  haveDiscount: boolean;
};

export default function SelectInvoiceModal({
  open,
  resident,
  onBack,
  onNext,
}: {
  open: boolean;
  resident: any;
  onBack: () => void;
  // onNext: (
  //   selected: {
  //     invoice: {
  //       id: number;
  //       month: number;
  //       year: number;
  //       items: { id: number; label: string }[];
  //     };
  //     selectedItems: number[];
  //   }[]
  // ) => void;
  onNext: (result: SelectInvoiceResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selected, setSelected] = useState<SelectedState>({});
  const [haveDiscount, setHaveDiscount] = useState<any>();
  const [payAdvance12Months, setPayAdvance12Months] = useState(false);

  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ASC" | "DESC";
  }>({});

  const isJanuary = useMemo(() => {
    return moment().month() === 0;
  }, []);

  useEffect(() => {
    if (!open) return;

    // reset state ทุกครั้งที่เปิด modal
    setSelected({});
    setPayAdvance12Months(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setInvoices([]);
      setSelected({});
      return;
    }

    if (!resident?.id) return;

    setLoading(true);
    ReceiptAPIs.getReceipt(resident.id, {
      order_field: sorter.field,
      order_type: sorter.order,
    })
      .then((res) => {
        const data = res?.data?.body?.invoices || [];

        setHaveDiscount(res?.data?.body?.have_discount);

        console.log("data", data);

        const mapped: InvoiceRow[] = data.map((inv: any) => {
          const items: InvoiceRow["items"] = {};

          (inv.items || []).forEach((it: any) => {
            switch (it.key) {
              case "MAINTENANCE":
                items.MAINTENANCE = {
                  id: it.id,
                  amount: it.amount,
                  status: it.status,
                };
                break;

              case "FINE":
                items.FINE = {
                  id: it.id,
                  amount: it.amount,
                  status: it.status,
                };
                break;

              case "COLLECTION":
                items.COLLECTION = {
                  id: it.id,
                  amount: it.amount,
                  status: it.status,
                };
                break;
            }
          });

          const monthLabel = inv.month_th
            ? inv.month_th.replace(/\s*\d+$/, "")
            : "";

          return {
            id: inv.payment_id,
            invoiceNo: inv.invoice_no,
            year: inv.year,
            month: inv.month,
            monthLabel: monthLabel,
            items,
            is_notices_cancelled: inv.is_notices_cancelled,
          };
        });

        setInvoices(mapped);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [open, resident, sorter]);

  console.log("inv", invoices);

  const toggle = (
    invoiceId: number,
    key: InvoiceItemType,
    checked: boolean,
  ) => {
    setSelected((prev) => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        [key]: checked,
      },
    }));
  };

  const toggleInvoiceAll = (row: InvoiceRow, checked: boolean) => {
    const next: SelectedState = { ...selected };

    if (!checked) {
      delete next[row.id];
    } else {
      const items: SelectedState[number] = {};
      if (row.items.MAINTENANCE && !isItemPaid(row.items.MAINTENANCE))
        items.MAINTENANCE = true;
      if (row.items.FINE && !isItemPaid(row.items.FINE)) items.FINE = true;
      if (row.items.COLLECTION && !isItemPaid(row.items.COLLECTION))
        items.COLLECTION = true;
      next[row.id] = items;
    }

    setSelected(next);
  };

  // select all ตามประเภท (FINE / COLLECTION / MAINTENANCE)
  const toggleColumnAll = (key: InvoiceItemType, checked: boolean) => {
    const next: SelectedState = { ...selected };

    invoices.forEach((inv) => {
      if (!inv.items[key] || isItemPaid(inv.items[key])) return; // invoice นี้ไม่มี item นี้ หรือ item เป็น PAID → ข้าม

      next[inv.id] = {
        ...next[inv.id],
        [key]: checked,
      };
    });

    setSelected(next);
  };

  const isItemPaid = (item: any) => item?.status === "PAID";

  const columnHasAny = (key: InvoiceItemType) =>
    invoices.some((inv) => !!inv.items[key] && !isItemPaid(inv.items[key]));

  const columnAllChecked = (key: InvoiceItemType) =>
    invoices
      .filter((inv) => inv.items[key] && !isItemPaid(inv.items[key]))
      .every((inv) => selected[inv.id]?.[key]);

  // const invoiceHasAnyItem = (inv: InvoiceRow) =>
  //   Object.keys(inv.items).length > 0;

  const invoiceHasAnyItem = (inv: InvoiceRow) =>
    Object.values(inv.items).some((item) => Boolean(item) && !isItemPaid(item));

  const invoiceAllChecked = (inv: InvoiceRow) => {
    const keys = Object.keys(inv.items) as InvoiceItemType[];
    const selectableKeys = keys.filter((k) => !isItemPaid(inv.items[k]));
    return (
      selectableKeys.length > 0 &&
      selectableKeys.every((k) => selected[inv.id]?.[k])
    );
  };

  const headerAllChecked =
    invoices.filter(invoiceHasAnyItem).length > 0 &&
    invoices.filter(invoiceHasAnyItem).every(invoiceAllChecked);

  const toggleAllInvoices = (checked: boolean) => {
    const next: SelectedState = {};

    if (checked) {
      invoices.forEach((inv) => {
        if (!invoiceHasAnyItem(inv)) return;

        const items: SelectedState[number] = {};
        if (inv.items.MAINTENANCE && !isItemPaid(inv.items.MAINTENANCE))
          items.MAINTENANCE = true;
        if (inv.items.FINE && !isItemPaid(inv.items.FINE)) items.FINE = true;
        if (inv.items.COLLECTION && !isItemPaid(inv.items.COLLECTION))
          items.COLLECTION = true;

        next[inv.id] = items;
      });
    }

    setSelected(next);
  };

  const invoiceIndeterminate = (inv: InvoiceRow) => {
    const flags = selected[inv.id];
    if (!flags) return false;

    const keys = Object.keys(inv.items) as InvoiceItemType[];
    const selectableKeys = keys.filter((k) => !isItemPaid(inv.items[k]));
    const checkedCount = selectableKeys.filter((k) => flags[k]).length;

    return checkedCount > 0 && checkedCount < selectableKeys.length;
  };

  const canSelectMaintenance = (inv: InvoiceRow) => {
    const hasOther = inv.items.FINE || inv.items.COLLECTION;

    if (!hasOther) return true; // มีแค่ค่าส่วนกลาง

    const flags = selected[inv.id] || {};
    return (
      (!inv.items.FINE || flags.FINE) &&
      (!inv.items.COLLECTION || flags.COLLECTION)
    );
  };

  const getSortOrder = (field: string) => {
    if (sorter.field !== field) return null;
    return sorter.order === "ASC" ? "ascend" : "descend";
  };

  const columns: any = useMemo(
    () => [
      {
        title: "ปี",
        dataIndex: "year",
        sortOrder: getSortOrder("year"),
        width: 70,
      },
      {
        title: "เดือน",
        dataIndex: "monthLabel",
        sortOrder: getSortOrder("month"),
        width: 90,
      },
      {
        title: (
          <Checkbox
            className="circle-checkbox"
            checked={headerAllChecked}
            indeterminate={
              !headerAllChecked &&
              Object.values(selected).some((v) =>
                Object.values(v || {}).some(Boolean),
              )
            }
            disabled={invoices.filter(invoiceHasAnyItem).length === 0}
            onChange={(e) => toggleAllInvoices(e.target.checked)}
          >
            <span className="text-[#0054a5]">เลขที่ใบแจ้งหนี้</span>
          </Checkbox>
        ),
        width: 180,
        sortOrder: getSortOrder("invoice_no"),
        render: (_: any, row: InvoiceRow) => {
          const keys = Object.keys(row.items) as InvoiceItemType[];
          const selectableKeys = keys.filter((k) => !isItemPaid(row.items[k]));
          const checked =
            selectableKeys.length > 0 &&
            selectableKeys.every((k) => selected[row.id]?.[k]);

          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Checkbox
                className="circle-checkbox"
                // disabled={keys.length === 0}
                disabled={selectableKeys.length === 0}
                checked={checked}
                indeterminate={invoiceIndeterminate(row)}
                onChange={(e) => toggleInvoiceAll(row, e.target.checked)}
              />
              <span>{row.invoiceNo || row.id}</span>
            </div>
          );
        },
      },
      {
        title: (
          <Checkbox
            disabled={!columnHasAny("FINE")}
            checked={columnHasAny("FINE") && columnAllChecked("FINE")}
            onChange={(e) => toggleColumnAll("FINE", e.target.checked)}
          >
            <span className="text-[#0054a5]">ค่าเบี้ยปรับ</span>
          </Checkbox>
        ),
        align: "center" as const,

        render: (_: any, row: InvoiceRow) => (
          <Checkbox
            // disabled={!row.items.FINE}
            disabled={!row.items.FINE || isItemPaid(row.items.FINE)}
            checked={!!selected[row.id]?.FINE}
            onChange={(e) => toggle(row.id, "FINE", e.target.checked)}
          />
        ),
      },
      {
        title: (
          <Checkbox
            disabled={!columnHasAny("COLLECTION")}
            checked={
              columnHasAny("COLLECTION") && columnAllChecked("COLLECTION")
            }
            onChange={(e) => toggleColumnAll("COLLECTION", e.target.checked)}
          >
            <span className="text-[#0054a5]">ค่าทวงถาม</span>
          </Checkbox>
        ),
        align: "center" as const,

        render: (_: any, row: InvoiceRow) => (
          <Checkbox
            // disabled={!row.items.COLLECTION}
            disabled={
              !row.items.COLLECTION || isItemPaid(row.items.COLLECTION)
            }
            checked={!!selected[row.id]?.COLLECTION}
            onChange={(e) => toggle(row.id, "COLLECTION", e.target.checked)}
          />
        ),
      },

      {
        title: <span className="text-[#0054a5]">ค่าส่วนกลาง</span>,
        align: "center" as const,
        render: (_: any, row: InvoiceRow) => (
          <Checkbox
            className="circle-checkbox"
            // disabled={!row.items.MAINTENANCE || !canSelectMaintenance(row)}
            disabled={
              !row.items.MAINTENANCE ||
              !canSelectMaintenance(row) ||
              isItemPaid(row.items.MAINTENANCE)
            }
            checked={!!selected[row.id]?.MAINTENANCE}
            onChange={(e) => toggle(row.id, "MAINTENANCE", e.target.checked)}
          />
        ),
      },
    ],
    [selected, sorter, invoices],
  );

  const hasSelection = Object.values(selected).some((v) =>
    Object.values(v || {}).some(Boolean),
  );

  const SORT_FIELD_MAP: Record<string, string> = {
    year: "year",
    monthLabel: "month",
    invoiceNo: "invoice_no",
  };

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={960}
      onCancel={onBack}
      bodyStyle={{
        padding: "28px",
        borderRadius: 16,
        background: "#fff",
      }}
    >
      <div className="text-[15px] font-medium mb-1">
        {resident?.full_name || resident?.name}
      </div>
      <div className="text-gray-500 mb-4">บ้านเลขที่ {resident?.house_no}</div>

      <div className="text-[15px] mb-4">เลือกใบแจ้งหนี้</div>

      {loading ? (
        <div className="flex justify-center items-center h-[240px]">
          <Spin />
        </div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={invoices}
          pagination={false}
          locale={{
            emptyText: "ไม่มีใบแจ้งหนี้ค้างชำระ",
          }}
          size="middle"
          className="custom-table"
          onChange={(_, __, sorter: any) => {
            const s = Array.isArray(sorter) ? sorter[0] : sorter;

            if (!s?.order) {
              setSorter({});
              return;
            }

            setSorter({
              field: SORT_FIELD_MAP[s.field],
              order: s.order === "ascend" ? "ASC" : "DESC",
            });
          }}
        />
      )}

      <div className="mt-6 px-2">
        <Checkbox
          checked={payAdvance12Months}
          // disabled={!haveDiscount}
          className="circle-checkbox"
          onChange={(e) => setPayAdvance12Months(e.target.checked)}
        >
          ชำระเงินล่วงหน้า 12 เดือน
          {!isJanuary && (
            <span className="ml-2 text-gray-400 text-sm">
              (เลือกได้เฉพาะเดือนมกราคม)
            </span>
          )}
        </Checkbox>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        <Button
          onClick={onBack}
          style={{
            borderRadius: 20,
            width: 120,
            height: 40,
            borderColor: "#E6E6E6",
            color: "#666",
          }}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          disabled={!hasSelection}
          onClick={() => {
            const payload = Object.entries(selected)
              .map(([invoiceId, itemFlags]) => {
                const invoice = invoices.find(
                  (inv) => inv.id === Number(invoiceId),
                );
                if (!invoice) return null;

                const selectedItems: number[] = [];
                const invoiceItems: any[] = [];

                // MAINTENANCE
                if (invoice.items.MAINTENANCE) {
                  invoiceItems.push({
                    id: invoice.items.MAINTENANCE.id,
                    label: "ค่าส่วนกลาง",
                  });
                  if (itemFlags?.MAINTENANCE) {
                    selectedItems.push(invoice.items.MAINTENANCE.id);
                  }
                }

                // FINE
                if (invoice.items.FINE) {
                  invoiceItems.push({
                    id: invoice.items.FINE.id,
                    label: "ค่าเบี้ยปรับ",
                  });
                  if (itemFlags?.FINE) {
                    selectedItems.push(invoice.items.FINE.id);
                  }
                }

                // COLLECTION
                if (invoice.items.COLLECTION) {
                  invoiceItems.push({
                    id: invoice.items.COLLECTION.id,
                    label: "ค่าทวงถาม",
                  });
                  if (itemFlags?.COLLECTION) {
                    selectedItems.push(invoice.items.COLLECTION.id);
                  }
                }

                if (selectedItems.length === 0) return null;

                return {
                  invoice: {
                    id: invoice.id,
                    month: invoice.month,
                    year: invoice.year,
                    items: invoiceItems,
                  },
                  selectedItems,
                };
              })
              .filter(
                (
                  x,
                ): x is {
                  invoice: {
                    id: number;
                    month: number;
                    year: number;
                    items: { id: number; label: string }[];
                  };
                  selectedItems: number[];
                } => x !== null,
              );

            // onNext(payload);
            onNext({
              invoices: payload,
              payAdvance12Months,
              haveDiscount: !!haveDiscount,
            });
          }}
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
      <style jsx>{`
        .circle-checkbox .ant-checkbox-inner {
          border-radius: 50%;
        }

        .circle-checkbox.ant-checkbox-checked .ant-checkbox-inner::after {
          display: none; /* เอาเครื่องหมายถูกออก */
        }

        .circle-checkbox.ant-checkbox-checked .ant-checkbox-inner {
          background-color: #1677ff;
          border-color: #1677ff;
        }

        .circle-checkbox.ant-checkbox-indeterminate .ant-checkbox-inner {
          background-color: #1677ff;
          border-color: #1677ff;
        }

        .circle-checkbox.ant-checkbox-indeterminate .ant-checkbox-inner::after {
          display: none;
        }
      `}</style>
    </Modal>
  );
}
