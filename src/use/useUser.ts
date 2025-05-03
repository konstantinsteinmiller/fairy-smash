import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import useUserDb from '@/use/useUserDb'
import { GAME_USER_NAME_LABEL } from '@/utils/constants'
import { client } from '@/utils/mpClient.ts'

const userSoundVolume: Ref<number> = ref(0.7)
const userMusicVolume: Ref<number> = ref(0.05)
const userMouseSensitivity: Ref<number> = ref(0.4)
const userLanguage: Ref<string> = ref(navigator?.language?.split('-')[0] || 'en')
const localStorageUserName = localStorage.getItem(GAME_USER_NAME_LABEL)
const userPlayerName: Ref<string> = ref(localStorageUserName ?? `AwesomePlayer${Math.ceil(Math.random() * 1000)}`)
const userFairyDust: Ref<number> = ref(0)

const userTutorialsDoneMap: Ref<any> = ref('{}')
const tutorialPhase: Ref<string> = ref('')
const allowTutorial: Ref<boolean> = ref(true)

/* just for after the indexDB has loaded */
watch(
  userTutorialsDoneMap,
  (newValue: any) => {
    if (newValue) {
      allowTutorial.value = !Object.keys(userTutorialsDoneMap.value)?.some(key => key !== 'none')
    }
  },
  { deep: true, once: true }
)

const useUser = () => {
  const { storeUser } = useUserDb({
    userPlayerName,
    userSoundVolume,
    userMusicVolume,
    userMouseSensitivity,
    userLanguage,
    userFairyDust,
    userTutorialsDoneMap,
  })
  const setSettingValue = (name: string, value: any) => {
    let intermediate = ''
    if (name === 'language') {
      value = `'${value}'`
    }
    if (name === 'tutorialsDoneMap') {
      value = JSON.stringify(value)
    }
    if (name === 'playerName') {
      intermediate = value
      value = JSON.stringify(value)
    }

    eval(`user${name[0].toUpperCase()}${name.slice(1)}.value = ${value}`)

    if (name === 'playerName') {
      userPlayerName.value = intermediate
      client.myActor().setName(userPlayerName.value)
    }

    storeUser({
      userPlayerName: userPlayerName.value,
      userSoundVolume: +userSoundVolume.value,
      userMusicVolume: +userMusicVolume.value,
      userMouseSensitivity: +userMouseSensitivity.value,
      userLanguage: userLanguage.value,
      userFairyDust: +userFairyDust.value,
      userTutorialsDoneMap: userTutorialsDoneMap.value,
    })
  }

  return {
    userPlayerName,
    userSoundVolume,
    userMusicVolume,
    userMouseSensitivity,
    userLanguage,
    userFairyDust,
    userTutorialsDoneMap,
    tutorialPhase,
    allowTutorial,
    setSettingValue,
  }
}

export default useUser
