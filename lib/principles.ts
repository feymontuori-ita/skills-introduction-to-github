// "Your daily principle": one line a day, rotating by date. Offline, no AI.
export const PRINCIPLES = [
  "The only life you can change is the one you're living today.",
  "One thought. One decision. One action at a time.",
  "Evidence beats analysis.",
  "I can take action while feeling uncomfortable.",
  "Their timeline is not my deadline.",
  "My emotional state is not my résumé.",
  "I can change the direction of the next five minutes.",
  "I don't need to audition for love.",
  "I can hold a thought without expressing it.",
  "I can't predict the future. I can live today.",
  "Consistency is the new novelty.",
  "Feel it. Don't follow it.",
  "A kept promise is louder than a perfect plan.",
  "My responsibility is to today.",
];

export function principleFor(date: Date): string {
  const start = Date.UTC(2026, 0, 1);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86_400_000);
  return PRINCIPLES[((day % PRINCIPLES.length) + PRINCIPLES.length) % PRINCIPLES.length];
}
