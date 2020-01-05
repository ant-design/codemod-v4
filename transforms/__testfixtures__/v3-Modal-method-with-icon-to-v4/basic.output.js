import { AntDesignOutlined, MinusOutlined, PlusOutlined, QuestionOutlined } from '@ant-design/icons';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Modal } from 'antd';

function showConfirm() {
  Modal.confirm({
    icon: <AntDesignOutlined />,
    title: 'Do you Want to delete these items?',
    content: 'Some descriptions',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
}

function info() {
  Modal.info({
    title: 'This is a notification message',
    icon: <AntDesignOutlined />,
    content: (
      <div>
        <p>some messages...some messages...</p>
        <p>some messages...some messages...</p>
      </div>
    ),
    onOk() {},
  });
}

function success() {
  Modal.success({
    icon: <PlusOutlined />,
    content: 'some messages...some messages...',
  });
}

function error() {
  Modal.error({
    title: 'This is an error message',
    icon: <MinusOutlined />,
    content: 'some messages...some messages...',
  });
}

function warning() {
  Modal.warning({
    title: 'This is a warning message',
    icon: <QuestionOutlined />,
    content: 'some messages...some messages...',
  });
}

function warningWithProps(props) {
  Modal.warning({
    title: 'This is a warning message',
    icon: <LegacyIcon type={props.icon} />,
    content: 'some messages...some messages...',
  });
}
