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
  return (<>
    <DatePicker.RangePicker popupClassName="dropdown0" />
    <RangePicker popupClassName="dropdown" />
    <RangePicker1 popupClassName="dropdown1" />
    <RangePicker2 popupClassName="dropdown2" />
    <RangePicker3 popupClassName="dropdown3" />
    <RangePicker4 popupClassName="dropdown4" />
    <RangePicker5 popupClassName="dropdown5" />
    <RangePicker6 popupClassName="dropdown6" />
  </>);
};
