// Friendly auto-generated display names. When a user starts hosting (or first
// opens the name prompt) we suggest one of these so there's always a sensible
// default they can keep or edit — never a blank field, never anonymous.

const ADJECTIVES = [
  'Brisk', 'Calm', 'Clever', 'Bright', 'Swift', 'Bold', 'Keen', 'Lucid',
  'Nimble', 'Quiet', 'Sharp', 'Sunny', 'Witty', 'Mellow', 'Brave', 'Cosmic',
  'Amber', 'Coral', 'Jade', 'Slate', 'Vivid', 'Crisp', 'Noble', 'Plucky',
];

const ANIMALS = [
  'Otter', 'Heron', 'Falcon', 'Lynx', 'Fox', 'Wren', 'Marten', 'Ibis',
  'Tapir', 'Crane', 'Bison', 'Gecko', 'Raven', 'Koala', 'Panther', 'Stork',
  'Badger', 'Mantis', 'Orca', 'Finch', 'Hawk', 'Civet', 'Egret', 'Vireo',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * A friendly handle in `Name#1234` form, e.g. "BriskOtter#4821". The 4-digit
 * discriminator keeps two people who pick the same base name distinguishable in
 * a shared session. Always ≤ 40 chars.
 */
export function generateUsername(): string {
  const num = 1000 + Math.floor(Math.random() * 9000); // 1000–9999
  return `${pick(ADJECTIVES)}${pick(ANIMALS)}#${num}`;
}
