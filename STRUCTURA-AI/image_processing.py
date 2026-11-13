"""Explainable image processing; thresholds are NOT defect predictions."""
import cv2
import numpy as np

def process(rgb):
    if rgb is None or rgb.ndim != 3 or rgb.shape[2] != 3:
        raise ValueError('Expected an RGB image')
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    gaussian = cv2.GaussianBlur(gray, (5, 5), 0)
    median = cv2.medianBlur(gray, 5)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    equalized = cv2.equalizeHist(gray)
    sobel = cv2.convertScaleAbs(cv2.magnitude(cv2.Sobel(gray, cv2.CV_32F, 1, 0), cv2.Sobel(gray, cv2.CV_32F, 0, 1)))
    canny = cv2.Canny(gaussian, 50, 150)
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    kernel = np.ones((3, 3), np.uint8)
    erosion = cv2.erode(otsu, kernel)
    dilation = cv2.dilate(otsu, kernel)
    opening = cv2.morphologyEx(otsu, cv2.MORPH_OPEN, kernel)
    closing = cv2.morphologyEx(otsu, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    overlay = rgb.copy()
    cv2.drawContours(overlay, contours, -1, (255, 0, 0), 1)
    return {'Original': rgb, 'Grayscale': gray, 'Gaussian': gaussian, 'Median': median,
            'CLAHE': clahe, 'Histogram equalization': equalized,
            'HSV (encoded channels)': cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV),
            'Lab (encoded channels)': cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB),
            'Sobel': sobel, 'Canny': canny, 'Otsu candidate regions': otsu,
            'Adaptive candidate regions': adaptive, 'Erosion': erosion, 'Dilation': dilation,
            'Opening': opening, 'Closing': closing, 'Candidate contours': overlay}

def quality(rgb):
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    return {'width_px': int(gray.shape[1]), 'height_px': int(gray.shape[0]),
            'brightness': float(gray.mean()), 'laplacian_variance': float(cv2.Laplacian(gray, cv2.CV_64F).var()),
            'edge_density': float(np.mean(cv2.Canny(gray, 50, 150) > 0))}
