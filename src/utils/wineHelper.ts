import wineData from '@/data/wine_knowledge.json'
import type { Wine, WineDatabase } from '@/types'

const db = wineData as WineDatabase

export function getRandomWine(): Wine {
  const wines = db.wines
  return wines[Math.floor(Math.random() * wines.length)]
}

export function searchWine(query: string): Wine[] {
  const q = query.toLowerCase()
  return db.wines.filter(wine =>
    wine.name.includes(q) ||
    wine.tags.some(tag => tag.includes(q)) ||
    wine.category.includes(q) ||
    wine.subcategory.includes(q)
  )
}

export function findWineByName(name: string): Wine | undefined {
  const q = name.toLowerCase().trim()
  return db.wines.find(wine =>
    wine.name.toLowerCase().includes(q) ||
    q.includes(wine.name.toLowerCase())
  )
}

export function getWineById(id: string): Wine | undefined {
  return db.wines.find(w => w.id === id)
}

export function generateWineIntro(wine: Wine): string {
  const facts = wine.fun_facts
  const randomFact = facts[Math.floor(Math.random() * facts.length)]

  return `好嘞！这杯${wine.name}给你满上～来来来，先干一个！🍷\n\n${wine.name}产自${wine.origin}，酒精度约${wine.alcohol_content}。\n\n${wine.history}\n\n酿造上，${wine.brewing_process}\n\n喝起来呢，${wine.tasting_notes}\n\n文化里，${wine.culture}\n\n对了，${randomFact}\n\n慢慢品，这2稻米花得值！`
}

export function getDrinkingTip(): string {
  const tips = db.drinking_tips
  return tips[Math.floor(Math.random() * tips.length)]
}

export function getAllCategories(): string[] {
  return Object.keys(db.categories)
}

export function getWinesByCategory(category: string): Wine[] {
  return db.wines.filter(w => w.category === category)
}

export { db as wineDatabase }
