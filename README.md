# HYPERVENTILATION (Byterapers, Remedy '98) - JavaScript port + reverse engineering

## Run
```
cd web && python3 -m http.server 8000      # open http://localhost:8000/  (click / Space to start; sound needs a user gesture)
```
Player: canvas 320x240 shown at **4:3** (the original's VESA 320x240 mode has square pixels; the picture is a 320x200 viewport with 20-pixel bars, like the original),
music through libopenmpt (chiptune3, `web/vendor`), play/pause, a seek bar that works anywhere (the whole demo is a pure function of the music time, so seeking just sets the
module position with `setPos` and re-renders), fullscreen, keys: Space, Left/Right (5 s, Shift 10 s), Up/Down (previous/next scene), Home/End, F, M.
Tests: `node tools/shot.mjs OUTDIR t1 t2 ...` (frames of the port in headless Chrome), `node tools/perf.mjs` (3-11 ms/frame), `node tools/uitest.mjs` (play/pause/seek smoke test).

## What is here
* `HYPER.exe Hyper.dat Hypermmx.xm hyper.nfo File_id.diz` - originals (untouched).
* `re/` reverse-engineering: `unpack_pmodew.py`/`unpack_clean.py` (run PMODE/W's own loader under Unicorn; `mem_clean.bin` = image at the program entry 0x2bbf8, **clean** - the first dump was taken while the demo
  ran and was dirty), `emucore.py` (DOS/DPMI/VBE/MIDAS-timer/VGA stubs), `boot.py` (boots the original to its main loop, `state.bin`), `harness.py`/`golden.py` (virtual 70 Hz clock; renders real frames
  of the original; `CKPT=dir` writes checkpoints; frames of the original in `re/golden/`), `lightdump.py` (logs the original's per-frame light lists, input of `tools/bake_lights.py`), `boot_trace.py` (which scene loads which files), `prof.py` (hot blocks), `ds.py`/`xref.py`/`callers.py` (disassembly helpers),
  `xm_times.json`, `data.lst`, `catalogue.md`, `dat/` (the 104 files extracted from Hyper.dat).
* `tools/` `bake_lights.py` (light-range animation -> `web/assets/lightanim.json`), `script_dump.py` (decodes the in-binary script and sprite tables), `xmtime.py` (XM order/row -> seconds), `parse3ds.py`, `kfinfo.py`, `catalogue.py`, `sheet.py`, `cmp.py`, `shot.mjs`, `perf.mjs`, `uitest.mjs`.
* `web/` the player. `WRITEUP-asm.md` (9 verified asm snippets), `WRITEUP-effects.md` (timeline, engine, catalogue of objects/scenes), `shots/` contact sheets.

Hyper.dat = "(B)ZIP": 16-byte header (magic, 0x102, count = 104) then 0x30-byte entries `{name[0x20], offset, size, size, 0}`; files stored raw (PNG, 3DS, `data.lst`). `lens.png` is a BMP (converted to PNG in `web/assets`); `PALLO.PNG` is a 3DS.

## Faithful vs approximated (be honest)
Faithful (recovered from the binary): the **timeline** (all 168 script records, 43 sprite definitions, flash/fade commands, converted to seconds with the XM tempo model), the **assets** and which scene uses which,
the **3DS data** (meshes, UVs, materials, cameras, lights, keyframe tracks, 1 tick = 1 frame, coordinate swap, FOV/aspect convention measured against the original's camera object), the 320x240 mode / 4:3 display,
the music (the real XM through libopenmpt).
Lighting is now the original's model (reverse engineered from 0x463ec: per-vertex RGB point lights with inner/outer smooth-step range, ambient from the 3DS file, depth fade, 63-level shade LUT, the animated range of the 'flash' lights sampled from the original; see `WRITEUP-effects.md`, `WRITEUP-asm.md` section 10).
Approximated: **look of every scene** - mean error vs the real frames is now ~20.5/255 over the 37 reference frames (it was ~51 at the start of this work: the tunnel grid effect reverse engineered (lava 19-36, swirl sub-scenes), particle size, alpha-blended full-screen sprites, scene boundaries from the original's tick resets, and, earlier, lighting model, the sprite-table off-by-one that showed the wrong photo/strip images, the missing full-opacity photo layer, shading-1 materials drawn unlit, back-face culling off for the space dome; the remaining error is dominated by the swirl palettes, the lyric photo strips and hallu/piikit timing, the swirl sub-scenes' palettes, hallu/piikit camera timing and the bump/env mappers - not by lighting); environment/bump mapping is my own formulation; particles/flares are simple additive sprites; the **swirl tunnels'** palette recolouring (sub-scene 2's hue) is approximate, **metaballs** are the original's real 3D iso-surface (5 Wyvill balls on a 17^3 grid, marching cubes with the original's table) but shaded with my own texture+env blend, without the original's translucent depth-sorted passes and blur, the **portrait** scene and **balls/tv/flesh** scenes use guessed cameras/time offsets, the photo/lyric sprites use my own alpha rules (the original's writer animation - tape strips that wobble/reveal -
is only a fade), **morph** objects are interpolated between their targets (3DS morph track 0xB026, linear; the flesh scene's camera/time mapping is still a guess, so the flesh shape is not what the original shows), `morph.3ds` scene (the yellow background ball around 60-72 s uses dmoykk2 instead).
Scene windows after 100 s were not read from the render-callback trace but from the script + frames. TCB tangents are not normalised exactly like lib3ds. Back-face culling is a guess for several files (two-sided where it looked wrong).
Known gaps: no feedback/TV-screen effect, no bump-mapped morph, no text-mode menu, timing of lyric strip animation, exact particle counts. Sound is not emulated in the harness (No-Sound device forced; the 70 Hz timer and MIDAS position are injected), so original frames are ground truth for visuals only.

## Pitfalls found while emulating (useful if you redo it)
Watcom's `sbrk` uses `lsl` on DS as the initial break and refuses a break below the initial ESP; the DOS-memory pool for DPMI 0x100 must not overlap the image at 0x1b000-0x70000 (it silently overwrote
code at 0x20010 and crashed the run at 115 s); `__InitRtns` flags are already set in a dump taken after start-up (static constructors, e.g. `cout`, would be skipped).
