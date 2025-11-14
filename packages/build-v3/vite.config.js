import { defineConfig } from 'vite'
import vue3 from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue3()
  ],
  build: {
    outDir: '../../dist/vue3',
    lib: {
      entry: resolve(__dirname, '../../packages/lib/index.js'),
      name: 'MyVueUi',
      fileName: fmt => `ul-question-test-ui.${fmt}.js`
    },
    rollupOptions: {
      external: [
        'vue',
        // '@opentiny/vue',
        // 'element-plus-v3'
        /^@opentiny\/vue/,   // 整个 @opentiny/vue 家族全部 external
        // /^@opentiny\/vue-icon/
      ],
      output: { 
        globals: { 
          vue: 'Vue', 
          '@opentiny/vue': 'Tiny', 
        } 
      }
    }
  }
})