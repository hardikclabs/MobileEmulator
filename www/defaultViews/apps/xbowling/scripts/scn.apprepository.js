(function (appRepository) {
    appRepository.loadApp = function (appId, onLoad) {
        scn.showLoading();
        jQuery.ajax({
            type: "GET",
            url: scn.mobileAddress + "app/" + appId,
            data: { },
            dataType: "json",
            success: function (data, status, jqXhr) {
                scn.hideLoading();
                onLoad(data);
            },
            error: scn.onAjaxFailed
        });
    }

}(window.scn.appRepository = window.scn.appRepository || {}));