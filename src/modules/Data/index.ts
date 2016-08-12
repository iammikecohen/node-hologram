import * as fs from 'fs';
import {Example} from '../Example';
const Search = require('recursive-search');
const Marked = require('meta-marked');
const path = require('path');

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

function move(array, value, newIndex) {
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

        return arrayClone
    }
    return array
}

export class Data {
    root: string;

    constructor(root: string) {
        this.root = root;
    }

    extractContent(s: string): Array<string> {
        try {
            return s
                .match(/\/\*+doc[\s\S]*?\*\//)[0]
                .replace(/\/\*(.*?)\\*\//g, '')
                .split('\n');
        } catch (e) {
            return [];
        }
    }

    setOrder(data: Array<any>): Array<any> {
        let newData: Array<any> = data;
        let temp: Array<any> = data
            .filter(x => x.meta)
            .filter(x => x.meta.order);

        temp.map((x, index) => {
            newData = move(newData, x, x.meta.order - 1);
        });

        return newData;
    }

    get(directories: Array<string>, ext: string): Array<String> {
        let _example: Example = new Example();
        let data: Array<any> = [];
        let meta: Object = {};


        directories.map(directory => {
            Search.recursiveSearchSync('*', this.root + directory)
                .map(file => {
                    let formattedFile: any = path.parse(file);
                    if (ext === formattedFile.ext.slice(1)) {
                        console.log('extension matched', ext);
                        let content: Array<string> = this.extractContent(fs.readFileSync(file, 'utf8'));
                        if (content.length) {
                            console.log('true');
                            if (content[0].match(/doc/)) {
                                console.log('match');
                                content.pop();
                                content.splice(0, 1);

                                let currentFile: any = {};
                                let name: string = formattedFile.name;
                                let formattedContent: string = content.join('\n');
                                let markdownData: any;

                                if (name.charAt(0) === '_') {
                                    name = name.substring(1);
                                }

                                currentFile.name = name;

                                // Data recieved from Meta-Marked
                                markdownData = Marked(_example.insertExample(formattedContent, name));

                                currentFile.meta = markdownData.meta;
                                currentFile.content = markdownData.html;
                                currentFile.example = _example.extractExample(formattedContent);
                                currentFile.path = file;
                                console.log('data',currentFile);
                                data.push(currentFile);
                            }
                        }
                    }
                });
        });

        let order = data
            .filter(x => x.meta)
            .filter(x => x.meta.order);

        if (order.length >= 1) {
            return this.setOrder(data);
        } else {
            return data;
        }
    }
}
