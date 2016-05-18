import * as fs from 'fs';

namespace Data {

    const Search = require('recursive-search');
    const Marked = require('meta-marked');

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

    export default class {
        root:string;
        exampleRegex:RegExp;

        constructor(root:string) {
            this.root = root;
            this.exampleRegex = /<example>[^*]+([^*]+)<\/example>/;
        }

        private moveArrayItem(array:Array<any>, value:number, newIndex:number):Array<any> {
            let oldIndex = array.indexOf(value);

            if (oldIndex > -1) {
                if (newIndex < 0) {
                    newIndex = 0
                } else if (newIndex >= array.length) {
                    newIndex = array.length
                }

                let arrayClone = array.slice();
                arrayClone.splice(oldIndex, 1);
                arrayClone.splice(newIndex, 0, value);

                return arrayClone;
            }

            return array;
        }

        public exampleTemplate(name:string):string {
            return `
                <iframe class='hologram-styleguide__item-example' 
                        src='./${name}-example.html' frameborder='0' 
                        scrolling='no' onload='resizeIframe(this)'>
                </iframe>`.trim();
        }

        public extractExample(s:string):string {
            if (s.match(this.exampleRegex)) {
                let temp:Array<string> = s.match(this.exampleRegex)[0].split('\n');

                temp.splice(0, 1);
                temp.pop();

                return temp
                    .map(x => x.trim())
                    .join('');
            } else {
                return '';
            }
        }

        public insertExample(s:string, name:string):string {
            if (s.match(this.exampleRegex)) {
                return s.replace(this.exampleRegex, this.exampleTemplate(name));
            } else {
                return s;
            }
        }

        private extractContent(s:string):Array<string> {
            try {
                return s
                    .match(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//)[0]
                    .replace(/\/\*(.*?)\\*\//g, '')
                    .split('\n');
            } catch (e) {
                return [];
            }
        }

        private getName(name:string):string {
            let split = name.split('.');
            split.pop();

            return split.join('-');
        }

        private setOrder(data:Array<any>):Array<any> {
            let newData:Array<any> = data;

            data
                .filter(x => x.meta)
                .filter(x => x.meta.order)
                .map(x => {
                    newData = this.moveArrayItem(newData, x, x.meta.order - 1);
                });

            return newData;
        }

        public get(directories:Array<string>, ext:string):Array<string> {
            let data:Array<any> = [];

            directories.map(directory => {
                Search.recursiveSearchSync('*', this.root + directory)
                    .map(file => {
                        let formattedFile:string = file.split('/').pop();

                        if (ext === formattedFile.split('.').pop()) {
                            let content:Array<string> = this.extractContent(fs.readFileSync(file, 'utf8'));

                            if (content.length) {
                                if (content[0].match(/doc/)) {
                                    content.pop();
                                    content.splice(0, 1);

                                    let currentFile:any = {};
                                    let name:string = this.getName(formattedFile);
                                    let formattedContent:string = content.join('\n');
                                    let markdownData:any;

                                    if (name.charAt(0) === '_') {
                                        name = name.substring(1);
                                    }

                                    currentFile.name = name;

                                    // Data recieved from Meta-Marked
                                    markdownData = Marked(this.insertExample(formattedContent, name));

                                    currentFile.meta = markdownData.meta;
                                    currentFile.content = markdownData.html;
                                    currentFile.example = this.extractExample(formattedContent);
                                    currentFile.path = file;

                                    data.push(currentFile);
                                }
                            }
                        }
                    });
            });

            let order:Array<any> = data
                .filter(x => {
                    if (x.meta) {
                        if (x.meta.order) {
                            return x;
                        }
                    }
                });

            if (order.length >= 1) {
                return this.setOrder(data);
            } else {
                return data;
            }
        }
    }

}
