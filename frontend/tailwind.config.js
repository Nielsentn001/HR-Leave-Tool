/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files for class names (e.g. className="text-2xl")
  // and only generates CSS for classes actually used — keeping the final
  // CSS bundle small instead of shipping the entire utility library.
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
