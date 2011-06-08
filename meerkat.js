var currentPos = -1;

function runFunction(func){
    try {
        this[func].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    catch (e) {
        //alert(e) // pass exception object to error handler
    }
}

function frontController(evt) {

    var target = evt.target;
    if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) {
        return;
    }
    // preserve keys
    if(!meerkatKeys.hasKeyCode(evt.keyCode)) {
        return;
    }
    if(target.__proto__ === HTMLInputElement.prototype ||
        target.__proto__ === HTMLTextAreaElement.prototype
    ) {
        // preserve the default behavior when the keypress event is come from a textarea or input element, blur the element when 'ESC' key is pressed
        if(27 === evt.keyCode) {
            target.blur();
        }
    } else {
        evt.preventDefault();
        evt.stopPropagation();
        var name = meerkatKeys.getNameByKeyCode(evt.keyCode);
        runFunction("do"+name);
        console.log("name = "+name);
    }
}

function doAction(_obj,_type) {
    if ("click" === _type) {
        // trigger click action
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        _obj.dispatchEvent(evt);
    } else if ("focus" === _type) {
        //trigger focus action
        _obj.focus();
    }
}
// retweet
function doRt() {
    // find rt anchor
    // li.MIB_linedot_l:eq(0) div.rt > a:eq(0)
    var linkObj = $("li.MIB_linedot_l:eq("+currentPos+") div.rt > a > strong[lang='CD0023']").get()[0];
    doAction(linkObj,'click');
}
// comment
function doComment() {
    // find comment anchor
    var linkObj = $("li.MIB_linedot_l:eq("+currentPos+") div.rt > a > strong[lang='CL1004']").get()[0];
    doAction(linkObj,'click');
}
// favorite 
function doFav() {
    // find favorite anchor
    var linkObj = $("li.MIB_linedot_l:eq("+currentPos+") div.rt > a > strong[lang='CL1003']").get()[0];
    doAction(linkObj,'click');
}
// search 
function doSearch() {
    var searchObj = $("#m_keyword").get()[0];
    doAction(searchObj,'focus');
}
// new
function doNew() {
    var searchObj = $("#publish_editor").get()[0];
    doAction(searchObj,'focus');
}
function doPrev() {
    navigate(-1);
}
function doNext() {
    navigate(1);
}
function navigate(_isForward) {
    currentPos = currentPos + _isForward;
    var currentObj = $("li.MIB_linedot_l:eq("+currentPos+")");
    if($(currentObj).length>0) {
        var prevObj = $("li.MIB_linedot_l:eq("+(currentPos+(_isForward*-1))+")");
        if($(prevObj).length>0) {
            $(prevObj).removeClass("MeerKatCurrent");
        }
        $(currentObj).addClass("MeerKatCurrent");
        $(currentObj).focus();

        var top = (document.documentElement.scrollTop ? 
                document.documentElement.scrollTop :
                document.body.scrollTop);

        var coverage = window.innerHeight + top;

        var elementBottom = $(currentObj).offset().top + $(currentObj).height();

        if( coverage < elementBottom ) {
            $('html, body').scrollTop($(currentObj).offset().top);
        }
        if(top > $(currentObj).offset().top) {
            $('html, body').scrollTop($(currentObj).offset().top);
        }


    } else {
        currentPos = currentPos - _isForward;
    }

}

var MeerkatKeys = function() {
    var keyCodes = new Array();
    var keyChars = new Array();
    var keyNames = new Array();

    chrome.extension.sendRequest({action:"getkeys"},function(response) {
            var keysObj = response.keys;
            jQuery.each(keysObj, function(i, val) {
                var charCodeArr = val.split("_");
                keyCodes[keyCodes.length] = parseInt(charCodeArr[1],10); 
                keyChars[keyChars.length] = charCodeArr[0];
                keyNames[keyNames.length] = i;
            });
    }); 


    return {
        hasKeyCode: function(_keyCode) {
            var keyCodeIndex = keyCodes.indexOf(_keyCode);
            var result = (keyCodeIndex >= 0);
            return result;
        },
        getNameByKeyCode:function(_keyCode) {
            var nameIndex = keyCodes.indexOf(_keyCode);
            return keyNames[nameIndex];
        }
    }
}

var meerkatKeys = new MeerkatKeys();
document.body.addEventListener("keydown",frontController,true);
