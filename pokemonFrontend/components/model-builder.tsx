"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Download, AlertCircle, Layers } from "lucide-react"
import { BlockSelector } from "./block-selector"
import { AugmentationSelector } from "./augmentation-selector"
import type { CNNModel, Block, Opponent } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModelBuilderProps {
  model: CNNModel
  onModelUpdate: (model: CNNModel) => void
  currentOpponent?: Opponent
}

export function ModelBuilder({ model, onModelUpdate, currentOpponent }: ModelBuilderProps) {
  const [showBlockSelector, setShowBlockSelector] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const addBlock = (block: Block) => {
    const newModel = {
      ...model,
      blocks: [...model.blocks, { ...block, id: Date.now().toString() }],
    }
    onModelUpdate(newModel)
    setShowBlockSelector(false)
  }

  const removeBlock = (id: string) => {
    const newModel = {
      ...model,
      blocks: model.blocks.filter((b) => b.id !== id),
    }
    onModelUpdate(newModel)
  }

  const updateAugmentations = (augmentations: string[]) => {
    onModelUpdate({ ...model, augmentations })
  }

  const exportModel = () => {
    const json = JSON.stringify(model, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cnn-model.json"
    a.click()
  }

  const sendToBackend = async () => {
    setIsSending(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model),
      })
      const data = await response.json()
      console.log("[v0] Model sent to backend:", data)
      alert(`Model sent successfully! Training started with ID: ${data.trainingId}`)
    } catch (error) {
      console.error("[v0] Error sending model:", error)
      alert("Failed to send model to backend")
    } finally {
      setIsSending(false)
    }
  }

  const validateChallenge = () => {
    if (!currentOpponent?.challenge) return { valid: true, errors: [] }

    const errors: string[] = []
    const challenge = currentOpponent.challenge

    if (challenge.allowedBlocks) {
      const invalidBlocks = model.blocks.filter((b) => !challenge.allowedBlocks!.includes(b.type))
      if (invalidBlocks.length > 0) {
        errors.push(`Only ${challenge.allowedBlocks.join(", ")} blocks are allowed`)
      }
    }

    if (challenge.maxBlocks && model.blocks.length > challenge.maxBlocks) {
      errors.push(`Maximum ${challenge.maxBlocks} blocks allowed`)
    }

    if (challenge.requiredBlocks) {
      const missingBlocks = challenge.requiredBlocks.filter((reqType) => !model.blocks.some((b) => b.type === reqType))
      if (missingBlocks.length > 0) {
        errors.push(`Must include: ${missingBlocks.join(", ")}`)
      }
    }

    if (challenge.minAugmentations && model.augmentations.length < challenge.minAugmentations) {
      errors.push(`Minimum ${challenge.minAugmentations} augmentations required`)
    }

    return { valid: errors.length === 0, errors }
  }

  const validation = validateChallenge()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Model Architecture</CardTitle>
                <CardDescription>Build your CNN layer by layer</CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowBlockSelector(true)} className="bg-primary hover:bg-primary-light">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </div>
          {currentOpponent?.challenge && (
            <Alert className="mt-4 bg-primary/10 border-primary/30">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                <strong className="text-primary">Challenge:</strong>
                {currentOpponent.challenge.allowedBlocks && (
                  <div>Allowed: {currentOpponent.challenge.allowedBlocks.join(", ")}</div>
                )}
                {currentOpponent.challenge.requiredBlocks && (
                  <div>Required: {currentOpponent.challenge.requiredBlocks.join(", ")}</div>
                )}
                {currentOpponent.challenge.maxBlocks && <div>Max blocks: {currentOpponent.challenge.maxBlocks}</div>}
                {currentOpponent.challenge.minAugmentations && (
                  <div>Min augmentations: {currentOpponent.challenge.minAugmentations}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {model.blocks.map((block, index) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/50 transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/30 text-primary border-primary/50">Layer {index + 1}</Badge>
                  <span className="font-semibold text-foreground">{block.type}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {block.type === "ConvBlock" && (
                    <>
                      In: {block.params.in_channels} | Out: {block.params.out_channels} | Kernel:{" "}
                      {block.params.kernel_size}x{block.params.kernel_size}
                    </>
                  )}
                  {block.type === "SEBlock" && (
                    <>
                      Channels: {block.params.in_channels} | Reduction: {block.params.reduction}
                    </>
                  )}
                  {block.type === "BottleneckBlock" && (
                    <>
                      In: {block.params.in_channels} | Out: {block.params.out_channels} | Expansion:{" "}
                      {block.params.expansion}
                    </>
                  )}
                  {block.type === "MaxPoolBlock" && (
                    <>
                      Pool: {block.params.pool_size}x{block.params.pool_size}
                    </>
                  )}
                  {block.type === "DenseBlock" && <>Units: {block.params.units}</>}
                  {block.activation && <> | Act: {block.activation}</>}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeBlock(block.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {model.blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No blocks added yet. Click "Add Block" to start building your model.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <AugmentationSelector
          selected={model.augmentations}
          onUpdate={(augmentations) => onModelUpdate({ ...model, augmentations })}
        />

        {!validation.valid && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Challenge Requirements Not Met:</div>
              <ul className="list-disc list-inside text-sm">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-accent/30 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Download className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Export & Train</CardTitle>
                <CardDescription>Download or train your model</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={exportModel} className="w-full bg-accent hover:bg-accent-light text-background">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
            <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <pre className="text-xs overflow-auto max-h-32 text-primary">{JSON.stringify(model, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {showBlockSelector && (
        <BlockSelector
          onSelect={addBlock}
          onClose={() => setShowBlockSelector(false)}
          allowedBlocks={currentOpponent?.challenge?.allowedBlocks}
        />
      )}
    </div>
  )
}
