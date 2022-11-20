const testAntdImportRegex = /(?:\(.+\)\s+)?(?:"|').+(~?antd\/.+\.less)(?:"|')$/;

function checkImportAntd(params) {
  return params.includes('antd') && testAntdImportRegex.test(params);
}

module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-plugin-remove-antd-less',
    AtRule: {
      import: atRule => {
        if (checkImportAntd(atRule.params)) {
          // 直接 replaceWith 会导致无限循环
          // atRule.replaceWith(atRule.clone({ raws: { before: '//' } }));
          atRule.remove();
        }
      },
    },
  };
};

module.exports.postcss = true;
