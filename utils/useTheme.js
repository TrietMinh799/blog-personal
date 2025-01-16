import { ref, onMounted, watch } from 'vue'

export const useTheme = () => {
    const currentTheme = ref('morning')

    const getThemeByTime = () => {
        const hour = new Date().getHours()

        if (hour >= 6 && hour < 16) {
            return 'morning'
        } else if (hour >= 16 && hour < 20) {
            return 'evening'
        } else {
            return 'night'
        }
    }

    const updateTheme = () => {
        currentTheme.value = getThemeByTime()

        // Apply theme classes to body
        document.body.classList.remove('theme-morning', 'theme-evening', 'theme-night')
        document.body.classList.add(`theme-${currentTheme.value}`)
    }

    // Update theme every minute
    let interval
    onMounted(() => {
        updateTheme()
        interval = setInterval(updateTheme, 60000) // Check every minute
    })

    onUnmounted(() => {
        if (interval) clearInterval(interval)
    })

    return {
        currentTheme
    }
}