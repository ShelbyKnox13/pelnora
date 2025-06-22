// Package types
export const PACKAGES = [
  {
    id: "silver",
    name: "Silver",
    description: "Starter Package",
    monthlyAmount: 2000,
    popular: false,
    color: "purple-dark",
    benefits: [],
    nonBenefits: [],
  },
  {
    id: "gold",
    name: "Gold",
    description: "Standard Package",
    monthlyAmount: 3000,
    popular: false,
    color: "teal-dark",
    benefits: [],
    nonBenefits: [],
  },
  {
    id: "platinum",
    name: "Platinum",
    description: "Premium Package",
    monthlyAmount: 5000,
    popular: true,
    color: "gold-dark",
    benefits: [],
    nonBenefits: [],
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "Elite Package",
    monthlyAmount: 10000,
    popular: false,
    color: "purple-dark",
    benefits: [],
    nonBenefits: [],
  },
];

// Earnings breakdown descriptions
export const EARNINGS_DESCRIPTIONS = {
  direct: "Earn 5% commission on every direct referral's package purchase.",
  binary: "Earn 5% on matched business volume in your binary organization (1:2 or 2:1 matching).",
  level: "Earn a percentage of your binary income distributed across 20 levels in your organization.",
  autopool: "Qualify for our exclusive 1:3:9 matrix pool after achieving ₹10,000 in total earnings.",
  emi_bonus: "Pay all 11 EMIs on time and get the equivalent of 1 EMI as a bonus."
};

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
