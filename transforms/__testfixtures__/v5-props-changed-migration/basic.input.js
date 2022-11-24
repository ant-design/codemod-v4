import { Tag, Modal, Slider } from 'antd';

const App = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Tag
        visible={visible}
      />
      <Tag
        visible
      />
      <Modal
        visible={visible}
      />
      <Slider tooltipVisible={true} tooltipPlacement="bottomLeft" />
    </>
  );
};

const App1 = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Tag
      visible={visible}
    />
  );
};

const App2 = () => {
  return (
    <Tag
      visible
    />
  );
};
