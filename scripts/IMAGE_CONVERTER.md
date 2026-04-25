# Image Converter/Compressor

## Install

```powershell
pip install -r requirements.txt
```

## Profiles

- `card`: 700x700, quality 78, webp
- `product`: 1200x1200, quality 82, webp
- `hero-mobile`: 1080x1350, quality 80, webp
- `hero-desktop`: 1920x900, quality 78, webp

## Usage

```powershell
python scripts/image_converter.py --input "C:\images\raw" --output "C:\images\optimized" --profile card
python scripts/image_converter.py --input "C:\images\raw" --output "C:\images\optimized" --profile product
```

## Useful options

- `--format webp|avif|jpg|png`
- `--quality 1-100`
- `--fit` to crop to exact width/height
- `--allow-upscale` to enlarge small images
- `--width` and `--height` to override profile

The script prints per-file results and a total compression summary.
