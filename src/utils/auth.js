import Cookies from 'js-cookie'

const TokenKey = 'X-Token'
const refreshTokenKey = 'refresh_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getRefreshToken() {
  return localStorage.getItem(refreshTokenKey)
}

export function setRefreshToken(refresh_token) {
  return localStorage.setItem(refreshTokenKey, refresh_token)
}

export function removeRefreshToken() {
  return localStorage.removeItem(refreshTokenKey)
}
