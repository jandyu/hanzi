
angular.module('KTPushMessage', ['ngResource'])
    .factory("pushAction",function($resource){
        var url = srvRESTfulAPI.config.urlBase;
        return $resource(url + '/auth/:action',
            {action: '@action'},
            {
                doAction:{method:'POST',isArray:false},
                getCommunities:{method:'POST',isArray:true}
            }
        );
    })
    .factory("pushHelper", function ($q,pushAction) {
        var helper = {
            onDeviceReady: function () {
                console.log("JPushPlugin:Device ready!");
                try {
                    //event
                    document.addEventListener("jpush.setTagsWithAlias", helper.onTagsWithAlias, false);
                    document.addEventListener("jpush.openNotification", helper.onOpenNotification, false);
                    document.addEventListener("jpush.receiveNotification", helper.onReceiveNotification, false);
                    document.addEventListener("jpush.receiveMessage", helper.onReceiveMessage, false);

                    window.plugins.jPushPlugin.init();

                    helper.getRegistrationID();

                    if (window.device.platform != "Android") {
                        window.plugins.jPushPlugin.setDebugModeFromIos();
                        window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                    } else {
                        window.plugins.jPushPlugin.setDebugMode(true);
                        window.plugins.jPushPlugin.setStatisticsOpen(true);
                    }
                } catch (exception) {
                    console.log(exception);
                }
            },
            setTagsWithAlias:function(tags,alias){
                try {
                    window.plugins.jPushPlugin.setTagsWithAlias(tags, alias);
                }
                catch (exception) {
                    console.log(exception);
                }
            },
            getRegistrationID: function () {
                window.plugins.jPushPlugin.getRegistrationID(helper.onGetRegistrationID);
            },

            onGetRegistrationID: function (data) {
                try {
                    console.log("JPushPlugin:registrationID is " + data);

                    if (data.length == 0) {
                        var t1 = window.setTimeout(helper.getRegistrationID, 2000);
                    }
                    console.info("jpush registerId:",data);
                } catch (exception) {
                    console.log(exception);
                }
            },

            onTagsWithAlias: function (event) {
                try {
                    console.log("onTagsWithAlias");
                    var result = "result code:" + event.resultCode + " ";
                    result += "tags:" + event.tags + " ";
                    result += "alias:" + event.alias + " ";
                    console.log(result);
                } catch (exception) {
                    console.log(exception)
                }
            },

            /**
             * 点击通知进入应用程序
             * @param event
             */
            onOpenNotification: function (event) {
                try {
                    var alertContent;
                    if (device.platform == "Android") {
                        alertContent = event.alert;
                    } else {
                        alertContent = event.aps.alert;
                    }
                    alert("open Notification:" + JSON.stringify(event));
                } catch (exception) {
                    console.log("JPushPlugin:onOpenNotification" + exception);
                }
            },

            /**
             * 收到通知
             * @param event
             */
            onReceiveNotification: function (event) {
                try {
                    var alertContent;
                    if (device.platform == "Android") {
                        alertContent = event.alert;
                    } else {
                        alertContent = event.aps.alert;
                    }
                    $("#notificationResult").html(alertContent);
                } catch (exception) {
                    console.log(exception)
                }
            },

            /**
             * 收到自定义消息
             * @param event
             */
            onReceiveMessage: function (event) {
                try {
                    var message;
                    if (device.platform == "Android") {
                        message = event.message;
                    } else {
                        message = event.content;
                    }
                    $("#messageResult").html(message);
                } catch (exception) {
                    console.log("JPushPlugin:onReceiveMessage-->" + exception);
                }
            }
        };
        return helper;
    })
;