<template>
  <div class="audio-recorder">
    <div v-if="audioUrl" class="ul-audio-tag" @click="handleAudio($event)">
      <audio ref='playerRef' controlsList="nodownload" v-if="audioUrl" v-bind:src="audioUrl">
        <source v-bind:src="audioUrl" type="audio/mpeg">
      </audio>
      <span class="audioicon " :class="{playingicon:isPlaying}"></span>
      <span class="duration">{{residueduration}}</span>
    </div>
    <div v-if="isRecording" class="recording-time">
      {{ formatTime(recordingTime) }}
    </div>
    <div class="recorder-status">
      <div class="status-icon" @click="startRecording" v-if="!isRecording && !audioBlob">
        <img src="@/assets/mobile/recorder.svg" />
      </div>
      <img v-else-if="isRecording" src="@/assets/mobile/pf_recording.gif" @click="stopRecording"/>
      <div class="status-text" v-if="!audioBlob">{{ recorderStatus }}</div>
    </div>
    
    <div class="recorder-controls">
      <span v-if="!isRecording && audioBlob" @click="reRecord">
        {{ t('reRecord') }}
      </span>
      <span v-if="!isRecording && audioBlob" type="primary" @click="saveRecording">
        {{ t('save') }}
      </span>
    </div>
    <TinyAlert v-if="alertInfo.text" class="alert-warning" :type="alertInfo.type">
      <template #description>{{ alertInfo.text }}</template>
    </TinyAlert>
  </div>
</template>

