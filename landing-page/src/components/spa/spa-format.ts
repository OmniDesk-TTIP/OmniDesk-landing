// Indexed like Date#getDay: 0 = domingo … 6 = sábado.
const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

// The week starts on Monday, so Sunday goes last.
const mondayFirst = (weekday: number) => (weekday + 6) % 7

const joinList = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}` : (items[0] ?? '')

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase('es') + text.slice(1)

export const formatPrice = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format

export const formatDuration = (minutes: number) => {
  if (minutes <= 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

// "Todos los días", "Lunes a viernes", "Lunes, miércoles y viernes", "Lunes a miércoles y sábado".
export const formatWeekdays = (weekdays: number[]) => {
  const days = [...new Set(weekdays)].filter((day) => day >= 0 && day <= 6).sort((a, b) => mondayFirst(a) - mondayFirst(b))
  if (days.length === 7) return 'Todos los días'
  if (!days.length) return ''

  const runs: number[][] = []
  for (const day of days) {
    const run = runs[runs.length - 1]
    if (run && mondayFirst(day) === mondayFirst(run[run.length - 1]) + 1) run.push(day)
    else runs.push([day])
  }

  const parts = runs.flatMap((run) =>
    run.length >= 3
      ? [`${WEEKDAY_NAMES[run[0]]} a ${WEEKDAY_NAMES[run[run.length - 1]]}`]
      : run.map((day) => WEEKDAY_NAMES[day]),
  )
  return capitalize(joinList(parts))
}

export const formatSchedule = (weekdays: number[], opensAt: string, closesAt: string) => {
  const days = formatWeekdays(weekdays)
  const hours = `de ${opensAt} a ${closesAt}`
  return days ? `${days}, ${hours}` : capitalize(hours)
}
