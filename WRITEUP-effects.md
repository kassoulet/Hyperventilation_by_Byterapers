# HYPERVENTILATION (Byterapers, Remedy '98) - effects, engine, objects

Code: Mr.Sex, Gurdan. Visuals: Mistral, Mike, Jate. Music: Yolk & Legend (`Hypermmx.xm`, 52 orders, 189.5 s). A true-colour software-3D demo: Watcom C++ 32-bit
under PMODE/W, MIDAS 0.7 b1 for sound, VESA 2.0 linear framebuffer, **320x240 at 32/24/16/15 bpp** (menu at start; "S" = secret mode is not found
in normal VESA). The picture is a **320x200 viewport centred in the 320x240 screen (20-pixel black bars)**; 320x240 has square pixels, so the
correct display aspect is 4:3 (the port shows the 320x240 canvas at 4:3, never letterboxed square-pixel 16:10).

## 1. Direction: a script driven by the music
The demo is one table of 28-byte records at 0x104aa0 `{order,row,type,func,a,b,c}` (168 records), fired when MIDAS reports `order*64+row`
(see WRITEUP-asm.md, snippet 6). Animation time is the 70 Hz timer (`1 tick = 1 3DS keyframe`). We rebuilt the timeline in `web/assets/script.json`
(order/row converted with the XM tempo model `tools/xmtime.py`) and replay it exactly: 43 sprites (0x105dfc: image, blend alpha, flags, position), fades,
flashes, scene switches. Original scene-switch times (seconds):

| time | event | scene (render callback) |
|---|---|---|
| 0.0 | start | **space** - `space2.3ds`, Orion nebula dome, arches, ABBA photos fading over (cb 0x20f68) |
| 30.0 | red flash | **lava tunnel** (cb 0x23528, init 0x2329c; a distortion grid with three moving 1/r attractors, see WRITEUP-asm.md section 11) with the `skenenp2` kid sprite |
| 44.1 | | **room** - `0room3.3ds` (cb 0x1f040) |
| 51.2 | hyperven.png | title sprite over a portrait photo (purple.png) |
| 58.0 | white flash | **blob** - `dmoykk2.3ds`, env-mapped 1473-vertex blob on `keltanai.png` (cb 0x24bac) |
| 72.4 | | **hallu** - `hallu.3ds`: glass dome, grass, comet particle (cb 0x1e7d8) |
| 83.1 / 93.7 | | **piikit** - `piikit2.3ds` (cb 0x1f45c); returns to hallu 86.6-93.7 |
| 100.6 | | **metaballs** (cb 0x24578), orange-sweater lady `metanain.png` |
| 114.7 | white flash | photos + lyric strips (cb 0x20bc4): `abba45`, `iwish`, `itused`, `whathap`, `when` |
| 129.6 - 143.6 | | green / orange **swirl tunnels** (holemap, forcemap, mulju textures), `sos` text |
| 143.7 | | pink `raita` backdrop with three env-mapped balls (`ball2.3ds`) |
| 157.8 | | **TV** - `tvfin.3ds` dark grid, cyan particles; credits strips (mrsex, gurdan, mistral, mike, jate, yolque, lebeau) |
| 171.9 | red flash | **flesh tube** - `morph2.3ds` (MORMAP + MORBUMP + MORENV) with orange particles, "HYPERVENTILATION"/"BYTERAPERS" strips |
| 182.5 | white fade | `youjust.png` ("You just eat, sleep, go on stage and nothing more") on white; ends 185.8+ |

(The cb trace of the original after 100 s was lost to an emulator problem in the first run; the times after 100 s come from the script and from the
re-rendered frames in `re/golden/`.) Sprite commands: 1 start, 2 stop, 4 fade-in (c ticks), 5 fade-out (c ticks), 6 fade to colour, 7 flash colour (duration in ticks),
8 cancel; sprite kinds in the table: 0x10001 = photo (alpha 0.4-0.55, used as is), 2 = lyric/credit strip image, 1 = abba41-2.png, the full-opacity photo of the 114.7 s lyric scene. **The sprite table starts one 36-byte record before 0x105dfc**: record 0 is `lasit.png` (the 4-faces photo at 5.3-8.8 s), so the script's sprite ids index the table directly and the dumped list is shifted by one (found by correlating the original's frames with every image; this off-by-one had shown the wrong photo and lyric strip all over the demo).

