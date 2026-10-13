import path from "node:path"
import tinymceSetup from "../initialize-webhandle-component.mjs"
export default async function addPlugin(webhandle) {
	let tinymceManager = await tinymceSetup(webhandle)
	let testPlugin1 = {
		name: 'myplugin'
		, url: path.join(tinymceManager.config.publicFilesPrefix, 'js/test-plugin-1.mjs')
		, toolbar: 'mybutton'
	}
	tinymceManager.addPlugin(testPlugin1)

}