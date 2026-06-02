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
];
