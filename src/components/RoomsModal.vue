<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VModal from '@/components/atoms/VModal.vue'
import { onMounted, type Ref, ref, watch } from 'vue'
import XButton from '@/components/atoms/XButton.vue'
import { client } from '@/utils/mpClient.ts'
import RoomInfo = Photon.LoadBalancing.RoomInfo

const { t }: any = useI18n({ useScope: 'local' })

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(['close'])

const roomsList: Ref<RoomInfo[]> = ref([])

const refreshRooms = () => {
  const rooms = client.availableRooms()
  roomsList.value = rooms.concat(client.myRoom())
  console.log('availableRooms: ', rooms.map(x => x.name).join(', '), ` - My: ${client.myRoom().name}`)
  // client.showAvailableRooms((rooms: RoomInfo[]) => {
  //   console.log(
  //     'Available Rooms:',
  //     rooms.map(r => r.name)
  //   )
  //   if (rooms.length > 0) {
  //     // Optionally join the first room
  //     client.joinGame(rooms[0].name)
  //   }
  // })
}

client.on('joinedLobby', () => {
  refreshRooms()
  client.createRoom(`R-${Math.round(Math.random() * 1000)}`, {
    maxPlayers: 8,
    roomTTL: 60000,
  })
})
client.on('onLeftRoom', (data: any) => {
  refreshRooms()
  console.warn('onLeftRoom: ', data)
})

onMounted(() => {
  refreshRooms()
})
watch(
  () => props.show,
  () => {
    if (props.show) {
      refreshRooms()
    }
  }
)

const onClose = () => {
  emit('close')
}
</script>

<template>
  <VModal
    v-if="show"
    @close="onClose"
  >
    <template #title>
      <h1 class="mb-2 text-2xl">{{ t('title') }}</h1>
    </template>
    <template #description>
      <div class="w-full max-w-80 flex flex-col justify-between items-center gap-2">
        <div class="grid grid-cols-3 w-full">
          <h5 class="col-span-1 text-l flex items-center justify-center">{{ t('gameName') }}</h5>
          <div class="col-span-1 text-md flex items-center justify-center text-green-500">{{ t('maxPlayers') }}</div>
        </div>
        <div
          v-for="(room, index) in roomsList"
          :key="index"
          class="grid grid-cols-3 w-full"
        >
          <h5 class="col-span-1 text-l flex items-center justify-center text-green-500">{{ t(room.name) }}</h5>
          <div class="col-span-1 text-md flex items-center justify-center text-green-500">
            {{ `${t(room.playerCount)}${t(room.maxPlayers)}` }}
          </div>
          <XButton @click="client.joinRoom(room.name, { createIfNotExists: true })">{{ t('joinGame') }}</XButton>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="flex flex-col justify-center items-center gap-4">
        <XButton @click="client.leaveRoom">{{ t('leaveGame') }}</XButton>
        <XButton @click="refreshRooms">{{ t('refresh') }}</XButton>
        <XButton @click="onClose">{{ t('close') }}</XButton>
      </div>
    </template>
  </VModal>
</template>

<style scoped lang="scss"></style>

<i18n>
en:
  title: "Games"
  joinGame: "Join"
  leaveGame: "Leave Game"
  refresh: "Refresh Game List"
  gameName: "Name"
  maxPlayers: "Max. Players"
de:
  title: "Spiele"
  joinGame: "Beitreten"
  leaveGame: "Spiel Verlassen"
  refresh: "Spiele Liste Aktualisieren"
  gameName: "Name"
  maxPlayers: "Max. Spieler"
</i18n>
