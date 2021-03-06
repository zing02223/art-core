/*! iScroll v5.2.0-snapshot ~ (c) 2008-2017 Matteo Spinelli ~ http://cubiq.org/license */
import utils from './utils';
const rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
export default class IScroll {
    constructor(el, options) {
        this.version = '5.2.0-snapshot';
        this.initSnap = () => {
            this.currentPage = {};
            if (typeof this.options.snap === 'string') {
                this.options.snap = this.scroller.querySelectorAll(this.options.snap);
            }
            this.on('refresh', function () {
                let i = 0;
                let l;
                let m = 0;
                let n;
                let cx;
                let cy;
                let x = 0;
                let y;
                let el;
                let rect;
                const stepX = this.options.snapStepX || this.wrapperWidth;
                const stepY = this.options.snapStepY || this.wrapperHeight;
                this.pages = [];
                if (!this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight) {
                    return;
                }
                if (this.options.snap === true) {
                    cx = Math.round(stepX / 2);
                    cy = Math.round(stepY / 2);
                    while (x > -this.scrollerWidth) {
                        this.pages[i] = [];
                        l = 0;
                        y = 0;
                        while (y > -this.scrollerHeight) {
                            this.pages[i][l] = {
                                x: Math.max(x, this.maxScrollX),
                                y: Math.max(y, this.maxScrollY),
                                width: stepX,
                                height: stepY,
                                cx: x - cx,
                                cy: y - cy
                            };
                            y -= stepY;
                            l++;
                        }
                        x -= stepX;
                        i++;
                    }
                }
                else {
                    el = this.options.snap;
                    l = el.length;
                    n = -1;
                    for (; i < l; i++) {
                        rect = utils.getRect(el[i]);
                        if (i === 0 || rect.left <= utils.getRect(el[i - 1]).left) {
                            m = 0;
                            n++;
                        }
                        if (!this.pages[m]) {
                            this.pages[m] = [];
                        }
                        x = Math.max(-rect.left, this.maxScrollX);
                        y = Math.max(-rect.top, this.maxScrollY);
                        cx = x - Math.round(rect.width / 2);
                        cy = y - Math.round(rect.height / 2);
                        this.pages[m][n] = {
                            x,
                            y,
                            cx,
                            cy,
                            width: rect.width,
                            height: rect.height
                        };
                        if (x > this.maxScrollX) {
                            m++;
                        }
                    }
                }
                this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);
                // Update snap threshold if needed
                if (this.options.snapThreshold % 1 === 0) {
                    this.snapThresholdX = this.options.snapThreshold;
                    this.snapThresholdY = this.options.snapThreshold;
                }
                else {
                    this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
                    this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
                }
            });
            this.on('flick', function () {
                const time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.x - this.startX), 1000), Math.min(Math.abs(this.y - this.startY), 1000)), 300);
                this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, time);
            });
        };
        this.goToPage = (x, y, time, easing) => {
            easing = easing || this.options.bounceEasing;
            if (x >= this.pages.length) {
                x = this.pages.length - 1;
            }
            else if (x < 0) {
                x = 0;
            }
            if (this.pages[x] && y >= this.pages[x].length) {
                y = this.pages[x].length - 1;
            }
            else if (y < 0) {
                y = 0;
            }
            // debugger;
            if (!this.pages.length) {
                return;
            }
            const posX = this.pages[x][y].x;
            const posY = this.pages[x][y].y;
            time = time === undefined ? this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(posX - this.x), 1000), Math.min(Math.abs(posY - this.y), 1000)), 300) : time;
            this.currentPage = {
                x: posX,
                y: posY,
                pageX: x,
                pageY: y
            };
            this.scrollTo(posX, posY, time, easing);
        };
        this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
        if (!this.wrapper) {
            throw Error('please pass in proper element or selector string');
        }
        this.scroller = this.wrapper.children[0];
        if (options && options.scrollerSelector) {
            const scrollerNew = this.wrapper.querySelector(options.scrollerSelector);
            if (scrollerNew) {
                this.scroller = scrollerNew;
            }
        }
        this.scrollerStyle = this.scroller.style; // cache style for better performance
        this.options = {
            resizeScrollbars: true,
            mouseWheelSpeed: 20,
            snapThreshold: 0.334,
            // INSERT POINT: OPTIONS
            disablePointer: !utils.hasPointer,
            disableTouch: utils.hasPointer || !utils.hasTouch,
            disableMouse: utils.hasPointer || utils.hasTouch,
            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            momentum: true,
            bounce: true,
            bounceTime: 600,
            bounceEasing: '',
            preventDefault: true,
            preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },
            HWCompositing: true,
            useTransition: true,
            useTransform: true,
            bindToWrapper: typeof window.onmousedown === 'undefined'
        };
        // merge options
        for (const i in options) {
            this.options[i] = options[i];
        }
        // Normalize options
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';
        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;
        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;
        // If you want eventPassthrough I have to lock one of the axes
        this.options.scrollY = this.options.eventPassthrough === 'vertical' ? false : this.options.scrollY;
        this.options.scrollX = this.options.eventPassthrough === 'horizontal' ? false : this.options.scrollX;
        // With eventPassthrough we also need lockDirection mechanism
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;
        this.options.bounceEasing = typeof this.options.bounceEasing === 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;
        this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;
        if (this.options.tap === true) {
            this.options.tap = 'tap';
        }
        // https://github.com/cubiq/iscroll/issues/1029
        if (!this.options.useTransition && !this.options.useTransform) {
            if (!this.scrollerStyle.position ||
                !(/relative|absolute/i).test(this.scrollerStyle.position)) {
                this.scrollerStyle.position = 'relative';
            }
        }
        if (this.options.shrinkScrollbars === 'scale') {
            this.options.useTransition = false;
        }
        // this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;
        if (this.options.probeType === 3) {
            this.options.useTransition = false;
        }
        // INSERT POINT: NORMALIZATION
        // Some defaults
        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this.events = {};
        // INSERT POINT: DEFAULTS
        this.init();
        this.refresh();
        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
    }
    init() {
        this.initEvents();
        if (this.options.scrollbars || this.options.indicators) {
            this.initIndicators();
        }
        if (this.options.mouseWheel) {
            this.initWheel();
        }
        if (this.options.snap) {
            // debugger;
            this.initSnap();
        }
        if (this.options.keyBindings) {
            this.initKeys();
        }
        // INSERT POINT: init
    }
    destroy() {
        this.initEvents(true);
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = undefined;
        this.execEvent('destroy');
    }
    transitionEnd(e) {
        if (e.target !== this.scroller || !this.isInTransition) {
            return;
        }
        this.transitionTime();
        if (!this.resetPosition(this.options.bounceTime)) {
            this.isInTransition = false;
            this.execEvent('scrollEnd');
        }
    }
    start(e) {
        // React to left mouse button only
        if (utils.eventType[e.type] !== 1) {
            // for button property
            // http://unixpapa.com/js/mouse.html
            let button;
            if (!e.which) {
                /* IE case */
                button = (e.button < 2) ? 0 :
                    ((e.button === 4) ? 1 : 2);
            }
            else {
                /* All others */
                button = e.button;
            }
            if (button !== 0) {
                return;
            }
        }
        if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
            return;
        }
        if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
            e.preventDefault();
        }
        const point = e.touches ? e.touches[0] : e;
        let pos;
        this.initiated = utils.eventType[e.type];
        this.moved = false;
        this.distX = 0;
        this.distY = 0;
        this.directionX = 0;
        this.directionY = 0;
        this.directionLocked = 0;
        this.startTime = utils.getTime();
        if (this.options.useTransition && this.isInTransition) {
            this.transitionTime();
            this.isInTransition = false;
            pos = this.getComputedPosition();
            this.translate(Math.round(pos.x), Math.round(pos.y));
            this.execEvent('scrollEnd');
        }
        else if (!this.options.useTransition && this.isAnimating) {
            this.isAnimating = false;
            this.execEvent('scrollEnd');
        }
        this.startX = this.x;
        this.startY = this.y;
        this.absStartX = this.x;
        this.absStartY = this.y;
        this.pointX = point.pageX;
        this.pointY = point.pageY;
        this.execEvent('beforeScrollStart');
    }
    move(e) {
        if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
            return;
        }
        if (this.options.preventDefault) { // increases performance on Android? TODO: check!
            e.preventDefault();
        }
        const point = e.touches ? e.touches[0] : e;
        const timestamp = utils.getTime();
        let deltaX = point.pageX - this.pointX;
        let deltaY = point.pageY - this.pointY;
        let newX;
        let newY;
        let absDistX;
        let absDistY;
        this.pointX = point.pageX;
        this.pointY = point.pageY;
        this.distX += deltaX;
        this.distY += deltaY;
        absDistX = Math.abs(this.distX);
        absDistY = Math.abs(this.distY);
        // We need to move at least 10 pixels for the scrolling to initiate
        if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
            return;
        }
        // If you are scrolling in one direction lock the other
        if (!this.directionLocked && !this.options.freeScroll) {
            if (absDistX > absDistY + this.options.directionLockThreshold) {
                this.directionLocked = 'h'; // lock horizontally
            }
            else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                this.directionLocked = 'v'; // lock vertically
            }
            else {
                this.directionLocked = 'n'; // no lock
            }
        }
        if (this.directionLocked === 'h') {
            if (this.options.eventPassthrough === 'vertical') {
                e.preventDefault();
            }
            else if (this.options.eventPassthrough === 'horizontal') {
                this.initiated = false;
                return;
            }
            deltaY = 0;
        }
        else if (this.directionLocked === 'v') {
            if (this.options.eventPassthrough === 'horizontal') {
                e.preventDefault();
            }
            else if (this.options.eventPassthrough === 'vertical') {
                this.initiated = false;
                return;
            }
            deltaX = 0;
        }
        deltaX = this.hasHorizontalScroll ? deltaX : 0;
        deltaY = this.hasVerticalScroll ? deltaY : 0;
        newX = this.x + deltaX;
        newY = this.y + deltaY;
        // Slow down if outside of the boundaries
        if (newX > 0 || newX < this.maxScrollX) {
            newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
        }
        if (newY > 0 || newY < this.maxScrollY) {
            newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
        }
        this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
        if (!this.moved) {
            this.execEvent('scrollStart');
        }
        // FIXM: tianyingchun IOS touchend event
        // FIX IOS ios-no-touchend-event-for-not-fullscreen-webview issue
        // http: //stackoverflow.com/questions/26721447/ios-no-touchend-event-for-not-fullscreen-webview
        if (e.changedTouches && e.changedTouches[0].pageY < 0) {
            if (!this.resetPosition(this.options.bounceTime)) {
                this.execEvent('scrollEnd');
            }
        }
        this.moved = true;
        this.translate(newX, newY);
        /* REPLACE START: move */
        if (timestamp - this.startTime > 300) {
            this.startTime = timestamp;
            this.startX = this.x;
            this.startY = this.y;
            if (this.options.probeType === 1) {
                this.execEvent('scroll');
            }
        }
        if (this.options.probeType && this.options.probeType > 1) {
            this.execEvent('scroll');
        }
        /* REPLACE END: move */
    }
    end(e) {
        this.execEvent('touchEnd');
        if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
            return;
        }
        if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
            e.preventDefault();
        }
        // const point = e.changedTouches ? e.changedTouches[0] : e;
        let momentumX;
        let momentumY;
        let newX = Math.round(this.x);
        let newY = Math.round(this.y);
        let time = 0;
        let easing = '';
        const duration = utils.getTime() - this.startTime;
        const distanceX = Math.abs(newX - this.startX);
        const distanceY = Math.abs(newY - this.startY);
        this.isInTransition = 0;
        this.initiated = 0;
        this.endTime = utils.getTime();
        // reset if we are outside of the boundaries
        if (this.resetPosition(this.options.bounceTime)) {
            return;
        }
        this.scrollTo(newX, newY); // ensures that the last position is rounded
        // we scrolled less than 10 pixels
        if (!this.moved) {
            if (this.options.tap) {
                utils.tap(e, this.options.tap);
            }
            if (this.options.click) {
                utils.click(e);
            }
            this.execEvent('scrollCancel');
            return;
        }
        if (this.events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
            this.execEvent('flick');
            return;
        }
        // start momentum animation if needed
        if (this.options.momentum && duration < 300) {
            momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
            momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
            this.isInTransition = 1;
        }
        if (this.options.snap) {
            const snap = this.nearestSnap(newX, newY);
            this.currentPage = snap;
            time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(newX - snap.x), 1000), Math.min(Math.abs(newY - snap.y), 1000)), 300);
            newX = snap.x;
            newY = snap.y;
            this.directionX = 0;
            this.directionY = 0;
            easing = this.options.bounceEasing;
        }
        // INSERT POINT: end
        if (newX !== this.x || newY !== this.y) {
            // change easing function when scroller goes out of the boundaries
            if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                easing = utils.ease.quadratic;
            }
            this.scrollTo(newX, newY, time, easing);
            return;
        }
        this.execEvent('scrollEnd');
    }
    resize() {
        // if (!this.options.resize) { return; }
        const that = this;
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(function () {
            that.refresh();
        }, this.options.resizePolling);
    }
    resetPosition(time) {
        let x = this.x;
        let y = this.y;
        time = time || 0;
        if (!this.hasHorizontalScroll || this.x > 0) {
            x = 0;
        }
        else if (this.x < this.maxScrollX) {
            x = this.maxScrollX;
        }
        if (!this.hasVerticalScroll || this.y > 0) {
            y = 0;
        }
        else if (this.y < this.maxScrollY) {
            y = this.maxScrollY;
        }
        if (x === this.x && y === this.y) {
            return false;
        }
        this.scrollTo(x, y, time, this.options.bounceEasing);
        // update by tianyingchun
        this.execEvent('resetPosition');
        return true;
    }
    disable() {
        this.enabled = false;
    }
    enable() {
        this.enabled = true;
    }
    refresh() {
        if (!this.wrapper) {
            return;
        }
        utils.getRect(this.wrapper); // Force reflow
        this.wrapperWidth = this.wrapper.clientWidth;
        this.wrapperHeight = this.wrapper.clientHeight;
        const rect = utils.getRect(this.scroller);
        /* REPLACE START: refresh */
        this.scrollerWidth = rect.width;
        this.scrollerHeight = rect.height;
        this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
        this.maxScrollY = this.wrapperHeight - this.scrollerHeight;
        /* REPLACE END: refresh */
        this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
        this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;
        if (!this.hasHorizontalScroll) {
            this.maxScrollX = 0;
            this.scrollerWidth = this.wrapperWidth;
        }
        if (!this.hasVerticalScroll) {
            this.maxScrollY = 0;
            this.scrollerHeight = this.wrapperHeight;
        }
        this.endTime = 0;
        this.directionX = 0;
        this.directionY = 0;
        if (utils.hasPointer && !this.options.disablePointer) {
            // The wrapper should have `touchAction` property for using pointerEvent.
            this.wrapper.style[utils.style.touchAction] = utils.getTouchAction(this.options.eventPassthrough, true);
            // case. not support 'pinch-zoom'
            // https://github.com/cubiq/iscroll/issues/1118#issuecomment-270057583
            if (!this.wrapper.style[utils.style.touchAction]) {
                this.wrapper.style[utils.style.touchAction] = utils.getTouchAction(this.options.eventPassthrough, false);
            }
        }
        this.wrapperOffset = utils.offset(this.wrapper);
        this.execEvent('refresh');
        this.resetPosition();
        // INSERT POINT: refresh
    }
    on(type, fn) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(fn);
    }
    off(type, fn) {
        if (!this.events[type]) {
            return;
        }
        const index = this.events[type].indexOf(fn);
        if (index > -1) {
            this.events[type].splice(index, 1);
        }
    }
    execEvent(type) {
        if (!this.events[type]) {
            return;
        }
        let i = 0;
        const l = this.events[type].length;
        if (!l) {
            return;
        }
        for (; i < l; i++) {
            this.events[type][i].apply(this, [].slice.call(arguments, 1));
        }
    }
    scrollBy(x, y, time, easing) {
        x = this.x + x;
        y = this.y + y;
        time = time || 0;
        this.scrollTo(x, y, time, easing);
    }
    scrollTo(x, y, time, easing) {
        easing = easing || utils.ease.circular;
        this.isInTransition = (this.options.useTransition || false) && time > 0;
        const transitionType = this.options.useTransition && easing.style;
        if (!time || transitionType) {
            if (transitionType) {
                this.transitionTimingFunction(easing.style);
                this.transitionTime(time);
            }
            this.translate(x, y);
        }
        else {
            this.animate(x, y, time, easing.fn);
        }
    }
    scrollToElement(el, time, offsetX, offsetY, easing) {
        el = el.nodeType ? el : this.scroller.querySelector(el);
        if (!el) {
            return;
        }
        const pos = utils.offset(el);
        pos.left -= this.wrapperOffset.left;
        pos.top -= this.wrapperOffset.top;
        // if offsetX/Y are true we center the element to the screen
        const elRect = utils.getRect(el);
        const wrapperRect = utils.getRect(this.wrapper);
        if (offsetX === true) {
            offsetX = Math.round(elRect.width / 2 - wrapperRect.width / 2);
        }
        if (offsetY === true) {
            offsetY = Math.round(elRect.height / 2 - wrapperRect.height / 2);
        }
        pos.left -= offsetX || 0;
        pos.top -= offsetY || 0;
        pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
        pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;
        time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;
        this.scrollTo(pos.left, pos.top, time, easing);
    }
    transitionTime(time) {
        if (!this.options.useTransition) {
            return;
        }
        time = time || 0;
        const durationProp = utils.style.transitionDuration;
        if (!durationProp) {
            return;
        }
        this.scrollerStyle[durationProp] = time + 'ms';
        if (!time && utils.isBadAndroid) {
            this.scrollerStyle[durationProp] = '0.0001ms';
            // remove 0.0001ms
            const self = this;
            rAF(function () {
                if (self.scrollerStyle[durationProp] === '0.0001ms') {
                    self.scrollerStyle[durationProp] = '0s';
                }
            });
        }
        if (this.indicators) {
            for (let i = this.indicators.length; i--;) {
                this.indicators[i].transitionTime(time);
            }
        }
        // INSERT POINT: transitionTime
    }
    transitionTimingFunction(easing) {
        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
        if (this.indicators) {
            for (let i = this.indicators.length; i--;) {
                this.indicators[i].transitionTimingFunction(easing);
            }
        }
        // INSERT POINT: transitionTimingFunction
    }
    translate(x, y) {
        if (this.options.useTransform) {
            /* REPLACE START: translate */
            this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
            /* REPLACE END: translate */
        }
        else {
            x = Math.round(x);
            y = Math.round(y);
            this.scrollerStyle.left = x + 'px';
            this.scrollerStyle.top = y + 'px';
        }
        this.x = x;
        this.y = y;
        if (this.indicators) {
            for (let i = this.indicators.length; i--;) {
                this.indicators[i].updatePosition();
            }
        }
        // INSERT POINT: translate
    }
    getComputedPosition() {
        let matrix = window.getComputedStyle(this.scroller, undefined);
        let x;
        let y;
        if (this.options.useTransform) {
            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        }
        else {
            x = +matrix.left.replace(/[^-\d.]/g, '');
            y = +matrix.top.replace(/[^-\d.]/g, '');
        }
        return { x, y };
    }
    initWheel() {
        utils.addEvent(this.wrapper, 'wheel', this);
        utils.addEvent(this.wrapper, 'mousewheel', this);
        utils.addEvent(this.wrapper, 'DOMMouseScroll', this);
        this.on('destroy', function () {
            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = null;
            utils.removeEvent(this.wrapper, 'wheel', this);
            utils.removeEvent(this.wrapper, 'mousewheel', this);
            utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
        });
    }
    wheel(e) {
        if (!this.enabled ||
            !this.options.mouseWheelSpeed) {
            return;
        }
        e.preventDefault();
        let wheelDeltaX;
        let wheelDeltaY;
        let newX;
        let newY;
        const that = this;
        if (this.wheelTimeout === undefined) {
            that.execEvent('scrollStart');
        }
        // Execute the scrollEnd event after 400ms the wheel stopped scrolling
        clearTimeout(this.wheelTimeout);
        this.wheelTimeout = window.setTimeout(function () {
            if (!that.options.snap) {
                that.execEvent('scrollEnd');
            }
            that.wheelTimeout = undefined;
        }, 400);
        if ('deltaX' in e) {
            if (e.deltaMode === 1) {
                wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
                wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
            }
            else {
                wheelDeltaX = -e.deltaX;
                wheelDeltaY = -e.deltaY;
            }
        }
        else if ('wheelDeltaX' in e) {
            wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
            wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
        }
        else if ('wheelDelta' in e) {
            wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
        }
        else if ('detail' in e) {
            wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
        }
        else {
            return;
        }
        wheelDeltaX *= (this.options.invertWheelDirection ? -1 : 1);
        wheelDeltaY *= (this.options.invertWheelDirection ? -1 : 1);
        if (!this.hasVerticalScroll) {
            wheelDeltaX = wheelDeltaY;
            wheelDeltaY = 0;
        }
        if (this.options.snap) {
            newX = this.currentPage.pageX;
            newY = this.currentPage.pageY;
            if (wheelDeltaX > 0) {
                newX--;
            }
            else if (wheelDeltaX < 0) {
                newX++;
            }
            if (wheelDeltaY > 0) {
                newY--;
            }
            else if (wheelDeltaY < 0) {
                newY++;
            }
            this.goToPage(newX, newY);
            return;
        }
        newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
        newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);
        this.directionX = wheelDeltaX > 0 ? -1 : wheelDeltaX < 0 ? 1 : 0;
        this.directionY = wheelDeltaY > 0 ? -1 : wheelDeltaY < 0 ? 1 : 0;
        if (newX > 0) {
            newX = 0;
        }
        else if (newX < this.maxScrollX) {
            newX = this.maxScrollX;
        }
        if (newY > 0) {
            newY = 0;
        }
        else if (newY < this.maxScrollY) {
            newY = this.maxScrollY;
        }
        this.scrollTo(newX, newY, 0);
        if (!this.options.probeType || this.options.probeType > 1) {
            this.execEvent('scroll');
        }
        // INSERT POINT: wheel
    }
    nearestSnap(x, y) {
        if (!this.pages.length) {
            return { x: 0, y: 0, pageX: 0, pageY: 0 };
        }
        let i = 0;
        let l = this.pages.length;
        let m = 0;
        // Check if we exceeded the snap threshold
        if (Math.abs(x - this.absStartX) < this.snapThresholdX &&
            Math.abs(y - this.absStartY) < this.snapThresholdY) {
            return this.currentPage;
        }
        if (x > 0) {
            x = 0;
        }
        else if (x < this.maxScrollX) {
            x = this.maxScrollX;
        }
        if (y > 0) {
            y = 0;
        }
        else if (y < this.maxScrollY) {
            y = this.maxScrollY;
        }
        for (; i < l; i++) {
            if (x >= this.pages[i][0].cx) {
                x = this.pages[i][0].x;
                break;
            }
        }
        l = this.pages[i].length;
        for (; m < l; m++) {
            if (y >= this.pages[0][m].cy) {
                y = this.pages[0][m].y;
                break;
            }
        }
        if (i === this.currentPage.pageX) {
            i += this.directionX;
            if (i < 0) {
                i = 0;
            }
            else if (i >= this.pages.length) {
                i = this.pages.length - 1;
            }
            x = this.pages[i][0].x;
        }
        if (m === this.currentPage.pageY) {
            m += this.directionY;
            if (m < 0) {
                m = 0;
            }
            else if (m >= this.pages[0].length) {
                m = this.pages[0].length - 1;
            }
            y = this.pages[0][m].y;
        }
        return {
            x,
            y,
            pageX: i,
            pageY: m
        };
    }
    next(time, easing) {
        let x = this.currentPage.pageX;
        let y = this.currentPage.pageY;
        x++;
        if (x >= this.pages.length && this.hasVerticalScroll) {
            x = 0;
            y++;
        }
        this.goToPage(x, y, time, easing);
    }
    prev(time, easing) {
        let x = this.currentPage.pageX;
        let y = this.currentPage.pageY;
        x--;
        if (x < 0 && this.hasVerticalScroll) {
            x = 0;
            y--;
        }
        this.goToPage(x, y, time, easing);
    }
    initKeys() {
        // default key bindings
        const keys = {
            pageUp: 33,
            pageDown: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            down: 40
        };
        let i;
        // if you give me characters I give you keycode
        if (typeof this.options.keyBindings === 'object') {
            for (i in this.options.keyBindings) {
                if (typeof this.options.keyBindings[i] === 'string') {
                    this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
                }
            }
        }
        else {
            this.options.keyBindings = {};
        }
        for (i in keys) {
            this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
        }
        utils.addEvent(window, 'keydown', this);
        this.on('destroy', function () {
            utils.removeEvent(window, 'keydown', this);
        });
    }
    key(e) {
        if (!this.enabled ||
            !this.options.keyBindings) {
            return;
        }
        const snap = this.options.snap; // we are using this alot, better to cache it
        const now = utils.getTime();
        const prevTime = this.keyTime || 0;
        const acceleration = 0.250;
        let newX = snap ? this.currentPage.pageX : this.x;
        let newY = snap ? this.currentPage.pageY : this.y;
        let pos;
        if (this.options.useTransition && this.isInTransition) {
            pos = this.getComputedPosition();
            this.translate(Math.round(pos.x), Math.round(pos.y));
            this.isInTransition = false;
        }
        this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;
        switch (e.keyCode) {
            case this.options.keyBindings.pageUp:
                if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                    newX += snap ? 1 : this.wrapperWidth;
                }
                else {
                    newY += snap ? 1 : this.wrapperHeight;
                }
                break;
            case this.options.keyBindings.pageDown:
                if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                    newX -= snap ? 1 : this.wrapperWidth;
                }
                else {
                    newY -= snap ? 1 : this.wrapperHeight;
                }
                break;
            case this.options.keyBindings.end:
                newX = snap ? this.pages.length - 1 : this.maxScrollX;
                newY = snap ? this.pages[0].length - 1 : this.maxScrollY;
                break;
            case this.options.keyBindings.home:
                newX = 0;
                newY = 0;
                break;
            case this.options.keyBindings.left:
                newX += snap ? -1 : 5 + this.keyAcceleration >> 0;
                break;
            case this.options.keyBindings.up:
                newY += snap ? 1 : 5 + this.keyAcceleration >> 0;
                break;
            case this.options.keyBindings.right:
                newX -= snap ? -1 : 5 + this.keyAcceleration >> 0;
                break;
            case this.options.keyBindings.down:
                newY -= snap ? 1 : 5 + this.keyAcceleration >> 0;
                break;
            default:
                return;
        }
        if (snap) {
            this.goToPage(newX, newY);
            return;
        }
        if (newX > 0) {
            newX = 0;
            this.keyAcceleration = 0;
        }
        else if (newX < this.maxScrollX) {
            newX = this.maxScrollX;
            this.keyAcceleration = 0;
        }
        if (newY > 0) {
            newY = 0;
            this.keyAcceleration = 0;
        }
        else if (newY < this.maxScrollY) {
            newY = this.maxScrollY;
            this.keyAcceleration = 0;
        }
        this.scrollTo(newX, newY, 0);
        this.keyTime = now;
    }
    animate(destX, destY, duration, easingFn) {
        const that = this;
        const startX = this.x;
        const startY = this.y;
        const startTime = utils.getTime();
        const destTime = startTime + duration;
        function step() {
            let now = utils.getTime();
            let newX;
            let newY;
            let easing;
            if (now >= destTime) {
                that.isAnimating = false;
                that.translate(destX, destY);
                if (!that.resetPosition(that.options.bounceTime)) {
                    that.execEvent('scrollEnd');
                }
                return;
            }
            now = (now - startTime) / duration;
            easing = easingFn(now);
            newX = (destX - startX) * easing + startX;
            newY = (destY - startY) * easing + startY;
            that.translate(newX, newY);
            if (that.isAnimating) {
                rAF(step);
            }
            if (that.options.probeType === 3) {
                that.execEvent('scroll');
            }
        }
        this.isAnimating = true;
        step();
    }
    handleEvent(e) {
        switch (e.type) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                this.start(e);
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                this.move(e);
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
            case 'pointercancel':
            case 'MSPointerCancel':
            case 'mousecancel':
                this.end(e);
                break;
            case 'orientationchange':
            case 'resize':
                this.resize();
                break;
            case 'transitionend':
            case 'webkitTransitionEnd':
            case 'oTransitionEnd':
            case 'MSTransitionEnd':
                this.transitionEnd(e);
                break;
            case 'wheel':
            case 'DOMMouseScroll':
            case 'mousewheel':
                this.wheel(e);
                break;
            case 'keydown':
                this.key(e);
                break;
            case 'click':
                if (this.enabled && !e.constructed) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
        }
    }
    // --------------------------------------------
    initEvents(remove) {
        const eventType = remove ? utils.removeEvent : utils.addEvent;
        const target = this.options.bindToWrapper ? this.wrapper : window;
        eventType(window, 'orientationchange', this);
        eventType(window, 'resize', this);
        if (this.options.click) {
            eventType(this.wrapper, 'click', this, true);
        }
        if (!this.options.disableMouse) {
            eventType(this.wrapper, 'mousedown', this);
            eventType(target, 'mousemove', this);
            eventType(target, 'mousecancel', this);
            eventType(target, 'mouseup', this);
        }
        if (utils.hasPointer && !this.options.disablePointer) {
            eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
            eventType(target, utils.prefixPointerEvent('pointermove'), this);
            eventType(target, utils.prefixPointerEvent('pointercancel'), this);
            eventType(target, utils.prefixPointerEvent('pointerup'), this);
        }
        if (utils.hasTouch && !this.options.disableTouch) {
            eventType(this.wrapper, 'touchstart', this);
            eventType(target, 'touchmove', this);
            eventType(target, 'touchcancel', this);
            eventType(target, 'touchend', this);
        }
        eventType(this.scroller, 'transitionend', this);
        eventType(this.scroller, 'webkitTransitionEnd', this);
        eventType(this.scroller, 'oTransitionEnd', this);
        eventType(this.scroller, 'MSTransitionEnd', this);
    }
    initIndicators() {
        const interactive = this.options.interactiveScrollbars;
        const customStyle = typeof this.options.scrollbars !== 'string';
        const that = this;
        let indicators = [];
        let indicator;
        this.indicators = [];
        if (this.options.scrollbars) {
            // Vertical scrollbar
            if (this.options.scrollY) {
                indicator = {
                    el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
                    interactive,
                    customStyle,
                    defaultScrollbars: true,
                    resize: this.options.resizeScrollbars,
                    shrink: this.options.shrinkScrollbars,
                    fade: this.options.fadeScrollbars,
                    listenX: false
                };
                if (this.wrapper) {
                    this.wrapper.appendChild(indicator.el);
                }
                indicators.push(indicator);
            }
            // Horizontal scrollbar
            if (this.options.scrollX) {
                indicator = {
                    el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
                    interactive,
                    customStyle,
                    defaultScrollbars: true,
                    resize: this.options.resizeScrollbars,
                    shrink: this.options.shrinkScrollbars,
                    fade: this.options.fadeScrollbars,
                    listenY: false
                };
                if (this.wrapper) {
                    this.wrapper.appendChild(indicator.el);
                }
                indicators.push(indicator);
            }
        }
        if (this.options.indicators) {
            // TODO: check concat compatibility
            indicators = indicators.concat(this.options.indicators);
        }
        for (let i = indicators.length; i--;) {
            this.indicators.push(new Indicator(this, indicators[i]));
        }
        // TODO: check if we can use array.map (wide compatibility and performance issues)
        function indicatorsMap(fn) {
            if (that.indicators) {
                for (let i = that.indicators.length; i--;) {
                    fn.call(that.indicators[i]);
                }
            }
        }
        if (this.options.fadeScrollbars) {
            this.on('scrollEnd', function () {
                indicatorsMap(function () {
                    this.fade();
                });
            });
            this.on('scrollCancel', function () {
                indicatorsMap(function () {
                    this.fade();
                });
            });
            this.on('scrollStart', function () {
                indicatorsMap(function () {
                    this.fade(1);
                });
            });
            this.on('beforeScrollStart', function () {
                indicatorsMap(function () {
                    this.fade(1, true);
                });
            });
        }
        this.on('refresh', function () {
            indicatorsMap(function () {
                this.refresh();
            });
        });
        this.on('destroy', function () {
            indicatorsMap(function () {
                this.destroy();
            });
            delete this.indicators;
        });
    }
}
class Indicator {
    constructor(scroller, options) {
        this.wrapper = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
        if (!this.wrapper) {
            // throw Error('please pass in proper element or selector string');
            console.log('please pass in proper element or selector string');
            return;
        }
        this.wrapperStyle = this.wrapper.style;
        this.indicator = this.wrapper.children[0];
        this.indicatorStyle = this.indicator.style;
        this.scroller = scroller;
        this.options = {
            listenX: true,
            listenY: true,
            interactive: false,
            resize: true,
            defaultScrollbars: false,
            shrink: false,
            fade: false,
            speedRatioX: 0,
            speedRatioY: 0
        };
        for (const i in options) {
            this.options[i] = options[i];
        }
        this.sizeRatioX = 1;
        this.sizeRatioY = 1;
        this.maxPosX = 0;
        this.maxPosY = 0;
        if (this.options.interactive) {
            if (!this.options.disableTouch) {
                utils.addEvent(this.indicator, 'touchstart', this);
                utils.addEvent(window, 'touchend', this);
            }
            if (!this.options.disablePointer) {
                utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
            }
            if (!this.options.disableMouse) {
                utils.addEvent(this.indicator, 'mousedown', this);
                utils.addEvent(window, 'mouseup', this);
            }
        }
        if (this.options.fade) {
            if (typeof this.scroller.translateZ === 'string') {
                this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
            }
            const durationProp = utils.style.transitionDuration;
            if (!durationProp) {
                return;
            }
            this.wrapperStyle[durationProp] = utils.isBadAndroid ? '0.0001ms' : '0ms';
            // remove 0.0001ms
            const self = this;
            if (utils.isBadAndroid) {
                rAF(function () {
                    if (self.wrapperStyle[durationProp] === '0.0001ms') {
                        self.wrapperStyle[durationProp] = '0s';
                    }
                });
            }
            this.wrapperStyle.opacity = '0';
        }
    }
    handleEvent(e) {
        switch (e.type) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                this.start(e);
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                this.move(e);
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
            case 'pointercancel':
            case 'MSPointerCancel':
            case 'mousecancel':
                this.end(e);
                break;
        }
    }
    destroy() {
        if (this.options.fadeScrollbars) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = undefined;
        }
        if (this.options.interactive) {
            utils.removeEvent(this.indicator, 'touchstart', this);
            utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
            utils.removeEvent(this.indicator, 'mousedown', this);
            utils.removeEvent(window, 'touchmove', this);
            utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
            utils.removeEvent(window, 'mousemove', this);
            utils.removeEvent(window, 'touchend', this);
            utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
            utils.removeEvent(window, 'mouseup', this);
        }
        if (this.options.defaultScrollbars && this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
    }
    start(e) {
        const point = e.touches ? e.touches[0] : e;
        e.preventDefault();
        e.stopPropagation();
        this.transitionTime();
        this.initiated = true;
        this.moved = false;
        this.lastPointX = point.pageX;
        this.lastPointY = point.pageY;
        this.startTime = utils.getTime();
        if (!this.options.disableTouch) {
            utils.addEvent(window, 'touchmove', this);
        }
        if (!this.options.disablePointer) {
            utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
        }
        if (!this.options.disableMouse) {
            utils.addEvent(window, 'mousemove', this);
        }
        this.scroller.execEvent('beforeScrollStart');
    }
    move(e) {
        const point = e.touches ? e.touches[0] : e;
        const timestamp = utils.getTime();
        let deltaX;
        let deltaY;
        let newX;
        let newY;
        if (!this.moved) {
            this.scroller.execEvent('scrollStart');
        }
        this.moved = true;
        deltaX = point.pageX - this.lastPointX;
        this.lastPointX = point.pageX;
        deltaY = point.pageY - this.lastPointY;
        this.lastPointY = point.pageY;
        newX = this.x + deltaX;
        newY = this.y + deltaY;
        this.pos(newX, newY);
        if (this.scroller.options.probeType === 1 && timestamp - this.startTime > 300) {
            this.startTime = timestamp;
            this.scroller.execEvent('scroll');
        }
        else if (this.scroller.options.probeType && this.scroller.options.probeType > 1) {
            this.scroller.execEvent('scroll');
        }
        // INSERT POINT: indicator._move
        e.preventDefault();
        e.stopPropagation();
    }
    end(e) {
        if (!this.initiated) {
            return;
        }
        this.initiated = false;
        e.preventDefault();
        e.stopPropagation();
        utils.removeEvent(window, 'touchmove', this);
        utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
        utils.removeEvent(window, 'mousemove', this);
        if (this.scroller.options.snap) {
            const snap = this.scroller.nearestSnap(this.scroller.x, this.scroller.y);
            const time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.scroller.x - snap.x), 1000), Math.min(Math.abs(this.scroller.y - snap.y), 1000)), 300);
            if (this.scroller.x !== snap.x || this.scroller.y !== snap.y) {
                this.scroller.directionX = 0;
                this.scroller.directionY = 0;
                this.scroller.currentPage = snap;
                this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
            }
        }
        if (this.moved) {
            this.scroller.execEvent('scrollEnd');
        }
    }
    transitionTime(time) {
        time = time || 0;
        const durationProp = utils.style.transitionDuration;
        if (!durationProp) {
            return;
        }
        this.indicatorStyle[durationProp] = time + 'ms';
        if (!time && utils.isBadAndroid) {
            this.indicatorStyle[durationProp] = '0.0001ms';
            // remove 0.0001ms
            const self = this;
            rAF(function () {
                if (self.indicatorStyle[durationProp] === '0.0001ms') {
                    self.indicatorStyle[durationProp] = '0s';
                }
            });
        }
    }
    transitionTimingFunction(easing) {
        this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
    }
    refresh() {
        if (!this.wrapper) {
            return;
        }
        this.transitionTime();
        if (this.options.listenX && !this.options.listenY) {
            this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
        }
        else if (this.options.listenY && !this.options.listenX) {
            this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
        }
        else {
            this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
        }
        if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
            utils.addClass(this.wrapper, 'iScrollBothScrollbars');
            utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');
            if (this.options.defaultScrollbars && this.options.customStyle && this.wrapper) {
                if (this.options.listenX) {
                    this.wrapper.style.right = '8px';
                }
                else {
                    this.wrapper.style.bottom = '8px';
                }
            }
        }
        else {
            utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
            utils.addClass(this.wrapper, 'iScrollLoneScrollbar');
            if (this.options.defaultScrollbars && this.options.customStyle && this.wrapper) {
                if (this.options.listenX) {
                    this.wrapper.style.right = '2px';
                }
                else {
                    this.wrapper.style.bottom = '2px';
                }
            }
        }
        utils.getRect(this.wrapper); // force refresh
        if (this.options.listenX) {
            this.wrapperWidth = this.wrapper.clientWidth;
            if (this.options.resize) {
                this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                this.indicatorStyle.width = this.indicatorWidth + 'px';
            }
            else {
                this.indicatorWidth = this.indicator.clientWidth;
            }
            this.maxPosX = this.wrapperWidth - this.indicatorWidth;
            if (this.options.shrink === 'clip') {
                this.minBoundaryX = -this.indicatorWidth + 8;
                this.maxBoundaryX = this.wrapperWidth - 8;
            }
            else {
                this.minBoundaryX = 0;
                this.maxBoundaryX = this.maxPosX;
            }
            this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
        }
        if (this.options.listenY) {
            this.wrapperHeight = this.wrapper.clientHeight;
            if (this.options.resize) {
                this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                this.indicatorStyle.height = this.indicatorHeight + 'px';
            }
            else {
                this.indicatorHeight = this.indicator.clientHeight;
            }
            this.maxPosY = this.wrapperHeight - this.indicatorHeight;
            if (this.options.shrink === 'clip') {
                this.minBoundaryY = -this.indicatorHeight + 8;
                this.maxBoundaryY = this.wrapperHeight - 8;
            }
            else {
                this.minBoundaryY = 0;
                this.maxBoundaryY = this.maxPosY;
            }
            this.maxPosY = this.wrapperHeight - this.indicatorHeight;
            this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
        }
        this.updatePosition();
    }
    updatePosition() {
        let x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0;
        let y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;
        if (!this.options.ignoreBoundaries) {
            if (x < this.minBoundaryX) {
                if (this.options.shrink === 'scale') {
                    this.width = Math.max(this.indicatorWidth + x, 8);
                    this.indicatorStyle.width = this.width + 'px';
                }
                x = this.minBoundaryX;
            }
            else if (x > this.maxBoundaryX) {
                if (this.options.shrink === 'scale') {
                    this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                    this.indicatorStyle.width = this.width + 'px';
                    x = this.maxPosX + this.indicatorWidth - this.width;
                }
                else {
                    x = this.maxBoundaryX;
                }
            }
            else if (this.options.shrink === 'scale' && this.width !== this.indicatorWidth) {
                this.width = this.indicatorWidth;
                this.indicatorStyle.width = this.width + 'px';
            }
            if (y < this.minBoundaryY) {
                if (this.options.shrink === 'scale') {
                    this.height = Math.max(this.indicatorHeight + y * 3, 8);
                    this.indicatorStyle.height = this.height + 'px';
                }
                y = this.minBoundaryY;
            }
            else if (y > this.maxBoundaryY) {
                if (this.options.shrink === 'scale') {
                    this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                    this.indicatorStyle.height = this.height + 'px';
                    y = this.maxPosY + this.indicatorHeight - this.height;
                }
                else {
                    y = this.maxBoundaryY;
                }
            }
            else if (this.options.shrink === 'scale' && this.height !== this.indicatorHeight) {
                this.height = this.indicatorHeight;
                this.indicatorStyle.height = this.height + 'px';
            }
        }
        this.x = x;
        this.y = y;
        if (this.scroller.options.useTransform) {
            this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
        }
        else {
            this.indicatorStyle.left = x + 'px';
            this.indicatorStyle.top = y + 'px';
        }
    }
    pos(x, y) {
        if (x < 0) {
            x = 0;
        }
        else if (x > this.maxPosX) {
            x = this.maxPosX;
        }
        if (y < 0) {
            y = 0;
        }
        else if (y > this.maxPosY) {
            y = this.maxPosY;
        }
        x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
        y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;
        this.scroller.scrollTo(x, y);
    }
    fade(val, hold) {
        if (hold && !this.visible) {
            return;
        }
        clearTimeout(this.fadeTimeout);
        this.fadeTimeout = undefined;
        const time = val ? 250 : 500;
        const delay = val ? 0 : 300;
        val = val ? '1' : '0';
        this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';
        this.fadeTimeout = window.setTimeout((function (value) {
            this.wrapperStyle.opacity = value;
            this.visible = +value;
        }).bind(this, val), delay);
    }
}
function createDefaultScrollbar(direction, interactive, type) {
    const scrollbar = document.createElement('div');
    const indicator = document.createElement('div');
    if (type === true) {
        scrollbar.style.cssText = 'position:absolute;z-index:9999';
        indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
    }
    indicator.className = 'iScrollIndicator';
    if (direction === 'h') {
        if (type === true) {
            scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
            indicator.style.height = '100%';
        }
        scrollbar.className = 'iScrollHorizontalScrollbar';
    }
    else {
        if (type === true) {
            scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
            indicator.style.width = '100%';
        }
        scrollbar.className = 'iScrollVerticalScrollbar';
    }
    scrollbar.style.cssText += ';overflow:hidden';
    if (!interactive) {
        scrollbar.style.pointerEvents = 'none';
    }
    scrollbar.appendChild(indicator);
    return scrollbar;
}
