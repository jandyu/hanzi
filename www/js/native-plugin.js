/**
 * Created by jrain on 16/4/6.
 */

//angular.module('Native-Plugin', ['ngResource'])
angular.module('nativePlugins', ['ngResource'])

  .factory('NativePlugin', function ($resource,$ionicActionSheet,srvRESTfulAPI) {


    var Native_Plugin = {
      DeviceUUID: function () {
        device.info();
      },
      PushMessageDefualtOption: {
        android: {
          senderID: "348237944030"
        },
        ios: {
          alert: "true",
          badge: "false",
          sound: 'false'
        },
        windows: {}
      },
      PushMessageInactiveCallback: function (data) {
        console.log(data);
      },

      PushMessageInit: function (option, registerCallback, inactiveCallback, activeCallback) {
        var me = this;
        var options = angular.extend({}, me.PushMessageDefualtOption, option);
        //init push

        var push = PushNotification.init(options);

        push.on('registration', function (data) {

          registerCallback(data);
        });

        push.on('notification', function (data) {

          activeCallback(data);
        });

      },


      //{"card_number":"4111111111111111","card_type":"Visa","redacted_card_number":"4111 1111 1111 1111","expiry_month":11,"expiry_year":2018,"cvv":"123"}
      CardIORead: function (succ, errcallback) {
        if (window.cordova) {
          var onSuccCallback=function(rtn)
          {
            if(rtn==undefined){  //ios cardio cancel
              errcallback('cancel');
              return;
            };

            //android cario cancel
            if(rtn.card_number==undefined)
            {
              errcallback('cancel');
              return;
            };


            //cardio succ
            succ(rtn);
          };

          CardIO.scan({
              "expiry": true,
              "cvv": true,
              "zip": false,
              "suppressManual": false,
              "suppressConfirm": false,
              "hideLogo": true
            },
            onSuccCallback,
            errcallback
          );
        }
        else {
          succ({'info': 'no physical device.'});
        }
        //CardIO.canScan(callback3);
      },

      BrainTreeToken: "",
      BraintreeInit: function (callback) {
        var me = this;
        Payment.client_token(function (data) {
          console.info(data);
          if (data.ok == "1") {
            me.BrainTreeToken = data.token;
            if (callback != undefined && callback != null) {
              callback(data.token);
            }
          }
          else {
            me.BrainTreeToken = "";
          }
        }, function (rtn) {
        });
      },

      //{"card_number":"4111111111111111","card_type":"Visa","redacted_card_number":"4111 1111 1111 1111","expiry_month":11,"expiry_year":2018,"cvv":"123"}
      BraintreePay: function (cardinfo, payinfo, callback) {
        var me = this;
        //var options = angular.extend({},me.BrainTreeDefaultOption,option);

        //todo : sandbox test data in developer environment, in product environment should comment this line.
        // cardinfo = {
        //   "card_number": "4111111111111111",
        //   "expiry_month": 11,
        //   "expiry_year": 2018,
        //   "cvv": "123"
        // };
        // console.log('BraintreePay');
        // console.log('cardinfo', cardinfo);
        // console.log('payinfo', payinfo);
        // console.log('callback', callback);


        if (me.BrainTreeToken == "") {
          me.BraintreeInit(function (token) {
            me.braintreePostServer(token, cardinfo, payinfo, callback);
          })
        }
        else {
          me.braintreePostServer(me.BrainTreeToken, cardinfo, payinfo, callback);
        }
      },


      braintreePostServer: function (token, cardinfo, payinfo, callback) {
        // console.log('braintreePostServer');
        // console.log('token', token);
        // console.log('cardinfo', cardinfo);
        // console.log('payinfo', payinfo);
        // console.log('callback', callback);
        var client = new braintree.api.Client({clientToken: token});
        var expiry = cardinfo.expiry_month + '/' + cardinfo.expiry_year.toString().substr(2, 2);
        client.tokenizeCard({
          number: cardinfo.card_number,
          expirationDate: expiry
        }, function (err, nonce) {
          if(err) {
            console.log('braintreePostServer error', err);
            if(callback) {
              callback({ok:0,msg:err});
            }
            return;
          }

          //get braintree return nonce
          // console.log('braintreePostServer nonce', nonce);

          var payload = angular.extend(payinfo, {payment_method_nonce: nonce});
          //send transaciton
          Payment.checkout(payload, function (data) {
            //transaction return.
            console.log('payment result', data);
            if (callback != undefined && callback != null) {
              callback(data);
            }
          });
        });
      }
      ,
      //1 toke photo --------------------------------------------------------------------------------------------------------------
      PictureModel: {
        image_url: ''
      },
      PictureDefaultOption: {
        quality: 60,
        allowEdit: false,
        //saveToPhotoAlbum: false,
        targetWidth: 1920,
        targetHeight: 1920,
        mediaType: 0,
        destinationType: 1,//DATA_URL : 0,FILE_URI : 1,NATIVE_URI : 2
        sourceType: 0//PHOTOLIBRARY : 0,CAMERA : 1,SAVEDPHOTOALBUM : 2
      },

      GetPicture: function (succ, fail, option) {
        var me = this;

        var options = angular.extend({}, me.PictureDefaultOption, option);

        $ionicActionSheet.show({
          titleText: 'Photo',
          buttons: [
            {
              text: 'Choose from library'
            }
            ,
            {
              text: 'Take Photo'
            }
          ],
          //destructiveText: 'Delete',
          cancelText: 'Cancel',
          cancel: function () {
            console.log('CANCELLED');
          },
          buttonClicked: function (index) {
            console.log('BUTTON CLICKED', index);

            //library
            if (index == 0) {
              options.sourceType = 0;
            }

            //take photo
            if (index == 1) {
              options.sourceType = 1;
            }

            me.getPictureReal(succ, fail, options);

            return true;
          },
          destructiveButtonClicked: function () {
            console.log('DESTRUCT');
            return true;
          }
        });
      },
      getPictureReal: function (succ, fail, option) {
        //console.log(JSON.stringify(option));
        var me = this;
        navigator.camera.getPicture(function (imageData) {
          if(imageData.indexOf("content://com.google.android.apps.photos.contentprovider")==0)
          {
            window.FilePath.resolveNativePath(imageData,function(rtn){
              imageData=rtn;

              me.getPictureRealCollback(option,imageData,succ);
            },function(rtn){
              //console.log("convert uri error:"+rtn);
            });

          }
          else
          {
            me.getPictureRealCollback(option,imageData,succ);
          }

        }, function (message) {
          fail(message);
        }, option);
      },
      getPictureRealCollback:function(option,imageData,succ)
      {
        var me=this;
        if(option.destinationType==0)
        {
          me.PictureModel.image_url="data:image/jpeg;base64," + imageData;
          //console.log(me.PictureModel.image_url);
        }

        if(option.destinationType==1)
        {
          me.PictureModel.image_url=imageData
          console.log(me.PictureModel.image_url);
        }

        succ(imageData);
      },
      //2上传文件--------------------------------------------------------------------------------------------------------------
      FileTransDefaultOption: {
        mimeType: 'image/jpeg',//image/jpeg,text/plain,multipart/form-data
        urlServer: srvRESTfulAPI.config.urlBase + "/upload/img"   // 'http://192.168./resource.wsdat'
      },
      FileTrans: function (fileURL, succ, fail, option) {
        var me = this;
        var option_new = angular.extend({}, me.FileTransDefaultOption, option);

        var options = new FileUploadOptions();
        options.fileKey = "file";


        // android fileUrl contain "?"
        //options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        //options.mimeType = option_new.mimeType;


        //fixed  filename contain "?"
        var fname=fileURL.substr(fileURL.lastIndexOf('/')+1);
        if(fname.indexOf('?')!=-1)
        {
          fname=fname.split('?')[0];
        }
        options.fileName=fname;
        options.mimeType=option_new.mimeType;


        //
        var headers = {'headerParam': 'headerValue'};

        options.headers = headers;

        var ft = new FileTransfer();
        /*
        ft.onprogress = function (progressEvent) {
          if (progressEvent.lengthComputable) {
            loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
          } else {
            loadingStatus.increment();
          }
        };*/

        var uri = encodeURI(option_new.urlServer);
        var onsucc = function (rtn) {
          //var ls_res = JSON.stringify(rtn.response);
          //var ls_tmp = "var tmp=" + ls_res.substr(1, ls_res.length - 2) + ";";
          //eval(ls_tmp);
          //succ(tmp.url);
          succ(rtn);
        }

        ft.upload(fileURL, uri, onsucc, fail, options);
      }
    }
    return Native_Plugin;
  });



