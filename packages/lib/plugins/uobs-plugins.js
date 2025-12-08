import cookie from "../utils/cookie.js";
import { IS_SELF_UPLOAD, UPLOAD_API_HOST, RESOURCE_SERVER_HOST, UPLOAD_SERVER_HOST } from '../config'

if (IS_SELF_UPLOAD && (!cookie.get("RESOURCE_SERVER_HOST") || !cookie.get("UPLOAD_SERVER_URL"))) {
  cookie.set("RESOURCE_SERVER_HOST", RESOURCE_SERVER_HOST)
  cookie.set("UPLOAD_SERVER_HOST", UPLOAD_API_HOST)
  cookie.set("UPLOAD_SERVER_URL", UPLOAD_SERVER_HOST)
}