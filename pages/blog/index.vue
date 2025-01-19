// pages/blog/index.vue
<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="max-w-7xl mx-auto mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p class="text-xl text-gray-600">Explore our latest articles and insights</p>
      </div>

      <!-- Filters and Search Section -->
      <div class="max-w-7xl mx-auto mb-8 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Search -->
          <div class="relative flex-grow">
            <input v-model="searchQuery" type="text" placeholder="Search articles..."
              class="w-full px-4 py-2 pl-10 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          <!-- Sort Options -->
          <select v-model="sortOption"
            class="px-4 py-2 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="reading-time">Reading Time</option>
          </select>
        </div>

        <!-- Tags Filter -->
        <div class="flex flex-wrap gap-2">
          <button v-for="tag in allTags" :key="tag" @click="toggleTag(tag)"
            class="px-3 py-1 rounded-full text-sm transition-colors" :class="selectedTags.includes(tag)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            #{{ tag }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="animate-pulse bg-white rounded-lg shadow-md p-6">
            <div class="h-48 bg-gray-200 rounded mb-4"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-6 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div v-else-if="paginatedPosts.length" class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article v-for="post in paginatedPosts" :key="post._path"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow" v-motion
            :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0 }">
            <NuxtLink :to="post._path" class="block">
              <NuxtImg :src="post.image" :alt="post.title" class="w-full h-48 object-cover" @error="handleImageError" />
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <time :datetime="post.date" class="text-sm text-blue-500">
                    {{ formatDate(post.date) }}
                  </time>
                  <span class="text-sm text-gray-500">{{ post.readingTime }} min read</span>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {{ post.title }}
                </h2>
                <p class="text-gray-600 mb-4 line-clamp-3">{{ post.excerpt }}</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in post.tags" :key="tag"
                    class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg border enabled:hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <span class="px-4 py-2">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button @click="currentPage++" :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-lg border enabled:hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </nav>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else class="max-w-7xl mx-auto text-center py-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Posts Found</h2>
        <p class="text-gray-600 mb-8">
          {{ searchQuery || selectedTags.length
            ? 'Try adjusting your filters or search terms'
            : 'Check back later for new content!' }}
        </p>
        <button v-if="searchQuery || selectedTags.length" @click="clearFilters"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Clear All Filters
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'

// State
const searchQuery = ref('')
const selectedTags = ref([])
const currentPage = ref(1)
const sortOption = ref('date-desc')
const postsPerPage = 9

// Fetch posts
const { data: posts, pending } = await useAsyncData('blog-posts', () => {
  return queryContent('blog').find()
})

// Initialize Fuse.js for search
const fuse = ref(null)
watch(posts, (newPosts) => {
  if (newPosts) {
    fuse.value = new Fuse(newPosts, {
      keys: ['title', 'excerpt', 'tags'],
      threshold: 0.3,
      includeScore: true
    })
  }
}, { immediate: true })

// Get all unique tags
const allTags = computed(() => {
  if (!posts.value) return []
  const tags = posts.value.flatMap(post => post.tags || [])
  return [...new Set(tags)].sort()
})

// Filter and sort posts
const filteredPosts = computed(() => {
  if (!posts.value) return []

  let filtered = [...posts.value]

  // Apply search
  if (searchQuery.value && fuse.value) {
    const results = fuse.value.search(searchQuery.value)
    filtered = results.map(result => result.item)
  }

  // Apply tag filters
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(post =>
      selectedTags.value.every(tag => post.tags?.includes(tag))
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortOption.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'reading-time':
        return b.readingTime - a.readingTime
      default:
        return 0
    }
  })

  return filtered
})

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredPosts.value.length / postsPerPage)
)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

// Watch for filter changes to reset pagination
watch([searchQuery, selectedTags, sortOption], () => {
  currentPage.value = 1
})

// Methods
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTags.value = []
  sortOption.value = 'date-desc'
  currentPage.value = 1
}

const handleSearch = debounce(() => {
  currentPage.value = 1
}, 300)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleImageError = (e) => {
  e.target.src = '/images/placeholder.jpg'
}

// Debounce utility
function debounce(fn, wait) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), wait)
  }
}

// Meta tags
useHead({
  title: 'Blog - All Articles',
  meta: [
    {
      name: 'description',
      content: 'Browse all our articles about web development, technology, and more.'
    }
  ]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>