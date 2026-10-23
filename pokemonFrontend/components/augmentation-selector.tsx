"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Wand2 } from "lucide-react"
import type { Augmentation } from "@/lib/types"

interface AugmentationSelectorProps {
  selected: Augmentation[]
  onUpdate: (augmentations: Augmentation[]) => void
}

const augmentationOptions = [
  {
    type: "RandomHorizontalFlip" as const,
    name: "Horizontal Flip",
    description: "Randomly flip images horizontally",
    defaultParams: { p: 0.5 },
  },
  {
    type: "RandomVerticalFlip" as const,
    name: "Vertical Flip",
    description: "Randomly flip images vertically",
    defaultParams: { p: 0.3 },
  },
  {
    type: "RandomRotation" as const,
    name: "Rotation",
    description: "Rotate images by random angles",
    defaultParams: { degrees: 15 },
  },
  {
    type: "RandomCrop" as const,
    name: "Random Crop",
    description: "Randomly crop and resize images",
    defaultParams: { size: 32, padding: 4 },
  },
  {
    type: "ColorJitter" as const,
    name: "Color Jitter",
    description: "Adjust brightness and contrast",
    defaultParams: { brightness: 0.2, contrast: 0.2 },
  },
  {
    type: "GaussianNoise" as const,
    name: "Gaussian Noise",
    description: "Add random noise to images",
    defaultParams: { mean: 0, std: 0.1 },
  },
]

export function AugmentationSelector({ selected, onUpdate }: AugmentationSelectorProps) {
  const [expandedAug, setExpandedAug] = useState<string | null>(null)

  const toggleAugmentation = (type: Augmentation["type"]) => {
    const exists = selected.find((a) => a.type === type)
    if (exists) {
      onUpdate(selected.filter((a) => a.type !== type))
    } else {
      const option = augmentationOptions.find((o) => o.type === type)
      if (option) {
        onUpdate([...selected, { type, params: option.defaultParams }])
      }
    }
  }

  const updateParams = (type: Augmentation["type"], params: Record<string, number | boolean>) => {
    onUpdate(selected.map((aug) => (aug.type === type ? { ...aug, params } : aug)))
  }

  return (
    <Card className="border-accent/30 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <Wand2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>Data Augmentation</CardTitle>
            <CardDescription>Enhance model robustness with transformations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {augmentationOptions.map((aug) => {
          const isSelected = selected.some((a) => a.type === aug.type)
          const selectedAug = selected.find((a) => a.type === aug.type)
          const isExpanded = expandedAug === aug.type

          return (
            <div key={aug.type} className="space-y-2">
              <div
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                  isSelected ? "bg-accent/10 border border-accent/30" : "hover:bg-muted/20 border border-transparent"
                }`}
              >
                <Checkbox
                  id={aug.type}
                  checked={isSelected}
                  onCheckedChange={() => toggleAugmentation(aug.type)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={aug.type} className="cursor-pointer font-medium text-foreground">
                    {aug.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{aug.description}</p>
                  {isSelected && selectedAug && (
                    <div className="mt-3 p-3 rounded bg-muted/30 border border-border/50 space-y-2">
                      {Object.entries(selectedAug.params).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Label className="text-xs min-w-20 text-muted-foreground">{key}:</Label>
                          <Input
                            type="number"
                            step={key === "p" ? 0.1 : key.includes("std") || key.includes("brightness") ? 0.05 : 1}
                            value={value}
                            onChange={(e) =>
                              updateParams(aug.type, {
                                ...selectedAug.params,
                                [key]: Number.parseFloat(e.target.value),
                              })
                            }
                            className="h-7 text-xs bg-background border-border/50"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
