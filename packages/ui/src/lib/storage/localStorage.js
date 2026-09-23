export const localStorage = {
  get(key, fallback = null) {
    try {
      return window.localStorage.getItem(key) ?? fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  },

  clear() {
    try {
      window.localStorage.clear()
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  }
}
