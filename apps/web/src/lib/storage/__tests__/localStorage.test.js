import { localStorage } from '../localStorage'

describe('localStorage', () => {
  let mockLocalStorage

  beforeEach(() => {
    mockLocalStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null
      },
      setItem(key, value) {
        this.data[key] = value
      },
      removeItem(key) {
        delete this.data[key]
      },
      clear() {
        this.data = {}
      }
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    })

    mockLocalStorage.clear()
  })

  describe('get', () => {
    it('should return value from localStorage', () => {
      window.localStorage.setItem('test-key', 'test-value')

      expect(localStorage.get('test-key')).toBe('test-value')
    })

    it('should return null fallback for non-existent key', () => {
      expect(localStorage.get('non-existent-key')).toBe(null)
    })

    it('should return custom fallback for non-existent key', () => {
      expect(localStorage.get('non-existent-key', 'default')).toBe('default')
    })

    it('should return custom fallback when localStorage throws error', () => {
      const originalGetItem = window.localStorage.getItem

      window.localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      expect(localStorage.get('test-key', 'fallback')).toBe('fallback')

      window.localStorage.getItem = originalGetItem
    })
  })

  describe('set', () => {
    it('should store value in localStorage', () => {
      localStorage.set('test-key', 'test-value')

      expect(window.localStorage.getItem('test-key')).toBe('test-value')
    })

    it('should handle localStorage errors silently', () => {
      const originalSetItem = window.localStorage.setItem

      window.localStorage.setItem = jest.fn(() => {
        throw new Error('Quota exceeded')
      })

      expect(() => localStorage.set('test-key', 'test-value')).not.toThrow()

      window.localStorage.setItem = originalSetItem
    })
  })

  describe('remove', () => {
    it('should remove value from localStorage', () => {
      window.localStorage.setItem('test-key', 'test-value')

      localStorage.remove('test-key')

      expect(window.localStorage.getItem('test-key')).toBe(null)
    })

    it('should handle localStorage errors silently', () => {
      const originalRemoveItem = window.localStorage.removeItem

      window.localStorage.removeItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      expect(() => localStorage.remove('test-key')).not.toThrow()

      window.localStorage.removeItem = originalRemoveItem
    })
  })

  describe('clear', () => {
    it('should clear all values from localStorage', () => {
      window.localStorage.setItem('key1', 'value1')
      window.localStorage.setItem('key2', 'value2')
      window.localStorage.setItem('key3', 'value3')

      localStorage.clear()

      expect(window.localStorage.getItem('key1')).toBe(null)
      expect(window.localStorage.getItem('key2')).toBe(null)
      expect(window.localStorage.getItem('key3')).toBe(null)
    })

    it('should handle localStorage errors silently', () => {
      const originalClear = window.localStorage.clear

      window.localStorage.clear = jest.fn(() => {
        throw new Error('localStorage error')
      })

      expect(() => localStorage.clear()).not.toThrow()

      window.localStorage.clear = originalClear
    })
  })
})
