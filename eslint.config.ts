import antfu from '@antfu/eslint-config'

export default antfu().overrideRules({
  'antfu/if-newline': null,
  'node/prefer-global/process': null,
})
