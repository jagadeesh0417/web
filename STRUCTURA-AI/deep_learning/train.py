"""Train with BCE + soft Dice; results are exploratory, not safety validation."""
import argparse
import json
import random
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader

from deep_learning.dataset import ROOT, SegmentationDataset
from deep_learning.model import UNet

def loss_fn(logits, target):
    probabilities = logits.sigmoid()
    dice = (2 * (probabilities * target).sum() + 1) / (probabilities.sum() + target.sum() + 1)
    return nn.functional.binary_cross_entropy_with_logits(logits, target) + 1 - dice

def run_epoch(model, loader, device, optimizer=None):
    training = optimizer is not None
    model.train(training)
    loss_sum = tp = fp = fn = tn = samples = 0
    with torch.set_grad_enabled(training):
        for images, masks in loader:
            images, masks = images.to(device), masks.to(device)
            if training:
                optimizer.zero_grad(set_to_none=True)
            logits = model(images)
            loss = loss_fn(logits, masks)
            if training:
                loss.backward()
                optimizer.step()
            pred, truth = logits.sigmoid() >= .5, masks >= .5
            tp += (pred & truth).sum().item()
            fp += (pred & ~truth).sum().item()
            fn += (~pred & truth).sum().item()
            tn += (~pred & ~truth).sum().item()
            samples += len(images)
            loss_sum += loss.item() * len(images)
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    dice = 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else None
    return {'loss': loss_sum / samples, 'precision': precision, 'recall': recall,
            'f1_dice': dice, 'iou': tp / (tp + fp + fn) if tp + fp + fn else None,
            'confusion_pixels': {'tp': tp, 'fp': fp, 'fn': fn, 'tn': tn}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=10)
    parser.add_argument('--batch-size', type=int, default=8)
    parser.add_argument('--size', type=int, default=224)
    parser.add_argument('--channels', type=int, default=16)
    parser.add_argument('--lr', type=float, default=1e-3)
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()
    if args.epochs < 1 or args.size < 4 or args.batch_size < 1:
        parser.error('epochs and batch size must be positive; size must be at least 4')
    random.seed(args.seed); np.random.seed(args.seed); torch.manual_seed(args.seed)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    manifest = ROOT / 'data/metadata/manifest.csv'
    train = SegmentationDataset(manifest, 'train', args.size, augment=True)
    val = SegmentationDataset(manifest, 'validation', args.size)
    loaders = [DataLoader(train, batch_size=args.batch_size, shuffle=True), DataLoader(val, batch_size=args.batch_size)]
    model = UNet(args.channels).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=2)
    output = ROOT / 'models'; output.mkdir(exist_ok=True)
    history, best = [], float('inf')
    for epoch in range(args.epochs):
        training = run_epoch(model, loaders[0], device, optimizer)
        validation = run_epoch(model, loaders[1], device)
        scheduler.step(validation['loss'])
        history.append({'epoch': epoch + 1, 'training': training, 'validation': validation})
        print(json.dumps(history[-1]), flush=True)
        checkpoint = {'model_state': model.state_dict(), 'channels': args.channels, 'size': args.size,
                      'epoch': epoch + 1, 'class': 'crack', 'validation': validation}
        torch.save(checkpoint, output / 'last.pt')
        if validation['loss'] < best:
            best = validation['loss']
            torch.save(checkpoint, output / 'best.pt')
        (output / 'history.json').write_text(json.dumps(history, indent=2), encoding='utf-8')
    print('Exploratory splits may leak related structures; metrics are not independent field validation.')

if __name__ == '__main__':
    main()
