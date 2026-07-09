class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = [];
  }

  getState() {
    return this.state;
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.subscribers.forEach((cb) => cb(this.state));
  }

  subscribe(cb) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((fn) => fn !== cb);
    };
  }
}

export const appStore = new Store({
  route: 'home',
  activeCategory: 'shoes',
  activeProductId: null,
  favorites: [],
  cart: [],
});
