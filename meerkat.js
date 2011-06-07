var ValidKeys = function(){
    return {
        getFuncName:function(charCode){
            var charStr = String.fromCharCode(charCode);
            charStr = charStr.toUpperCase();
            var funcPrefix = "keyPress";
            var re = /[A-Z]/;
            var returnStr = '';
            if (!re.test(charStr)) {
                return funcPrefix + charCode;
            } else {
                return funcPrefix + charStr;
            }
        } 
    }
};

var currentPos = -1;

function doAction (func){
    //$("#MeerKatNoticeBar").text(func);

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
        return
    }
    if (evt.keyCode === 9) {
        return;
    }
    if(target.__proto__ === HTMLInputElement.prototype ||
        target.__proto__ === HTMLTextAreaElement.prototype
    ) {
        if(27 === evt.keyCode) {
            target.blur();
        }
        // do nothing if the keypress event is come from a textarea or input element
    } else {
        evt.preventDefault();
        evt.stopPropagation();
        chrome.extension.sendRequest({action:"getkeys"},function(response) {
            //alert(response.newKey);
            var keysObj = response.keys;
            newKey = keysObj.newKey.split("_");
            nextKey = keysObj.nextKey.split("_");
            var keyCodeStr = ""+ evt.keyCode;
            switch (keyCodeStr) {
                case newKey[1]:
                    alert('new');
                    break;
                case nextKey[1]:
                    goNext();
                    break;
                default:
                    break;
            }
        }); 
        var keys = new ValidKeys();
        doAction(keys.getFuncName(evt.keyCode));
    }
}

var DebugMessage = '';
function log(_str) {
    if("undefined" !== console) {
        console.log(_str);
    }
    DebugMessage = DebugMessage + " " +_str+ " ";
}
function goNext() {

    currentPos = currentPos + 1;
    var currentObj = $(".MIB_linedot_l:eq("+currentPos+")");
    if(currentPos > 0) {
        var prevObj = $(".MIB_linedot_l:eq("+(currentPos-1)+")");
        $(prevObj).removeClass("MeerKatCurrent");
    } 
    $(currentObj).addClass("MeerKatCurrent");
    $(currentObj).focus();

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
      var scrollRange = elementBottom - coverage + top + 20;
      log('S:'+scrollRange);
      $('html, body').scrollTop(scrollRange);
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
// event handler for key '/' (keycode = 191)
function keyPress191() {
    var url = window.location;
    var re = /^http:\/\/weibo\.com\/k\//;
    if(re.test(url)) {
        // search result page
        $("#sInput").focus();
    } else {
        // other page
        $("#m_keyword").focus();
    }
    searchObj.focus();
}

document.body.addEventListener("keydown",frontController,true);
initUI();
