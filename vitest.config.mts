import { defineConfig, configDefaults } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, 'data'],
  },
})
