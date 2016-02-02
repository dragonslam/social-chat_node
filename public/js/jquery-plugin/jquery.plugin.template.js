(function ($) {

    //--{{ create postData Form with model --//
	$.fn.postDataForm = function (options) {
		var settings = $.extend({}, {}, options);

		var formId = settings.id;
		var formModel = settings.model;
		var action = settings.action;
		var target = settings.target;

		this.append('<form id="' + formId + '" name="' + formId + '"></form>');
		$('#' + formId).append('<input type=hidden name=postData />')
		$('#' + formId).find('[name="postData"]').val(JSON.stringify(formModel));
		$('#' + formId).attr('action', action)
				.attr('target', target)
				.attr('method', 'POST')
		$('#' + formId)[0].submit();
	}
	//-}}{ create postModel form from model --//

	//--{{ javascript 템플릿 --//
	$.fn.render = function (options) {
		// settings 설정
		var settings = $.extend({}, { append: false, wrap: 'span' }, options);

		// append 가 아니면 기존 element 모두 삭제
		if (settings.append == false) this.html("");

		var result = $.processRender(settings.template
			, settings.model
			, settings.subTemplate);

		// for performance use createDocumentFragment					
		var wrap = document.createElement(settings.wrap);
		wrap.innerHTML = result;

		var frag = document.createDocumentFragment();
		frag.appendChild(wrap);

		document.getElementById(this.attr('id')).appendChild(frag);

		return this;
	}

	$.processRender = function (tid, obj, subTemplate) {
		// Leave whitespaces such as newline and space in template string. Don't trim them.
		var tmpl = $('#' + tid).html()

		// obj 가 array 인 경우와 아닌 경우로 구분
		if ($.isArray(obj) == false) {
			return $.processTemplate(tmpl, obj, subTemplate);
		}
		else {
			var result = "";
			$.each(obj, function (k, v) {
				result += $.processTemplate(tmpl, v, subTemplate);
			});
			return result;
		}
	}

	$.processTemplate = function (tmpl, obj, subTemplate) {
		return tmpl.replace(/\{\{([\w:.]+)\}\}/g, function (str, prop) {

			// formatter 여부 체크
			var tokens = prop.split(':');
			var p = tokens[0];
			var f = tokens.length == 2 ? tokens[1] : undefined;

			if (obj.hasOwnProperty(p) == true) {
				// obj[prop] 이 array 여부로 구분
				if ($.isArray(obj[p]) == false) {
					if (!f) {
						return obj[p];
					}
					else {
						return eval(f).call(null, obj[p], null); // fix for escaping quote in argument
					}
				}
				else {
					return $.processRender(subTemplate[p], obj[p], subTemplate);
				}
			}
			else {
				return "";
			}
		});
	}
	//--}} javascript 템플릿 --//

	//--{{ 레이어 팝업 --//
	$.fn.popLayer = function (options) {
		// settings 설정
		var settings = $.extend({}, {
			close: this.attr('id')
		}, options);

		// reference current jquery object
		$this = this;

		$('body').append($this); // layer 의 z-index 가 ie7 이하에서 제대로 적용되도록 body 의 child 로 만든다.

		// save scrollTop
		$.saveScrollTop();

		// create overlay
		var overlay = $('<div/>')
				.attr("id", "overlay")
				.css('background-color', '#000')
			    .css('opacity', '.7')
			    .css('filter', 'alpha(opacity=70')
			    .css('position', 'fixed')
				.css('top', '0')
				.css('left', '0')
			    .css('width', '100%')
				.css('height', '100%')
			    .css('z-index', 20000)
				.appendTo($('body'))
				.click(function () {
					$this.closeLayer(options); // IE6,IE7 에서 overlay 가 popup layer 를 가리기 때문에 닫기 위해서 설정함
				});

		// resize						
		if (settings.width) {
			this.css('width', settings.width);
		}
		if (settings.height) {
			this.css('height', settings.height);
		}

		// show layer
		this.css('display', 'block')
			.css('background-color', '#FFF'); // 기본적으로 흰색 배경을 준다.

		// center
		this.center();

		// iframe loading
		if (settings.iframe) {

			// show iframe 
			this.find('#' + settings.iframe)
				.css('display', 'block')
				.css('width', settings.width)
				.css('height', settings.height)
				.attr('frameborder', 0)
				.attr('scrolling', 'no');

			// iframe 에서 layer 를 닫기위해 layerId 와 iframeId 를 querystring 으로 전달한다.
			var src = settings.iframeSrc
			if (src.indexOf('?') == -1) {
				src += '?_layerId=' + this.attr('id') + '&_iframeId=' + settings.iframe;
			}
			else {
				src += '&_layerId=' + this.attr('id') + '&_iframeId=' + settings.iframe;
			}

			// assign iframeModel 
			if (settings.iframeModel) {
				// create iframeForm
				if (!$('#iframeForm')[0]) {
					$('body').append('<form id="iframeForm"></form>');
					$('#iframeForm').append('<input type=hidden name=postData />')
				}
				$('#iframeForm').find('[name="postData"]').val(JSON.stringify(settings.iframeModel));

				$('#iframeForm').attr('action', src)
				.attr('target', settings.iframe)
				.attr('method', 'POST')

				$('#iframeForm')[0].submit();
			}
			else {
				this.find('#' + settings.iframe)
					.attr("src", src);
			}
		}

		// set close event		
		$('#' + settings.close).click(function () {
			$('#' + $this.attr('id')).closeLayer({
				iframe: settings.iframe
			});
		});
	}

	$.fn.closeLayer = function (options) {
		var settings = $.extend({}, {}, options);

		if (settings.iframe) {
			$(this).find('#' + settings.iframe)
				.attr("src", "about:blank")
				.css('display', 'none')
		}
		// hide layer
		$(this).css('display', 'none');
		// remove overlay
		$('#overlay').remove();

		// restore scrollTop
		$.restoreScrollTop();
	}

	$.closeLayer = function (layerId, iframeId) {
		$('#' + layerId).closeLayer({
			iframe: iframeId
		});
	}

	$.closeParentLayer = function () {
		parent.$.closeLayer($.getParameter('_layerId'), $.getParameter('_iframeId'));
	}

	$.getParameter = function (name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\#?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search != "" ? window.location.search : window.location.hash);
		if (results == null)
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	//--}} 레이어 팝업 --//

	//--{{스크롤 위치 저장/복원 --//	
	$.saveScrollTop = function () {
		window.prevScrollTop = $(window).scrollTop();
	}

	$.restoreScrollTop = function () {
		$(window).scrollTop(window.prevScrollTop);
	}
	//--}} 스크롤 위치 저장/복원 --//

	//--{{ 레이어 중앙정렬 --//
	$.fn.center = function () {
		this.css("position", "fixed");
		this.css("top", "50%");
		this.css("margin-top", "-" + parseInt(this.css('height')) / 2 + "px");
		this.css("left", Math.max(0, ($(window).width() - parseInt(this.css('width'))) / 2 + $(window).scrollLeft()) + "px");
		this.css("z-index", 20001);
		return this;
	}
	//--}} 레이어 중앙정렬 --//

	//--{{ 최상위 페이지 이동 --//
	$.goto = function (url) {
		if (window != top) {
			top.location = url;
		}
		else {
			location = url;
		}
	}
	//--}} 최상위 페이지 이동 --//

	//--{{ 팝업 윈도우 --//
	$.popup = function (url, width, height) {
		var windowProperties = "toolbar = 0, scrollbars = 1, location = 0, statusbar = 0, menubar = 0, resizable = 1, width = " + width + ", height = " + height + ", left = 50, top = 50";
		return window.open(url, "", windowProperties);
	}
	//--}} 팝업 윈도우 --//

	//--{{ 변수의 값 존재유무 체크 --//
	$.hasValue = function (v) {
		if (typeof v == 'undefined') {
			return false;
		}
		else if (v == null) {
			return false;
		}
		else if (typeof v == 'string') {
			if (v.length == 0)
				return false;
			else
				return true;
		}
		else {
			return true; // ignore other type
		}
	}
	//--}} 변수의 값 존재유무 체크 --//

	//--{{ 이메일 주소 체크 --// 
	$.emailCheck = function (email) {
		if ($.hasValue(email) == false) {
			alert("이메일 주소를 입력하세요.");
			return false;
		}

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(email) == false) {
			alert("올바르지 않은 이메일 주소입니다. 다시 입력해 주세요.");
			return false;
		}

		if ($.sTextByteLen(email) > 50) {
			alert("이메일 주소가 너무 길어 입력이 되지 않습니다. 다른 이메일 주소를 선택하여 주십시오.");
			return false;
		}

		var tokens = email.split('@');
		var emailDomain = tokens[1];
		if (emailDomain.indexOf("never.com") > -1 || emailDomain.indexOf("gmarket.co.kr") > -1) {
			alert("등록이 불가능한 이메일 주소입니다. \nnever.com, gmarket.co.kr 외에 다른 이메일 주소를 입력해주세요");			
			return false;
		}

		return true;
	}

	$.sTextByteLen = function(sText) {
		var sTextLen = 0;

		for (var i = 0; i < sText.length; i++) {
			if (sText.charCodeAt(i) > 128) {
				sTextLen += 2;
			}
			else {
				sTextLen += 1;
			}
		}
		return sTextLen;
	}
	//--}} 이메일 주소 체크 --//

	//--{{ 쿠키 삭제하기 --//
	$.deleteCookie = function(c_name) {
		document.cookie = encodeURIComponent(c_name) + "=deleted; expires=" + new Date(0).toUTCString();
	}
	//--}} 쿠키 삭제하기 --//
})(jQuery);	