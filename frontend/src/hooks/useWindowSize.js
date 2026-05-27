import { useState, useEffect } from 'react'

// 📱 Window size track cheyyadam — mobile/desktop detect kosam
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    // 🔄 Window resize chesina prathi saraa update cheyyadam
    function handleResize() {
      setWindowSize({
        width:  window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    // 🧹 Cleanup — component unmount ainapudu remove cheyyadam
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 📱 Mobile check — 768px kante takkuva aithe mobile
  const isMobile = windowSize.width < 768

  return { ...windowSize, isMobile }
}

export default useWindowSize