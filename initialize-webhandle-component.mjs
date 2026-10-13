import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"

const initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/tiny-mce'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	"publicFilesPrefix": '/' + initializeWebhandleComponent.componentName + "/files"
	, "alwaysProvideResources": false
	, "tinyMCEFilesPrefix": "/@webhandle/tiny-mce/tinymce-files"
}
initializeWebhandleComponent.staticFilePath = 'public'
initializeWebhandleComponent.templatePath = 'views'


initializeWebhandleComponent.setup = async function (webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config
	config.editor = {
		init: {
			default: {
				base_url: config.tinyMCEFilesPrefix
				, license_key: 'gpl'
				, plugins: 'code'
				, toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent'
				, external_plugins: {
				}
			}
		}
		, plugins: []
	}

	/**
	 * @param {object} options - Options to add and use a tinymce editor plugin
	 * @param {string} options.name - short name for the plugin
	 * @param {string} options.url - how to find the plugin
	 * @param {string} options.toolbar - how to find the plugin
	 */
	manager.addPlugin = function (options) {
		config.editor.plugins.push(options)

		if(options.toolbar) {
			config.editor.init.default.toolbar += ` ${options.toolbar} `
		}
		config.editor.init.default.plugins += ` ${options.name} `
	}

	let base = webhandle.projectRoot
	try {
		let info = await webhandle.sinks.project.getFullFileInfo('node_modules/tinymce')
	}
	catch (e) {
		base = initializeWebhandleComponent.componentDir
	}

	manager.addExternalResources = (externalResourceManager, options) => {
		externalResourceManager.provideResource({
			mimeType: 'application/javascript'
			, url: config.tinyMCEFilesPrefix + '/tinymce.js'
			, name: 'tinymce'
			, resourceType: 'module'
		})

		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: config.publicFilesPrefix + '/css/styles.css'
		})

		externalResourceManager.provideResource({
			mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: initializeWebhandleComponent.componentName + '/configuration'
			, data: config.editor
		})

		externalResourceManager.provideResource({
			url: path.join(config.publicFilesPrefix, 'js/tinymce.mjs')
			, mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: initializeWebhandleComponent.componentName
		})
	}

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/addExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
	})

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/renderExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
		return externalResourceManager.render()
	})

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/convertTextAreas', (data) => {
		try {
			let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
			manager.addExternalResources(externalResourceManager)

			let resources = externalResourceManager.render()
			let selector = '.html-editor'
			if (data && typeof data === 'string') {
				selector = data
			}
			let action = `
	<script type="module">
		import makeEditor from "@webhandle/tiny-mce"
		function updateTextareaFromEditor(editor) {
			let value = editor.getContent()
			editor.getElement().value = value
		}
		makeEditor('${selector}', "default", {
			setup: (editor) => {
				editor.on('change input NodeChange ExecCommand blur', () => {
					updateTextareaFromEditor(editor)
				})
			}
		})
	</script>`

			return resources + action
		}
		catch (e) {
			console.error(e)
		}
	})

	manager.staticPaths.push(
		webhandle.addStaticDir(
			path.join(base, 'node_modules/tinymce')
			, {
				urlPrefix: config.tinyMCEFilesPrefix
				, fixedSetOfFiles: true
			})
	)


	// Allow access to the component and style code
	let filePath = path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.staticFilePath)
	manager.staticPaths.push(
		webhandle.addStaticDir(
			filePath,
			{
				urlPrefix: config.publicFilesPrefix
				, fixedSetOfFiles: true
			}
		)
	)

	// webhandle.addTemplateDir(
	// 	path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.templatePath)
	// 	, {
	// 		immutable: true
	// 	}
	// )

	return manager
}

export default initializeWebhandleComponent
