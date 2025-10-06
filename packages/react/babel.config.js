module.exports = function (api) {
  const isEnvTest = process.env.NODE_ENV === 'test'
  api.cache(false)

  const presets = [
    '@babel/preset-typescript',
    'react-app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        modules: isEnvTest ? 'commonjs' : 'auto',
      },
    ],
  ]

  const plugins = []

  return {
    presets,
    plugins,
  }
}
