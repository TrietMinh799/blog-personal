module.exports = {
    content: [
        './components/**/*.{vue,js}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
    ],
    theme: {
        extend: {
            animation: {
                fadeIn: 'fadeIn 0.6s ease-out forwards',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography')
    ],
}