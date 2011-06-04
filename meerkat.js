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
function doAction (func){
    $("#MeerKatNoticeBar").text(func);

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
        var keys = new ValidKeys();
        doAction(keys.getFuncName(evt.keyCode));
    }
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
