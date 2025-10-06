module.exports = function (api) {
  const isEnvTest = process.env.NODE_ENV === 'test'
  api.cache(false)

  const presets = [
    [
      '@babel/preset-typescript',
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        modules: isEnvTest ? 'commonjs' : 'auto',
      },
    ],
  ]

  const plugins = [['@babel/plugin-proposal-private-methods', { loose: true }]]

  return {
    presets,
    plugins,
  }
}
