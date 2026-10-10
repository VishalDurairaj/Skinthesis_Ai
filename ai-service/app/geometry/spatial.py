import numpy as np

# MediaPipe canonical 468 landmark indices for facial regions
FACIAL_ZONES = {
    "forehead": [10, 67, 109, 108, 151, 337, 338, 297],
    "left_cheek": [116, 123, 147, 213, 192, 214, 210, 202, 57],
    "right_cheek": [345, 352, 376, 433, 416, 434, 430, 422, 287],
    "nose": [1, 2, 98, 327, 168, 197, 5, 4],
    "chin": [152, 148, 176, 149, 150, 377, 400, 378, 379]
}

def extract_landmarks(face_landmarks, width: int, height: int):
    """Converts MediaPipe normalized coords (0..1) to absolute pixel points."""
    coords = []
    for lm in face_landmarks.landmark:
        x = int(lm.x * width)
        y = int(lm.y * height)
        coords.append([x, y])
    return np.array(coords, dtype=np.int32)

def calculate_spatial_geometry(coords, width: int, height: int):
    """Calculates anatomical polygons, pixel areas, and scale normalization."""
    # Eye centers: landmark 159 (left) and 386 (right)
    left_eye = coords[159]
    right_eye = coords[386]
    inter_ocular_dist = float(np.linalg.norm(left_eye - right_eye))

    regions = {}
    for zone, indices in FACIAL_ZONES.items():
        poly = coords[indices]
        xs, ys = poly[:, 0], poly[:, 1]
        
        box_w = int(max(xs) - min(xs))
        box_h = int(max(ys) - min(ys))
        area = box_w * box_h

        regions[zone] = {
            "polygon": poly.tolist(),
            "bounding_box": {
                "x": int(min(xs)),
                "y": int(min(ys)),
                "width": box_w,
                "height": box_h
            },
            "pixel_area": area,
            "normalized_scale_ratio": round(area / (inter_ocular_dist ** 2 + 1e-6), 4)
        }

    return {
        "inter_ocular_pixel_distance": round(inter_ocular_dist, 2),
        "regions": regions
    }
