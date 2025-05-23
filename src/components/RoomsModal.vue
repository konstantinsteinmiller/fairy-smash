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
const emit = defineEmits(['close', 'joined-room'])

const roomsList: Ref<RoomInfo[]> = ref([])

const refreshRooms = () => {
  const rooms = client.availableRooms()
  roomsList.value = rooms.slice(0).filter((room: RoomInfo) => {
    return !room.getCustomProperties()?.hasMatchStarted
  })

  client.showAvailableRooms(rooms => {})
}

client.on('joinedLobby', () => {
  refreshRooms()
})
client.on('joinedRoom', roomName => {
  emit('close')
  emit('joined-room', roomName)
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
    :is-dialog="true"
    class="!w-auto px-8 py-6"
    @close="onClose"
  >
    <template #title>
      <h1 class="mb-2 text-2xl">{{ t('title') }}</h1>
    </template>
    <template #description>
      <div
        class="w-full mb-6 pr-2 max-w-80 flex flex-col justify-between items-center gap-2 max-h-80 overscroll-auto overflow-y-auto overflow-x-hidden"
      >
        <div class="grid grid-cols-3 w-full">
          <h5 class="col-span-1 text-l flex items-center justify-start text-left">{{ t('gameName') }}</h5>
          <h5 class="col-span-1 text-md flex items-center justify-center">{{ t('players') }}</h5>
        </div>
        <div
          v-for="(room, index) in roomsList"
          :key="index"
          class="grid grid-cols-3 w-full"
        >
          <h4 class="col-span-1 !text-sm flex items-center justify-start text-left text-green-500">
            {{ room.getCustomProperties()?.isOverDriveMode ? t('overdrive') : '' }}{{ t(room.name) }}
          </h4>
          <div class="col-span-1 text-md flex items-center justify-center text-green-500">
            {{ `${t(room.playerCount)} / 8` }}
          </div>
          <XButton @click="client.joinRoom(room.name, { createIfNotExists: true })">{{ t('joinGame') }}</XButton>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="flex justify-center items-center gap-4">
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
  refresh: "Refresh Game List"
  gameName: "Name"
de:
  title: "Spiele"
  joinGame: "Beitreten"
  refresh: "Spiele Liste Aktualisieren"
  gameName: "Name"
</i18n>
