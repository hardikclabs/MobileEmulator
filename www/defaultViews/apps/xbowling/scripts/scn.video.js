(function (video) {
    defaultOptions = function () {
        this.fullScreen = false;
        this.appendTo = null;
        this.onEnded = null;
        this.endOnTap = false;
    },

    video.play = function (src, options) {
        options = jQuery.extend(new defaultOptions(), options);

        var isAppleDevice = scn.isAppleDevice();

        // ANDROID VIDEO NOT WORKING ACROSS ALL DEVICES -- SKIP IT
        if (!isAppleDevice) {
            if (options.onEnded && typeof (options.onEnded) == "function") {
                options.onEnded.apply(this);
            }
            return;
        }

        var videoId = "scnvideo" + options.videoId;
        var video = jQuery("<video />");
        video.attr("autoplay", "autoplay");
        video.attr("webkit-playsinline", "webkit-playsinline");
        video.attr("id", videoId);

        if (options.fullScreen) {
            video.width(scn.viewEngine.windowWidth);
            video.height(scn.viewEngine.windowHeight);
        }
        
        if (isAppleDevice) {
            var videoSource = jQuery("<source />");
            videoSource.attr("src", "videos/" + src);
            videoSource.attr("type", "video/mp4");
            video.append(videoSource);
        }

        if (!options.appendTo) {
            video.insertBefore("#wrapper");
        } else {
            options.appendTo.append(video);
        }

        if (isAppleDevice) {
            video.on("ended", function (e) {
                jQuery(this).detach();
                if (options.onEnded && typeof (options.onEnded) == "function") {
                    options.onEnded.apply(this);
                }
            });

            if (options.endOnTap) {
                video.on("click", function (e) {
                    jQuery(this).detach();
                    if (options.onEnded && typeof (options.onEnded) == "function") {
                        options.onEnded.apply(this);
                    }
                });
            }
        } else {
            var hasFinished = false;

            var initData = {};
            initData[videoId] = src;
            window.plugins.html5Video.initialize(initData);

            window.plugins.html5Video.play(videoId, function () {
                if (!hasFinished) {
                    hasFinished = true;
                    video.detach();
                    if (options.onEnded && typeof (options.onEnded) == "function") {
                        options.onEnded.apply(video);
                    }
                }
            });

            if (options.timeout > 0) {
                setTimeout(function () {
                    if (!hasFinished) {
                        hasFinished = true;
                        video.detach();
                        if (options.onEnded && typeof (options.onEnded) == "function") {
                            options.onEnded.apply(video);
                        }
                    }
                }, options.timeout);
            }
        }
    }

}(window.scn.video = window.scn.video || {}));
