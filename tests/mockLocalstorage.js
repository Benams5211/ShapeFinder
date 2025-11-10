// Mock localstorage functionalities for testing

class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    if (typeof value !== 'string') {
      throw new Error('MockLocalStorage: value must be string');
    }
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

module.exports = MockLocalStorage;