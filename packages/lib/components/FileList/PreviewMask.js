// import Vue from "vue"
// import { i18n } from "@/locale/index.js";
// import store from '@/store'
// import PreviewMask from "./PreviewMask.vue";

// const PreviewMaskConstructor = Vue.extend(PreviewMask);

// let instance;

// const initInstance = () => {
//   instance = new PreviewMaskConstructor({
//     el: document.createElement('div'),
//     methods: {
//       hideHandler() {
//         document.body.removeChild(instance.$el);
//         instance = null
//       }
//     },
//     i18n: i18n,
//     store: store
//   })
// }

// export default function showPreview(options) {
//   if (!instance) {
//     initInstance();
//   }
//   for (let prop in options) {
//     if (options.hasOwnProperty(prop)) {
//       instance[prop] = options[prop];
//     }
//   }
//   document.body.appendChild(instance.$el);
// }