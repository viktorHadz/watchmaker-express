<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

let editorInstanceCounter = 0
let tinyScriptLoader = null

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  height: {
    type: Number,
    default: 420,
  },
  placeholder: {
    type: String,
    default: 'Start writing...',
  },
})

const emit = defineEmits(['update:modelValue', 'ready'])

const editorTargetRef = ref(null)
const editorRef = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const editorId = `tiny-editor-${++editorInstanceCounter}`
const tinyCloudApiKey = (import.meta.env.VITE_TINYMCE_API_KEY || '').trim()

const editorApiKey = computed(() => tinyCloudApiKey || 'no-api-key')
const showMissingKeyNotice = computed(() => !tinyCloudApiKey)

const getThemeMode = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

const getContentStyle = (themeMode) => `
  body {
    font-family: "EB Garamond Variable", serif;
    font-size: 18px;
    line-height: 1.75;
    padding: 1rem 1.25rem;
    color: ${themeMode === 'dark' ? '#e6e8ee' : '#27211d'};
    background: ${themeMode === 'dark' ? '#1c2430' : '#f7f4ef'};
  }

  p {
    margin: 0 0 1rem;
  }

  h1, h2, h3, h4 {
    font-family: "Cinzel Variable", serif;
    margin: 1.6rem 0 0.8rem;
    line-height: 1.2;
  }

  blockquote {
    border-left: 3px solid ${themeMode === 'dark' ? '#cfa15c' : '#b9872b'};
    margin: 1.5rem 0;
    padding: 0.25rem 0 0.25rem 1rem;
    color: ${themeMode === 'dark' ? '#cbcfd8' : '#4d453e'};
  }

  a {
    color: ${themeMode === 'dark' ? '#ddb16a' : '#9a6f1c'};
  }

  ul, ol {
    padding-left: 1.25rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5rem 0;
  }

  th, td {
    border: 1px solid ${themeMode === 'dark' ? '#3a4657' : '#d1c6b6'};
    padding: 0.65rem 0.75rem;
    text-align: left;
  }
`

const loadTinyMceScript = (apiKey) => {
  if (window.tinymce) {
    return Promise.resolve(window.tinymce)
  }

  if (tinyScriptLoader) {
    return tinyScriptLoader
  }

  tinyScriptLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-tiny-cloud="true"]')

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.tinymce), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load TinyMCE script.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/8/tinymce.min.js`
    script.referrerPolicy = 'origin'
    script.crossOrigin = 'anonymous'
    script.dataset.tinyCloud = 'true'

    script.addEventListener(
      'load',
      () => {
        if (window.tinymce) {
          resolve(window.tinymce)
          return
        }

        reject(new Error('TinyMCE loaded without exposing a global editor instance.'))
      },
      { once: true },
    )

    script.addEventListener(
      'error',
      () => reject(new Error('Unable to load TinyMCE script.')),
      { once: true },
    )

    document.head.appendChild(script)
  })

  return tinyScriptLoader
}

const destroyEditor = async () => {
  if (!editorRef.value) {
    return
  }

  const instance = editorRef.value
  editorRef.value = null
  instance.remove()
}

const syncEditorValue = (value) => {
  if (!editorRef.value) {
    return
  }

  const currentContent = editorRef.value.getContent()
  const nextContent = value || ''

  if (currentContent !== nextContent) {
    editorRef.value.setContent(nextContent)
  }
}

const syncEditorMode = () => {
  if (!editorRef.value?.mode) {
    return
  }

  editorRef.value.mode.set(props.disabled ? 'readonly' : 'design')
}

const initEditor = async () => {
  if (!editorTargetRef.value) {
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const themeMode = getThemeMode()
    const tinymce = await loadTinyMceScript(editorApiKey.value)

    await nextTick()

    const [instance] = await tinymce.init({
      target: editorTargetRef.value,
      height: props.height,
      menubar: 'file edit view insert format table tools help',
      plugins:
        'advlist autolink lists link charmap preview searchreplace visualblocks code fullscreen table wordcount help',
      toolbar:
        'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist blockquote | link table | removeformat | code preview fullscreen',
      toolbar_mode: 'sliding',
      placeholder: props.placeholder,
      skin: themeMode === 'dark' ? 'oxide-dark' : 'oxide',
      content_css: themeMode === 'dark' ? 'dark' : 'default',
      content_style: getContentStyle(themeMode),
      resize: true,
      statusbar: true,
      browser_spellcheck: true,
      convert_urls: false,
      setup: (editor) => {
        editor.on('init', () => {
          editor.setContent(props.modelValue || '')
          syncEditorMode()
          emit('ready', editor)
        })

        editor.on('change input undo redo keyup SetContent', () => {
          emit('update:modelValue', editor.getContent())
        })
      },
    })

    editorRef.value = instance
  } catch (error) {
    console.error('TinyMCE initialization failed:', error)
    loadError.value = error.message || 'Unable to load the TinyMCE editor.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initEditor()
})

onBeforeUnmount(async () => {
  await destroyEditor()
})

watch(
  () => props.modelValue,
  (value) => {
    syncEditorValue(value)
  },
)

watch(
  () => props.disabled,
  () => {
    syncEditorMode()
  },
)
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="showMissingKeyNotice"
      class="border-warning/30 bg-warning/10 text-fg rounded-lg border px-4 py-3 text-sm"
    >
      `VITE_TINYMCE_API_KEY` is not set yet, so TinyMCE will load in Tiny Cloud's limited
      fallback mode until the env value is added.
    </div>

    <div
      v-if="isLoading"
      class="border-brdr dark:border-sec-mute bg-primary/60 dark:bg-sec/70 text-fg/70 flex min-h-52 items-center justify-center rounded-lg border"
    >
      Loading editor...
    </div>

    <div
      v-if="loadError"
      class="border-danger/30 bg-danger/10 text-danger rounded-lg border px-4 py-3 text-sm"
    >
      {{ loadError }}
    </div>

    <textarea :id="editorId" ref="editorTargetRef"></textarea>
  </div>
</template>
