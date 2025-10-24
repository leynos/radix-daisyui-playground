/** @type {import("tailwindcss").Config} */
const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};

module.exports = config;
