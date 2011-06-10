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

    var ActionState = function(){
        var states = {};
        return {
            initStates: function(_states,_keycode) {
                if(states[_keycode]) {
                    return;
                }
                states[_keycode] = {
                    stateIndex:0,
                    stateArray:_states
                };
            },
            getNextState:function(_keycode){
                var curState = states[_keycode];
                var result = curState.stateArray[curState.stateIndex];
                curState.stateIndex = ( curState.stateIndex + 1 ) % curState.stateArray.length;
                return result;
            } 
        } 
    };
    var actionState = new ActionState();
    
    var navigate = function(_match,_css,_isForward) {
        currentPos = currentPos + _isForward;
        var currentObj = $(_match+":eq("+currentPos+")");
        if($(currentObj).length>0) {
            var prevObj = $(_match+":eq("+(currentPos+(_isForward*-1))+")");
            if($(prevObj).length>0) {
                jQuery.each(_css, function(cssProperty,cssValue) {
                    var oldValue = $(currentObj).css(cssProperty);
                    $(prevObj).css(cssProperty,oldValue);
                });
            }
            jQuery.each(_css, function(cssProperty,cssValue) {
                $(currentObj).css(cssProperty,cssValue);
            });

            var _obj = $(currentObj).get()[0];
            _obj.focus();

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
                navigate(obj.actionMatch[0],obj.actionCss,1);
            } else if('prev' === obj.actionType) {
                navigate(obj.actionMatch[0],obj.actionCss,-1);
            } else if(0 === obj.isGlobal) {
                var matchStr = meerkatKeys.getNavMatch() + ":eq(" +currentPos +") ";
                if(1 === obj.actionMatch.length) {
                    matchStr = matchStr + obj.actionMatch[0];
                } else {
                    actionState.initStates(obj.actionMatch,obj.keyCode);
                    var stateStr = actionState.getNextState(obj.keyCode);
                    matchStr = matchStr + stateStr;
                }
                doAction(matchStr,obj.actionType);
            } else {
                var matchStr = '';
                if(1 === obj.actionMatch.length) {
                    matchStr = matchStr + obj.actionMatch[0];
                } else {
                    actionState.initStates(obj.actionMatch,obj.keyCode);
                    var stateStr = actionState.getNextState(obj.keyCode);
                    matchStr = matchStr + stateStr;
                }
                doAction(matchStr,obj.actionType);
            }
        }
    }
}

var MeerkatKeys = function() {
    var keyCodes = new Array();
    var keyJsons = new Array();
    var navMatch = "";
    var curDomain = document.domain;
    var curUrl = window.location;
        
    // get key settings
    chrome.extension.sendRequest({action:"getkeys"},function(response) {
            jQuery.each(response, function(l, val) {
                if(val.domain !== curDomain) {
                    return;
                } 
                jQuery.each(val.pages, function(o, pageVal) {
                    var re = new RegExp(pageVal.urlMatch);
                    if(re.test(curUrl)) {
                        // init new style
                        var sheet = document.createElement('style')
                        if(pageVal.defaultStyles) {
                            sheet.innerHTML = pageVal.defaultStyles;
                            document.body.appendChild(sheet);
                        }
                        // init actions
                        jQuery.each(pageVal.actions, function(i, actionVal) {
                            keyCodes.push(parseInt(actionVal.keyCode,10)); 
                            keyJsons.push(actionVal);
                            if("next" === actionVal.actionType) {
                                navMatch = actionVal.actionMatch;
                            }
                        });
                    }
                });
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

$(document).ready(function(){
    
$(":input").keydown(function(event) {
  if (event.keyCode == '27') {
     event.preventDefault();
     $(this).blur();
  }
});
    
});

document.addEventListener("keydown",frontController,true);
