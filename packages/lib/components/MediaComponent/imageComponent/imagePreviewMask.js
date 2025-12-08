// import Vue from "vue"
// // import i18n from '@/locale'
// import imagePreviewMask from "./imagePreviewMask.vue";

// const ImagePreviewConstructor = Vue.extend(imagePreviewMask);

// let instance;

// const initInstance = () => {
//   instance = new ImagePreviewConstructor({
//     el: document.createElement('div'),
//     methods: {
//       hideHandler() {
//         document.body.removeChild(instance.$el);
//         instance = null
//       }
//     },
//     // i18n: i18n
//   })
// }

// export default function showImage(options) {
//   if (options.isMobile) {
//     options.imagePreview({
//       images: [options.resource.fileUrl],
//       showIndex: false
//     });
//     return 
//   }
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