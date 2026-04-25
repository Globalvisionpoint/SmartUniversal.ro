#!/usr/bin/env python3
"""Batch image converter/compressor for Shopify assets.

Usage examples:
    python scripts/image_converter.py --input ./raw-images --output ./optimized --profile card
    python scripts/image_converter.py --input ./raw-images --output ./optimized --profile product --format webp
    python scripts/image_converter.py --input ./hero.jpg --output ./optimized --width 1200 --height 1200 --quality 78
"""

from __future__ import annotations

import argparse
import io
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow is not installed. Run: pip install -r requirements.txt")
    raise


SUPPORTED_INPUT_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
    ".avif",
}
SUPPORTED_OUTPUT_FORMATS = {"webp", "jpg", "jpeg", "png", "avif"}


@dataclass
class Profile:
    width: int
    height: int
    quality: int
    fmt: str


PROFILES = {
    "card": Profile(width=700, height=700, quality=78, fmt="webp"),
    "product": Profile(width=1200, height=1200, quality=82, fmt="webp"),
    "hero-mobile": Profile(width=1080, height=1350, quality=80, fmt="webp"),
    "hero-desktop": Profile(width=1920, height=900, quality=78, fmt="webp"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Resize + compress images in batch.")
    parser.add_argument("--input", required=True, help="Input file or directory.")
    parser.add_argument("--output", required=True, help="Output directory.")
    parser.add_argument(
        "--profile",
        choices=sorted(PROFILES.keys()),
        default="card",
        help="Preset sizing/compression profile.",
    )
    parser.add_argument("--width", type=int, help="Override output width.")
    parser.add_argument("--height", type=int, help="Override output height.")
    parser.add_argument("--quality", type=int, help="Override quality (1-100).")
    parser.add_argument(
        "--format",
        choices=sorted(SUPPORTED_OUTPUT_FORMATS),
        help="Override output format.",
    )
    parser.add_argument(
        "--fit",
        action="store_true",
        help="Force exact dimensions by center-cropping after resize.",
    )
    parser.add_argument(
        "--allow-upscale",
        action="store_true",
        help="Allow upscaling source images smaller than target size.",
    )
    return parser.parse_args()


def clamp_quality(quality: int) -> int:
    return max(1, min(100, quality))


def collect_images(input_path: Path) -> list[Path]:
    if input_path.is_file():
        return [input_path]
    if not input_path.is_dir():
        raise FileNotFoundError(f"Input path does not exist: {input_path}")

    return [
        p
        for p in input_path.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_INPUT_EXTENSIONS
    ]


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def resize_image(img: Image.Image, width: int, height: int, fit: bool, allow_upscale: bool) -> Image.Image:
    if not allow_upscale:
        width = min(width, img.width)
        height = min(height, img.height)

    if fit:
        return ImageOps.fit(img, (width, height), method=Image.Resampling.LANCZOS)

    copy = img.copy()
    copy.thumbnail((width, height), Image.Resampling.LANCZOS)
    return copy


def output_extension(fmt: str) -> str:
    return "jpg" if fmt == "jpeg" else fmt


def encode_image(img: Image.Image, fmt: str, quality: int) -> bytes:
    buffer = io.BytesIO()

    save_kwargs: dict[str, object] = {}
    normalized_fmt = fmt.upper()

    if normalized_fmt in {"JPG", "JPEG", "WEBP", "AVIF"}:
        save_kwargs["quality"] = clamp_quality(quality)

    if normalized_fmt in {"JPG", "JPEG"}:
        save_kwargs["optimize"] = True
        save_kwargs["progressive"] = True
    elif normalized_fmt == "WEBP":
        save_kwargs["method"] = 6
    elif normalized_fmt == "AVIF":
        # Lower speed gives better compression ratio.
        save_kwargs["speed"] = 6

    img.save(buffer, format=normalized_fmt, **save_kwargs)
    return buffer.getvalue()


def is_lossy_format(fmt: str) -> bool:
    return fmt.lower() in {"jpg", "jpeg", "webp", "avif"}


def adaptive_encode(img: Image.Image, fmt: str, quality: int, original_size: int) -> bytes:
    """Try to keep output smaller than input for lossy formats by lowering quality."""
    encoded = encode_image(img, fmt, quality)
    if not is_lossy_format(fmt) or len(encoded) <= original_size:
        return encoded

    for q in (quality - 8, quality - 14, quality - 20, quality - 28):
        if q < 35:
            break
        candidate = encode_image(img, fmt, q)
        if len(candidate) < len(encoded):
            encoded = candidate
        if len(candidate) <= original_size:
            return candidate

    return encoded


def normalize_mode_for_format(img: Image.Image, fmt: str) -> Image.Image:
    # JPEG and AVIF generally expect RGB; preserve alpha for PNG/WebP.
    if fmt.lower() in {"jpg", "jpeg", "avif"} and img.mode not in {"RGB", "L"}:
        return img.convert("RGB")
    return img


def build_output_path(source: Path, input_root: Path, output_root: Path, fmt: str) -> Path:
    if input_root.is_file():
        rel = Path(source.stem)
    else:
        rel = source.relative_to(input_root)
        rel = rel.with_suffix("")
    return output_root / f"{rel}.{output_extension(fmt)}"


def human_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024.0 or unit == "GB":
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} GB"


def process_images(images: Iterable[Path], args: argparse.Namespace, profile: Profile) -> int:
    output_root = Path(args.output)
    output_root.mkdir(parents=True, exist_ok=True)
    input_root = Path(args.input)

    width = args.width or profile.width
    height = args.height or profile.height
    quality = clamp_quality(args.quality or profile.quality)
    fmt = (args.format or profile.fmt).lower()

    processed = 0
    failed = 0
    total_before = 0
    total_after = 0

    for source in images:
        try:
            with Image.open(source) as original:
                oriented = ImageOps.exif_transpose(original)
                resized = resize_image(
                    oriented,
                    width=width,
                    height=height,
                    fit=args.fit,
                    allow_upscale=args.allow_upscale,
                )
                ready = normalize_mode_for_format(resized, fmt)

                before_size = source.stat().st_size
                encoded = adaptive_encode(ready, fmt, quality, before_size)
                out_path = build_output_path(source, input_root, output_root, fmt)
                ensure_parent(out_path)
                out_path.write_bytes(encoded)

                processed += 1
                total_before += before_size
                total_after += len(encoded)
                delta = (1 - (len(encoded) / before_size)) * 100 if before_size else 0
                print(
                    f"OK  {source.name} -> {out_path.name} | "
                    f"{human_size(before_size)} -> {human_size(len(encoded))} ({delta:+.1f}%)"
                )
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"ERR {source}: {exc}")

    if processed:
        total_delta = (1 - (total_after / total_before)) * 100 if total_before else 0
        print("\nSummary")
        print(f"Processed: {processed}")
        print(f"Failed:    {failed}")
        print(
            f"Total:     {human_size(total_before)} -> {human_size(total_after)} "
            f"({total_delta:+.1f}%)"
        )
    else:
        print("No images processed.")

    return 1 if failed else 0


def main() -> int:
    args = parse_args()
    profile = PROFILES[args.profile]

    if args.format and args.format.lower() not in SUPPORTED_OUTPUT_FORMATS:
        print(f"Unsupported output format: {args.format}")
        return 2

    input_path = Path(args.input)
    images = collect_images(input_path)

    if not images:
        print("No supported images found in input.")
        return 2

    return process_images(images, args, profile)


if __name__ == "__main__":
    sys.exit(main())
