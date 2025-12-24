<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Task Completion</h3>
      <div class="flex gap-2">
        <select
          v-model="selectedPeriod"
          @change="updateChart"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          v-model="chartType"
          @change="updateChart"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
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
      :is="chartType === 'line' ? Line : Bar"
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { Task } from '../../models/Task'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')
const chartType = ref<'line' | 'bar'>('line')

const chartData = computed(() => {
  const labels = generateLabels()
  const completedData = calculateCompletedTasks(labels)
  
  return {
    labels,
    datasets: [
      {
        label: 'Completed Tasks',
        data: completedData,
        borderColor: '#10b981',
        backgroundColor: chartType.value === 'bar' 
          ? 'rgba(16, 185, 129, 0.8)' 
          : 'rgba(16, 185, 129, 0.1)',
        fill: chartType.value === 'line',
        tension: 0.4,
        borderRadius: chartType.value === 'bar' ? 8 : 0
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          family: 'Inter',
          size: 12
        }
      }
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
    y: {
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
    x: {
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

function generateLabels(): string[] {
  const labels: string[] = []
  const now = new Date()
  
  if (selectedPeriod.value === 'daily') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
  } else if (selectedPeriod.value === 'weekly') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - (i * 7))
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      labels.push(`Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
    }
  } else {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
    }
  }
  
  return labels
}

function calculateCompletedTasks(labels: string[]): number[] {
  const completedTasks = props.tasks.filter(t => t.status === 'completed' && t.completedAt)
  
  return labels.map(label => {
    if (selectedPeriod.value === 'daily') {
      // Count tasks completed on this day
      const parts = label.split(', ')
      if (parts.length < 2) return 0
      const dateStr = parts[1] // Extract date part
      if (!dateStr) return 0
      try {
        return completedTasks.filter(task => {
          if (!task.completedAt) return false
          const taskDate = new Date(task.completedAt)
          const labelDate = new Date(dateStr.trim())
          if (isNaN(labelDate.getTime())) return false
          return taskDate.toDateString() === labelDate.toDateString()
        }).length
      } catch {
        return 0
      }
    } else if (selectedPeriod.value === 'weekly') {
      // Count tasks completed in this week
      const weekIndex = labels.indexOf(label)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - ((3 - weekIndex) * 7))
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      return completedTasks.filter(task => {
        if (!task.completedAt) return false
        const taskDate = new Date(task.completedAt)
        return taskDate >= weekStart && taskDate <= weekEnd
      }).length
    } else {
      // Count tasks completed in this month
      const monthIndex = labels.indexOf(label)
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() - (5 - monthIndex))
      
      return completedTasks.filter(task => {
        if (!task.completedAt) return false
        const taskDate = new Date(task.completedAt)
        return taskDate.getMonth() === targetDate.getMonth() && 
               taskDate.getFullYear() === targetDate.getFullYear()
      }).length
    }
  })
}

function updateChart() {
  // Chart will automatically update via computed property
}

function exportData() {
  const data = chartData.value
  const dataset = data.datasets[0]
  if (!dataset) return
  
  const csv = [
    ['Period', 'Completed Tasks'],
    ...data.labels.map((label, index) => [label, (dataset.data[index] || 0).toString()])
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-completion-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

