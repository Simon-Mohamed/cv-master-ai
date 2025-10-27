"use client"

import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

const themeColors = [
  "#000000", // Black
  "#1e40af", // Blue
  "#dc2626", // Red
  "#059669", // Green
  "#7c3aed", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#be185d", // Pink
]

export default function ThemeColor() {
  const { cvData, updateThemeColor } = useCV()

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4" />
      <div className="flex gap-1">
        {themeColors.map((color) => (
          <button
            key={color}
            onClick={() => updateThemeColor(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              cvData.themeColor === color
                ? "border-gray-800 dark:border-gray-200 scale-110"
                : "border-gray-300 dark:border-gray-600 hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            title={`Theme color: ${color}`}
          />
        ))}
      </div>
    </div>
  )
}
