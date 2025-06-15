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

<template>
  <nav
    v-if="paginationData && paginationData.totalPages > 1"
    class="mt-16 mb-8"
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
      <div class="flex items-center gap-8 sm:gap-12">
        <!-- Previous Button -->
        <button
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          class="group border-brdr bg-primary hover:border-acc/50 disabled:hover:border-brdr relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 active:disabled:scale-100 sm:h-11 sm:w-11"
          aria-label="Previous page"
        >
          <ChevronLeftIcon
            class="text-fg-mute group-hover:text-acc group-disabled:group-hover:text-fg-mute h-4 w-4 transition-colors sm:h-5 sm:w-5"
          />
          <span
            class="text-acc absolute -bottom-5 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-disabled:group-hover:opacity-0"
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
              class="text-fg-subtle mt-1.5 px-1 text-sm"
            >
              ···
            </span>

            <!-- Page Button -->
            <button
              v-else
              @click="$emit('page-change', page)"
              :class="[
                'relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ease-out active:scale-95 sm:h-10 sm:w-10',
                page === currentPage
                  ? 'bg-acc text-fg2 shadow-acc/25 shadow-md'
                  : 'text-fg-mute hover:bg-sec hover:text-acc hover:border-brdr hover:border',
              ]"
              :aria-label="`Go to page ${page}`"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
              <!-- Active Page Indicator -->
              <span
                v-if="page === currentPage"
                class="bg-acc absolute -bottom-2 h-0.5 w-4 rounded-full opacity-70"
              />
            </button>
          </template>
        </div>

        <!-- Next Button -->
        <button
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage === paginationData.totalPages"
          class="group border-brdr bg-primary hover:border-acc/50 disabled:hover:border-brdr relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 active:disabled:scale-100 sm:h-11 sm:w-11"
          aria-label="Next page"
        >
          <ChevronRightIcon
            class="text-fg-mute group-hover:text-acc group-disabled:group-hover:text-fg-mute h-4 w-4 transition-colors sm:h-5 sm:w-5"
          />
          <span
            class="text-acc absolute -bottom-5 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-disabled:group-hover:opacity-0"
          >
            Next
          </span>
        </button>
      </div>

      <!-- Quick Jump (for many pages) -->
      <div v-if="paginationData.totalPages > 10" class="flex items-center gap-3">
        <label for="page-jump" class="text-fg-mute text-sm font-light"> Jump to page: </label>
        <div class="flex items-center gap-2">
          <input
            id="page-jump"
            type="number"
            :min="1"
            :max="paginationData.totalPages"
            v-model.number="jumpToPage"
            @keyup.enter="handleJump"
            class="border-brdr bg-primary text-fg placeholder:text-fg-subtle focus:border-acc focus:ring-acc/20 h-9 w-14 rounded-lg border px-2 text-center text-sm transition-all focus:ring-2 focus:outline-none"
            :placeholder="currentPage.toString()"
          />
          <button
            @click="handleJump"
            class="bg-acc/10 text-acc hover:bg-acc hover:text-fg2 border-acc/30 hover:border-acc rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out active:scale-95"
          >
            Go
          </button>
        </div>
      </div>
    </div>

    <!-- Decorative Element -->
    <div class="mt-8 flex items-center justify-center">
      <div class="flex items-center gap-4">
        <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
        <div class="flex gap-1">
          <div class="bg-acc/70 size-1.5 rounded-full"></div>
          <div class="bg-acc/45 size-1.5 rounded-full"></div>
          <div class="bg-acc/20 size-1.5 rounded-full"></div>
        </div>
        <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
      </div>
    </div>
  </nav>
</template>

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
