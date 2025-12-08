import Cookies from 'js-cookie'
import { UMOOC_COOKIE_DOMAIN } from '../config'

const defaultCookieSetting = {
  path: '/',
  domain: UMOOC_COOKIE_DOMAIN
}

const cookies = {}

/**
 * @description 存储 cookie 值
 * @param {String} name cookie name
 * @param {String} value cookie value
 * @param {Object} setting cookie setting
 */
cookies.set = (name = 'default', value = '', cookieSetting = {}) => {
  Object.assign(defaultCookieSetting, cookieSetting)
  Cookies.set(`${name}`, value, defaultCookieSetting)
}

/**
 * @description 拿到 cookie 值
 * @param {String} name cookie name
 */
cookies.get = (name = 'default') => {
  return Cookies.get(`${name}`)
}

/**
 * @description 拿到 cookie 全部的值
 */
cookies.getAll = () => {
  return Cookies.get()
}

/**
 * @description 删除 cookie
 * @param {String} name cookie name
 * @param {Object} setting cookie setting
 */
cookies.remove = (name = 'default', setting = defaultCookieSetting) => {
  return Cookies.remove(`${name}`, setting)
}

/**
 * @description 删除 所有cookie
 * @param {Object} setting cookie setting
 */
cookies.removeAll = (setting = defaultCookieSetting) => {
  const arr = cookies.getAll()
  for (const key in arr) {
    cookies.remove(key, setting)
  }
}

export default cookies
