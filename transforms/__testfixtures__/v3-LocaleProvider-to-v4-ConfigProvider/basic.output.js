import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider {...yourConfig}>
      <Main />
    </ConfigProvider>
  );
}
