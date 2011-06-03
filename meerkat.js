function frontController(evt) {

    var target = evt.target;
    if(target.__proto__ === HTMLInputElement.prototype ||
        target.__proto__ === HTMLTextAreaElement.prototype
    ) {
        // do nothing if the keypress event is come from a textarea or input element
    } else {
        evt.preventDefault();
        var charCode = evt.charCode;
        var charStr = String.fromCharCode(charCode);
        alert(charStr);
    }
}

document.body.addEventListener("keypress",frontController,false);

