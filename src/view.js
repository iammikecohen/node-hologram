'use strict'

const fs = require('fs')
const pug = require('pug')
const mkdirp = require('mkdirp')

// Creates a view based Pug templates
module.exports.create_view = function (template, context, filename) {
	let template_data = fs.readFileSync(template, 'utf8')
	return pug.compile(template_data, {pretty: true, filename: filename})(context)
}

// Write view to filesystem
module.exports.write_view = function (dest, view, filename) {
	mkdirp(dest, err => {
		if (err) {
			console.error(err)
		}

		fs.writeFileSync(`${dest}/${filename}`, view, 'utf8')
	})
}

