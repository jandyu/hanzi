/**
 * Created by jrain on 16/5/18.
 */

angular.module('KTmessage', ['ngResource'])
    .factory("messageAction",function(srvRESTfulAPI,$resource){
        var url = srvRESTfulAPI.config.urlBase;
        return $resource(url + '/message/:action',
            { action: '@action'},
            {   doAction:{method:'POST',isArray:false},
                getChatList:{method:'POST',isArray:true},
                getChatContentList:{method:'POST',isArray:true}
            }
        );
    })
    .factory("messageHelper", function ($q,messageAction) {
        return {
            getChatList:function(uid){

            },
            getChatContentList:function(chatId,page,pageSize){

            },

        }
    })
;