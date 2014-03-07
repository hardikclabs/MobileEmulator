(function (sound) {
    sound.register = function (name) {
        createjs.Sound.registerSound(scn.mobileAddress + "/content/sounds/" + name + ".ogg", name);
    },

    sound.play = function (name) {
        createjs.Sound.play(name);
    }

}(window.scn.sound = window.scn.sound || {}));
