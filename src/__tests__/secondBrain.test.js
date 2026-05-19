import { describe, it, expect } from 'vitest'
import { classifyWaste } from '../services/secondBrain'

describe('classifyWaste', () => {
  it('classifies aluminum can from description', async () => {
    const result = await classifyWaste('aluminum can drink')
    expect(result.materialType).toBe('aluminum_can')
    expect(['A', 'B', 'C']).toContain(result.grade)
  })

  it('classifies PET bottle from description', async () => {
    const result = await classifyWaste('clear pet bottle water')
    expect(result.materialType).toBe('pet_bottle_clear')
  })

  it('classifies copper wire', async () => {
    const result = await classifyWaste('copper wire electrical')
    expect(result.materialType).toBe('copper')
  })

  it('classifies glass bottle', async () => {
    const result = await classifyWaste('glass bottle beer')
    expect(result.materialType).toBe('glass')
  })

  it('falls back to mock when no apiKey', async () => {
    const result = await classifyWaste('glass bottle', { model: 'claude-haiku-4-5', apiKey: null })
    expect(['mock', 'mock-fallback']).toContain(result.source)
  })

  it('returns confidence between 0 and 1', async () => {
    const result = await classifyWaste('cardboard box')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('returns estimatedWeight as number', async () => {
    const result = await classifyWaste('newspaper stack')
    expect(typeof result.estimatedWeight).toBe('number')
    expect(result.estimatedWeight).toBeGreaterThan(0)
  })
})
