<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Priority Distribution</h3>
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
    <Bar
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { Task } from '../../models/Task'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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

const chartData = computed(() => ({
  labels: ['Immediate (≤8h)', 'Medium (8-32h)', 'Long-term (>32h)'],
  datasets: [
    {
      label: 'Tasks',
      data: [immediateCount.value, mediumCount.value, longCount.value],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderRadius: 8,
      borderSkipped: false
    }
  ]
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
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
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        stepSize: 1,
        font: {
          family: 'Inter'
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter'
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const
  }
}

function exportData() {
  const data = chartData.value
  const csv = [
    ['Priority', 'Count'],
    ['Immediate (≤8h)', immediateCount.value.toString()],
    ['Medium (8-32h)', mediumCount.value.toString()],
    ['Long-term (>32h)', longCount.value.toString()]
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `priority-distribution-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

