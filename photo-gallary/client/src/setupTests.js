import '@testing-library/jest-dom';

// Polyfill window.scrollTo for jsdom
if (typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}

// Mock IntersectionObserver for infinite scroll testing
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target) {
    this.target = target;
  }

  unobserve() {
    this.target = null;
  }

  disconnect() {
    this.target = null;
  }

  // Test helper to simulate intersection trigger
  triggerIntersect(isIntersecting = true) {
    if (this.callback) {
      this.callback([{ isIntersecting, target: this.target }]);
    }
  }
}

MockIntersectionObserver.instances = [];
window.IntersectionObserver = MockIntersectionObserver;
globalThis.IntersectionObserver = MockIntersectionObserver;
