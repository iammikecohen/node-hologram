"use strict";
var fs = require('fs');
var Mkdirp = require('mkdirp');
var Handlebars = require('handlebars');
var path = require('path');
var View = (function () {
    function View(dest) {
        this.dest = dest;
    }
    View.prototype.compile = function (context, layout) {
        return Handlebars.compile(layout)(context);
    };
    View.prototype.create = function (name, data, layout) {
        var _this = this;
        Mkdirp(this.dest, function (err) {
            if (err) {
                console.error(err);
            }
            var filename = name === 'index' ? 'index.html' : name + "-example.html";
            fs.writeFileSync(path.join(_this.dest, filename), _this.compile(data, layout), 'utf8');
        });
    };
    return View;
}());
exports.View = View;
//# sourceMappingURL=index.js.map