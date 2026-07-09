export interface ParsedGameFields {
  winnerScore: number | null
  loserScore: number | null
  comebackDeficit: number | null
  passingYds: number | null
  rushingYds: number | null
  interceptions: number | null
  sacks: number | null
  interceptionTDs: number | null
  kickReturnTDs: number | null
  puntReturnTDs: number | null
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function firstNumberFrom(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return Number(match[1])
  }
  return null
}

function parseScores(text: string) {
  const scoreMatches = [...text.matchAll(/\b(\d{1,3})\b[^\n]{0,6}\b(\d{1,3})\b/g)]
  if (scoreMatches.length > 0) {
    const first = scoreMatches[0]
    return { winnerScore: Number(first[1]), loserScore: Number(first[2]) }
  }
  return { winnerScore: null, loserScore: null }
}

function parseLineValue(text: string, label: string) {
  const normalized = normalizeText(text)
  const patterns = [
    new RegExp(`${label}[^\d]{0,8}(\d{1,4})`, 'i'),
    new RegExp(`(\d{1,4})[^\d]{0,8}${label}`, 'i'),
  ]
  return firstNumberFrom(normalized, patterns)
}

export function parseStatsText(text: string): ParsedGameFields {
  const { winnerScore, loserScore } = parseScores(text)
  const comebackDeficit = firstNumberFrom(normalizeText(text), [
    /comeback[^\d]{0,8}(\d{1,3})/i,
    /down[^\d]{0,8}(\d{1,3})/i,
    /deficit[^\d]{0,8}(\d{1,3})/i,
  ])

  return {
    winnerScore,
    loserScore,
    comebackDeficit,
    passingYds: parseLineValue(text, 'passing'),
    rushingYds: parseLineValue(text, 'rushing'),
    interceptions: parseLineValue(text, 'interception'),
    sacks: parseLineValue(text, 'sack'),
    interceptionTDs: parseLineValue(text, 'int td'),
    kickReturnTDs: parseLineValue(text, 'kick return td'),
    puntReturnTDs: parseLineValue(text, 'punt return td'),
  }
}

export async function extractGameDataFromImage(file: File): Promise<ParsedGameFields> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const { data } = await worker.recognize(file)
  await worker.terminate()
  return parseStatsText(data.text)
}
