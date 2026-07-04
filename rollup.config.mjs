import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const production = process.env.BUILD === 'production';
const sourcemap = !production;

const typescriptPlugin = () =>
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: sourcemap,
    declaration: false,
    declarationMap: false,
    module: 'ESNext',
  });

export default [
  {
    input: 'lib/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap,
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap,
      },
    ],
    plugins: [typescriptPlugin()],
  },
  {
    input: 'lib/browser.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'wpRouter',
      exports: 'default',
      sourcemap,
    },
    plugins: [typescriptPlugin()],
  },
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
  {
    input: 'lib/browser.ts',
    output: {
      file: 'dist/index.umd.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
];
