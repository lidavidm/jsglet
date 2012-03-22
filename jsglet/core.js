var module = (function() {
    var internals = {

        modules: {},
        loading: [],

        isLoaded: function(p_name) {
            var names = internals.parseModuleName(p_name);
            var root = internals.modules;
            for (var i = 0; i < names.length; i++) {
                if (!_.has(root, names[i])) {
                    return false;
                }
                root = root[names[i]];
            }
            return true;
        },

        loadModule: function(p_name) {
            var names = internals.parseModuleName(p_name);
            $.getScript(names[0] + "/" + names.slice(1).join('.') + '.js')
            internals.loading.push(p_name);
        },

        finishLoadingModules: function(p_ignore, p_finished, p_result) {
            if (internals.loading.length > 1 &&
                internals.loading[0] != p_ignore) {
                setTimeout(function() {
                    internals.finishLoadingModules(p_ignore, p_finished, p_result);
                }, 1000);
            }
            else {
                p_finished.call(p_result, p_result);
            }
        },

        parseModuleName: function(p_name) {
            return p_name.split('.');
        },

        createModule: function(p_name, p_deps, p_module) {
            internals.loading.push(p_name);
            _.each(p_deps, function(dep) {
                if (!internals.isLoaded(dep)) {
                    internals.loadModule(dep);
                }
            });

            var output = {};
            internals.finishLoadingModules(p_name, function(output) {
                var mod = p_module.call(window);
                var root = internals.modules;
                var names = internals.parseModuleName(p_name);

                for (var i = 0; i < names.length - 1; i++) {
                    if (!_.has(root, names[i])) {
                        root[names[i]] = {};
                    }
                    root = root[names[i]];
                }
                root[names[names.length - 1]] = mod;
                console.log(internals.modules);
                internals.loading = _.reject(
                    internals.loading,
                    function(x) { return x == p_name; }
                );
                output.module = mod;
            }, output);

            return output.module;
        }
    };

    _.extend(internals.createModule, internals);

    return internals.createModule;
}());

var jsglet = module('jsglet', [], function() {
    var module = {
        core: {}, // for the dependency checker

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
            },

            uncapitalize: function(p_str) {
                return p_str.charAt(0).toLowerCase() + p_str.slice(1);
            }
        }
    };
    return module;
});
$(document).ready(function (){
    module.loadModule('jsglet.event');
})
