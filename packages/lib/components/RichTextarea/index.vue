<template>
  <div class="ritchtextarea-container">
    <TinyFluentEditor ref="fluentEditorRef" v-model="content" :placeholder="placeholderText" :data-type="false" :data-upgrade="false" :options="options"/>
    <FileList ref="fileList" mode="edit" type="block" :isPreview="true" :list="list"
      :isShowLimitTimes="isShowLimitTimes" :is-question-bank="isQuestionBank" @deleteFile="deleteFile">
    </FileList>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue-demi'
import { TinyFluentEditor, Message } from '@opentiny/vue'
import FileList from "../FileList/index.vue";
import { handlerErrCode } from "../../utils/file.js";
import { handleNum } from "../../utils";
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
    }
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
        content.value = val
      },
      { immediate: true }
    )

    watch(content, (val) => {
      emit('change', val)
    })
    const options = ref({
      placeholder: props.placeholderText,
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

    return {
      content,
      initSrtUploder,
      addFile,
      deleteFile,
      options,
      fluentEditorRef,
      getEditor,
      insertContent
    }
  }
});
</script>

<style lang="scss"></style>
