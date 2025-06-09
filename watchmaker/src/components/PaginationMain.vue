<script setup>
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/vue/20/solid'
import { computed } from 'vue'

const props = defineProps({
  pageNumbers: Array,
  paginationData: Object,
})

defineEmits(['page-change'])

// Smart pagination logic
const visiblePages = computed(() => {
  const current = props.paginationData?.page || 1
  const total = props.paginationData?.totalPages || 1
  const maxVisible = 5 // Maximum number of page buttons to show

  if (total <= maxVisible + 2) {
    // If total pages is small, show all pages
    return props.pageNumbers || []
  }

  const pages = []

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push('...')
  }

  // Add pages around current page
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) {
      pages.push(i)
    }
  }

  // Add ellipsis before last page if needed
  if (end < total - 1) {
    pages.push('...')
  }

  // Always show last page (if it's not page 1)
  if (total > 1) {
    pages.push(total)
  }

  return pages
})
</script>

<template>
  <nav
    class="border-brdr mt-20 flex items-center justify-between border-t px-4 pb-12 sm:px-0 sm:pb-0"
  >
    <!-- Previous Button -->
    <div class="group -mt-px flex w-0 flex-1">
      <button
        :disabled="!paginationData?.hasPrevPage"
        @click="$emit('page-change', paginationData.page - 1)"
        :class="[
          'inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors duration-200',
          paginationData?.hasPrevPage
            ? 'text-fg group-hover:text-acc group-hover:border-acc cursor-pointer'
            : 'text-fg-mute cursor-not-allowed',
        ]"
      >
        <ArrowLongLeftIcon
          :class="[
            'mr-3 size-5 transition-colors duration-200',
            paginationData?.hasPrevPage ? 'text-fg group-hover:text-acc' : 'text-fg-mute',
          ]"
          aria-hidden="true"
        />
        Previous
      </button>
    </div>

    <!-- Page Numbers -->
    <div class="hidden md:-mt-px md:flex">
      <template v-for="(page, index) in visiblePages" :key="`page-${index}`">
        <!-- Ellipsis -->
        <span
          v-if="page === '...'"
          class="text-fg-subtle inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium"
        >
          ...
        </span>

        <!-- Page Button -->
        <button
          v-else
          @click="$emit('page-change', page)"
          :class="[
            'inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition-colors duration-200',
            page === paginationData?.page
              ? 'text-acc border-acc'
              : 'text-fg-mute hover:text-fg hover:border-brdr border-transparent',
          ]"
          :aria-current="page === paginationData?.page ? 'page' : undefined"
        >
          {{ page }}
        </button>
      </template>
    </div>

    <!-- Next Button -->
    <div class="group -mt-px flex w-0 flex-1 justify-end">
      <button
        :disabled="!paginationData?.hasNextPage"
        @click="$emit('page-change', paginationData.page + 1)"
        :class="[
          'inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors duration-200',
          paginationData?.hasNextPage
            ? 'text-fg group-hover:text-acc group-hover:border-acc cursor-pointer'
            : 'text-fg-mute cursor-not-allowed',
        ]"
      >
        Next
        <ArrowLongRightIcon
          :class="[
            'ml-3 size-5 transition-colors duration-200',
            paginationData?.hasNextPage ? 'text-fg group-hover:text-acc' : 'text-fg-mute',
          ]"
          aria-hidden="true"
        />
      </button>
    </div>
  </nav>
</template>
