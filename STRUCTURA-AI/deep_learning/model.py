"""Compact binary U-Net; logits are returned at the input resolution."""
import torch
from torch import nn
from torch.nn import functional as F

def block(a, b):
    return nn.Sequential(nn.Conv2d(a, b, 3, padding=1), nn.ReLU(),
                         nn.Conv2d(b, b, 3, padding=1), nn.ReLU())

class UNet(nn.Module):
    def __init__(self, channels=16):
        super().__init__()
        c = channels
        self.enc1, self.enc2, self.mid = block(3, c), block(c, 2*c), block(2*c, 4*c)
        self.dec2, self.dec1 = block(6*c, 2*c), block(3*c, c)
        self.head = nn.Conv2d(c, 1, 1)
        self.pool = nn.MaxPool2d(2)

    def forward(self, x):
        a = self.enc1(x)
        b = self.enc2(self.pool(a))
        x = self.mid(self.pool(b))
        x = self.dec2(torch.cat((F.interpolate(x, size=b.shape[-2:], mode='bilinear', align_corners=False), b), 1))
        x = self.dec1(torch.cat((F.interpolate(x, size=a.shape[-2:], mode='bilinear', align_corners=False), a), 1))
        return self.head(x)
