'use strict'

const fs = require('fs')
const path = require('path')

const data = require('./data')
const view = require('./view')

const _ = require('underscore')

class Hologram {
	constructor(opts) {
		/******************************************
		 Required parameters
		 *****************************************/

		// The cwd, all paths will be relative to
		this.src = opts.src

		// Destination of generated styleguide
		this.dest = path.join(this.src, opts.dest)

		// Stylesheet of that components use
		this.styles = opts.styles

		// Directories that hologram will scan
		this.directories = opts.directories.map(dir => path.join(this.src, dir))

		/******************************************
		 Optional parameters
		 *****************************************/

		// App scripts
		this.scripts = opts.scripts || []

		// An array of valid filetypes
		this.ext = opts.ext || ['scss']

		// Title of Style Guide
		this.title = opts.title || ''

		// Styleguide's description
		this.description = opts.description || ''

		// Color pallete
		this.colors = opts.colors || []

		// Font's used in styleguide
		this.fonts = opts.fonts || []

		// Add custom stylesheet to styleguide
		this.styleguide_stylesheet = this.hologram_stylesheet(opts.styleguide_stylesheet)

		// Highlight code examples
		this.highlight_code = opts.highlight_code || true
	}

	hologram_stylesheet(styleguide_stylesheet) {
		if (styleguide_stylesheet) {
			return fs.readFileSync(path.join(this.src, styleguide_stylesheet), 'utf8')
		} else {
			return fs.readFileSync(path.join(__dirname, '/styles/main.css'), 'utf8')
		}
	}

	templates() {
		return {
			component_example: path.join(__dirname, '/templates/component_example.pug'),
			component_list: path.join(__dirname, '/templates/component_list.pug')
		}
	}

	init() {
		let components = []
		let relevant_files = data.get_relevant_files(this.directories, this.ext)
		let file_data = data.extract_component_data(relevant_files)

		file_data.map((file, index) => {
			let component = data.format_component_data(file)
			component.id = index
			component.example = data.extract_example_from_component(component)

			if (component.example) {
				component.html = data.insert_example_iframe_to_component(component)
			}

			components.push(component)
		})

		this.colors = _.union(data.create_color_pallette(components), this.colors)

		let categorised_components = data.categorise_components(components)

		let view_data = {
			fonts: this.fonts,
			title: this.title,
			colors: this.colors,
			description: this.description,
			components: categorised_components,
			highlight_code: this.highlight_code,
			styleguide_stylesheet: this.styleguide_stylesheet
		}

		let component_list = view.create_view(this.templates().component_list, view_data, 'component_list')
		view.write_view(this.dest, component_list, 'index.html')

		components.map(component => {
			if (component.example) {
				let view_title = `${component.id}-example`
				let view_data = {
					fonts: this.fonts,
					title: this.title,
					styles: this.styles,
					scripts: this.scripts,
					example: component.example
				}
				let example_view = view.create_view(this.templates().component_example, view_data, view_title)
				view.write_view(this.dest, example_view, view_title + '.html')
			}
		})
	}
}

module.exports = opts => new Hologram(opts)

