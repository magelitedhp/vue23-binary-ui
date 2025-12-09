import base from "./base.js"
import local from "./local.js"
let baseVars = base
// if (process.env.VUE_APP_ENV === 'localprod') {
//   // 本地部署域名覆盖
//   const locals = local.default
//   baseVars = { ...baseVars, ...locals }
// }

export const {
  UTEST_WEB_HOST,
  UMOOC_COOKIE_DOMAIN,
  API_HOST,
  COURSE_API_HOST,
  STATIC_SERVER_HOST,
  QINIU_BASE64_URL,
  RESOURCE_SERVER_HOST,
  DOCS_HOST,
  DOCS_SSL_VALUE,
  MEXAM_HOST,
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
  EXAM_PC_WEB_HOST,
  AI_API_HOST,
  AI_ASSISTANT_WEB_HOST,
  DEFAULT_LANG
} = baseVars
