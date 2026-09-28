export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#14213d", paper: "#fbfbf9", line: "#d9dde6", crit: "#b42318", high: "#d9480f", med: "#b7791f", low: "#2f6f4e" },
      fontFamily: { display: ["'Times New Roman'", "Georgia", "serif"], body: ["system-ui", "Segoe UI", "sans-serif"] },
    },
  },
  plugins: [],
};
