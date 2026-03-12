/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13131A",
        sand: "#F6F1E9",
        sky: "#DEF4FF",
        coral: "#FF6F61",
        moss: "#3D7A5A"
      },
      fontFamily: {
        display: ["Syne", "ui-sans-serif", "sans-serif"],
        body: ["IBM Plex Sans", "ui-sans-serif", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};
