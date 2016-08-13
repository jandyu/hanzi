/**
 * Created by jrain on 16/5/18.
 */

angular.module('KTmessage', ['ngResource'])
    .factory('sessionInjector', function (Session) {
        var sessionInjector = {
            request: function (config) {
                //if(/^templates\//.test(config.url)) {
                //  config.url = config.url + "?" + new Date().getTime();
                //}
                config.requestTimestamp = new Date().getTime();
                config.headers['authorization'] = Session.token;

                return config;
            },
            response: function(response) {
                response.config.responseTimestamp = new Date().getTime();
                if(response.status==401){
                    //todo unauthorized
                    console.info("Unauthorized");
                    console.info(response.data);
                }

                return response;
            }
        };
        return sessionInjector;
    })
    .factory("messageAction",function($resource){
        //var url = "http://msg.yidongwuye.cn";
        var url = "http://localhost:3000";
        return $resource(url + '/message/:action',
            { action: '@action'},
            {   doAction:{method:'POST',isArray:false},
                getChatList:{method:'POST',isArray:true},
                getChatContentList:{method:'POST',isArray:true},
                getLatestChatContent:{method:'POST',isArray:true}
            }
        );
    })
    .factory("messageHelper", function ($q,messageAction,$timeout) {

        var chatList=[];
        var chatContent={};

        var h = {
            getLocalChatInfo:function(){
                return {
                    chatList:chatList,
                    chatContent:chatContent
                }
            },
            ShowEmotionIcon: function (source) {
                var emotion = {
                    "微笑": "face qqface0",
                    "撇嘴": "face qqface1",
                    "色": "face qqface2",
                    "发呆": "face qqface3",
                    "得意": "face qqface4",
                    "流泪": "face qqface5",
                    "害羞": "face qqface6",
                    "闭嘴": "face qqface7",
                    "睡": "face qqface8",
                    "大哭": "face qqface9",
                    "尴尬": "face qqface10",
                    "发怒": "face qqface11",
                    "调皮": "face qqface12",
                    "呲牙": "face qqface13",
                    "惊讶": "face qqface14",
                    "难过": "face qqface15",
                    "酷": "face qqface16",
                    "冷汗": "face qqface17",
                    "抓狂": "face qqface18",
                    "吐": "face qqface19",
                    "偷笑": "face qqface20",
                    "愉快": "face qqface21",
                    "白眼": "face qqface22",
                    "傲慢": "face qqface23",
                    "饥饿": "face qqface24",
                    "困": "face qqface25",
                    "惊恐": "face qqface26",
                    "流汗": "face qqface27",
                    "憨笑": "face qqface28",
                    "悠闲": "face qqface29",
                    "奋斗": "face qqface30",
                    "咒骂": "face qqface31",
                    "疑问": "face qqface32",
                    "嘘": "face qqface33",
                    "晕": "face qqface34",
                    "疯了": "face qqface35",
                    "衰": "face qqface36",
                    "骷髅": "face qqface37",
                    "敲打": "face qqface38",
                    "再见": "face qqface39",
                    "擦汗": "face qqface40",
                    "抠鼻": "face qqface41",
                    "鼓掌": "face qqface42",
                    "糗大了": "face qqface43",
                    "坏笑": "face qqface44",
                    "左哼哼": "face qqface45",
                    "右哼哼": "face qqface46",
                    "哈欠": "face qqface47",
                    "鄙视": "face qqface48",
                    "委屈": "face qqface49",
                    "快哭了": "face qqface50",
                    "阴险": "face qqface51",
                    "亲亲": "face qqface52",
                    "吓": "face qqface53",
                    "可怜": "face qqface54",
                    "菜刀": "face qqface55",
                    "西瓜": "face qqface56",
                    "啤酒": "face qqface57",
                    "篮球": "face qqface58",
                    "乒乓": "face qqface59",
                    "咖啡": "face qqface60",
                    "饭": "face qqface61",
                    "猪头": "face qqface62",
                    "玫瑰": "face qqface63",
                    "凋谢": "face qqface64",
                    "嘴唇": "face qqface65",
                    "爱心": "face qqface66",
                    "心碎": "face qqface67",
                    "蛋糕": "face qqface68",
                    "闪电": "face qqface69",
                    "炸弹": "face qqface70",
                    "刀": "face qqface71",
                    "足球": "face qqface72",
                    "瓢虫": "face qqface73",
                    "便便": "face qqface74",
                    "月亮": "face qqface75",
                    "太阳": "face qqface76",
                    "礼物": "face qqface77",
                    "拥抱": "face qqface78",
                    "强": "face qqface79",
                    "弱": "face qqface80",
                    "握手": "face qqface81",
                    "胜利": "face qqface82",
                    "抱拳": "face qqface83",
                    "勾引": "face qqface84",
                    "拳头": "face qqface85",
                    "差劲": "face qqface86",
                    "爱你": "face qqface87",
                    "NO": "face qqface88",
                    "OK": "face qqface89",
                    "爱情": "face qqface90",
                    "飞吻": "face qqface91",
                    "跳跳": "face qqface92",
                    "发抖": "face qqface93",
                    "怄火": "face qqface94",
                    "转圈": "face qqface95",
                    "磕头": "face qqface96",
                    "回头": "face qqface97",
                    "跳绳": "face qqface98",
                    "投降": "face qqface99",
                    "激动": "face qqface100",
                    "乱舞": "face qqface101",
                    "献吻": "face qqface102",
                    "左太极": "face qqface103",
                    "右太极": "face qqface104"

                };
                if (source == "list") {
                    var ar = [];
                    _.each(emotion, function (val, key) {
                        ar.push({title: key, cls: val});
                    })
                    return ar;
                }
                var rtn = source;
                _.each(emotion, function (value, key) {
                    var r = new RegExp("\\[" + key + "\\]", "g");
                    var h = '<a title="' + key + '" type="qq" class="' + value + '">' + key + '</a>';
                    rtn = rtn.replace(r, h);
                });

                return rtn;
            },
            getChat:function(uid,chatId){
                return messageAction.doAction({action:"getchat"},{userId:uid,chatId:chatId}).$promise;
            },
            getChatList:function(uid){
                messageAction.getChatList({action:'getchatlist'},{uid:uid}).$promise
                    .then(function(rtn){
                            $timeout(function() {
                                console.info("----getchatlsit");
                                _.each(rtn,function(c){chatList.push(c)});

                            });
                    })
                    .catch(function(err){
                        //error
                        console.error(err);
                    });
            },
            getChatContentList:function(chatId,page,pageSize){
                return messageAction.getChatContentList({action:"getchatcontentlist"},
                    {chatId:chatId,page:page,pageSize:pageSize}).$promise
                    .then(function(rtn){
                        if(!_.has(chatContent,chatId)){
                            chatContent[chatId] = [];
                        }
                        //desc -> asc
                        rtn.reverse();
                        //insert to chatContentlist(before)
                        $timeout(function(){
                            chatContent[chatId] = rtn.concat(chatContent[chatId]);
                        })
                    })
                    .catch(function(err){
                        //error
                        console.error(err);
                    });
            },
            getLatestChatContent:function(chatId,latestTimeStamp){
                messageAction.getLatestChatContent({action:'getlatestchatcontent'},
                    {chatId:chatId,timeStamp:latestTimeStamp}).$promise
                    .then(function(clist){
                        if(clist.length>0) {
                            //append new chat
                            $timeout(function () {
                                chatContent[chatId] = chatContent[chatId].concat(clist);
                                //update chat stamp
                                var latestMsg = clist[clist.length -1];
                                var chat = chatList.filter(function(item){return item.chatId == chatId;});
                                if(_.isArray(chat) && chat.length ==1){
                                    chat.chat.latestStamp = latestMsg.timeStamp;
                                    chat.chat.lastWords = latestMsg.content;
                                }
                            });
                        }
                        else{
                            console.info("no more message.");
                        }

                    })
                    .cache();
            },
            newChat:function(myinfo,userList,chat){
                var aChat={
                    "title":"chat",
                    "type":"person",
                    "lastWords":"",
                    "latestStamp":0,
                    "photo":"",
                    "admin":"",
                    "relation":""
                };
                angular.extend(aChat,chat);
                messageAction.doAction({action:"newchat"},{userList:userList,message:aChat}).$promise
                    .then(function(rtn){
                        if(rtn.ok==1) {
                            var c = rtn.chat._id;
                            return h.getChat(myinfo.u, c);
                        }
                        else {
                            return $q.reject(rtn.message);
                        }
                    })
                    .then(function(chat){
                            $timeout(function() {
                                console.info("----new chat push to chatlist");
                                console.info(chatList);
                                console.info(chat);
                                chatList.push(chat);
                            });
                    })
                    .catch(function(err){
                        console.error(err);
                    })
            },
            newMessage:function(chatId,myinfo,type,content){
                //message :{"chatId":0, "from":{"u":0, "n":"", "p":""},"type":"text", "content":""}
                if(content.replace(/\s/g,"") =="") return;
                var msg ={"chatId":chatId, "from":myinfo,"type":type, content:content};

                messageAction.doAction({action:"newmessage"},{message:msg}).$promise
                    .then(function(res){
                        if(res.ok==1){
                            $timeout(function(){

                                chatContent[chatId].push(res.msg);
                                //update chatList stamp
                                var chat = chatList.filter(function(item){return item.chatId == chatId;});
                                if(_.isArray(chat) && chat.length ==1){
                                    chat.chat.latestStamp = res.msg.timeStamp;
                                    chat.chat.lastWords = content;
                                }
                            });
                        }
                    })
            },

            onReceiveMessage:function(msg) {
                //chating

                //not chat
                //get chat from msg, refresh the chat
            },

            onResumeApp:function(){
                //refresh chatList

                //chating
                // get chating content list

                //not chat


            }
        };
        return h;
    })
    .factory("Session", function () {
        var sessiondata = {
            user: {u: '123test', n: '测试员1', p: "../img/ionic.png"},
            role: "member",
            token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiJhY2NvdW50X3Rlc3QiLCJjb21tdW5pdHkiOiJjb21fa3d3eV9jaCIsInJvbGUiOiIiLCJ1c2VyIjoiMTIzIiwiYXBwIjoiY29tLnlpZG9uZ3d1eWUuc3EwMDAxIiwiaWF0IjoxNDcxMDUxODg0LCJleHAiOjE1MDI1ODc4ODR9.B9SNyQ8ZaSKjG8UQoktuCAjRRp0Aph68DVzh4L0t1l5evNHYTr5rH3GmSY8QDCuhTY8r-ljK0NsWSHEnhQA9x-HuIxNWRs8PsXrDjC0BNO1OVpreH4BdSU60pGSTa-uXsAiXJYvqPLm0RVwZ3hS_i0Jzae3nBKYsY2nQJtDzh2Q",
            pushtoken: "",
            config: {},
            deviceID: "",
            platform: "ios",
            main: {"coach": "ctab.home", "member": "tab.calendar"},
            reset: function () {
                this.user = {_id: '', fullname: '', photo: "/images/head.jpg", email: "", cellNumber: "", zipcode: ""},
                    this.role = "member";
                this.token = "";
            }
        };
        return sessiondata;
    })
    .controller('KTChatlist', function ($state,$scope, $stateParams,messageHelper,Session,$rootScope) {
    $scope.chats = $rootScope.MC.chatList;

    messageHelper.getChatList(Session.user.u);
    //messageHelper.newChat(Session.user,['123test','456test'],{title:"test chat 1",lastWords:"hello"});

    $scope.message = function(chatId){
        console.info(chatId);
        $state.go("app.message",{chat:chatId});
    }
    })
    .controller('KTChatMessageCtrl', function ($state,$scope,messageHelper,Session,$rootScope,$timeout,$ionicScrollDelegate) {

        $scope.chatId =$state.params.chatid;
        $scope.selfId = Session.user.u;
        $scope.sendmsg = {content:"",type:"text",emotion:false};

        messageHelper.getChatContentList($scope.chatId,1,20);

        $scope.chatContent = function(){
            return $rootScope.MC.chatContent[$scope.chatId];
        }

        $scope.takephoto = function(){

        }
        $scope.savemsg = function(msg){
            console.info(msg);
            messageHelper.newMessage($scope.chatId,Session.user,msg.type,msg.content);
            $scope.sendmsg = {content:"",type:"text",emotion:false};

            $timeout(function(){
                $ionicScrollDelegate.$getByHandle("messageDetailsScroll").scrollBottom(true);
            })
        }

        $scope.emotions = messageHelper.ShowEmotionIcon("list");

        $scope.showEmotion = function(){
            $scope.sendmsg.emotion = true;
        }


        $scope.appendemo = function(emo){
            $scope.sendmsg.content = $scope.sendmsg.content + "["+emo+"]";
            $scope.sendmsg.emotion = false;
        }

    })

;