const {
  getAllV4IconNames,
  getV4IconComponentName,
} = require('../../utils/icon');

describe('test for transforms/utils/icon', () => {
  let warnSpy;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('test for getAllV4IconNames', () => {
    const ret = getAllV4IconNames();
    expect(ret.length > 700).toBeTruthy();
  });

  it('test for getV4IconComponentName', () => {
    expect(getV4IconComponentName('smile')).toBe('SmileOutlined');
    expect(getV4IconComponentName('smile', 'filled')).toBe('SmileFilled');

    expect(getV4IconComponentName('smile', 'twotone')).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      `This icon 'smile' has unknown theme 'twotone'`,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      `The icon name 'smile' with twotone cannot found, please check it at https://ant.design/components/icon`,
    );

    expect(getV4IconComponentName('cross-circle-o')).toBe('');

    expect(warnSpy).toHaveBeenCalledWith(
      `The icon name 'cross-circle-o' cannot found, please check it at https://ant.design/components/icon`,
    );
  });
});
