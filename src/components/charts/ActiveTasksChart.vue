<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Active Tasks</h3>
      <div class="flex gap-2">
        <select
          v-model="chartType"
          @change="updateChart"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="pie">Pie</option>
          <option value="doughnut">Donut</option>
        </select>
        <button
          @click="exportData"
          class="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-button transition-smooth"
          title="Export to CSV"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
    <component
      :is="chartType === 'pie' ? Pie : Doughnut"
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
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
import { ref, computed } from 'vue'
import { Pie, Doughnut } from 'vue-chartjs'
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

const chartType = ref<'pie' | 'doughnut'>('doughnut')

const pendingCount = computed(() => 
  props.tasks.filter(t => t.status === 'pending').length
)
const inProgressCount = computed(() => 
  props.tasks.filter(t => t.status === 'in_progress').length
)
const underReviewCount = computed(() => 
  props.tasks.filter(t => t.status === 'in_progress' && t.completedSteps && t.totalSteps && t.completedSteps === t.totalSteps).length
)

const totalActive = computed(() => 
  pendingCount.value + inProgressCount.value + underReviewCount.value
)

const chartData = computed(() => ({
  labels: ['To Do', 'In Progress', 'Under Review'],
  datasets: [
    {
      data: [pendingCount.value, inProgressCount.value, underReviewCount.value],
      backgroundColor: ['#64748b', '#f59e0b', '#3b82f6'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4
    }
  ]
}))

const legendItems = computed(() => [
  { label: 'To Do', value: pendingCount.value, color: '#64748b' },
  { label: 'In Progress', value: inProgressCount.value, color: '#f59e0b' },
  { label: 'Under Review', value: underReviewCount.value, color: '#3b82f6' }
])

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: chartType.value === 'doughnut' ? '60%' : 0,
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

function updateChart() {
  // Chart will automatically update via computed property
}

function exportData() {
  const data = chartData.value
  if (!data.datasets[0]) return
  
  const dataset = data.datasets[0]
  if (!dataset) return
  
  const csv = [
    ['Status', 'Count', 'Percentage'],
    ...data.labels.map((label, index) => {
      const value = dataset.data[index] || 0
      const total = totalActive.value
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
      return [label, value.toString(), `${percentage}%`]
    })
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `active-tasks-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

