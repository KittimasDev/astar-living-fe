import moment from "moment";
import "moment/locale/th";

moment.locale("th");

// override ให้ YYYY + 543
moment.updateLocale("th", {
  meridiemParse: /ก่อนเที่ยง|หลังเที่ยง/,
  longDateFormat: {
    LT: "H:mm",
    LTS: "H:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D MMMM YYYY",
    LLL: "D MMMM YYYY H:mm",
    LLLL: "dddd, D MMMM YYYY H:mm",
  },
});

// hook render year → พศ
const oldFormat = moment.prototype.format;
moment.prototype.format = function (fmt) {
  const result = oldFormat.call(this, fmt);
  if (!this.isValid()) return result;

  // replace ค.ศ. → พ.ศ.
  // ใช้ regex เฉพาะปี 4 หลัก
  return result.replace(/(\d{4})/g, (year) => {
    return (parseInt(year, 10) + 543).toString();
  });
};

export default moment;
