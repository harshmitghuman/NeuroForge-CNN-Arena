export interface BlockParams {
  in_channels?: number
  out_channels?: number
  kernel_size?: number
  stride?: number
  padding?: number
  reduction?: number
  expansion?: number
  pool_size?: number
  units?: number
}

export interface Block {
  id: string
  type: "ConvBlock" | "SEBlock" | "BottleneckBlock" | "MaxPoolBlock" | "DenseBlock"
  params: BlockParams
  activation?: "relu" | "sigmoid" | "tanh" | "leaky_relu"
}

export interface Augmentation {
  type:
    | "RandomHorizontalFlip"
    | "RandomVerticalFlip"
    | "RandomRotation"
    | "RandomCrop"
    | "ColorJitter"
    | "GaussianNoise"
  params: Record<string, number | boolean>
}

export interface CNNModel {
  name: string
  inputShape: [number, number, number]
  blocks: Block[]
  augmentations: Augmentation[]
}

export interface Pokemon {
  id: string
  name: string
  level: number
  image: string
  accuracy: number
  model: CNNModel
}

export interface Opponent extends Pokemon {
  accuracyThreshold: number
  description: string
  challenge?: {
    allowedBlocks?: Array<Block["type"]>
    maxBlocks?: number
    requiredBlocks?: Array<Block["type"]>
    minAugmentations?: number
  }
}

export interface TrainingResponse {
  status: "success" | "error"
  data?: {
    training_results: {
      test_accuracy: number
      test_loss: number
    }
  }
  trainingId?: string
  message?: string
}

export interface TrainingStatusResponse {
  status: "training" | "completed" | "failed"
  data?: {
    training_results: {
      test_accuracy: number
      test_loss: number
    }
  }
  progress?: number
  currentEpoch?: number
  totalEpochs?: number
}
