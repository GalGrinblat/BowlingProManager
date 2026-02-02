export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
