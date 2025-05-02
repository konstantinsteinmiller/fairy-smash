<template>
  <input
    ref="input-ref"
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
import { onMounted, useTemplateRef } from 'vue'

const props = defineProps({
  isSelectAll: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  autofocus: {
    type: Boolean,
    default: false,
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

const inputRef = useTemplateRef('input-ref')
props.autofocus &&
  onMounted(() => {
    console.log('gameNameRef.value?.focus: ', inputRef.value, inputRef.value?.focus)
    inputRef.value?.focus()
  })
</script>
