import game from '@/Game.ts'
import { ref } from 'vue'
import type { Ref } from 'vue'

const isStartingGame: Ref<boolean> = ref(false)
const isSplashScreenVisible: Ref<boolean> = ref(true)
const isDbInitialized: Ref<boolean> = ref(false)
const levelType: Ref<string> = ref('')

const controls: any = ref({
  show: false,
  isLeftMouseButton: true,
  isRightMouseButton: false,
  isTap: false,
  x: '0px',
  y: '0px',
})

const useMatch = () => {
  const resetMatch = () => {}

  const routes = ['/battle']
  if (!isStartingGame.value && routes.some(route => window.location.hash.includes(route))) {
    let themeQuery = ''

    if (window.location.hash.includes('debug=')) {
      const queries = window.location.hash.split('?')[1]?.split('&')
      themeQuery = `?${queries.find(query => query.includes('debug'))}`
    }
    window.location.pathname = '/'
    window.location.hash = `#/${themeQuery}`
    window.location.reload()
  }

  return {
    resetMatch,
    isStartingGame,
    isSplashScreenVisible,
    isDbInitialized,
    controls,
    levelType,
    game,
  }
}

export default useMatch
