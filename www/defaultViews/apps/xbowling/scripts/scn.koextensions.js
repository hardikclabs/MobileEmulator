ko.bindingHandlers.tap = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // element.lt = new lt.LightningTouch(element, valueAccessor(), "tap");
        scn.viewEngine.wireTap(element, valueAccessor());
    }
};

ko.bindingHandlers.allowBindings = {
    init: function (elem, valueAccessor) {
        // Let bindings proceed as normal *only if* my value is false
        var shouldAllowBindings = ko.utils.unwrapObservable(valueAccessor());
        return { controlsDescendantBindings: !shouldAllowBindings };
    }
};

ko.bindingHandlers.showOnBind = {
    init: function (elm, valueAccessor) {
        var val = valueAccessor();
        if (val === true) {
            var jqElm = jQuery(elm);
            if (jqElm.hasClass("hidden")) {
                jqElm.removeClass("hidden");
            } else {
                jqElm.show();
            }
        }
    }
}

ko.bindingHandlers.delayShowOnBind = {
    init: function (elm, valueAccessor) {
        var val = valueAccessor();
        if (val > 0) {
            setTimeout(function () {
                var jqElm = jQuery(elm);
                if (jqElm.hasClass("hidden")) {
                    jqElm.removeClass("hidden");
                } else {
                    jqElm.show();
                }
            }, val);
        }
    }
}

ko.bindingHandlers.textCoalesce = {
    update: function (elm, valueAccessor) {
        var valArray = valueAccessor();

        if (typeof valArray != "array" && !(valArray instanceof Array)) {
            elm.innerText = valArray;
            return;
        }

        for (var i = 0; i < valArray.length; i++) {
            var val = valArray[i];
            if (val != null && val != undefined && val !== "") {
                elm.innerText = val;
                break;
            }
        }
    }
}

ko.bindingHandlers.log = {
    init: function (elm, valueAccessor) {
        var toLog;
        if (typeof valueAccessor == 'function') {
            toLog = valueAccessor();
        } else {
            toLog = valueAccessor;
        }
        console.log(toLog);
    }
}

ko.bindingHandlers.image = {
    update: function (elm, valueAccessor) {
        var jqElm = jQuery(elm);
        jqElm.attr("src", valueAccessor());
        scn.viewEngine.replaceImages(jqElm);
    }
}

ko.bindingHandlers.profileImage = {
    update: function (elm, valueAccessor) {
        var jqElm = jQuery(elm);
        
        var url = valueAccessor();
        if (url && url != "") {
            jqElm.attr("src", url);
            jqElm.error(function () {
                jqElm.attr("src", "logo-xbowling-small.png");
                scn.viewEngine.replaceImages(jqElm);
            });
        } else {
            jqElm.attr("src", "logo-xbowling-small.png");
            scn.viewEngine.replaceImages(jqElm);
        }
    }
}

ko.bindingHandlers.slideVisible = {
    init: function (element) {
        var jqElm = jQuery(element);
        if (!jqElm.attr("data-slidevisible-current")) {
            var sibs = jqElm.siblings();
            sibs.attr("data-slidevisible-current", false);
            jqElm.attr("data-slidevisible-current", true);

            var parent = jqElm.parent();
            parent.parent().css("overflow", "hidden");
            parent.css("position", "absolute")
                  .css("top", "0")
                  .css("left", "0");
            parent.width(jqElm.width() * (sibs.length + 1));
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $element = jQuery(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = $element.attr("data-slidevisible-current") === "true";

        var directionFunc = allBindingsAccessor().slideVisibleDirection;
        var direction;
        if (directionFunc) {
            if (typeof directionFunc == 'function') {
                direction = directionFunc.call(viewModel, $element);
            } else {
                direction = directionFunc;
            }
        }

        var $parent = $element.parent();
        if (value && !isCurrentlyVisible) {
            //$parent.attr("style", "-webkit-animation-fill-mode: both; animation-fill-mode: both; -webkit-animation-duration: 1s; animation-duration: 1s; transition: all 0.3s linear; transform: translateX(-" + $element.width() + "px);");
            //$element.removeClass("remove");
            $element.removeClass("hidden remove");

            if (direction) {
                setTimeout(function () {
                    var width;
                    var parentLeft = $parent.css("left");
                    parentLeft = parseInt(parentLeft.substring(0, parentLeft.length - 2));
                    
                    if (direction === "left") {
                        width = parentLeft - $element.outerWidth();
                    } else if (direction === "right") {
                        width = parentLeft + $element.outerWidth();
                    }

                    $parent.animate({ left: width + "px" }, null, null, function () {
                        $element.siblings().attr("data-slidevisible-current", "false");
                        $element.attr("data-slidevisible-current", "true");
                    });
                }, 0);
            }
            //element.style.display = "";
        } else if ((!value) && isCurrentlyVisible) {
            // $parent.addClass("animated slide-left");
            //$element.addClass("remove");
            //element.style.display = "none";

            //setTimeout(function () {
            //    $element.hide();
            //    $element.siblings(".drill-down-section").removeClass("slide-left slide-right");
            //}, 300);
        } 
    }
};

scn.scnKoTemplateEngine = function () { }
scn.scnKoTemplateEngine.prototype = new ko.nativeTemplateEngine();
scn.scnKoTemplateEngine.prototype['makeTemplateSource'] = function (template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem) {
            // look for custom SCN template
            if (window.templates[template]) {
                elem = document.createElement("script");
                elem.type = "text/html";
                elem.innerHTML = window.templates[template];
                templateDocument.body.appendChild(elem);
            } else {
                throw new Error("Cannot find template with ID " + template);
            }
        }
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

scn.scnKoTemplateEngine.instance = new scn.scnKoTemplateEngine();
ko.setTemplateEngine(scn.scnKoTemplateEngine.instance);