export const resourceRates = {
  ramPerGb: 1,
  cpuPerThread: 2,
  storagePerGb: 0.045,
}

const planDefinitions = [
  {
    id: 'minecraft-bee', name: 'Bee', icon: 'bee', ram: 1, cpu: 1, storage: 15, discountPercentage: 0, ipv4: 1, playerGuide: 4,
    note: 'First worlds', description: 'A simple starting point for a private world and a few friends.',
  },
  {
    id: 'minecraft-wolf', name: 'Wolf', icon: 'wolf', ram: 2, cpu: 2, storage: 20, discountPercentage: 2, ipv4: 1, playerGuide: 8,
    note: 'Private worlds', description: 'A lightweight server for a private survival world.',
  },
  {
    id: 'minecraft-spider', name: 'Spider', icon: 'spider', ram: 4, cpu: 2, storage: 30, discountPercentage: 4, ipv4: 1, playerGuide: 16, featured: true,
    note: 'Small groups', description: 'A balanced server for an established survival world.',
  },
  {
    id: 'minecraft-blaze', name: 'Blaze', icon: 'blaze', ram: 6, cpu: 2, storage: 40, discountPercentage: 6, ipv4: 1, playerGuide: 24,
    note: 'Growing worlds', description: 'More headroom for a growing world and a larger player group.',
  },
  {
    id: 'minecraft-slime', name: 'Slime', icon: 'slime', ram: 8, cpu: 3, storage: 50, discountPercentage: 8, ipv4: 1, playerGuide: 32,
    note: 'Active communities', description: 'A capable server for active communities and expanding worlds.',
  },
  {
    id: 'minecraft-wither', name: 'Wither', icon: 'wither', ram: 12, cpu: 4, storage: 70, discountPercentage: 10, ipv4: 1, playerGuide: 48,
    note: 'Large communities', description: 'A high-capacity server for large communities and demanding plugins.',
  },
  {
    id: 'minecraft-guardian', name: 'Guardian', icon: 'guardian', ram: 16, cpu: 4, storage: 80, discountPercentage: 12, ipv4: 1, playerGuide: 64,
    note: 'Advanced communities', description: 'Reliable capacity for advanced communities and demanding activity.',
  },
  {
    id: 'minecraft-iron-golem', name: 'Iron Golem', icon: 'iron-golem', ram: 20, cpu: 5, storage: 90, discountPercentage: 14, ipv4: 1, playerGuide: 80,
    note: 'Large modpacks', description: 'Strong resources for large modpacks and populated persistent worlds.',
  },
  {
    id: 'minecraft-warden', name: 'Warden', icon: 'warden', ram: 24, cpu: 5, storage: 100, discountPercentage: 16, ipv4: 1, playerGuide: 96,
    note: 'Modded networks', description: 'Maximum headroom for modpacks, networks, and large persistent worlds.',
  },
]

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function getNormalResourceValue(plan) {
  return roundCurrency((plan.ram * resourceRates.ramPerGb)
    + (plan.cpu * resourceRates.cpuPerThread)
    + (plan.storage * resourceRates.storagePerGb))
}

export const hostingPlans = planDefinitions.map((plan) => ({
  ...plan,
  monthlyPrice: roundCurrency(getNormalResourceValue(plan) * (1 - plan.discountPercentage / 100)),
}))

export function getBundleDiscount(plan) {
  const normalValue = getNormalResourceValue(plan)
  const dollars = normalValue - plan.monthlyPrice
  return {
    normalValue,
    dollars,
    percentage: plan.discountPercentage ?? (dollars / normalValue) * 100,
  }
}
