"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Swords, Trophy, Zap, Shield, AlertCircle, Flame } from "lucide-react"
import type { Pokemon, CNNModel } from "@/lib/types"
import { opponents } from "@/lib/opponents"

interface BattleArenaProps {
  playerPokemon: Pokemon
  currentOpponent: number
  onOpponentChange: (index: number) => void
  playerModel: CNNModel
  onBattleComplete?: (accuracy: number, loss: number) => void
}

export function BattleArena({
  playerPokemon,
  currentOpponent,
  onOpponentChange,
  playerModel,
  onBattleComplete,
}: BattleArenaProps) {
  const [battling, setBattling] = useState(false)
  const [battleResult, setBattleResult] = useState<{
    result: "win" | "lose"
    accuracy: number
    loss: number
  } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const opponent = opponents[currentOpponent]

  const validateChallenge = (): string | null => {
    if (!opponent.challenge) return null

    const { allowedBlocks, requiredBlocks, maxBlocks, minAugmentations } = opponent.challenge

    if (allowedBlocks) {
      const invalidBlocks = playerModel.blocks.filter((block) => !allowedBlocks.includes(block.type))
      if (invalidBlocks.length > 0) {
        return `Only ${allowedBlocks.join(", ")} blocks are allowed for this challenge!`
      }
    }

    if (requiredBlocks) {
      const missingBlocks = requiredBlocks.filter(
        (reqType) => !playerModel.blocks.some((block) => block.type === reqType),
      )
      if (missingBlocks.length > 0) {
        return `You must include these blocks: ${missingBlocks.join(", ")}`
      }
    }

    if (maxBlocks && playerModel.blocks.length > maxBlocks) {
      return `Maximum ${maxBlocks} blocks allowed! You have ${playerModel.blocks.length}`
    }

    if (minAugmentations && playerModel.augmentations.length < minAugmentations) {
      return `Minimum ${minAugmentations} augmentations required! You have ${playerModel.augmentations.length}`
    }

    return null
  }

  const startBattle = async () => {
    const error = validateChallenge()
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    setBattling(true)
    setBattleResult(null)

    try {
      const trainResponse = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "pokemon",
          blocks: playerModel.blocks.map((block, index) => ({
            id: block.id || `${index + 1}`,
            type: block.type,
            params: block.params,
            activation: block.activation,
          })),
          augmentations: playerModel.augmentations,
        }),
      })

      if (!trainResponse.ok) {
        const errorText = await trainResponse.text()
        console.error("[v0] Train API error:", errorText)
        throw new Error(`Training request failed: ${trainResponse.status}`)
      }

      const trainData = await trainResponse.json()
      console.log("[v0] Train response:", trainData)

      if (trainData.status === "success" && trainData.data?.training_results) {
        const { loss, accuracy } = trainData.data.training_results

        const test_accuracy = Number(accuracy)
        const test_loss = Number(loss)

        if (isNaN(test_accuracy) || isNaN(test_loss)) {
          throw new Error("Invalid training results from backend")
        }

        const result = test_accuracy >= opponent.accuracyThreshold * 100 ? "win" : "lose"

        setBattleResult({
          result,
          accuracy: test_accuracy,
          loss: test_loss,
        })
        setBattling(false)

        if (onBattleComplete) {
          onBattleComplete(test_accuracy, test_loss)
        }
      } else {
        throw new Error("Invalid response format from backend")
      }
    } catch (error) {
      console.error("[v0] Battle error:", error)
      setBattling(false)
      setValidationError(error instanceof Error ? error.message : "Failed to complete battle. Please try again.")
    }
  }

  const nextOpponent = () => {
    if (currentOpponent < opponents.length - 1) {
      onOpponentChange(currentOpponent + 1)
      setBattleResult(null)
      setValidationError(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Player Pokemon */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{playerPokemon.name}</span>
              <Badge className="bg-primary/30 text-primary border-primary/50">Level {playerPokemon.level}</Badge>
            </CardTitle>
            <CardDescription>Your Neural Network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={"/myPokemon.png"}
              alt={playerPokemon.name}
              className="w-full h-48 object-contain rounded-lg bg-gradient-to-b from-primary/10 to-transparent border border-primary/20"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground">Blocks</p>
                <p className="text-2xl font-bold text-primary">{playerModel.blocks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground">Augmentations</p>
                <p className="text-2xl font-bold text-accent">{playerModel.augmentations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opponent Pokemon */}
        <Card className="border-destructive/30 bg-card/50 backdrop-blur-sm hover:border-destructive/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{opponent.name}</span>
              <Badge className="bg-destructive/30 text-destructive border-destructive/50">Level {opponent.level}</Badge>
            </CardTitle>
            <CardDescription>Opponent #{currentOpponent + 1}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={opponent.image || "/placeholder.svg"}
              alt={opponent.name}
              className="w-full h-48 object-contain rounded-lg bg-gradient-to-b from-destructive/10 to-transparent border border-destructive/20"
            />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required Accuracy</span>
                <span className="font-bold text-accent">{(opponent.accuracyThreshold * 100).toFixed(1)}%</span>
              </div>
              <Progress value={opponent.accuracyThreshold * 100} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">{opponent.description}</p>
            {opponent.challenge && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Challenge Rules:</span>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  {opponent.challenge.allowedBlocks && (
                    <div>Allowed: {opponent.challenge.allowedBlocks.join(", ")}</div>
                  )}
                  {opponent.challenge.requiredBlocks && (
                    <div>Required: {opponent.challenge.requiredBlocks.join(", ")}</div>
                  )}
                  {opponent.challenge.maxBlocks && <div>Max blocks: {opponent.challenge.maxBlocks}</div>}
                  {opponent.challenge.minAugmentations && (
                    <div>Min augmentations: {opponent.challenge.minAugmentations}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Battle Controls */}
      <Card className="border-accent/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          {validationError && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Challenge Requirements Not Met</p>
                <p className="text-sm text-muted-foreground mt-1">{validationError}</p>
              </div>
            </div>
          )}

          {!battleResult && !battling && (
            <Button
              onClick={startBattle}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-background font-bold"
              disabled={battling}
            >
              <Swords className="h-5 w-5 mr-2" />
              Start Battle
            </Button>
          )}

          {battling && (
            <div className="text-center space-y-4 py-8">
              <Zap className="h-12 w-12 mx-auto text-accent animate-pulse" />
              <p className="text-lg font-semibold">Battle in progress...</p>
              <p className="text-sm text-muted-foreground">Training your model and evaluating performance</p>
            </div>
          )}

          {battleResult?.result === "win" && (
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <Trophy className="h-16 w-16 text-accent animate-bounce" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-accent">Victory!</h3>
                <p className="text-muted-foreground">Your model outperformed the opponent!</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-xs text-muted-foreground">Test Accuracy</p>
                  <p className="text-2xl font-bold text-accent">{battleResult.accuracy.toFixed(2)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground">Test Loss</p>
                  <p className="text-2xl font-bold text-foreground">{battleResult.loss.toFixed(4)}</p>
                </div>
              </div>
              {currentOpponent < opponents.length - 1 ? (
                <Button onClick={nextOpponent} size="lg" className="w-full bg-primary hover:bg-primary-light">
                  <Flame className="h-4 w-4 mr-2" />
                  Next Opponent
                </Button>
              ) : (
                <div className="space-y-2 py-4">
                  <p className="text-lg font-bold text-primary">🏆 You defeated all opponents!</p>
                  <p className="text-sm text-muted-foreground">You are the Neural Network Champion!</p>
                </div>
              )}
            </div>
          )}

          {battleResult?.result === "lose" && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">😔</div>
              <div>
                <h3 className="text-3xl font-black text-destructive">Defeat</h3>
                <p className="text-muted-foreground">
                  Your model accuracy was {battleResult.accuracy.toFixed(2)}%, but you needed{" "}
                  {(opponent.accuracyThreshold * 100).toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-xs text-muted-foreground">Test Accuracy</p>
                  <p className="text-2xl font-bold text-destructive">{battleResult.accuracy.toFixed(2)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground">Test Loss</p>
                  <p className="text-2xl font-bold text-foreground">{battleResult.loss.toFixed(4)}</p>
                </div>
              </div>
              <Button
                onClick={() => setBattleResult(null)}
                size="lg"
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opponent Progress */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Battle Progress</CardTitle>
          <CardDescription>Defeat all {opponents.length} opponents to become the champion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {opponents.map((opp, index) => (
              <button
                key={opp.id}
                onClick={() => {
                  onOpponentChange(index)
                  setBattleResult(null)
                  setValidationError(null)
                }}
                className={`aspect-square rounded-lg border-2 font-semibold transition-all hover:scale-110 ${
                  index === currentOpponent
                    ? "border-accent bg-accent/20 text-accent"
                    : index < currentOpponent
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                }`}
                title={opp.name}
              >
                <span className="text-xs">{index + 1}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
