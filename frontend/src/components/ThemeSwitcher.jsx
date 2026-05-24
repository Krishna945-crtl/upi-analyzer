import { useTheme } from '../context/ThemeContext'

// 🎨 theme switcher — 3 themes మధ్య switch cheyyadaniki
function ThemeSwitcher() {
  const { currentTheme, switchTheme, theme } = useTheme()

  // available themes — icon + label + color
  const themeOptions = [
    { key: 'light',     label: '☀️', title: 'Light'      },
    { key: 'blueDark',  label: '🌑', title: 'Blue Dark'  },
    { key: 'greenDark', label: '🌿', title: 'Green Dark' },
  ]

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-full"
      style={{
        backgroundColor: theme.inputBg,
        border: `1px solid ${theme.border}`,
      }}
    >
      {themeOptions.map((t) => (
        <button
          key={t.key}
          onClick={() => switchTheme(t.key)}
          title={t.title}
          className="w-8 h-8 rounded-full text-sm transition-all duration-200 flex items-center justify-center"
          style={{
            backgroundColor: currentTheme === t.key ? theme.accent : 'transparent',
            // active theme highlight avutundi
            transform: currentTheme === t.key ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher