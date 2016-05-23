/*
data.srv数据服务器客户端js库
支持：jquery 1.4 以上
ver:0.1
author:Rain.J
*/


var wwwurl = "http://wy.zjy8.cn/";
$(function () { if (util.cookie("pagesize") == null) { util.cookie("pagesize", "10"); } });

var datsrv = {
	errbox:function(info){
		var modal = new $.UIkit.modal.Modal("#msgbox");
		$("#msginfo").text(info);
		$("#msgbox button.uk-button").removeClass("uk-button-success").addClass("uk-button-danger");
		$("#msgbox button.uk-button i").removeClass("uk-icon-ok").addClass("uk-icon-remove");
		$("#msgbox h3 i").removeClass("uk-icon-ok").addClass("uk-icon-remove");
		modal.show();
	},
	msgbox:function(info){
		var modal = new $.UIkit.modal.Modal("#msgbox");
		$("#msgbox button.uk-button").removeClass("uk-button-danger").addClass("uk-button-success");
		$("#msgbox button.uk-button i").removeClass("uk-icon-remove").addClass("uk-icon-ok");
		$("#msgbox h3 i").removeClass("uk-icon-remove").addClass("uk-icon-ok");
		$("#msginfo").html(info);
		modal.show();
	},
    uurl: wwwurl+"wsdat.wsdat",
    timeWaitMsg: "<font color='red'><i class='uk-icon-cog uk-icon-spin'></i>数据加载中...</font>",
	errorMsg:[
		{error:'截断字符串或二进制数据' ,msg:'：输入数据格式错误，超出长度范围，请检查！'},
		{error:'违反了 PRIMARY KEY 约束',msg:'：定义的数据已经存在，请检查编号！'},
		{error:'从数据类型 varchar 转换为 numeric',msg:'：录入的数据需要数字型，如没有录入请输入0，或录入错误请检查！'},

	],
	getOperError:function(info){
		if(info.indexOf("数据操作失败")>0){
			var str = info.split('!');
			return str[1];
		}
		else{
			return info;
		}
	},
	getErrorMsg:function(info){
		var me = this;
		var rtnmsg = info;
		$.each(me.errorMsg,function(i,item){
			if(info.indexOf(item.error)>0) rtnmsg = item.msg;
		});

		return rtnmsg;
	},
    /*
    服务器通讯传输
	async:true,异步（默认），false，同步
    */
    Post2Srv: function(pstdat, succ, fail,async) {
		var me = this;
		if (typeof (async) == "undefined") async=true;
        $.ajax({
            type: "POST",
            url: this.uurl,
            data: pstdat,
			      async:async,
            success:function(rrtn) {
                var ls_rtn = rrtn.substr(1, 4);
                if (ls_rtn != "erro") {succ(rrtn);}
                else {
					rrtn  = me.getErrorMsg(rrtn);
                    if (typeof (fail) != "undefined") {fail(rrtn);}
                    else {me.errbox(rrtn);}
                }
            },
            error:function(xhr, textStatus, errorThrown) {
				me.msgbox("系统错误"+xhr.status+':'+xhrstatus['code'+xhr.status]);
                //if (xhr.status == 500) {
                //重做
                //    setTimeout(function() { wssrv.Post2Srv(pstdat, succ, fail); }, 1000);
                //me.msgbox(errorThrown);
                //}
            }
        });
    },
	Post2SrvData:function(id,fmt,qry,style,succ,err,async){
		var pstda = { defid: id, fmtid: fmt, strparam: JSON.stringify(qry), dStyle: style };
        //进度显示
        this.Post2Srv(pstda,function(rtn) {succ(rtn);},function(rtn) {err(rtn);},async);
	},
    //--------------------------------------------------------------------------------------------------------------------取pdf文件
    GetPrintPdf: function(defid, fmtid, where) {
				var me = this;
        var qryobj = {common: {currpage: 1,pagesize: 1000,where: where}};
		this.Post2SrvData(defid,fmtid,qryobj,"pdf",
            function(rtn) {             //显示取到的界面
                var url = "../../resource/data/" + defid + "/" + fmtid + "/" + rtn;
                parent.window.open(url);
            },
            function(rtn) { me.msgbox(rtn); }            //未取到数据，显示空
        );
    },
    //-------------------------------------------------------------------------------------------------------------------取xls，csv文件
    GetFileDownload: function(defid, fmtid, where, style, succ) {
		var me = this;
        var qryobj = {common: {currpage: 1,pagesize: 1000,where: where}};
		this.Post2SrvData(defid,fmtid,qryobj,"." + style,
            function(rtn) {
                var url = "../../export/" + rtn;
                if (typeof (succ) == "undefined") {parent.window.open(url);}
                else {succ(url);}
            },
            function(rtn) {me.errbox(rtn);}            //未取到数据，显示空
        );
    },
	//csv文件
    GetTxtDownload: function(defid, fmtid, where) {
        this.GetFileDownload(defid, fmtid, where, "csv");
    },
	//xls
	GetXlsDownload: function(defid, where) {
        this.GetFileDownload(defid, 'table_excel', where, "xls");
    },
	//-----------------------------------------------------------------------------------------------------------------------调用服务端处理(同步)
	CallSrvOperSync: function(defid, opername, paramters, succ, fail) {
        var oper = { 'mode': 'parameter','proc': [{ 'name': opername, 'param': paramters}]};
		this.Post2SrvData(defid,"update",oper,"xml",succ,fail,false);
    },
    //-----------------------------------------------------------------------------------------------------------------------调用后台操作处理(异步)
    CallSrvOper: function(defid, opername, paramters, succ, fail) {
        var oper = { 'mode': 'parameter','proc': [{ 'name': opername, 'param': paramters}]};
		this.Post2SrvData(defid,"update",oper,"xml",succ,fail,true);
    },
    //------------------------------------------------------------------------------------------------------------------------取json格式的数据
    DatGetJsonData: function(defid, CurrPage, PageSize, SearchArray, succ) {
        var qryobj = {common: {currpage: CurrPage,pagesize: PageSize,where: []}};
        if (typeof (SearchArray) != "undefined") {qryobj.common.where = SearchArray;}
        var pstdat = { defid: defid, fmtid: 'json', strparam: JSON.stringify(qryobj), dStyle: "json" };
        $.getJSON(this.uurl + "?callback=?", pstdat, function(rtnobj){succ(rtnobj);});
    },
	//----------------------------------------------------------------------------------------------------------------------FusionCharts数据,xml格式
	DatGetFChartsData: function(defid, fmtid, PageSize, SearchArray, succ,fail) {
        var qryobj = {common: {currpage: 1,pagesize: PageSize,where: []}};
        if (typeof (SearchArray) != "undefined") {qryobj.common.where = SearchArray;}
        var pstdat = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };
		//进度显示
        this.Post2Srv(pstdat,
            function(rtn) {
                if (typeof (succ) != "undefined") {
                    succ(rtn);             //回调成功处理
                }
            },
            function(rtn) {
			if (typeof (succ) != "undefined") {
                    fail(rtn);             //回调失败处理
                }
			}
        );
    },
    //保存单行编辑数据
    DatSaveSingleRow: function(defid, data, deldata, succ, fail) {
        var dataobj = { tblList: [] };
        dataobj.tblList[0] = defid;
        dataobj[defid] = { data: [], delData: [] };
        dataobj[defid].data = data;
        dataobj[defid].delData = deldata;
        this.DatSaveMultTable(defid, dataobj, succ,fail);
    },
    //保存数据
    DatSaveMultTable:function(defid, data, succ, fail){
		var me= this;
        var pstda = { defid: defid, fmtid: 'update', strparam: JSON.stringify(data), dStyle: "xml" };
        this.Post2Srv(pstda,
            function(rtn) {
                if(typeof(succ) != "undefined") {succ(rtn);}
                else {me.msgbox("保存成功");}
            },
            function(rtn){
                if (typeof (fail) != "undefined") {fail(rtn);}
                else {me.errbox("保存失败" + rtn);}
            });
    },
    /*
    单行数据编辑格式化的ui，并且将ui显示到指定的div,rowid
    */
    UIGetSingleRowEdit: function(defid, fmtid, ShowDiv, rowid, succ) {
        var qryobj = {common: {currpage: 1,pagesize: 1,where: [{ col: 'iid', logic: '= ', val: rowid, andor: ''}]}};
        var pstda = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };
        //进度显示
        this.Post2Srv(pstda,
            function(rtn) {             //显示取到的界面
                $(ShowDiv).html(rtn);
                if (typeof (succ) != "undefined") {
                    succ();             //回调成功处理
                }
            },
            function(rtn) { $(ShowDiv).html(""); }//未取到数据，显示空
        );
    },

    /*
    简单查询得到格式化的ui，并且将ui显示到指定的id
    */
	//-------------------------------------------------------------------------------------------------------------------取表格数据
    UIGetSimpleQuery: function(defid, fmtid, CurrPage, PageSize, SearchArray, ShowDiv, succ, order) {
        //me.msgbox(PageSize);
        if (SearchArray == "error") return;

        var qryobj = {
            common: {
                currpage: CurrPage,
                pagesize: PageSize,
                where: []
            }
        };
        //me.msgbox(1);
        if (typeof (SearchArray) != "undefined") {
            qryobj.common.where = SearchArray;
        }
        //me.msgbox(2);
        if (typeof (order) != "undefined") {
            $.each(order, function(item) { qryobj[item] = order[item] });
        }

        //me.msgbox(3);
        var pstda = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };
        //me.msgbox(4);
        //进度显示
        $(ShowDiv ).find(".progressinfo").html(this.timeWaitMsg);
        //me.msgbox(111);
        this.Post2Srv(pstda,
            function(rtn) {
                $(ShowDiv).html(rtn);
                if (typeof (succ) != "undefined") {
                    succ();
                }
            },          //显示取到的界面
            function(rtn) { $(ShowDiv).html(""); }            //未取到数据，显示空
        );
    },
    UIGetUeditorContent: function(defid, SearchArray, succ) {
        var qryobj = {
            common: {
                currpage: 1,
                pagesize: 1,
                where: []
            }
        };
        //me.msgbox(1);
        if (typeof (SearchArray) != "undefined") {
            qryobj.common.where = SearchArray;
        }

        //me.msgbox(3);
        var pstda = { defid: defid, fmtid: "info_html", strparam: JSON.stringify(qryobj), dStyle: "xml" };
        //me.msgbox(4);
        //进度显示

        this.Post2Srv(pstda,
            function(rtn) {
                if (typeof (succ) != "undefined") {
                    succ(rtn);
                }
            },
            function(rtn) { me.msgbox(rtn); }            //未取到数据，显示错误
        );
    },
    //html界面片断
    UIGetContentPage: function(defid, fmtid, page, size, showDiv, SearchArray, succ) {
        var qryobj = {
            common: {
                currpage: page,
                pagesize: size,
                where: []
            }
        };
        //me.msgbox(1);
        if (typeof (SearchArray) != "undefined") {
            qryobj.common.where = SearchArray;
        }

        //me.msgbox(3);
        var pstda = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };

        this.Post2Srv(pstda,
            function(rtn) {
                if (showDiv != "undefined") {
                    $(showDiv).html(rtn);
                }
                if (typeof (succ) != "undefined") {
                    succ(rtn);
                }
            },
            function(rtn) { ; }            //未取到数据，显示错误
        );
    },
    //html界面片断
    UIGetContent: function(defid, fmtid, size, showDiv, SearchArray, succ) {
        var qryobj = {
            common: {
                currpage: 1,
                pagesize: size,
                where: []
            }
        };
        //me.msgbox(1);
        if (typeof (SearchArray) != "undefined") {
            qryobj.common.where = SearchArray;
        }

        //me.msgbox(3);
        var pstda = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };

        this.Post2Srv(pstda,
            function(rtn) {
                if (showDiv != "undefined") {
                    $(showDiv).html(rtn);
                }
                if (typeof (succ) != "undefined") {
                    succ(rtn);
                }
            },
            function(rtn) { ; }            //未取到数据，显示错误
        );
    },
    /*
    简单查询（使用common）得到格式化的ui，并且将ui显示到指定的div
    */
    UIGetSimpleQueryNoLoading: function(defid, fmtid, CurrPage, PageSize, SearchArray, ShowDiv, succ, order) {

        var qryobj = {
            common: {
                currpage: CurrPage,
                pagesize: PageSize,
                where: []
            }
        };
        if (typeof (SearchArray) != "undefined") {
            qryobj.common.where = SearchArray;
        }

        if (typeof (order) != "undefined") {
            $.each(order, function(item) { qryobj[item] = order[item] });
        }

        var pstda = { defid: defid, fmtid: fmtid, strparam: JSON.stringify(qryobj), dStyle: "xml" };

        //进度显示
        //$(ShowDiv).html("<img src='../../content/images/loading.gif' width='40px' height='40px'/>数据加载中...");

        this.Post2Srv(pstda,
            function(rtn) {
                $(ShowDiv).html(rtn);
                if (typeof (succ) != "undefined") {
                    succ();
                }
            },          //显示取到的界面
            function(rtn) { $(ShowDiv).html(""); }            //未取到数据，显示空
        );
    },
    /*
    从指定的div中，取到需要的查询条件，返回查询条件的数组，用于查询的where
    */
	//	--------------------------------------------------------------------------------------------------------------------------从div取where条件
    GetWhereFromDiv: function(SearchDivObj) {
        var where = [];
        if (typeof (SearchDivObj) != "undefined") {
            var i = 0;
            //input,hidden
            $(SearchDivObj).find("input").each(function() {
                var col = "", logic = "", val = "";
                //文本
                if (($(this).attr("type") == 'text' || $(this).attr("type") == 'hidden' || $(this).attr("type") == 'date') ) {
                    col = $(this).attr("id");
                    var colArr = col.split('__');
                    if (colArr[1] == null) {
                        col = colArr[0]
                    }
                    else {
                        col = colArr[1];
                    }

					logic =$(this).attr("logic");
					if (typeof(logic) == "undefined") logic = "like";
					val = $(this).val();
					if($(this).attr("type") == 'date') val = val.replace(/-/g,"");
					if(val!=""){
						if (logic=="like"){val = "%" + $(this).val() + "%";}
                    	where[i++] = { col: col, logic: logic, val: val, andor: 'and' };
					}
                }

            });
            //select
            $(SearchDivObj).find("select").each(function() {
                var col = "", logic = "", val = "";
				if($(this).attr('isfrm') =='true'){
					col = $(this).parent().attr("id");
				}
				else{
					col = $(this).attr("id");
				}
                var colArr = col.split('__');
                if (colArr[1] == null) {
                    col = colArr[0]
                }
                else {
                    col = colArr[1];
                }
				//是否输入的是逻辑
				if($(this).attr('logic') =='true'){
					var vallst = $(this).val().split(",");
					if (vallst[0] != "%") {
						logic = vallst[0];
						where[i++] = { col: col, logic: logic, val:vallst[1] , andor: 'and' };
					}
				}
				else
				{
					val = $(this).val();
					if (val != "%") {
						logic = " = ";
						where[i++] = { col: col, logic: logic, val: val, andor: 'and' };
					}
				}
            });
			//整理最后一个andor格式
            if (i > 0) where[i - 1].andor = '';
        }

        return where;
    },

    GetDateWhereFromDiv: function(SearchDivObj) {
        var where = [];

        if (typeof (SearchDivObj) != "undefined") {
            var i = 0;
            //input
            $(SearchDivObj).find("input").each(function() {
                var col = "", logic = "", val = "";
                //文本

                if ($(this).attr("type") == 'text') {
                    col = $(this).attr("id");

                    var colArr = col.split('$');
                    if (colArr[1] == null) {
                        col = colArr[0]
                    }
                    else {
                        col = colArr[1];
                    }


                    var colSplit = col.split('_');
                    if (colSplit == "st") {
                        logic = " >= ";
                    }
                    else {
                        logic = " <= ";
                    }

                    val = $(this).val();
                    where[i++] = { col: col, logic: logic, val: val, andor: 'and' };
                }
            });


            if (i > 0) where[i - 1].andor = '';
        }

        return where;
    }
}



