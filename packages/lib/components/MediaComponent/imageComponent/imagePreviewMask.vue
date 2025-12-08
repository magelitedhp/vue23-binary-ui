<template>
  <transition name="mask-fade">
    <div class="ul-resource-preview__wrapper">
      <div class="ul-resource-preview">
        <div class="ul-resource__header">
          <h4>{{resource.fileName}}</h4>
          <div class="ul-resource__header__right">
            <ul-button @click="hidePreview">{{ $t('close') }}</ul-button>
          </div>
        </div>
        <div class="scroll-wrapper" @click="hidePreview('bg')">
          <ul-scrollbar class="scroll">
          <div class="ul-resource__body">
            <imageComponent
              ref="imageComponent"
              :resource="resource"
              :editorble="editorble"
              :showDownLoad="showDownLoad"
              @exitPreview="hide"
            ></imageComponent>
          </div>
        </ul-scrollbar>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import imageComponent from "./imagePreview.vue";
import { formatFileType } from '@/utils/file.js'
export default {
  name: 'ImagePreviewMask',
  components: {
    imageComponent
  },
  props: {
    resource: {
      type: Object,
      default() {
        return {}
      }
    },
    editorble: {
      type: Boolean,
      default: false,
    },
    showDownLoad: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    formatFileType() {
      return formatFileType(this.resource.fileUrl)
    },
  },
  methods: {
    hidePreview(type) {
      const { imageComponent } = this.$refs
      if (imageComponent) {
        imageComponent.exitPreview(type)
      } else {
        this.hide()
      }
    },
    hide() {
      this.$emit('hide')
      this.hideHandler && this.hideHandler()
    }
  }
}
</script>

<style lang="scss" scoped>
.ul-resource-preview__wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2000;
}
.ul-resource__header {
  position: fixed;
  z-index: 2001;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.7);
  box-sizing: border-box;
  color: #fff;
  h4 {
    margin: 0;
    float: left;
    font-size: 16px;
    line-height: 30px;
  }
}
.ul-resource__header__right {
  float: right;
  i {
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;
  }
}

.ul-page__header-right {
  float: right;
}
.scroll {
  margin: 50px auto 0;
  height: calc(100vh - 50px);
}
.ul-resource__body {
  padding: 60px 0 20px 0;
  text-align: center;
}
.resource-image {
  img {
    max-width: 800px;
    max-height: 500px;
  }
}
.resource-document {
  iframe {
    width: 940px;
    height: 800px;
    background: #fff;
  }
}
.resource-video {
  .video-wrapper {
    height: 450px;
    width: 800px;
    margin: 0 auto;
  }
}

::v-deep .audio-wrapper {
  width: 280px;
  margin: 0 auto;
}

::v-deep .resource-video {
  height: 450px;
  width: 800px;
  margin: 0 auto;
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