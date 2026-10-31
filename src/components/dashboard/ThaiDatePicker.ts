"use client";

import moment from "moment";
import generatePicker from "antd/lib/date-picker/generatePicker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";

const buddhistConfig = {
  ...momentGenerateConfig,

  getYear: (date: any) => moment(date).year() + 543,

  setYear: (date: any, year: number) => moment(date).year(year - 543),

  getNow: () => moment(),
};

export const ThaiDatePicker = generatePicker(buddhistConfig);
