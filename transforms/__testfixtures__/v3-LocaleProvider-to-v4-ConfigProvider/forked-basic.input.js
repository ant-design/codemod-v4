import { LocaleProvider } from '@forked/antd';

const App = () => {
  return (
    <LocaleProvider {...yourConfig}>
      <Main />
    </LocaleProvider>
  );
}
