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

export function getWineById(id: string): Wine | undefined {
  return db.wines.find(w => w.id === id)
}

export function generateWineIntro(wine: Wine): string {
  const facts = wine.fun_facts
  const randomFact = facts[Math.floor(Math.random() * facts.length)]
  return `这杯是【${wine.name}】，产自${wine.origin}。${wine.history.substring(0, 60)}...它的口感${wine.tasting_notes.substring(0, 50)}...对了，${randomFact}。来，干了这杯，这可是花了2稻米换来的，慢慢品！`
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
