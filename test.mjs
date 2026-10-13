import setupTinyMCEEditor from "./initialize-webhandle-component.mjs";
import setupTestPlugin from "./test/add-my-plugin.mjs"

export default async function test(webhandle) {
	webhandle.development = true
	debugger

	let tinymceManager = await setupTinyMCEEditor(webhandle)

	webhandle.routers.preStatic.use((req, res, next) => {
		req.user = {
			name: "administrator"
			, groups: ["administrators"]
		}
		
		next()
	})
	await setupTestPlugin(webhandle)
}