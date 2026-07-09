import type { WeeklyRecap } from './weeklyRecap'

const WIDTH = 1080
const HEIGHT = 1350
const MARGIN = 64
const PAPER = '#f3efe6'
const INK = '#1a1a1a'
const SUBINK = '#5a5650'
const RULE = '#1a1a1a'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  title: string,
  body: string,
) {
  ctx.textAlign = 'left'
  ctx.fillStyle = SUBINK
  ctx.font = '700 22px system-ui, sans-serif'
  ctx.fillText(label.toUpperCase(), x, y)

  ctx.fillStyle = INK
  ctx.font = '700 30px Georgia, serif'
  const titleLines = wrapText(ctx, title, w)
  let cursorY = y + 42
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, x, cursorY)
    cursorY += 36
  }

  ctx.fillStyle = SUBINK
  ctx.font = '400 22px Georgia, serif'
  const bodyLines = wrapText(ctx, body, w)
  for (const line of bodyLines.slice(0, 3)) {
    cursorY += 30
    ctx.fillText(line, x, cursorY)
  }
}

export function renderRecapCanvas(recap: WeeklyRecap, headline: string | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Paper background with a faint vignette for texture.
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  let y = MARGIN

  // Dateline strip
  ctx.fillStyle = SUBINK
  ctx.font = '700 20px system-ui, sans-serif'
  ctx.textAlign = 'center'
  const dateline = `WEEKLY RECAP  •  ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  •  SQUAD EDITION`
  ctx.fillText(dateline.toUpperCase(), WIDTH / 2, y)
  y += 28

  ctx.strokeStyle = RULE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(WIDTH - MARGIN, y)
  ctx.stroke()
  y += 70

  // Masthead
  ctx.fillStyle = INK
  ctx.font = '700 86px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('THE SEND IT TIMES', WIDTH / 2, y)
  y += 28

  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(WIDTH - MARGIN, y)
  ctx.stroke()
  y += 4
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(MARGIN, y + 6)
  ctx.lineTo(WIDTH - MARGIN, y + 6)
  ctx.stroke()
  y += 60

  // Headline
  ctx.fillStyle = INK
  ctx.font = '700 52px Georgia, serif'
  ctx.textAlign = 'left'
  const headlineText = headline ?? `${recap.gamesPlayed} games played across the Kingdom this week`
  const headlineLines = wrapText(ctx, headlineText, WIDTH - MARGIN * 2)
  for (const line of headlineLines.slice(0, 3)) {
    ctx.fillText(line, MARGIN, y)
    y += 58
  }
  y += 10

  ctx.fillStyle = SUBINK
  ctx.font = 'italic 400 26px Georgia, serif'
  ctx.fillText(
    `${recap.gamesPlayed} game${recap.gamesPlayed === 1 ? '' : 's'} played this week — full breakdown below.`,
    MARGIN,
    y,
  )
  y += 50

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(WIDTH - MARGIN, y)
  ctx.stroke()
  y += 60

  // Three-column briefs
  const colGap = 40
  const colWidth = (WIDTH - MARGIN * 2 - colGap * 2) / 3
  const colTop = y

  if (recap.playerOfTheWeek) {
    drawColumn(
      ctx,
      MARGIN,
      colTop,
      colWidth,
      '🏆 Player of the Week',
      recap.playerOfTheWeek.name,
      `${recap.playerOfTheWeek.wins}-${recap.playerOfTheWeek.losses} record, ${recap.playerOfTheWeek.totalYds} total yards.`,
    )
  }
  if (recap.biggestBlowout) {
    drawColumn(
      ctx,
      MARGIN + colWidth + colGap,
      colTop,
      colWidth,
      '💥 Biggest Blowout',
      `${recap.biggestBlowout.winnerName} def. ${recap.biggestBlowout.loserName}`,
      `Final: ${recap.biggestBlowout.winnerScore}-${recap.biggestBlowout.loserScore} (${recap.biggestBlowout.margin}-pt margin).`,
    )
  }
  if (recap.yardageLeader) {
    drawColumn(
      ctx,
      MARGIN + (colWidth + colGap) * 2,
      colTop,
      colWidth,
      '📊 Yardage Leader',
      recap.yardageLeader.name,
      `${recap.yardageLeader.yards} total yards this week.`,
    )
  }

  // Column dividers
  ctx.strokeStyle = '#cfc8b8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(MARGIN + colWidth + colGap / 2, colTop - 10)
  ctx.lineTo(MARGIN + colWidth + colGap / 2, colTop + 180)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(MARGIN + (colWidth + colGap) * 2 - colGap / 2, colTop - 10)
  ctx.lineTo(MARGIN + (colWidth + colGap) * 2 - colGap / 2, colTop + 180)
  ctx.stroke()

  // Footer
  ctx.strokeStyle = RULE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, HEIGHT - MARGIN - 30)
  ctx.lineTo(WIDTH - MARGIN, HEIGHT - MARGIN - 30)
  ctx.stroke()

  ctx.fillStyle = SUBINK
  ctx.font = '700 20px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SEND IT!  —  TRACK YOUR SQUAD, SETTLE THE ARGUMENTS', WIDTH / 2, HEIGHT - MARGIN)

  return canvas
}

export async function shareOrDownloadRecap(recap: WeeklyRecap, headline: string | null) {
  const canvas = renderRecapCanvas(recap, headline)
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const file = new File([blob], 'send-it-weekly-recap.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Send It! Weekly Recap' })
      return
    } catch {
      // User cancelled the share sheet — fall through to download.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'send-it-weekly-recap.png'
  a.click()
  URL.revokeObjectURL(url)
}
