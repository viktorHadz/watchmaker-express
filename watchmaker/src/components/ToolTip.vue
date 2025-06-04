<script setup></script>
<template>
  <!-- Tooltip  -->
  <div
    class="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
  >
    <div class="bg-sec text-fg2 rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
      Toggle Theme
      <div class="bg-sec absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
    </div>
  </div>
</template>