## 2. The 3D engine
Classes seen through RTTI strings: `beSCENE, beCAMERA, beLIGHT, beMESH, beSPLINE/beSPLINEMESH, bePOSKEY, bePARTICLE_SYSTEM, beISO, beQUAT, beMATRIX, beRASTER, beCLIPPER, beBITMAP, beVESA`.
* **Loading**: `.3DS` (R3/R4) parsed at start-up by the scene constructor 0x2bf23; material names like `SEINA.BMP`/`DOOM.GIF` in the files are redirected to the `.PNG` in `Hyper.dat`
  by the bitmap loader (0x49ee4; beBITMAP supports PNG/BMP/PCX). `Hyper.dat` is a "(B)ZIP" archive (see README).
* **Coordinates**: 3DS Z-up is converted to the engine's Y-up by swapping y/z (camera position at t=10 s measured as (-1256,5080,-949) = 3DS (-1256,-949,5080)).
* **Keyframer**: position/rotation/scale/FOV/roll tracks, **frame = 70 Hz tick**; rotation keys are 3DS axis-angle (inverse convention) accumulated into quaternions; several cameras per file (Camera01..03) selected by the scene functions.
* **Projection**: the 3DS FOV track is used as the *vertical* FOV of the 320x200 viewport (measured: FOV 94.29 deg -> tan(half) 1.065, horizontal 1.704 = 1.6x).
* **Pipeline**: transform -> light (per-vertex RGB, byte per channel) -> clip -> divide -> scan conversion with a **16-bit Z-buffer** (no sorting) -> 32-bit frame buffer.
* **Texture mappers** (see asm snippets 1-3): paletted 256-wide textures with 16-pixel perspective sub-spans, per-channel Gouraud through a 64 KB shade LUT, 32-bit
  texel variants, environment mapping (materials with a reflection map: `MOYKYENV`, `ENVGREEN`, `MORENV`, `BALL.PNG`...) and bump mapping (`MORBUMP`, `bump.png`, material MORFFI), selected by self-modified code.
