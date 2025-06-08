<script setup>
const props = defineProps({
  wrapperClass: {
    type: [String, Object, Array],
    default: '',
  },
  triangleClass: {
    type: [String, Object, Array],
    default: '',
  },
  triangleBorderClass: {
    type: [String, Object, Array],
    default: '',
  },
  bodyClass: {
    type: [String, Object, Array],
    default: '',
  },
  // Add border prop
  borderClass: {
    type: [String, Object, Array],
    default: 'border-acc/40 ',
  },
})
</script>

<template>
  <!-- Needs to be inside a relative el -->
  <div class="absolute z-50 inline-block" :class="wrapperClass">
    <!-- Triangle border style:-top-2 -->
    <div
      class="absolute -top-[9px] left-1/2 h-0 w-0 -translate-x-1/2 transform border-r-[9px] border-b-[9px] border-l-[9px] border-r-transparent border-l-transparent"
      :class="[props.triangleBorderClass, props.borderClass]"
    ></div>
    <!-- Triangle: -top-1.5 -->
    <div
      class="dark:border-b-sec border-b-primary absolute -top-[7px] left-1/2 z-10 h-0 w-0 -translate-x-1/2 transform border-r-8 border-b-8 border-l-8 border-r-transparent border-l-transparent"
      :class="props.triangleClass"
    ></div>

    <!-- Tooltip body - removed hardcoded border-red-500 -->
    <div
      class="dark:bg-sec bg-primary relative min-w-[120px] rounded-md border px-3 py-2 text-center shadow-lg"
      :class="[props.bodyClass, props.borderClass]"
    >
      <slot></slot>
    </div>
  </div>
</template>
