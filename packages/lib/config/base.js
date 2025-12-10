// 正式环境域名
const baseHost = "";
const productionHost = '.ulearning.cn'

// 通过地址获取域名
const host = location.host
const isDev =
  host.indexOf('192.168') === 0 || host === '127.0.0.1' || host.indexOf('localhost') === 0 
const protocol = isDev ? 'https://' : location.protocol + '//'
const hostDomain = baseHost || (isDev ? '.ulearning.cn' : host.substring(host.indexOf('.')))
// 是否是测试环境
const isTest = hostDomain === '.tongshike.cn'
// cookie写入的域名
const hostname = location.hostname
const UMOOC_COOKIE_DOMAIN = isDev
  ? hostname
  : hostname.substring(hostname.indexOf('.'))

const isI18n = false
// 考试
const UTEST_WEB_HOST = protocol + "utest" + hostDomain
const UTEST_API_HOST = protocol + 'utestapi' + hostDomain
const EXAM_PC_WEB_HOST = 'yxy://macapp' 

// 静态资源地址
let UMOOC_STATIC_HOST = protocol + 'static' + hostDomain + "/static"
// 文档预览
const DOCS_API_HOST = protocol + 'docs' + productionHost
const DOCS_SSL_VALUE = protocol.indexOf("https") === 0 ? 1 : 0;
// 手机考试
let UTEST_MOBILE_WEB_HOST = protocol + 'mexam' + hostDomain
// 优学院
const COURSE_API_HOST = protocol + 'courseapi' + hostDomain
const COURSE_WEB_HOST = protocol + 'courseweb' + hostDomain
// 上传base64编码图片接口
const QINIU_BASE64_URL = 'https://up.qbox.me/putb64/-1'
// 资源上传和访问
const UPLOAD_API_HOST = protocol + 'uobs' + productionHost
const UPLOAD_SERVER_HOST =  'uobs' + productionHost
const UPLOAD_SERVER_PROTOCOL = protocol.indexOf("https") === 0 ? 'https' : 'http';
const RESOURCE_SERVER_HOST = protocol + 'leicloud' + productionHost
// UA课件
const UA_API_HOST = protocol + 'api' + hostDomain
// 1.0页面及接口地址
const UMOOC_API_HOST = protocol + 'www' + hostDomain
// 移动端H5
const UMOBILE_WEB_HOST = protocol + 'umobile' + hostDomain
// 知识图谱
const KNOWLEDGE_GRAPH_WEB_HOST = protocol + 'kg' + hostDomain
// AI
const AI_API_HOST = protocol + 'cloudsearchapi' + hostDomain
const AI_ASSISTANT_WEB_HOST = protocol + 'ai' + hostDomain + '/assistant'

const defaultLang = isI18n ? 'en' : 'zh'
const IS_SELF_UPLOAD = false 
if(isTest) {
  UTEST_MOBILE_WEB_HOST = protocol + 'activityvue' + hostDomain + '/mexam'
  UMOOC_STATIC_HOST = protocol + 'www' + hostDomain + '/static'
}
const DEFAULT_LANG = 'zh'
export default {
  UMOOC_COOKIE_DOMAIN,
  API_HOST: UTEST_API_HOST,
  UTEST_WEB_HOST,
  EXAM_PC_WEB_HOST,
  COURSE_API_HOST,
  STATIC_SERVER_HOST: UMOOC_STATIC_HOST,
  QINIU_BASE64_URL,
  RESOURCE_SERVER_HOST,
  DOCS_HOST: DOCS_API_HOST,
  DOCS_SSL_VALUE,
  MEXAM_HOST: UTEST_MOBILE_WEB_HOST,
  isI18n,
  defaultLang,
  IS_SELF_UPLOAD,
  UA_API_HOST,
  UMOOC_API_HOST,
  UMOBILE_WEB_HOST,
  COURSE_WEB_HOST,
  UPLOAD_API_HOST,
  UPLOAD_SERVER_HOST,
  UPLOAD_SERVER_PROTOCOL,
  KNOWLEDGE_GRAPH_WEB_HOST,
  AI_API_HOST,
  AI_ASSISTANT_WEB_HOST,
  DEFAULT_LANG
}
  
  
  