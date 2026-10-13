
import "tinymce"
import conf from "@webhandle/tiny-mce/configuration"

for (let plugin of conf.plugins) {
	let pluginCode = await import(plugin.url)
}

export default async function makeEditor(selector, baseConfigName = 'default', additionalConfig) {
	let stack = [{}]
	if (baseConfigName) {
		stack.push(conf.init[baseConfigName])
	}

	let mid = {
		// setup: async (editor) => {
		// 	editor.on('change', () => {
		// 		console.log('change')
		// 	})
		// 	editor.on('blur', () => {
		// 		console.log('blur')
		// 	})
		// }
	}
	if (typeof selector === 'string') {
		mid.selector = selector
	}
	else {
		mid.target = selector
	}
	stack.push(mid)

	if(additionalConfig) {
		stack.push(additionalConfig)
	}

	let init = Object.assign(...stack)

	await tinymce.init(init)
}