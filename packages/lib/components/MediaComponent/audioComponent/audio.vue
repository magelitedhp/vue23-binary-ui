<template>
  <div class="audio-container">
    <audioPlayerTimes
      v-if="times && times > 0 && audioTime != 6"
      :times="times"
      :playedTimes="playedTimes"
      :src="src"
      :is-question-bank="isQuestionBank"
      v-on="$listeners"
      @timesAdd="timesAdd"
    ></audioPlayerTimes>
    <audioPlayer :src="src" :times="times" :is-question-bank="isQuestionBank" :mode="audioMode" v-else></audioPlayer>
  </div>
</template>

<script>
import audioPlayer from "./audioPlayer.vue";
import audioPlayerTimes from "./audioPlayerTimes.vue";
export default {
  props: {
    // 音频的src
    src: {
      type: String,
      default: "",
    },
    // 可播放的次数
    times: {
      type: Number,
      default: 0,
    },
    // 已播放的次数
    playedTimes: {
      type: Number,
      default: 0,
    },
    isQuestionBank: {
      type: Boolean,
      default: false,
    },
    audioMode: {
      type: String,
      default: 'bar',
    },
    audioTime: {
      type: Number,
      default: 0,
    },
  },
  components: {
    audioPlayer,
    audioPlayerTimes,
  },
  mounted() {
    if (this.timesControll && !this.times) {
      this.$toast(this.$t('playTimesError'), {
        type: 'error'
      });
    }
  },
  methods: {
    timesAdd(currentTime) {
      this.$emit("timesAdd", currentTime);
    },
  },
};
</script>
