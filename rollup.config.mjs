import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const dev = process.env.ENVIRONMENT === 'DEVELOPMENT'

export default [
  {
    input: './src/app.ts',
    output: {
      dir: './dist/',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      dev ? terser() : null
    ]
  }
]
