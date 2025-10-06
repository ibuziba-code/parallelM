import { babel } from '@rollup/plugin-babel'
import pkg from './package.json' with { type: 'json' }
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

const config = [
  // config for CommonJS
  {
    input: 'src/index.ts',
    output: { file: pkg.main, format: 'cjs', generatedCode: 'es5' },
    plugins: [
      // First perform constant replacement
      replace({
        values: {
          'process.env.PACKAGE_NAME': JSON.stringify(pkg.name),
          'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
        },
        preventAssignment: true,
      }),
      // TS conversion
      typescript({
        tsconfig: './tsconfig.cjs.json', // this TS config checks types only, Babel compiles in the next plugin
        exclude: ['**/*-test.ts'],
      }),
      // compile with Babel (see babel.config.js)
      babel({ babelHelpers: 'inline', include: ['.ts'] }),
    ],
  },
  // config for ES Modules
  {
    input: 'src/index.ts',
    output: { file: pkg.module, format: 'esm', generatedCode: 'es2015' },
    plugins: [
      // First perform constant replacement
      replace({
        values: {
          'process.env.PACKAGE_NAME': JSON.stringify(pkg.name),
          'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
        },
        preventAssignment: true,
      }),
      // TS conversion
      typescript({
        tsconfig: './tsconfig.esm.json', // TS-Config for ESM target
        exclude: ['**/*-test.ts'],
      }),
      // Note that we don't run through Babel for the ESM build because TS in this library is very simple
      // and does not use any feature not available in systems that support ESM.
    ],
  },
]

export default config
