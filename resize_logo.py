from PIL import Image
import os

source_path = r"C:\Users\anura\.gemini\antigravity\brain\aecd8b2e-4275-4b7e-bfa2-a34e7f3bccc4\media__1781608890822.png"
dest_192 = r"c:\sbsuite\public\icons\icon-192x192.png"
dest_512 = r"c:\sbsuite\public\icons\icon-512x512.png"

try:
    img = Image.open(source_path)
    # Resize to 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(dest_192)
    print(f"Saved {dest_192}")
    
    # Resize to 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(dest_512)
    print(f"Saved {dest_512}")
except Exception as e:
    print("Error:", e)
