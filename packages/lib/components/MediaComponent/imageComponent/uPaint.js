import Obs from "@/plugins/ulearning-obs.js";
import cookie from "@/utils/cookie.js";
import { setUploadConfig } from "@/utils/file.js"
import { API_HOST, RESOURCE_SERVER_HOST } from '@/config/index.js'
function uPaint(params) {
    this.domId = params.domId
    this.$dom = $('#' + params.domId)
    this.originalImage = params.originalImage
    this.angle = params.angle || 0
    this.markedImage = params.markedImage
    this.MAX_WIDTH = params.MAX_WIDTH || 900
    this.MAX_HEIGHT = params.MAX_HEIGHT || 0
    this.options = params
    this.init()
}

uPaint.prototype.init = function () {
    var self = this
    var img = new Image()
    var oriImg = self.originalImage.split('?')[0] + '?imageslim|imageMogr2/rotate/' + self.angle
    var src = oriImg
    if (self.markedImage) {
        src = self.markedImage
    }
    src = src + ((/\?/g.test(src) ? '&' : '?') + 'timestamp=' + Date.now())
    img.src = src
    img.setAttribute('crossorigin', 'anonymous')
    img.onload = function (data) {
        var width = this.width
        var height = this.height
        if (width > self.MAX_WIDTH) {
            height = (height / width) * self.MAX_WIDTH
            width = self.MAX_WIDTH
        }
        self.$dom.css({
            width: width + 'px',
            height: height + 'px',
            'background-image': 'url(' + oriImg + ')',
            border: '1px solid rgb(227, 227, 233, 0.3)'
        })
        var config = {
            lineWidth: "2",
            fontSize: "20", // current font size for text input
            fontFamily: "Arial", // active font family for text input
            menuOffsetLeft: 0,
            menuOffsetTop: 0,
            path: self.options.path || '/',
            menuHandle: false,
            imageStretch: true,
            saveImg: function (image) {
                self.saveImg(image)
            },
            clockwise: function () {
                self.rotate(90)
            },
            counterclockwise: function () {
                self.rotate(-90)
            },
            fullScreen: function () {
                self.fullScreen()
            }
        }
        if (self.markedImage) {
            config.image = self.getBase64Image(img)
        }
        self.$dom.wPaint(config)
        self.options.loadedmage && self.options.loadedmage(self.isFullScreen)
    }
}
uPaint.prototype.rotate = function (deg) {
    var self = this
    if (self.isRotating) return
    self.isRotating = true
    var editAngle = self.angle + deg
    if (editAngle < 0) {
        editAngle += 360
    }
    if (editAngle >= 360) {
        editAngle -= 360
    }
    self.angle = editAngle
    self.originalImage = self.originalImage.split('?')[0] + '?imageslim|imageMogr2/rotate/' + self.angle
    var img = new Image()
    img.src = self.originalImage
    img.onload = function () {
        var width = this.width
        var height = this.height
        var maxHeight = self.MAX_HEIGHT && self.isFullScreen ? self.MAX_HEIGHT - 80 : 0
        if (!maxHeight && width > self.MAX_WIDTH) {
            height = (height / width) * self.MAX_WIDTH
            width = self.MAX_WIDTH
        }
        if (maxHeight && height > maxHeight) {
            width = (width / height) * maxHeight
            height = maxHeight
        }
        self.$dom.css({
            width: width + 'px',
            height: height + 'px',
            'background-image': 'url(' + self.originalImage + ')'
        })
        var imageData = self.$dom.wPaint('image')

        setTimeout(function () {
            self.isFullScreen && self.$dom.parent()[0].scrollTo({ left: width });
            self.rotateBase64Img(imageData, deg, function (image) {
                self.$dom.wPaint('clear')
                self.$dom.wPaint('resize')
                self.$dom.wPaint('image', image)
                self.isRotating = false
            })
        })
        self.options.loadedmage && self.options.loadedmage(self.isFullScreen)
    }
}
uPaint.prototype.rotateBase64Img = function (src, edg, callback) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var imgW // 图片宽度
    var imgH // 图片高度
    var size // canvas初始大小
    if (edg % 90 !== 0) {
        console.error('旋转角度必须是90的倍数!')
        return -1
    }
    edg < 0 && (edg = (edg % 360) + 360)
    const quadrant = (edg / 90) % 4 // 旋转象限
    const cutCoor = {
        sx: 0,
        sy: 0,
        ex: 0,
        ey: 0,
    } // 裁剪坐标
    var image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = src
    image.onload = function () {
        imgW = image.width
        imgH = image.height
        size = imgW > imgH ? imgW : imgH
        canvas.width = size * 2
        canvas.height = size * 2

        switch (quadrant) {
            case 0:
                cutCoor.sx = size
                cutCoor.sy = size
                cutCoor.ex = size + imgW
                cutCoor.ey = size + imgH
                break
            case 1:
                cutCoor.sx = size - imgH
                cutCoor.sy = size
                cutCoor.ex = size
                cutCoor.ey = size + imgW
                break
            case 2:
                cutCoor.sx = size - imgW
                cutCoor.sy = size - imgH
                cutCoor.ex = size
                cutCoor.ey = size
                break
            case 3:
                cutCoor.sx = size
                cutCoor.sy = size - imgW
                cutCoor.ex = size + imgH
                cutCoor.ey = size + imgW
                break
        }
        ctx.translate(size, size)
        ctx.rotate((edg * Math.PI) / 180)
        ctx.drawImage(image, 0, 0)
        var imgData = ctx.getImageData(
            cutCoor.sx,
            cutCoor.sy,
            cutCoor.ex,
            cutCoor.ey
        )
        if (quadrant % 2 === 0) {
            canvas.width = imgW
            canvas.height = imgH
        } else {
            canvas.width = imgH
            canvas.height = imgW
        }
        ctx.putImageData(imgData, 0, 0)
        callback(canvas.toDataURL())
    }
}
uPaint.prototype.fullScreen = function () {
    $(".wPaint-menu-groups .wPaint-menu")[1].style.display = 'none'
    this.isFullScreen = !this.isFullScreen
    if (this.isFullScreen) {
        this.rotate(90)
        this.$dom.parent().parent().addClass("fullscreen")
        this.$dom.parent().css({ height: this.MAX_HEIGHT + 'px' })
        $(".wPaint-menu-groups").css({ left: `-${window.innerWidth / 2 - $(".wPaint-menu-groups").height() / 2 - 5}px` })
    } else {
        this.rotate(-90)
        this.$dom.parent().css({ height: 'auto' })
        this.$dom.parent().parent().removeClass("fullscreen")
        $(".wPaint-menu-groups").css({ left: '50%' })
    }
    $(".wPaint-menu-icon-name-fullScreen").children().css({ backgroundImage: `url(wPaint/plugins/file/img/full_screen${this.isFullScreen ? '_cancel' : ''}.png)` })
}

