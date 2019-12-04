import { ConfigProvider } from '@forked/antd';

const App = () => {
  return (
    <ConfigProvider {...yourConfig}>
      <Main />
    </ConfigProvider>
  );
}
