<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Team Workload</h3>
      <select
        v-model="selectedTimeline"
        @change="updateChart"
        class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
    <Line
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const selectedTimeline = ref<'day' | 'week' | 'month'>('week')

const chartData = computed(() => {
  const labels = generateLabels()
  
  // Generate realistic 4-week workload data
  // Week 1: Lower workload, gradually increasing
  // Week 2-3: Peak workload
  // Week 4: Slight decrease
  
  const assignedHours = labels.map((_, index) => {
    if (selectedTimeline.value === 'week') {
      // Daily: 6-10 hours per day
      return Math.floor(Math.random() * 5) + 6
    } else if (selectedTimeline.value === 'month') {
      // Weekly: 25-40 hours per week
      const weekIndex = Math.floor(index / 7)
      const baseHours = weekIndex < 1 ? 25 : weekIndex < 3 ? 35 : 30
      return baseHours + Math.floor(Math.random() * 8) - 4
    } else {
      // Daily over month: 6-10 hours
      return Math.floor(Math.random() * 5) + 6
    }
  })
  
  const completedHours = labels.map((_, i) => {
    const assigned = assignedHours[i]
    if (!assigned) return 0
    // 60-85% completion rate
    return Math.floor(assigned * (0.6 + Math.random() * 0.25))
  })
  
  const capacity = labels.map(() => {
    // 40 hours per week, adjust for timeline
    if (selectedTimeline.value === 'day') {
      return 8 // 8 hours per day
    } else if (selectedTimeline.value === 'week') {
      return 40 // 40 hours per week
    } else {
      return 160 // 160 hours per month (4 weeks)
    }
  })

  return {
    labels,
    datasets: [
      {
        label: 'Assigned Hours',
        data: assignedHours,
        borderColor: '#49C4A6',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'Completed Hours',
        data: completedHours,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'Capacity',
        data: capacity,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0
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
  const count = selectedTimeline.value === 'day' ? 24 : selectedTimeline.value === 'week' ? 7 : 30
  const labels: string[] = []
  
  if (selectedTimeline.value === 'day') {
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`)
    }
  } else if (selectedTimeline.value === 'week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    labels.push(...days)
  } else {
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
  }
  return labels
}

function updateChart() {
  // Chart will automatically update via computed property
}
</script>

