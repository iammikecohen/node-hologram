import * as fs from 'fs';
import * as Mkdirp from 'mkdirp';
import * as Handlebars from 'handlebars';

namespace View {

    export default class {
        dest:string;

        constructor(dest:string) {
            this.dest = dest;
        }

        public compile(context:any, layout:string):string {
            return Handlebars.compile(layout)(context);
        }

        public create(name:string, data:any, layout:string):void {
            Mkdirp(this.dest, err => {
                if (err) console.error(err);

                let filename:string = name === 'index' ? 'index.html' : `${name}-example.html`;

                fs.writeFileSync(`${this.dest}/${filename}`, this.compile(data, layout), 'utf8');
            });
        }
    }

}

