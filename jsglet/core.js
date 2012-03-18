var jsglet = (function() {
    module = {
        error: Class.$extend({
            __init__: function() {
                this.message = Array.prototype.slice.call(arguments).join(' ');
                console.error(this.message);
            }
        })
    };
    return module;
}());
