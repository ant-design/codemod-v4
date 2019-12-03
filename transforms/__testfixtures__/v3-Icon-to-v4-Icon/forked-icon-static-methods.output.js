import { createFromIconfontCN, getTwoToneColor, setTwoToneColor } from '@ant-design/icons';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
});

setTwoToneColor('#eb2f96');
getTwoToneColor(); // #eb2f96
