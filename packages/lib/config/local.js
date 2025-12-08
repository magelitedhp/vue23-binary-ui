// 正式环境域名
const baseHost = "";
const productionHost = ''

// 通过地址获取域名
const host = location.host
const protocol = location.protocol + '//'
const hostDomain = baseHost || host.substring(host.indexOf('.'))

// 考试
const UTEST_WEB_HOST = protocol + "ulearning" + hostDomain + "/utest"
const UTEST_API_HOST = protocol + "ulearning" + hostDomain + "/utestapi"

// 静态资源地址
let UMOOC_STATIC_HOST = protocol + "ulearning" + hostDomain + "/static";
// 文档预览
const DOCS_API_HOST = protocol + "docs" + productionHost;
const DOCS_SSL_VALUE = protocol.indexOf("https") === 0 ? 1 : 0;
// 手机考试
let UTEST_MOBILE_WEB_HOST = protocol + "ulearning" + hostDomain + "/mexam";
// 优学院
const COURSE_API_HOST = protocol + "ulearning" + hostDomain + "/api";
const COURSE_WEB_HOST = protocol + "ulearning" + hostDomain;
// 资源上传和访问
const UPLOAD_API_HOST = protocol + "uobs1" + productionHost;
const UPLOAD_SERVER_HOST =  "uobs1" + productionHost;
const UPLOAD_SERVER_PROTOCOL = protocol.indexOf("https") === 0 ? 'https' : 'http';
const RESOURCE_SERVER_HOST = protocol + "uobs1" + productionHost + "/view";
// UA课件
const UA_API_HOST = protocol + "ua" + hostDomain + "/api";
// 1.0页面及接口地址
const UMOOC_API_HOST = protocol + "ulearning" + hostDomain;
// 移动端H5
const UMOBILE_WEB_HOST = protocol + "ulearning" + hostDomain + "/mobile";
// 知识图谱
const KNOWLEDGE_GRAPH_WEB_HOST = protocol + "ulearning" + hostDomain + "/knowledge";
// AI
const AI_API_HOST = "";
const AI_ASSISTANT_WEB_HOST = "";
export default {
  API_HOST: UTEST_API_HOST,
  UTEST_WEB_HOST: UTEST_WEB_HOST,
  COURSE_API_HOST,
  STATIC_SERVER_HOST: UMOOC_STATIC_HOST,
  RESOURCE_SERVER_HOST,
  DOCS_HOST: DOCS_API_HOST,
  DOCS_SSL_VALUE,
  MEXAM_HOST: UTEST_MOBILE_WEB_HOST,
  UA_API_HOST,
  UMOOC_API_HOST,
  UMOBILE_WEB_HOST,
  COURSE_WEB_HOST,
  UPLOAD_API_HOST,
  UPLOAD_SERVER_HOST,
  UPLOAD_SERVER_PROTOCOL,
  KNOWLEDGE_GRAPH_WEB_HOST,
  AI_API_HOST,
  AI_ASSISTANT_WEB_HOST
}
  
  
  