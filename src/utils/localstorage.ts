class Storage {
  set(key: string, value: unknown) {
    let stringifyValue: string
    try {
      stringifyValue = JSON.stringify(value)
      localStorage.setItem(key, stringifyValue)
    } catch (e) {
      console.error(e)
    }
  }

  get(key: string) {
    const value = localStorage.getItem(key)
    if (!value) {
      return
    }
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  remove(key: string) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }
}

export const storage = new Storage()
