# Experiment log

## CPU smoke experiment

Command: `python -m deep_learning.train --epochs 1 --size 64 --channels 4 --batch-size 16`.

Dataset: NCCD-PF, 3,771 exploratory training and 808 exploratory validation images. Exact duplicate grouping was used, but near-duplicate and source-structure leakage were not excluded. PyTorch 2.12.0+cpu, no GPU.

After one epoch, validation loss was 0.9586437256. At threshold 0.5, validation true positives = 0, false positives = 0, false negatives = 5,497 and true negatives = 3,304,071 pixels. Recall, Dice and IoU are 0. Precision is recorded as 0 by the implementation when there are no predicted positives (mathematically undefined). This degenerate all-background model is not useful for detecting cracks. Images were resized to 64 × 64, which may erase narrow cracks. No independent structural generalization can be inferred. Model probabilities are not calibrated.

The model is not enabled in the application. This was a pipeline smoke experiment, not a successful training result. Improving sampling, retaining resolution, handling imbalance and evaluating on independently grouped data are necessary before any use.

### Exploratory test split

The saved checkpoint was also evaluated on 809 test images using `python -m deep_learning.evaluate`. Test loss was 0.9816073435, with TP = 0, FP = 0, FN = 5,632 and TN = 3,308,032 pixels after resizing. Recall, Dice and IoU were 0; precision was undefined because there were no predicted positive pixels. The original `models/test_metrics.json` records precision as 0 under the old zero-division convention; subsequent evaluations record it as `null`. This split does not establish independent structural generalization.
