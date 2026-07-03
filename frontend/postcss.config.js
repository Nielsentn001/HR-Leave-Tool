// PostCSS is the pipeline that actually turns Tailwind's @tailwind
// directives (in index.css) into real CSS, then runs autoprefixer to add
// vendor prefixes for browser compatibility.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
