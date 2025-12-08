<template>
  <div class="image-wrapper">
    <div
      class="preview-content"
      v-if="!showEditor"
    >
      <div
        class="img-box"
        id="pic"
      >
        <img
          v-if="resource.markedImage || resource.fileUrl"
          ref="pic"
          class="img"
          :src="resource.markedImage ? resource.markedImage : resource.fileUrl"
          :style="{backgroundImage: 'url(\'' + previewImgSrc + '\')', marginLeft: offsetX + 'px', marginTop: offsetY + 'px'}"
          @mousedown="handleMouseDown"
          @click.stop
        />
      </div>
      <div class="action-bar-wrapper">
        <div class="action-bar" @click.stop>
          <div
            v-if="showDownLoad"
            class="action-item download"
            @click="downloadIamge(resource.fileUrl, 'pic')"
          >
            <i class="icon iconfont icon-xiazai"></i>
            <span>{{$t('download')}}</span>
          </div>
          <div
            class="action-item big"
            @click="changeSize(1)"
          >
            <i class="icon iconfont icon-fangda1"></i>
          </div>
          <div
            class="action-item small"
            @click="changeSize(0)"
          >
            <i class="icon iconfont icon-suoxiao1"></i>
          </div>
          <div
            class="action-item reset"
            @click="reset"
          >1 : 1</div>
          <div
            class="action-item turn-left"
            @click="rotatePic(1)"
          >
            <i class="icon iconfont icon-xuanzhuan1"></i>
          </div>
          <div
            class="action-item turn-right"
            @click="rotatePic(0)"
          >
            <i class="icon iconfont icon-xuanzhuan2"></i>
          </div>
          <div
            class="action-item addeditor"
            v-if="editorble"
            @click="addTip()"
          >
            <span>{{$t('addMark')}}</span>
          </div>
          <div
            class="action-item deleditor"
            v-if="editorble && resource.markedImage"
            @click="clearTip()"
          >
            {{$t('deleteMark')}}
          </div>
        </div>
      </div>
    </div>
    <div
      class="editor-content"
      v-else
    >
      <editor
        :resource="resource"
        @saveTip="saveTip"
      ></editor>
    </div>
  </div>
</template>

