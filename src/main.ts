import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const logEditorContent = () => {
  console.log(editor.getMarkdown())
}

const editor = new Editor({
  el: document.querySelector('#editor'),
  height: '500px',
  initialEditType: 'wysiwyg',
  initialValue: '# Hello world!',
  previewStyle: 'vertical',
})

const markdownButton = document.querySelector('#getMarkdown') as HTMLElement

markdownButton.addEventListener('click', logEditorContent)
