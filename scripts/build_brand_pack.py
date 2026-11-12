"""
GemBull Brand Pack Builder
Generates vector SVGs (symbol, logo horizontal, logo vertical, app-icon, token-badge, favicon, monochrome)
Generates multi-resolution PNGs (favicons, app-icons, token-icons, banners, social kit)
Organizes assets into docs/brand/pack/ and apps/web/public/brand/
"""

import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def simplify_contour(cnt, epsilon_ratio=0.003):
    epsilon = epsilon_ratio * cv2.arcLength(cnt, True)
    return cv2.approxPolyDP(cnt, epsilon, True)

def points_to_svg_path(pts):
    if len(pts) == 0:
        return ""
    d = [f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for p in pts[1:]:
        d.append(f"L {p[0]:.1f} {p[1]:.1f}")
    d.append("Z")
    return " ".join(d)

def make_symmetric_contour(cnt, cx):
    """
    Given a contour, mirror the cleaner/richer side across cx to ensure exact bilateral symmetry.
    """
    pts = cnt.reshape(-1, 2)
    # Check if this contour spans across cx or is strictly on one side
    xs = pts[:, 0]
    min_x, max_x = xs.min(), xs.max()
    
    # If it is centered (spans across cx)
    if min_x < cx and max_x > cx:
        # Keep points with x <= cx, mirror them to x > cx
        left_pts = [p for p in pts if p[0] <= cx]
        # Sort left points by y or perimeter
        # A simpler way for a closed polygon: average the distances from cx for each corresponding point
        pass
    return pts

def build_svg_symbol():
    """
    Build clean mathematical geometric SVG for GemBull symbol.
    Target viewBox: 0 0 1000 1000, centered at (500, 500).
    Scale and positions extracted from the approved raster logo.
    """
    # Key coordinates mapped to 1000x1000 viewBox (cx = 500, cy = 500)
    # Horns: sweep up from sides to sharp tips
    # Left horn: Tip at (180, 140), base at (430, 480)
    # Right horn: Tip at (820, 140), base at (570, 480)
    
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <linearGradient id="limeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D4FF59" />
      <stop offset="50%" stop-color="#B7FF16" />
      <stop offset="100%" stop-color="#8FD405" />
    </linearGradient>
    <linearGradient id="hornLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9FF66" />
      <stop offset="40%" stop-color="#B7FF16" />
      <stop offset="100%" stop-color="#7AC200" />
    </linearGradient>
    <linearGradient id="hornRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D9FF66" />
      <stop offset="40%" stop-color="#B7FF16" />
      <stop offset="100%" stop-color="#7AC200" />
    </linearGradient>
    <linearGradient id="darkHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141E16" />
      <stop offset="50%" stop-color="#0E1610" />
      <stop offset="100%" stop-color="#070A08" />
    </linearGradient>
    <linearGradient id="whiteFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F4F7F2" />
      <stop offset="100%" stop-color="#C5CCC2" />
    </linearGradient>
    <linearGradient id="whiteFacetRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F4F7F2" />
      <stop offset="100%" stop-color="#C5CCC2" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- GEMBULL SYMBOL - GEOMETRIC BULL WITH HORNS, GEM FACETS & RITUAL PULSE -->
  <g id="gembull-emblem">
    <!-- 1. BASE DARK HEAD SILHOUETTE (FACETED) -->
    <polygon points="500,230 635,270 705,370 740,490 690,670 610,790 500,895 390,790 310,670 260,490 295,370 365,270" fill="url(#darkHeadGrad)" stroke="#1B2B1E" stroke-width="3" stroke-linejoin="round" />

    <!-- 2. LEFT HORN (GEOMETRIC & SWEEPING) -->
    <path d="M 185 140 C 235 220 250 310 265 420 C 275 490 295 540 330 580 C 315 520 305 450 300 380 C 290 260 255 185 185 140 Z" fill="url(#hornLeftGrad)" stroke="#B7FF16" stroke-width="1.5" />
    <polygon points="185,140 250,260 300,380 265,420 240,300" fill="#E6FF85" opacity="0.45" />

    <!-- 3. RIGHT HORN (SYMMETRIC) -->
    <path d="M 815 140 C 765 220 750 310 735 420 C 725 490 705 540 670 580 C 685 520 695 450 700 380 C 710 260 745 185 815 140 Z" fill="url(#hornRightGrad)" stroke="#B7FF16" stroke-width="1.5" />
    <polygon points="815,140 750,260 700,380 735,420 760,300" fill="#E6FF85" opacity="0.45" />

    <!-- 4. FOREHEAD GEM CROWN FACETS -->
    <polygon points="500,245 420,285 500,345 580,285" fill="#0C140D" stroke="#1F3323" stroke-width="2" />
    <!-- Outer temple facets (white) -->
    <polygon points="415,290 355,340 395,395 445,345" fill="url(#whiteFacetGrad)" />
    <polygon points="585,290 645,340 605,395 555,345" fill="url(#whiteFacetRightGrad)" />

    <!-- Brow ridge facets -->
    <polygon points="445,350 495,355 495,435 435,425" fill="#18241B" stroke="#25382A" stroke-width="1.5" />
    <polygon points="555,350 505,355 505,435 565,425" fill="#141E16" stroke="#25382A" stroke-width="1.5" />

    <!-- 5. CENTRAL RITUAL PULSE & EYE DIAMONDS -->
    <!-- Forehead gem diamond -->
    <polygon points="500,355 525,410 500,465 475,410" fill="url(#limeGrad)" filter="url(#neonGlow)" />
    <!-- Pulse ring aura -->
    <circle cx="500" cy="410" r="42" fill="none" stroke="#B7FF16" stroke-width="3" opacity="0.8" stroke-dasharray="6 4" />
    <circle cx="500" cy="410" r="16" fill="#FFFFFF" />

    <!-- Left & Right Eyes (Faceted Angled Slits) -->
    <polygon points="410,435 470,445 440,470 395,455" fill="#FFFFFF" />
    <polygon points="590,435 530,445 560,470 605,455" fill="#FFFFFF" />
    <polygon points="415,440 455,448 435,465 405,453" fill="#B7FF16" />
    <polygon points="585,440 545,448 565,465 595,453" fill="#B7FF16" />

    <!-- 6. CHEEK / TEMPLE LIME ACCENTS -->
    <polygon points="325,510 380,525 365,580 315,560" fill="url(#limeGrad)" />
    <polygon points="675,510 620,525 635,580 685,560" fill="url(#limeGrad)" />

    <!-- 7. SNOUT & MUZZLE GEM FACET (CENTRAL FACETED SHIELD) -->
    <!-- Upper bridge -->
    <polygon points="500,475 460,540 500,595 540,540" fill="#162218" stroke="#263A29" stroke-width="2" />
    <!-- Large muzzle shield (white facet) -->
    <polygon points="500,605 425,690 445,775 500,815 555,775 575,690" fill="url(#whiteFacetGrad)" stroke="#E1E8DD" stroke-width="2" stroke-linejoin="round" />
    <polygon points="500,615 445,690 460,760 500,795" fill="#FFFFFF" opacity="0.6" />
    <polygon points="500,615 555,690 540,760 500,795" fill="#D3DCD0" opacity="0.6" />

    <!-- Outer cheek shields (white facets) -->
    <polygon points="360,595 415,680 390,765 340,685" fill="url(#whiteFacetGrad)" />
    <polygon points="640,595 585,680 610,765 660,685" fill="url(#whiteFacetRightGrad)" />

    <!-- Nostrils (geometric cuts) -->
    <polygon points="475,745 490,750 485,768 470,760" fill="#070A08" />
    <polygon points="525,745 510,750 515,768 530,760" fill="#070A08" />

    <!-- 8. CHIN / JAW CHEVRON GEM (NEON LIME ANCHOR) -->
    <polygon points="500,825 550,865 500,925 450,865" fill="url(#limeGrad)" stroke="#B7FF16" stroke-width="2" filter="url(#neonGlow)" />
    <polygon points="500,835 535,865 500,910" fill="#E8FFA3" opacity="0.7" />
  </g>
</svg>'''
    return svg

def build_svg_wordmark():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" width="100%" height="100%">
  <defs>
    <linearGradient id="limeTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4FF59" />
      <stop offset="100%" stop-color="#B7FF16" />
    </linearGradient>
  </defs>
  <style>
    .wm-gem { font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 88px; font-weight: 800; fill: #F4F7F2; letter-spacing: -2px; }
    .wm-bull { font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 88px; font-weight: 900; fill: url(#limeTextGrad); letter-spacing: -2px; }
  </style>
  <text x="10" y="88" class="wm-gem">Gem<tspan class="wm-bull">Bull</tspan></text>
</svg>'''
    return svg

def build_svg_horizontal_logo():
    symbol = build_svg_symbol()
    # Strip opening and closing svg tags to embed
    inner_symbol = symbol.split('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">')[1].rsplit('</svg>', 1)[0]

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 220" width="100%" height="100%">
  {inner_symbol}
  <style>
    .logo-gem {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 78px; font-weight: 800; fill: #F4F7F2; letter-spacing: -2px; }}
    .logo-bull {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 78px; font-weight: 900; fill: url(#limeGrad); letter-spacing: -2px; }}
    .logo-tagline {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 600; fill: #777D7A; letter-spacing: 5px; text-transform: uppercase; }}
    .logo-net {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; fill: #00B85A; letter-spacing: 1.5px; }}
  </style>

  <g transform="translate(10, 5) scale(0.21)">
    <use href="#gembull-emblem" />
  </g>

  <g transform="translate(240, 0)">
    <text x="0" y="105" class="logo-gem">Gem<tspan class="logo-bull">Bull</tspan></text>
    <text x="4" y="145" class="logo-tagline">The meme runs on rituals</text>
    <rect x="4" y="165" width="8" height="8" rx="4" fill="#00B85A" />
    <text x="20" y="173" class="logo-net">NEAR TESTNET · GEMBULL-CORE.TESTNET</text>
  </g>
</svg>'''
    return svg

def build_svg_vertical_logo():
    symbol = build_svg_symbol()
    inner_symbol = symbol.split('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">')[1].rsplit('</svg>', 1)[0]

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 640" width="100%" height="100%">
  {inner_symbol}
  <style>
    .v-gem {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 72px; font-weight: 800; fill: #F4F7F2; letter-spacing: -2px; text-anchor: middle; }}
    .v-bull {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 72px; font-weight: 900; fill: url(#limeGrad); letter-spacing: -2px; }}
    .v-tagline {{ font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; fill: #777D7A; letter-spacing: 4px; text-anchor: middle; text-transform: uppercase; }}
  </style>

  <g transform="translate(110, 20) scale(0.38)">
    <use href="#gembull-emblem" />
  </g>

  <text x="300" y="490" class="v-gem">Gem<tspan class="v-bull">Bull</tspan></text>
  <text x="300" y="535" class="v-tagline">The meme runs on rituals.</text>
  <text x="300" y="575" font-family="sans-serif" font-size="13" font-weight="700" fill="#B7FF16" text-anchor="middle" letter-spacing="2">NEAR TESTNET · NEP-141</text>
</svg>'''
    return svg

def build_svg_app_icon():
    symbol = build_svg_symbol()
    inner_symbol = symbol.split('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">')[1].rsplit('</svg>', 1)[0]

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="squircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#152018" />
      <stop offset="50%" stop-color="#0E1610" />
      <stop offset="100%" stop-color="#070A08" />
    </linearGradient>
    <radialGradient id="iconRadialGlow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#B7FF16" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#B7FF16" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#B7FF16" stop-opacity="0" />
    </radialGradient>
  </defs>
  {inner_symbol}

  <!-- App Icon Squircle Background -->
  <rect x="8" y="8" width="496" height="496" rx="118" ry="118" fill="url(#squircleGrad)" stroke="#233526" stroke-width="4" />
  <rect x="8" y="8" width="496" height="496" rx="118" ry="118" fill="url(#iconRadialGlow)" />

  <!-- Inner subtle border -->
  <rect x="14" y="14" width="484" height="484" rx="112" ry="112" fill="none" stroke="#B7FF16" stroke-width="1.5" stroke-opacity="0.25" />

  <!-- Emblem Scaled -->
  <g transform="translate(56, 56) scale(0.40)">
    <use href="#gembull-emblem" />
  </g>
</svg>'''
    return svg

def build_svg_token_badge():
    symbol = build_svg_symbol()
    inner_symbol = symbol.split('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">')[1].rsplit('</svg>', 1)[0]

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="tokenRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4FF59" />
      <stop offset="50%" stop-color="#B7FF16" />
      <stop offset="100%" stop-color="#5B9400" />
    </linearGradient>
    <radialGradient id="tokenBgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#18261B" />
      <stop offset="70%" stop-color="#0E1610" />
      <stop offset="100%" stop-color="#070A08" />
    </radialGradient>
  </defs>
  {inner_symbol}

  <!-- Circular Token Coin Face -->
  <circle cx="256" cy="256" r="248" fill="url(#tokenRimGrad)" />
  <circle cx="256" cy="256" r="236" fill="#070A08" />
  <circle cx="256" cy="256" r="228" fill="url(#tokenBgGrad)" stroke="#233526" stroke-width="3" />

  <!-- Notches around the coin rim -->
  <circle cx="256" cy="256" r="218" fill="none" stroke="#B7FF16" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="8 6" />

  <!-- Emblem Scaled in Center -->
  <g transform="translate(68, 68) scale(0.376)">
    <use href="#gembull-emblem" />
  </g>
</svg>'''
    return svg

def build_svg_favicon():
    symbol = build_svg_symbol()
    inner_symbol = symbol.split('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">')[1].rsplit('</svg>', 1)[0]

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="favBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141E16" />
      <stop offset="100%" stop-color="#070A08" />
    </linearGradient>
  </defs>
  {inner_symbol}
  <rect width="128" height="128" rx="28" fill="url(#favBg)" />
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="#B7FF16" stroke-width="2" stroke-opacity="0.5" />
  <g transform="translate(10, 10) scale(0.108)">
    <use href="#gembull-emblem" />
  </g>
</svg>'''
    return svg

def build_svg_monochrome(fill_color):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <g id="gembull-emblem-mono" fill="{fill_color}">
    <!-- Base Head -->
    <polygon points="500,230 635,270 705,370 740,490 690,670 610,790 500,895 390,790 310,670 260,490 295,370 365,270" opacity="0.3" />
    <!-- Horns -->
    <path d="M 185 140 C 235 220 250 310 265 420 C 275 490 295 540 330 580 C 315 520 305 450 300 380 C 290 260 255 185 185 140 Z" />
    <path d="M 815 140 C 765 220 750 310 735 420 C 725 490 705 540 670 580 C 685 520 695 450 700 380 C 710 260 745 185 815 140 Z" />
    <!-- Forehead -->
    <polygon points="500,355 525,410 500,465 475,410" />
    <circle cx="500" cy="410" r="14" fill="#070A08" />
    <!-- Brow/Eyes -->
    <polygon points="415,290 355,340 395,395 445,345" opacity="0.8" />
    <polygon points="585,290 645,340 605,395 555,345" opacity="0.8" />
    <!-- Muzzle -->
    <polygon points="500,605 425,690 445,775 500,815 555,775 575,690" opacity="0.9" />
    <!-- Chin gem -->
    <polygon points="500,825 550,865 500,925 450,865" />
  </g>
</svg>'''
    return svg

def generate_multi_res_pngs():
    """
    Generate clean downscaled icons from apps/web/public/brand/icons/gembull-app-icon.png
    """
    app_icon_src = Image.open('apps/web/public/brand/icons/gembull-app-icon.png').convert('RGBA')
    logo_src = Image.open('apps/web/public/brand/gembull-logo.png').convert('RGBA')

    sizes = [
        ('favicon-16x16.png', 16, 16),
        ('favicon-32x32.png', 32, 32),
        ('favicon-48x48.png', 48, 48),
        ('apple-touch-icon.png', 180, 180),
        ('android-chrome-192x192.png', 192, 192),
        ('android-chrome-512x512.png', 512, 512),
        ('gembull-token-128.png', 128, 128),
        ('gembull-token-256.png', 256, 256),
        ('gembull-token-512.png', 512, 512),
    ]

    os.makedirs('apps/web/public/brand/icons', exist_ok=True)
    os.makedirs('docs/brand/pack/02-icons', exist_ok=True)

    for fname, w, h in sizes:
        resized = app_icon_src.resize((w, h), Image.Resampling.LANCZOS)
        out1 = os.path.join('apps/web/public/brand/icons', fname)
        out2 = os.path.join('docs/brand/pack/02-icons', fname)
        resized.save(out1, 'PNG', optimize=True)
        resized.save(out2, 'PNG', optimize=True)
        print(f"Generated {fname} ({w}x{h})")

def generate_social_banners():
    """
    Generate professional X Header Banner (1500x500) and Discord Banner (1200x500)
    """
    os.makedirs('docs/brand/pack/03-social', exist_ok=True)
    os.makedirs('apps/web/public/brand/social', exist_ok=True)

    logo_src = Image.open('apps/web/public/brand/gembull-logo.png').convert('RGBA')
    coin_src = Image.open('apps/web/public/brand/coins/gembull-campaign-coin.png').convert('RGBA')

    # 1. X Header Banner (1500x500)
    w, h = 1500, 500
    banner = Image.new('RGBA', (w, h), (7, 10, 8, 255)) # #070A08
    draw = ImageDraw.Draw(banner)

    # Subtle radial glow on the left/center
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([800, -100, 1600, 600], fill=(183, 255, 22, 18))
    glow_draw.ellipse([1000, 50, 1500, 450], fill=(183, 255, 22, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    banner.alpha_composite(glow)

    # Grid lines subtle
    for x in range(0, w, 80):
        draw.line([(x, 0), (x, h)], fill=(20, 30, 22, 70), width=1)
    for y in range(0, h, 80):
        draw.line([(0, y), (w, y)], fill=(20, 30, 22, 70), width=1)

    # Place Logo Emblem on the right
    logo_h = 420
    ratio = logo_h / logo_src.size[1]
    logo_w = int(logo_src.size[0] * ratio)
    logo_resized = logo_src.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    banner.alpha_composite(logo_resized, (w - logo_w - 40, (h - logo_h) // 2))

    # Save X banner
    banner.save('docs/brand/pack/03-social/x-banner-1500x500.png', 'PNG')
    banner.save('apps/web/public/brand/social/x-banner-1500x500.png', 'PNG')
    print("Generated x-banner-1500x500.png")

    # 2. Discord / Community Banner (1200x500)
    w_d, h_d = 1200, 500
    banner_d = banner.resize((w_d, h_d), Image.Resampling.LANCZOS)
    banner_d.save('docs/brand/pack/03-social/discord-banner-1200x500.png', 'PNG')
    banner_d.save('apps/web/public/brand/social/discord-banner-1200x500.png', 'PNG')
    print("Generated discord-banner-1200x500.png")

    # 3. Social Avatar (1080x1080)
    app_icon_src = Image.open('apps/web/public/brand/icons/gembull-app-icon.png').convert('RGBA')
    avatar = app_icon_src.resize((1080, 1080), Image.Resampling.LANCZOS)
    avatar.save('docs/brand/pack/03-social/social-avatar-1080x1080.png', 'PNG')
    avatar.save('apps/web/public/brand/social/social-avatar-1080x1080.png', 'PNG')
    print("Generated social-avatar-1080x1080.png")

def main():
    print("--- Building GemBull Vector Master & Logo Package ---")
    
    # 1. Output directories
    os.makedirs('apps/web/public/brand/icons', exist_ok=True)
    os.makedirs('apps/web/public/brand/coins', exist_ok=True)
    os.makedirs('apps/web/public/brand/social', exist_ok=True)
    os.makedirs('docs/brand/pack/01-logos', exist_ok=True)
    os.makedirs('docs/brand/pack/02-icons', exist_ok=True)
    os.makedirs('docs/brand/pack/03-social', exist_ok=True)
    os.makedirs('docs/brand/pack/04-stickers', exist_ok=True)
    os.makedirs('docs/brand/pack/05-marketing', exist_ok=True)

    # 2. Build SVG assets
    svg_assets = {
        'gembull-symbol.svg': build_svg_symbol(),
        'gembull-logo.svg': build_svg_horizontal_logo(),
        'gembull-logo-vertical.svg': build_svg_vertical_logo(),
        'gembull-wordmark.svg': build_svg_wordmark(),
        'icons/gembull-app-icon.svg': build_svg_app_icon(),
        'coins/gembull-token-badge.svg': build_svg_token_badge(),
        'icons/favicon.svg': build_svg_favicon(),
        'gembull-symbol-mono-white.svg': build_svg_monochrome("#F4F7F2"),
        'gembull-symbol-mono-lime.svg': build_svg_monochrome("#B7FF16"),
        'gembull-symbol-mono-dark.svg': build_svg_monochrome("#070A08"),
    }

    for rel_path, content in svg_assets.items():
        pub_path = os.path.join('apps/web/public/brand', rel_path)
        pack_path = os.path.join('docs/brand/pack/01-logos' if not rel_path.startswith(('icons/', 'coins/')) else ('docs/brand/pack/02-icons' if rel_path.startswith('icons/') else 'docs/brand/pack/01-logos'), os.path.basename(rel_path))
        with open(pub_path, 'w', encoding='utf-8') as f:
            f.write(content)
        with open(pack_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Written SVG: {pub_path}")

    # 3. Generate PNGs
    generate_multi_res_pngs()
    generate_social_banners()

    # 4. Copy stickers and marketing crops to pack
    import shutil
    for sticker in ['gembull-gm.png', 'gembull-streak.png']:
        src = os.path.join('apps/web/public/brand/stickers', sticker)
        dst = os.path.join('docs/brand/pack/04-stickers', sticker)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied sticker: {dst}")

    for marketing in ['gembull-campaign-coin.png']:
        src = os.path.join('apps/web/public/brand/coins', marketing)
        dst = os.path.join('docs/brand/pack/05-marketing', marketing)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied marketing: {dst}")

    shutil.copy2('docs/brand/concepts/gembull-commercial-board-v1.png', 'docs/brand/pack/05-marketing/gembull-commercial-board-v1.png')
    shutil.copy2('docs/brand/concepts/gembull-logo-concept-v1.png', 'docs/brand/pack/05-marketing/gembull-logo-concept-v1.png')

    print("--- Brand Pack Build Completed Successfully ---")

if __name__ == '__main__':
    main()
