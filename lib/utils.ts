import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const noteColors = [
  { name: "Default", value: "bg-card" },
  { name: "Green", value: "bg-green-50 dark:bg-green-900" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-900" },
  { name: "Purple", value: "bg-purple-50 dark:bg-purple-900" },
  { name: "Yellow", value: "bg-yellow-50 dark:bg-yellow-900" },
  { name: "Red", value: "bg-red-50 dark:bg-red-900" },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-900" },
  { name: "Orange", value: "bg-orange-50 dark:bg-orange-900" },
]

export function getColorClass(color: string | null): string {
  if (!color) return "bg-card"
  const foundColor = noteColors.find((c) => c.value === color)
  return foundColor ? foundColor.value : "bg-card"
}
