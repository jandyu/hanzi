// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','nativePlugins','KTmessage'])

    .filter('to_emotion', function ($sce,MessageFunc) {
        return function (text) {
            var txt = MessageFunc.ShowEmotionIcon(text);
            return $sce.trustAsHtml(txt);
        }
    })
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();

            }
        });
    })

    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider) {
        $ionicConfigProvider.platform.android.tabs.style("standard");
        $ionicConfigProvider.platform.android.tabs.position("standard");


        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            .state('app.tab', {
                url: '/tab',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tab.html',
                        controller:"maintab"
                    }
                }
            })

            .state('app.playlists', {
                url: '/playlists/:playlistId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/playlist.html',
                        controller: 'PlaylistCtrl'
                    }
                }
            })
            .state('app.message', {
                url: '/message',
                cache:false,
                params:{user:{}},
                views: {
                    'menuContent': {
                        templateUrl: 'templates/message/message.html',
                        controller: 'MessageCtrl'
                    }
                }
            })
            .state('app.forum', {
                url: '/forum/:mid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/message/topic.html',
                        controller: 'ForumTopicCtrl'
                    }
                }
            })
        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/tab');
    });
