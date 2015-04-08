if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
if (!document.addEventListener) {
    (function(win, doc){
        if(win.addEventListener)return;     //No need to polyfill

        function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
        function addEvent(on, fn, self){
            return (self = this).attachEvent('on' + on, function(e){
                var e = e || win.event;
                e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
                e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
                fn.call(self, e);
            });
        }
        function addListen(obj, i){
            if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
            else obj.addEventListener = addEvent;
            return obj;
        }

        addListen([doc, win]);
        if('Element' in win)win.Element.prototype.addEventListener = addEvent;          //IE8
        else{                                                                           //IE < 8
            doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});      //Make sure we also init at domReady
            docHijack('getElementsByTagName');
            docHijack('getElementById');
            docHijack('createElement');
            addListen(doc.all); 
        }
    })(window, document);
}