/**
 * Lightning Touch makes links responsive without the several
 * hundred millisecond delay typical in a hendheld touchscreen browser.
 * 
 * Click events can take 300 ms or so to register on a mobile device because 
 * the device is waiting to see if it's a double click or a touch-and-drag 
 * event.  Use touchStart etc. to work around this issue, but it's not as 
 * straightforward as one might hope.
 * 
 * This code started with a portion of fastButtons created and shared by Google
 * and used according to terms described in the Creative Commons 3.0 Attribution
 * License.  fastButtons can be found at: 
 * http://code.google.com/mobile/articles/fast_buttons.html
 *
 * @module Lightning Touch
 * @author Rich Trott
 * @copyright Copyright (c) 2012 UC Regents
 * @version 1.0.1
 */
/*
 * SCN Developers: This file has been modified and pruned of many unneccessary functions
 * that we were not using.
 */
(function (lt) {
    "use strict";
    var LightningTouch,
        coordinates,
        pop,
        preventGhostClick,
        clickBust;

    coordinates = [];

    pop = function () {
        coordinates.splice(0, 2);
    };

    preventGhostClick = function (x, y) {
        coordinates.push(x, y);
        window.setTimeout(pop, 2500);
    };

    clickBust = function (event) {
        var i, x, y;
        for (i = 0; i < coordinates.length; i += 2) {
            x = coordinates[i];
            y = coordinates[i + 1];
            if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    document.addEventListener('click', clickBust, true);

    lt.LightningTouch = function (element, handler, event) {
        this.element = element;
        this.handler = handler;

        element.addEventListener('touchstart', this, false);
        element.addEventListener('click', this, false);
    };

    lt.LightningTouch.prototype.handleEvent = function (event, viewModel) {
        switch (event.type) {
        case 'touchstart':
            this.onTouchStart(event, viewModel);
            break;
        case 'touchmove':
            this.onTouchMove(event, viewModel);
            break;
        case 'touchend':
            this.onClick(event, viewModel);
            break;
        case 'click':
            this.onClick(event, viewModel);
            break;
        }
    };

    lt.LightningTouch.prototype.onTouchStart = function (event) {
        // adding the data-tap-alloweventbubble='true' attribute to an element wired
        // for lightning touch will allow the event to bubble up so it can be handled
        // by parent elements..this is useful in the case where an element touch event
        // can be used for more than one thing, i.e. a button is part of a scrolling div, etc
        if (this.element.getAttribute("data-tap-alloweventbubble") != "true") {
            event.stopPropagation();
            //event.preventDefault();
        }

        if (this.element.getAttribute("data-tap-preventdefault") == "true") {
            event.preventDefault();
        }

        this.element.addEventListener('touchend', this, false);
        document.body.addEventListener('touchmove', this, false);

        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    };

    lt.LightningTouch.prototype.onTouchMove = function (event) {
        if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
                Math.abs(event.touches[0].clientY - this.startY) > 10) {
            this.reset();
        }
    };

    lt.LightningTouch.prototype.onClick = function (event, viewModel) {
        event.stopPropagation();
        event.preventDefault();
        this.reset();

        if (event.type === 'touchend') {
            preventGhostClick(this.startX, this.startY);
        }

        this.handler(event, viewModel);
    };

    lt.LightningTouch.prototype.reset = function () {
        this.element.removeEventListener('touchend', this, false);
        document.body.removeEventListener('touchmove', this, false);
    };
}(window.lt = window.lt || {}));