import { ConfigProvider as MyProvider } from '@forked/antd';

const App = () => {
  return (
    <MyProvider {...yourConfig}>
      <Main />
    </MyProvider>
  );
}
