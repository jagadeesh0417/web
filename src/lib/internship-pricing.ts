/** Current internship fees in Indian rupees. Historical transactions retain their recorded amounts. */
export const INTERNSHIP_PRICES = {
  foundation: 149,
  professional: 199,
  industry: 249,
} as const satisfies Record<"foundation" | "professional" | "industry", number>;

export const INTERNSHIP_PRICES_BY_DURATION = {
  fourWeekPrice: INTERNSHIP_PRICES.foundation,
  sixWeekPrice: INTERNSHIP_PRICES.professional,
  eightWeekPrice: INTERNSHIP_PRICES.industry,
} as const;
