"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Pokemon, CNNModel } from "@/lib/types"

interface PokemonSelectorProps {
  pokemon: Pokemon
  model: CNNModel
}

export function PokemonSelector({ pokemon, model }: PokemonSelectorProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{pokemon.name}</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Level {pokemon.level}
            </Badge>
          </CardTitle>
          <CardDescription>Your Neural Network Pokemon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <img
            src={pokemon.image || "/placeholder.svg"}
            alt={pokemon.name}
            className="w-full h-64 object-contain rounded-lg bg-muted/30"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model Accuracy</span>
                <span className="font-semibold">{(pokemon.accuracy * 100).toFixed(1)}%</span>
              </div>
              <Progress value={pokemon.accuracy * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-2xl font-bold text-primary">{model.blocks.length}</div>
                <div className="text-xs text-muted-foreground">Network Blocks</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-2xl font-bold text-secondary">{model.augmentations.length}</div>
                <div className="text-xs text-muted-foreground">Augmentations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle>Model Statistics</CardTitle>
          <CardDescription>Current architecture details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Architecture Layers</h3>
            {model.blocks.map((block, index) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium capitalize">{block.type}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {block.type === "conv" && `${block.filters} filters`}
                  {block.type === "se" && `r=${block.reduction}`}
                  {block.type === "bottleneck" && `e=${block.expansion}`}
                  {block.type === "pooling" && `${block.poolSize}x${block.poolSize}`}
                  {block.type === "dense" && `${block.units} units`}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Active Augmentations</h3>
            <div className="flex flex-wrap gap-2">
              {model.augmentations.map((aug) => (
                <Badge key={aug} variant="secondary" className="capitalize">
                  {aug}
                </Badge>
              ))}
              {model.augmentations.length === 0 && (
                <span className="text-sm text-muted-foreground">No augmentations active</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary font-medium">
              💡 Tip: Add more layers and augmentations to improve your model's accuracy and defeat stronger opponents!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
