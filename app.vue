<template>
  <div>
    <!-- Optional theme indicator -->
    <div class="fixed top-4 right-4 px-3 py-1 rounded-full bg-secondary text-primary text-sm">
      {{ currentTheme }} theme
    </div>
    
    <!-- Your existing content -->
    <NuxtPage />
  </div>
</template>

<script setup>
import { useTheme } from '~/utils/useTheme'

const { currentTheme } = useTheme()
</script>