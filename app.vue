<template>
  <div>
    <!-- Optional theme indicator -->
    <div class="fixed top-4 right-4 px-3 py-1 rounded-full bg-secondary text-primary text-sm">
      <i :class="themeIcon"></i>
    </div>

    <!-- Your existing content -->
    <NuxtPage />
  </div>
</template>

<script setup>
import { useTheme } from '~/utils/useTheme'
import { computed } from 'vue'

const { currentTheme } = useTheme()

const themeIcon = computed(() => {
  if (currentTheme.value === 'day') {
    return 'fas fa-sun' // Font Awesome icon for day
  } else if (currentTheme.value === 'night') {
    return 'fas fa-moon' // Font Awesome icon for night
  }
  return 'fas fa-adjust' // Default icon
})
</script>

<style>
/* Add Font Awesome CSS */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>