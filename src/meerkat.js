function frontController(evt) {

    var target = evt.target;

    if(target.__proto__ === HTMLInputElement.prototype ||
            target.__proto__ === HTMLTextAreaElement.prototype
      ) {
        // preserve the default behavior when the keypress event is come from a textarea or input element, blur the element when 'ESC' key is pressed
        if(27 === evt.keyCode) {
            target.blur();
        }
    } else {
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) {
            // toggle help ui using '?' key
            if(evt.shiftKey && 191 === evt.keyCode && meerkatKeys.hasKey(evt)) {
                if(!meerkatUI.isHelpOn()) {
                    meerkatUI.showHelp();
                } else {
                    meerkatUI.closeHelp();
                }
            }
            return;
        }

        // close help ui using 'ESC' key
        if (27 === evt.keyCode) {
            meerkatUI.closeHelp();
        }
        // preserve keys
        if(!meerkatKeys.hasKey(evt)) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        meerkat.runByKeyEvent(evt);
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

            $(currentObj).trigger('mouseenter');

            var _obj = $(currentObj).get()[0];
            _obj.focus();

            var top = (document.documentElement.scrollTop ? 
                    document.documentElement.scrollTop :
                    document.body.scrollTop);

            var coverage = window.innerHeight + top;

            var elementBottom = $(currentObj).offset().top + $(currentObj).height();

            $('html, body').scrollTop($(currentObj).offset().top - window.innerHeight/3);

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
        $('html, body').scrollTop($(_match).offset().top - 200);
    };


    return {
runByKeyEvent:function(_evt) {
                  var obj = meerkatKeys.getActionByKey(_evt);
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
    var specialKeys = {
8: "backspace", 9: "tab", 13: "return", 19: "pause",
   20: "capslock", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
   37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
   48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7",
   56: "8", 57: "9", 186:";",  187: "=", 188: ",", 189: "-", 190: ".", 191 : "/", 192 : "`", 
   219: "[", 221: "]",
   220: "\\",
   112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
   120: "f9", 121: "f10", 122: "f11", 123: "f12", 12: "numlock" 
    };

    var keyChars = new Array();
    var keyJsons = new Array();
    var navMatch = "";
    var curUrl = window.location;
    var curDomain = curUrl.hostname;

    // get key settings
    chrome.extension.sendRequest({action:"getkeys",domain:curDomain},function(response) {

            if(!response) {
            return;
            }
            jQuery.each(response.pages, function(o, pageVal) {
                var re = new RegExp(pageVal.urlMatch);
                if(re.test(curUrl)) {
                // init new style
                var sheet = document.createElement('style')
                if(pageVal.defaultStyles) {
                sheet.innerHTML = pageVal.defaultStyles;
                $(document).ready(function(){
                    $("body").append(sheet); 
                    });
                }
                // init actions
                jQuery.each(pageVal.actions, function(i, actionVal) {
                    keyChars.push(actionVal.keyChar.toLowerCase());
                    keyJsons.push(actionVal);
                    if("next" === actionVal.actionType) {
                    navMatch = actionVal.actionMatch;
                    }
                    });

                }
            });


    }); 

    var getKeyIndex = function(_evt) {
        var keyChar = '';
        if(specialKeys[_evt.which]) {
            keyChar = specialKeys[_evt.which];
        } else {
            keyChar = String.fromCharCode(_evt.which).toLowerCase()
        }
        return keyChars.indexOf(keyChar);
    };

    return {
getNavMatch:function() {
                return navMatch;
            },
hasKey: function(_event) {
            var keyIndex = getKeyIndex(_event);
            var result = (keyIndex >= 0);
            return result;
        },
getActionByKey:function(_event) {
                   var i = getKeyIndex(_event);
                   return keyJsons[i];    
               },
getAllKeys: function() {
                return keyJsons;
            }
    }
}
var MeerkatUI = function() {
    var helpHtml = "<div class='jqmWindow' id='MeerkatHelp'></div>";

    $(document).ready(function() {
            $("body").append(helpHtml);
            $('#MeerkatHelp').jqm({overlay:20});
            });

    return {
isHelpOn: function() {
              return ("block" === $("#MeerkatHelp").css("display"));
          },
closeHelp: function() {
               if(this.isHelpOn()) {
                   $("#MeerkatHelp").jqmHide();
               }
           },
showHelp: function() {
              var allKeys = meerkatKeys.getAllKeys(); 
              var allKeysHtml = "<div class='content'>";
              allKeysHtml += "<h2>UserKeys Shorcuts</h2>";
              allKeysHtml += "<ul>";
              jQuery.each(allKeys, function(keyIndex,keyValue) {
                      var keyDesc = keyValue.actionDesc?keyValue.actionDesc:"";
                      var keyName = keyValue.actionName?("<span class='actionName'> :"+keyValue.actionName+" </span>"):"";
                      var keyHtml = 
                      "<li><span>" +
                      keyValue.keyChar +
                      "</span> " +
                      keyDesc +
                      keyName +
                      "</li>";
                      allKeysHtml += keyHtml;
                      });
              allKeysHtml += "</ul>";
              allKeysHtml += "</div>";
              $("#MeerkatHelp").html(allKeysHtml).jqmShow();
          } 
    }
};

var meerkatUI = new MeerkatUI();
var meerkatKeys = new MeerkatKeys();
var meerkat = new Meerkat();

document.addEventListener("keydown",frontController,true);