uPaint.prototype.getBase64Image = function (img) {
    var canvas = document.createElement('canvas')
    console.log('img', img);
    console.log('img.width', img.width);
    canvas.width = img.width
    canvas.height = img.height
    console.log('canvas.width', canvas.width);
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)

    var dataURL = canvas.toDataURL('image/png')
    return dataURL

    // return dataURL.replace("data:image/png;base64,", "");
}
uPaint.prototype.saveImg = function (image) {
    var self = this
    let options = {
        obsHost: RESOURCE_SERVER_HOST,
        uptokenHost: API_HOST,
        authorization: window.Authorization || cookies.get('AUTHORIZATION')
    }
    var uploader = new Obs(setUploadConfig({
        obsHost: RESOURCE_SERVER_HOST,
        uptokenHost: API_HOST,
        authorization: window.Authorization || cookies.get('AUTHORIZATION')
    }))
    var pic = uploader.dataURLtoBlob(image)
    pic.ext = ".png";
    pic.name = ".png"
    uploader.startUpload(pic)
    uploader.onSuccess = function (file) {
        self.markedImage = uploader.obsHost + '/' + file.key
        self.options.saveImg && self.options.saveImg()
    }
}
uPaint.prototype.destory = function () {
    // this.$dom.removeAttr('style class').html('')
    $(".wPaint-menu-groups").remove()
    this.$dom.parent().html('<div id="wPaint"></div>')
}

export default uPaint