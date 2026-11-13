"""NCCD manifest loader with synchronized geometric augmentation."""
import csv
import random
from pathlib import Path

import cv2
import numpy as np
import torch
from torch.utils.data import Dataset

ROOT = Path(__file__).resolve().parents[1]

class SegmentationDataset(Dataset):
    def __init__(self, manifest, split, size=224, augment=False):
        self.size, self.augment = size, augment
        with open(manifest, newline='', encoding='utf-8') as f:
            self.rows = [row for row in csv.DictReader(f) if row['split'] == split]
        if not self.rows:
            raise ValueError(f'No rows for split {split}')

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        row = self.rows[index]
        image = cv2.imread(str(ROOT / row['image']), cv2.IMREAD_COLOR)
        mask = cv2.imread(str(ROOT / row['mask']), cv2.IMREAD_GRAYSCALE)
        if image is None or mask is None:
            raise ValueError(f"Could not read pair: {row['image']}, {row['mask']}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (self.size, self.size), interpolation=cv2.INTER_AREA)
        mask = cv2.resize(mask, (self.size, self.size), interpolation=cv2.INTER_NEAREST)
        if self.augment and random.random() < .5:
            image, mask = np.fliplr(image), np.fliplr(mask)
        image = np.ascontiguousarray(image.transpose(2, 0, 1), dtype=np.float32) / 255.0
        mask = np.ascontiguousarray(mask[None] > 127, dtype=np.float32)
        return torch.from_numpy(image), torch.from_numpy(mask)
