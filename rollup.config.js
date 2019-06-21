import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

const babelOpts = {
  exclude: '**/node_modules/**',
  runtimeHelpers: true
}

export default [
  {
    input: 'index.js',
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules ||
        Object.keys(process.binding('natives'))
    ),
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      babel(babelOpts),
      terser({
        module: true
      }),
      sizeSnapshot()
    ],
    treeshake: true
  }
]
