# @webhandle/tiny-mce

Adds code to use the tinymce html editor framework to webhandle.

## Install

```bash
npm install @webhandle/tiny-mce
```

## Initialization

```js
    import setupTinyMCE from "@webhandle/tiny-mce/initialize-webhandle-component.mjs"
    let managerTinyMCE = await setupTinyMCE(webhandle)
```

## Usage

To convert textareas marked with the class `html-editor`, in the html

```html
	<textarea class="html-editor"></textarea>
	__::@webhandle/tiny-mce/convertTextAreas__
```

To programmatically transform an element to an editable element:
```html
	__externalResourceManager::@webhandle/tiny-mce/renderExternalResources__
```

```js
	import makeEditor from "@webhandle/tiny-mce"
	makeEditor(document.querySelector('#editor'), "default", {
		inline: true
	})
```

This call accepts a sting selector or element as the first argument,
a string which specifies the base configuration, and an object
which has additional tinymce init options. The most significant is the
`inline` option, which causes behavior like you'd want for an inline page
editor (rather than a textarea).


## Adding Plugins to TinyMCE

You can always modify the tinymce by doing something like:
```html
	__externalResourceManager::@webhandle/tiny-mce/renderExternalResources__
```

```js
	import tinymce from "tinymce"
	tinymce.PluginManager.add('myplugin', myplugincode)
	tinymce.init({
		// init options
	})
```

However, if you want webhandle to manage the loading of your code and the configuration
of the default tinymce editor, you can add trigger the addition of plugins like this:

```js
import path from "node:path"
import tinymceSetup from "../initialize-webhandle-component.mjs"
let tinymceManager = await tinymceSetup(webhandle)
let testPlugin1 = {
	name: 'myplugin'
	, url: path.join(someRootPath, 'js/test-plugin-1.mjs')
	, toolbar: 'mybutton'
}
tinymceManager.addPlugin(testPlugin1)
```

Where `name` is the short plugin name, `url` is the path to code which will actually load the plugin,
and `toolbar` represent ADDITIONS to the toolbar. Should the component want to rewrite the default
configuration, it can access it at

```js
tinymceManager.config.editor.init.default
```

To add a new configuration, add a new member to the `tinymceManager.config.editor.init` object.

The tinymce plugin code itself (the stuff at `test-plugin-1.mjs`) looks something like:

```js
import "tinymce"
export default function addToEditor(editor, url) {
	editor.addCommand('myCommand', () => {
		editor.insertContent('<div contenteditable="false">abc&nbsp;<strong contenteditable="true">Inserted content</strong>&nbsp;abc</div>');
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
}
tinymce.PluginManager.add('myplugin', addToEditor)
```





