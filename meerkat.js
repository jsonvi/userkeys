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
        meerkat.runByKeyCode(evt.keyCode);
    }
}

var Meerkat = function() {

    var currentPos = -1;
    var runFunction = function(func){
        try {
            this[func].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        catch (e) {
            //alert(e) // pass exception object to error handler
        }
    };
    
    var navigate = function(_match,_isForward) {
        currentPos = currentPos + _isForward;
        var currentObj = $(_match+":eq("+currentPos+")");
        if($(currentObj).length>0) {
            var prevObj = $(_match+":eq("+(currentPos+(_isForward*-1))+")");
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

    };
     var doAction = function(_match,_type) {
        if ("click" === _type) {
            // trigger click action
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            var obj = $(""+_match).get()[0];
            obj.dispatchEvent(evt);
        } else if ("focus" === _type) {
            //trigger focus action
            var obj = $(""+_match).get()[0];
            obj.focus();
        }
    };
    
    return {
        runByKeyCode:function(_keyCode) {
            var obj = meerkatKeys.getJsonByKeyCode(_keyCode);
            if('next' === obj.actionType) {
                navigate(obj.actionMatch,1);
            } else if('prev' === obj.actionType) {
                navigate(obj.actionMatch,-1);
            } else if(0 === obj.isGlobal) {
                var matchStr = meerkatKeys.getNavMatch() + ":eq(" +currentPos +") " + obj.actionMatch;
                doAction(matchStr,obj.actionType);
            } else {
                doAction(obj.actionMatch,obj.actionType);
            }
        }
    }
}

var MeerkatKeys = function() {
    var keyCodes = new Array();
    var keyJsons = new Array();
    var navMatch = "";
    
    // get key settings
    chrome.extension.sendRequest({action:"getkeys"},function(response) {
            var keysObj = response;
            jQuery.each(keysObj, function(i, val) {
                keyCodes[i] = parseInt(val.keyCode,10); 
                keyJsons[i] = val;
                if("next" === val.actionType) {
                    navMatch = val.actionMatch;
                }
            });
    }); 

    return {
        getNavMatch:function() {
            return navMatch;
        },
        hasKeyCode: function(_keyCode) {
            var keyCodeIndex = keyCodes.indexOf(_keyCode);
            var result = (keyCodeIndex >= 0);
            return result;
        },
        getJsonByKeyCode:function(_keyCode) {
            var i = keyCodes.indexOf(_keyCode);
            return keyJsons[i];    
        }
    }
}

var meerkatKeys = new MeerkatKeys();
var meerkat = new Meerkat();
document.body.addEventListener("keydown",frontController,true);
