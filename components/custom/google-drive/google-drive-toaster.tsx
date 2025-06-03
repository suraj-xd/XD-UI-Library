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

  return <IconComponent size={20} className={`${colorClass} ${className}`} />;
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
              ? `Uploading ${uploadingCount} item${
                  uploadingCount > 1 ? "s" : ""
                }`
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
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium transition-all ${
      disabled
        ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
        : `${color} dark:opacity-90 hover:shadow-md transform hover:-translate-y-0.5`
    }`}
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
