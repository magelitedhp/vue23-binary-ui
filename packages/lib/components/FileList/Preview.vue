<template>
  <div class="resource-wrap" :class="{ 'resource-wrap-fullScreen': isFullScreen }" @click.prevent.stop>
    <!-- 图片资源 -->
    <div class="resource-image" v-if="formatFileTypeComputed === 'image'">
      <img :src="fileUrl" @click="showImage">
    </div>
    <!-- 文档资源 -->
    <div class="resource-document" v-if="formatFileTypeComputed === 'document'">
      <div class="wrapper">
        <iframe :src="fileUrl"></iframe>
      </div>
    </div>
    <!-- 视频资源 -->
    <div class="resource-video" :style="{ width: width, height: height }" v-if="formatFileTypeComputed === 'video'">
      <div class="video-wrapper">
        <div class="video stop-swiping" v-show="!error" ref="control">
          <video ref="video" :id="'video-media' + id" class="custom-video" width="100%" height="100%" playsinline
            webkit-playsinline @loadedmetadata="loadedmetadata">
            <source type="video/mp4" :src="fileUrl" />
          </video>
        </div>
        <div class="error-tip" v-if="error">
          <span class="tip">
            {{ $t('transcodeTip') }}
            <span class="ul-link" @click="resetVideo">{{ $t('clickToTry') }}</span>
          </span>
        </div>
      </div>
    </div>
    <!-- 音频资源 -->
    <div class="resource-audio" v-if="formatFileTypeComputed === 'audio'">
      <div class="audio-wrapper">
        <AudioComponent :src="fileUrl" :times="times" :playedTimes="resource.playedTimes"
          :is-question-bank="isQuestionBank" :audioMode="audioMode" :audioTime="audioTime" @timesAdd="timesAdd"
          @setMediaInfo="setMediaInfo" @getMediaInfo="getMediaInfo" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue-demi'
import { formatFileType, getFullPath } from '../../utils/file.js'
import { DOCS_HOST, DOCS_SSL_VALUE } from '../../config/index.js'
import 'mediaelement'
import 'mediaelement/build/mediaelementplayer.min.css'
import AudioComponent from "../MediaComponent/audioComponent/audio.vue";

