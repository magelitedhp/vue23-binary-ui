import { API_HOST, RESOURCE_SERVER_HOST } from "@/config";
import { setUploadConfig } from "@/utils/file.js"
import cookies from "@/utils/cookie.js"
export const uploadOptions = setUploadConfig({ 
  obsHost: RESOURCE_SERVER_HOST,
  uptokenHost: API_HOST,
  authorization: cookies.get("token") || cookies.get("authorization"),
})