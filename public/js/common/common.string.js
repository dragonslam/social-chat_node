/* common.string.js - String prototype
 	writ by yi seung-yong(dragonslam@nate.com)
 	date, 2012/04/03
	https://github.com/dragonslam/javascript_library/blob/master/common/common.string.js
*/
String.prototype.equals = function(str) {
    return (this == str);
}
String.prototype.nvl = function(s) {
	return this.isEmpty() ? (s ? s : '') : this+'';
}
String.prototype.isEmpty = function() {
    return (this == null || this == '' || this == 'undefined' || this == 'null');
}
String.prototype.isAlphaNum = function() {
    return (this.search(/[^A-Za-z0-9_-]/) == -1);
}
String.prototype.isAlpha = function() {
    return (this.search(/[^A-Za-z]/) == -1);
}
String.prototype.isNumber = function() {
    return this.isFinite();
    //return (this.search(/[^0-9]/) == -1);
}
String.prototype.isFinite = function() {
    return isFinite(this);
}
/* 소수점 2자리 까지. */
String.prototype.isDotNumber = function() {
    return (this.search(/^(?:\d*\.\d{1,2}|\d+)$/ ) != -1);
}
String.prototype.isKor = function() {
    return (/^[가-힣]+$/).test(this.remove(arguments[0])) ? true : false;
}
String.prototype.isEmail = function() {
    return (/\w+([-+.]\w+)*@\w+([-.]\w+)*\.[a-zA-Z]{2,4}$/).test(this.trim());
}
String.prototype.isUrl = function() {
    return (/(file|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/).test(this.trim());
}
String.prototype.Int = function() {    // 10진수 숫자로 변환.
    return this.isFinite() ? parseInt(this, 10) : parseInt("0");
}
String.prototype.Float = function() {    
    return this.isFinite() ? parseFloat(this) : parseFloat("0.0");
}
String.prototype.parseInt = function() {
    return String(this.trim().replace(/[^-_0-9]/g, "")).Int();
}
String.prototype.parseFloat = function() {
    return String(this.trim().replace(/[^-_0-9.0-9]/g, "")).Float();
}
String.prototype.money = function() 
{ // 숫자에 3자리마다 , 를 찍어서 반환
	var s = (this.nvl('0')).trim();
    if (s.isNumber()) {        
        while((/(-?[0-9]+)([0-9]{3})/).test(s)) {
            s = s.replace((/(-?[0-9]+)([0-9]{3})/), "$1,$2");
        }
        return s;
    }
    else {
        return this;
    }
}
Number.prototype.money = function() {
    return String(this).money();
}
String.prototype.padLeft = function(cnt, str) 
{
    cnt    = (cnt && typeof(cnt) == "number") ? cnt : 0;
    str        = (str && typeof(str) == "string") ? str : " ";
    
    if (this.length < cnt) {
        var s = "";    
        for (var i = this.length; i < cnt; i++) {
            s += str;
        }
        return s + this;
    } else {
        return this;
    }    
}
String.prototype.padRight = function(cnt, str) 
{
    cnt    = (cnt && typeof(cnt) == "number") ? cnt : 0;
    str        = (str && typeof(str) == "string") ? str : " ";
    
    if (this.length < cnt) {
        var s = "";    
        for (var i = this.length; i < cnt; i++) {
            s += str;
        }
        return this + s;
    } else {
        return this;
    }    
}
String.prototype.digits = function(cnt) 
{    // 숫자의 자리수(cnt)에 맞도록 반환
    return this.padLeft(cnt, "0");
}
Number.prototype.digit = function(cnt) 
{    // 숫자의 자리수(cnt)에 맞도록 반환
    return String(this).digit(cnt);
}
String.prototype.startWith = function(str) {
    if (this.equals(str))    return true;
    
    if (str.length > 0)
        return (str.equals(this.substr(0, str.length)));
    else
        return false;
}
String.prototype.endWith = function(str) {
    if (this.equals(str))    return true;
    
    if (String(str).length > 0)
        return (str.equals(this.substr(this.length - str.length, str.length)));
    else
        return false;
}
String.prototype.bytes = function() 
{    // 바이트 계산.
    var b = 0;
    for (var i=0; i<this.length; i++) b += (this.charCodeAt(i) > 128) ? 2 : 1;
    return b;
}
if (typeof "$".trim != 'function') {
    String.prototype.trim = function() {    // 공백 제거
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
}
if (typeof "$".trimLeft != 'function') {
    String.prototype.trimLeft = function() {    // 좌 공백제거
        return this.replace(/(^\s*)/, "");
    }
}
if (typeof "$".trimRight != 'function') {
    String.prototype.trimRight = function() {    // 우 공백제거
        return this.replace(/(\s*$)/, "");
    }
}
//-----------------------------------------------------------------------------
// 날자 체크 (년/월/일 검사)
// @return : boolean
//-----------------------------------------------------------------------------
String.prototype.isDate = function() {
    var exp;
    exp = (/^(19|20)\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])$/);    // yyyy-mm-dd
    if (exp.test(this))    return true;

    exp = (/^\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])$/);        // yy-mm-dd
    if (exp.test(this))    return true;

    exp = (/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-](19|20)\d{2}$/);    // mm-dd-yyyy
    if (exp.test(this))    return true;

    exp = (/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-]\d{2}$/);        // mm-dd-yy
    if (exp.test(this))    return true;

    return false;
}
//-----------------------------------------------------------------------------
// 시간 체크    hh:mm:ss
// @return : boolean
//-----------------------------------------------------------------------------
String.prototype.isTime = function() {
    return (/^(2[0-3]|[0-1]\d)(:[0-5]\d){1,2}$/).test(this);
}
//-----------------------------------------------------------------------------
// 날자시간 체크 
// @return : boolean
//-----------------------------------------------------------------------------
String.prototype.isDateTime = function() {
    var exp;
    exp = (/^(19|20)\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1]) (2[0-3]|[0-1]\d)(:[0-5]\d){1,2}$/);    // yyyy-mm-dd hh:mm:ss
    if (exp.test(this))    return true;

    exp = (/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-](19|20)\d{2} (2[0-3]|[0-1]\d)(:[0-5]\d){1,2}$/);    // mm-dd-yyyy hh:mm:ss
    if (exp.test(this))    return true;

    return false;
}
//-----------------------------------------------------------------------------
// 전화번호 체크 - arguments[0] : 전화번호 구분자
// @return : boolean
//-----------------------------------------------------------------------------
String.prototype.isPhone = function() {
    var arg = arguments[0] ? arguments[0] : "";
    return eval("(/(02|0[3-9]{1}[0-9]{1})" + arg + "[1-9]{1}[0-9]{2,3}" + arg + "[0-9]{4}$/).test(this)");
}
//-----------------------------------------------------------------------------
// 핸드폰번호 체크 - arguments[0] : 핸드폰 구분자
// @return : boolean
//-----------------------------------------------------------------------------
String.prototype.isMobile = function() {
    var arg = arguments[0] ? arguments[0] : "";
    return eval("(/01[016789]" + arg + "[1-9]{1}[0-9]{2,3}" + arg + "[0-9]{4}$/).test(this)");
}
String.prototype.substringBytes = function(start, limitBytes) 
{    // 원하는 바이트 까지 잘라서 반환.
    var b = 0;
    var L = 0;
    var s = "";    
    for (var i=0; i<this.length; i++) {
        b = (this.charCodeAt(i) > 128) ? 2 : 1;
        if (i >= start) {
            L += b;
            s += this.charCodeAt(i);
        }
        if (L >= limitBytes)
            break;
    }
    return s;
}
String.prototype.indexesOf = function(ptn) {
    var position = 0;
    var hits = -1;
    var start = -1;

    while( position != -1 ) {
        position = this.indexOf(ptn, start+1);
        hits += 1;
        start = position;
    }
    return hits;
};
String.prototype.replaceAll = function(source, target) {
    source = source.replace(new RegExp("(\\W)", "g"), "\\$1");
    target = target.replace(new RegExp("\\$", "g"), "$$$$");
    return this.replace(new RegExp(source, "gm"), target);
};
// "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
String.prototype.remove = function(str) {
    if (str && typeof(str) == "string")
        return this.replaceAll(str, "");
    else 
        return this;
}
String.prototype.toLower = function() {
    return this.toLowerCase();
}
String.prototype.toUpper = function() {
    return this.toUpperCase();
}
String.prototype.delHtmlTag = function() {
   var objStrip = new RegExp();
   objStrip = /[<][^>]*[>]/gi;
   return this.replace(objStrip, " ");
}
String.prototype.escapeHTML = function() {
    return this.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
}
String.prototype.encode = function() {
    try {
        return encodeURIComponent(this);    
    }
    catch (e) {
        return this;
    }    
}
String.prototype.decode = function() {
    try {
        return decodeURIComponent(this);
    }
    catch (e) {
        return this;
    }    
}
String.prototype.getFileName = function() {
    if (this.indexOf("/") > 0)
        return this.split('/')[this.split('/').length-1];
    else
        return this.split('\\')[this.split('\\').length-1];
}
String.prototype.getFileExpName = function() {
    return this.split('.')[this.split('.').length-1];
}
String.prototype.toDate = function() {

    if (this.isNumber())
    {    // 숫자로만 구성된 문자열
        if (this.length == 8)
        {    // YYYYMMDD
            var y = this.substr(0, 4);
            var m = this.substr(4, 2);
            var d = this.substr(6, 2);
            return new Date(parseInt(y), parseInt(m)-1, parseInt(d));
        } 
        else if (this.length == 12) 
        {    // YYYYMMDDhhmm
            var y = this.substr(0, 4);
            var m = this.substr(4, 2);
            var d = this.substr(6, 2);
            var hh = this.substr(8, 2);
            var mm = this.substr(10, 2);        
            return new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(hh), parseInt(mm), 0);
        }
        else if (this.length == 14) 
        {    // YYYYMMDDhhmmss    
            var y = this.substr(0, 4);
            var m = this.substr(4, 2);
            var d = this.substr(6, 2);
            var hh = this.substr(8, 2);
            var mm = this.substr(10, 2);
            var ss = this.substr(12, 2);
            return new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(hh), parseInt(mm), parseInt(ss));
        }
    } 
    else {
		var srz = (this.length > 20) ? String(this.split(",")[0]) : this;

        if ((/^(19|20)\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])$/).test(srz))
        {    // yyyy-mm-dd, yyyy/mm/dd
            s = (srz.split("-").length == 3) ? srz.split("-") : srz.split("/");            
            return new Date(parseInt(s[0]), parseInt(s[1])-1, parseInt(s[2]));        
        }
        if ((/^\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])$/).test(srz))
        {    // yy-mm-dd, yy/mm/dd
            s = (srz.split("-").length == 3) ? srz.split("-") : srz.split("/");            
            return new Date(1900+parseInt(s[0]), parseInt(s[1])-1, parseInt(s[2]));        
        }

        if ((/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-](19|20)\d{2}$/).test(srz))
        {    // mm-dd-yyyy, mm/dd/yyyy
            s = (srz.split("-").length == 3) ? srz.split("-") : srz.split("/");            
            return new Date(parseInt(s[2]), parseInt(s[0])-1, parseInt(s[1]));
        }
        if ((/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-]\d{2}$/).test(srz))
        {    // mm-dd-yy, , mm/dd/yy
            s = (srz.split("-").length == 3) ? srz.split("-") : srz.split("/");
            return new Date(parseInt(s[2]), parseInt(s[0])-1, 1900+parseInt(s[1]));
        }

        if ((/^(19|20)\d{2}[\/-](0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1]) (2[0-3]|[0-1]\d)(:[0-5]\d){1,2}$/).test(srz))
        {    // yyyy-mm-dd hh:mm:ss, yyyy/mm/dd  hh:mm:ss
            s = srz.split(" ");
            d = (s[0].split("-").length == 3) ? s[0].split("-") : s[0].split("/");;
            t = s[1].split(":");            
            return new Date(parseInt(d[0]), parseInt(d[1])-1, parseInt(d[2]), parseInt(t[0]), parseInt(t[1]), (t.length == 3 ? parseInt(t[2]) : 0));        
        }
        if ((/^(0[1-9]|1[012])[\/-](0[1-9]|[12][0-9]|3[0-1])[\/-](19|20)\d{2} (2[0-3]|[0-1]\d)(:[0-5]\d){1,2}$/).test(srz))
        {    // mm-dd-yyyy hh:mm:ss, mm/dd/yyyy hh:mm:ss
            s = srz.split(" ");
            d = (s[0].split("-").length == 3) ? s[0].split("-") : s[0].split("/");;
            t = s[1].split(":");
            return new Date(parseInt(d[2]), parseInt(d[0])-1, parseInt(d[1]), parseInt(t[0]), parseInt(t[1]), (t.length == 3 ? parseInt(t[2]) : 0));        
        }
    }
    return null;
}


Number.prototype.toJSON        =
Boolean.prototype.toJSON    = 
String.prototype.toJSON        = function (key) {
    // jQuery.parseJSON();
    return '{"'+ key +'" : "'+ this.valueOf() +'"}';
};
Date.prototype.toJSON = function (key, type) {
    type = typeof(type) == "number" ? type : 0;    
    return String(isFinite(this.valueOf()) ? this.toDateTimeString(type) : "").toJSON(key);
};
var JSONtoString = function(obj, step) {
    if (typeof step == 'number' && step > 2) return "''";
    var cnt		= 0;
    var json		= '';
    var depth	= (typeof step == 'number') ? step : 0;    
    for(var prop in obj) {
        if (typeof obj[prop] != 'function') {
            if (cnt > 0) json += ',';
            if (typeof obj[String(prop)] == 'object') {
                json+= "'"+ prop +"':"+ JSONtoString(obj[String(prop)], depth++) +"";
            }
            else {
                json+= "'"+ prop +"':'"+ String(obj[String(prop)]).encode() +"'";
            }            
            cnt ++;
        }
    }
    return '{'+ json +'}';
};