//-----------------------------------------------------------------------------------------------------
var util = {
	round:function(val,l){
			return Math.round(val * Math.pow(10,l) ) / Math.pow(10,l)
	},

  DateFormat: function (dt, fmt) {

    var weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var o = {
      "M+": dt.getMonth() + 1,                 //
      "d+": dt.getDate(),                    //
      "h+": dt.getHours(),                   //
      "m+": dt.getMinutes(),                 //
      "s+": dt.getSeconds(),                 //
      "q+": Math.floor((dt.getMonth() + 3) / 3), //season
      "S": dt.getMilliseconds(),             //
      "W": weekday[dt.getDay()]
    };

    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },

    GetDayString: function(d, f) {
        var oDate = new Date();
        var tdat = new Date(oDate.valueOf() + d * 24 * 60 * 60 * 1000);

        var month = tdat.getMonth() + 1;
        if (month <= 9) month = "0" + month;

        var day = tdat.getDate();
        if (day <= 9) day = "0" + day;

        var sDate = tdat.getFullYear() + f + month + f + day;
        return sDate;
    },
    today: function(f) { return this.GetDayString(0, f); },
    dateType: function(data, f) {
        var arys = new Array();
        arys = data.split('-');
        if (arys.length == 3) {
            var year = arys[0];
            var month = arys[1];
            var day = arys[2];
            if (month <= 9) month = "0" + month;
            if (day <= 9) day = "0" + day;
            var sDate = year + f + month + f + day;
            return sDate;
        }
        return;
    },
    haveRight: function(right) {
        if (g_curruser.right == "%%") return true;
        if ((","+g_curruser.right+",").indexOf("," + right + ",") < 0) {
            return false;
        }
        else {
            return true;
        }
    },

    IsMatch: function(val, m) {
        return m.test(val);
    },
    //数字无小数，如编号等内容
    IsNumber: function(val) {
        var pat = /^\d+$/;
        return util.IsMatch(val, pat);
    },
    //非负整数
    IsInteger: function(val) {
        var pat = /^[0-9]+$/;
        return util.IsMatch(val, pat);
    },
    //非负整数
    IsPInteger: function(val) {
        var pat = /^[0-9]*[1-9][0-9]*$/;
        return util.IsMatch(val, pat);
    },
    //带小数数字
    IsDecimal: function(val) {
        var pat = /^\d*.?\d+$/;
        return util.IsMatch(val, pat);
    },
    //时间格式
    IsTime: function(val) {
        var pat = /^\d\d:\d\d$/;
        return util.IsMatch(val, pat);
    },
    //日期1~31
    IsDay: function(val) {
        var pat = /^((0?[1-9])|((1|2)[0-9])|30|31)$/;
        return util.IsMatch(val, pat);
    },
    //身份证
    IsCard: function(val) {
        var pat = /^([1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})|([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x))$/;
        return util.IsMatch(val, pat);
    },
    //手机号码
    IsPhone: function(val) {
        var pat = /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/;
        if (val == '') {
            return true;
        }
        return util.IsMatch(val, pat);
    },
    //传真
    IsTel: function(val) {
        var pat = /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/;
        if (val == '') {
            return true;
        }
        return util.IsMatch(val, pat);
    },
    //email
    IsEmail: function(val) {
        var pat = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (val == '') {
            return true;
        }
        return util.IsMatch(val, pat);
    },
    //下拉查询
    AutoDDL: function(obj, style) {
        var idd = $(obj).attr("id");
        var cls = $(obj).attr("class");
        var vv = $(obj).val();
        var pluwidth = $(obj).attr("width");
        $(obj).parent().attr("id", idd + "_ddldiv");
        $(obj).replaceWith("");
		//console.info(pluwidth);
        $("#" + idd + "_ddldiv").flexbox(datsrv.uurl, style, {
            divWidth: $(obj).css("width"),
            width: $(obj).css("width"),
            inputID: idd,
            highlightMatches: false,
            inputClass: cls,
            showArrow: true,
            displayValue: "name",
			hiddenValue:"id",
            initialValue: vv,
            paging: {pageSize:10}
        });
    },
	AutoDDLP: function(obj, style,p) {
        var idd = $(obj).attr("id");
        var cls = $(obj).attr("class");
        var vv = $(obj).val();
        var pluwidth = $(obj).attr("width");
        $(obj).parent().attr("id", idd + "_ddldiv");
        $(obj).replaceWith("");
		//console.info(pluwidth);
        $("#" + idd + "_ddldiv").flexbox(wssrv.uurl, style, {
            divWidth: $(obj).css("width"),
            width: $(obj).css("width"),
            inputID: idd,
            highlightMatches: false,
            inputClass: cls,
            showArrow: true,
            displayValue: "name",
			hiddenValue:"id",
            initialValue: vv,
            paging: {pageSize:10},
			op:p
        });
    },
	//下拉查询
    FixDDL: function(obj, style) {
        var idd = $(obj).attr("id");
        var cls = $(obj).attr("class");
        var vv = $(obj).val();
        var pluwidth = $(obj).attr("width");
        $(obj).parent().attr("id", idd + "_ddldiv");
        $(obj).replaceWith("");
		//console.info(pluwidth);
        $("#" + idd + "_ddldiv").flexbox(wssrv.uurl, style, {
            divWidth: $(obj).css("width"),
            width: $(obj).css("width"),
            inputID: idd,
			allowInput:false,
            highlightMatches: false,
			contentClass: cls,
            inputClass: cls,
            showArrow: true,
            displayValue: "name",
			hiddenValue:"id",
            initialValue: vv,
            paging: {pageSize:10}
        });
    },
    //取元素位置，x、y
    getElementPos: function(elementId) {

        var ua = navigator.userAgent.toLowerCase();
        var isOpera = (ua.indexOf('opera') != -1);
        var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof

        var el = document.getElementById(elementId);

        if (el.parentNode === null || el.style.display == 'none') {
            return false;
        }

        var parent = null;
        var pos = [];
        var box;

        if (el.getBoundingClientRect)    //IE
        {
            box = el.getBoundingClientRect();
            var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

            return { x: box.left + scrollLeft, y: box.top + scrollTop };
        }
        else if (document.getBoxObjectFor)   // gecko
        {
            box = document.getBoxObjectFor(el);

            var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
            var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;

            pos = [box.x - borderLeft, box.y - borderTop];
        }
        else    // safari & opera
        {
            pos = [el.offsetLeft, el.offsetTop];
            parent = el.offsetParent;
            if (parent != el) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
            if (ua.indexOf('opera') != -1
            || (ua.indexOf('safari') != -1 && el.style.position == 'absolute')) {
                pos[0] -= document.body.offsetLeft;
                pos[1] -= document.body.offsetTop;
            }
        }

        if (el.parentNode) { parent = el.parentNode; }
        else { parent = null; }

        while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;

            if (parent.parentNode) { parent = parent.parentNode; }
            else { parent = null; }
        }
        return { x: pos[0], y: pos[1] };
    },
    //滚动条位置，t、l、w、h
    getScroll: function() {
        var t, l, w, h;

        if (document.documentElement && document.documentElement.scrollTop) {
            t = document.documentElement.scrollTop;
            l = document.documentElement.scrollLeft;
            w = document.documentElement.scrollWidth;
            h = document.documentElement.scrollHeight;
        } else if (document.body) {
            t = document.body.scrollTop;
            l = document.body.scrollLeft;
            w = document.body.scrollWidth;
            h = document.body.scrollHeight;
        }
        return { t: t, l: l, w: w, h: h };
    },
    //example util.cookie(’name’, ‘value’, {expires: 7, path: ‘/’, domain: ‘jquery.com’, secure: true});
    //新建一个cookie 包括有效期 路径 域名等
    cookie: function(name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if(!options.expires) options.expires = 365; //默认定义一年
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            var path = options.path ? '; path=' + options.path : '; path=/';
            var domain = options.domain ? '; domain=' + options.domain : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    },


	cliQryStr:function(paras) {
		var url = location.href;
		var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
		var paraObj = {}
		for (i = 0; j = paraString[i]; i++) {
			paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
		}
		var returnValue = paraObj[paras.toLowerCase()];
		if (typeof (returnValue) == "undefined") {
			return "";
		} else {
			return decodeURI(returnValue.replace("#",""));
		}
	},

	BarCodeCheck:function (s){

		var reg = new RegExp(/^[0-9]{12}$/);
		 if (!reg.exec(s.substring(0, 12))) return "验证条形码前12位出错!";

		 var a = 0;
		 var b = 0;
		 var c = 0;
		 var d = 0;
		 var e = 0;
		 for (var i = 1; i <= 12; i++) {
			 var sc = parseInt(s[i - 1]);
			 if (i <= 12 && i % 2 == 0) {
				 a += sc;
			 }
			 else if (i <= 11 && i % 2 == 1) {
				 b += sc;
			 }
		 }

		 c = a * 3;
		 d = b + c;
		 if (d % 10 == 0)
			 e = d - d;
		 else
			 e = d + (10 - d % 10) - d;
		 return e+"";
	},
	rand:function(l,u){
		return Math.floor((Math.random() * (u-l+1))+l);
	}
}
