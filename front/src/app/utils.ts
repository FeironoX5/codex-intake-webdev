export const PROMPT_PLACEHOLDERS = [
  { title: 'City Explorer', message: 'Suggest walking tours in Paris' },
  { title: 'Nature Lover', message: 'Best hiking trails with scenic views' },
  {
    title: 'History Buff',
    message: 'Historical sites from ancient civilizations',
  },
  { title: 'Food Tour', message: 'Local food and street market experiences' },
  {
    title: 'Adventure Seek',
    message: 'Extreme sports and adventure activities',
  },
  {
    title: 'Cultural Immersion',
    message: 'Traditional festivals and local customs',
  },
  { title: 'Budget Travel', message: 'Affordable tour options under $50' },
  { title: 'Family Fun', message: 'Kid-friendly activities and attractions' },
  { title: 'Romantic Getaway', message: 'Couples retreats and romantic spots' },
  { title: 'Photography Tour', message: 'Most Instagrammable locations' },
  { title: 'Weekend Escape', message: 'Short trips for busy schedules' },
  { title: 'Luxury Experience', message: 'Premium tours and exclusive access' },
  { title: 'Hidden Gems', message: 'Lesser-known spots away from crowds' },
  { title: 'Seasonal Special', message: 'Best tours for current season' },
  { title: 'Local Guide', message: 'Experiences with native tour guides' },
];

export function randomRGB(): string {
  return `rgb(${Math.floor(Math.random() * 70)}, ${Math.floor(Math.random() * 70)}, ${Math.floor(Math.random() * 70)})`;
}

export function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
