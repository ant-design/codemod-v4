import * as React from 'react';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

const RangePicker1 = DatePicker.RangePicker;
const RangePicker2 = RangePicker1;
const RangePicker3 = RangePicker1;
const RangePicker4 = RangePicker2;

const RangePicker5 = RangePicker;
const RangePicker6 = RangePicker5;

const Comp = () => {
  return (
    <>
      <DatePicker.RangePicker dropdownClassName="dropdown0" />
      <RangePicker dropdownClassName="dropdown" />
      <RangePicker1 dropdownClassName="dropdown1" />
      <RangePicker2 dropdownClassName="dropdown2" />
      <RangePicker3 dropdownClassName="dropdown3" />
      <RangePicker4 dropdownClassName="dropdown4" />
      <RangePicker5 dropdownClassName="dropdown5" />
      <RangePicker6 dropdownClassName="dropdown6" />
    </>
  );
};
