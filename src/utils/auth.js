// import Cookies from 'js-cookie'
import timeFormat from './date'

const TOKEN_KEY = 'TOKEN'
const EXPIRED_KEY = 'EXPIRED'
const REFRESH_TOKEN_KEY = 'REFRESH-TOKEN'

export function getToken() {
  // return Cookies.get(TOKEN_KEY)
  // return sessionStorage.getItem(TOKEN_KEY)
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  // return Cookies.set(TOKEN_KEY, token)
  // return sessionStorage.setItem(TOKEN_KEY, token)
  return localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  // return Cookies.remove(TOKEN_KEY)
  // return sessionStorage.removeItem(TOKEN_KEY)
  return localStorage.removeItem(TOKEN_KEY)
}

export function setExpired() {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 30)
  const dateStr = timeFormat(date, 'yyyymmddhhMMss')
  return sessionStorage.setItem(EXPIRED_KEY, dateStr)
}

export function isExpired() {
  const d1 = sessionStorage.getItem(EXPIRED_KEY)
  const d2 = timeFormat(new Date(), 'yyyymmddhhMMss')
  return d1 < d2
}

export function removeExpired() {
  return sessionStorage.removeItem(EXPIRED_KEY)
}

export function setRefreshToken(refreshToken) {
  return localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function removeRefreshToken() {
  return localStorage.removeItem(REFRESH_TOKEN_KEY)
}
