var jsglet = (function() {
    module = {
        error: Class.$extend({
            __init__: function() {
                this.message = Array.prototype.slice.call(arguments).join(' ');
                console.error(this.message);
            }
        }),

        proxy: function(p_fn, p_this) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                return p_fn.apply(p_this, args);
            }
        }
    };
    return module;
}());
