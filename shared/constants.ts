// Package types
export const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    description: "Entry Package",
    monthlyAmount: 1000,
    popular: false,
    color: "blue-dark",
    benefits: [
      "12-month EMI plan",
      "5% direct income on referrals",
      "5% binary income on 2:1 or 1:2 pairs",
      "Level income up to 20 levels",
      "Auto pool eligible after ₹10,000 earnings",
      "12th EMI waiver on timely payments"
    ],
    nonBenefits: [],
  },
  {
    id: "silver",
    name: "Silver",
    description: "Starter Package",
    monthlyAmount: 2000,
    popular: false,
    color: "purple-dark",
    benefits: [
      "12-month EMI plan",
      "5% direct income on referrals",
      "5% binary income on 2:1 or 1:2 pairs",
      "Level income up to 20 levels",
      "Auto pool eligible after ₹10,000 earnings",
      "12th EMI waiver on timely payments"
    ],
    nonBenefits: [],
  },
  {
    id: "gold",
    name: "Gold",
    description: "Standard Package",
    monthlyAmount: 3000,
    popular: false,
    color: "teal-dark",
    benefits: [
      "12-month EMI plan",
      "5% direct income on referrals",
      "5% binary income on 2:1 or 1:2 pairs",
      "Level income up to 20 levels",
      "Auto pool eligible after ₹10,000 earnings",
      "12th EMI waiver on timely payments"
    ],
    nonBenefits: [],
  },
  {
    id: "platinum",
    name: "Platinum",
    description: "Premium Package",
    monthlyAmount: 5000,
    popular: true,
    color: "gold-dark",
    benefits: [
      "12-month EMI plan",
      "5% direct income on referrals",
      "5% binary income on 2:1 or 1:2 pairs",
      "Level income up to 20 levels",
      "Auto pool eligible after ₹10,000 earnings",
      "12th EMI waiver on timely payments"
    ],
    nonBenefits: [],
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "Elite Package",
    monthlyAmount: 10000,
    popular: false,
    color: "purple-dark",
    benefits: [
      "12-month EMI plan",
      "5% direct income on referrals",
      "5% binary income on 2:1 or 1:2 pairs",
      "Level income up to 20 levels",
      "Auto pool eligible after ₹10,000 earnings",
      "12th EMI waiver on timely payments"
    ],
    nonBenefits: [],
  },
];

// Earnings breakdown descriptions
export const EARNINGS_DESCRIPTIONS = {
  direct: "Earn 5% commission on direct referrals' package purchases. Earn for 10 months if both you and your referrals pay EMIs on time.",
  binary: "Earn 5% on matched business volume in your binary organization (2:1 or 1:2 matching). Unmatched volume carries forward.",
  level: "Earn 63% of binary income distributed across 20 levels. IMPORTANT: Direct referrals are NEVER counted for level income. Level income starts ONLY from your direct's referrals (Level 1) and continues down. Each level earns: Level 1 (15%), Level 2 (10%), Level 3 (5%), Levels 4-8 (3% each), Levels 9-14 (2% each), Levels 15-20 (1% each).",
  autopool: "Enter auto pool after reaching ₹10,000 total earnings. 5% of your 10% deduction goes to auto pool wallet. Exit with 13 new members or move to next level.",
  emi_bonus: "Pay all 11 EMIs before the 7th of each month and get your 12th EMI waived as a bonus for timely payments."
};

// Auto Pool rewards
export const AUTO_POOL_REWARDS = [
  {
    level: 1,
    cash: "₹2,500",
    assured: "Silver Ring"
  },
  {
    level: 2,
    cash: "₹10,000",
    assured: "LDP Ticket & Silver Pendant Necklace"
  },
  {
    level: 3,
    cash: "₹50,000",
    assured: "Gold Ring"
  },
  {
    level: 4,
    cash: "₹3,00,000",
    assured: "Gold Pendant Set or iPhone + Thailand Tour"
  },
  {
    level: 5,
    cash: "₹12 Lakh",
    assured: "₹5k Lifetime Monthly Income + Hyundai i20 + Dubai Tour"
  },
  {
    level: 6,
    cash: "₹50 Lakh",
    assured: "₹15k Lifetime Monthly Income + Diamond Set + Europe Family Tour + Mahindra Thar Roxx/BE6"
  },
  {
    level: 7,
    cash: "₹2 Crore",
    assured: "₹1 Crore Flat + 10 Days London Family Tour + ₹50,000 Monthly Lifetime Income + 100g Gold & 1kg Silver + Jeep Meridian or Toyota Fortuner"
  },
  {
    level: 8,
    cash: "₹10 Crore",
    assured: "₹2.5 Crore Bungalow + ₹1 Lakh Monthly Lifetime Income + 1kg Gold Bar + Land Rover Defender or BMW M4 + 15 Days Cruise Ship Family Tour"
  },
  {
    level: 9,
    cash: "₹50 Crore",
    assured: "₹10 Crore Farm House + ₹5 Lakh Monthly Lifetime Income + 10kg Gold Bar + Lamborghini Urus or Bentley Bentayga + World Tour"
  },
  {
    level: 10,
    cash: "₹250 Crore",
    assured: "₹50 Crore Hotel + Dubai Golden Visa + ₹10 Lakh Monthly Lifetime Income + 100kg Gold Bar + World Tour with Family + Rolls Royce"
  }
];

// Colors and backgrounds for earnings types
export const EARNING_TYPE_COLORS = {
  direct: {
    bg: "bg-gold-light/20",
    text: "text-gold-dark",
    fill: "fill-gold-dark",
    color: "#D4AF37"
  },
  binary: {
    bg: "bg-purple-light/20",
    text: "text-purple-dark",
    fill: "fill-purple-dark",
    color: "#4A154B"
  },
  level: {
    bg: "bg-teal-light/20",
    text: "text-teal-dark",
    fill: "fill-teal-dark",
    color: "#008080"
  },
  autopool: {
    bg: "bg-blue-500/20",
    text: "text-blue-500",
    fill: "fill-blue-500",
    color: "#3b82f6"
  },
  emi_bonus: {
    bg: "bg-green-500/20",
    text: "text-green-500",
    fill: "fill-green-500",
    color: "#22c55e"
  }
};