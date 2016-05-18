"use strict";
var fs = require('fs');
var Data;
(function (Data) {
    var Search = require('recursive-search');
    var Marked = require('meta-marked');
    Marked.setOptions({
        renderer: new Marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    });
    var default_1 = (function () {
        function default_1(root) {
            this.root = root;
            this.exampleRegex = /<example>[^*]+([^*]+)<\/example>/;
        }
        default_1.prototype.moveArrayItem = function (array, value, newIndex) {
            var oldIndex = array.indexOf(value);
            if (oldIndex > -1) {
                if (newIndex < 0) {
                    newIndex = 0;
                }
                else if (newIndex >= array.length) {
                    newIndex = array.length;
                }
                var arrayClone = array.slice();
                arrayClone.splice(oldIndex, 1);
                arrayClone.splice(newIndex, 0, value);
                return arrayClone;
            }
            return array;
        };
        default_1.prototype.exampleTemplate = function (name) {
            return ("\n                <iframe class='hologram-styleguide__item-example' \n                        src='./" + name + "-example.html' frameborder='0' \n                        scrolling='no' onload='resizeIframe(this)'>\n                </iframe>").trim();
        };
        default_1.prototype.extractExample = function (s) {
            if (s.match(this.exampleRegex)) {
                var temp = s.match(this.exampleRegex)[0].split('\n');
                temp.splice(0, 1);
                temp.pop();
                return temp
                    .map(function (x) { return x.trim(); })
                    .join('');
            }
            else {
                return '';
            }
        };
        default_1.prototype.insertExample = function (s, name) {
            if (s.match(this.exampleRegex)) {
                return s.replace(this.exampleRegex, this.exampleTemplate(name));
            }
            else {
                return s;
            }
        };
        default_1.prototype.extractContent = function (s) {
            try {
                return s
                    .match(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//)[0]
                    .replace(/\/\*(.*?)\\*\//g, '')
                    .split('\n');
            }
            catch (e) {
                return [];
            }
        };
        default_1.prototype.getName = function (name) {
            var split = name.split('.');
            split.pop();
            return split.join('-');
        };
        default_1.prototype.setOrder = function (data) {
            var _this = this;
            var newData = data;
            data
                .filter(function (x) { return x.meta; })
                .filter(function (x) { return x.meta.order; })
                .map(function (x) {
                newData = _this.moveArrayItem(newData, x, x.meta.order - 1);
            });
            return newData;
        };
        default_1.prototype.get = function (directories, ext) {
            var _this = this;
            var data = [];
            directories.map(function (directory) {
                Search.recursiveSearchSync('*', _this.root + directory)
                    .map(function (file) {
                    var formattedFile = file.split('/').pop();
                    if (ext === formattedFile.split('.').pop()) {
                        var content = _this.extractContent(fs.readFileSync(file, 'utf8'));
                        if (content.length) {
                            if (content[0].match(/doc/)) {
                                content.pop();
                                content.splice(0, 1);
                                var currentFile = {};
                                var name_1 = _this.getName(formattedFile);
                                var formattedContent = content.join('\n');
                                var markdownData = void 0;
                                if (name_1.charAt(0) === '_') {
                                    name_1 = name_1.substring(1);
                                }
                                currentFile.name = name_1;
                                // Data recieved from Meta-Marked
                                markdownData = Marked(_this.insertExample(formattedContent, name_1));
                                currentFile.meta = markdownData.meta;
                                currentFile.content = markdownData.html;
                                currentFile.example = _this.extractExample(formattedContent);
                                currentFile.path = file;
                                data.push(currentFile);
                            }
                        }
                    }
                });
            });
            var order = data
                .filter(function (x) {
                if (x.meta) {
                    if (x.meta.order) {
                        return x;
                    }
                }
            });
            if (order.length >= 1) {
                return this.setOrder(data);
            }
            else {
                return data;
            }
        };
        return default_1;
    }());
    exports.default = default_1;
})(Data || (Data = {}));
//# sourceMappingURL=index.js.map