"""Evaluate an existing research checkpoint on the exploratory held-out split."""
import argparse
import json

import torch
from torch.utils.data import DataLoader

from deep_learning.dataset import ROOT, SegmentationDataset
from deep_learning.model import UNet
from deep_learning.train import run_epoch

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint', default=str(ROOT / 'models/best.pt'))
    parser.add_argument('--batch-size', type=int, default=16)
    args = parser.parse_args()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    # Only load trusted project-created checkpoints.
    checkpoint = torch.load(args.checkpoint, map_location=device, weights_only=True)
    model = UNet(checkpoint['channels']).to(device)
    model.load_state_dict(checkpoint['model_state'])
    test = SegmentationDataset(ROOT / 'data/metadata/manifest.csv', 'test', checkpoint['size'])
    metrics = run_epoch(model, DataLoader(test, batch_size=args.batch_size), device)
    report = {'checkpoint': args.checkpoint, 'threshold': 0.5, 'split': 'test',
              'limitations': 'Exploratory split; related images may leak. Not safety or field validation.', 'metrics': metrics}
    path = ROOT / 'models/test_metrics.json'
    path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
