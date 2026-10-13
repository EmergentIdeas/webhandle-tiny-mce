
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
	