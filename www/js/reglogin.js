/**
 * Created by jrain on 16/8/3.
 */

angular.module('KTUserRegLogin', ['ngResource'])
    .factory("loginAction",function(srvRESTfulAPI,$resource){
        var url = srvRESTfulAPI.config.urlBase;
        return $resource(url + '/auth/:action',
            { action: '@action'},
            {doAction:{method:'POST',isArray:false},
            getCommunities:{method:'POST',isArray:true}}
        );
    })
    .factory("loginHelper", function ($q,loginAction) {
        return {
            getPkgName: function () {
                console.info('getpkgname');
                var defer = $q.defer();
                if(!window.cordova) {
                    defer.resolve("com.yidongwuye.sqtest");
                }
                else{
                    $q.all([
                            window.cordova.getAppVersion.getVersionNumber(),
                            window.cordova.getAppVersion.getPackageName()])
                        .then(function (info) {
                            defer.resolve(info[1]);
                        });
                }
                return defer.promise;
            },
            getDeviceId:function(){
                if(window.device){
                    return window.device.uuid;
                }
                else{
                    return 'emulator_device';
                }
            },

            forgotPwd:function(account,pwd){

            },
            /**
             * account,password login
             * @param account
             * @param passwd
             * @param dev
             * @param app
             */
            loginWithAccount:function(account,passwd,dev,app){
                var defer = $q.defer();
                var payload = _.isObject(account)?account:{account:account,pwd:passwd,dev:dev,app:app};
                loginAction.doAction({action:'login'},payload).$promise
                    .then(function(res){
                        if(res.ok==1) {
                            //
                            //todo: save token in session
                            console.info("save token");
                            defer.resolve(res);
                        }
                        else{
                            defer.reject(res.message);
                        }
                    })
                    .catch(function(err){
                        console.info(err);
                        if(err && err.status == 0){
                            defer.reject("网路故障,请检查");
                        }
                        else {
                            defer.reject(err.message);
                        }
                    })
                return defer.promise;
            },
            /**
             * device autologin
             * @param dev
             * @param app
             */
            loginWithDevice:function(dev,app){
                var defer = $q.defer();
                var payload = _.isObject(dev)?dev:{device:dev,app:app};
                loginAction.doAction({action:'devlogin'},payload).$promise
                    .then(function(token){
                        if(token.ok==1){
                            //todo: save token in session
                            console.info("save token");
                            defer.resolve(token);
                        }
                        else{
                            defer.reject(token.message);
                        }
                    })
                    .catch(function(err){
                        console.info(err);
                        if(err && err.status == 0){
                            defer.reject("网路故障,请检查");
                        }
                        else {
                            defer.reject(err.message);
                        }
                    });
                return defer.promise;
            },
            /**
             * register new account
             * @param account  object or login account
             * @param pwd
             * @param app
             * @param com
             * @param dev
             * @returns {*}
             */
            registerNew:function(account, pwd, app,com, dev){
                var defer = $q.defer();
                var payload = _.isObject(account)?account:{account: account, pwd: pwd, app: app ,com:com , dev:dev};
                loginAction.doAction({action:'register'},payload).$promise
                    .then(function(res){
                        if(res.ok==1) {
                            //register ok
                            console.info("register ok:",res.insertedId);
                            defer.resolve(res);
                        }
                        else{
                            defer.reject(res.message);
                        }
                    })
                    .catch(function(err){
                        console.info(err);
                        if(err && err.status == 0){
                            defer.reject( "网路故障,请检查");
                        }
                        else {
                            defer.reject(err);
                        }
                    })
                return defer.promise;
            },

            smsCheckCode:function(phone,num){
                var defer = $q.defer();
                var payload = _.isUndefined(num)?{phone:phone,mode:'get'}:{phone:phone,num:num,mode:'check'};
                loginAction.doAction({action:'smscode'},payload).$promise
                    .then(function(res){
                        if(res.ok==1) {
                            //register ok
                            console.info("sms ok:",res.code);
                            defer.resolve(res);
                        }
                        else{
                            defer.reject(res.message);
                        }
                    })
                    .catch(function(err){
                        console.info(err);
                        if(err && err.status == 0){
                            defer.reject( "网路故障,请检查");
                        }
                        else {
                            defer.reject(err);
                        }
                    });
                return defer.promise;
            }
        }
    })
    .controller('KTUserRegister',function ($scope,$ionicHistory,$state,$timeout,loginAction,loginHelper){
        $scope.model = {
            info:'',
            user: {account: '', pwd: '', pwd1: '', app: '' ,com:'' , dev:'',verify:''}
        };
        loginHelper.getPkgName().then(function(pkgName){
            $scope.model.user.app = pkgName;
            $scope.model.user.dev  = loginHelper.getDeviceId();

            loginAction.getCommunities({action:'getCommunities'},{app:pkgName},function(res){
                $scope.model.communities = res;

                $timeout(function(){
                    $scope.model.user.com = res[0].id;
                },0);

            });
        });

        $scope.register = function(user){
            $scope.model.info = "";

            if(user.pwd != user.pwd1){$scope.model.info = "密码不匹配.";return ;}
            if(user.account.length != 11 ){$scope.model.info = "账号无效,请输入手机号码作为登录账号.";return ;}


            loginHelper.smsCheckCode(user.account,user.verify)
                .then(function() {
                    return loginHelper.registerNew(user);
                })
                .then(function(res){
                    loginHelper.loginWithDevice(user.dev,user.app).then(function(token){
                        //todo: login in community user
                        console.info("login community");
                        //goto main page
                        $state.go("app.tab");
                    });
                })
                .catch(function(err){
                    $scope.model.info = err;
                })
        }

        $scope.getCode = function(phone){
            $scope.model.info ='11';
            loginHelper.smsCheckCode(phone)
                .then(function(rtn){
                    console.info("----------check code-------");
                    console.info(rtn);
                    $scope.model.user.verify = rtn.code;
                })
                .catch(function(err){
                    $scope.model.info = err;
                })
        }
    })
    .controller('KTUserLogin', function ($scope,$state,loginAction,loginHelper) {
        $scope.model = {
            info:'',
            user: {account: '', pwd: '', app: '', dev: ''}
        };
        loginHelper.getPkgName().then(function(pkgName){
            $scope.model.user.app = pkgName;
            $scope.model.user.dev  = loginHelper.getDeviceId();

        });
        $scope.loginAction = function (user) {
            console.info(user);
            $scope.model.info ='';

            //if(user.account.length != 11 ){$scope.model.info = "账号无效,请输入手机号码作为登录账号.";return;}

            return loginHelper.loginWithAccount(user)
                .then(function (res) {
                    //todo: login in community user
                    console.info("login community");
                    //goto main page
                    $state.go("app.tab");
                })
                .catch(function (err) {
                    $scope.model.info = err;
                })
        }

    })
    .controller('KTUserForgot',function($scope,$state,loginHelper){
        $scope.model = {
            info:'',
            user: {account: '', pwd: '', pwd1: '', verify: ''}
        };

        $scope.forgot = function(user){
            $scope.model.info = "";
            if($scope.model.pwd != $scope.model.pwd1){
                $scope.model.info = "密码不匹配.";
                return ;
            }
            loginHelper.forgotPwd()
                .then(function(res){
                })
                .catch(function(err){

                })
        }

        $scope.getCode = function(phone){
            $scope.model.info ='11';
            loginHelper.smsCheckCode(phone)
                .then(function(rtn){
                    console.info("----------check code-------");
                    console.info(rtn);
                    $scope.model.user.verify = rtn.code;
                })
                .catch(function(err){
                    $scope.model.info = err;
                })
        }
    })
;