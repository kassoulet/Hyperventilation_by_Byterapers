# Function / data map (linear addresses in mem_clean.bin)
entry 0x2bbf8 (jmp 0x2bc70 = Watcom _cstart; WATCOM string 0x2bbfa) - code object 0x1b000-0x70000, data 0x100000, bss 0x10eb50-0x21eebc
- 0x1d0xx main (init, MIDAS init, video-mode menu 0x1d378, scene init calls 0x1d1b5..0x1d2f5, main loop 0x1d56a)
- scene init functions: 0x2359c meta textures, 0x22030 ?, 0x2109c morph.3ds, 0x1eea0 0room3, 0x20dd0 space2, 0x1f13c piikit2, 0x1e390 hallu, 0x1fe00 ?, 0x21af4 ?, 0x23270 ?, 0x25020 morph.3ds, 0x25540 morph2, 0x2427c meta1, 0x249d0 dmoykk2, 0x21350 tvfin, 0x24c90 ball2, 0x25b60 ?
- 0x1de94 70 Hz tick callback; 0x1dd2c music sync callback; 0x1de80 pre-VR callback
- script table 0x104aa0 (28 B records, 168), dispatcher jump table 0x1d024; sprite table 0x105dfc (36 B x 43); sprite command switch 0x222c4 (table 0x22290)
- render callbacks: 0x20f68 space, 0x23528 tunnel, 0x1f040 room, 0x24bac blob, 0x1e7d8 hallu, 0x1f45c piikit, 0x24578 metaballs, 0x20bc4 photos
- rasteriser: 0x5a25d span driver, 0x5a574 8-bit mapper inner loop, 0x5bd07 32-bit mapper, 0x5b8fc patch dispatcher, shade LUT 0x149a18; matrix code 0x202a4
- 3DS scene loader 0x2bf23, bitmap loader 0x49ee4 (bump 0x4a208), texture object ctor 0x364e0; bzip archive 0x26cb0 ('hyper.dat'); MIDAS 0x27xxx-0x28xxx, 0x3b0xx timer
- malloc 0x4194a, sbrk 0x52caf, InitRtns 0x44ad8 (table 0x10e7be, 6-byte entries)

# Lava tunnel oracle (0x23528), exact
`re/tun_oracle.py OUT.npz [T0] [N]` (run with a python that has unicorn+capstone, cwd re/): hooks the callback 0x23528 (entry, after the cell filler at 0x2354b, ret at 0x2357d) and stores per call the scene tick [0x10eb9c], grid (0x12d41c), shade array (0x12c374),
index texture, shade LUT ([0x21b314], 64 rows x 256 x BGR0), the 8-bit surface and the screens of the following frames. Findings: grid 0x23350 = 3 attractors, x87 single/chop (as 0x25738); shade starts at 4194303.0, f=(r2+500+5000)/15000, no clamp;
LUT[row][texel] = palette*row>>6 (the morph2 scene's LUT is >>7); surface+shade+LUT reproduces the screen with 0.0 error. The screen only changes every 21 ticks (the render of tick 14+21n is shown for 3 frames), which the port's test mode models.
`web/js/scenes.js` `lavaGrid`/`lavaTunnel` replace the float approximation (and its empirical gamma 1.45, now dead code for this scene). Also: flash (script command 7) uses the same fader as fade_to_color with alpha 255 -> 0 (fits the 30.3-30.5 s frames exactly).
Fresh-frame measurement: `re/golden.py OUT T0 T1 STEP` at times not used for fitting (e.g. 0.5+5k s): 3.8/255 mean, outliers listed in README.
Open: room-scene intro white fade (44.3-46 s, code-driven by 0x1e1d0/0x1eebc, alpha roughly 203,90,50,40,31,11,4 /255 at 44.4,44.7,...), morph2 background phase at 140.1-140.6 s (original one 7-tick frame behind the port), swirl 135.5 s, the remaining tunnel-style scene 128.6-132.7 (swirl1, float model).
