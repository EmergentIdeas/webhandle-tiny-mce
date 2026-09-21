import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"

const initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/tiny-mce'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	"publicFilesPrefix": '/' + initializeWebhandleComponent.componentName + "/files"
	, "alwaysProvideResources": false
}
initializeWebhandleComponent.staticFilePath = 'public'
initializeWebhandleComponent.templatePath = 'views'


initializeWebhandleComponent.setup = async function (webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config

	let base = webhandle.projectRoot
	try {
		let info = await webhandle.sinks.project.getFullFileInfo('node_modules/tinymce')
	}
	catch (e) {
		base = initializeWebhandleComponent.componentDir
	}

	// webhandle.routers.preDynamic.use((req, res, next) => {
	// 	if(config.alwaysProvideResources || !initializeWebhandleComponent.supportsMultipleImportMaps(req)) {
	// 		manager.addExternalResources(res.locals.externalResourceManager)
	// 	}
	// 	next()
	// })

	manager.addExternalResources = (externalResourceManager, options) => {
		externalResourceManager.provideResource({
			mimeType: 'application/javascript'
			, url: '/@webhandle/tiny-mce/tinymce-files/tinymce.js'
			, name: 'tinymce'
			, resourceType: 'module'
		})

		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: config.publicFilesPrefix + '/css/styles.css'
		})

		externalResourceManager.provideResource({
			url: config.publicFilesPrefix + '/js/functionality.mjs'
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
			import "tinymce"
			tinymce.PluginManager.add('myplugin', (editor, url) => {
				editor.addCommand('myCommand', () => {
					editor.insertContent('&nbsp;<strong>Inserted content</strong>&nbsp;');
				});

				editor.ui.registry.addButton('mybutton', {
					text: 'My Button',
					onAction: () => editor.execCommand('myCommand')
				});
				editor.ui.registry.addMenuItem('example', {
					text: 'Example plugin',
					onAction: () => {
						editor.execCommand('myCommand')
					}
				});

				return {
					getMetadata: () => ({
					name: 'My plugin',
					url: 'https://example.com/docs'
					})
				};
			});
			let abc = await tinymce.init({
				selector: '${selector}'
				, base_url: '/@webhandle/tiny-mce/tinymce-files'
				, license_key: 'gpl' 
				, plugins: 'code,myplugin'
				, toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | mybutton'
				// , toolbar: 'mybutton'
			})
				
			console.log(abc)
			
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
				urlPrefix: '/@webhandle/tiny-mce/tinymce-files'
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

	webhandle.addTemplateDir(
		path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.templatePath)
		, {
			immutable: true
		}
	)

	return manager
}

export default initializeWebhandleComponent
