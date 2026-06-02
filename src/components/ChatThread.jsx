import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

// Session 6: hardcoded demo conversation to verify all four DataCard
// types render correctly inside AI bubbles. The messages prop from
// Chat.jsx is intentionally ignored for this session; restore the
// `messages` rendering in a future session once card visuals are
// signed off.
const DEMO_MESSAGES = [
  {
    id: "demo-1",
    role: "ai",
    text:
      "Here's what I found for 2847 Riverside Drive, Austin TX. This 4-bed, 3-bath home built in 2019 is estimated at $487,500 based on recent comparable sales in the area.",
    cardType: "property",
    showButton: true,
  },
  {
    id: "demo-2",
    role: "user",
    text: "What would my monthly payment be with 20% down?",
  },
  {
    id: "demo-3",
    role: "ai",
    text:
      "At 20% down ($97,500) on $487,500 at the current 6.84% rate, here's your monthly breakdown:",
    cardType: "loan",
    showButton: false,
  },
  {
    id: "demo-4",
    role: "user",
    text: "What does the Austin market look like right now?",
  },
  {
    id: "demo-5",
    role: "ai",
    text: "Here's the current market snapshot for Austin TX:",
    cardType: "market",
    showButton: true,
  },
  {
    id: "demo-6",
    role: "user",
    text: "What are current mortgage rates?",
  },
  {
    id: "demo-7",
    role: "ai",
    text:
      "Here are the latest mortgage rates and what they mean for your buying power:",
    cardType: "rate",
    showButton: false,
  },
];

function ChatThread({ messages, typing }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typing]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {DEMO_MESSAGES.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role}
            text={m.text}
            cardType={m.cardType}
            showButton={m.showButton}
          />
        ))}
        {typing && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default ChatThread;
