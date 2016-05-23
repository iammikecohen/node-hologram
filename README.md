# Node Hologram

    require('./node-hologram')({
        // REQUIRED
        src: __dirname,
        dest: '/hologram',
        styles: ['/css/styles2/test.css', '/css/main.css'],
        directories: ['/css/styles2', '/css/scss'],
        //OPTIONAL
        ext: ['scss', 'css'],
        title: 'test app',
        scripts: [],
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        colors: ['red', '#fff', 'green', '#000'],
        fonts: [{
            name: 'test',
            src: 'http://azdfasfdaddhfaafa.com'
        }]
    }).init();