<script>
import editor from "./imageEditor.vue";
import Obs from "@/plugins/ulearning-obs.js";
// import uploadMixins from "@/mixins/upload.js"
import { rafThrottle } from "@/utils"
export default {
  data() {
    return {
      rotateDeg: 0,
      scale: 1,
      showEditor: false,
      offsetX: 0,
      offsetY: 0,
      isMoving: false
    };
  },
  // mixins: [uploadMixins],
  props: {
    resource: {
      type: Object,
      default() {
        return {}
      },
    },
    // 是否可添加批注
    editorble: {
      type: Boolean,
      default: false,
    },
    // 是否可下载
    showDownLoad: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    previewImgSrc() {
      const { fileUrl, angle } = this.resource
      if (angle) {
        return fileUrl.split('?')[0] + '?imageslim|imageMogr2/rotate/' + angle
      }
      return fileUrl
    }
  },
  methods: {
    handleMouseDown(e) {
      const { offsetX, offsetY } = this;
      const startX = e.pageX;
      const startY = e.pageY;
      const maxData = {
        offsetX: document.body.clientWidth - this.$refs.pic.clientWidth/2,
        offsetY: document.body.clientHeight - this.$refs.pic.clientHeight/2
      };
      this._dragHandler = rafThrottle(ev => {
        let newOffsetX = offsetX + ev.pageX - startX;
        let newOffsetY = offsetY + ev.pageY - startY;
        if (Math.abs(newOffsetX) <= Math.abs(maxData.offsetX)) {
          this.offsetX = newOffsetX
        }
        if (Math.abs(newOffsetY) <= Math.abs(maxData.offsetY)) {
          this.offsetY = newOffsetY;
        }
        this.isMoving = true
      });
      document.addEventListener('mousemove', this._dragHandler)
      document.addEventListener('mouseup', ev => {
        document.removeEventListener('mousemove', this._dragHandler);
        if (this.isMoving && ev.target.className !== 'img') {
          setTimeout(() => {
            this.isMoving = false
          }, 100)
        } else {
          this.isMoving = false
        }
      })
      e.preventDefault();
    },
    // 滚轮改变尺寸
    changePicSize(e) {
      let currentWidth = this.imgStyle.width.split("%")[0] / 100;
      if (e.deltaY < 0) {
        // 鼠标滚轮向前滚动 放大图片
        this.imgStyle.width =
          (currentWidth >= 2 ? 200 : (currentWidth + 0.05) * 100) + "%";
      } else {
        // 鼠标滚轮向后滚动 缩小图片
        this.imgStyle.width =
          (currentWidth <= 0.5 ? 50 : (currentWidth - 0.05) * 100) + "%";
      }
    },
    // 按钮改变尺寸
    changeSize(type) {
      if (type == 1) {
        // 变大
        this.scale += 0.2
      } else {
        // 缩小
        if (this.scale > 0.4) {
          this.scale -= 0.2
        }
      }
    },
    // 还原原始比例
    reset() {
      this.rotateDeg = 0;
      this.scale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
    },
    // 旋转
    rotatePic(type) {
      if (type == 1) {
        // 向左旋转
        this.rotateDeg -= 90;
      } else {
        // 向右旋转
        this.rotateDeg += 90;
      }
      this.offsetX = 0;
      this.offsetY = 0;
    },
    // 下载
    downloadIamge(imgsrc) {
      let obs = new Obs(this.uploadOptions);
      obs.download(imgsrc);
    },
    // 退出预览
    exitPreview(type) {
      if (this.showEditor) {
        // 点击空白处不关闭批注页面
        this.showEditor = type === 'bg'
      } else if (!this.isMoving) {
        this.$emit("exitPreview");
      }
    },
    saveTip(resource) {
      // 批注保存成功
      this.resource.angle = resource.angle;
      this.resource.markedImage = resource.markedImage;
      this.$bus.$emit("saveImage", this.resource)
      this.showEditor = false;
    },
    addTip() {
      this.reset();
      this.showEditor = true;
    },
    clearTip() {
      this.resource.angle = 0;
      this.resource.markedImage = "";
      this.$bus.$emit("saveImage", this.resource)
    },
  },
  watch: {
    rotateDeg: {
      handler(newVal) {
        let picData = this.$refs.pic;
        if (picData) {
          picData.style.transform = `scale(${this.scale}) rotate(${newVal}deg)`;
        }
      },
      immediate: true
    },
    scale: {
      handler(newVal) {
        let picData = this.$refs.pic;
        if (picData) {
          picData.style.transform = `scale(${newVal}) rotate(${this.rotateDeg}deg)`;
        }
      },
      immediate: true
    }
  },
  components: {
    editor,
  },
};
</script>
<style lang="scss" scoped>
.preview-content {
  .img-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 540px;
    img {
      max-height: 540px;
      max-width: 100%;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
  }
  .action-bar-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 30px;
    z-index: 1;
    .action-bar {
      display: inline-block;
      padding: 9px 10px;
      background-color: #000000;
      border-radius: 4px;
      white-space: nowrap;
      user-select: none;
      .action-item {
        display: inline-block;
        vertical-align: middle;
        margin: 0 10px;
        font-size: 14px;
        color: #ffffff;
        cursor: pointer;
        opacity: 0.6;
        &:hover {
          opacity: 1;
        }
        &:active {
          opacity: 0.3;
        }
        &.download i {
          margin-right: 8px;
        }
        &.reset {
          width: 58px;
          height: 32px;
          line-height: 1.6;
          font-size: 18px;
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          &:hover {
            opacity: 0.2;
            border: 2px solid rgba(255, 255, 255, 0.4);
          }
          &:active {
            opacity: 1;
            border-color: rgba(255, 255, 255, 1);
          }
        }
        &.addeditor {
          padding-left: 20px;
          border-left: 2px solid rgba(255, 255, 255, 0.6);
          opacity: 1;
          span {
            opacity: 0.6;
          }
          &:hover,
          &:active {
            opacity: 1;
            border-left: 2px solid rgba(255, 255, 255, 0.6);
          }
          &:hover span {
            opacity: 1;
          }
          &:active span {
            opacity: 0.3;
          }
        }
      }
    }
  }
}
</style>

