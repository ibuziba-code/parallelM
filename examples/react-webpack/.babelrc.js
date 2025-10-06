const isEnvTest = process.env.NODE_ENV === 'test'

module.exports = {
  presets: [
    'react-app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        modules: isEnvTest ? 'commonjs' : 'auto',
      },
    ],
  ],
  plugins: [],
}
