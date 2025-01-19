<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm transition-colors duration-300">
        <nav class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="text-2xl font-bold transition-colors duration-300 hover:text-accent">
              DevTriet
            </NuxtLink>
            <div class="space-x-6">
              <NuxtLink v-for="item in ['Home', 'Blog', 'About']" :key="item"
                :to="item.toLowerCase() === 'home' ? '/' : `/${item.toLowerCase()}`"
                class="transition-colors duration-300 hover:text-accent">
                {{ item }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </header>

      <main class="pt-24">
        <!-- Search Section -->
        <div class="container mx-auto px-6 mb-8">
          <div class="relative max-w-2xl mx-auto">
            <input v-model="searchQuery" type="text" placeholder="Search posts..."
              class="w-full px-4 py-3 pl-12 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch" />
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <!-- Search Results Dropdown -->
            <div v-if="searchQuery && filteredPosts.length > 0"
              class="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <NuxtLink v-for="post in filteredPosts" :key="post._path" :to="post._path"
                class="block p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
                <h3 class="text-lg font-semibold text-gray-900">{{ post.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ post.excerpt }}</p>
                <div class="flex items-center mt-2 text-xs text-gray-500">
                  <span>{{ formatDate(post.date) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ post.readingTime }} min read</span>
                </div>
              </NuxtLink>
            </div>
            <!-- No Results Message -->
            <div v-else-if="searchQuery && filteredPosts.length === 0"
              class="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 p-4 text-center text-gray-600">
              No posts found for "{{ searchQuery }}"
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="container mx-auto px-6 py-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="i in 6" :key="i" class="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Blog Posts Grid -->
        <div v-else class="container mx-auto px-6 py-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-12 opacity-0 animate-fadeIn">
            {{ searchQuery ? 'Search Results' : 'Latest Posts' }}
          </h1>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article v-for="(post, index) in displayedPosts" :key="post._path"
              class="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-102 transition-transform duration-300"
              :style="{ animationDelay: `${index * 100}ms` }" v-motion :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0 }">
              <NuxtLink :to="post._path">
                <NuxtImg :src="post.image" :alt="post.title" class="w-full h-48 object-cover"
                  @error="handleImageError" />
                <div class="p-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-blue-500">{{ formatDate(post.date) }}</span>
                    <span class="text-sm text-gray-500">{{ post.readingTime }} min read</span>
                  </div>
                  <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ post.title }}</h2>
                  <p class="text-gray-600">{{ post.excerpt }}</p>

                  <!-- Tags -->
                  <div v-if="post.tags" class="mt-4 flex flex-wrap gap-2">
                    <span v-for="tag in post.tags" :key="tag"
                      class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- No Posts State -->
          <div v-if="!displayedPosts.length" class="text-center py-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Posts Found</h2>
            <p class="text-gray-600">
              {{ searchQuery ? 'Try different search terms or' : 'Check back later for new content!' }}
              <span v-if="searchQuery" class="text-blue-500 cursor-pointer hover:underline" @click="clearSearch">
                view all posts
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Footer from '~/components/Footer.vue'
import { ref, computed, watch } from 'vue'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'

// Fetch posts from markdown files
const { data: posts, pending } = await useAsyncData('posts', () => {
  return queryContent('blog')
    .sort({ date: -1 }) // Sort by date descending (newest first)
    .find()
})

// Search functionality
const searchQuery = ref('')
const fuse = ref(null)

// Initialize Fuse.js when posts are loaded
watch(posts, (newPosts) => {
  if (newPosts) {
    fuse.value = new Fuse(newPosts, {
      keys: ['title', 'excerpt', 'tags'],
      threshold: 0.3,
      includeScore: true
    })
  }
}, { immediate: true })

// Debounce function
const debounce = (fn, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), wait)
  }
}

// Handle search with debounce
const handleSearch = debounce(() => {
  if (searchQuery.value && fuse.value) {
    const sanitizedQuery = DOMPurify.sanitize(searchQuery.value)
    const results = fuse.value.search(sanitizedQuery)
    filteredPosts.value = results.map(result => result.item)
  } else {
    filteredPosts.value = posts.value || []
  }
}, 300)

const filteredPosts = ref([])

// Compute posts to display
const displayedPosts = computed(() => {
  return searchQuery.value ? filteredPosts.value : posts.value || []
})

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  filteredPosts.value = posts.value || []
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Handle image loading errors
const handleImageError = (e) => {
  e.target.src = '/images/placeholder.jpg'
}

// Animation utilities
const useAnimation = () => {
  onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn')
        }
      })
    })

    document.querySelectorAll('.animate-fadeIn').forEach(el => observer.observe(el))
  })
}

useAnimation()

// Meta tags for SEO
useHead({
  title: 'My Personal Blog - Latest Posts',
  meta: [
    {
      name: 'description',
      content: 'Explore the latest articles about web development, technology, and more.'
    }
  ]
})
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
}

.scale-102 {
  scale: 1.02;
}
</style>