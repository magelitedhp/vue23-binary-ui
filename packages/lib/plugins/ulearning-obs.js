import Obs from "ulearning-obs/dist/obs-huawei.js";
import Obs_Huawei from "ulearning-obs/dist/obs-huawei.js";
import Obs_Qiniu from "ulearning-obs/dist/obs-qiniu.js";

function getObs(type = 'default') {
  switch (type) {
    case 'huawei':
      return Obs_Huawei;
    case 'qiniu':
      return Obs_Qiniu;
    default:
      return Obs; // 默认返回 Obs
  }
}

export default Obs;
export { getObs };