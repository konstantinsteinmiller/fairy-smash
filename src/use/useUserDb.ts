import type { Ref } from 'vue'
import useMatch from '@/use/useMatch'
import clonedeep from 'lodash.clonedeep'
import { GAME_USER_NAME_LABEL } from '@/utils/constants.ts'

let db: any

const useUserDb = ({
  userPlayerName,
  userSoundVolume,
  userMusicVolume,
  userMouseSensitivity,
  userLanguage,
  userFairyDust,
  userTutorialsDoneMap,
}: {
  userPlayerName: Ref<string>
  userSoundVolume: Ref<number>
  userMusicVolume: Ref<number>
  userMouseSensitivity: Ref<number>
  userLanguage: Ref<string>
  userFairyDust: Ref<number>
  userTutorialsDoneMap: Ref<string>
}) => {
  const { isSplashScreenVisible, isDbInitialized } = useMatch()
  // Open our database; it is created if it doesn't already exist
  const request = window.indexedDB.open('user_db', 1)

  // error handler signifies that the database didn't open successfully
  request.addEventListener('error', () => console.error('Database failed to open'))

  // success handler signifies that the database opened successfully
  request.addEventListener('success', () => {
    // Store the opened database object in the db variable. This is used a lot below
    db = request.result
    init()
  })

  // Set up the database tables if this has not already been done
  request.addEventListener('upgradeneeded', (e: any) => {
    // Grab a reference to the opened database
    const db = e.target.result

    // Create an objectStore to store our videos in (basically like a single table)
    // including a auto-incrementing key
    const objectStore = db.createObjectStore('user_os', { keyPath: 'name' })

    // Define what data items the objectStore will contain
    objectStore.createIndex('userPlayerName', 'userPlayerName', { unique: false })
    objectStore.createIndex('userSoundVolume', 'userSoundVolume', { unique: false })
    objectStore.createIndex('userMusicVolume', 'userMusicVolume', { unique: false })
    objectStore.createIndex('userMouseSensitivity', 'userMouseSensitivity', { unique: false })
    objectStore.createIndex('userLanguage', 'userLanguage', { unique: false })
    objectStore.createIndex('userFairyDust', 'userFairyDust', { unique: false })
    objectStore.createIndex('userTutorialsDoneMap', 'userTutorialsDoneMap', { unique: false })
    // console.log('Database setup complete')
  })

  function init() {
    // Open transaction, get object store, and get() each video by name
    const objectStore = db.transaction('user_os').objectStore('user_os')
    const request = objectStore.get('user')
    request.addEventListener('success', () => {
      // If the result exists in the database (is not undefined)
      // console.log('request.result: ', request.result)
      if (request.result) {
        userPlayerName.value = request.result.userPlayerName
        userSoundVolume.value = request.result.userSoundVolume
        userMusicVolume.value = request.result.userMusicVolume
        userMouseSensitivity.value = request.result.userMouseSensitivity
        userLanguage.value = request.result.userLanguage
        if (request.result.userTutorialsDoneMap) {
          userTutorialsDoneMap.value = JSON.parse(request.result.userTutorialsDoneMap)
        }
        userFairyDust.value = request.result.userFairyDust

        localStorage.setItem(GAME_USER_NAME_LABEL, userPlayerName.value)
      } else {
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
      isDbInitialized.value = true

      setTimeout(() => {
        isSplashScreenVisible.value = false
      }, 300)
    })
    request.addEventListener('error', () => {
      isSplashScreenVisible.value = false
    })
  }

  // Define the storeUser() function
  function storeUser(params: any) {
    const store = db.transaction(['user_os'], 'readwrite').objectStore('user_os')

    if (Object.keys(params.userTutorialsDoneMap)?.length) {
      const clone = clonedeep(params.userTutorialsDoneMap)
      params.userTutorialsDoneMap = JSON.stringify(clone)
    }
    if (params.userTutorialsDoneMap?.value && Object.keys(params.userTutorialsDoneMap?.value)?.length) {
      const clone = clonedeep(params.userTutorialsDoneMap?.value)
      params.userTutorialsDoneMap = JSON.stringify(clone)
    }

    const record = {
      name: 'user',
      ...params,
      // userTutorialsDoneMap: JSON.stringify(params.userTutorialsDoneMap),
    }
    const request = store.put(record)

    localStorage.setItem(GAME_USER_NAME_LABEL, params.userPlayerName)
    // request.addEventListener('success', () => console.log('Record update attempt finished'))
    request.addEventListener('error', () => console.error(request.error))
  }

  return { storeUser }
}

export default useUserDb
