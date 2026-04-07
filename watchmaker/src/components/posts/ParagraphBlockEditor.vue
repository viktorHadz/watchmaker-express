<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { sanitizeParagraphHtml } from '@/utils/postBlocks'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  editorId: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Write a paragraph...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)

const syncFromModel = ({ force = false } = {}) => {
  if (!editorRef.value) {
    return
  }

  const nextHtml = sanitizeParagraphHtml(props.modelValue)
  if (!force && document.activeElement === editorRef.value) {
    return
  }

  if (editorRef.value.innerHTML !== nextHtml) {
    editorRef.value.innerHTML = nextHtml
  }
}

const emitCurrentValue = ({ syncEditor = false } = {}) => {
  if (!editorRef.value) {
    return
  }

  const nextHtml = sanitizeParagraphHtml(editorRef.value.innerHTML)
  if (syncEditor && editorRef.value.innerHTML !== nextHtml) {
    editorRef.value.innerHTML = nextHtml
  }

  if (nextHtml !== props.modelValue) {
    emit('update:modelValue', nextHtml)
  }
}

const handleInput = () => {
  emitCurrentValue()
}

const handleBlur = () => {
  emitCurrentValue({ syncEditor: true })
}

const handlePaste = (event) => {
  event.preventDefault()
  const plainText = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, plainText)
  nextTick(() => {
    emitCurrentValue({ syncEditor: true })
  })
}

const insertLineBreak = () => {
  if (document.queryCommandSupported?.('insertLineBreak')) {
    document.execCommand('insertLineBreak')
    return
  }

  const selection = window.getSelection()
  if (!selection?.rangeCount) {
    return
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()

  const breakNode = document.createElement('br')
  range.insertNode(breakNode)
  range.setStartAfter(breakNode)
  range.collapse(true)

  selection.removeAllRanges()
  selection.addRange(range)
}

const handleKeydown = (event) => {
  if (event.key !== 'Enter' || event.shiftKey) {
    return
  }

  event.preventDefault()
  insertLineBreak()
  nextTick(() => {
    emitCurrentValue()
  })
}

const focus = () => {
  editorRef.value?.focus()
}

const toggleBold = () => {
  focus()
  document.execCommand('bold')
  emitCurrentValue()
}

defineExpose({
  focus,
  toggleBold,
})

onMounted(() => {
  syncFromModel({ force: true })
})

watch(
  () => props.modelValue,
  () => {
    syncFromModel()
  },
)
</script>

<template>
  <div
    ref="editorRef"
    :id="editorId || undefined"
    class="text-fg placeholder:text-fg dark:placeholder:text-acc border-brdr dark:border-sec-mute/90 bg-sec-light/65 dark:bg-sec/80 min-h-32 rounded-lg border px-4 py-3 leading-relaxed focus:outline-none"
    :contenteditable="!disabled"
    :data-placeholder="placeholder"
    role="textbox"
    aria-multiline="true"
    :aria-disabled="disabled"
    spellcheck="true"
    @input="handleInput"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @paste="handlePaste"
  ></div>
</template>

<style scoped>
[contenteditable='true'] {
  caret-color: var(--color-acc);
}

[contenteditable='true']:empty::before {
  content: attr(data-placeholder);
  color: rgba(81, 73, 65, 0.55);
}

:global(.dark) [contenteditable='true']:empty::before {
  color: rgba(235, 230, 220, 0.45);
}
</style>
