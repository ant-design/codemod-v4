import { LocaleProvider } from 'antd';

const App = () => {
  return (
    <LocaleProvider {...yourConfig}>
      <Main />
    </LocaleProvider>
  );
}
