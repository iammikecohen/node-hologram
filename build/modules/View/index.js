"use strict";
var fs = require('fs');
var Mkdirp = require('mkdirp');
var Handlebars = require('handlebars');
var View;
(function (View) {
    var default_1 = (function () {
        function default_1(dest) {
            this.dest = dest;
        }
        default_1.prototype.compile = function (context, layout) {
            return Handlebars.compile(layout)(context);
        };
        default_1.prototype.create = function (name, data, layout) {
            var _this = this;
            Mkdirp(this.dest, function (err) {
                if (err)
                    console.error(err);
                var filename = name === 'index' ? 'index.html' : name + "-example.html";
                fs.writeFileSync(_this.dest + "/" + filename, _this.compile(data, layout), 'utf8');
            });
        };
        return default_1;
    }());
    exports.default = default_1;
})(View || (View = {}));
//# sourceMappingURL=index.js.map