'use strict'

const fs = require('fs')
const marked = require('meta-marked')
const search = require('recursive-search')
const _ = require('underscore')

// Scans directories and gets a list of files with the correct extension
module.exports.get_relevant_files = function (directories, ext) {
	let query = ''
	ext.map(x => query += x + '|')
	let reg = new RegExp('.(' + query + ')$', 'i')
	let relevant_files = directories.map(dir => search.recursiveSearchSync(reg, dir))

	return relevant_files.reduce((a, b) => a.concat(b))
}

// Takes a file, reads it and returns data relevant to hologram
module.exports.extract_component_data = function (files) {
	const matchHandler = data => {
		let match = data.match(/\/\*doc[^*]*\*+([^/*][^*]*\*+)*\//)
		if (match) {
			let data = match[0].split('\n')
			data.splice(0, 1)
			data.splice(-1, 1)
			return data.join('\n')
		} else {
			return false
		}
	}

	return files
		.map(file => fs.readFileSync(file, 'utf8'))
		.map(data => matchHandler(data))
		.filter(data => data)
}

// Takes component data, checks for an example and returns the example data
module.exports.extract_example_from_component = function (component_data) {
	let reg = /<example>[^*]+([^*]+)<\/example>/
	let match = component_data.html.match(reg)

	return match ? match[0].replace(/<example>/, '').replace(/<\/example>/, '') : false
}

// Takes component data, and replaces the example with an iframe
module.exports.insert_example_iframe_to_component = function (component_data) {
	let template = `<iframe class='hologram-styleguide__item-example' 
		src='./${component_data.id}-example.html' frameborder='0' 
		scrolling='no' onload='resizeIframe(this)'></iframe>`.trim()
	let reg = /<example>[^*]+([^*]+)<\/example>/

	return component_data.html.replace(reg, template)
}

// Takes component data and format its
module.exports.format_component_data = function (component_data) {
	return marked(component_data)
}

// Takes an array of components and categorises them based off their meta data
module.exports.categorise_components = function (component_array) {
	let components_with_category = component_array
		.filter(component => component.meta)
		.filter(component => component.meta.category)

	let components_without_category = component_array.filter(component => {
		if (!component.meta) {
			component.meta = {}
			if (!component.meta.category) {
				return component
			}
		} else if (!component.meta.category) {
			return component
		}
	})

	let components = _.union(components_without_category, components_with_category)
	return _.groupBy(components, component => component.meta.category)
}

// Create color pallette based off component meta
module.exports.create_color_pallette = function (component_array) {
	let pallette = []
	component_array
		.filter(component => component.meta)
		.filter(component => component.meta.color)
		.map(component => pallette.push(component.meta.color))
	return _.uniq(pallette)
}

