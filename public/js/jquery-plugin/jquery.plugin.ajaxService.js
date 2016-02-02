$.ajaxSetup({ cache: false });

if (typeof console == "undefined") {
    window.console = {
		"log": function (s) { }
	}
}

var clientErrorLoggingUrl = '/Logging/ClientError'; // url.action 이 안먹어서 직접 경로를 넣어둠....
var lastClientErrorMessage = ""; //  마지막 발생한 Script 에러메시지

var ajaxService = {
	"Post": function (url, model, cbSuccess, cbError, options) {
		if (typeof url == "undefined")
			debugger;

		if (typeof model == "string") // string 인 경우는 JSON.stringify 된 문자열로 보고 postData 로 싸준다.
			model = { postData: model }

		$.ajax({
			type: "POST",
			url: url,
			data: model,
			success: function (json) {
				if (json.Result == ajaxResultEnum.Success) {
					if (cbSuccess) {
						cbSuccess(json.Model);
					}
				}
				else if (json.Result == ajaxResultEnum.Error) {
					if (json.ErrorType == "AuthorizeFailException") {
						$.popup(memberLoginPopupDefaultUrl, 570, 300); // 로그인 팝업 오픈
					}
					else if (json.ErrorType == "ClientScriptException") {
						// 이것은 client script 오류를 내보낸 것이므로 무시한다.
						//console.log("ajaxService ClientScriptException ignore");
					}
					else if (cbError) {
						cbError(json.StatusCode, json.ErrorType, json.ErrorMessage);
					}
					else {
						if ($.hasValue(json.StatusCode) == true
								|| $.hasValue(json.ErrorType) == true
								|| $.hasValue(json.ErrorMessage) == true) {
							console.log("code : " + json.StatusCode
								+ "\r\ntype : " + json.ErrorType
								+ "\r\nmessage : " + json.ErrorMessage);
						}
					}
				}
				else if (json.Result == ajaxResultEnum.Redirect) {
					if ($.hasValue(json.Message) == true) {
						alert(json.Message); // redirect 전에 alert 을 띄운다.
					}
					top.document.location.href = json.RedirectUrl; // redirect 페이지로 이동
				}
				else {
					console.log('ajaxSerivce Result Problem ' + JSON.stringify(json));
				}
			},
			error: function (xhr, textStatus, errorThrown) {
				console.log("ajaxService " + textStatus + " " + errorThrown + "\r\n " + url + " " + xhr.responseText);
				try {
					var json = JSON.parse(xhr.responseText);
					if (json.Result == ajaxResultEnum.Error) {
						if (cbError) {
							cbError(json.StatusCode, json.ErrorType, json.ErrorMessage, printStackTrace());
						}
						else {
							// 
							if ($.hasValue(json.StatusCode) == true
								|| $.hasValue(json.ErrorType) == true
								|| $.hasValue(json.ErrorMessage) == true) {
								console.log("ajaxService error\r\ncode : " + json.StatusCode
									+ "\r\ntype : " + json.ErrorType
									+ "\r\nmessage : " + json.ErrorMessage);
							}
						}
					}
					else {

					}
				} catch (e) {
					if (cbError) {
						cbError(undefined, undefined, xhr.responseText, printStackTrace());
					}
					else {
						console.log("ajaxService catch error " + e);
						//						var model = {
						//							Message: "ajaxService " + xhr.responseText + " " + url + " " + JSON.stringify(model),
						//							Url: location.href,
						//							LineNo: "",
						//							StackTrace: ""
						//						}
						//						ajaxService.Post(clientErrorLoggingUrl, model);
					}
				}
			}
		});
	}
	, "PostAndRefresh": function (url, model, message) {
		ajaxService.Post(url
			, model
			, function () {
				if (message) {
					alert(message);
				}
				document.location.replace(document.location.href);
			});
	}
	, "PostAndRedirect": function (url, model, redirectUrl, message) {
		ajaxService.Post(url
			, model
			, function () {
				if (message) {
					alert(message);
				}
				document.location.replace(redirectUrl);
			});
	}
	, "PostClientScriptError": function (model) {
		// 로깅을 위해 jquery 의 cache disable timestamp 를 지움
		if (typeof model.Url != "undefiend") {
			var idx = model.Url.lastIndexOf("_=");
			if (idx > 1) {
				model.Url = model.Url.substring(0, idx - 1);
			}
		}

		var currentClientErrorMessage = JSON.stringify(model);
		if (currentClientErrorMessage != lastClientErrorMessage) {
			lastClientErrorMessage = currentClientErrorMessage;
			ajaxService.Post(clientErrorLoggingUrl, model);
		}
		else {
			// ignore 
			// console.log(currentClientErrorMessage);
		}
	}
}

var ajaxResultEnum = {
	"Success": 0,
	"Error": 1,
	"Redirect" : 2
};