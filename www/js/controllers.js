angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {


    })

    .controller('maintab', function ($scope, $ionicTabsDelegate, $ionicNavBarDelegate) {
        $scope.tab = {currtitle: '首页', buttons: '首页'};

        $scope.clicktab = function (u) {
            //$ionicNavBarDelegate.title($ionicTabsDelegate._instances[0].tabs[u].title);
            $scope.tab.currtitle = $ionicTabsDelegate._instances[0].tabs[u].title;
            $ionicTabsDelegate.select(u);
            return true;
        }
    })
    .controller('PlaylistCtrl', function ($scope, $stateParams) {

        $scope.playlists = [
            {title: 'Reggae', id: 1},
            {title: 'Chill', id: 2},
            {title: 'Dubstep', id: 3},
            {title: 'Indie', id: 4},
            {title: 'Rap', id: 5},
            {title: 'Cowbell', id: 6}
        ];
    })

    .controller('MsglistCtrl', function ($state,$scope, $stateParams,MessageFunc,Session) {
        MessageFunc.GetChats(Session.user).then(function(res){
             $scope.chats = res;
        });
        $scope.message = function(user){
            $state.go("app.message",{user:user});
        }
    })

    .controller('MessageCtrl', function ($scope, $stateParams, $ionicScrollDelegate, $timeout, NativePlugin,MessageFunc,Session) {
        $scope.user = $stateParams["user"];
        $scope.chat = [];


        $scope.currstamp = 0;
        $scope.loadMore = function (currstamp) {
            $scope.$broadcast('scroll.refreshComplete');
            console.info(currstamp);

            MessageFunc.RetrieveMsg(Session.user,$scope.user,currstamp,0).then(function(res){
                $scope.chat = $scope.chat.concat(res.list);
                $scope.currstamp = res.stamp;

            });

            console.info($scope.currstamp);
            $timeout(function () {
                    $ionicScrollDelegate.$getByHandle("messageDetailsScroll").scrollBottom(true);
            }, 1);
        }


        $scope.takephoto = function () {
            console.info("take photo");
            $scope.sendmsg.emotion=false;
            NativePlugin.GetPicture(function (pic) {

                    $scope.user.photo = NativePlugin.PictureModel.image_url;
                    $scope.$apply();
                    //upload pic
                    NativePlugin.FileTrans(NativePlugin.PictureModel.image_url, function (rtn) {
                            //save user photo
                            console.info(rtn);
                            var f = rtn.response;
                            User.photoset({headPhoto: f, userid: Session.user._id}, function (res) {
                                if (res.ok == 1) {
                                    Session.user.photo = rtn;
                                    $scope.user.photo = rtn;
                                    $scope.$apply();
                                }
                            });
                        },
                        function (rtn) {
                            //save fail
                            console.info(rtn);
                        });
                },
                function (rtn) {
                    //take photo fail
                    console.log(JSON.stringify(rtn));
                }, {});
        }


        $scope.savemsg = function(msg){
            $scope.sendmsg.emotion=false;
            MessageFunc.SendMsg(Session.user,$scope.user,msg,"text").then(function(res){
                $scope.loadMore($scope.currstamp);
            });
            $scope.sendmsg.content ="";


        }

        $scope.emotions = MessageFunc.ShowEmotionIcon("list");
        $scope.showEmotion = function(){
            console.info($scope.emotions);
            $scope.sendmsg.emotion = true;
        }
        $scope.sendmsg = {emotion:false,content:""};

        $scope.appendemo = function(emo){
            $scope.sendmsg.content = $scope.sendmsg.content + "["+emo+"]";
            $scope.sendmsg.emotion = false;
        }

        $scope.loadMore($scope.currstamp);
    })
    .controller('SelfCtrl', function ($scope, $stateParams) {

    })

    .controller('forumCtrl', function ($scope, $stateParams) {
        $scope.topics = [
            {id: 0, title: '全部', contentid: 'all'},
            {id: 1, title: '邻里圈', contentid: 'topicone'},
            {id: 2, title: '买买买', contentid: 'topictwo'}
        ];
        $scope.model = {currtopic: 1};
        $scope.forumtopic = function (idx) {
            console.info(idx);
            $scope.model.currtopic = idx;
            console.info($scope.model.currtopic);
        }
    })
    .controller('ForumTopicCtrl', function ($scope, $stateParams, $ionicScrollDelegate, $timeout, NativePlugin) {

        $scope.chats = [
            {user: {_id: "", fullname: "测试员", photo: "../img/ionic.png"}, lastwords: '评论文字'},
            {user: {_id: "", fullname: "测试员", photo: "../img/ionic.png"}, lastwords: '评论文字'},
            {user: {_id: "", fullname: "测试员", photo: "../img/ionic.png"}, lastwords: '评论文字'},
            {user: {_id: "", fullname: "测试员", photo: "../img/ionic.png"}, lastwords: '评论文字'}
        ];
        $scope.democnt = 1;
        $scope.chat = [];
        $scope.user = {fullname: "测试人员"};


        $scope.takephoto = function () {
            console.info("take photo");
            NativePlugin.GetPicture(function (pic) {

                    $scope.user.photo = NativePlugin.PictureModel.image_url;
                    $scope.$apply();
                    //upload pic
                    NativePlugin.FileTrans(NativePlugin.PictureModel.image_url, function (rtn) {
                            //save user photo
                            console.info(rtn);
                            var f = rtn.response;
                            User.photoset({headPhoto: f, userid: Session.user._id}, function (res) {
                                if (res.ok == 1) {
                                    Session.user.photo = rtn;
                                    $scope.user.photo = rtn;
                                    $scope.$apply();
                                }
                            });
                        },
                        function (rtn) {
                            //save fail
                            console.info(rtn);
                        });
                },
                function (rtn) {
                    //take photo fail
                    console.log(JSON.stringify(rtn));
                }, {});
        }


        $scope.loadMore = function () {
            $timeout(function () {
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        }


        $scope.savemsg = function(msg){

            console.info("save");
            console.info(msg);

        }


    })


;
