<template>
  <nav
    v-if="paginationData && paginationData.totalPages > 1"
    class="mt-16 mb-8 px-4"
    aria-label="Pagination"
  >
    <div class="flex flex-col items-center gap-6">
      <!-- Summary Info -->
      <div class="text-center">
        <p class="text-fg-mute text-sm font-light tracking-wide">
          Displaying
          <span class="text-fg font-medium">{{ startItem }}</span>
          –
          <span class="text-fg font-medium">{{ endItem }}</span>
          of
          <span class="text-fg font-medium">{{ totalItems }}</span>
          posts
        </p>
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-1 sm:gap-8 lg:gap-12">
        <!-- Previous Button -->
        <button
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          class="group border-brdr bg-primary hover:border-acc/50 disabled:hover:border-brdr relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
          aria-label="Previous page"
        >
          <ChevronLeftIcon
            class="text-fg-mute group-hover:text-acc group-disabled:group-hover:text-fg-mute h-3.5 w-3.5 transition-colors duration-200 sm:h-5 sm:w-5"
          />
          <span
            class="text-acc pointer-events-none absolute -bottom-6 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:group-hover:opacity-0 max-sm:hidden"
          >
            Previous
          </span>
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-0.5 sm:gap-1">
          <template v-for="(page, index) in visiblePages" :key="`page-${index}`">
            <!-- Ellipsis -->
            <span
              v-if="page === 'ellipsis-start' || page === 'ellipsis-end'"
              class="text-fg-subtle px-0.5 text-xs sm:px-1 sm:text-sm"
            >
              ···
            </span>

            <!-- Page Button -->
            <button
              v-else
              @click="$emit('page-change', page)"
              :disabled="page === currentPage"
              :class="[
                'relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition-all duration-200 ease-out disabled:cursor-not-allowed sm:h-10 sm:w-10 sm:text-sm',
                page === currentPage
                  ? 'bg-acc text-fg2 shadow-acc/25 shadow-md'
                  : 'text-fg-mute hover:bg-sec-mute/50 hover:text-acc dark:hover:bg-sec-light/30',
              ]"
              :aria-label="`Go to page ${page}`"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Next Button -->
        <button
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage === paginationData.totalPages"
          class="group border-brdr bg-primary hover:border-acc/50 disabled:hover:border-brdr relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
          aria-label="Next page"
        >
          <ChevronRightIcon
            class="text-fg-mute group-hover:text-acc group-disabled:group-hover:text-fg-mute h-3.5 w-3.5 transition-colors duration-200 sm:h-5 sm:w-5"
          />
          <span
            class="text-acc pointer-events-none absolute -bottom-6 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:group-hover:opacity-0 max-sm:hidden"
          >
            Next
          </span>
        </button>
      </div>

      <!-- Quick Jump (for many pages) -->
      <div
        v-if="paginationData.totalPages > 5"
        class="flex flex-col items-center gap-3 sm:flex-row"
      >
        <label for="page-jump" class="text-fg-mute text-sm font-light"> Jump to page: </label>
        <div class="flex items-center gap-2">
          <input
            id="page-jump"
            type="number"
            :min="1"
            :max="paginationData.totalPages"
            v-model.number="jumpToPage"
            @keyup.enter="handleJump"
            class="border-brdr bg-primary text-fg placeholder:text-fg-subtle focus:border-acc focus:ring-acc/20 h-9 w-16 rounded-lg border px-2 text-center text-sm transition-all focus:ring-2 focus:outline-none"
            :placeholder="currentPage.toString()"
          />
          <button
            @click="handleJump"
            class="bg-acc/10 text-acc hover:bg-acc hover:text-fg2 border-acc/30 hover:border-acc rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out"
          >
            Go
          </button>
        </div>
      </div>
    </div>

    <!-- Decorative Element -->
    <div class="mt-8 flex items-center justify-center">
      <div class="flex items-center gap-4">
        <div class="to-acc/50 h-px w-16 bg-gradient-to-r from-transparent sm:w-20"></div>
        <div class="flex gap-1">
          <div class="bg-acc/70 size-1.5 rounded-full"></div>
          <div class="bg-acc/45 size-1.5 rounded-full"></div>
          <div class="bg-acc/20 size-1.5 rounded-full"></div>
        </div>
        <div class="to-acc/50 h-px w-16 bg-gradient-to-l from-transparent sm:w-20"></div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  paginationData: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value &&
        (typeof value.page === 'number' || typeof value.currentPage === 'number') &&
        typeof value.totalPages === 'number' &&
        (typeof value.totalPosts === 'number' || typeof value.totalItems === 'number')
      )
    },
  },
  pageNumbers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['page-change'])

// Jump to page functionality
const jumpToPage = ref(props.paginationData.page || props.paginationData.currentPage)

// Normalize pagination data
const currentPage = computed(() => props.paginationData.page || props.paginationData.currentPage)
const totalItems = computed(
  () => props.paginationData.totalPosts || props.paginationData.totalItems,
)
const startItem = computed(() => (currentPage.value - 1) * props.paginationData.limit + 1)
const endItem = computed(() =>
  Math.min(currentPage.value * props.paginationData.limit, totalItems.value),
)

watch(
  () => currentPage.value,
  (newPage) => {
    jumpToPage.value = newPage
  },
)

const handleJump = () => {
  const page = parseInt(jumpToPage.value)
  if (page >= 1 && page <= props.paginationData.totalPages && page !== currentPage.value) {
    emit('page-change', page)
  }
}

// Calculate visible pages with smart ellipsis
const visiblePages = computed(() => {
  const current = currentPage.value
  const total = props.paginationData.totalPages
  const delta = 2 // Pages to show on each side of current

  if (total <= 7) {
    // Show all pages if total is small
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []
  const rangeStart = Math.max(2, current - delta)
  const rangeEnd = Math.min(total - 1, current + delta)

  // Always include first page
  if (rangeStart > 2) {
    pages.push(1)
    if (rangeStart > 3) {
      pages.push('ellipsis-start')
    }
  }

  // Include current page range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  // Always include last page
  if (rangeEnd < total - 1) {
    if (rangeEnd < total - 2) {
      pages.push('ellipsis-end')
    }
    pages.push(total)
  }

  // If we haven't included page 1 or last page yet, add them
  if (!pages.includes(1)) {
    pages.unshift(1)
  }
  if (!pages.includes(total)) {
    pages.push(total)
  }

  return pages
})
</script>

<style scoped>
/* Input number spinner removal */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
