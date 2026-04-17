import { API_HOST, RESOURCE_SERVER_HOST,UPLOAD_SERVER_HOST,UPLOAD_SERVER_PROTOCOL } from "@/config";
import { setUploadConfig} from "@/utils/file.js"
import cookies from "@/utils/cookie.js"
import { getUrlParam , getURLHash} from "@/utils/index.js"
export const uploadOptions = setUploadConfig({ 
  obsHost: cookies.get("RESOURCE_SERVER_HOST") || RESOURCE_SERVER_HOST,
  uptokenHost:  API_HOST,
  authorization: cookies.get("token") || cookies.get("authorization")  || getUrlParam('token') || sessionStorage.getItem("token") || getURLHash('token'),
  config : {
    uphost: cookies.get("UPLOAD_SERVER_URL"),
    upprotocol: UPLOAD_SERVER_PROTOCOL,
    auto_start: true
  }
})