import { DatePicker, InputProps } from "antd";
import moment from "moment-timezone";
import { Controller, get, useFormContext } from "react-hook-form";

interface Props {
  label: string;
  name: string;
  rules?: any;
  showTime?: boolean;
  format?: string;
  useDefaultToday?: boolean;
  disabledcurrent?: boolean;
}

const DateRangeInput = ({
  label,
  name,
  rules,
  showTime = false,
  format = showTime ? "DD-MM-YYYY HH:mm:ss" : "DD-MM-YYYY",
  useDefaultToday = false,
  disabledcurrent = false,
}: Props & InputProps) => {
  const { control, watch, formState } = useFormContext();
  const invalid = !!get(formState.errors, name);

  const disabledDate = (current: moment.Moment) => {
    return current && current > moment().endOf("day").tz("Asia/Bangkok");
  };

  const getBangkokDate = () => {
    return moment.tz("Asia/Bangkok");
  };

  return (
    <div className="mt-4">
      <label>{label}</label>
      <br />
      <Controller
        control={control}
        name={name}
        defaultValue={watch(name)}
        rules={rules}
        render={({ field: { value, onChange } }) => (
          <DatePicker.RangePicker
            className={`range-picker-${name} h-11 rounded-md w-full`}
            defaultValue={
              useDefaultToday ? [getBangkokDate(), getBangkokDate()] : undefined
            }
            status={invalid ? "error" : ""}
            onChange={(dates) => {
              // ✅ ป้องกันกรณี dates เป็น null
              if (!dates) {
                onChange(null);
                return;
              }

              const [start, end] = dates;
              const startBangkok = start
                ? moment.tz(start, "Asia/Bangkok")
                : null;
              const endBangkok = end ? moment.tz(end, "Asia/Bangkok") : null;

              onChange([startBangkok, endBangkok]);
            }}
            showTime={showTime}
            format={format}
            value={value}
            disabledDate={disabledcurrent ? disabledDate : undefined}
          />
        )}
      />
      {invalid && (
        <div>
          <small className="text-red-1">กรุณาระบุข้อมูล</small>
        </div>
      )}
    </div>
  );
};

export default DateRangeInput;
