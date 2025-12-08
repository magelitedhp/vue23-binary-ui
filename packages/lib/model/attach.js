// 定义附件对象
import { formatFileType } from '@/utils/file.js'
import { getUniqueValue } from "@/utils"
export default class Attach {
  constructor({ id = 0, fileName = '', fileSize = '', fileType = '', fileUrl = '', srt = '', avatar = '', lisCount = -1, progress = 0, status = 0, markedImage = "", angle = 0, location, title, contentSize, type}) {
    this.id = id || getUniqueValue()
    this.fileName = fileName || title
    this.fileSize = fileSize || contentSize
    this.fileType = fileType || type
    this.fileUrl = fileUrl || location
    this.srt = srt //字幕
    this.avatar = avatar || '' //视频封面
    this.lisCount = lisCount // 音频播放次数
    this.progress = progress 
    //0 已上传 1 上传中 2 上传成功 3 上传失败
    this.status = status
    this.markedImage = markedImage
    this.angle = angle
  }

  handleOldAttach(file) {
    let fileJson = {
      contentSize: file.contentSize || file.fileSize,
      title: file.title || file.fileName,
      location: file.location || file.fileUrl,
      duration: file.duration || 0
    }
    let ext = ""
    if (fileJson.location && fileJson.location.length > 0) {
      ext = fileJson.location.substring(fileJson.location.lastIndexOf('.') + 1).toLowerCase()
    }
    fileJson.mimeType = file.mimeType || ext
    fileJson.type = file.type || formatFileType(fileJson.location)
    return {...file, ...fileJson}
  }
}