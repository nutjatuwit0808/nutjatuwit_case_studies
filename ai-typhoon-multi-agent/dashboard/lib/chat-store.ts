import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  input: string;
  setInput: (v: string) => void;
  addMessage: (msg: Message) => void;
  appendToLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;
  sendMessage: () => Promise<void>;
  clearMessages: () => void;
}

let msgId = 0;
const genId = () => `msg-${++msgId}-${Date.now()}`;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  input: "",

  setInput: (v) => set({ input: v }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  appendToLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content + content,
        };
      } else {
        msgs.push({ id: genId(), role: "assistant", content });
      }
      return { messages: msgs };
    }),

  setStreaming: (v) => set({ isStreaming: v }),

  sendMessage: async () => {
    const { input, addMessage, appendToLastMessage, setStreaming } = get();
    const text = input.trim();
    if (!text) return;

    set({ input: "", isStreaming: true });
    addMessage({ id: genId(), role: "user", content: text });

    const { sendChatMessage } = await import("@/lib/api");
    const sessionId = "session-" + Date.now();

    try {
      await sendChatMessage(text, sessionId, (chunk) => {
        get().appendToLastMessage(chunk);
      });
    } catch (err) {
      get().appendToLastMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      set({ isStreaming: false });
    }
  },

  clearMessages: () => set({ messages: [] }),
}));
