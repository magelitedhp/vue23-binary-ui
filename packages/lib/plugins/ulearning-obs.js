import Obs_Huawei from "ulearning-obs/dist/obs-huawei.js";
import Obs_Qiniu from "ulearning-obs/dist/obs-qiniu.js";
import { isCN } from '../config'

export default  !isCN ? Obs_Qiniu : Obs_Huawei;