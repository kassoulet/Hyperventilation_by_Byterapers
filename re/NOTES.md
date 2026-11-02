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
