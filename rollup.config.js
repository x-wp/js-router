const { nodeResolve } = require('@rollup/plugin-node-resolve');
const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies || {});

module.exports = {
  input: '.rollup/index.js',
  external,
  plugins: [nodeResolve()],
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
    },
  ],
};
