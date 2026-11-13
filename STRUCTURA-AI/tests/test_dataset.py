from pathlib import Path

import pytest
import torch

from deep_learning.dataset import ROOT, SegmentationDataset
from deep_learning.model import UNet
from deep_learning.train import loss_fn, run_epoch
from torch.utils.data import DataLoader, TensorDataset

def test_training_step():
    model = UNet(channels=2)
    images = torch.rand(2, 3, 16, 16)
    masks = torch.zeros(2, 1, 16, 16)
    loader = DataLoader(TensorDataset(images, masks), batch_size=2)
    result = run_epoch(model, loader, torch.device('cpu'), torch.optim.Adam(model.parameters()))
    assert result['loss'] > 0
    assert sum(result['confusion_pixels'].values()) == 512

def test_undefined_precision_is_not_zero():
    class AllNegative(torch.nn.Module):
        def forward(self, inputs):
            return torch.full((len(inputs), 1, 16, 16), -100.0)
    images = torch.zeros(1, 3, 16, 16)
    masks = torch.ones(1, 1, 16, 16)
    result = run_epoch(AllNegative(), DataLoader(TensorDataset(images, masks)), torch.device('cpu'))
    assert result['precision'] is None
    assert result['recall'] == 0

def test_actual_dataset_pair():
    manifest = ROOT / 'data/metadata/manifest.csv'
    if not manifest.exists():
        pytest.skip('Dataset not acquired')
    dataset = SegmentationDataset(manifest, 'train', size=32, augment=True)
    image, mask = dataset[0]
    assert image.shape == (3, 32, 32)
    assert mask.shape == (1, 32, 32)
    assert set(torch.unique(mask).tolist()).issubset({0., 1.})
