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
        },

        property: function(p_name, p_fns) {
            var fn_get = p_fns["get"] != "default" ? p_fns["get"] :
                function() {
                    return this["_" + p_name];
                };
            var fn_set = p_fns["set"] != "default" ? p_fns["set"] :
                function(p_args) {
                    this["_" + p_name] = p_args;
                };

            return function() {
                var args = Array.prototype.slice.call(arguments);

                if (args.length) {
                    fn_set.apply(this, args);
                }
                else {
                    return fn_get.apply(this);
                }
            };
        },

        propertyDelta: function(p_name, p_useProp) {
            return function(p_delta) {
                if (p_useProp) {
                    this[p_name](this[p_name]() + p_delta);
                }
                else {
                    this[p_name] += p_delta;
                }
            };
        },

        util: {
            capitalize: function(p_str) {
                return p_str.charAt(0).toUpperCase() + p_str.slice(1);
            }
        }
    };
    return module;
}());
