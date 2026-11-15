import '@testing-library/jest-dom';

// Polyfill window.matchMedia for jsdom (needed for responsive tests)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Polyfill scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () { };