<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <h3 class="text-lg font-semibold text-neutral-900 mb-4">Priority Distribution</h3>
    <div class="relative">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
        class="max-h-64"
      />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <p class="text-3xl font-bold text-neutral-900">{{ totalTasks }}</p>
          <p class="text-sm text-neutral-500">Total Tasks</p>
        </div>
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <div
        v-for="(item, index) in legendItems"
        :key="index"
        class="flex items-center justify-between text-sm"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: item.color }"
          ></div>
          <span class="text-neutral-700">{{ item.label }}</span>
        </div>
        <span class="font-semibold text-neutral-900">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import type { Task } from '../../models/Task'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const immediateCount = computed(() => 
  props.tasks.filter(t => t.priority === 'immediate').length
)
const mediumCount = computed(() => 
  props.tasks.filter(t => t.priority === 'medium').length
)
const longCount = computed(() => 
  props.tasks.filter(t => t.priority === 'long').length
)
const totalTasks = computed(() => props.tasks.length)

const chartData = computed(() => ({
  labels: ['Immediate (≤8h)', 'Medium (8-32h)', 'Long-term (>32h)'],
  datasets: [
    {
      data: [immediateCount.value, mediumCount.value, longCount.value],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}))

const legendItems = computed(() => [
  { label: 'Immediate (≤8h)', value: immediateCount.value, color: '#ef4444' },
  { label: 'Medium (8-32h)', value: mediumCount.value, color: '#f59e0b' },
  { label: 'Long-term (>32h)', value: longCount.value, color: '#10b981' }
])

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        family: 'Inter',
        size: 13
      },
      bodyFont: {
        family: 'Inter',
        size: 12
      },
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  animation: {
    animateRotate: true,
    duration: 1000,
    easing: 'easeInOutQuart' as const
  }
}
</script>

