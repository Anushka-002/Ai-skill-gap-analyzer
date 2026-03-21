/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:'#f0f4ff',100:'#dde6ff',200:'#c2d1ff',300:'#9cb2ff',
          400:'#7088ff',500:'#4f5eff',600:'#3d3ef5',700:'#312ed8',
          800:'#2828ae',900:'#252789',
        },
        accent: {
          cyan:'#00e5ff',violet:'#8b5cf6',emerald:'#10b981',amber:'#f59e0b',rose:'#f43f5e',
        },
        dark: {
          900:'#050508',800:'#0c0c14',700:'#12121e',600:'#1a1a2e',500:'#22223d',400:'#2e2e50',
        },
      },
      animation: {
        'fade-up':'fadeUp 0.5s ease forwards',
        'fade-in':'fadeIn 0.4s ease forwards',
        'pulse-glow':'pulseGlow 2s ease-in-out infinite',
        'float':'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:{from:{opacity:0,transform:'translateY(20px)'},to:{opacity:1,transform:'translateY(0)'}},
        fadeIn:{from:{opacity:0},to:{opacity:1}},
        pulseGlow:{'0%,100%':{boxShadow:'0 0 20px rgba(79,94,255,0.3)'},'50%':{boxShadow:'0 0 40px rgba(79,94,255,0.6)'}},
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'}},
      },
    },
  },
  plugins: [],
}