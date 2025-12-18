<template>
  <div class="files-component">
    <!-- 块级文件列表 -->
    <ul class="file-list-block" v-if="list && list.length > 0 && type === 'block'">
      <li v-for="(item, index) in list" :key="index + item.fileUrl + item.fileKey">
        <template v-if="!isPreview || (item.status === 1 || item.status === 3)">
          <div class="icon-wrapper">
            <img class="svg-img" :src="getFileSvg(item.fileUrl)" alt="">
          </div>
          <div class="detail">
            <div class="name">{{ item.fileName }}</div>
            <div class="info">
              <span class="size">{{ formatSize(item.fileSize) }}</span>
              <!-- 上传进度条 -->
              <div class="progress-wrapper"
                v-if="mode === 'edit' && item.progress >= 0 && item.progress < 100 && item.status !== 3">
                <div class="progress-bar">
                  <div class="bar" :style="{ width: item.progress + '%' }"></div>
                </div>
                <span class="progress-value">{{ item.progress }}%</span>
                <span class="cancel" @click="cancelUpload(item, index)">{{ t('cancel') }}</span>
              </div>
              <!-- 操作按钮组 -->
              <div class="operations" v-else>
                <a href="javascript:;" class="ul-link" v-if="canPreview && isFileCanPreview(item) && item.status !== 3"
                  @click="showPreview(item)">
                  {{ t('view') }}
                </a>
                <span class="upload-fail" v-if="item.status === 3">{{ item.errMessage }}</span>
                <a href="javascript:;" v-if="mode === 'edit'" class="ul-link" @click.stop="deleteFile(item, index)">
                  {{ t('delete') }}
                </a>
                <a href="javascript:;" v-else class="ul-link" @click="download(item.fileUrl)">
                  {{ t('download') }}
                </a>
              </div>
            </div>
          </div>
        </template>
        <!-- 预览模式 -->
        <div class="preview-container" v-else-if="isPreview && item.status !== 3">
          <div class="preview-content" :class="{ 'audio-preview': isAudio(item) }">
            <Preview :resource="item" :times="isShowLimitTimes ? item.lisCount : 0" :is-question-bank="isQuestionBank"
              :showDownLoad="showDownLoad" :customFullSreen="customFullSreen" :audioMode="audioMode"
              :isMobile="isMobile" :audioTime="audioTime" />
            <div class="operations" v-if="mode === 'edit'">
              <a href="javascript:;" class="ul-link" @click.stop="deleteFile(item, index)">
                {{ t('delete') }}
              </a>
            </div>
          </div>
          <!-- 播放次数限制设置 -->
          <!-- <div class="set-lisCount-wrap" :class="t('langCss')"
            v-if="isShowLimitTimes && mode === 'edit' && isAudio(item) && !isQuestionBank">
            <span>
              {{ t('numberOfPlaysAllowed') }}：
              <tiny-base-select v-model="item.lisCount" :placeholder="t('notLimit')">
                <tiny-option v-for="times in playerTimes" :key="times" :label="times === -1 ? t('notLimit') : times"
                  :value="times" />
              </tiny-base-select>
            </span>
          </div> -->
        </div>
      </li>
    </ul>
    <!-- 行内文件列表 -->
    <div v-if="list && list.length > 0 && type === 'inline'">
      <ul class="file-list-inline">
        <li v-for="(item, index) in list" :key="index">
          <img class="svg-img" :src="getFileSvg(item.fileUrl)" alt="">
          <span class="name">{{ item.fileName }}</span>
          <span class="size">{{ formatSize(item.fileSize) }}</span>
          <!-- 上传进度条 -->
          <div class="progress-wrapper" v-if="mode === 'edit' && item.progress >= 0 && item.progress < 100">
            <div class="progress-bar">
              <div class="bar" :style="{ width: item.progress + '%' }"></div>
            </div>
            <span class="progress-value">{{ item.progress }}%</span>
            <span class="cancel" @click="cancelUpload(item, index)">{{ t('cancel') }}</span>
          </div>
          <!-- 操作按钮 -->
          <a href="javascript:;" class="ul-link" v-if="canPreview && isFileCanPreview(item) && item.status !== 3"
            @click="showPreview(item)">
            {{ t('view') }}
          </a>
          <span class="upload-fail" v-if="item.status === 3">{{ item.errMessage }}</span>
          <a href="javascript:;" v-if="mode === 'edit'" class="ul-link" @click="deleteFile(item, index)">
            {{ t('delete') }}
          </a>
          <a href="javascript:;" v-else class="ul-link" @click="download(item.fileUrl)">
            {{ t('download') }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue-demi'
import Preview from "./Preview.vue";
// import showPreview from "./PreviewMask.js";
import { TinyBaseSelect, TinyOption, Modal  } from "@opentiny/vue";
import { fileIcon, formatSize, formatFileType, getFileSvg } from "@/utils/file.js";
import Obs from "@/plugins/ulearning-obs.js";
import { useT } from "../../locale/index.js"
// import uploadMixins from "@/mixins/upload.js"

export default defineComponent({
  name: "FileList",
  // mixins: [uploadMixins],
  components: {
    Preview,
    TinyBaseSelect,
    TinyOption
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: "edit"
    },
    type: {
      type: String,
      default: "block"
    },
    isPreview: {
      type: Boolean,
      default: true
    },
    isShowLimitTimes: {
      type: Boolean,
      default: true
    },
    canPreview: {
      type: Boolean,
      default: true
    },
    editorble: {
      type: Boolean,
      default: false
    },
    showDownLoad: {
      type: Boolean,
      default: true
    },
    isQuestionBank: {
      type: Boolean,
      default: false
    },
    hideFullScreen: {
      type: Boolean,
      default: false
    },
    customFullSreen: {
      type: Boolean,
      default: true
    },
    audioMode: {
      type: String,
      default: 'bar'
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    audioTime: {
      type: Number,
      default: 0
    },
    actionIndex: {
      type: Number,
      default: 0
    }
  },
  setup(props, { emit }) {
    const t = useT()
    // 响应式数据
    const state = reactive({
      obs: {},
      currentFile: {},
      playerTimes: [-1, 1, 2, 3, 4, 5]
    })

    // 取消上传
    const cancelUpload = (item, index) => {
      item.cancel && item.cancel()
      emit("deleteFile", item, index)
    }

    // 删除文件（带确认）
    const deleteFile = (item, index) => {
      Modal.confirm(t('confirmDelete')).then((res) => {
        console.log(res,'res');
        if(res === 'confirm') {
          item.actionIndex = props.actionIndex
          emit("deleteFile", item, index)
        }
      })
    }

    // 下载文件
    const download = (path) => {
      const obs = new Obs(props.uploadOptions)
      obs.download(path)
    }

    // 显示预览
    const showPreviewHandle = (item) => {
      // showPreview({
      //   resource: {
      //     ...item,
      //     hideFullScreen: props.hideFullScreen
      //   },
      //   editorble: props.editorble,
      //   showDownLoad: props.showDownLoad
      // })
    }

    // 判断文件是否可预览
    const isFileCanPreview = (item) => {
      const type = formatFileType(item.fileUrl)
      return ["audio", "video", "image", "document"].includes(type)
    }

    // 判断是否为音频文件
    const isAudio = (item) => {
      const type = formatFileType(item.fileUrl)
      return type === "audio"
    }

    return {
      ...state,
      t,
      fileIcon,
      getFileSvg,
      formatSize,
      cancelUpload,
      deleteFile,
      download,
      showPreview: showPreviewHandle,
      isFileCanPreview,
      isAudio
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.operation {
  .recording {
    display: inline-block;
    margin-left: calc(20 * var(--question-font-size));

    .status {
      margin-right: calc(10 * var(--question-font-size));
    }
  }
}

.progress-wrapper {
  float: left;
  margin-left: calc(20 * var(--question-font-size));

  .progress-value {
    color: #969696;
    margin-left: calc(10 * var(--question-font-size));
  }

  .cancel {
    margin-left: calc(10 * var(--question-font-size));
    cursor: pointer;
  }
}

.progress-bar {
  position: relative;
  width: calc(80 * var(--question-font-size));
  height: calc(6 * var(--question-font-size));
  display: inline-block;
  background-color: #cbcbd1;
  border-radius: calc(3 * var(--question-font-size));
  margin-bottom: calc(2 * var(--question-font-size));

  .bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background-color: #529FFF;
    border-radius: calc(3 * var(--question-font-size));
  }
}

.file-list-block {
  margin: calc(8 * var(--question-font-size)) 0 0 0;
  padding: calc(4 * var(--question-font-size)) 0;

  li {
    padding: calc(8 * var(--question-font-size)) calc(12 * var(--question-font-size));
    line-height: calc(20 * var(--question-font-size));
  }

  .icon-wrapper {
    float: left;
    padding: calc(2 * var(--question-font-size)) 0;
    i {
      font-size: calc(36 * var(--question-font-size));
      line-height: 1;
    }
  }

  .detail {
    margin-left: calc(46 * var(--question-font-size));

    .name {
      line-height: calc(20 * var(--question-font-size));
    }

    .info {
      zoom: 1;
      &:after {
        display: block;
        height: 0;
        content: ' ';
        clear: both;
      }

      .size {
        float: left;
        color: #969696;
      }
    }

    .operations {
      float: left;
      margin-left: calc(20 * var(--question-font-size));

      a {
        margin-right: calc(10 * var(--question-font-size));
      }
    }
  }
}

.choice-file-list .file-list-block {
  margin: calc(4 * var(--question-font-size)) 0 calc(8 * var(--question-font-size));
  padding: 0;

  li {
    padding: 0 0 calc(12 * var(--question-font-size)) 0;

    &:last-child {
      padding: 0;
    }
  }
}

.answer-file-list .file-list-block {
  margin: 0;
  padding: 0;

  li {
    margin-top: calc(4 * var(--question-font-size));
    padding: 0;
  }
}

.title-file-list .file-list-block {
  padding: 0;

  li {
    padding: calc(8 * var(--question-font-size)) 0;
  }
}

.preview-container {
  .preview-content {

    .resource-wrap,
    .operations {
      display: inline-block;
      vertical-align: bottom;
    }

    .resource-wrap-fullScreen {
      display: block;
      margin-right: 0;
    }

    .resource-wrap {
      margin-right: calc(16 * var(--question-font-size));
      max-width: 100%;
    }

    .operations {
      .ul-link+.ul-link {
        margin-left: calc(20 * var(--question-font-size));
      }
    }

    &.audio-preview {

      .resource-wrap,
      .operations {
        vertical-align: top;
        line-height: calc(36 * var(--question-font-size));
      }
    }
  }

  .set-lisCount-wrap {
    margin-top: calc(10 * var(--question-font-size));
    font-size: calc(14 * var(--question-font-size));
    color: #444444;

    .ul-select {
      margin-left: calc(10 * var(--question-font-size));
      width: calc(110 * var(--question-font-size));
    }

    &.idCss {
      .ul-select {
        width: calc(140 * var(--question-font-size));
      }
    }
  }
}

.file-list-inline {
  padding: calc(5 * var(--question-font-size)) 0;
  margin: 0;

  li {
    zoom: 1;
    &:after {
      display: block;
      height: 0;
      content: ' ';
      clear: both;
    }
    padding: calc(5 * var(--question-font-size)) 0;
    font-size: calc(12 * var(--question-font-size));
    line-height: calc(20 * var(--question-font-size));
  }

  i {
    float: left;
    font-size: calc(18 * var(--question-font-size));
  }

  .name {
    float: left;
    margin: 0 calc(10 * var(--question-font-size));
    max-width: calc(250 * var(--question-font-size));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .size {
    float: left;
    color: #969696;
  }

  .ul-link {
    float: left;
    margin-left: calc(16 * var(--question-font-size));
    font-size: calc(12 * var(--question-font-size));
  }

  .progress-wrapper {
    float: left;
  }
}

.upload-fail {
  margin-right: calc(10 * var(--question-font-size));
  color: #F60000;
}
.svg-img {
  width: calc(36 * var(--question-font-size));
}
</style>