<script>
import { defineComponent, ref, computed, reactive, nextTick, onBeforeUnmount } from 'vue-demi'
import { TinyButton, TinyAlert } from '@opentiny/vue'
import { useT } from "../../locale/index.js"
import { handleNum } from "@/utils"
import { handlerErrCode } from "../../utils/file.js"
import Attach from "@/model/attach"
import Recorder from 'recorder-core'
//需要使用到的音频格式编码引擎的js文件统统加载进来，这些引擎文件会比较大
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
import 'recorder-core/src/extensions/lib.fft'
export default defineComponent({
  name: 'AudioRecorder',
  components: {
    TinyButton,
    TinyAlert
  },
  props: {
    obs: {
      type: Object,
      default: null
    },
    actionIndex: {
      type: Number,
      default: 0
    },
    insertContent: {
      type: Function,
      default: () => {}
    },
    emitAddFile: {
      type: Function,
      default: () => {}
    },
    onClose: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const t = useT()
    const isPlaying = ref(false)
    
    const curtime = ref(0)
    const duration = ref(0)
    const residueduration = computed(() => {
      let result = ''
      let time = -1
      if (curtime.value >= 0) {
        time = duration.value - curtime.value
      } else {
        time = duration.value
      }
      if (time === 0) {
        time = duration.value
      }
      if (time > -1) {
        let min = Math.floor(time / 60) % 60
        let sec = time % 60
        if (min > 0) {
          result = min + '\''
        }
        if (sec > 0) {
          result += sec + '"'
        }
      }
      return result
    })
    const handleAudio = (event) => {
      var el = event.currentTarget
      var audio = el.querySelector('audio')
      addEvent4AudioListeners()
      if (isPlaying.value) {
        audio.pause()
        isPlaying.value = false
      } else {
        audio.play()
        isPlaying.value = true
      }
    }
    const recorderInstance = ref(null)
    const isRecording = ref(false)
    const audioBlob = ref(null)
    const audioUrl = ref('')
    const recordingTime = ref(0)
    const recordingTimer = ref(null)
    
    const recorderStatus = computed(() => {
      if (isRecording.value) return t('recording')
      if (audioBlob.value) return t('recorded')
      return t('readyToRecord')
    })
    
    const alertInfo = ref({
      type: 'warning',
      text: ''
    })
    // 提示
    const showAlertHandler = (type, text) => {
      alertInfo.value = {
        type,
        text
      }
      setTimeout(() => {
        alertInfo.value.text = ''
      }, 2000)
    }
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    const startRecording = async () => {
      try {
        if (recorderInstance.value) {
          recorderInstance.value.close()
        }
        recorderInstance.value = new Recorder({
          type: 'mp3',
          sampleRate: 16000,
          bitRate: 16
        })
        recorderInstance.value.open(() => {
          nextTick(() => {
            recorderInstance.value.start()
            isRecording.value = true
            recordingTime.value = 0
            
            recordingTimer.value = setInterval(() => {
              recordingTime.value++
            }, 1000)
          })
        }, (msg) => {
          showAlertHandler('warning', t('recordingInitFailed'))
        })
      } catch (error) {
        showAlertHandler('warning', t('recordingInitFailed'))
      }
    }
    
    const stopRecording = () => {
      if (recorderInstance.value) {
        recorderInstance.value.stop((blob, second) => {
          audioBlob.value = blob
          audioUrl.value = URL.createObjectURL(blob)
          isRecording.value = false
          clearInterval(recordingTimer.value)
          recorderInstance.value.close()
          duration.value = Math.floor(second / 1000)
        }, (error) => {
          console.error('录音停止失败:', error)
        })
      }
    }
    
    const reRecord = () => {
      audioBlob.value = null
      audioUrl.value = ''
      recordingTime.value = 0
      startRecording()
    }
    
    const saveRecording = () => {
      if (audioBlob.value && props.obs) {
        const file = new File([audioBlob.value], `audio_${Date.now()}.mp3`, { type: 'audio/mp3' })
        
        const myFile = reactive(new Attach({
          fileName: file.name,
          fileSize: file.size,
          fileUrl: file.name,
          status: 1,
          lisCount: -1
        }))
        
        props.obs.onBeforeUpload = (uploadFile) => {
          uploadFile.onProgress = (progress) => {
            myFile.progress = handleNum(progress, 2, "floor")
          }
          uploadFile.onSuccess = () => {
            myFile.fileUrl = uploadFile.obsHost + '/' + uploadFile.key
            myFile.status = 2
            props.insertContent(`<audio src="${myFile.fileUrl}" controls></audio>`)
          }
          uploadFile.onError = (err) => {
            myFile.errMessage = handlerErrCode(err.code)
            myFile.status = 3
          }
        }
        
        props.obs.uploadFiles([file])
        props.emitAddFile(myFile, props.actionIndex)
        props.onClose()
      }
    }
    const playerRef = ref(null)
    // 添加音频事件监听
    const addEvent4AudioListeners = () => {
      const player = playerRef.value
      player.addEventListener('timeupdate', _currentTime)
      player.addEventListener('canplay', _durationTime)
      player.addEventListener('ended', _endplay)
    }

    // 移除音频事件监听
    const remove4AudioListeners = () => {
      const player = playerRef.value
      if (!player) return
      player.removeEventListener('timeupdate', _currentTime)
      player.removeEventListener('canplay', _durationTime)
      player.removeEventListener('ended', _endplay)
    }
    onBeforeUnmount(() => {
      remove4AudioListeners()
    })
    // 更新当前播放时间
    const _currentTime = () => {
      const player = playerRef.value
      if (!player) return
      curtime.value = Math.floor(player.currentTime)
    }

    // 获取音频总时长
    const _durationTime = () => {
      const player = playerRef.value
      duration.value = Math.floor(player.duration)
    }

    // 播放结束回调
    const _endplay = () => {
      isPlaying.value = false
      curtime.value = -1
    }

    // 暴露给模板使用
    return {
      t,
      isRecording,
      audioBlob,
      audioUrl,
      recordingTime,
      recorderStatus,
      formatTime,
      startRecording,
      stopRecording,
      reRecord,
      saveRecording,
      isPlaying,
      residueduration,
      curtime,
      duration,
      handleAudio,
      playerRef,
      alertInfo,
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.audio-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: calc(50 * var(--question-font-size));
  gap: calc(12 * var(--question-font-size));

  .recorder-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(10 * var(--question-font-size));

    .status-icon {
      width: calc(40 * var(--question-font-size));
      height: calc(40 * var(--question-font-size));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: calc(1 * var(--question-font-size)) solid #ea5947;
      img {
        width: calc(18 * var(--question-font-size));
        height: calc(18 * var(--question-font-size));
      }
    }

    .status-text {
      font-size: calc(14 * var(--question-font-size));
      color: #666;
    }
  }

  .recorder-controls {
    display: flex;
    font-size: calc(14 * var(--question-font-size));
    gap: calc(12 * var(--question-font-size));
  }

  .audio-preview {
    width: 100%;
    audio {
      width: 100%;
    }
  }

  .recording-time {
    font-size: calc(16 * var(--question-font-size));
    color: #333;
  }
}

.ul-audio-tag{
    width:calc(120 * var(--question-font-size));
    height:calc(44 * var(--question-font-size));
    background-color:#f3f3f3;
    border-radius :calc(30 * var(--question-font-size));
    display: inline-block;
    position: relative;
    border: calc(1 * var(--question-font-size)) solid #e3e3e9;
    .duration{
      position:absolute;
      right:calc(8 * var(--question-font-size));
      top:calc(15 * var(--question-font-size));
      line-height:1;
      font-size:calc(12 * var(--question-font-size));
      color:#969696;
    }
    .audioicon{
      position:absolute;
      top: 50%;
      margin:calc(-16 * var(--question-font-size)) 0 0 0;
      left:calc(11 * var(--question-font-size));
      width:calc(28 * var(--question-font-size));
      height:calc(28 * var(--question-font-size));
      line-height:1;
      background:url('@/assets/mobile/audioIcon.svg') no-repeat center;
      background-size:calc(24 * var(--question-font-size));
        
    }
    .playingicon{
      background:url('@/assets/mobile/audio_play.gif') no-repeat center;
      background-size:calc(24 * var(--question-font-size));
    }
}
</style>
