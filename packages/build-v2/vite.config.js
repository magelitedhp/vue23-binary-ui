import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue2()],
  build: {
    outDir: '../../dist/vue2',
    lib: {
      entry: resolve(__dirname, '../../packages/lib/index.js'),
      name: 'MyVueUi',
      fileName: fmt => `ul-question-test-ui.${fmt}.js`
    },
    rollupOptions: {
      external: [
        'vue', 
        '@vue/composition-api',
        /^@opentiny\/vue/,   // 整个 @opentiny/vue 家族全部 external
        // /^@opentiny\/vue/,
        // /^@opentiny\/vue-icon/
      ],
      output: { globals: { 
        vue: 'Vue', 
        '@opentiny/vue': 'Tiny' 
      } 
    }
    }
  }
})