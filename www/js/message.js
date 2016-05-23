/**
 * Created by jrain on 16/5/18.
 */


angular.module('message', ['ngResource'])


    .factory("srvRESTfulAPI", function ($resource) {
        var defaultOption = {
            dbName: "pilatus",
            collectionName: "",
            modelName: "",
            //urlBase: "http://localhost:3001"
            //urlBase: "http://192.168.1.55:3001"
            urlBase: "https://gce.accordantcare.com:3001"
            // urlBase: "https://www.pilatushealth.com:3001"

        }
        var modelObj = {
            /**
             * create model,which extend $resource RESTful obj.
             *@param opt {object} the option , like  {collectionName:"Users",modelName:"user"}
             *@param met {object} the method ,extend $resource's action
             *
             */
            createModel: function (opt, met, ext) {
                var me = this;
                var dest = {};
                var option = angular.extend({}, defaultOption, opt);
                console.info(option);
                console.info(opt);
                option.dburl = option.urlBase + '/db/:db/:collection/:id',
                    option.methodurl = option.urlBase + "/" + option.modelName;

                var method = {};
                angular.forEach(met, function (item, key) {
                    if (angular.isDefined(item.url)) {
                        method[key] = angular.extend(item, {url: option.methodurl + item.url});
                    } else {
                        method[key] = item;
                    }
                });

                var rtnobj = angular.extend({}, angular.extend($resource(option.methodurl, {},
                    angular.extend({}, method)
                    ),
                    {
                        db: $resource(option.dburl,
                            {db: option.dbName, collection: option.collectionName, id: "@id"},
                            {
                                put: {method: "put", isArray: false}
                            }
                        )
                    })
                );
                if (ext) {
                    return angular.extend(rtnobj, ext);
                }
                else {
                    return rtnobj;
                }
            },
            config: defaultOption
        };
        return modelObj;
    })

    .factory("MessageFunc", function (srvRESTfulAPI, Session) {
        var MessageList = [
            {
                from: {_id: "1", fullname: "测试员1", photo: '../img/ionic.png', type: 'person'},   //person
                to: {_id: "4", fullname: "测试组1", photo: '../img/ionic.png', type: 'group'},       //group
                timestamp: 1463639933022,
                content: '欢迎加入我们6',
                type:"text"
            },
            {
                from: {_id: "1", fullname: "测试员1", photo: '../img/ionic.png', type: 'person'},   //person
                to: {_id: "5", fullname: "测试组1", photo: '../img/ionic.png', type: 'group'},       //group
                timestamp: 1463639933022,
                content: '欢迎[微笑]加入[微笑]我们[微笑][微笑][微笑][微笑][微笑][微笑][微笑][微笑][微笑][微笑][微笑]6',
                type:"text"
            },
            {
                from: {_id: "1", fullname: "测试员1", photo: '../img/ionic.png', type: 'person'},   //person
                to: {_id: "5", fullname: "测试组2", photo: '../img/ionic.png', type: 'group'},       //group
                timestamp: 1463639933022,
                content: './img/80893828.jpg',
                type:"img"
            },
            {
                from: {_id: "1", fullname: "测试员1", photo: '../img/ionic.png'},       //person
                to: {_id: "2", fullname: "测试员2", photo: '../img/ionic.png'},          //person
                timestamp: 1463639933022,
                content: '欢迎加入我们4',
                type:"text"
            },
            {
                from: {_id: "1", fullname: "测试员1", photo: '../img/ionic.png'},       //person
                to: {_id: "3", fullname: "测试员3", photo: '../img/ionic.png'},          //person
                timestamp: 1463639933022,
                content: '欢迎加入我们3',
                type:"text"
            },
            {
                from: {_id: "2", fullname: "测试员1", photo: '../img/ionic.png'},       //person
                to: {_id: "1", fullname: "测试员2", photo: '../img/ionic.png'},          //person
                timestamp: 1463639933022,
                content: '欢迎加入我们2',
                type:"text"
            },
            {
                from: {_id: "3", fullname: "测试员1", photo: '../img/ionic.png'},       //person
                to: {_id: "1", fullname: "测试员3", photo: '../img/ionic.png'},          //person
                timestamp: 1463639933022,
                content: '欢迎加入我们1',
                type:"text"
            }

        ];


        var ChatList = [
            {uid:"2",user: {_id: "1", fullname: "测试员1", photo: "../img/ionic.png", type: 'person'}, lastwords: '欢迎加入我们1'},
            {uid:"1",user: {_id: "2", fullname: "测试员2", photo: "../img/ionic.png", type: 'person'}, lastwords: '欢迎加入我们2'},
            {uid:"1",user: {_id: "3", fullname: "测试员3", photo: "../img/ionic.png", type: 'person'}, lastwords: '欢迎加入我们3'},
            {uid:"1",user: {_id: "4", fullname: "测试组1", photo: "../img/ionic.png", type: 'group'}, lastwords: '欢迎加入4'},
            {uid:"1",user: {_id: "5", fullname: "测试组2", photo: "../img/ionic.png", type: 'group'}, lastwords: '欢迎加入4'}
        ]

        var msgObj = {
            ShowEmotionIcon:function(source) {
                var emotion = {
                    "微笑" :"face qqface0",
                    "撇嘴" :"face qqface1",
                    "色" :"face qqface2",
                    "发呆" :"face qqface3",
                    "得意" :"face qqface4",
                    "流泪" :"face qqface5",
                    "害羞" :"face qqface6",
                    "闭嘴" :"face qqface7",
                    "睡" :"face qqface8",
                    "大哭" :"face qqface9",
                    "尴尬" :"face qqface10",
                    "发怒" :"face qqface11",
                    "调皮" :"face qqface12",
                    "呲牙" :"face qqface13",
                    "惊讶" :"face qqface14",
                    "难过" :"face qqface15",
                    "酷" :"face qqface16",
                    "冷汗" :"face qqface17",
                    "抓狂" :"face qqface18",
                    "吐" :"face qqface19",
                    "偷笑" :"face qqface20",
                    "愉快" :"face qqface21",
                    "白眼" :"face qqface22",
                    "傲慢" :"face qqface23",
                    "饥饿" :"face qqface24",
                    "困" :"face qqface25",
                    "惊恐" :"face qqface26",
                    "流汗" :"face qqface27",
                    "憨笑" :"face qqface28",
                    "悠闲" :"face qqface29",
                    "奋斗" :"face qqface30",
                    "咒骂" :"face qqface31",
                    "疑问" :"face qqface32",
                    "嘘" :"face qqface33",
                    "晕" :"face qqface34",
                    "疯了" :"face qqface35",
                    "衰" :"face qqface36",
                    "骷髅" :"face qqface37",
                    "敲打" :"face qqface38",
                    "再见" :"face qqface39",
                    "擦汗" :"face qqface40",
                    "抠鼻" :"face qqface41",
                    "鼓掌" :"face qqface42",
                    "糗大了" :"face qqface43",
                    "坏笑" :"face qqface44",
                    "左哼哼" :"face qqface45",
                    "右哼哼" :"face qqface46",
                    "哈欠" :"face qqface47",
                    "鄙视" :"face qqface48",
                    "委屈" :"face qqface49",
                    "快哭了" :"face qqface50",
                    "阴险" :"face qqface51",
                    "亲亲" :"face qqface52",
                    "吓" :"face qqface53",
                    "可怜" :"face qqface54",
                    "菜刀" :"face qqface55",
                    "西瓜" :"face qqface56",
                    "啤酒" :"face qqface57",
                    "篮球" :"face qqface58",
                    "乒乓" :"face qqface59",
                    "咖啡" :"face qqface60",
                    "饭" :"face qqface61",
                    "猪头" :"face qqface62",
                    "玫瑰" :"face qqface63",
                    "凋谢" :"face qqface64",
                    "嘴唇" :"face qqface65",
                    "爱心" :"face qqface66",
                    "心碎" :"face qqface67",
                    "蛋糕" :"face qqface68",
                    "闪电" :"face qqface69",
                    "炸弹" :"face qqface70",
                    "刀" :"face qqface71",
                    "足球" :"face qqface72",
                    "瓢虫" :"face qqface73",
                    "便便" :"face qqface74",
                    "月亮" :"face qqface75",
                    "太阳" :"face qqface76",
                    "礼物" :"face qqface77",
                    "拥抱" :"face qqface78",
                    "强" :"face qqface79",
                    "弱" :"face qqface80",
                    "握手" :"face qqface81",
                    "胜利" :"face qqface82",
                    "抱拳" :"face qqface83",
                    "勾引" :"face qqface84",
                    "拳头" :"face qqface85",
                    "差劲" :"face qqface86",
                    "爱你" :"face qqface87",
                    "NO" :"face qqface88",
                    "OK" :"face qqface89",
                    "爱情" :"face qqface90",
                    "飞吻" :"face qqface91",
                    "跳跳" :"face qqface92",
                    "发抖" :"face qqface93",
                    "怄火" :"face qqface94",
                    "转圈" :"face qqface95",
                    "磕头" :"face qqface96",
                    "回头" :"face qqface97",
                    "跳绳" :"face qqface98",
                    "投降" :"face qqface99",
                    "激动" :"face qqface100",
                    "乱舞" :"face qqface101",
                    "献吻" :"face qqface102",
                    "左太极" :"face qqface103",
                    "右太极" :"face qqface104"

            };
                var rtn = source;
                _.each(emotion,function(value,key){
                    var r = new RegExp("\\["+key+"\\]","g");
                    var h = '<a title="'+key+'" type="qq" class="'+value+'">'+key+'</a>';
                    rtn = rtn.replace(r,h);
                });
                return rtn;
            },
            SendMsg: function (who, to, msg,t) {
                return new Promise(function (reslove, reject) {
                    //save msg
                    MessageList.push({from: who, to: to, content: msg, timestamp: (new Date()).valueOf(),type:t});
                    var rtn = {ok: 1};

                    reslove(rtn);
                });
            },

            GetChats: function (who) {
                return new Promise(function (reslove, reject) {
                    //get chat list
                    var lst = _.filter(ChatList,function(item){return item.uid==who._id;})
                    reslove(lst);
                });
            },
            RetrieveMsg: function (who, from, currstamp, lateststamp) {

                return new Promise(function (reslove, reject) {
                    // from currstamp to lateststamp message
                    var messages = [];


                    if (from.type == "group") {
                        var lst = _.filter(MessageList,function(item){
                           return item.to._id == from._id && item.timestamp > currstamp;
                        });

                        messages = messages.concat(lst);
                    }
                    else {
                        var lst = _.filter(MessageList,function(item){
                            return (item.from._id == who._id && item.to._id == from._id && item.timestamp > currstamp)
                                || (item.from._id == from._id && item.to._id == who._id && item.timestamp > currstamp)
                        });

                        messages = messages.concat(lst);
                    }
                    //set isFromMe,max stamp
                    var stamp = currstamp;
                    _.each(messages, function (item) {
                        item.isFromMe = (item.from._id == who._id);
                        stamp = (stamp>item.timestamp)?stamp:item.timestamp;
                    });

                    reslove({ok:1,list:messages,stamp:stamp});
                })
            }
        }

        return msgObj;
    })
    .factory("Session", function () {
        var sessiondata = {
            user: {_id: '1', fullname: '测试员1', photo: "../img/ionic.png",type:'person'},
            role: "member",
            token: "",
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

;


