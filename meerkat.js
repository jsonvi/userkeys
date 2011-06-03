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
    var logObj = document.getElementById("m_keyword");
    logObj.value = func;
    try {
        this[func].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    catch (e) {
        //alert(e) // pass exception object to error handler
    }
}

function frontController(evt) {

    var target = evt.target;
    if(target.__proto__ === HTMLInputElement.prototype ||
        target.__proto__ === HTMLTextAreaElement.prototype
    ) {
        if(27 === evt.keyCode) {
            target.blur();
        }
        // do nothing if the keypress event is come from a textarea or input element
    } else {
        evt.preventDefault();
        var keys = new ValidKeys();
        doAction(keys.getFuncName(evt.keyCode));
    }
}

// event handler for key '/' (keycode = 191)
function keyPress191() {
    var url = window.location;
    var re = /^http:\/\/weibo\.com\/k\//;
    var searchObj;
    if(re.test(url)) {
        // search result page
        searchObj = document.getElementById("sInput");
    } else {
        // other page
        searchObj = document.getElementById("m_keyword");
    }
    searchObj.focus();
}
document.body.addEventListener("keyup",frontController,false);

