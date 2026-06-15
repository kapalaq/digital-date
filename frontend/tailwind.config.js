// frontend/tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "dn-bg":          "#10102e",
        "dn-surface":     "#1c1c3b",
        "dn-surface-lo":  "#181836",
        "dn-surface-hi":  "#272746",
        "dn-surface-top": "#323251",
        "dn-rose":        "#ffb0cf",
        "dn-rose-bright": "#ff7eb9",
        "dn-violet":      "#cabeff",
        "dn-amber":       "#ffb951",
        "dn-text":        "#e2dfff",
        "dn-muted":       "#dac0c8",
        "dn-outline":     "#a28b92",
      },
      borderRadius: {
        pill:    "9999px",
        card:    "1.5rem",
        "card-lg": "2rem",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans:    ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
