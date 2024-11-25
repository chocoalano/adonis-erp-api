import { DateTime } from 'luxon'

export function calculateDateRange(month: number) {
  const now = DateTime.now()

  // Calculate the "start" date: previous month, 26th day
  const startMonth = month === 1 ? 12 : month - 1 // Get the month before the specified month
  const startYear = month === 1 ? now.year - 1 : now.year // If the specified month is January, use the previous year

  const start = DateTime.fromObject({ year: startYear, month: startMonth, day: 26 }).toFormat(
    'yyyy-MM-dd'
  )

  // Calculate the "end" date: current year, given month, 26th day
  const end = now.set({ month, day: 26 }).toFormat('yyyy-MM-dd')

  return { start, end }
}

export function DateUniqueGenerator() {
  const now = DateTime.now()
  const uniqueDate = now.toFormat('yyyyLLddHHmmss')
  return uniqueDate
}

// Fungsi untuk memformat data ke dalam bentuk chart
export function formatChartData(fetch: Array<{ monthname: string; total: number }>): {
  label: string[]
  data: number[]
} {
  const chart = { label: [] as string[], data: [] as number[] }

  fetch.forEach((el) => {
    chart.data.push(el.total)
    chart.label.push(el.monthname)
  })

  return chart
}

export function getDateFormat(perday: string): string {
  switch (perday) {
    case 'tahun':
      return '%Y'
    case 'bulan':
      return '%Y-%m'
    case 'hari':
    default:
      return '%Y-%m-%d'
  }
}

export const convertToDateTime = (date: string | null): DateTime | null => {
  return date ? DateTime.fromISO(new Date(date).toISOString()) : null;
};
export const formatDateTime = (dateTime: DateTime | null): string | null => {
  return dateTime ? dateTime.toFormat('yyyy-MM-dd') : null;
};
