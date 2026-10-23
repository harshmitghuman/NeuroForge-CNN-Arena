"use client"

import { useState } from "react"
import { ModelBuilder } from "@/components/model-builder"
import { BattleArena } from "@/components/battle-arena"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CNNModel, Pokemon } from "@/lib/types"
import { opponents } from "@/lib/opponents"
import { Zap } from "lucide-react"

export default function Home() {
  const [currentModel, setCurrentModel] = useState<CNNModel>({
    name: "Starter Model",
    inputShape: [3, 32, 32],
    blocks: [
      {
        id: "1",
        type: "ConvBlock",
        params: { in_channels: 3, out_channels: 32, kernel_size: 3, stride: 1, padding: 1 },
        activation: "relu",
      },
      {
        id: "2",
        type: "MaxPoolBlock",
        params: { pool_size: 2, stride: 2 },
      },
    ],
    augmentations: [
      { type: "RandomHorizontalFlip", params: { p: 0.5 } },
      { type: "RandomRotation", params: { degrees: 15 } },
    ],
  })

  const [playerPokemon, setPlayerPokemon] = useState<Pokemon>({
    id: "player",
    name: "NeuralMon",
    level: 1,
    image: "/neural-network-pokemon-starter.jpg",
    accuracy: 0.65,
    model: currentModel,
  })

  const [currentOpponent, setCurrentOpponent] = useState(0)

  const handleModelUpdate = (model: CNNModel) => {
    setCurrentModel(model)
    setPlayerPokemon((prev) => ({ ...prev, model }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-accent animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                  CNN Battle Arena
                </span>
              </h1>
              <Zap className="h-8 w-8 text-accent animate-pulse" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Build powerful neural networks and battle opponents to become the champion
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        <Tabs defaultValue="builder" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 bg-card border border-border/50">
              <TabsTrigger
                value="builder"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                Model Builder
              </TabsTrigger>
              <TabsTrigger value="battle" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                Battle Arena
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder" className="space-y-4">
            <ModelBuilder
              model={currentModel}
              onModelUpdate={handleModelUpdate}
              currentOpponent={opponents[currentOpponent]}
            />
          </TabsContent>

          <TabsContent value="battle" className="space-y-4">
            <BattleArena
              playerPokemon={playerPokemon}
              currentOpponent={currentOpponent}
              onOpponentChange={setCurrentOpponent}
              playerModel={currentModel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
