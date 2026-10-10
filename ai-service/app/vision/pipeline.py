import os
import cv2
import numpy as np

class SkinVisionPipeline:
    def __init__(self):
        # Locate local XML file
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        xml_path = os.path.join(base_dir, "haarcascade_frontalface_default.xml")
        
        if not os.path.exists(xml_path):
            # Fallback to cv2 data if present
            xml_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            
        self.face_cascade = cv2.CascadeClassifier(xml_path)

    def assess_quality(self, img_bgr: np.ndarray):
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        mean_lum = float(np.mean(gray))

        is_sharp = lap_var >= 45.0
        is_lit = 30.0 <= mean_lum <= 240.0

        return {
            "sharpness_score": round(lap_var, 2),
            "is_sharp": bool(is_sharp),
            "mean_luminance": round(mean_lum, 2),
            "lighting_valid": bool(is_lit),
            "usable": bool(is_sharp and is_lit)
        }

    def extract_spatial_zones(self, face_rect, w: int, h: int):
        fx, fy, fw, fh = face_rect
        
        zones = {
            "forehead": {
                "polygon": [
                    [int(fx + fw * 0.20), int(fy + fh * 0.05)],
                    [int(fx + fw * 0.80), int(fy + fh * 0.05)],
                    [int(fx + fw * 0.80), int(fy + fh * 0.28)],
                    [int(fx + fw * 0.20), int(fy + fh * 0.28)]
                ]
            },
            "left_cheek": {
                "polygon": [
                    [int(fx + fw * 0.12), int(fy + fh * 0.45)],
                    [int(fx + fw * 0.38), int(fy + fh * 0.45)],
                    [int(fx + fw * 0.38), int(fy + fh * 0.72)],
                    [int(fx + fw * 0.12), int(fy + fh * 0.72)]
                ]
            },
            "right_cheek": {
                "polygon": [
                    [int(fx + fw * 0.62), int(fy + fh * 0.45)],
                    [int(fx + fw * 0.88), int(fy + fh * 0.45)],
                    [int(fx + fw * 0.88), int(fy + fh * 0.72)],
                    [int(fx + fw * 0.62), int(fy + fh * 0.72)]
                ]
            },
            "nose": {
                "polygon": [
                    [int(fx + fw * 0.40), int(fy + fh * 0.35)],
                    [int(fx + fw * 0.60), int(fy + fh * 0.35)],
                    [int(fx + fw * 0.60), int(fy + fh * 0.68)],
                    [int(fx + fw * 0.40), int(fy + fh * 0.68)]
                ]
            },
            "chin": {
                "polygon": [
                    [int(fx + fw * 0.32), int(fy + fh * 0.76)],
                    [int(fx + fw * 0.68), int(fy + fh * 0.76)],
                    [int(fx + fw * 0.68), int(fy + fh * 0.94)],
                    [int(fx + fw * 0.32), int(fy + fh * 0.94)]
                ]
            }
        }

        inter_eye_ref = float(fw * 0.45)
        for name, data in zones.items():
            poly = np.array(data["polygon"])
            xs, ys = poly[:, 0], poly[:, 1]
            bw = int(max(xs) - min(xs))
            bh = int(max(ys) - min(ys))
            area = bw * bh
            data["bounding_box"] = {"x": int(min(xs)), "y": int(min(ys)), "width": bw, "height": bh}
            data["pixel_area"] = area
            data["normalized_scale_ratio"] = round(area / (inter_eye_ref ** 2 + 1e-6), 4)

        return {
            "inter_ocular_pixel_distance": round(inter_eye_ref, 2),
            "face_bounding_box": {"x": int(fx), "y": int(fy), "width": int(fw), "height": int(fh)},
            "regions": zones
        }

    def estimate_skin_tone_cielab(self, img_bgr: np.ndarray, regions: dict):
        h, w, _ = img_bgr.shape
        mask = np.zeros((h, w), dtype=np.uint8)

        for cheek in ["left_cheek", "right_cheek"]:
            if cheek in regions:
                poly = np.array(regions[cheek]["polygon"], dtype=np.int32)
                cv2.fillPoly(mask, [poly], 255)

        img_lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        pixels = img_lab[mask == 255]

        if len(pixels) == 0:
            return {"status": "insufficient_pixels"}

        l_val = pixels[:, 0] * (100.0 / 255.0)
        a_val = pixels[:, 1] - 128.0
        b_val = pixels[:, 2] - 128.0

        med_l = float(np.median(l_val))
        med_a = float(np.median(a_val))
        med_b = float(np.median(b_val))

        ita = float(np.arctan2(med_l - 50.0, med_b + 1e-6) * (180.0 / np.pi))
        tone_bracket = "Light-Medium" if ita > 28 else ("Medium-Deep" if ita > 10 else "Deep")

        return {
            "cielab": {
                "L": round(med_l, 2),
                "a": round(med_a, 2),
                "b": round(med_b, 2)
            },
            "individual_typology_angle": round(ita, 2),
            "estimated_range": tone_bracket,
            "note": "Perceptual CIELAB approximation sourced from bilateral cheek regions."
        }

    def analyze_texture_and_contrast(self, img_bgr: np.ndarray, regions: dict):
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        findings = {}

        for zone_name, data in regions.items():
            mask = np.zeros((h, w), dtype=np.uint8)
            poly = np.array(data["polygon"], dtype=np.int32)
            cv2.fillPoly(mask, [poly], 255)

            pixels = gray[mask == 255]
            if len(pixels) < 50:
                findings[zone_name] = {"visible_contrast_spots": 0, "texture_variance": 0.0}
                continue

            blurred = cv2.GaussianBlur(gray, (15, 15), 0)
            diff = cv2.absdiff(gray, blurred)
            diff_zone = diff[mask == 255]

            threshold = np.mean(diff_zone) + 2.2 * np.std(diff_zone)
            spot_count = int(np.sum(diff_zone > threshold))

            findings[zone_name] = {
                "visible_contrast_spots": spot_count,
                "texture_variance": round(float(np.std(pixels)), 2)
            }

        return findings

    def process(self, img_bytes: bytes):
        arr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            return {"status": "error", "message": "Failed to decode image"}

        h, w, _ = img_bgr.shape
        quality = self.assess_quality(img_bgr)

        if not quality["usable"]:
            return {
                "status": "rejected_quality",
                "quality": quality,
                "message": "Image failed calibrated lighting or blur thresholds."
            }

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(90, 90))

        if len(faces) == 0:
            return {
                "status": "no_face_detected",
                "quality": quality,
                "message": "No face localized in frame. Please center face within lighting guide."
            }

        primary_face = max(faces, key=lambda f: f[2] * f[3])
        spatial = self.extract_spatial_zones(primary_face, w, h)
        tone = self.estimate_skin_tone_cielab(img_bgr, spatial["regions"])
        texture = self.analyze_texture_and_contrast(img_bgr, spatial["regions"])

        return {
            "status": "success",
            "frame_dimensions": {"width": w, "height": h},
            "quality": quality,
            "spatial_geometry": spatial,
            "skin_tone_estimate": tone,
            "visible_features": texture
        }
