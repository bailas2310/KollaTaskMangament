<template>
  <div class="flex items-center justify-center p-8" :class="sizeClass">
    <div class="relative">
      <div
        class="animate-spin rounded-full border-b-2 border-primary-start"
        :class="spinnerSizeClass"
      ></div>
      <div
        v-if="showText"
        class="mt-4 text-sm text-neutral-500 text-center"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'Loading...',
  showText: true
})

const sizeClass = computed(() => {
  const classes = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  }
  return classes[props.size]
})

const spinnerSizeClass = computed(() => {
  const classes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  return classes[props.size]
})
</script>

