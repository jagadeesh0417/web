"""Inspect NCCD-PF and write a reproducible, exact-duplicate-grouped manifest.

Splits are exploratory only: the archive does not provide structure/source IDs
here, so visual similarity and structure-level leakage cannot be ruled out.
"""
import csv
import hashlib
import json
import random
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'data/extracted/nccd_pf/NCCD-PF_Dataset/Dataset_for_semantic_segmentation'
DEST = ROOT / 'data/metadata'

def main():
    images = sorted((SOURCE / 'Images').glob('image_*.jpg'))
    if not images:
        raise SystemExit('No NCCD-PF images found. Run python download_datasets.py first.')
    groups = defaultdict(list)
    errors = []
    positive = 0
    for image in images:
        suffix = image.stem.removeprefix('image_')
        mask = SOURCE / 'Masks' / f'mask_{suffix}.png'
        im = cv2.imread(str(image), cv2.IMREAD_COLOR)
        label = cv2.imread(str(mask), cv2.IMREAD_GRAYSCALE)
        if im is None or label is None or im.shape[:2] != label.shape[:2]:
            errors.append({'image': str(image.relative_to(ROOT)), 'mask': str(mask.relative_to(ROOT)), 'reason': 'missing, corrupt or size mismatch'})
            continue
        positive += int(np.any(label > 127))
        # Hash decoded image content so different encodings of identical pixels group together.
        h = hashlib.sha256(im.tobytes() + str(im.shape).encode()).hexdigest()
        groups[h].append((image, mask))
    keys = sorted(groups)
    random.Random(42).shuffle(keys)
    n = len(keys)
    counts = Counter()
    DEST.mkdir(parents=True, exist_ok=True)
    with (DEST / 'manifest.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['image', 'mask', 'split', 'image_sha256'])
        for index, key in enumerate(keys):
            split = 'train' if index < int(n * .7) else 'validation' if index < int(n * .85) else 'test'
            for image, mask in groups[key]:
                writer.writerow([image.relative_to(ROOT).as_posix(), mask.relative_to(ROOT).as_posix(), split, key])
                counts[split] += 1
    masks = list((SOURCE / 'Masks').glob('mask_*.png'))
    result = {'dataset': 'NCCD-PF', 'source': 'https://zenodo.org/records/8215100',
              'license': 'CC-BY-4.0', 'segmentation_images': len(images), 'segmentation_masks': len(masks),
              'valid_pairs': sum(counts.values()), 'positive_masks': positive,
              'empty_masks': sum(counts.values()) - positive, 'exact_duplicate_images': sum(len(v)-1 for v in groups.values()),
              'splits': dict(counts), 'invalid_pairs': errors,
              'limitation': 'Exact duplicates grouped only; near duplicates and shared source structures may leak across splits. Not a valid independent structural generalization estimate.'}
    (DEST / 'dataset_statistics.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
