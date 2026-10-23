"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Block } from "@/lib/types"

interface BlockSelectorProps {
  onSelect: (block: Block) => void
  onClose: () => void
  allowedBlocks?: Array<Block["type"]>
}

const blockTypes = [
  { type: "ConvBlock", name: "Convolutional Block", description: "Standard convolution layer" },
  { type: "SEBlock", name: "SE Block", description: "Squeeze-and-Excitation block" },
  { type: "BottleneckBlock", name: "Bottleneck Block", description: "Residual bottleneck" },
  { type: "MaxPoolBlock", name: "Max Pooling Layer", description: "Max pooling operation" },
  { type: "DenseBlock", name: "Dense Layer", description: "Fully connected layer" },
]

export function BlockSelector({ onSelect, onClose, allowedBlocks }: BlockSelectorProps) {
  const [selectedType, setSelectedType] = useState<Block["type"] | null>(null)
  const [activation, setActivation] = useState<"relu" | "sigmoid" | "tanh" | "leaky_relu">("relu")
  const [params, setParams] = useState<Record<string, number>>({
    in_channels: 3,
    out_channels: 32,
    kernel_size: 3,
    stride: 1,
    padding: 1,
  })

  const availableBlocks = allowedBlocks
    ? blockTypes.filter((b) => allowedBlocks.includes(b.type as Block["type"]))
    : blockTypes

  const handleAdd = () => {
    if (!selectedType) return

    const block: Block = {
      id: "",
      type: selectedType,
      params,
      activation: selectedType === "MaxPoolBlock" ? undefined : activation,
    }

    onSelect(block)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/30 bg-card max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add Neural Network Block</CardTitle>
              <CardDescription>Choose a block type and configure its parameters</CardDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {allowedBlocks && (
            <Alert className="mt-2 bg-primary/10 border-primary/30">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                <strong className="text-primary">Challenge Restriction:</strong> Only {allowedBlocks.join(", ")} blocks
                are allowed
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            {availableBlocks.map((block) => (
              <button
                key={block.type}
                onClick={() => {
                  setSelectedType(block.type as Block["type"])
                  if (block.type === "ConvBlock") {
                    setParams({ in_channels: 3, out_channels: 32, kernel_size: 3, stride: 1, padding: 1 })
                  } else if (block.type === "SEBlock") {
                    setParams({ in_channels: 32, reduction: 16 })
                  } else if (block.type === "BottleneckBlock") {
                    setParams({ in_channels: 32, out_channels: 32, expansion: 4 })
                  } else if (block.type === "MaxPoolBlock") {
                    setParams({ pool_size: 2, stride: 2 })
                  } else if (block.type === "DenseBlock") {
                    setParams({ in_channels: 256, units: 512 })
                  }
                }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedType === block.type
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="font-semibold text-foreground">{block.name}</div>
                <div className="text-sm text-muted-foreground">{block.description}</div>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/50">
              <h3 className="font-semibold text-foreground">Configure Parameters</h3>
              {selectedType === "ConvBlock" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Input Channels</Label>
                      <Input
                        type="number"
                        value={params.in_channels || ""}
                        onChange={(e) => setParams({ ...params, in_channels: Number.parseInt(e.target.value) || 3 })}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Output Channels</Label>
                      <Input
                        type="number"
                        value={params.out_channels || ""}
                        onChange={(e) => setParams({ ...params, out_channels: Number.parseInt(e.target.value) || 32 })}
                        className="bg-background border-border/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Kernel Size</Label>
                      <Input
                        type="number"
                        value={params.kernel_size || ""}
                        onChange={(e) => setParams({ ...params, kernel_size: Number.parseInt(e.target.value) || 3 })}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stride</Label>
                      <Input
                        type="number"
                        value={params.stride || ""}
                        onChange={(e) => setParams({ ...params, stride: Number.parseInt(e.target.value) || 1 })}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Padding</Label>
                      <Input
                        type="number"
                        value={params.padding || ""}
                        onChange={(e) => setParams({ ...params, padding: Number.parseInt(e.target.value) || 1 })}
                        className="bg-background border-border/50"
                      />
                    </div>
                  </div>
                </>
              )}
              {selectedType === "SEBlock" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Input Channels</Label>
                    <Input
                      type="number"
                      value={params.in_channels || ""}
                      onChange={(e) => setParams({ ...params, in_channels: Number.parseInt(e.target.value) || 32 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reduction Ratio</Label>
                    <Input
                      type="number"
                      value={params.reduction || ""}
                      onChange={(e) => setParams({ ...params, reduction: Number.parseInt(e.target.value) || 16 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                </div>
              )}
              {selectedType === "BottleneckBlock" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Input Channels</Label>
                    <Input
                      type="number"
                      value={params.in_channels || ""}
                      onChange={(e) => setParams({ ...params, in_channels: Number.parseInt(e.target.value) || 32 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Output Channels</Label>
                    <Input
                      type="number"
                      value={params.out_channels || ""}
                      onChange={(e) => setParams({ ...params, out_channels: Number.parseInt(e.target.value) || 32 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expansion Factor</Label>
                    <Input
                      type="number"
                      value={params.expansion || ""}
                      onChange={(e) => setParams({ ...params, expansion: Number.parseInt(e.target.value) || 4 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                </div>
              )}
              {selectedType === "MaxPoolBlock" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Pool Size</Label>
                    <Input
                      type="number"
                      value={params.pool_size || ""}
                      onChange={(e) => setParams({ ...params, pool_size: Number.parseInt(e.target.value) || 2 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stride</Label>
                    <Input
                      type="number"
                      value={params.stride || ""}
                      onChange={(e) => setParams({ ...params, stride: Number.parseInt(e.target.value) || 2 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                </div>
              )}
              {selectedType === "DenseBlock" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Input Channels</Label>
                    <Input
                      type="number"
                      value={params.in_channels || ""}
                      onChange={(e) => setParams({ ...params, in_channels: Number.parseInt(e.target.value) || 256 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Units</Label>
                    <Input
                      type="number"
                      value={params.units || ""}
                      onChange={(e) => setParams({ ...params, units: Number.parseInt(e.target.value) || 512 })}
                      className="bg-background border-border/50"
                    />
                  </div>
                </div>
              )}
              {selectedType !== "MaxPoolBlock" && (
                <div className="space-y-2">
                  <Label>Activation Function</Label>
                  <Select value={activation} onValueChange={(v: any) => setActivation(v)}>
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relu">ReLU</SelectItem>
                      <SelectItem value="leaky_relu">Leaky ReLU</SelectItem>
                      <SelectItem value="sigmoid">Sigmoid</SelectItem>
                      <SelectItem value="tanh">Tanh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleAdd} disabled={!selectedType} className="w-full bg-primary hover:bg-primary-light">
            Add Block
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
