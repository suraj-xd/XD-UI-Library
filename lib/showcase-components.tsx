import CounterExample from "@/components/examples/counter-example";
import type { ComponentShowcaseItem } from "@/types";
import GoogleDriveToaster from "@/components/custom/google-drive/google-drive-toaster";
import ClaudeStyleChatInput from "@/components/custom/claude-ai-input/page";
import AI_Prompt_Demo from "@/components/custom/chatgpt-select-content/page";
import AI_Agent_Avatar from "@/components/custom/ai-agent-avatar/page";
import PillShowcase from "@/components/custom/status-pills/page";

// This list is for the actual rendered components in ShowcaseArea
export const showcaseComponents: ComponentShowcaseItem[] = [
  {
    id: "claude-style-chat-input",
    title: "Claude Style Chat Input",
    description: "A chat input that looks like Claude.",
    component: <ClaudeStyleChatInput />,
    code: `
    "use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  SlidersHorizontal,
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Replace Math.random with nanoid
// import { nanoid } from "nanoid";

// Types
export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  abortController?: AbortController;
  textContent?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

interface ChatInputProps {
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
}

// Constants
const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PASTE_THRESHOLD = 200; // characters threshold for showing as pasted content
const DEFAULT_MODELS_INTERNAL: ModelOption[] = [
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Balanced model",
    badge: "Latest",
  },
  {
    id: "claude-opus-3.5",
    name: "Claude Opus 3.5",
    description: "Highest intelligence",
  },
  {
    id: "claude-haiku-3",
    name: "Claude Haiku 3",
    description: "Fastest responses",
  },
];

// File type helpers
const getFileIcon = (type: string) => {
  if (type.startsWith("image/"))
    return <ImageIcon className="h-5 w-5 text-zinc-400" />;
  if (type.startsWith("video/"))
    return <Video className="h-5 w-5 text-zinc-400" />;
  if (type.startsWith("audio/"))
    return <Music className="h-5 w-5 text-zinc-400" />;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return <Archive className="h-5 w-5 text-zinc-400" />;
  return <FileText className="h-5 w-5 text-zinc-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 7 && label.includes("-")) {
    // e.g. VND.OPENXMLFORMATS-OFFICEDOCUMENT...
    label = label.substring(0, label.indexOf("-"));
  }
  if (label.length > 10) {
    label = label.substring(0, 10) + "...";
  }
  return label;
};

// Helper function to check if a file is textual
const isTextualFile = (file: File): boolean => {
  const textualTypes = [
    "text/",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/typescript",
  ];

  const textualExtensions = [
    "txt",
    "md",
    "py",
    "js",
    "ts",
    "jsx",
    "tsx",
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "json",
    "xml",
    "yaml",
    "yml",
    "csv",
    "sql",
    "sh",
    "bash",
    "php",
    "rb",
    "go",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "cs",
    "rs",
    "swift",
    "kt",
    "scala",
    "r",
    "vue",
    "svelte",
    "astro",
    "config",
    "conf",
    "ini",
    "toml",
    "log",
    "gitignore",
    "dockerfile",
    "makefile",
    "readme",
  ];

  // Check MIME type
  const isTextualMimeType = textualTypes.some((type) =>
    file.type.toLowerCase().startsWith(type)
  );

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isTextualExtension =
    textualExtensions.includes(extension) ||
    file.name.toLowerCase().includes("readme") ||
    file.name.toLowerCase().includes("dockerfile") ||
    file.name.toLowerCase().includes("makefile");

  return isTextualMimeType || isTextualExtension;
};

// Helper function to read file content as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Helper function to get file extension for badge
const getFileExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toUpperCase() || "FILE";
  return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

// File Preview Component
const FilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);

  // If it's a textual file, use the TextualFilePreviewCard
  if (isTextual) {
    return <TextualFilePreviewCard file={file} onRemove={onRemove} />;
  }

  return (
    <div
      className={cn(
        "relative group bg-zinc-700 border w-fit border-zinc-600 rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden",
        isImage ? "p-0" : "p-3"
      )}
    >
      <div className="flex items-start gap-3 size-[125px] overflow-hidden">
        {isImage && file.preview ? (
          <div className="relative size-full rounded-md overflow-hidden bg-zinc-600">
            <img
              src={file.preview || "/placeholder.svg"}
              alt={file.file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <></>
        )}
        {!isImage && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
                <p className="absolute bottom-2 left-2 capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
                  {getFileTypeLabel(file.type)}
                </p>
              </div>
              {file.uploadStatus === "uploading" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              )}
              {file.uploadStatus === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>

            <p
              className="max-w-[90%] text-xs font-medium text-zinc-100 truncate"
              title={file.file.name}
            >
              {file.file.name}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              {formatFileSize(file.file.size)}
            </p>
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Pasted Content Preview Component
const PastedContentCard: React.FC<{
  content: PastedContent;
  onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {isExpanded || !needsTruncation ? content.content : previewText}
        {!isExpanded && needsTruncation && "..."}
      </div>
      {/* OVERLAY */}
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
          PASTED
        </p>
        {/* Actions */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => navigator.clipboard.writeText(content.content)}
            title="Copy content"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(content.id)}
            title="Remove content"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Model Selector Component
const ModelSelectorDropdown: React.FC<{
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}> = ({ models, selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModelData =
    models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {selectedModelData.name}
        </span>
        <ChevronDown
          className={cn(
            "ml-1 h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 p-2">
          {models.map((model) => (
            <button
              key={model.id}
              className={cn(
                "w-full text-left p-2.5 rounded-md hover:bg-zinc-700 transition-colors flex items-center justify-between",
                model.id === selectedModel && "bg-zinc-700"
              )}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-100">
                    {model.name}
                  </span>
                  {model.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                      {model.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {model.description}
                </p>
              </div>
              {model.id === selectedModel && (
                <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Textual File Preview Component
const TextualFilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;
  const fileExtension = getFileExtension(file.file.name);

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {file.textContent ? (
          <>
            {isExpanded || !needsTruncation ? file.textContent : previewText}
            {!isExpanded && needsTruncation && "..."}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {/* OVERLAY */}
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
          {fileExtension}
        </p>
        {/* Upload status indicator */}
        {file.uploadStatus === "uploading" && (
          <div className="absolute top-2 left-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          </div>
        )}
        {file.uploadStatus === "error" && (
          <div className="absolute top-2 left-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          </div>
        )}
        {/* Actions */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          {file.textContent && (
            <Button
              size="icon"
              variant="outline"
              className="size-6"
              onClick={() =>
                navigator.clipboard.writeText(file.textContent || "")
              }
              title="Copy content"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(file.id)}
            title="Remove file"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main ChatInput Component
const ClaudeChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "How can I help you today?",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes,
  models = DEFAULT_MODELS_INTERNAL,
  defaultModel,
  onModelChange,
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    defaultModel || models[0]?.id || ""
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight =
        Number.parseInt(getComputedStyle(textareaRef.current).maxHeight, 10) ||
        120;
      textareaRef.current.style.height = "\${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px;"
    }
  }, [message]);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const currentFileCount = files.length;
      if (currentFileCount >= maxFiles) {
        alert(
          "Maximum \${maxFiles} files allowed. Please remove some files to add new ones."
        );
        return;
      }

      const availableSlots = maxFiles - currentFileCount;
      const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

      if (selectedFiles.length > availableSlots) {
        alert(
          "You can only add \${availableSlots} more file(s). \${
            selectedFiles.length - availableSlots
          } file(s) were not added."
        );
      }

      const newFiles = filesToAdd
        .filter((file) => {
          if (file.size > maxFileSize) {
            alert(
              "File \${file.name} (\${formatFileSize(
                file.size
              )}) exceeds size limit of \${formatFileSize(maxFileSize)}."
            );
            return false;
          }
          if (
            acceptedFileTypes &&
            !acceptedFileTypes.some(
              (type) =>
                file.type.includes(type) || type === file.name.split(".").pop()
            )
          ) {
            alert(
                "File type for \${file.name} not supported. Accepted types: \${acceptedFileTypes.join(", ")}"
            );
            return false;
          }
          return true;
        })
        .map((file) => ({
          id: Math.random(),
          file,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          type: file.type || "application/octet-stream",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        }));

      setFiles((prev: any) => [...prev, ...newFiles]);

      newFiles.forEach((fileToUpload) => {
        // Read text content for textual files
        if (isTextualFile(fileToUpload.file)) {
          readFileAsText(fileToUpload.file)
            .then((textContent) => {
              setFiles((prev: any) =>
                prev.map((f: any) =>
                  f.id === fileToUpload.id ? { ...f, textContent } : f
                )
              );
            })
            .catch((error) => {
              console.error("Error reading file content:", error);
              setFiles((prev: any) =>
                prev.map((f: any) =>
                  f.id === fileToUpload.id
                    ? { ...f, textContent: "Error reading file content" }
                    : f
                )
              );
            });
        }

        setFiles((prev: any) =>
          prev.map((f: any) =>
            f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f
          )
        );

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20 + 5; // Simulate faster upload
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles((prev: any) =>
              prev.map((f: any) =>
                f.id === fileToUpload.id
                  ? { ...f, uploadStatus: "complete", uploadProgress: 100 }
                  : f
              )
            );
          } else {
            setFiles((prev: any) =>
              prev.map((f: any) =>
                f.id === fileToUpload.id
                  ? { ...f, uploadProgress: progress }
                  : f
              )
            );
          }
        }, 150); // Faster interval
      });
    },
    [files.length, maxFiles, maxFileSize, acceptedFileTypes]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev: any) => {
      const fileToRemove = prev.find((f: any) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      // TODO: Abort upload if in progress using fileToRemove.abortController
      return prev.filter((f: any) => f.id !== id);
    });
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;

      const fileItems = Array.from(items).filter(
        (item) => item.kind === "file"
      );
      if (fileItems.length > 0 && files.length < maxFiles) {
        e.preventDefault();
        const pastedFiles = fileItems
          .map((item) => item.getAsFile())
          .filter(Boolean) as File[];
        const dataTransfer = new DataTransfer();
        pastedFiles.forEach((file) => dataTransfer.items.add(file));
        handleFileSelect(dataTransfer.files);
        return;
      }

      const textData = clipboardData.getData("text");
      if (
        textData &&
        textData.length > PASTE_THRESHOLD &&
        pastedContent.length < 5
      ) {
        // Limit pasted content items
        e.preventDefault();
        setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "..."); // Add a portion to textarea

        const pastedItem: PastedContent = {
          id: Math.random().toString(),
          content: textData,
          timestamp: new Date(),
          wordCount: textData.split(/\s+/).filter(Boolean).length,
        };

        setPastedContent((prev: any) => [...prev, pastedItem]);
      }
    },
    [handleFileSelect, files.length, maxFiles, pastedContent.length, message]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleSend = useCallback(() => {
    if (
      disabled ||
      (!message.trim() && files.length === 0 && pastedContent.length === 0)
    )
      return;
    if (files.some((f) => f.uploadStatus === "uploading")) {
      alert("Please wait for all files to finish uploading.");
      return;
    }

    onSendMessage?.(message, files, pastedContent);

    setMessage("");
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, files, pastedContent, disabled, onSendMessage]);

  const handleModelChangeInternal = useCallback(
    (modelId: string) => {
      setSelectedModel(modelId);
      onModelChange?.(modelId);
    },
    [onModelChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const hasContent =
    message.trim() || files.length > 0 || pastedContent.length > 0;
  const canSend =
    hasContent &&
    !disabled &&
    !files.some((f) => f.uploadStatus === "uploading");

  return (
    <div
      className="relative w-full max-w-2xl mx-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1C3F62] border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-blue-500 flex items-center gap-2">
            <ImageIcon className="size-4 opacity-50" />
            Drop files here to add to chat
          </p>
        </div>
      )}

      <div className="bg-[#30302E] border border-zinc-700 rounded-xl shadow-lg items-end gap-2   min-h-[150px] flex flex-col">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[100px] w-full p-4 focus-within:border-none focus:outline-none focus:border-none border-none outline-none focus-within:ring-0 focus-within:ring-offset-0 focus-within:outline-none max-h-[120px] resize-none border-0 bg-transparent text-zinc-100 shadow-none focus-visible:ring-0 placeholder:text-zinc-500 text-sm sm:text-base custom-scrollbar"
          rows={1}
        />
        <div className="flex items-center gap-2 justify-between w-full px-3 pb-1.5">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              title={
                files.length >= maxFiles
                  ? "Max \${maxFiles} files reached"
                  : "Attach files"
              }
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0"
              disabled={disabled}
              title="Options (Not implemented)"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {models && models.length > 0 && (
              <ModelSelectorDropdown
                models={models}
                selectedModel={selectedModel}
                onModelChange={handleModelChangeInternal}
              />
            )}

            <Button
              size="icon"
              className={cn(
                "h-9 w-9 p-0 flex-shrink-0 rounded-md transition-colors",
                canSend
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              )}
              onClick={handleSend}
              disabled={!canSend}
              title="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="overflow-x-auto border-t-[1px] p-3 border-zinc-700 w-full bg-[#262624] hide-scroll-bar">
            <div className="flex gap-3">
              {pastedContent.map((content) => (
                <PastedContentCard
                  key={content.id}
                  content={content}
                  onRemove={(id) =>
                    setPastedContent((prev) => prev.filter((c) => c.id !== id))
                  }
                />
              ))}
              {files.map((file) => (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedFileTypes?.join(",")}
        onChange={(e) => {
          handleFileSelect(e.target.files);
          if (e.target) e.target.value = ""; // Reset file input
        }}
      />
    </div>
  );
};

export default function ClaudeStyleChatInput() {
  const handleSendMessage = (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => {
    console.log("Message:", message);
    console.log("Files:", files);
    console.log("Pasted Content:", pastedContent);

    // Here you would typically send this data to your backend/AI service
    alert(
      "Message sent!\nText: \${message}\nFiles: \${files.length}\nPasted Content: \${pastedContent.length}"
    );
  };

  return (
    <div className="min-h-[600px] w-screen bg-[#262624] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center py-16">
          <h1 className="text-3xl font-serif font-light text-[#C2C0B6] mb-2">
            What's new, Suraj?
          </h1>
        </div>

        <ClaudeChatInput
          onSendMessage={handleSendMessage}
          placeholder="Try pasting large text or uploading textual files..."
          maxFiles={10}
          maxFileSize={10 * 1024 * 1024} // 10MB
        />

        {/* <div className="mt-8 text-sm text-zinc-500 space-y-2">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Upload textual files (.md, .py, .html, .js, etc.) to see content preview</li>
            <li>Upload images/media files to see the traditional file preview</li>
            <li>Paste large text content to see pasted content cards</li>
            <li>Drag and drop files for easy uploading</li>
            <li>Copy content from textual files and pasted content</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
    `,
    link: "https://21st.dev/suraj-xd/claude-style-ai-input/default",
    dependencies: ["button", "lucide-react"],
  },
  {
    id: "ai-prompt",
    title: "AI Prompt",
    description: "A chat input that looks like Claude.",
    component: <AI_Prompt_Demo />,
    code: `"use client";

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
          {content.length > 150 ? "\${content.slice(0, 150)}..." : content}
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
        textarea.style.height = "\${minHeight}px";
        return;
      }

      textarea.style.height = "\${minHeight}px"; // Reset first to get correct scrollHeight

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = "\${newHeight}px";
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "\${minHeight}px";
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
      ? "\${selectedContentForInput}\n\n--\n\n\${value}"
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
      prev ? "\${prev}\n\n--\n\n\${selectedText}" : selectedText
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
                  ? "Chat with \${ticker} Research Bot"
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
`,
    link: "https://v0-image-analysis-phi-six-31.vercel.app/",
    dependencies: [
      "textarea",
      "lucide-react",
      "button",
      "dropdown-menu",
      "framer-motion",
      "@omsimos/react-highlight-popover",
    ],
  },
  {
    id: "google-drive-toaster",
    title: "Google Drive Toaster",
    description: "A toaster that uploads files to Google Drive.",
    component: <GoogleDriveToaster />,
    link: "https://21st.dev/suraj-xd/google-drive-uploader-toast/default",
    code: `
    "use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import {
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  File,
  XCircle,
} from "lucide-react";

const CheckCircle = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      className="text-green-500 dark:text-green-400"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
    </svg>
  );
};

// will recommend using phosphor icons for this project

// import {
//   FilePdf, FileZip, FileImage, FileDoc, FileXls, FilePpt,
//   FileVideo, FileAudio, FileCode, File, CheckCircle, XCircle
// } from '@phosphor-icons/react';

// Types
interface UploadItem {
  id: string;
  fileName: string;
  fileType: string;
  status: "UPLOADING" | "SUCCESS" | "ERROR";
  progress: number;
  error?: string;
}

// Constants
const MAX_UPLOADS = 6;
const UPLOAD_DURATION = { min: 5000, max: 10000 };
const FILE_TYPES = {
  pdf: { icon: File, color: "text-red-500" },
  zip: { icon: File, color: "text-gray-500 dark:text-gray-400" },
  jpg: { icon: FileImage, color: "text-yellow-500" },
  doc: { icon: File, color: "text-blue-500" },
  xls: { icon: File, color: "text-green-500" },
  ppt: { icon: File, color: "text-orange-500" },
  mp4: { icon: FileVideo, color: "text-purple-500" },
  mp3: { icon: FileAudio, color: "text-pink-500" },
  js: { icon: FileCode, color: "text-indigo-500" },
} as const;

// Hooks
const useUploadStore = () => {
  const [items, setItems] = useState<UploadItem[]>([]);

  const addItem = useCallback((fileName: string, fileType: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem: UploadItem = {
      id,
      fileName,
      fileType,
      status: "UPLOADING",
      progress: 0,
    };
    setItems((prev) => [...prev, newItem]);
    return id;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  return { items, addItem, updateItem, removeItem, clearAll };
};

const useUploadSimulation = (
  updateItem: (id: string, updates: Partial<UploadItem>) => void
) => {
  const activeUploads = useRef<Set<string>>(new Set());

  return useCallback(
    (id: string) => {
      if (activeUploads.current.has(id)) return;

      activeUploads.current.add(id);
      let progress = 0;
      const duration =
        UPLOAD_DURATION.min +
        Math.random() * (UPLOAD_DURATION.max - UPLOAD_DURATION.min);
      const increment = (100 / duration) * 100;

      const interval = setInterval(() => {
        progress = Math.min(progress + increment + Math.random() * 2, 95);
        updateItem(id, { progress: Math.floor(progress) });

        if (progress >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const isSuccess = Math.random() > 0.4;
            updateItem(id, {
              status: isSuccess ? "SUCCESS" : "ERROR",
              progress: 100,
              error: isSuccess ? undefined : "Upload failed. Please try again.",
            });
            activeUploads.current.delete(id);
          }, 500);
        }
      }, 100);
    },
    [updateItem]
  );
};

// Components
const CircleProgress = ({ progress }: { progress: number }) => {
  const normalizedProgress = Math.min(Math.max(0, progress), 100);
  const circumference = 2 * Math.PI * 10;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative h-5 w-5">
      <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
        <circle
          className="stroke-gray-200 dark:stroke-gray-600"
          strokeWidth="3"
          fill="none"
          r="10"
          cx="12"
          cy="12"
        />
        <circle
          className="stroke-blue-600 dark:stroke-blue-400 transition-all duration-300"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          r="10"
          cx="12"
          cy="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

const FileIcon = ({
  fileType,
  className = "",
}: {
  fileType: string;
  className?: string;
}) => {
  const config = FILE_TYPES[fileType.toLowerCase() as keyof typeof FILE_TYPES];
  const IconComponent = config?.icon || File;
  const colorClass = config?.color || "text-gray-400 dark:text-gray-500";

  return <IconComponent size={20} className={"\${colorClass} \${className}"} />;
};

const StatusIcon = ({ status }: { status: UploadItem["status"] }) => {
  if (status === "SUCCESS") return <CheckCircle />;
  if (status === "ERROR")
    return <XCircle size={20} className="text-red-500 dark:text-red-400" />;
  return null;
};

const UploadItemRow = ({
  item,
  onRemove,
}: {
  item: UploadItem;
  onRemove: (id: string) => void;
}) => (
  <div className="flex max-w-[280px] items-center justify-between py-2">
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <FileIcon
        fileType={item.fileType}
        className={
          item.status === "UPLOADING" ? "opacity-50 p-0.5 pl-0" : "p-0.5 pl-0"
        }
      />
      <span
        className="truncate capitalize text-sm text-gray-700 dark:text-gray-300 cursor-default"
        title={item.fileName}
      >
        {item.fileName}
      </span>
    </div>

    <div className="flex items-center gap-1 ml-2">
      {item.status === "UPLOADING" ? (
        <div className="relative group">
          <CircleProgress progress={item.progress} />
          <button
            onClick={() => onRemove(item.id)}
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      ) : (
        <>
          <StatusIcon status={item.status} />
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-gray-600 dark:hover:text-gray-200 size-5 rounded-full cursor-pointer transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  </div>
);

const DriveUploadToast = ({
  items,
  onRemoveItem,
  onClearAll,
  className = "fixed bottom-0 right-4 z-50 w-[320px]",
}: {
  items: UploadItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const uploadingCount = items.filter(
    (item) => item.status === "UPLOADING"
  ).length;

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="bg-white dark:bg-gray-800 rounded-[20px] rounded-b-none shadow-lg border border-blue-300 dark:border-blue-600">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <span className="text-md font-semibold text-gray-900 dark:text-gray-100">
            {uploadingCount > 0
              ? "Uploading \${uploadingCount} item\${
                  uploadingCount > 1 ? "s" : ""
                }"
              : "Upload complete"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown
                  strokeWidth={2}
                  className="h-4 w-4 text-gray-800 dark:text-gray-200"
                />
              ) : (
                <ChevronUp
                  strokeWidth={2}
                  className="h-4 w-4 text-gray-800 dark:text-gray-200"
                />
              )}
            </button>
            <button
              onClick={onClearAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Clear all"
            >
              <X className="h-4 w-4 text-gray-800 dark:text-gray-200" />
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="group px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <UploadItemRow item={item} onRemove={onRemoveItem} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UploadButton = ({
  fileType,
  label,
  color,
  onClick,
  disabled,
}: {
  fileType: string;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium transition-all \${
      disabled
        ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
        : "\${color} dark:opacity-90 hover:shadow-md transform hover:-translate-y-0.5"
    }"}
  >
    <FileIcon fileType={fileType} />
    <span>{label}</span>
  </button>
);

// Demo Component
export default function GoogleDriveToaster() {
  const { items, addItem, updateItem, removeItem, clearAll } = useUploadStore();
  const simulateUpload = useUploadSimulation(updateItem);
  const uploadingCount = items.filter(
    (item) => item.status === "UPLOADING"
  ).length;

  const demoFileTypes = [
    {
      type: "pdf",
      label: "PDF Document",
      color:
        "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      fileName: "document.pdf",
    },
    {
      type: "zip",
      label: "ZIP Archive",
      color:
        "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
      fileName: "archive.zip",
    },
    {
      type: "jpg",
      label: "Image File",
      color:
        "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
      fileName: "photo.jpg",
    },
    {
      type: "doc",
      label: "Word Document",
      color:
        "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      fileName: "document.docx",
    },
    {
      type: "xls",
      label: "Excel Sheet",
      color:
        "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      fileName: "spreadsheet.xlsx",
    },
    {
      type: "ppt",
      label: "PowerPoint",
      color:
        "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
      fileName: "presentation.pptx",
    },
    {
      type: "mp4",
      label: "Video File",
      color:
        "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
      fileName: "video.mp4",
    },
    {
      type: "mp3",
      label: "Audio File",
      color:
        "bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
      fileName: "audio.mp3",
    },
    {
      type: "js",
      label: "Code File",
      color:
        "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
      fileName: "script.js",
    },
    {
      type: "txt",
      label: "Text File",
      color:
        "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
      fileName: "readme.txt",
    },
  ];

  const handleUpload = (fileType: string, fileName: string) => {
    if (uploadingCount >= MAX_UPLOADS) return;
    const id = addItem(fileName, fileType);
    simulateUpload(id);
  };

  return (
    <div className="max-h-[500px] p-8 transition-colors">
      <div className="w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Drive Upload Toast Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Click any file type below to simulate upload progress
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Maximum {MAX_UPLOADS} concurrent uploads • {uploadingCount}/
            {MAX_UPLOADS} active
          </p>
        </div>

        <div className="bg-gray-50/5 rounded-xl shadow-sm border border-gray-50/50 dark:border-gray-900 p-6 mb-8 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Choose file type to upload:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {demoFileTypes.map((fileType) => (
              <UploadButton
                key={fileType.type}
                fileType={fileType.type}
                label={fileType.label}
                color={fileType.color}
                onClick={() => handleUpload(fileType.type, fileType.fileName)}
                disabled={uploadingCount >= MAX_UPLOADS}
              />
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Check the bottom right corner for upload progress
              </span>
            </div>
          </div>
        )}
      </div>

      <DriveUploadToast
        items={items}
        onRemoveItem={removeItem}
        onClearAll={clearAll}
      />
    </div>
  );
}

    `,
    dependencies: ["lucide-react"],
  },
  {
    id: "status-pills",
    title: "Status Pills",
    description: "A collection of status indicators for your UI.",
    component: <PillShowcase />,
    code: `
    "use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, CheckCircle, Spinner, Warning, X } from "@phosphor-icons/react";
import { Circle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

// Core status configurations for common use cases
export const statusConfig = {
  status: {
    PENDING: {
      variant: "yellow",
      icon: <Clock size={14} />,
      label: "Pending",
      color: "#DEA82B",
    },
    IN_PROGRESS: {
      variant: "lightBlue",
      icon: <Spinner className="animate-spin" size={14} />,
      label: "In Progress",
      color: "#24A8EB",
    },
    COMPLETED: {
      variant: "green",
      icon: <Check size={14} />,
      label: "Completed",
      color: "#22C55E",
    },
    FAILED: {
      variant: "red",
      icon: <XCircle size={14} />,
      label: "Failed",
      color: "#EF4444",
    },
    ACTIVE: {
      variant: "green",
      icon: <CheckCircle size={14} />,
      label: "Active",
      color: "#22C55E",
    },
    INACTIVE: {
      variant: "gray",
      icon: <Circle size={14} />,
      label: "Inactive",
      color: "#6B7280",
    },
    WARNING: {
      variant: "orange",
      icon: <Warning size={14} />,
      label: "Warning",
      color: "#F97316",
    },
  },
  priority: {
    HIGH: {
      variant: "red",
      icon: null,
      label: "High Priority",
      color: "#EF4444",
    },
    MEDIUM: {
      variant: "yellow",
      icon: null,
      label: "Medium Priority",
      color: "#DEA82B",
    },
    LOW: {
      variant: "green",
      icon: null,
      label: "Low Priority",
      color: "#22C55E",
    },
  },
  type: {
    URGENT: {
      variant: "red",
      icon: null,
      label: "Urgent",
      color: "#EF4444",
    },
    NORMAL: {
      variant: "lightBlue",
      icon: null,
      label: "Normal",
      color: "#24A8EB",
    },
    INFO: {
      variant: "darkPurple",
      icon: null,
      label: "Info",
      color: "#9333EA",
    },
  },
} as const;

// Pill variants using class-variance-authority
export const pillVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-none bg-gray-100 text-gray-600 hover:bg-gray-100 ring-gray-500/20 px-2 py-2",
        yellow:
          "border-none bg-[#FDF9ED] text-[#DEA82B] hover:bg-yellow-100 ring-yellow-500/20 px-2 py-2",
        orange:
          "border-none bg-orange-50 text-orange-600 hover:bg-orange-100 ring-orange-500/20 px-2 py-2",
        gray: "border-none bg-[#F0F9EB] text-[#838580] hover:bg-gray-100 ring-gray-500/20 px-2 py-2",
        green:
          "border-none bg-green-50 text-green-600 hover:bg-green-100 ring-green-500/20 px-2 py-2",
        red: "border-none bg-red-50 text-red-600 hover:bg-red-100 ring-red-500/20 px-2 py-2",
        lightBlue:
          "border-none bg-[#EBF9FE] text-[#24A9EB] hover:bg-blue-100/70 ring-blue-400/20 px-2 py-2",
        darkPurple:
          "border-none bg-purple-50 text-purple-600 hover:bg-purple-100 ring-purple-500/20 px-2 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const DEFAULT_CONFIG = {
  variant: "default" as const,
  icon: <Circle size={14} />,
  label: "Unknown",
  color: "#6B7280",
};

// Tooltip wrapper component
const TooltipWrapper = React.memo<{
  tooltip?: string;
  children: React.ReactNode;
}>(({ tooltip, children }) => {
  if (!tooltip) return <>{children}</>;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TooltipWrapper.displayName = "TooltipWrapper";

// Main Pill component interface
interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  category?: keyof typeof statusConfig;
  value: string;
  showAvatar?: boolean;
  avatarUrl?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export function Pill({
  className,
  category = "status",
  value,
  showAvatar,
  avatarUrl,
  icon,
  tooltip,
  ...props
}: PillProps) {
  // Get configuration based on category and value
  const config = React.useMemo(() => {
    if (!category || !statusConfig[category]) {
      return DEFAULT_CONFIG;
    }

    const categoryConfig = statusConfig[category];
    const normalizedValue = value.toUpperCase().replace(/\s+/g, "_");

    return (
      categoryConfig[normalizedValue as keyof typeof categoryConfig] ||
      DEFAULT_CONFIG
    );
  }, [category, value]);

  return (
    <TooltipWrapper tooltip={tooltip}>
      <div
        className={cn(pillVariants({ variant: config.variant }), className)}
        {...props}
      >
        {showAvatar && (
          <Avatar className="h-4 w-4">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={value} />
            ) : (
              <AvatarFallback className="text-[10px]">
                {value.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        )}

        {icon || config.icon}

        <span className="font-semibold">{config.label}</span>
      </div>
    </TooltipWrapper>
  );
}

Pill.displayName = "Pill";

// Showcase component
export default function PillShowcase() {
  return (
    <div className="p-8 bg-white h-fit rounded-[25px] m-4 my-10">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Status Pill Components
          </h1>
          <p className="text-gray-600">
            A collection of status indicators for your UI
          </p>
        </div>

        {/* Status Pills */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold mb-4 text-gray-800">
              General Status
            </h2>
            <div className="flex flex-wrap gap-3">
              <Pill
                category="status"
                value="pending"
                tooltip="Task is waiting to be processed"
              />
              <Pill
                category="status"
                value="in_progress"
                tooltip="Task is currently being processed"
              />
              <Pill
                category="status"
                value="completed"
                tooltip="Task has been completed successfully"
              />
              <Pill
                category="status"
                value="failed"
                tooltip="Task has failed to complete"
              />
              <Pill
                category="status"
                value="active"
                tooltip="Item is currently active"
              />
              <Pill
                category="status"
                value="inactive"
                tooltip="Item is currently inactive"
              />
              <Pill
                category="status"
                value="warning"
                tooltip="Attention required"
              />
            </div>
          </section>

          <section className="flex gap-4 justify-between w-full">
            <div>
              <h2 className="text-sm font-semibold mb-4 text-gray-800">
                Priority Levels
              </h2>
              <div className="flex flex-wrap gap-3">
                <Pill
                  category="priority"
                  value="high"
                  tooltip="High priority item"
                />
                <Pill
                  category="priority"
                  value="medium"
                  tooltip="Medium priority item"
                />
                <Pill
                  category="priority"
                  value="low"
                  tooltip="Low priority item"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-4 text-gray-800 text-right">
                Types
              </h2>
              <div className="flex flex-wrap gap-3">
                <Pill
                  category="type"
                  value="urgent"
                  tooltip="Requires immediate attention"
                />
                <Pill
                  category="type"
                  value="normal"
                  tooltip="Standard processing"
                />
                <Pill
                  category="type"
                  value="info"
                  tooltip="Informational item"
                />
              </div>
            </div>
          </section>

          <section className="flex gap-4 justify-between w-full">
            <div>
              <h2 className="text-sm font-semibold mb-4 text-gray-800">
                Priority Levels
              </h2>
              <div className="flex flex-wrap gap-3">
                <Pill
                  category="status"
                  value="active"
                  showAvatar
                  tooltip="User is currently active"
                />
                <Pill
                  category="status"
                  value="pending"
                  showAvatar
                  avatarUrl="https://github.com/shadcn.png"
                  tooltip="User has pending tasks"
                />
                <Pill
                  category="priority"
                  value="high"
                  showAvatar
                  tooltip="High priority user"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-4 text-gray-800 text-right">
                Custom Icons
              </h2>
              <div className="flex flex-wrap gap-3">
                <Pill
                  category="status"
                  value="completed"
                  icon={<CheckCircle size={14} />}
                  tooltip="Task completed with custom icon"
                />
                <Pill
                  category="status"
                  value="warning"
                  icon={<Warning size={14} />}
                  tooltip="Warning with custom icon"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
`,
    link: "",
    dependencies: [
      "@radix-ui/react-tooltip",
      "@phosphor-icons/react",
      "class-variance-authority",
    ],
  },
  {
    id: "ai-agent-avatar",
    title: "AI Agent Avatar",
    description: "A chat input that looks like Claude.",
    component: <AI_Agent_Avatar />,
    code: `"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateFromString } from "generate-avatar";
import { useState } from "react";

export default function AI_Agent_Avatar() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState("");
  
  function generateRandomInput() {
    const randomString = Math.random().toString(36).substring(2, 15);
    setInput(randomString);
    setImage("data:image/svg+xml;utf8," + generateFromString(randomString));
  }

  const imageUrl = "data:image/svg+xml;utf8," + generateFromString(input);

  return (
    <div className="flex justify-center max-w-xl mx-auto items-center h-[400px] gap-10">
      <div className="flex min-w-[300px] gap-2 flex-col justify-start items-start">
        <Input
          placeholder="Enter your name"
          value={input}
          className=""
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="text-xs my-1 font-mono uppercase opacity-50">
          OR
        </p>
        <div className="flex gap-2 justify-center items-center">
          <Button className="w-full" onClick={generateRandomInput}>
            Generate Random Input
          </Button>
        </div>
      </div>
      <img src={imageUrl} className="w-40 h-40 rounded-xl" alt="Generated avatar" />
      <div className="flex flex-col justify-center items-center"></div>
    </div>
  );
}`,
    link: "",
    dependencies: ["generate-avatar", "input", "button"],
  },
  // Add other fully defined components here
];

// This list can be used by Sidebar if you want to show more items than are currently implemented
// Or, Sidebar can derive its list from the full showcaseComponents
// For simplicity, the Sidebar in this example will use the showcaseComponents directly.
// If you want the sidebar to show "Input", "Activity" etc., ensure they are in showcaseComponents
// or modify Sidebar to take a separate list of navigation items.
// For now, the sidebar will reflect what's in showcaseComponents.
// To match the screenshot's sidebar items, you'd add placeholder components:
/*
export const showcaseComponents: ComponentShowcaseItem[] = [
  { id: "input", title: "Input", description: "Text input fields.", component: <div>Input Preview</div>, code: "// Input Code" },
  { id: "activity", title: "Activity", description: "Activity feeds.", component: <CounterExample />, code: "// Counter Code (as Activity example)" },
  { id: "slider", title: "Slider", description: "Range sliders.", component: <div>Slider Preview</div>, code: "// Slider Code" },
  // ... and so on
];
*/
