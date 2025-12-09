<template>
  <div class="ritchtextarea-container">
    <TinyFluentEditor ref="fluentEditorRef" v-model="content" :data-type="false" :data-upgrade="false"
      :options="options" :before-editor-init="beforeEditorInit"/>
    <FileList ref="fileList" mode="edit" type="block" :isPreview="true" :list="list"
      :isShowLimitTimes="isShowLimitTimes" :is-question-bank="isQuestionBank" @deleteFile="deleteFile">
    </FileList>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue-demi'
import { TinyFluentEditor, Message } from '@opentiny/vue'
import FileList from "../FileList/index.vue";
import { handlerErrCode } from "../../utils/file.js";
import { getUniqueValue, handleNum } from "@/utils"
import { useT } from "../../locale/index.js"
export default defineComponent({
  name: 'RichTextarea',
  components: {
    TinyFluentEditor,
    FileList
  },
  model: {
    prop: "value",
    event: "change",
  },
  props: {
    value: String,
    list: {
      type: Array,
      default() {
        return []
      }
    },
    maxNum: {
      type: Number,
      default: 1
    },
    isShowLimitTimes: {
      type: Boolean,
      default: true
    },
    index: {
      type: Number,
      default: 0
    },
    placeholderText: {
      type: String,
      default: "",
    },
    isQuestionBank: {
      type: Boolean,
      default: false,
    },
    type: {
      type: Number,
      default: 0,
    },
  },
  emits: ['change', 'addFile', 'deleteFile'],
  setup(props, { emit }) {
    const t = useT()
    const content = ref(props.value || '')
    const fluentEditorRef = ref(null)
    // 暴露给父组件的方法，用于访问TinyFluentEditor的方法
    const getEditor = () => {
      return fluentEditorRef.value
    }
    onMounted(() => {
      // 初始化编辑器内容
      const fluentEditor = fluentEditorRef.value.state.quill
      const toolbar = fluentEditor.getModule('toolbar')
      toolbar.addHandler('image1', function (value) {
        let jsx = `<span class="q-space" contenteditable="false" data-index="${getUniqueValue()}">(&nbsp;)</span>`
        insertContent(jsx)
      })
      toolbar.addHandler('video1', function (value) {
        let jsx = `<video src="https://tobs.ulearning.cn/resources/web/17548922973825322.mp4" devui-editorx-video="true" data-video-id=${getUniqueValue()} /></video>`
        insertContent(jsx)
      })
      toolbar.addHandler('audio', function (value) {
        let jsx = `<img src="https://tobs.ulearning.cn/resources/web/17548922973825322.png" devui-editorx-image="true" data-image-id=${getUniqueValue()} />`
        insertContent(jsx)
      })
    })
    // 插入内容到编辑器
    const insertContent = (newContent) => {
      console.log('插入内容:', newContent);
      // 检查光标是否在编辑器内的辅助函数
      const isCursorInEditor = () => {
        // 查找编辑器容器
        const editorContainers = document.querySelectorAll('.ritchtextarea-container');
        if (editorContainers.length === 0) return false;

        const container = editorContainers[0];

        // 获取当前选择
        let selection;
        if (window.getSelection) {
          selection = window.getSelection();
        } else if (document.getSelection) {
          selection = document.getSelection();
        } else {
          return false;
        }

        if (!selection || selection.rangeCount === 0) return false;

        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;

        // 检查光标是否在编辑器容器内
        let currentElement = commonAncestor;
        while (currentElement && currentElement !== document) {
          if (currentElement === container || container.contains(currentElement)) {
            return true;
          }
          currentElement = currentElement.parentNode;
        }

        return false;
      };

      // 首先判断光标是否在编辑器内
      if (!isCursorInEditor()) {
        console.log('光标不在编辑器内，不允许插入');
        return;
      }
      // 使用直接DOM操作作为主要插入方式
      console.log('使用直接DOM操作插入内容');
      
      // 获取当前选择和范围
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.log('没有选择区域，在末尾追加');
        content.value += newContent;
        return;
      }
      
      // 获取当前范围
      const range = selection.getRangeAt(0);
      
      // 创建临时容器解析HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = newContent;
      
      // 将所有子节点作为一个整体插入，以保持正确的顺序
      let insertedNode;
      
      if (tempContainer.childNodes.length === 1) {
        // 只有一个节点时直接插入
        insertedNode = tempContainer.firstChild;
        range.insertNode(insertedNode);
      } else {
        // 多个节点时，创建文档片段并一次性插入
        const fragment = document.createDocumentFragment();
        while (tempContainer.firstChild) {
          fragment.appendChild(tempContainer.firstChild);
        }
        insertedNode = range.insertNode(fragment);
      }
      
      // 确保插入成功
      let inserted = !!insertedNode;
      
      // 直接设置光标位置到所有插入内容的后面
      if (inserted) {
        // 创建新的范围
        const newRange = document.createRange();
        
        // 获取所有插入的内容
        const parentElement = insertedNode.parentNode;
        let lastInsertedElement = insertedNode;
        
        // 如果插入的是文档片段，找到实际插入的最后一个节点
        if (insertedNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          if (parentElement.lastChild) {
            lastInsertedElement = parentElement.lastChild;
          }
        }
        
        // 设置光标在插入内容的后面
        newRange.setStartAfter(lastInsertedElement);
        newRange.collapse(true);
        
        // 更新选择
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        console.log('直接DOM操作插入成功，光标已设置在所有插入内容的后面');
      }
      
      console.log('插入完成，状态:', inserted ? '成功' : '失败');
        
       // 手动触发编辑器的更新事件，确保content变量被正确更新
       if (inserted) {
         console.log('手动触发编辑器更新事件');
         
         // 查找编辑器容器
         const editorContainers = document.querySelectorAll('.ritchtextarea-container');
         if (editorContainers.length > 0) {
           const container = editorContainers[0];
           
           // 查找可编辑元素
           const editableElements = container.querySelectorAll('[contenteditable="true"], textarea, iframe');
           if (editableElements.length > 0) {
             const editableElement = editableElements[0];
             
             // 根据不同元素类型触发不同事件
             if (editableElement.tagName === 'TEXTAREA') {
               // 对于textarea，触发input事件
               editableElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
               editableElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
             } else if (editableElement.hasAttribute('contenteditable')) {
               // 对于contenteditable元素，触发input事件
               editableElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
               // 不触发selectionchange事件，避免影响光标位置
             } else if (editableElement.tagName === 'IFRAME') {
               // 对于iframe内的编辑器，尝试访问内部文档并触发事件
               try {
                 const iframeDoc = editableElement.contentDocument || editableElement.contentWindow.document;
                 const body = iframeDoc.querySelector('body');
                 if (body) {
                   body.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                   body.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                 }
               } catch (e) {
                 console.error('触发iframe内部事件失败:', e);
               }
             }
           }
         }
         
         // 在更新事件后再次确认光标位置（确保编辑器更新后光标位置不变）
         console.log('在更新事件后确认光标位置');
         
         // 重新获取选择对象
         const currentSelection = window.getSelection();
         if (currentSelection) {
           try {
             // 保存所有插入内容的最后一个节点
             const parentElement = insertedNode.parentNode;
             let lastInsertedElement = insertedNode;
             
             // 如果插入的是文档片段，找到实际插入的最后一个节点
             if (insertedNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
               if (parentElement.lastChild) {
                 lastInsertedElement = parentElement.lastChild;
               }
             }
             
             // 创建新的范围，确保光标在所有插入内容的后面
             const newRange = document.createRange();
             newRange.setStartAfter(lastInsertedElement);
             newRange.collapse(true);
             
             // 更新选择
             currentSelection.removeAllRanges();
             currentSelection.addRange(newRange);
             
             console.log('编辑器更新后，光标位置已重新设置在所有插入内容的后面');
           } catch (e) {
             console.error('确认光标位置失败:', e);
           }
         }
       }
      }
    
    watch(
      () => props.value,
      (val) => {
        // 只有当内容确实发生变化时才更新，避免不必要的光标跳动
        if (val !== content.value) {
          // 保存当前编辑器的光标位置（如果可能）
          let cursorPos = null
          const fluentEditor = fluentEditorRef.value?.state?.quill
          if (fluentEditor) {
            try {
              cursorPos = fluentEditor.getSelection()
            } catch (e) {
              console.error('获取光标位置失败:', e)
            }
          }
          // 更新内容
          content.value = val
          // 尝试恢复光标位置或设置到合理位置
          if (fluentEditor) {
            try {
              if (cursorPos && cursorPos.index <= val.length) {
                // 如果保存的光标位置有效，则恢复
                setTimeout(() => {
                  fluentEditor.setSelection(cursorPos.index, 0)
                  fluentEditor.focus()
                }, 0)
              } else {
                // 否则将光标设置到内容末尾
                setTimeout(() => {
                  fluentEditor.setSelection(val.length, 0)
                  fluentEditor.focus()
                }, 0)
              }
            } catch (e) {
              console.error('设置光标位置失败:', e)
            }
          }
        }
      },
      { immediate: true }
    )

    watch(content, (val, oldVal) => {
      if(props.type == 3 ) {
        const reg = /\s*\(\s*\)\s*/g
        // const reg = /（\s*）|\(\s*\)/g
        val = val.replace(reg, '(&nbsp;)')
      }
      emit('change', val)
    })
    const options = ref({
      placeholder: props.placeholderText,
      modules: {
        // 工具栏
        toolbar: [
          [
            {
              "font": [
                "yahei",
                "songti",
                "kaiti",
                "heiti",
                "lishu",
                "mono",
                "arial",
                "arialblack",
                "comic",
                "impact",
                "times"
              ]
            },
            {
              "size": [
                "12px",
                "13px",
                "14px",
                "15px",
                "16px",
                "17px",
                "18px",
                "19px",
                "20px",
                "22px",
                "24px",
                "26px",
                "29px",
                "32px",
                "36px",
                "40px",
                "48px",
                "72px"
              ]
            },
            {
              "lineheight": [
                "1",
                "1.2",
                "1.5",
                "2",
                "2.5",
                "3",
                "4",
                "5"
              ]
            },
            // {
            //   "header": [
            //     1,
            //     2,
            //     3,
            //     4,
            //     5,
            //     6,
            //     false
            //   ]
            // }
          ],
          ['bold', 'italic', 'underline', 'strike', {
            "color": []
          },
            {
              "background": []
            }],
          [
            {
              "list": "ordered"
            },
            {
              "list": "bullet"
            },
            {
              "align": []
            }
          ], [
            {
              "script": "sub"
            },
            {
              "script": "super"
            }
          ], [
            "image1",
            'audio', 'video1', 
            "better-table"
          ]
        ]
      }
    })
    // 简化的字幕上传初始化函数，移除了对Obs的依赖
    const initSrtUploder = (id, myFile) => {
      const element = document.getElementById(id);
      if (element) {
        console.log("字幕上传按钮已找到", element);
        // 这里可以添加简单的点击事件处理
        element.onclick = () => {
          console.warn("字幕上传功能暂时不可用");
        };
      }
    }
    const addFile = (up, file) => {
      if (props.list.length >= props.maxNum) {
        console.warn(t ? t('uploadFileError1') : 'uploadFileError1: max');
        return;
      }
      if (file.size > 1 * 1024 * 1024 * 1024) {
        console.warn(t ? t('uploadMediaError') : 'uploadMediaError: 1G');
        return;
      }
      up.startUpload(file)
      let myFile = {
        fileName: file.name,
        fileSize: file.size,
        fileUrl: file.name,
        status: 1,
        lisCount: -1,
        id: Date.now() + Math.random().toString(36).substr(2, 9)
      }
      file.onProgress = (progress) => {
        myFile.progress = handleNum(progress, 2, "floor")
      }
      file.onSuccess = () => {
        myFile.fileUrl = file.obsHost + '/' + file.key
        myFile.status = 2
        // let type = formatFileType(myFile.fileUrl);
        // if (type === 'audio') {
        //   this.$nextTick(() => {
        //     initSrtUploder(`srtBtn${myFile.id}`, myFile)
        //   })
        // }
      }
      file.onError = (err) => {
        myFile.errMessage = handlerErrCode(err.code)
        myFile.status = 3
      }
      myFile.cancel = () => {
        up.cancelUpload(file)
      }
      emit("addFile", myFile, props.index)
    }

    const deleteFile = (item, index) => {
      emit("deleteFile", index, props.index)
    }
    const beforeEditorInit = (FluentEditor) => {
      const imageIcon = `<svg t="1734490908682" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5918" width="200" height="200"><path d="M1084.416 32c52.288 0 95.296 40.064 99.84 91.136l0.448 9.152v764.288c0 52.288-40.064 95.232-91.136 99.84l-9.152 0.448H132.288a100.288 100.288 0 0 1-99.84-91.2L32 896.64V132.288c0-52.288 40.064-95.296 91.136-99.84L132.288 32h952.128z m-221.568 474.24l-223.808 167.872 87.936 62.336a41.216 41.216 0 0 1 12.992 51.584l-3.392 5.76a41.216 41.216 0 0 1-51.584 12.928l-5.76-3.392-275.2-196.096-290.112 201.856v87.488c0 8.768 5.952 16 14.08 17.92l4.288 0.448h952.128c8.832 0 16-5.952 17.92-14.08l0.448-4.288 3.136-176.448-2.688-1.472a35.2 35.2 0 0 1-4.672-2.944L862.848 506.24z m221.568-392.32H132.288a18.176 18.176 0 0 0-17.92 14.08l-0.448 4.288v579.712l266.368-188.608a40.32 40.32 0 0 1 41.792-3.392l5.376 3.392 141.888 100.928 271.104-203.392a41.28 41.28 0 0 1 46.784-1.792l4.992 3.84 210.56 187.008V132.288a18.176 18.176 0 0 0-14.08-17.92l-4.288-0.448z m-703.296 51.2a144 144 0 1 1-0.128 288.128 144 144 0 0 1 0.128-288.128z m0 69.12c-41.472 0-74.88 33.408-74.88 74.88 0 41.472 33.408 74.88 74.88 74.88 41.472 0 74.88-33.408 74.88-74.88 0-41.472-33.408-74.88-74.88-74.88z" fill-rule="nonzero"></path></svg>`
      const audioIcon = `<svg t="1734490908682" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5918" width="200" height="200"><path d="M992 705.6c-4.992 26.88-14.528 50.88-28.8 72.064-12.032 18.368-30.08 35.008-54.272 49.856-24.128 14.784-56.768 22.208-97.92 22.208-27.008 0-52.48-1.728-76.672-5.248a233.728 233.728 0 0 1-63.872-18.048 128.96 128.96 0 0 1-45.248-33.408 90.688 90.688 0 0 1-20.8-50.304 137.6 137.6 0 0 1 8.512-62.08c7.808-21.504 19.52-41.152 35.2-58.816a188.8 188.8 0 0 1 56.96-43.456 159.36 159.36 0 0 1 72.96-16.96c44.672 0 83.712 7.808 117.12 23.36V141.696L411.648 211.648l4.288 590.4v26.496c0 21.184-4.288 41.856-12.8 62.016a170.56 170.56 0 0 1-35.648 53.504 169.088 169.088 0 0 1-55.36 37.12 182.144 182.144 0 0 1-71.872 13.76c-28.416 0-54.656-2.624-78.784-7.936a234.688 234.688 0 0 1-63.872-23.296 139.072 139.072 0 0 1-44.8-38.144 104.64 104.64 0 0 1-20.16-52.48c-2.176-19.84 0.64-39.04 8.512-57.792 7.808-18.752 19.712-35.52 35.648-50.368 16-14.848 35.2-27.392 57.472-37.632 22.4-10.24 46.72-16.768 72.96-19.584a216.96 216.96 0 0 1 58.56-0.512c19.2 2.432 37.248 6.528 54.272 12.16V127.872L992 31.424v674.176z"></path></svg>`
      const videoIcon = `<svg t="1734491308472" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3380" width="200" height="200"><path d="M752.384 479.168a40.96 40.96 0 0 1 0 70.464l-205.696 122.88a41.28 41.28 0 0 1-62.08-35.2v-245.76a41.28 41.28 0 0 1 62.08-35.2l205.696 122.88z m-185.536-15.104v100.736l84.736-50.368-84.736-50.368z m534.848 450.88V113.92H114.304v801.024h987.392z m0 81.92H114.304c-45.44 0-82.304-36.672-82.304-81.92V113.92C32 68.672 68.864 32 114.304 32h987.392c45.44 0 82.304 36.672 82.304 81.92v801.024c0 45.248-36.864 81.92-82.304 81.92zM196.544 72.96c0-22.592 18.432-40.96 41.152-40.96 22.72 0 41.152 18.368 41.152 40.96v841.984c0 22.592-18.432 40.96-41.152 40.96a41.024 41.024 0 0 1-41.152-40.96V72.96z m41.152 277.632c22.72 0 41.152 18.304 41.152 40.96 0 22.592-18.432 40.96-41.152 40.96H73.152a41.024 41.024 0 0 1-41.152-40.96c0-22.656 18.432-40.96 41.152-40.96h164.544z m0 245.76c22.72 0 41.152 18.304 41.152 40.96 0 22.592-18.432 40.96-41.152 40.96H73.152a41.024 41.024 0 0 1-41.152-40.96c0-22.656 18.432-40.96 41.152-40.96h164.544zM937.152 72.96c0-22.592 18.432-40.96 41.152-40.96 22.72 0 41.152 18.368 41.152 40.96v841.984c0 22.592-18.432 40.96-41.152 40.96a41.024 41.024 0 0 1-41.152-40.96V72.96z m41.152 359.552a41.024 41.024 0 0 1-41.152-40.96c0-22.656 18.432-40.96 41.152-40.96h164.544c22.72 0 41.152 18.304 41.152 40.96 0 22.592-18.432 40.96-41.152 40.96h-164.544z m0 245.76a41.024 41.024 0 0 1-41.152-40.96c0-22.656 18.432-40.96 41.152-40.96h164.544c22.72 0 41.152 18.304 41.152 40.96 0 22.592-18.432 40.96-41.152 40.96h-164.544z"></path></svg>`
      const icons = FluentEditor.import('ui/icons')
      icons.image1 = imageIcon
      icons.audio = audioIcon
      icons.video1 = videoIcon
      const Parchment = FluentEditor.import('parchment')
      const ImageStyle = new Parchment.StyleAttributor('image1', 'color', {
        scope: Parchment.Scope.INLINE
      })
      const VideoStyle = new Parchment.StyleAttributor('video1', 'color', {
        scope: Parchment.Scope.INLINE
      })

      const AudioStyle = new Parchment.StyleAttributor('audio', 'color', {
        scope: Parchment.Scope.INLINE
      })
      FluentEditor.register('formats/image1', ImageStyle)
      FluentEditor.register('formats/video1', VideoStyle)
      FluentEditor.register('formats/audio', AudioStyle)
    }
    return {
      content,
      initSrtUploder,
      addFile,
      deleteFile,
      options,
      fluentEditorRef,
      getEditor,
      insertContent,
      beforeEditorInit
    }
  }
});
</script>

<style lang="scss">
.ql-image1  {
  margin-right: 0 !important;
  svg {
    width: 32px !important;
    scale: 0.65;
  }
}
</style>
