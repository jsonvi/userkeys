var currentPos = -1;
var DebugMessage = '';

function frontController(evt) {

    var target = evt.target;
    if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey) {
        return;
    }
    // preserve the 'TAB' key
    if (evt.keyCode === 9) {
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
        chrome.extension.sendRequest({action:"getkeys"},function(response) {
            var keysObj = response.keys;
            newKey = keysObj.newKey.split("_");
            nextKey = keysObj.nextKey.split("_");
            prevKey = keysObj.prevKey.split("_");
            rtKey = keysObj.rtKey.split("_")
            
            var keyCodeStr = ""+ evt.keyCode;
            switch (keyCodeStr) {
                case newKey[1]:
                    alert('new');
                    break;
                case nextKey[1]:
                    goNext();
                    break;
                case prevKey[1]:
                    goPrev();
                    break;
                case rtKey[1]:
                    rt();
                    break;
                default:
                    break;
            }
        }); 
    }
}

function log(_str) {
    if("undefined" !== console) {
        console.log(_str);
    }
    DebugMessage = DebugMessage + " " +_str+ " ";
}
// retweet
function rt() {
    // find rt anchor
    var currentObj = $("li.MIB_linedot_l:eq("+currentPos+")");
    var defaultBtn = $(currentObj).find("div.rt").find("a").first();
    $(defaultBtn).css("border","solid 1px red");

    // trigger click action
    var linkObj = $(defaultBtn).get()[0];
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    linkObj.dispatchEvent(evt);
}
function goPrev() {
    navigate(-1);
}
function goNext() {
    navigate(1);
}
function navigate(_isForward) {
    currentPos = currentPos + _isForward;
    log("navPos:"+currentPos);
    var currentObj = $("li.MIB_linedot_l:eq("+currentPos+")");
    if($(currentObj).length>0) {
        var prevObj = $("li.MIB_linedot_l:eq("+(currentPos+(_isForward*-1))+")");
        if($(prevObj).length>0) {
            $(prevObj).removeClass("MeerKatCurrent");
        }
        $(currentObj).addClass("MeerKatCurrent");

        var top = (document.documentElement.scrollTop ? 
                document.documentElement.scrollTop :
                document.body.scrollTop);

        var coverage = window.innerHeight + top;
        log('W:'+window.innerHeight);
        log('UP:'+top);
        log('WUP:'+coverage);

        var elementBottom = $(currentObj).offset().top + $(currentObj).height();

        log('ET:'+$(currentObj).offset().top);
        log('EH:'+$(currentObj).height());
        log('EB:'+elementBottom);


        if( coverage < elementBottom ) {
            $('html, body').scrollTop($(currentObj).offset().top);
        }
        if(top > $(currentObj).offset().top) {
            $('html, body').scrollTop($(currentObj).offset().top);
        }


    } else {
        log("cannot find");
        currentPos = currentPos - _isForward;
    }

    $("#MeerKatNoticeBar").text(DebugMessage);
    DebugMessage = '';
    
}
function initUI() {
    var noticeBar = document.createElement("div");
    noticeBar.setAttribute("id","MeerKatNoticeBar");
    var postionLeft = window.innerWidth/2 - 100;
    document.body.appendChild(noticeBar);
    noticeBar.style.left = postionLeft + "px";
}

document.body.addEventListener("keydown",frontController,true);
initUI();
