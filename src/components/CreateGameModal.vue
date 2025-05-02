<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VModal from '@/components/atoms/VModal.vue'
import { type Ref, ref } from 'vue'
import XButton from '@/components/atoms/XButton.vue'
import { client } from '@/utils/mpClient.ts'
import XInput from '@/components/atoms/XInput.vue'
import $ from '@/global'

const { t }: any = useI18n({ useScope: 'local' })

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(['close', 'created-room'])

const gameName: Ref<string> = ref(($.isDebug && 'Smash Club') || '')

const createGame = () => {
  if (gameName.value.length < 3) {
    return
  }

  client.createRoom(gameName.value, {
    maxPlayers: 8,
    roomTTL: 300000 /* 5 min */,
  })

  emit('close')
  emit('created-room', gameName.value)
}

const onClose = () => {
  emit('close')
}
</script>

<template>
  <VModal
    v-if="show"
    :is-dialog="true"
    @close="onClose"
  >
    <template #title>
      <h1 class="mb-4 text-2xl">{{ t('title') }}</h1>
    </template>
    <template #description>
      <div class="w-full max-w-80 flex flex-col justify-between items-center gap-2">
        <div class="w-full">
          <div class="flex justify-center mb-4">
            <XInput
              v-model="gameName"
              autofocus
              class="name w-48 text-white focus:text-white rounded-3xl !rounded-r-none leading-[1rem]"
              :placeholder="`Smash battle ${Math.round(Math.random() * 1000)}`"
              @keydown.enter="createGame"
            />
            <XButton
              class="!rounded-l-none input-button with-bg leading-[1rem]"
              :class="{ 'bg-gray-200 text-black border-green-500 pointer-disabled': gameName?.length < 3 }"
              @click="createGame"
              @keydown.enter="createGame"
            >
              {{ t('createGame') }}
            </XButton>
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="flex flex-col justify-center items-center gap-4">
        <!--        <XButton @click="client.leaveRoom">{{ t('leaveGame') }}</XButton>-->
        <XButton @click="onClose">{{ t('close') }}</XButton>
      </div>
    </template>
  </VModal>
</template>

<style scoped lang="scss"></style>

<i18n>
en:
  title: "Create a new Game"
  createGame: "Create Game"
  leaveGame: "Leave Game"
  gameName: "Game name"
de:
  title: "Neues Spiel erstellen"
  createGame: "Spiel Erstellen"
  leaveGame: "Spiel Verlassen"
  gameName: "Spielname"
</i18n>
