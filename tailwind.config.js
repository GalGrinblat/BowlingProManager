export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Enable direction variants for RTL support
  corePlugins: {
    // This ensures Tailwind utilities respect the dir attribute
  }
}
