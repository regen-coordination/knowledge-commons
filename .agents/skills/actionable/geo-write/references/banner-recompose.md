# Image banner recomposition (2364 × 640)

> Requires Python with Pillow and numpy. Optional FAL_KEY or REPLICATE_API_TOKEN for AI
> outpainting (best fill quality on busy/photographic covers). Uses the present_files tool and
> the claude.ai / Cowork paths /mnt/user-data/uploads, /mnt/user-data/outputs, /home/claude.

Produces a high-quality **2364 × 640 px banner** from any uploaded image by intelligently
recomposing — not mechanically resizing. The output should look intentional and designed.
It **picks the right strategy per image** and always finishes the focal subject with an
unsharp pass so it stays crisp.


## Contents

- [Step-by-step workflow](#step-by-step-workflow) · [Quality constraints](#quality-constraints-non-negotiable) · [Error handling](#error-handling) · [Reference sections](#reference-sections)
- **Strategies** — auto-selector, solid edge extend, blurred backdrop, smart crop, outpainting, verify output, low-res guard
- **API endpoints** — fal.ai, Replicate, fallback priority
- **QA check** — full QA runner, corrections, thresholds

## Step-by-step workflow

### Step 1 — Find the image
Check `/mnt/user-data/uploads/` for the uploaded image. If none, ask the user to upload one.
Supported: JPEG, PNG, WEBP, BMP, TIFF.

### Step 2 — Analyze with Vision
Examine the image and report (5–8 lines): main subject(s), focal point, aspect ratio (w÷h vs the
target 3.69:1), background type (solid / gradient / scene / transparent), dominant colours, mood,
and **all text regions** (titles, author names, logos) — flag these as protected zones.

### Step 3 — Check API keys + source resolution
```bash
echo "FAL_KEY=${FAL_KEY:-NOT_SET}"; echo "REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN:-NOT_SET}"
```
Then run `warn_if_lowres()` from `references/strategies.md`. If the source is under ~500px tall,
tell the user the centred subject will be upscaled and may look soft, and suggest a larger source
(or AI-upscaling it first) before proceeding.

### Step 4 — Auto-select the strategy
Use `choose_strategy(img, has_api)` from `references/strategies.md`. It returns one of:

| Strategy | When | Fill |
|---|---|---|
| `smart_crop`      | source already wide (~≥3:1) | none — reframe to the most salient region |
| `outpaint`        | FAL_KEY or REPLICATE_API_TOKEN set | AI-generated, matches the scene (best) |
| `solid_extend` (A)| no API + **solid** side edges (`edge_std` < 18) | the cover's edge colour, feathered |
| `blurred_backdrop` (B)| no API + **busy/photographic** edges | full-bleed blurred copy of the cover |

State the chosen strategy and the `edge_std` value in one sentence. Honor an override
("force backdrop", "force solid", "force outpaint"). For **text-bearing covers**, never crop into
text and never let outpaint fill begin inside a text box (keep ≥40px margin).

### Step 5 — Install deps + execute
```bash
pip install Pillow numpy --break-system-packages -q
# only if outpainting:
pip install fal-client --break-system-packages -q   # or: pip install replicate ...
```
Write Python to `/home/claude/`, import the chosen function from `references/strategies.md`, run it.
Each strategy returns `(x_offset, scaled_w)` — keep these for QA.

### Step 6 — Verify dimensions
Open with Pillow and assert `img.size == (2364, 640)`; correct + re-run if not.

### Step 6a — QA (mandatory, strategy-aware)
Run `run_qa(output, source, x_offset, scaled_w, mode=...)` from `references/qa_check.md`.
**Pass `mode="whole"` for `blurred_backdrop`, `mode="edge"` for `solid_extend` / `outpaint`** (this
is what makes the colour + brightness checks consistent — see the note in that file).
- **All pass** → print a one-line green light, go to Step 7.
- **Any fail** → print the report + a plain-language description, ask the user *"apply automatic
  corrections and regenerate, or deliver as-is?"*, wait, then `apply_fixes(...)` and re-run QA.

### Step 7 — Save + present
Save to `/mnt/user-data/outputs/banner_<original_filename>.png` and call `present_files`.

### Step 8 — Summary
Report: strategy chosen (and why), QA result, whether text was preserved, confirmed dimensions,
and a low-res note if it applied.


## Quality constraints (non-negotiable)
- Main subject fully visible, never distorted (no non-uniform scaling).
- All source text legible and unobscured in the output.
- No hard seams or colour discontinuities at the fill boundaries.
- Output exactly 2364 × 640 px (verified programmatically).
- Focal subject sharp (unsharp finishing pass applied; never blurred).


## Error handling

| Error | Action |
|---|---|
| No image in uploads | Ask the user to upload |
| Unreadable format | Suggest re-saving as PNG/JPEG |
| Source < 500px tall | Warn (soft result); offer to proceed or get a larger source |
| API timeout / error | Fall back to `solid_extend` or `blurred_backdrop`, inform the user |
| Wrong output dimensions | Re-run with explicit resize + crop |


## Reference sections

The former skill's reference files are bundled below in this single file:
- **Strategies** — auto-selector + all strategy code (+ sharpening, low-res guard)
- **QA check** — strategy-aware QA pipeline + corrections
- **API endpoints** — fal.ai / Replicate endpoint + auth reference

## Strategies


Full Python code for each recomposition strategy + the auto-selector. Read the section for your
chosen strategy. All output is exactly 2364 × 640 px. The focal cover always gets an unsharp
finishing pass, so place it via the helpers here (do not paste a raw resize).

## Contents
- Auto-selector (`choose_strategy`, `edge_std`)
- Strategy A — Solid edge extend
- Strategy B — Blurred backdrop
- Smart crop (wide sources)
- Outpainting (fal.ai / Replicate)
- Verify output + low-resolution guard

```python
from PIL import Image, ImageFilter
import numpy as np

TARGET_W, TARGET_H = 2364, 640

def sharp_cover(img, sw):
    """Scale the source to the banner height and apply an unsharp finishing pass."""
    return np.array(
        img.resize((sw, TARGET_H), Image.LANCZOS)
           .filter(ImageFilter.UnsharpMask(radius=2, percent=160, threshold=2)),
        dtype=float)
```

---

## Auto-selector — which strategy to use

```python
def edge_std(img, frac=0.06):
    """Mean per-channel std of the LEFT and RIGHT edge strips (what we extend into).
    Low (~< 18) => near-solid side background => solid-extend (A) looks seamless.
    High => busy/photographic edges => blurred backdrop (B) looks better."""
    a = np.array(img.convert("RGB"), dtype=float)
    h, w, _ = a.shape
    bx = max(2, int(w * frac))
    left  = a[:, :bx].reshape(-1, 3)
    right = a[:, -bx:].reshape(-1, 3)
    return max(float(left.std(axis=0).mean()), float(right.std(axis=0).mean()))

SOLID_THRESHOLD = 18  # edge_std below this => treat the background as solid

def choose_strategy(img, has_api):
    """Return one of: 'outpaint' | 'smart_crop' | 'solid_extend' | 'backdrop'."""
    ow, oh = img.size
    ratio = ow / oh
    if ratio >= 3.0:
        return "smart_crop"          # already wide -> reframe, no fill needed
    if has_api:
        return "outpaint"            # best fill quality when an API key is available
    if edge_std(img) < SOLID_THRESHOLD:
        return "solid_extend"        # A: solid side background
    return "blurred_backdrop"        # B: busy/photographic
```

Tell the user the chosen strategy and the `edge_std` value in one line, and honor an override
("force solid", "force backdrop", "force outpaint").

---

## Strategy A — Solid edge extend (no API; solid-background covers)

Fills the sides with the cover's own edge colour and feathers the join. Best for covers whose
left/right edges are a flat colour (the fill reads as a seamless extension). Text is never cropped.

```python
def solid_extend(input_path, output_path, feather=44):
    img = Image.open(input_path).convert("RGB")
    ow, oh = img.size
    sw = int(ow * (TARGET_H / oh))
    x = (TARGET_W - sw) // 2
    cover = sharp_cover(img, sw)
    lc = cover[:, :5, :].mean(axis=(0, 1))
    rc = cover[:, -5:, :].mean(axis=(0, 1))
    c = np.zeros((TARGET_H, TARGET_W, 3), dtype=float)
    c[:, :x, :] = lc
    c[:, x + sw:, :] = rc
    c[:, x:x + sw, :] = cover
    for i in range(feather):
        a = i / feather
        if 0 <= x + i < TARGET_W:
            c[:, x + i, :] = lc * (1 - a) + cover[:, i, :] * a
        xr = x + sw - feather + i
        if 0 <= xr < TARGET_W:
            a2 = 1 - i / feather
            c[:, xr, :] = rc * (1 - a2) + cover[:, sw - feather + i, :] * a2
    Image.fromarray(np.clip(c, 0, 255).astype("uint8")).save(output_path)
    return x, sw   # pass to QA as x_offset, scaled_w
```

---

## Strategy B — Blurred backdrop (no API; busy / photographic covers)

Places a full-bleed, heavily-blurred copy of the cover behind the sharp cover. The backdrop uses
the cover's whole palette, so it reads as designed (not flat bars). Best for photos, paintings,
and busy covers.

```python
def blurred_backdrop(input_path, output_path, feather=36):
    img = Image.open(input_path).convert("RGB")
    ow, oh = img.size
    sw = int(ow * (TARGET_H / oh))
    x = (TARGET_W - sw) // 2
    cover = sharp_cover(img, sw)
    s2 = max(TARGET_W / ow, TARGET_H / oh)
    bw, bh = int(ow * s2), int(oh * s2)
    bg = img.resize((bw, bh), Image.LANCZOS)
    l, t = (bw - TARGET_W) // 2, (bh - TARGET_H) // 2
    bga = np.array(
        bg.crop((l, t, l + TARGET_W, t + TARGET_H)).filter(ImageFilter.GaussianBlur(radius=60)),
        dtype=float)
    c = bga.copy()
    c[:, x:x + sw, :] = cover
    for i in range(feather):
        a = i / feather
        if 0 <= x + i < TARGET_W:
            c[:, x + i, :] = bga[:, x + i, :] * (1 - a) + cover[:, i, :] * a
        xr = x + sw - feather + i
        if 0 <= xr < TARGET_W:
            a2 = 1 - i / feather
            c[:, xr, :] = bga[:, xr, :] * (1 - a2) + cover[:, sw - feather + i, :] * a2
    Image.fromarray(np.clip(c, 0, 255).astype("uint8")).save(output_path)
    return x, sw
```

---

## Strategy: Smart crop (wide / landscape sources)

For sources already wider than ~3:1. Scale to height 640 then slide a 2364-wide window to the
highest-entropy region. No fill needed.

```python
def smart_crop(input_path, output_path):
    img = Image.open(input_path).convert("RGB")
    ow, oh = img.size
    sw = int(ow * (TARGET_H / oh))
    img_r = img.resize((sw, TARGET_H), Image.LANCZOS)
    if sw <= TARGET_W:                      # not actually wide enough -> backdrop instead
        return blurred_backdrop(input_path, output_path)
    gray = np.array(img_r.convert("L"))
    def entropy(x):
        hist, _ = np.histogram(gray[:, x:x + TARGET_W], bins=256, range=(0, 256))
        p = hist / hist.sum(); p = p[p > 0]
        return -np.sum(p * np.log2(p))
    step = max(1, (sw - TARGET_W) // 20)
    best_x = max(range(0, sw - TARGET_W + 1, step), key=entropy)
    img_r.crop((best_x, 0, best_x + TARGET_W, TARGET_H)).save(output_path)
    return 0, TARGET_W                      # full-frame, no fill zones
```

---

## Strategy: Outpainting (when FAL_KEY or REPLICATE_API_TOKEN is set — best quality)

Place the sharp cover centred on the canvas, mask the empty sides, and let the model fill them
coherently from the cover's scene. See `references/api_endpoints.md` for auth + endpoint details.

```python
def outpaint(input_path, output_path, scene_description="", provider="fal"):
    import base64, io, os, urllib.request
    from PIL import ImageDraw
    img = Image.open(input_path).convert("RGB")
    ow, oh = img.size
    sw = int(ow * (TARGET_H / oh))
    x = (TARGET_W - sw) // 2
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), (0, 0, 0))
    canvas.paste(img.resize((sw, TARGET_H), Image.LANCZOS), (x, 0))
    mask = Image.new("L", (TARGET_W, TARGET_H), 255)
    ImageDraw.Draw(mask).rectangle([x, 0, x + sw, TARGET_H], fill=0)   # keep cover, fill sides
    def b64(im):
        buf = io.BytesIO(); im.save(buf, "PNG"); return base64.b64encode(buf.getvalue()).decode()
    prompt = (f"Extend this image naturally. {scene_description} Seamlessly match the original's "
              "colour palette, lighting and mood.")
    if provider == "fal":
        import fal_client
        res = fal_client.submit("fal-ai/bria/eraser/outpainting", arguments={
            "image_url": f"data:image/png;base64,{b64(canvas)}",
            "mask_url": f"data:image/png;base64,{b64(mask)}", "prompt": prompt}).get()
        urllib.request.urlretrieve(res["image"]["url"], output_path)
    else:
        import replicate
        out = replicate.run("stability-ai/stable-diffusion-inpainting", input={
            "prompt": prompt, "image": f"data:image/png;base64,{b64(canvas)}",
            "mask": f"data:image/png;base64,{b64(mask)}",
            "num_inference_steps": 50, "guidance_scale": 7.5})
        urllib.request.urlretrieve(out[0] if isinstance(out, list) else out, output_path)
    o = Image.open(output_path)
    if o.size != (TARGET_W, TARGET_H):
        o.resize((TARGET_W, TARGET_H), Image.LANCZOS).save(output_path)
    return x, sw
```

---

## Verify output (always run after saving)

```python
img = Image.open(output_path)
assert img.size == (2364, 640), f"Wrong dimensions: {img.size}"
print(f"✓ Verified: {img.size}")
```

## Low-resolution guard

```python
def warn_if_lowres(input_path, min_h=500):
    h = Image.open(input_path).size[1]
    if h < min_h:
        print(f"⚠️ Source is only {h}px tall — the centred cover will be upscaled and may look soft. "
              "For a crisp result, use a source ≥ 500px tall (or AI-upscale it first).")
        return True
    return False
```

## API endpoints


## fal.ai

**Auth**: Set `FAL_KEY` environment variable. Install: `pip install fal-client --break-system-packages`

```python
import fal_client
os.environ["FAL_KEY"] = "your-key"  # or export FAL_KEY=... in shell
```

| Use case               | Endpoint                              | Key input params                                           |
|------------------------|---------------------------------------|------------------------------------------------------------|
| Outpainting            | `fal-ai/bria/eraser/outpainting`      | `image_url`, `mask_url`, `prompt`                         |
| Image-to-image extend  | `fal-ai/flux/dev/image-to-image`      | `image_url`, `prompt`, `strength` (0.3–0.6 for extension) |
| Background replacement | `fal-ai/bria/background/replace`      | `image_url`, `prompt` (describes new background)          |

**Pattern:**
```python
result = fal_client.submit("fal-ai/bria/eraser/outpainting", arguments={...}).get()
image_url = result["image"]["url"]
```

**Notes:**
- Images must be passed as `data:image/png;base64,...` URLs or public HTTPS URLs
- Mask: white (255) = fill this area, black (0) = keep original
- For outpainting: keep the original content in the base image, mask only the extension areas
- Response time: ~10–30 seconds typical

---

## Replicate

**Auth**: Set `REPLICATE_API_TOKEN` environment variable. Install: `pip install replicate --break-system-packages`

| Use case               | Model slug                                    | Key input params                                     |
|------------------------|-----------------------------------------------|------------------------------------------------------|
| Outpainting/inpainting | `stability-ai/stable-diffusion-inpainting`    | `prompt`, `image`, `mask`, `num_inference_steps`     |
| Background removal     | `cjwbw/rembg`                                 | `image` (returns image with transparent background)  |

**Pattern:**
```python
import replicate
output = replicate.run("stability-ai/stable-diffusion-inpainting", input={
    "prompt": "...",
    "image": "data:image/png;base64,...",
    "mask": "data:image/png;base64,...",
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
})
result_url = output[0]
```

**Notes:**
- Mask convention is the same as fal.ai (white = fill)
- For best results: guidance_scale 7–10, steps 40–60
- May need to resize output to exactly 2364×640 after generation

---

## Fallback priority

1. `FAL_KEY` set → use fal.ai (`fal-ai/bria/eraser/outpainting`)
2. `REPLICATE_API_TOKEN` set → use Replicate (`stability-ai/stable-diffusion-inpainting`)
3. Neither → use Pillow-only strategy from `strategies.md` Strategy D

Never tell the user "outpainting is not available" — always have a fallback ready.

## QA check


Run after every recomposition, before delivering. Five checks compare the output against the
source. **Pass `mode` to match the strategy** — this is the fix for the old contradiction where
`color_match` and `brightness` referenced different things and could never both pass:

| Strategy | `mode` | Fill is compared against |
|---|---|---|
| `solid_extend` (A), `outpaint` | `"edge"`  | the cover's **edge** colours/brightness (the fill continues the edge) |
| `blurred_backdrop` (B)         | `"whole"` | the **whole cover** (the backdrop is derived from the whole image) |
| `smart_crop`                   | —         | no fill zones; checks are skipped/auto-pass |

## Contents
- Full QA runner (`run_qa`, strategy-aware)
- Corrections (`fix_seam`, `fix_brightness`, `apply_fixes`)
- Thresholds

---

## Full QA runner

```python
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

TARGET_W, TARGET_H = 2364, 640

def run_qa(output_path, source_path, x_offset, scaled_w, mode="edge"):
    banner = Image.open(output_path).convert("RGB")
    source = Image.open(source_path).convert("RGB")
    banner_arr = np.array(banner, dtype=float)
    src_scale = TARGET_H / source.size[1]
    src_w = int(source.size[0] * src_scale)
    source_scaled = source.resize((src_w, TARGET_H), Image.LANCZOS)
    src_arr = np.array(source_scaled, dtype=float)
    right_edge = x_offset + scaled_w
    fill_zones = []
    if x_offset > 10: fill_zones.append((0, x_offset))
    if right_edge < TARGET_W - 10: fill_zones.append((right_edge, TARGET_W))
    results = {}

    def mean_color(arr, x1, x2): return arr[:, x1:x2, :].mean(axis=(0, 1))
    def lum(arr, x1, x2):
        r = arr[:, x1:x2, :]
        return (0.299*r[:,:,0] + 0.587*r[:,:,1] + 0.114*r[:,:,2])

    # ── 1. Seam ───────────────────────────────────────────────
    g = np.array(banner.convert("L"), dtype=float)
    seam_xs = ([x_offset] if x_offset > 2 else []) + ([right_edge] if right_edge < TARGET_W-2 else [])
    max_seam = max([np.abs(g[:, max(0,sx-3):sx].mean(1) - g[:, sx:min(TARGET_W,sx+3)].mean(1)).mean()
                    for sx in seam_xs], default=0.0)
    results["seam"] = {"passed": max_seam < 40, "value": round(float(max_seam),2), "threshold": 40,
        "message": (f"✓ No visible seam ({max_seam:.1f})" if max_seam < 40
                    else f"✗ Hard seam (delta={max_seam:.1f} > 40)")}

    # ── 2. Color match — only meaningful when foreign fill is added (edge / outpaint).
    #     For a blurred backdrop the fill IS the cover (intentionally varied), so it's n/a.
    if mode == "whole":
        results["color_match"] = {"passed": True, "value": 0.0, "threshold": 25,
            "message": "✓ Colour n/a (backdrop is derived from the cover)"}
    else:
        ref_left  = mean_color(src_arr, 0, min(10, src_w))
        ref_right = mean_color(src_arr, max(0, src_w-10), src_w)
        de = 0.0
        if x_offset > 0:
            de = max(de, np.sqrt(((mean_color(banner_arr, 0, x_offset) - ref_left)**2).sum()))
        if right_edge < TARGET_W:
            de = max(de, np.sqrt(((mean_color(banner_arr, right_edge, TARGET_W) - ref_right)**2).sum()))
        results["color_match"] = {"passed": de < 25, "value": round(float(de),2), "threshold": 25,
            "message": (f"✓ Fill colour matches ({de:.1f})" if de < 25 else f"✗ Colour mismatch (ΔE={de:.1f} > 25)")}

    # ── 3. Artifacts / noise ──────────────────────────────────
    def lvar(arr, x1, x2):
        reg = arr[:, x1:x2, :]; h,w,_ = reg.shape
        if w < 8 or h < 8: return reg.std()**2
        bh, bw = h//8, w//8
        return np.mean([reg[by*bh:(by+1)*bh, bx*bw:(bx+1)*bw].std()**2 for by in range(8) for bx in range(8)])
    src_var = lvar(src_arr, 0, src_w) + 1e-6
    fill_var = max([lvar(banner_arr, z[0], z[1]) for z in fill_zones], default=0)
    ratio = fill_var / src_var if fill_zones else 0
    results["artifacts"] = {"passed": ratio < 2.5, "value": round(float(ratio),2), "threshold": 2.5,
        "message": (f"✓ Fill clean ({ratio:.2f}×)" if ratio < 2.5 else f"✗ Artifacts ({ratio:.2f}× > 2.5)")}

    # ── 4. Brightness — like colour, n/a for a blurred backdrop (fill is the cover) ──
    if mode == "whole":
        results["brightness"] = {"passed": True, "value": 0.0, "threshold": 15,
            "message": "✓ Brightness n/a (backdrop is derived from the cover)"}
    else:  # edge: reference the cover's edge strips (consistent with color_match)
        el = np.concatenate([lum(src_arr, 0, min(10, src_w)).ravel(),
                             lum(src_arr, max(0, src_w-10), src_w).ravel()])
        ref_lum_mean, ref_lum_std = el.mean(), el.std()
        max_ld = 0
        for z in fill_zones:
            fl = lum(banner_arr, z[0], z[1])
            max_ld = max(max_ld, abs(fl.mean() - ref_lum_mean), abs(fl.std() - ref_lum_std))
        results["brightness"] = {"passed": max_ld < 15 or not fill_zones, "value": round(float(max_ld),2),
            "threshold": 15, "message": (f"✓ Brightness consistent ({max_ld:.1f})" if max_ld < 15 or not fill_zones
                        else f"✗ Brightness mismatch ({max_ld:.1f} > 15)")}

    # ── 5. Sharpness (subject vs source) ──────────────────────
    def sharp(pil, x1, x2):
        return np.array(pil.crop((x1,0,x2,TARGET_H)).convert("L").filter(ImageFilter.FIND_EDGES), dtype=float).var()
    ssrc = sharp(source_scaled, 0, src_w) + 1e-6
    sratio = sharp(banner, x_offset, min(x_offset+scaled_w, TARGET_W)) / ssrc
    results["sharpness"] = {"passed": sratio >= 0.80, "value": round(float(sratio),3), "threshold": 0.80,
        "message": (f"✓ Sharpness retained ({sratio*100:.0f}%)" if sratio >= 0.80
                    else f"✗ Subject blurred ({sratio*100:.0f}% < 80%)")}
    return results


def print_qa_report(results):
    passed = all(r["passed"] for r in results.values())
    print("\n── QA Report ─────────────────────────────────")
    for r in results.values(): print(f"  {r['message']}")
    print("──────────────────────────────────────────────")
    if passed: print("  ✅ All checks passed.\n")
    else: print(f"  ⚠️  Issues: {', '.join(k for k,r in results.items() if not r['passed'])}\n")
    return passed
```

---

## Corrections

Apply only the fixes for checks that failed, then re-run QA. With the strategy-aware `mode`, the
A and B strategies normally pass without corrections; these remain as a safety net.

```python
def fix_seam(banner_path, x_offset, scaled_w, blend=80):
    b = np.array(Image.open(banner_path).convert("RGB"), dtype=float)
    for seam, d in [(x_offset, "L"), (x_offset+scaled_w, "R")]:
        for i in range(blend):
            t = i/blend
            x = (seam-blend+i) if d=="L" else (seam+i)
            if 0 <= x < TARGET_W:
                edge = b[:, seam if d=="L" else min(seam, TARGET_W-1), :]
                b[:, x, :] = (b[:, x, :]*(1-t) + edge*t) if d=="L" else (edge*(1-t) + b[:, x, :]*t)
    Image.fromarray(np.clip(b,0,255).astype("uint8")).save(banner_path)

def fix_brightness(banner_path, source_path, x_offset, scaled_w, mode="edge"):
    banner = Image.open(banner_path).convert("RGB")
    src = Image.open(source_path).convert("RGB")
    ssw = int(src.size[0]*(TARGET_H/src.size[1]))
    ss = np.array(src.resize((ssw, TARGET_H), Image.LANCZOS), dtype=float)
    def L(a, x1, x2): r=a[:,x1:x2,:]; return (0.299*r[:,:,0]+0.587*r[:,:,1]+0.114*r[:,:,2]).mean()
    ref = L(ss, 0, ssw) if mode=="whole" else (L(ss,0,min(10,ssw))+L(ss,max(0,ssw-10),ssw))/2
    re = x_offset+scaled_w
    for x1, x2 in [(0, x_offset), (re, TARGET_W)]:
        if x2-x1 < 5: continue
        crop = banner.crop((x1,0,x2,TARGET_H))
        fl = np.array(crop, dtype=float); fl_l = (0.299*fl[:,:,0]+0.587*fl[:,:,1]+0.114*fl[:,:,2]).mean()
        if fl_l < 1: continue
        f = max(0.6, min(1.6, ref/fl_l))
        banner.paste(ImageEnhance.Brightness(crop).enhance(f), (x1, 0))
    banner.save(banner_path)

def apply_fixes(banner_path, source_path, x_offset, scaled_w, failed, mode="edge"):
    if "seam" in failed: fix_seam(banner_path, x_offset, scaled_w)
    if "brightness" in failed: fix_brightness(banner_path, source_path, x_offset, scaled_w, mode)
    print("Fixes applied. Re-running QA...")
```

---

## Thresholds

| Check | Pass if | Reference (edge mode / whole mode) |
|---|---|---|
| Seam | max delta < 40 | join boundaries |
| Color match | ΔE < 25 | cover edge / whole cover |
| Artifacts | ratio < 2.5× | source content |
| Brightness | delta < 15 | cover edge / whole cover |
| Sharpness | ≥ 0.80 | subject vs source |
