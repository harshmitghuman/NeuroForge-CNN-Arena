
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Subset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def build_train_transform(augmentations):
    """Build image transforms from the Model Builder selections."""

    selected = []

    for augmentation in augmentations or []:
        name = (
            augmentation.get("type", "")
            .lower()
            .replace("_", "")
            .replace("-", "")
            .replace(" ", "")
        )
        params = augmentation.get("params", {})

        if name in ("horizontalflip", "randomhorizontalflip"):
            probability = float(params.get("p", 0.5))
            selected.append(
                transforms.RandomHorizontalFlip(p=probability)
            )

        elif name in ("verticalflip", "randomverticalflip"):
            probability = float(params.get("p", 0.5))
            selected.append(
                transforms.RandomVerticalFlip(p=probability)
            )

        elif name in ("rotation", "randomrotation"):
            degrees = float(params.get("degrees", 10))
            selected.append(
                transforms.RandomRotation(degrees=degrees)
            )

        elif name in ("colorjitter", "colourjitter"):
            brightness = float(params.get("brightness", 0.2))
            contrast = float(params.get("contrast", 0.2))
            selected.append(
                transforms.ColorJitter(
                    brightness=brightness,
                    contrast=contrast,
                )
            )

        elif name in ("randomcrop", "crop"):
            size = int(params.get("size", 32))
            padding = int(params.get("padding", 4))
            selected.append(
                transforms.RandomCrop(size, padding=padding)
            )

        elif name in ("gaussiannoise", "noise"):
            # Gaussian noise is handled separately below.
            selected.append(GaussianNoise(
                std=float(params.get("std", params.get("amount", 0.05)))
            ))

        else:
            print(f"Warning: unsupported augmentation ignored: {name}")

    selected.extend([
        transforms.ToTensor(),
        transforms.Normalize(
            (0.5, 0.5, 0.5),
            (0.5, 0.5, 0.5),
        ),
    ])

    return transforms.Compose(selected)


class GaussianNoise:
    """Add light Gaussian noise to a tensor image."""

    def __init__(self, std=0.05):
        self.std = max(0.0, float(std))

    def __call__(self, image):
        if not isinstance(image, torch.Tensor):
            image = transforms.ToTensor()(image)

        return (image + torch.randn_like(image) * self.std).clamp(0, 1)


def train_model(
    model,
    epochs=5,
    batch_size=64,
    learning_rate=0.002,
    augmentations=None,
):
    """Train and evaluate a CNN on a fixed subset of CIFAR-10."""

    train_transform = build_train_transform(augmentations)

    test_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(
            (0.5, 0.5, 0.5),
            (0.5, 0.5, 0.5),
        ),
    ])

    trainset = torchvision.datasets.CIFAR10(
        root="./data",
        train=True,
        download=True,
        transform=train_transform,
    )
    trainset = Subset(trainset, range(10000))

    trainloader = DataLoader(
        trainset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
    )

    testset = torchvision.datasets.CIFAR10(
        root="./data",
        train=False,
        download=True,
        transform=test_transform,
    )
    testset = Subset(testset, range(2000))

    testloader = DataLoader(
        testset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
    )

    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    epoch_loss = 0.0

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in trainloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)

            if outputs.ndim != 2 or outputs.shape[1] != 10:
                raise ValueError(
                    f"Expected output shape [batch, 10], "
                    f"got {tuple(outputs.shape)}"
                )

            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            predicted = outputs.argmax(dim=1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        epoch_loss = running_loss / len(trainset)
        epoch_accuracy = 100.0 * correct / total

        print(
            f"Epoch {epoch + 1}/{epochs}, "
            f"Loss: {epoch_loss:.4f}, "
            f"Accuracy: {epoch_accuracy:.2f}%"
        )

    model.eval()
    correct = 0
    total = 0
    test_loss = 0.0

    with torch.no_grad():
        for inputs, labels in testloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)

            if outputs.ndim != 2 or outputs.shape[1] != 10:
                raise ValueError(
                    f"Expected output shape [batch, 10], "
                    f"got {tuple(outputs.shape)}"
                )

            loss = criterion(outputs, labels)
            test_loss += loss.item() * inputs.size(0)

            predicted = outputs.argmax(dim=1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100.0 * correct / total
    test_loss /= total

    print(f"Test Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {accuracy:.2f}%")

    return {
        "loss": epoch_loss,
        "accuracy": accuracy,
    }
