// Run with: node --test tests/intro-parallax.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');

function setup(desktop, scrollY = 0) {
    const handlers = {};
    const image = { style: {
        transform: '',
        removeProperty(name) { this[name] = ''; }
    } };
    const media = {
        matches: desktop,
        addEventListener(event, handler) { handlers[`media:${event}`] = handler; }
    };
    const window = {
        pageYOffset: scrollY,
        matchMedia(query) {
            assert.equal(query, '(min-width: 1025px)');
            return media;
        },
        addEventListener(event, handler) { handlers[event] = handler; }
    };
    const context = vm.createContext({
        window,
        document: {
            addEventListener() {},
            querySelectorAll(selector) { return selector === '.intro-image' ? [image] : []; }
        },
        console: { log() {} }
    });
    vm.runInContext(readFileSync(require.resolve('../js/main.js'), 'utf8'), context);
    vm.runInContext('initIntroParallax()', context);
    return { image, media, window, handlers };
}

test('stacked mobile/tablet layout never translates the image on scroll', () => {
    const { image, window, handlers } = setup(false, 400);
    assert.equal(image.style.transform, '');
    for (const y of [0, 100, 400, 1000, 200, 0]) {
        window.pageYOffset = y;
        handlers.scroll();
        assert.equal(image.style.transform, '');
    }
});

test('desktop retains the existing half-speed parallax', () => {
    const { image, window, handlers } = setup(true, 400);
    assert.equal(image.style.transform, 'translateY(200px)');
    window.pageYOffset = 600;
    handlers.scroll();
    assert.equal(image.style.transform, 'translateY(300px)');
});

test('crossing the layout breakpoint clears stale offsets without another scroll', () => {
    const { image, media, handlers } = setup(true, 600);
    media.matches = false;
    handlers['media:change']();
    assert.equal(image.style.transform, '');
    media.matches = true;
    handlers['media:change']();
    assert.equal(image.style.transform, 'translateY(300px)');
});