export default defineComponent({
  name: 'ResourcePreviewComponent',
  components: {
    AudioComponent
  },
  props: {
    resource: {
      type: Object,
      default: () => ({})
    },
    times: {
      type: Number,
      default: 0
    },
    showDownLoad: {
      type: Boolean,
      default: true
    },
    videoWidth: {
      type: String,
      default: '340px'
    },
    videoHeight: {
      type: String,
      default: '196px'
    },
    customFullSreen: {
      type: Boolean,
      default: false
    },
    isQuestionBank: {
      type: Boolean,
      default: false
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
    }
  },
  setup(props, { emit }) {
    // 获取组件实例（用于访问全局属性）
    const instance = getCurrentInstance()
    const global = instance?.appContext?.config?.globalProperties || {}
    const $t = global.$t || (key => key)
    const $store = global.$store || { state: {} }
    const $getUniqueValue = global.$getUniqueValue || (() => Math.random().toString(36).substr(2, 9))

    // 响应式变量
    const id = ref($getUniqueValue())
    const error = ref(false)
    const width = ref(props.videoWidth)
    const height = ref(props.videoHeight)
    const originalWidth = ref(0)
    const originalHeight = ref(0)
    const isFullScreen = ref(false)
    const hasPreview = ref(false)
    const player = ref(null)
    const media = ref(null)
    const control = ref(null)
    const video = ref(null)

    // 计算属性
    const formatFileTypeComputed = computed(() => {
      return formatFileType(props.resource.fileUrl)
    })

    const fileUrl = computed(() => {
      let path = props.resource.fileUrl || ''
      const fileType = formatFileTypeComputed.value

      if (fileType === 'document') {
        let src = DOCS_HOST + "?time=1"
        const location = getFullPathFn(path)

        if (location.indexOf("https://") !== -1) {
          src += "&ssl=" + DOCS_SSL_VALUE
        }
        src += "&furl=" + encodeURIComponent(location)
        return src
      } else if (fileType === 'video') {
        // 处理视频路径
        if (path.lastIndexOf('.') !== -1) {
          path = path.substring(0, path.lastIndexOf('.')) + '.mp4'
        }
        return getFullPathFn(path)
      } else {
        return getFullPathFn(path)
      }
    })

    // 方法定义
    const getFullPathFn = (path) => {
      if (!path) return ''
      try {
        const basePath = $store && $store.state && $store.state.exam && $store.state.exam.resourcesServer
        return getFullPath(path, basePath)
      } catch (error) {
        console.error('获取完整路径失败:', error)
        return path
      }
    }

    const handelVideo = () => {
      if (formatFileTypeComputed.value === 'video' && !hasPreview.value) {
        initVideo()
        hasPreview.value = true
      }
    }

    const initVideo = () => {
      // 先清理之前的播放器实例
      if (player.value) {
        try {
          player.value.pause()
          player.value.remove()
        } catch (e) {
          console.error('清理播放器失败:', e)
        }
        player.value = null
        media.value = null
      }

      error.value = false
      const videoId = 'video-media' + id.value

      try {
        player.value = new MediaElementPlayer(videoId, {
          muteText: $t ? $t('mute') : '静音',
          unmuteText: $t ? $t('unmute') : '取消静音',
          playText: $t ? $t('play') : '播放',
          pauseText: $t ? $t('pause') : '暂停',
          fullscreenText: $t ? $t('fullscreen') : '全屏',
          success: (mediaElement) => {
            media.value = mediaElement
          },
          error: (mediaElement, e) => {
            console.error('视频加载失败:', e)
            error.value = true
            // 错误时清理资源
            cleanupVideoPlayer()
          }
        })
      } catch (e) {
        console.error('初始化视频播放器失败:', e)
        error.value = true
      }

      // 自定义全屏逻辑
      if (props.customFullSreen && player.value) {
        player.value.enterFullScreen = () => {
          player.value.isFullScreen = true
          isFullScreen.value = true
          width.value = (originalWidth.value || 1150) + 'px'
          height.value = (originalHeight.value || 600) + 'px'
          player.value.fullscreenBtn.classList.add(`${player.value.options.classPrefix}unfullscreen`)
          player.value.fullscreenBtn.children[0].title = $t('exitFullscreen')
        }

        player.value.exitFullScreen = () => {
          player.value.isFullScreen = false
          isFullScreen.value = false
          width.value = props.videoWidth
          height.value = props.videoHeight
          player.value.fullscreenBtn.classList.remove(`${player.value.options.classPrefix}unfullscreen`)
          player.value.fullscreenBtn.children[0].title = player.value.options.fullscreenText
        }
      }

      // 隐藏全屏按钮
      if (props.resource && props.resource.hideFullScreen && player.value && player.value.fullscreenBtn) {
        player.value.fullscreenBtn.style.display = 'none'
      }
    }

    const cleanupVideoPlayer = () => {
      try {
        if (media.value) {
          media.value.pause()
          media.value.remove()
          media.value = null
        }
        if (player.value) {
          player.value.pause()
          player.value.remove()
          player.value = null
        }
      } catch (e) {
        console.error('清理视频播放器资源失败:', e)
      }
    }

    const resetVideo = () => {
      initVideo()
    }

    const hide = () => {
      emit('hide')
    }

    const timesAdd = (playedTimes) => {
      // 通过emit事件传递更新，而不是直接修改props
      emit('update:playedTimes', playedTimes)
    }

    const getMediaInfo = () => {
      return props.resource && props.resource.mediaInfo || null
    }

    const setMediaInfo = (val) => {
      if (props.resource && typeof props.resource === 'object') {
        props.resource.mediaInfo = val
      }
    }

    const loadedmetadata = (e) => {
      if (video.value && video.value.videoWidth && video.value.videoHeight) {
        originalHeight.value = 600
        originalWidth.value = Math.round(video.value.videoWidth * 600 / video.value.videoHeight)
        if (isFullScreen.value) {
          height.value = originalHeight.value + 'px'
          width.value = originalWidth.value + 'px'
        }
      }
    }

    const showImage = () => {
      // 图片预览功能
      if (props.resource && props.resource.fileUrl) {
        // 简化实现，仅打印信息
        console.log('预览图片:', props.resource.fileUrl);
      }
    }

    // 生命周期
    onMounted(() => {
      handelVideo()
    })

    onBeforeUnmount(() => {
      // 完整清理所有资源
      cleanupVideoPlayer()
    })

    // 监听文件类型变化
    watch(formatFileTypeComputed, () => {
      handelVideo()
    })

    return {
      id: id.value,
      error,
      width,
      height,
      originalWidth,
      originalHeight,
      isFullScreen,
      formatFileTypeComputed,
      fileUrl,
      control,
      video,
      getFullPathFn,
      handelVideo,
      initVideo,
      resetVideo,
      hide,
      timesAdd,
      getMediaInfo,
      setMediaInfo,
      loadedmetadata,
      showImage
    }
  }
})
</script>

<style lang="scss" scoped>
.resource-wrap {
  max-width: 100%;
}

.resource-image {
  position: relative;
  min-width: 50px;
  min-height: 30px;

  img {
    max-width: 340px;
    max-height: 220px;
  }

  .show-big-btn {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    font-size: 14px;
    text-align: center;
    opacity: 0.4;
    background: #000000;
    border-radius: 2px;
    color: #ffffff;
    cursor: pointer;
  }
}

.resource-document {
  iframe {
    max-width: 98%;
    width: 940px;
    height: 800px;
    background: #fff;
  }
}

.audio-wrapper {
  margin: 0 auto;
}

.ul-resource__body {
  .resource-video {
    margin: 0 auto;
  }
}

.resource-video {
  max-width: 100%;

  .video-wrapper {
    width: 100%;
    max-width: 100%;
    height: 100%;

    .video,
    .error-tip {
      width: 100%;
      height: 100%;

      ::v-deep .custom-video {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;

        .mejs__overlay-play {
          width: 100% !important;
          height: 100% !important;
        }
      }
    }

    .error-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background-color: #000;
      color: #ffffff;

      .tip {
        padding: 10px;

        .ul-link {
          cursor: pointer;
        }
      }
    }
  }
}

.mask-fade-enter-active {
  animation: mask-fade-in 0.3s;
}

.mask-fade-leave-active {
  animation: mask-fade-out 0.3s;
}

@keyframes mask-fade-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes mask-fade-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  100% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
}
</style>