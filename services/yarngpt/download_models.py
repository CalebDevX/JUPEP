"""
Downloads the WavTokenizer config and checkpoint needed by YarnGPT.
Run once during Docker build or on first startup.
"""
import os
import sys
import requests
import gdown

MODEL_DIR = os.getenv("MODEL_DIR", "/models")
os.makedirs(MODEL_DIR, exist_ok=True)

CONFIG_URL = (
    "https://huggingface.co/novateur/WavTokenizer-medium-speech-75token"
    "/resolve/main/wavtokenizer_mediumdata_frame75_3s_nq1_code4096_dim512_kmeans200_attn.yaml"
)
CONFIG_PATH = os.path.join(MODEL_DIR, "wavtokenizer.yaml")
CKPT_GDRIVE_ID = "1-ASeEkrn4HY49yZWHTASgfGFNXdVnLTt"
CKPT_PATH = os.path.join(MODEL_DIR, "wavtokenizer.ckpt")


def download_config():
    if os.path.exists(CONFIG_PATH):
        print(f"  Config already present at {CONFIG_PATH}")
        return
    print("  Downloading WavTokenizer config from HuggingFace…")
    r = requests.get(CONFIG_URL, timeout=60)
    r.raise_for_status()
    with open(CONFIG_PATH, "wb") as f:
        f.write(r.content)
    print(f"  Saved to {CONFIG_PATH}")


def download_checkpoint():
    if os.path.exists(CKPT_PATH) and os.path.getsize(CKPT_PATH) > 1_000_000:
        print(f"  Checkpoint already present at {CKPT_PATH}")
        return
    print("  Downloading WavTokenizer checkpoint from Google Drive (~600 MB)…")
    gdown.download(id=CKPT_GDRIVE_ID, output=CKPT_PATH, quiet=False)
    if not os.path.exists(CKPT_PATH) or os.path.getsize(CKPT_PATH) < 1_000_000:
        print("  ERROR: checkpoint download failed or file is too small.", file=sys.stderr)
        sys.exit(1)
    print(f"  Saved to {CKPT_PATH}")


if __name__ == "__main__":
    print(f"Model directory: {MODEL_DIR}")
    download_config()
    download_checkpoint()
    print("All models ready.")
