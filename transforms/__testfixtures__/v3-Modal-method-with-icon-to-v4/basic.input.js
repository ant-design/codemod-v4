import { Modal } from 'antd';

function showConfirm() {
  Modal.confirm({
    icon: 'ant-design',
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
    icon: 'ant-design',
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
    icon: 'plus',
    content: 'some messages...some messages...',
  });
}

function error() {
  Modal.error({
    title: 'This is an error message',
    icon: 'minus',
    content: 'some messages...some messages...',
  });
}

function warning() {
  Modal.warning({
    title: 'This is a warning message',
    icon: 'question',
    content: 'some messages...some messages...',
  });
}

function warningWithProps(props) {
  Modal.warning({
    title: 'This is a warning message',
    icon: props.icon,
    content: 'some messages...some messages...',
  });
}
