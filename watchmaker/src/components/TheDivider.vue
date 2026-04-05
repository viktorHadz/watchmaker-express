<script setup>
defineProps({
    variant: {
        type: String,
        default: 'lg'
    }
})
</script>
<template>
    <div v-if="variant === 'lg'" class="flex items-center justify-center space-x-4">
        <div class="to-acc/70 h-px w-16 bg-gradient-to-r from-transparent"></div>
        <div class="flex space-x-2">
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
        </div>
        <div class="to-acc/70 h-px w-16 bg-gradient-to-l from-transparent"></div>
    </div>
    <div v-if="variant === 'sm'" class="mb-6 flex items-center justify-center space-x-4">
        <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
        <div class="flex space-x-1">
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
            <div class="bg-acc/80 h-1.5 w-1.5 rounded-lg"></div>
        </div>
        <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
    </div>
</template>