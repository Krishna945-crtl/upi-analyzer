import { createContext, useContext, useState } from 'react'

// 🎨 Mana 3 themes — light (cream), greenDark (blackish green), blueDark (old one)
const themes = {

  // 🍦 Cream white light theme — soft ga, warm ga untundi
  light: {
    name: 'light',
    bg: '#faf6f0',           // cream page background
    cardBg: '#fff8f0',       // warm card
    text: '#1a1a0f',         // deep warm black
    subtext: '#7a6f5a',      // muted warm brown
    border: '#e8dfd0',       // cream border
    accent: '#2d7a4f',       // forest green — dark theme tho match avutundi 🌿
    navBg: '#fff8f0',
    inputBg: '#f5ede0',      // soft cream input
    shadow: '0 4px 24px rgba(45,122,79,0.08)',
  },

  // 🖤🟢 Blackish green dark theme — main theme mandi!
  greenDark: {
    name: 'greenDark',
    bg: '#060f08',           // near-black green — chala deep 🖤
    cardBg: '#0c1a0e',       // dark card background
    text: '#d4f0dc',         // soft green-white text
    subtext: '#5a8c66',      // muted green subtext
    border: '#1a3522',       // dark green border
    accent: '#22c55e',       // bright green accent 💚
    navBg: '#0c1a0e',
    inputBg: '#091208',      // deepest black-green for inputs
    shadow: '0 4px 32px rgba(34,197,94,0.10)',
  },

  // 💙 Blue dark — patha theme, keep chesamu just in case
  blueDark: {
    name: 'blueDark',
    bg: '#0a0f1e',
    cardBg: '#0d1526',
    text: '#e2e8f0',
    subtext: '#94a3b8',
    border: '#1e2d4a',
    accent: '#3b82f6',
    navBg: '#0d1526',
    inputBg: '#111827',
    shadow: '0 4px 24px rgba(59,130,246,0.08)',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // 🟢 Default ni greenDark పెట్టాం — mana new theme!
  const [currentTheme, setCurrentTheme] = useState('light') // 🍦 default light

  function switchTheme(themeName) {
    setCurrentTheme(themeName) // 🔄 theme switch cheyyadam
  }

  return (
    <ThemeContext.Provider value={{
      theme: themes[currentTheme],
      currentTheme,
      switchTheme,
      themes,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 🪝 Custom hook — components lo easy ga theme teesukodaniki
export function useTheme() {
  return useContext(ThemeContext)
}