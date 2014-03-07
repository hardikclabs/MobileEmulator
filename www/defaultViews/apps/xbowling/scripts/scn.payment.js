(function (payment) {
    payment.PAYMENT_TYPE = {
        ANDROID: 1,
        IOS: 2
    },

    payment.waiting = false,

    clearStateiOS = function () {
        window.plugins.inAppPurchaseManager.onFailed = null;
        window.plugins.inAppPurchaseManager.onPurchased = null;
        payment.waiting = false;
    },

    clearStateAndroid = function () {
        payment.waiting = false;
    },

    payment.purchase = function (productId, success, failure) {
        if (payment.waiting) {
            return;
        }

        payment.waiting = true;

        if (scn.device === 'iPhone'
            || scn.device === 'iPhone Simulator'
            || scn.device === 'iPad'
            || scn.device === 'iPod'
            || scn.device === 'iOS') {
            
            window.plugins.inAppPurchaseManager.onPurchased =
                function (transactionIdentifier, productId, transactionReceipt) {
                    scn.hideLoading();
                    console.log('success');

                    clearStateiOS();

                    success.call(null, {
                        type: payment.PAYMENT_TYPE.IOS,
                        transactionIdentifier: transactionIdentifier,
                        productId: productId, 
                        transactionReceipt: transactionReceipt
                    });
                };

            window.plugins.inAppPurchaseManager.onFailed = function (errorcode, errorTest) {
                scn.hideLoading();
                console.log('failure');

                clearStateiOS();

                // error code 2 = cancelled
                if (errorcode != 2) {
                    alert("An error occurred making the purchase.  Please try again later.", { title: "Uh oh!" });
                }

                if (failure) {
                    failure.call(null, errorcode, errorTest);
                }
            };

            scn.showLoading();
            window.plugins.inAppPurchaseManager.requestProductData(
                productId,
                function (result) {
                    console.log('success');
                    console.log("productId: " + result.id + " title: " + result.title + " description: " + result.description + " price: " + result.price);
                    window.plugins.inAppPurchaseManager.makePurchase(result.id, 1);
                },
                function (id) {
                    scn.hideLoading();
                    clearStateiOS();

                    console.log("Invalid product id: " + id);
                    alert("An error occurred getting credit information.  Your credit card was not charged.  Please try again later.");
                }
        );

        } else if (scn.device === 'Android') {
            clearStateAndroid();

            inappbilling.init(
                function (result) {
                    inappbilling.purchase(
                        function (data) {
                            var jsonData = JSON.parse(data);
                            if (!jsonData || !jsonData.productId || !jsonData.signedData || !jsonData.signature) {
                                alert("We are very sorry, but an error occurred verifying your purchase.  Please contact XBowling support (support@xbowling.com).", { title: "Uh oh!" });
                                clearStateAndroid();
                                return;
                            }

                            // send it to success callback
                            clearStateAndroid();
                            success.call(null, {
                                type: payment.PAYMENT_TYPE.ANDROID,
                                productId: jsonData.productId,
                                signedData: jsonData.signedData,
                                signature: jsonData.signature
                            });
                        },
                        function (error) {
                            // do not display error message for cancels
                            if (error != "canceled") {
                                alert("An error occurred making the purchase.  Please try again later.", { title: "Uh oh!" });
                            }

                            clearStateAndroid();
                            return;
                        },
                        productId);
                },
                function (error) {
                    alert("An error occurred making the purchase.  Please try again later.", { title: "Uh oh!" });
                    clearStateAndroid();
                    return;
                }
            );
        }
    }
}(window.scn.payment = window.scn.payment || {}));