* **Particles**: lights named `particle00..03` in the 3DS files are emitters (`bePARTICLE_SYSTEM`, sprite `particle.png`, rand()-driven spread, per-tick spawn at 0x1e8e8); `glow`/`flash`/`flare` lights draw `glow.png`/`lens.png` flares.
* **Morphing**: `morph.3ds` (3 targets of 164 vertices) and `morph2.3ds` (3 x 130) are interpolated between objects (strings "Cannot find morph object").
* **Metaballs / iso-surfaces** (100.7-114.9 s): `meta1.3ds` is only a placeholder node + camera; the surface is generated every frame (class at 0x36914..0x37da4, textures `isomap.png`/`envi2.png`). Ported 1:1:
  5 balls, each position `0.4*360*(sin a1, cos a2, sin a3)` with three 10-bit phases A,B,C advancing by `speed*ticks` (speeds `[1,4,-2,3,5]`, `[1,-4,-3,4,-2]`, B==C), `a1=A+B+C`, `a2=A+C`, `a3=B-C/2`;
  field = Wyvill soft object `1-4/9(r/R)^6+17/9(r/R)^4-22/9(r/R)^2` (R=198, zero beyond), summed on a 17^3 grid (step 45, extent +-360), iso level 0.12, marching cubes (the
  original's edge/triangle tables are copied to `assets/mc.json`), normals from forward differences, texture coords `4(1+atan2(z,x)/pi)`, `4(1+atan2(z,y)/pi)`. The object is placed by the `meta` node's position track
  driven by music time `(order*64+row-0x740)*10`. The projection was recovered from the emulator's projected vertices (RANSAC DLT): focal 197.58, centre (159.5, 99.5), model space is the 3DS space with y/z swapped.
  The look (dark translucent blue, depth-of-field blur on some frames) comes from a depth-sorted translucent pass (`[cam+0x3c]=7`, bucket flush 0x2ae88) that is not ported: the port draws z-buffered `0.35*isomap + 0.4*envi2`.
* **2D**: sprites with alpha/additive blending, a global flash/fade-to-colour layer, "writer" strips (lyrics as torn tape labels).
* **Music**: MIDAS 0.7 reads the XM; position feeds the script.

### Lighting model (reverse engineered, 0x463ec; ported in `web/js/engine.js` `drawScene`/`Scene3D.lightsAt`)
Per-vertex, per-channel, point lights only, no specular. `L = ambient(3DS chunk 0x2100, 0..255) + 2 + sum over lights [ smoothstep(inner, outer) * multiplier * max(0, N.D) / |D| * light colour (0..255) ]`, clamped to 250,
optionally multiplied by a depth fade `clamp(1 - z*k, 0, 1)` (on in the hallu/piikit/tv scenes: k = 0.00194, 0.00078/0.0009, 0.00068), then `texel * floor(L/4) / 64` per channel through the 64 KB shade LUT (63 light levels per channel,
visible as banding on the room walls). The numbers were validated against the emulated original: 0.1 % agreement on a 10-light room vertex (the remainder is the rounding of the logged inputs).
Lights carry the 3DS colour (chunk 0x0010 x255), inner/outer range (0x4659/0x465A) and multiplier (0x465B, 5.0 in hallu); a light with outer range 0 contributes nothing. The 3DS light *position* tracks are keyframed (TCB), as for objects.
The **"flash" lights** (the amber and blue running lights in the room, the five in the space dome, a few in hallu/piikit) have their ranges animated by the scene code: `range = base * max(0, cos(2*pi*t/1.19 + phase))`,
four lights a quarter-period apart, which makes the light run down the corridor. That animation is not in the 3DS files; it was sampled from the original (`re/lightdump.py`, `tools/bake_lights.py` -> `web/assets/lightanim.json`) and is replayed with linear interpolation.
The `morph2` flesh scene never calls the lighter, so the port draws it unlit.

### The 172-185.8 s scene: a second iso-surface + spark particles (fully reversed)

An earlier version of this section described a "flesh" scene built on `morph2.3ds`. That was wrong: at 175 s the original executes none of the 0x25xxx morph code. The scene is the
second iso-surface object (init 0x23814, render callback 0x239bc, sampler 0x23ac0) with `metamap0.png` (red crinkle), `metaenv0.png` (environment) and `bump.png` (swirl bump), plus a particle emitter.
Everything below was read from the code and checked against the emulator:
* **Camera**: at (0,0,-1000), look-at (2,2,0), FOV 78 -> focal 160/tan(39 deg) = 197.58, screen centre (159.5, 99.5) (RANSAC DLT on the projected vertices gives K = 197.58/159.5/99.5, R = diag(1,-1,1) + 0.002 tilt).
* **Field**: 10 balls on a 17^3 grid (step 100, extent +-800, iso 0.12), the same Wyvill polynomial (R = 0.55*800). Ball i moves along y by a per-*frame* speed `[40,-20,-40,134,40,-35,50,57,-90,68]`; at |y| >= 1000 it re-enters at the other end
  with a new random (x,z) = rand()%400 (init: rand()%500-250). rand() is Watcom's LCG (`s = s*0x41c64e6d+0x3039; (s>>16)&0x7fff`) seeded by `time()`, shared with the particles, so the port replays the
  re-entry positions logged from the reference run (`assets/isoballs.json`).
* **Surface**: same mesher; `[obj+0x184] & 1` selects planar v: u = 4(1+atan2(z,x)/pi), v = 4 + 0.005 y. Normals are the (un-negated) field gradient; env coords u = 0.5(1+n.right), v = 0.5(1-n.up) (0x4b045).
  Mapper: texture + bump-perturbed environment, averaged (see asm section 13); texture palettes are the PNG palettes, no lighting.
* **Particles** (`isoParticles`): 49 per frame, v = U(-250,250)^3, colour (100,40,25)+-12.8, size 30..35 (x1.02^dt per frame), life 250 ticks, gravity (0,-1,0), additive 16x16 `particle.png` blit with
  LUT row `tint>>2` of the second shade table (`min(255, texel*row/32)`), z-tested at the centre pixel against the scene depth.
* **Start flash**: script command 7 fades from red over 40 ticks counted from the scene's first frame (172.0), applied over the whole frame.
* The reference frames are displayed with a 0-2 frame lag (the image only changes every third 7-tick frame during this scene), which explains small position offsets.

### 0room3.3ds  (73720 bytes)
- meshes: 62, vertices 1159, triangles 922; lights: 24; cameras: Camera01, Camera02, Camera03
- materials: 1 -> SEINA.BMP; 2 -> PLATE.GIF; 3 -> LATTIA.BMP; 8FLOOR -> 0FLOOR.BMP; 9REUNA -> 0REUNA.BMP; 10PYLVS -> PYLVAS.BMP; 1SEIN -> SEINA2.BMP; RAKO -> RAKO.BMP; 6 -> 6.BMP; HISSI -> HISSI.BMP
- largest meshes: lattia01 (77v/120f), katto (77v/120f), katto01 (56v/56f), lattia02 (56v/56f), wall01 (22v/20f), wall03 (22v/20f)

### ball2.3ds  (20712 bytes)
- meshes: 3, vertices 390, triangles 768; lights: 3; cameras: Camera01
- materials: BALL -> BALL.PNG; PAIKKA -> BALLMID.PNG
- largest meshes: ball (130v/256f), ball01 (130v/256f), ball02 (130v/256f)

### dmoykk2.3ds  (77152 bytes)
- meshes: 1, vertices 1473, triangles 2942; lights: 3; cameras: Camera01
- materials: MATE -> MOYKYMAP.PNG/MOYKYENV.PNG
- largest meshes: Default (1473v/2942f)

### hallu.3ds  (56254 bytes)
- meshes: 50, vertices 1087, triangles 1180; lights: 15; cameras: Camera01, Camera02, Camera03
- materials: 1 -> RUOHO.BMP; GREEN -> 0IKKUNA.BMP; 2 -> MARMORI2.GIF; KUPOLI -> ENVGREEN.BMP
- largest meshes: kupoli (65v/126f), obu (32v/54f), obu01 (32v/54f), obu02 (32v/54f), pohja (32v/32f), putki01 (16v/24f)

### meta1.3ds  (3010 bytes)
- meshes: 1, vertices 8, triangles 12; lights: 0; cameras: Camera01
- materials: META -> flat colour
- largest meshes: meta (8v/12f)

### morph.3ds  (24509 bytes)
- meshes: 3, vertices 492, triangles 972; lights: 0; cameras: Camera01
- materials: 1 -> DOOM.GIF/ENVPLANE.BMP
- largest meshes: ball (164v/324f), ball000 (164v/324f), ball000000 (164v/324f)

### morph2.3ds  (16881 bytes)
- meshes: 3, vertices 390, triangles 768; lights: 1; cameras: Camera01
- materials: MORFFI -> MORMAP.PNG/MORBUMP.PNG/MORENV.PNG
- largest meshes: morph (130v/256f), morph01 (130v/256f), morph01000 (130v/256f)

### pallo.3ds  (14602 bytes)
- meshes: 2, vertices 260, triangles 512; lights: 3; cameras: Camera01
- materials: BALL -> PALLO.PNG
- largest meshes: ball (130v/256f), ball01 (130v/256f)

### piikit2.3ds  (96444 bytes)
- meshes: 13, vertices 1832, triangles 3340; lights: 10; cameras: Camera01, Camera02, Camera03
- materials: 1 -> KUVIO.GIF; RUOHO -> RUOHO.BMP; ENVGREEN -> ENVGREEN.BMP
- largest meshes: soiro01 (480v/934f), piikki01 (420v/795f), piikki02 (349v/665f), Object04 (257v/430f), pallo01 (114v/224f), moto (34v/64f)

### space2.3ds  (48221 bytes)
- meshes: 18, vertices 843, triangles 1464; lights: 12; cameras: Camera01
- materials: 1 -> LAATTA.GIF; 3 -> ORIONMOS.BMP; 4 -> ORIONMOS.BMP; 5 -> DOOM.GIF
- largest meshes: fd (130v/256f), lock (70v/108f), kaari01 (44v/80f), kaari02 (44v/80f), kaari03 (44v/80f), kaari04 (44v/80f)

### tvfin.3ds  (28878 bytes)
- meshes: 16, vertices 488, triangles 711; lights: 4; cameras: Camera01
- materials: 6ENVI -> ENVPLANE.BMP; FEEDBACK -> flat colour; GRID -> 0IKKUNA.BMP
- largest meshes: box (216v/300f), putki (48v/96f), Object (24v/43f), tv01 (24v/43f), Object01 (24v/43f), Object02 (24v/43f)


`pallo.3ds` (stored in Hyper.dat as `PALLO.PNG`) and `3ds.bak` are older copies of the `ball2` scene and are not loaded by the demo.

Scene -> files (from the load trace in `re/boot_trace.py`):
space = space2.3ds + laatta, orionmos (map and env), doom; room = 0room3.3ds + seina, plate, lattia, 0floor, 0reuna, pylvas, seina2, rako, 6, hissi;
hallu = hallu.3ds + ruoho, 0ikkuna, marmori2, envgreen; piikit = piikit2.3ds + kuvio, ruoho, envgreen; morph = morph.3ds + doom, envplane; morph2 = morph2.3ds + mormap, morbump, morenv;
blob = dmoykk2.3ds + moykymap, moykyenv; balls = ball2.3ds + ball, ballmid; tv = tvfin.3ds + envplane, 0ikkuna; metaballs = isomap, envi2, metamap0, metaenv0, bump.

## 5. Pictures (Hyper.dat PNGs)
Photos/pictures (320x200): abba, abba41-2, abba45, folio, lavalla1-4, roskaa1-7 (noise-lines "TV" frames), keltanai, lasit, metanain, photo, purple, raita, skenenp2, sos, sos2, tokavek, youjust;
lyric / credit strips: beauty, love, gone, gone2, code, gfx, mrsex, gurdan, mistral, mike, jate, musa, yolque, and, lebeau, hyperven, bytelogo, iwish, itused, when, whathap, thelove.
Textures: see the contact sheet `shots/` and `web/assets/img`.

## 6. Port vs original
`shots/contact_original.png` (frames of the original running under emulation, every 5 s) and `shots/contact_port.png` (the port) and the side-by-side `shots/compare_all.png`
(left = port, right = original). Honest numbers: mean absolute error **50.9 / 255** over those 37 frames: the structure (scene order, timing, sprites, camera paths, objects) matches; the lighting, particle looks
and several scene-specific effects (tunnel, metaballs, flesh tube) are only approximations.


### Swirl scene (132.9-136.9 s) - fully reversed
A 41x26 distortion grid (code 0x21c24) rendered twice (textures `mulju00a` and `mulju00b`, indices + palettes straight from the PNGs) and blended through shade tables: see asm section 15. The port reproduces the original's integer pipeline
(grid in 16.16<<8, 8x8 cell interpolation, row tables) and matches the emulator's final 32-bit buffer exactly. The other sub-scenes of 128.6-143.8 s are *different code*: 136.9-139.8 is the scene initialised at 0x25c9c (render 0x25d80, textures `forcemao` + `mefis`),
139.8-143.7 is the morph2 object with the 4-attractor grid (0x25ac8/0x25738), 128.6-132.7 starts at 0x25060; those are still the old approximation.
