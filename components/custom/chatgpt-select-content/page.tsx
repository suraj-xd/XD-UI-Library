"use client";

import type React from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Paperclip,
  MessageSquareQuote,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { HighlightPopover } from "@omsimos/react-highlight-popover"; // Corrected import

import { CornerDownRight, X } from "lucide-react";
interface SelectedContentDisplayProps {
  content: string | null;
  onClear: () => void;
  className?: string;
}

export function SelectedContentDisplay({
  content,
  onClear,
  className,
}: SelectedContentDisplayProps) {
  if (!content) {
    return null;
  }

  return (
    <div className="bg-black/5 dark:bg-white/5 rounded-t-2xl">
      <div
        className={cn(
          "relative text-sm text-black/70 dark:text-white/70 px-4 py-3 bg-black/10 dark:bg-white/10 rounded-xl",
          className
        )}
      >
        <CornerDownRight className="w-4 h-4 absolute left-3 top-3.5 flex-shrink-0 opacity-70" />
        <p className="ml-6 mr-6 text-xs">
          {content.length > 150 ? `${content.slice(0, 150)}...` : content}
        </p>
        <button
          onClick={onClear}
          className="absolute right-3 top-3.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Clear selected content"
        >
          <X className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
  children: React.ReactNode;
}

export function ChatMessage({ message, children }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "mb-2 flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
          message.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // Reset first to get correct scrollHeight

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const OPENAI_ICON = (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 256 260"
      aria-label="OpenAI Icon"
      className="w-4 h-4 dark:hidden block"
    >
      <title>OpenAI Icon Light</title>
      <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 256 260"
      aria-label="OpenAI Icon"
      className="w-4 h-4 hidden dark:block"
    >
      <title>OpenAI Icon Dark</title>
      <path
        fill="#fff"
        d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
      />
    </svg>
  </>
);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AI_PromptProps {
  initialMessages?: Message[];
  ticker?: string; // Example prop
}

export function AI_Prompt({ initialMessages = [], ticker }: AI_PromptProps) {
  const [value, setValue] = useState("");
  const [selectedContentForInput, setSelectedContentForInput] = useState<
    string | null
  >(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const AI_MODELS = [
    "o3-mini",
    "Gemini 2.5 Flash",
    "Claude 3.5 Sonnet",
    "GPT-4-1 Mini",
    "GPT-4-1",
  ];

  const MODEL_ICONS: Record<string, React.ReactNode> = {
    "o3-mini": OPENAI_ICON,
    "Gemini 2.5 Flash": (
      <svg
        height="1em"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Gemini</title>
        <defs>
          <linearGradient
            id="lobe-icons-gemini-fill"
            x1="0%"
            x2="68.73%"
            y1="100%"
            y2="30.395%"
          >
            <stop offset="0%" stopColor="#1C7DFF" />
            <stop offset="52.021%" stopColor="#1C69FF" />
            <stop offset="100%" stopColor="#F0DCD6" />
          </linearGradient>
        </defs>
        <path
          d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
          fill="url(#lobe-icons-gemini-fill)"
          fillRule="nonzero"
        />
      </svg>
    ),
    "Claude 3.5 Sonnet": (
      <>
        <svg
          fill="#000"
          fillRule="evenodd"
          className="w-4 h-4 dark:hidden block"
          viewBox="0 0 24 24"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Anthropic Icon Light</title>
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
        <svg
          fill="#fff"
          fillRule="evenodd"
          className="w-4 h-4 hidden dark:block"
          viewBox="0 0 24 24"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Anthropic Icon Dark</title>
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      </>
    ),
    "GPT-4-1 Mini": OPENAI_ICON,
    "GPT-4-1": OPENAI_ICON,
  };

  const handleSendMessage = () => {
    if (!value.trim() && !selectedContentForInput) return;

    const contentToSend = selectedContentForInput
      ? `${selectedContentForInput}\n\n--\n\n${value}`
      : value;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: contentToSend,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setValue("");
    setSelectedContentForInput(null);
    adjustHeight(true);
    // Here you can add actual message sending logic to an AI
    // For demo, simulate a bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I received: " +
          contentToSend.substring(0, 50) +
          (contentToSend.length > 50 ? "..." : ""),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (value.trim() || selectedContentForInput)
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddToChat = (selectedText: string) => {
    setSelectedContentForInput((prev) =>
      prev ? `${prev}\n\n--\n\n${selectedText}` : selectedText
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
      {/* Chat Messages Area */}
      <div className="overflow-y-auto py-5 space-y-2 mb-4 max-h-[400px]">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg}>
            <HighlightPopover
              renderPopover={(
                { selection: highlightedText } // Corrected prop and argument
              ) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-lg px-2 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToChat(highlightedText);
                  }}
                >
                  <MessageSquareQuote className="h-3.5 w-3.5 mr-1.5" />
                  Add to chat
                </Button>
              )}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
            </HighlightPopover>
          </ChatMessage>
        ))}
      </div>

      {/* AI Prompt Input Area */}
      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 w-full">
        <div className="relative">
          <div className="relative flex flex-col">
            <SelectedContentDisplay
              content={selectedContentForInput}
              onClear={() => setSelectedContentForInput(null)}
            />
            <Textarea
              autoFocus
              id="ai-input-15"
              value={value}
              placeholder={
                ticker
                  ? `Chat with ${ticker} Research Bot`
                  : "What can I do for you?"
              }
              className={cn(
                "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "min-h-[72px]",
                selectedContentForInput ? "rounded-t-none" : "rounded-t-xl" // Adjust rounding based on selected content
              )}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
            />
            <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedModel}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1"
                          >
                            {MODEL_ICONS[selectedModel]}
                            {selectedModel}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className={cn(
                        "min-w-[10rem]",
                        "border-black/10 dark:border-white/10",
                        "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                      )}
                    >
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model}
                          onSelect={() => setSelectedModel(model)}
                          className="flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {MODEL_ICONS[model] || (
                              <Bot className="w-4 h-4 opacity-50" />
                            )}
                            <span>{model}</span>
                          </div>
                          {selectedModel === model && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                  <label
                    className={cn(
                      "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                      "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                      "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                    )}
                    aria-label="Attach file"
                  >
                    <input type="file" className="hidden" />
                    <Paperclip className="w-4 h-4 transition-colors" />
                  </label>
                </div>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                    "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Send message"
                  disabled={!value.trim() && !selectedContentForInput}
                  onClick={handleSendMessage}
                >
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 dark:text-white transition-opacity duration-200",
                      value.trim() || selectedContentForInput
                        ? "opacity-100"
                        : "opacity-30"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sampleMessages = [
  {
    id: "1",
    role: "user" as const,
    content: "Hi there! Can you tell me about Next.js 15?",
  },
  {
    id: "2",
    role: "assistant" as const,
    content:
      "Next.js 15 introduces several exciting features like improved server components, optimized image handling, and experimental support for React Compiler. It aims to enhance developer experience and application performance. You can select parts of this text to add to your next message!",
  },
];

export default function AI_Prompt_Demo() {
  return (
    <div className="flex justify-center items-start h-[600px] bg-background w-full">
      <AI_Prompt initialMessages={sampleMessages} ticker="Vercel AI" />
    </div>
  );
}
