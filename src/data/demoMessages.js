// Demo conversation that exercises all four DataCard types.
// Not used in normal flow — Chat.jsx loads it when the URL hash is
// "#demo" so we can preview the card system without a real AI reply.

export const DEMO_MESSAGES = [
  {
    id: "demo-1",
    role: "ai",
    content:
      "Here's what I found for 2847 Riverside Drive, Austin TX. This 4-bed, 3-bath home built in 2019 is estimated at $487,500 based on recent comparable sales in the area.",
    cardType: "property",
    cardData: { estValue: "$487K", appreciation: "↑ +16.6%", pricePerSqft: "$208", pricePerSqftHint: "Area avg $210", daysOnMarket: "42d", beds: 4, baths: 3, sqft: "2,340", yearBuilt: 2019, schoolRating: "8/10" },
    showButton: true,
  },
  {
    id: "demo-2",
    role: "user",
    content: "What would my monthly payment be with 20% down?",
  },
  {
    id: "demo-3",
    role: "ai",
    content:
      "At 20% down ($97,500) on $487,500 at the current 6.84% rate, here's your monthly breakdown:",
    cardType: "loan",
    showButton: false,
  },
  {
    id: "demo-4",
    role: "user",
    content: "What does the Austin market look like right now?",
  },
  {
    id: "demo-5",
    role: "ai",
    content: "Here's the current market snapshot for Austin TX:",
    cardType: "market",
    cardData: { medianPrice: "$487K", priceChange: "▼ -3.2% YOY", activeListings: "4,218", activeListingsChange: "▲ +22%", daysOnMarket: "42d", listSaleRatio: "97.1%", priceReductions: "24.3%", avgPricePerSqft: "$210" },
    showButton: true,
  },
  {
    id: "demo-6",
    role: "user",
    content: "What are current mortgage rates?",
  },
  {
    id: "demo-7",
    role: "ai",
    content:
      "Here are the latest mortgage rates and what they mean for your buying power:",
    cardType: "rate",
    showButton: false,
  },
  {
    id: "demo-8",
    role: "user",
    content: "Is 2847 Riverside Drive a good investment property? Run the deal analysis.",
  },
  {
    id: "demo-9",
    role: "ai",
    content:
      "Here's the deal analysis for 2847 Riverside Drive as an investment. At the asking price it falls just outside the 70% ARV rule, making it marginal for a fix-and-flip but potentially solid as a buy-and-hold given Austin's long-term rent growth outlook.",
    cardType: "deal",
    cardData: { purchasePrice: "$487,500", estARV: "$530,000", repairEstimate: "$25,000", potentialEquity: "$17,500", maxOffer: "$346,000", recommendation: "marginal" },
    showButton: true,
  },
  {
    id: "demo-10",
    role: "user",
    content: "What would the returns look like if I rented it out?",
  },
  {
    id: "demo-11",
    role: "ai",
    content:
      "Based on current rental comps in the 78741 ZIP code, here's the projected returns snapshot:",
    cardType: "returns",
    showButton: false,
  },
  {
    id: "demo-12",
    role: "user",
    content: "What are similar rentals in the area going for?",
  },
  {
    id: "demo-13",
    role: "ai",
    content:
      "Here are the nearest active rentals I found on Zillow and Apartments.com near 2847 Riverside Drive:",
    cardType: "rental",
    showButton: false,
  },
];
