<template>
  <div class="video-container">
    <div class="video-content" id="videoContent">
      <div class="player" id="dplayer"></div>
      <div class="close-btn iconfont icon-guanbi1" @click="exitPlayer"></div>
    </div>
  </div>
</template>

<script>
import "@/components/MediaComponent/style/videoPlay.scss";
import DPlayer from "dplayer";

export default {
  data() {
    return {};
  },
  mounted() {
    let that = this;
    const dp = new DPlayer({
      container: document.getElementById("dplayer"),
      autoplay: true,
      theme: "#FFFFFF",
      loop: false,
      lang: "zh-cn",
      screenshot: false,
      hotkey: false,
      preload: "auto",
      volume: 0.7,
      mutex: false,
      video: {
        url: that.videoSrc,
        type: "auto",
      },
      contextmenu: [
        {
          text: "custom2",
          click: (player) => {
            console.log(player);
          },
        },
      ],
    });
    document.querySelector("#dplayer").oncontextmenu = () => {
      document.querySelector(".dplayer-menu").style.display = "none";
      return false;
    };
    dp.on("play", () => {
      if (!this.showSetting) {
        document.querySelector(".dplayer-setting").style.display = "none";
      }
    });
  },

  methods: {
    exitPlayer() {
      this.$emit("exitPlayer");
    },
  },
  props: {
    // 视频地址
    videoSrc: {
      type: String,
      default: "",
    },
    // 是否显示设置按钮
    showSetting: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

