import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "from-blue-500", "to-blue-600",
    "from-emerald-500", "to-emerald-600",
    "from-purple-500", "to-purple-600",
    "from-orange-500", "to-orange-600",
    "from-yellow-500", "to-yellow-600",
    "from-red-500", "to-red-600",
    "from-cyan-500", "to-cyan-600",
    "from-amber-500", "to-amber-600",
    "from-slate-700", "to-slate-800",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
