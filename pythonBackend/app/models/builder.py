

import torch
import torch.nn as nn


def get_activation(name):
    activations = {
        "relu": nn.ReLU,
        "leakyrelu": nn.LeakyReLU,
        "elu": nn.ELU,
        "selu": nn.SELU,
        "sigmoid": nn.Sigmoid,
        "tanh": nn.Tanh,
        "softmax": lambda: nn.Softmax(dim=1),
    }

    key = (name or "relu").lower()

    if key not in activations:
        raise ValueError(f"Unsupported activation: {name}")

    return activations[key]()


def create_conv_block(params, activation="relu"):
    params = dict(params)

    params.pop("activation", None)
    batch_norm = params.pop("batch_norm", False)
    dropout = params.pop("dropout", 0)

    layers = [nn.Conv2d(**params)]

    if batch_norm:
        layers.append(nn.BatchNorm2d(params["out_channels"]))

    if activation:
        layers.append(get_activation(activation))

    if dropout:
        layers.append(nn.Dropout2d(float(dropout)))

    return nn.Sequential(*layers)


class SEBlock(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()

        hidden = max(1, channels // reduction)

        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Conv2d(channels, hidden, kernel_size=1),
            nn.ReLU(),
            nn.Conv2d(hidden, channels, kernel_size=1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        return x * self.fc(self.pool(x))


class BottleneckBlock(nn.Module):
    def __init__(self, params):
        super().__init__()

        in_ch = params["in_channels"]
        out_ch = params["out_channels"]
        expansion = params.get("expansion", 4)
        hidden = max(1, out_ch // expansion)

        self.body = nn.Sequential(
            nn.Conv2d(in_ch, hidden, 1, bias=False),
            nn.BatchNorm2d(hidden),
            nn.ReLU(),
            nn.Conv2d(hidden, hidden, 3, padding=1, bias=False),
            nn.BatchNorm2d(hidden),
            nn.ReLU(),
            nn.Conv2d(hidden, out_ch, 1, bias=False),
            nn.BatchNorm2d(out_ch),
        )

        self.skip = (
            nn.Identity()
            if in_ch == out_ch
            else nn.Conv2d(in_ch, out_ch, 1, bias=False)
        )

        self.relu = nn.ReLU()

    def forward(self, x):
        return self.relu(self.body(x) + self.skip(x))


class CNN(nn.Module):
    def __init__(self, blocks):
        super().__init__()

        self.layers = nn.ModuleList()
        channels = 3
        flattened = False

        for block in blocks:
            kind = block["type"]
            params = dict(block.get("params", {}))
            activation = block.get(
                "activation",
                params.pop("activation", "relu"),
            )

            if kind == "ConvBlock":
                # Critical fix: use the previous layer's channel count.
                params["in_channels"] = channels

                layer = create_conv_block(params, activation)
                channels = params["out_channels"]

            elif kind == "BottleneckBlock":
                params["in_channels"] = channels

                layer = BottleneckBlock(params)
                channels = params["out_channels"]

            elif kind == "SEBlock":
                # SE blocks preserve the number of channels.
                layer = SEBlock(
                    channels,
                    params.get("reduction", 16),
                )

            elif kind == "MaxPoolBlock":
                pool_size = params.get(
                    "pool_size",
                    params.get("kernel_size", 2),
                )
                stride = params.get("stride", pool_size)

                layer = nn.MaxPool2d(
                    kernel_size=pool_size,
                    stride=stride,
                )

            elif kind == "DenseBlock":
                if not flattened:
                    self.layers.append(nn.AdaptiveAvgPool2d(1))
                    self.layers.append(nn.Flatten())
                    flattened = True

                in_features = params.get(
                    "in_features",
                    params.get("in_channels", channels),
                )
                out_features = params.get(
                    "out_features",
                    params.get("units", 128),
                )

                layer = nn.Linear(in_features, out_features)
                channels = out_features

            elif kind == "GlobalAvgPool":
                layer = nn.AdaptiveAvgPool2d(1)

            elif kind == "Flatten":
                layer = nn.Flatten()
                flattened = True

            elif kind == "DropoutBlock":
                layer = nn.Dropout(
                    params.get("p", params.get("dropout", 0.5))
                )

            elif kind == "BatchNormBlock":
                if flattened:
                    layer = nn.BatchNorm1d(
                        params.get("num_features", channels)
                    )
                else:
                    layer = nn.BatchNorm2d(
                        params.get("num_features", channels)
                    )

            elif kind == "SoftmaxOutputBlock":
                layer = nn.Softmax(dim=1)

            else:
                raise ValueError(
                    f"Unsupported block type: {kind}"
                )

            self.layers.append(layer)

        if not flattened:
            self.layers.append(nn.AdaptiveAvgPool2d(1))
            self.layers.append(nn.Flatten())

        # CIFAR-10 has 10 output classes.
        self.layers.append(nn.LazyLinear(10))

    def forward(self, x):
        for layer in self.layers:
            x = layer(x)

        return x


def build_model_from_json(tower_json):
    return CNN(tower_json.get("blocks", []))
