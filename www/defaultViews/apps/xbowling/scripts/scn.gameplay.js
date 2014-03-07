(function (gameplay) {
    gameplay.getGameDateTimeWindow = function (minutes) {
        var from = new Date();
        var to = new Date();

        var milliseconds = minutes * 60 * 1000;
        var fromTicks = to.getTime() - milliseconds;

        from.setTime(fromTicks);

        var fromString = scn.formatDateTimeForRequest(from);
        var toString = scn.formatDateTimeForRequest(to);

        return { from: fromString, to: toString };
    },

    gameplay.getThrowClass = function (pinArray, position) {
        var twoRaisedPosition = Math.pow(2, position);

        if ((pinArray & twoRaisedPosition) == twoRaisedPosition) {
            return 'ball';
        } else {
            return 'ball downed';
        }
    },

    gameplay.isStrike = function (pinArray) {
        return pinArray == 0;
    }

    gameplay.frameTap = function () {
        var elm = jQuery(this.element);

        var tapOrder = parseInt(elm.attr("data-taporder"));

        var nextElm = elm.siblings("[data-taporder='" + (tapOrder + 1) + "']");
        if (nextElm.length == 0) {
            var nextElm = elm.siblings("[data-taporder='1']");
            if (nextElm.length == 0) {
                return;
            }
        }

        elm.addClass("hidden");
        nextElm.removeClass("hidden");
    },

    gameplay.oldwireFrameTaps = function (elm) {
        var taps = jQuery("[data-taporder]", elm);
        for (var i = 0; i < taps.length; i++) {
            var jqTap = jQuery(taps[i]);
            if (jqTap.is(":visible")) {
                jqTap.attr("data-tapcurrent", true);
            }

            new lt.LightningTouch(taps[i],
                function (e) {
                    var target = jQuery(e.currentTarget);
                    var targetTapOrder = target.data("taporder");

                    var next;
                    var first;

                    var siblingTaps = target.siblings("[data-tapenabled]");
                    for (var i = 0; i < siblingTaps.length; i++) {
                        var siblingTap = jQuery(siblingTaps[i]);
                        var siblingTapOrder = siblingTap.attr("data-taporder");
                        if (siblingTapOrder > targetTapOrder && (!next || siblingTapOrder < next.attr("data-taporder"))) {
                            next = siblingTap;
                        } else if (siblingTapOrder == 1) {
                            first = siblingTap;
                        }
                    }

                    if (!next) {
                        next = first;
                    }

                    if (next) {
                        if (!next.attr("data-moving") && !target.attr("data-moving")) {
                            next.attr("data-moving", true);
                            target.attr("data-moving", true);

                            next.attr("data-tapcurrent", true);
                            target.removeAttr("data-tapcurrent");

                            next.show();
                            target.data("linked", next);
                            next.removeAttr("data-moving");

                            target.slideUp({
                                complete: function () {
                                    jQuery(this).removeAttr("data-moving");
                                }
                            });
                        }
                    }
                },
                "tap");
        }
    },

    gameplay.formatAddress = function (address) {
        var str = "";
        if (address.addressLine1) {
            str += address.addressLine1;
        }
        if (address.addressLine2) {
            str += "<br />" + address.addressLine2;
        }
        if (address.city) {
            str += "<br />" + address.city;
        }

        return str;
    }
}(window.scn.gameplay = window.scn.gameplay || {}));

