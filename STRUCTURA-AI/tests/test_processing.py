import numpy as np
import pytest
import torch
from image_processing import process, quality
from deep_learning.model import UNet

def test_image_processing():
    image = np.full((64, 80, 3), 128, dtype=np.uint8)
    stages = process(image)
    assert stages['Grayscale'].shape == (64, 80)
    assert stages['Opening'].shape == (64, 80)
    assert quality(image)['width_px'] == 80

def test_invalid_image():
    with pytest.raises(ValueError):
        process(np.zeros((5, 5), dtype=np.uint8))

def test_unet_shape():
    model = UNet(channels=4).eval()
    with torch.no_grad():
        assert model(torch.zeros(1, 3, 63, 65)).shape == (1, 1, 63, 65)
