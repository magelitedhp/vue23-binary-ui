<template>
  <ul-scrollbar class="image-editor-wrap" v-if="!isMobile">
    <div class="image-editor">
      <div id="wPaint"></div>
    </div>
  </ul-scrollbar>
  <div class="image-editor-wrap-mobile" v-else>
    <div class="image-editor">
      <div id="wPaint"></div>
    </div>
  </div>
</template>

<script>
import "@/components/MediaComponent/style/imageEditor.scss";
import uPaint from "./uPaint.js";
const $ = require("jquery");
window.jQuery = $;
window.$ = $;
export default {
  data() {
    return {};
  },
  props: {
    resource: {
      type: Object,
      default() {
        return {};
      },
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  created() {
    const _this = this
    let lang = "zh-cn";
    window.wPaintLang = {};
    Promise.all([
      import("@/plugins/wPaint/wPaint-min.css"),
      import("@/plugins/wPaint/wPaint-min.js"),
    ]).then(() => {
      let options = {
        domId: "wPaint",
        originalImage: this.resource.fileUrl,
        markedImage: this.resource.markedImage,
        angle: this.resource.angle || 0,
        MAX_WIDTH: 860,
        path: "wPaint/",
        saveImg: function () {
          if (_this.paint) {
            _this.resource.markedImage = _this.paint.markedImage;
            _this.resource.angle = _this.paint.angle;
            _this.$emit("saveTip", _this.resource);
            _this.paint.destory();
          }
        }
      }
      if (this.isMobile) {
        const $dom = $(".image-editor")
        options.MAX_WIDTH = window.innerWidth - 60
        options.MAX_HEIGHT = window.innerHeight - $dom.parent().parent()[0].offsetTop
        options.loadedmage = (isFullScreen) => {
          $(".wPaint-menu-groups").css({'top': isFullScreen ? '50%' : `${$dom.height() + 5}px`})
        }
      }
      _this.paint = new uPaint(options); 
    });
  },
};
</script>

