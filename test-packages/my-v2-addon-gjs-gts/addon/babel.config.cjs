module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-typescript',
      {
        allExtensions: true,
        onlyRemoveTypeImports: true,
        allowDeclareFields: true,
      },
    ],
    '@embroider/addon-dev/template-colocation-plugin',
    '@babel/plugin-transform-class-static-block',
    require('decorator-transforms'),
    [
      'babel-plugin-ember-template-compilation',
      {
        targetFormat: 'hbs',
        transforms: [],
      },
    ],
    ...require('ember-cli-code-coverage').buildBabelPlugin(),
  ],
};
