# NeuroForge CNN Arena

**A visual platform for building, training, and evaluating custom convolutional neural networks.**

NeuroForge CNN Arena is an interactive deep learning application that combines visual neural network design with a gamified image classification experience. Users can configure CNN architectures using a block-based interface, select image augmentation techniques, and evaluate trained models in a battle arena.

## Features

- **Visual Model Builder:** Create CNN architectures using configurable convolutional and pooling layers.
- **Data Augmentation:** Configure horizontal flipping, rotation, and color jitter.
- **Model Training:** Train image classification models using PyTorch.
- **Interactive Battle Arena:** Test models against opponents with different accuracy requirements.
- **Performance Evaluation:** View test accuracy and loss after training.
- **Full-Stack Application:** A Next.js frontend communicates with a FastAPI backend.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Python, FastAPI
- **Deep Learning:** PyTorch, Torchvision
- **Dataset:** CIFAR-10

## Dataset

The application uses the CIFAR-10 dataset, which contains 60,000 color images of size 32 × 32 pixels across 10 classes: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, and truck.

Official dataset: https://www.cs.toronto.edu/~kriz/cifar.html

The dataset is downloaded by Torchvision when needed and is not included in this repository.

## Installation and Setup

### Prerequisites

- Python 3.10
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/harshmitghuman/NeuroForge-CNN-Arena.git
cd NeuroForge-CNN-Arena
```

### 2. Start the backend

```bash
cd pythonBackend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.app:app --reload
```

Backend address: http://127.0.0.1:8000

### 3. Start the frontend

Open a second terminal:

```bash
cd pokemonFrontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## How It Works

1. Build a CNN architecture using the visual model builder.
2. Configure available image augmentation options.
3. Start a battle to submit the model configuration for training.
4. The backend constructs the model and trains it on CIFAR-10.
5. Review the resulting test accuracy and loss against the opponent's required accuracy.

**Note:** The Pokémon-themed opponents are part of the game's interface. The model classifies CIFAR-10 images, not Pokémon images.

## Modifications

This version includes modifications to the CNN model-building and training pipeline, including support for configurable convolutional blocks and a reduced dataset subset to make local experimentation more manageable.

## Author

**Harshmit Ghuman**

GitHub: https://github.com/harshmitghuman
