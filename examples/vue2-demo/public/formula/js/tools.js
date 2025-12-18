// 向编辑框插入内容的方法
$.fn.extend({
  insertContent: function (myValue, t) {
    var $t = $(this)[0];
    if (document.selection) {
      // ie
      this.focus();
      var sel = document.selection.createRange();
      sel.text = myValue;
      this.focus();
      sel.moveStart("character", -l);
      var wee = sel.text.length;
      if (arguments.length == 2) {
        var l = $t.value.length;
        sel.moveEnd("character", wee + t);
        t <= 0 ? sel.moveStart("character", wee - 2 * t - myValue.length) : sel.moveStart("character", wee - t - myValue.length);
        sel.select();
      }
    } else if ($t.selectionStart || $t.selectionStart == "0") {
      var startPos = $t.selectionStart;
      var endPos = $t.selectionEnd;
      var scrollTop = $t.scrollTop;
      $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
      this.focus();
      $t.selectionStart = startPos + myValue.length;
      $t.selectionEnd = startPos + myValue.length;
      $t.scrollTop = scrollTop;
      if (arguments.length == 2) {
        $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
        this.focus();
      }
    } else {
      this.value += myValue;
      this.focus();
    }
  }
});

function setCookie(c_name, value, expiredays, path, domain) {
  // domain只能设置为当前域名的更高级域名，
  // 如：在www.tongshike.cn中可以设置为.tongshike.cn而不能设置为ua.tongshike.cn
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie =
    c_name +
    "=" +
    escape(value) +
    (expiredays == null ? "" : "; expires=" + exdate.toGMTString()) +
    (path == null ? "" : "; path=" + escape(path)) +
    (domain == null ? "" : "; domain=" + escape(domain));
}

function getCookie(c_name) {
  if (document.cookie.length > 0) {
    var c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      var c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return "";
}

function getConfig(index, i18nMsg) {
  if (index == 1) {
    return i18nMsg.symbols;
  } else if (index == 2) {
    return i18nMsg.formulas;
  } else {
    return i18nMsg.subjects;
  }
}

function getLocale() {
  var lang = getCookie("lang") || navigator.language || navigator.browserLanguage;
  if (navigator.userAgent.indexOf("umoocApp") !== -1) {
    var ua = window.navigator.userAgent.indexOf("-language-") != -1 ? window.navigator.userAgent : "";
    var start = ua.indexOf("-language-") + "-language-".length;
    var end = ua.indexOf(" ", start);
    end = end == -1 ? ua.length : end;

    try {
      lang = ua.substring(start, end) || navigator.language || navigator.browserLanguage;
    } catch (e) {
      lang = navigator.language || navigator.browserLanguage;
    }
  }
  lang = lang.toLowerCase();
  var map = {
    hk: "tw"
  };
  var en = "en";
  var zh = "zh";
  var langId = "";
  var langIds = [zh, en, "tw", "id", "hk", "es", 'ar', 'th'];
  for (var i = 0; i < langIds.length; i++) {
    if (lang.indexOf(langIds[i]) > -1) {
      langId = langIds[i];
      break;
    }
  }
  if (!langId) {
    langId = zh;
  }
  langId = map[langId] || langId;
  return langId;
}

function getI18nMsg(locale, success, fail) {
  $.ajax({
    url: "locales/" + locale + ".json",
    dataType: "json",
    success: function (data) {
      success && success(data);
    },
    error: function (error) {
      fail && fail(error);
    }
  });
}
