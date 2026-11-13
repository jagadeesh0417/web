"""Illustrative Mamdani fuzzy inference, not an engineering standard.

This engine accepts a verified model's mask area and an image-quality heuristic.
It is not connected to the UI because no trained, evaluated model is supplied.
"""
import numpy as np

def memberships(value):
    x = float(np.clip(value, 0, 100))
    return {'low': float(np.interp(x, [0, 25, 50], [1, 1, 0])),
            'medium': float(np.interp(x, [20, 50, 80], [0, 1, 0])),
            'high': float(np.interp(x, [50, 75, 100], [0, 1, 1]))}

def assess(area_percent, quality_score, *, model_available, unfamiliar=False):
    if not model_available:
        return {'score': None, 'priority': None, 'reliability': 'LOW',
                'manual_review': True, 'reason': 'No evaluated model available'}
    if not (0 <= area_percent <= 100 and 0 <= quality_score <= 100):
        raise ValueError('Inputs must be percentages between 0 and 100')
    # Area is expanded to make small visible fractions distinguishable; this mapping is illustrative.
    a = memberships(min(100, area_percent * 5))
    q = memberships(quality_score)
    x = np.linspace(0, 100, 1001)
    low = np.interp(x, [0, 20, 40], [1, 1, 0])
    medium = np.maximum(0, 1 - abs(x - 50) / 30)
    high = np.interp(x, [60, 80, 100], [0, 1, 1])
    activations = {'area low -> low': a['low'], 'area medium -> medium': a['medium'],
                   'area high -> high': a['high']}
    aggregated = np.maximum.reduce([np.minimum(activations['area low -> low'], low),
                                    np.minimum(activations['area medium -> medium'], medium),
                                    np.minimum(activations['area high -> high'], high)])
    score = float(np.sum(x * aggregated) / np.sum(aggregated))
    reliability = 'LOW' if quality_score < 40 or unfamiliar else 'MEDIUM'
    return {'score': score, 'priority': 'LOW' if score < 25 else 'MODERATE' if score < 50 else 'HIGH' if score < 75 else 'URGENT',
            'reliability': reliability, 'manual_review': True, 'area_memberships': a,
            'quality_memberships': q, 'activated_rules': activations,
            'reason': 'Illustrative area-based rules; not validated for clinical or engineering decisions'}
