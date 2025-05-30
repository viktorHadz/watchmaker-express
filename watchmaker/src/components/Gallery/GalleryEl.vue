<script setup>
import { ref } from 'vue'
const gallery = ref('')
async function getAllPosts() {
  try {
    const response = await fetch('/api/posts/get-all')
    if (!response.ok) throw new Error(`Error getting posts: ${response.status}`)
    const posts = await response.json()
    console.log(posts)
  } catch (error) {
    console.error('Error: ', error)
  }
}
</script>
<template>
  <div class="border border-amber-300">
    <button @click="getAllPosts">get all</button>
    <p>{{ gallery }}</p>
  </div>
</template>
