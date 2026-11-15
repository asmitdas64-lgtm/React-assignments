import '@testing-library/jest-dom';

// Polyfill window.scrollTo for jsdom
if (typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}

// Polyfill AnimationEvent for jsdom
if (typeof window.AnimationEvent === 'undefined') {
  class MockAnimationEvent extends Event {
    constructor(type, eventInitDict) {
      super(type, { bubbles: true, cancelable: true, ...eventInitDict });
      this.animationName = eventInitDict?.animationName || '';
      this.elapsedTime = eventInitDict?.elapsedTime || 0;
    }
  }
  window.AnimationEvent = MockAnimationEvent;
  globalThis.AnimationEvent = MockAnimationEvent;
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
