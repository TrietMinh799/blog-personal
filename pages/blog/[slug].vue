<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <div class="animate-pulse bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="h-[400px] bg-gray-200"></div>
        <div class="p-8">
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div class="space-y-4">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p class="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been moved.</p>
        <NuxtLink 
          to="/blog" 
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Blog
        </NuxtLink>
      </div>
    </div>

    <!-- Content State -->
    <template v-else-if="post">
      <!-- Back to top button -->
      <button 
        @click="scrollToTop" 
        v-show="showBackToTop"
        class="fixed bottom-8 right-8 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 z-50"
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ scale: 1 }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      <main class="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        <!-- Article Header -->
        <article 
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0 }"
          class="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <img 
            :src="post.image" 
            :alt="post.title"
            class="w-full h-[400px] object-cover"
          />
          
          <div class="p-8">
            <!-- Breadcrumb -->
            <nav class="flex mb-6 text-gray-500 text-sm">
              <NuxtLink to="/" class="hover:text-gray-900 transition-colors">Home</NuxtLink>
              <span class="mx-2">/</span>
              <NuxtLink to="/blog" class="hover:text-gray-900 transition-colors">Blog</NuxtLink>
              <span class="mx-2">/</span>
              <span class="text-gray-900">{{ post.title }}</span>
            </nav>

            <!-- Article Meta -->
            <div class="mb-8">
              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
              <div class="flex items-center text-gray-600">
                <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                <span class="mx-2">•</span>
                <span>{{ post.readingTime }} min read</span>
              </div>
            </div>

            <!-- Article Content -->
            <div 
              class="prose prose-lg max-w-none"
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{ opacity: 1, transition: { delay: 300 } }"
            >
              <ContentRenderer :value="post" />
            </div>

            <!-- Tags -->
            <div v-if="post.tags" class="mt-8 pt-8 border-t border-gray-200">
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </article>

        <!-- Related Posts -->
        <section 
          v-if="relatedPosts?.length"
          class="mt-12"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NuxtLink 
              v-for="relatedPost in relatedPosts" 
              :key="relatedPost._path"
              :to="relatedPost._path"
              class="group"
            >
              <div class="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 group-hover:scale-102">
                <img :src="relatedPost.image" :alt="relatedPost.title" class="w-full h-48 object-cover" />
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {{ relatedPost.title }}
                  </h3>
                  <time class="text-sm text-gray-500">{{ formatDate(relatedPost.date) }}</time>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>
      </main>
    </template>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Footer from '~/components/Footer.vue'

// Get the current route
const route = useRoute()

// Fetch the post data with error handling
const { data: post, pending, error } = await useAsyncData(
  `content-${route.params.slug}`,
  () => queryContent('blog').where({ _path: `/blog/${route.params.slug}` }).findOne()
)

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Back to top functionality
const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 500
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Fetch related posts if current post exists
const { data: relatedPosts } = await useAsyncData(
  'related-posts',
  async () => {
    if (!post.value?.tags?.length) return []
    
    return queryContent('blog')
      .where({ 
        _path: { $ne: `/blog/${route.params.slug}` },
        tags: { $contains: post.value.tags[0] }
      })
      .limit(2)
      .find()
  }
)

// Meta tags for SEO
useHead(() => ({
  title: post.value?.title ?? 'Post Not Found',
  meta: [
    { name: 'description', content: post.value?.excerpt ?? 'Blog post not found' },
    { property: 'og:title', content: post.value?.title ?? 'Post Not Found' },
    { property: 'og:description', content: post.value?.excerpt ?? 'Blog post not found' },
    { property: 'og:image', content: post.value?.image },
    { name: 'twitter:card', content: 'summary_large_image' },
  ].filter(meta => meta.content) // Remove meta tags with undefined content
}))
</script>

<style>
/* Custom styles for markdown content */
.prose {
  color: var(--prose-text);
}

.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4;
  color: var(--prose-headings);
}

.prose h3 {
  @apply text-xl font-semibold mt-6 mb-3;
  color: var(--prose-headings);
}

.prose p {
  @apply mb-4 leading-relaxed;
  color: var(--prose-text);
}

.prose a {
  color: var(--prose-link);
}

.prose a:hover {
  color: var(--prose-link-hover);
}

.prose pre {
  @apply p-4 rounded-lg overflow-x-auto;
  background-color: var(--prose-pre-bg);
}

.prose code {
  @apply px-1 py-0.5 rounded text-sm;
  background-color: var(--prose-code-block-bg);
  color: var(--prose-code-inline);
}

.prose blockquote {
  @apply pl-4 italic;
  border-left: 4px solid var(--prose-blockquote-border);
  color: var(--prose-blockquote);
}

.prose ul {
  @apply list-disc list-inside mb-4;
  color: var(--prose-text);
}

.prose ol {
  @apply list-decimal list-inside mb-4;
  color: var(--prose-text);
}
</style>