<template>
  <input
    class="focus:text-white"
    :value="model"
    :class="{
      glass: true,
      '!cursor-none': IS_FAIRY_SMASH_ROYALE,
    }"
    :placeholder="placeholder"
    @click="emit('click', $event)"
    @input="onInput"
    @focus="isSelectAll && selectAll($el)"
  />
</template>

<script setup lang="ts">
import { IS_FAIRY_SMASH_ROYALE } from '@/utils/constants.ts'

defineProps({
  isSelectAll: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const model = defineModel()
const onInput = (event: InputEvent) => {
  model.value = event.target.value
}
const emit = defineEmits(['click'])
const selectAll = (node: any) => {
  node.select()
}
</script>
