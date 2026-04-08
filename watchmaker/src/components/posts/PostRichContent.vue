<script setup>
import { computed } from 'vue'
import { addHeadingAnchorsToPostHtml } from '@/utils/postContent'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  emptyMessage: {
    type: String,
    default: 'This post does not have written content yet.',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const renderedHtml = computed(() => addHeadingAnchorsToPostHtml(props.content))
</script>

<template>
  <div
    v-if="renderedHtml"
    class="post-rich-content text-fg/90 dark:text-fg/94 leading-relaxed"
    :class="{ 'post-rich-content--compact': compact }"
    v-html="renderedHtml"
  ></div>

  <p v-else class="text-fg/80 dark:text-fg/78 leading-relaxed">
    {{ emptyMessage }}
  </p>
</template>

<style scoped>
.post-rich-content {
  font-family: 'EB Garamond Variable', serif;
  font-size: 1.15rem;
  line-height: 1.85;
}

.post-rich-content--compact {
  font-size: 1.05rem;
}

.post-rich-content :deep(*) {
  max-width: 100%;
}

.post-rich-content :deep(p),
.post-rich-content :deep(ul),
.post-rich-content :deep(ol),
.post-rich-content :deep(blockquote),
.post-rich-content :deep(pre),
.post-rich-content :deep(table) {
  margin: 0 0 1.2rem;
}

.post-rich-content :deep(h1),
.post-rich-content :deep(h2),
.post-rich-content :deep(h3),
.post-rich-content :deep(h4) {
  font-family: 'Cinzel Variable', serif;
  line-height: 1.2;
  margin: 2.4rem 0 0.95rem;
  color: var(--color-fg);
  scroll-margin-top: 7rem;
}

.post-rich-content--compact :deep(h1),
.post-rich-content--compact :deep(h2),
.post-rich-content--compact :deep(h3),
.post-rich-content--compact :deep(h4) {
  margin-top: 1.45rem;
}

.post-rich-content :deep(h1) {
  font-size: 2.15rem;
}

.post-rich-content :deep(h2) {
  font-size: 1.75rem;
}

.post-rich-content :deep(h3) {
  font-size: 1.4rem;
}

.post-rich-content :deep(h4) {
  font-size: 1.2rem;
}

.post-rich-content :deep(ul),
.post-rich-content :deep(ol) {
  padding-left: 1.4rem;
}

.post-rich-content :deep(li + li) {
  margin-top: 0.35rem;
}

.post-rich-content :deep(blockquote) {
  border-left: 3px solid rgba(185, 135, 43, 0.8);
  padding-left: 1rem;
  color: rgba(52, 44, 36, 0.88);
}

.post-rich-content :deep(figure) {
  margin: 2rem 0;
}

.post-rich-content :deep(figure img) {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
}

.post-rich-content :deep(.post-block-row) {
  display: grid;
  gap: 1.1rem;
  margin: 2rem 0;
}

.post-rich-content :deep(.post-block-row--pair) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.post-rich-content :deep(.post-block-row--gallery) {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.post-rich-content :deep(.post-block-row--gallery-2) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.post-rich-content :deep(.post-block-row--gallery-3) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.post-rich-content :deep(.post-block-row--gallery-6),
.post-rich-content :deep(.post-block-row--gallery-9) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.post-rich-content :deep(.post-block-row figure) {
  margin: 0;
}

.post-rich-content :deep(figcaption) {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-fg) !important;
  opacity: 0.9;
}

.post-rich-content :deep(a) {
  color: rgba(154, 111, 28, 1);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.post-rich-content :deep(pre),
.post-rich-content :deep(code) {
  font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace;
}

.post-rich-content :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
  background: rgba(28, 36, 48, 0.08);
  padding: 1rem;
}

.post-rich-content :deep(code) {
  background: rgba(28, 36, 48, 0.08);
  border-radius: 0.35rem;
  padding: 0.1rem 0.3rem;
}

.post-rich-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.post-rich-content :deep(th),
.post-rich-content :deep(td) {
  border: 1px solid rgba(185, 135, 43, 0.2);
  padding: 0.65rem 0.75rem;
  text-align: left;
}

:global(.dark) .post-rich-content :deep(h1),
:global(.dark) .post-rich-content :deep(h2),
:global(.dark) .post-rich-content :deep(h3),
:global(.dark) .post-rich-content :deep(h4) {
  color: rgba(241, 237, 231, 0.98);
}

:global(.dark) .post-rich-content :deep(blockquote) {
  color: rgba(224, 220, 213, 0.88);
}

:global(.dark) .post-rich-content :deep(a) {
  color: rgba(221, 177, 106, 1);
}

:global(.dark) .post-rich-content :deep(pre),
:global(.dark) .post-rich-content :deep(code) {
  background: rgba(247, 244, 239, 0.08);
}

:global(.dark) .post-rich-content :deep(figure img) {
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
}

@media (max-width: 640px) {
  .post-rich-content {
    font-size: 1.05rem;
  }

  .post-rich-content :deep(h1) {
    font-size: 1.85rem;
  }

  .post-rich-content :deep(h2) {
    font-size: 1.55rem;
  }

  .post-rich-content :deep(h3) {
    font-size: 1.3rem;
  }

  .post-rich-content :deep(.post-block-row--pair) {
    grid-template-columns: 1fr;
  }

  .post-rich-content :deep(.post-block-row--gallery-2),
  .post-rich-content :deep(.post-block-row--gallery-3),
  .post-rich-content :deep(.post-block-row--gallery-6),
  .post-rich-content :deep(.post-block-row--gallery-9) {
    grid-template-columns: 1fr;
  }
}
</style>
