/** @type {import("tailwindcss").Config} */
const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "business",
      "dark",
      "corporate",
      "emerald",
      "cupcake",
      "dracula",
      "forest",
      "retro",
      "synthwave",
      "wireframe",
      "aqua",
      "dim",
      "lofi",
      "nord",
      "coffee",
    ],
  },
};

module.exports = config;
