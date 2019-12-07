import { AntDesignOutlined, MinusOutlined, PlusOutlined, QuestionOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { Modal as AModal } from '@forked/antd';

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
  AModal.info({
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
  AModal.error({
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
