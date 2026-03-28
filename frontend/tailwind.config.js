/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B1220",
        backgroundSecondary: "#111A2E",
        card: "#1A2338",
        accentBlue: "#3B82F6",
        accentTeal: "#14B8A6",
        accentAmber: "#F59E0B",
        textPrimary: "#E5E7EB",
        textSecondary: "#94A3B8",
        borderSoft: "rgba(255,255,255,0.05)"
      },
      fontFamily: {
        sans: ["\"Plus Jakarta Sans\"", "Inter", "sans-serif"]
      },
      boxShadow: {
        soft: "0 28px 80px rgba(2, 8, 23, 0.48)",
        glow: "0 18px 45px rgba(59, 130, 246, 0.22)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3B82F6, #14B8A6)"
      }
    }
  },
  plugins: []
};
