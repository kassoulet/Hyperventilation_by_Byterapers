// holefx.js - the ray-traced two-layer effect of the original's callback 0x20bc4 (photos scene underlay, see WRITEUP-asm.md 27/28).
// The grid builder (0x202a4 with the cubic/quartic solvers 0x355c4/0x357f8/0x35548) and the per-frame setup (0x20bc4, 0x322dc, 0x30244) are
// transpiled instruction by instruction from the original's x86/x87 code (tools/x2js.py) and run on a small sparse memory image.
let regions=[];const S=[];const R={eax:0,ebx:0,ecx:0,edx:0,esi:0,edi:0,ebp:0,esp:0x3f0000};
const rg=a=>{a>>>=0;for(const r of regions)if(a>=r.b&&a<r.b+r.v.byteLength)return r;throw new Error('holefx: mem '+a.toString(16));};
const ld32=a=>{const r=rg(a);return r.v.getInt32(a-r.b,true);},ld16=a=>{const r=rg(a);return r.v.getUint16(a-r.b,true);},ld16s=a=>{const r=rg(a);return r.v.getInt16(a-r.b,true);},ld8=a=>{const r=rg(a);return r.v.getUint8(a-r.b);};
const st32=(a,x)=>{const r=rg(a);r.v.setInt32(a-r.b,x|0,true);},sti32=st32,st16=(a,x)=>{const r=rg(a);r.v.setUint16(a-r.b,x&0xffff,true);},st8=(a,x)=>{const r=rg(a);r.v.setUint8(a-r.b,x&255);};
const ldf32=a=>{const r=rg(a);return r.v.getFloat32(a-r.b,true);},ldf64=a=>{const r=rg(a);return r.v.getFloat64(a-r.b,true);};
const stf32=(a,x)=>{const r=rg(a);r.v.setFloat32(a-r.b,x,true);},stf64=(a,x)=>{const r=rg(a);r.v.setFloat64(a-r.b,x,true);};
const rnd=Math.trunc;   // fistp with the demo's control word: truncation
const F={};let skipGrid=false;
F[0x35bb8]=()=>{R.esp+=4;};                                                  // constructor stub of the vector array
F[0x34d81]=()=>{const a=S.pop(),b=S.pop();S.push(Math.atan2(a,b));R.esp+=4;};   // fxch; fpatan
F[0x39eca]=()=>{const x=S.pop(),e=S.pop();S.push(Math.pow(x,e));R.esp+=4;};     // C pow()
const mk=()=>{
function f202a4(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x202a4;
for(;;){switch(pc){
case 0x202a4:
//202a4 push ebp
R.esp=(R.esp-4)|0;st32(R.esp,R.ebp);
//202a5 mov ebp, esp
R.ebp=R.esp;
//202a7 push ebx
R.esp=(R.esp-4)|0;st32(R.esp,R.ebx);
//202a8 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//202a9 push edx
R.esp=(R.esp-4)|0;st32(R.esp,R.edx);
//202aa push esi
R.esp=(R.esp-4)|0;st32(R.esp,R.esi);
//202ab push edi
R.esp=(R.esp-4)|0;st32(R.esp,R.edi);
//202ac sub esp, 0x1dc
R.esp=(R.esp - (476|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//202b2 mov dword ptr [ebp - 0x34], eax
st32((R.ebp - 0x34|0),R.eax);
//202b5 mov ebx, 0x103ee0
R.ebx=(1064672|0);
//202ba mov edx, 4
R.edx=(4|0);
//202bf lea eax, [ebp - 0x1c0]
R.eax=(R.ebp - 0x1c0|0);
//202c5 call 0x35bb8
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x35bb8]();
//202ca mov edx, dword ptr [ebp - 0x34]
R.edx=ld32((R.ebp - 0x34|0));
//202cd mov eax, dword ptr [edx + 8]
R.eax=ld32((R.edx + 8|0));
//202d0 mov dword ptr [ebp - 0x1f0], eax
st32((R.ebp - 0x1f0|0),R.eax);
//202d6 mov eax, dword ptr [edx + 0x14]
R.eax=ld32((R.edx + 0x14|0));
//202d9 mov dword ptr [ebp - 0x1ec], eax
st32((R.ebp - 0x1ec|0),R.eax);
//202df mov eax, dword ptr [edx + 0x20]
R.eax=ld32((R.edx + 0x20|0));
//202e2 mov dword ptr [ebp - 0x1e8], eax
st32((R.ebp - 0x1e8|0),R.eax);
//202e8 mov eax, dword ptr [edx + 0xc]
R.eax=ld32((R.edx + 0xc|0));
//202eb mov dword ptr [ebp - 0x1e4], eax
st32((R.ebp - 0x1e4|0),R.eax);
//202f1 mov eax, dword ptr [edx + 0x18]
R.eax=ld32((R.edx + 0x18|0));
//202f4 mov dword ptr [ebp - 0x1e0], eax
st32((R.ebp - 0x1e0|0),R.eax);
//202fa mov eax, dword ptr [edx + 0x24]
R.eax=ld32((R.edx + 0x24|0));
//202fd mov dword ptr [ebp - 0x1dc], eax
st32((R.ebp - 0x1dc|0),R.eax);
//20303 mov eax, dword ptr [edx + 0x10]
R.eax=ld32((R.edx + 0x10|0));
//20306 mov dword ptr [ebp - 0x1d8], eax
st32((R.ebp - 0x1d8|0),R.eax);
//2030c mov eax, dword ptr [edx + 0x1c]
R.eax=ld32((R.edx + 0x1c|0));
//2030f mov dword ptr [ebp - 0x1d4], eax
st32((R.ebp - 0x1d4|0),R.eax);
//20315 mov eax, dword ptr [edx + 0x28]
R.eax=ld32((R.edx + 0x28|0));
//20318 mov dword ptr [ebp - 0x1d0], eax
st32((R.ebp - 0x1d0|0),R.eax);
//2031e mov eax, dword ptr [edx + 0x2c]
R.eax=ld32((R.edx + 0x2c|0));
//20321 mov dword ptr [ebp - 0x1cc], eax
st32((R.ebp - 0x1cc|0),R.eax);
//20327 mov eax, dword ptr [edx + 0x30]
R.eax=ld32((R.edx + 0x30|0));
//2032a lea ecx, [ebp - 0x1c0]
R.ecx=(R.ebp - 0x1c0|0);
//20330 mov dword ptr [ebp - 0x1c8], eax
st32((R.ebp - 0x1c8|0),R.eax);
//20336 lea esi, [ebp - 0x1f0]
R.esi=(R.ebp - 0x1f0|0);
//2033c mov eax, dword ptr [edx + 0x34]
R.eax=ld32((R.edx + 0x34|0));
//2033f mov edx, 0x126c38
R.edx=(1207352|0);
//20344 mov dword ptr [ebp - 0x1c4], eax
st32((R.ebp - 0x1c4|0),R.eax);
//2034a lea ebx, [edx + 0x30]
R.ebx=(R.edx + 0x30|0);
/*fall*/ pc=0x2034d;
case 0x2034d:
//2034d mov eax, edx
R.eax=R.edx;
//2034f mov edi, ecx
R.edi=R.ecx;
//20351 fld dword ptr [esi]
S.push(ldf32((R.esi|0)));
//20353 fmul dword ptr [eax]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax|0)));
//20355 fld dword ptr [esi + 4]
S.push(ldf32((R.esi + 4|0)));
//20358 fmul dword ptr [eax + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 4|0)));
//2035b fld dword ptr [esi + 0xc]
S.push(ldf32((R.esi + 0xc|0)));
//2035e fmul dword ptr [eax]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax|0)));
//20360 fld dword ptr [esi + 0x10]
S.push(ldf32((R.esi + 0x10|0)));
//20363 fmul dword ptr [eax + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 4|0)));
//20366 fld dword ptr [esi + 0x18]
S.push(ldf32((R.esi + 0x18|0)));
//20369 fmul dword ptr [eax]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax|0)));
//2036b fld dword ptr [esi + 0x1c]
S.push(ldf32((R.esi + 0x1c|0)));
//2036e fmul dword ptr [eax + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 4|0)));
//20371 fxch st(4)
{const t=S[S.length-1-4];S[S.length-1-4]=S[S.length-1];S[S.length-1]=t;}
//20373 faddp st(5)
{const a=S[S.length-1-5],b=S[S.length-1];S[S.length-1-5]=(a)+(b);S.pop();}
//20375 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20377 faddp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)+(b);S.pop();}
//20379 faddp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)+(b);S.pop();}
//2037b fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//2037d fld dword ptr [esi + 8]
S.push(ldf32((R.esi + 8|0)));
//20380 fmul dword ptr [eax + 8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 8|0)));
//20383 fld dword ptr [esi + 0x14]
S.push(ldf32((R.esi + 0x14|0)));
//20386 fmul dword ptr [eax + 8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 8|0)));
//20389 fld dword ptr [esi + 0x20]
S.push(ldf32((R.esi + 0x20|0)));
//2038c fmul dword ptr [eax + 8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.eax + 8|0)));
//2038f fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//20391 faddp st(5)
{const a=S[S.length-1-5],b=S[S.length-1];S[S.length-1-5]=(a)+(b);S.pop();}
//20393 faddp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(a)+(b);S.pop();}
//20395 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//20397 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//20399 fadd dword ptr [esi + 0x24]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.esi + 0x24|0)));
//2039c fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//2039e fadd dword ptr [esi + 0x28]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.esi + 0x28|0)));
//203a1 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//203a3 fadd dword ptr [esi + 0x2c]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.esi + 0x2c|0)));
//203a6 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//203a8 fstp dword ptr [edi]
stf32((R.edi|0),S[S.length-1]);S.pop();
//203aa fstp dword ptr [edi + 8]
stf32((R.edi + 8|0),S[S.length-1]);S.pop();
//203ad fstp dword ptr [edi + 4]
stf32((R.edi + 4|0),S[S.length-1]);S.pop();
//203b0 add edx, 0xc
R.edx=(R.edx + (12|0))|0;flags_zf=+(R.edx===0);flags_sf=+(R.edx<0);
//203b3 add ecx, 0xc
R.ecx=(R.ecx + (12|0))|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//203b6 cmp edx, ebx
flags_cf=+((R.edx>>>0)<(R.ebx>>>0));flags_zf=+((R.edx)===(R.ebx));{const r=(R.edx-R.ebx)|0;flags_sf=+(r<0);flags_of=+((((R.edx)^(R.ebx))&((R.edx)^r))<0);}
//203b8 jne 0x2034d
if(!flags_zf){pc=0x2034d;continue;}
//203ba fld dword ptr [ebp - 0x1a8]
S.push(ldf32((R.ebp - 0x1a8|0)));
//203c0 fsub dword ptr [ebp - 0x1c0]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1c0|0)));
//203c6 fstp dword ptr [ebp - 0xe8]
stf32((R.ebp - 0xe8|0),S[S.length-1]);S.pop();
//203cc fld dword ptr [ebp - 0x1a4]
S.push(ldf32((R.ebp - 0x1a4|0)));
//203d2 fsub dword ptr [ebp - 0x1bc]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1bc|0)));
//203d8 fstp dword ptr [ebp - 0xe4]
stf32((R.ebp - 0xe4|0),S[S.length-1]);S.pop();
//203de fld dword ptr [ebp - 0x1a0]
S.push(ldf32((R.ebp - 0x1a0|0)));
//203e4 fsub dword ptr [ebp - 0x1b8]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1b8|0)));
//203ea fstp dword ptr [ebp - 0xe0]
stf32((R.ebp - 0xe0|0),S[S.length-1]);S.pop();
//203f0 fld dword ptr [ebp - 0x19c]
S.push(ldf32((R.ebp - 0x19c|0)));
//203f6 fsub dword ptr [ebp - 0x1b4]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1b4|0)));
//203fc fstp dword ptr [ebp - 0x118]
stf32((R.ebp - 0x118|0),S[S.length-1]);S.pop();
//20402 fld dword ptr [ebp - 0x198]
S.push(ldf32((R.ebp - 0x198|0)));
//20408 fsub dword ptr [ebp - 0x1b0]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1b0|0)));
//2040e fstp dword ptr [ebp - 0x114]
stf32((R.ebp - 0x114|0),S[S.length-1]);S.pop();
//20414 fld dword ptr [ebp - 0x194]
S.push(ldf32((R.ebp - 0x194|0)));
//2041a fsub dword ptr [ebp - 0x1ac]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x1ac|0)));
//20420 fstp dword ptr [ebp - 0x110]
stf32((R.ebp - 0x110|0),S[S.length-1]);S.pop();
//20426 fld dword ptr [0x101560]
S.push(ldf32((0x101560|0)));
//2042c fld dword ptr [ebp - 0xe8]
S.push(ldf32((R.ebp - 0xe8|0)));
//20432 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20434 fstp dword ptr [ebp - 0xe8]
stf32((R.ebp - 0xe8|0),S[S.length-1]);S.pop();
//2043a fld dword ptr [ebp - 0xe4]
S.push(ldf32((R.ebp - 0xe4|0)));
//20440 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20442 fstp dword ptr [ebp - 0xe4]
stf32((R.ebp - 0xe4|0),S[S.length-1]);S.pop();
//20448 fld dword ptr [ebp - 0xe0]
S.push(ldf32((R.ebp - 0xe0|0)));
//2044e fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20450 fstp dword ptr [ebp - 0xe0]
stf32((R.ebp - 0xe0|0),S[S.length-1]);S.pop();
//20456 fld dword ptr [ebp - 0x118]
S.push(ldf32((R.ebp - 0x118|0)));
//2045c fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//2045e fstp dword ptr [ebp - 0x118]
stf32((R.ebp - 0x118|0),S[S.length-1]);S.pop();
//20464 fld dword ptr [ebp - 0x114]
S.push(ldf32((R.ebp - 0x114|0)));
//2046a fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//2046c fstp dword ptr [ebp - 0x114]
stf32((R.ebp - 0x114|0),S[S.length-1]);S.pop();
//20472 fmul dword ptr [ebp - 0x110]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0x110|0)));
//20478 mov eax, dword ptr [ebp - 0x1c0]
R.eax=ld32((R.ebp - 0x1c0|0));
//2047e mov esi, dword ptr [ebp - 0x34]
R.esi=ld32((R.ebp - 0x34|0));
//20481 mov dword ptr [ebp - 0x124], eax
st32((R.ebp - 0x124|0),R.eax);
//20487 mov eax, dword ptr [ebp - 0x1bc]
R.eax=ld32((R.ebp - 0x1bc|0));
//2048d xor edx, ebx
R.edx=(R.edx ^ R.ebx)|0;flags_zf=+(R.edx===0);flags_sf=+(R.edx<0);flags_cf=0;flags_of=0;
//2048f mov dword ptr [ebp - 0x120], eax
st32((R.ebp - 0x120|0),R.eax);
//20495 mov eax, dword ptr [ebp - 0x1b8]
R.eax=ld32((R.ebp - 0x1b8|0));
//2049b xor ecx, ecx
R.ecx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//2049d mov dword ptr [ebp - 0x11c], eax
st32((R.ebp - 0x11c|0),R.eax);
//204a3 mov eax, dword ptr [ebp - 0x1b4]
R.eax=ld32((R.ebp - 0x1b4|0));
//204a9 mov dword ptr [ebp - 0x2c], edx
st32((R.ebp - 0x2c|0),R.edx);
//204ac mov dword ptr [ebp - 0x160], eax
st32((R.ebp - 0x160|0),R.eax);
//204b2 mov eax, dword ptr [ebp - 0x1b0]
R.eax=ld32((R.ebp - 0x1b0|0));
//204b8 mov dword ptr [ebp - 0x38], ecx
st32((R.ebp - 0x38|0),R.ecx);
//204bb mov dword ptr [ebp - 0x15c], eax
st32((R.ebp - 0x15c|0),R.eax);
//204c1 mov eax, dword ptr [ebp - 0x1ac]
R.eax=ld32((R.ebp - 0x1ac|0));
//204c7 add esi, 0x2c
R.esi=(R.esi + (44|0))|0;flags_zf=+(R.esi===0);flags_sf=+(R.esi<0);
//204ca mov dword ptr [ebp - 0x158], eax
st32((R.ebp - 0x158|0),R.eax);
//204d0 fstp dword ptr [ebp - 0x110]
stf32((R.ebp - 0x110|0),S[S.length-1]);S.pop();
/*fall*/ pc=0x204d6;
case 0x204d6:
//204d6 fld dword ptr [ebp - 0x160]
S.push(ldf32((R.ebp - 0x160|0)));
//204dc fsub dword ptr [ebp - 0x124]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x124|0)));
//204e2 fstp dword ptr [ebp - 0x154]
stf32((R.ebp - 0x154|0),S[S.length-1]);S.pop();
//204e8 fld dword ptr [ebp - 0x15c]
S.push(ldf32((R.ebp - 0x15c|0)));
//204ee fsub dword ptr [ebp - 0x120]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x120|0)));
//204f4 fstp dword ptr [ebp - 0x150]
stf32((R.ebp - 0x150|0),S[S.length-1]);S.pop();
//204fa fld dword ptr [ebp - 0x158]
S.push(ldf32((R.ebp - 0x158|0)));
//20500 fsub dword ptr [ebp - 0x11c]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x11c|0)));
//20506 fstp dword ptr [ebp - 0x14c]
stf32((R.ebp - 0x14c|0),S[S.length-1]);S.pop();
//2050c fld dword ptr [0x101564]
S.push(ldf32((0x101564|0)));
//20512 fld dword ptr [ebp - 0x154]
S.push(ldf32((R.ebp - 0x154|0)));
//20518 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//2051a fstp dword ptr [ebp - 0x154]
stf32((R.ebp - 0x154|0),S[S.length-1]);S.pop();
//20520 fld dword ptr [ebp - 0x150]
S.push(ldf32((R.ebp - 0x150|0)));
//20526 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20528 fstp dword ptr [ebp - 0x150]
stf32((R.ebp - 0x150|0),S[S.length-1]);S.pop();
//2052e fmul dword ptr [ebp - 0x14c]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0x14c|0)));
//20534 mov eax, dword ptr [ebp - 0x124]
R.eax=ld32((R.ebp - 0x124|0));
//2053a mov edi, dword ptr [ebp - 0x2c]
R.edi=ld32((R.ebp - 0x2c|0));
//2053d xor ebx, ebx
R.ebx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//2053f mov dword ptr [ebp - 0x100], eax
st32((R.ebp - 0x100|0),R.eax);
//20545 mov dword ptr [ebp - 0x28], ebx
st32((R.ebp - 0x28|0),R.ebx);
//20548 shl edi, 2
R.edi=(R.edi<<(2|0))|0;
//2054b mov eax, dword ptr [ebp - 0x120]
R.eax=ld32((R.ebp - 0x120|0));
//20551 mov ebx, dword ptr [ebp - 0x2c]
R.ebx=ld32((R.ebp - 0x2c|0));
//20554 mov dword ptr [ebp - 0xfc], eax
st32((R.ebp - 0xfc|0),R.eax);
//2055a mov eax, dword ptr [ebp - 0x11c]
R.eax=ld32((R.ebp - 0x11c|0));
//20560 shl ebx, 3
R.ebx=(R.ebx<<(3|0))|0;
//20563 mov dword ptr [ebp - 0xf8], eax
st32((R.ebp - 0xf8|0),R.eax);
//20569 fstp dword ptr [ebp - 0x14c]
stf32((R.ebp - 0x14c|0),S[S.length-1]);S.pop();
/*fall*/ pc=0x2056f;
case 0x2056f:
//2056f fld dword ptr [ebp - 0x100]
S.push(ldf32((R.ebp - 0x100|0)));
//20575 fsub dword ptr [esi]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.esi|0)));
//20577 fstp dword ptr [ebp - 0xf4]
stf32((R.ebp - 0xf4|0),S[S.length-1]);S.pop();
//2057d fld dword ptr [ebp - 0xfc]
S.push(ldf32((R.ebp - 0xfc|0)));
//20583 fsub dword ptr [esi + 4]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.esi + 4|0)));
//20586 fstp dword ptr [ebp - 0xf0]
stf32((R.ebp - 0xf0|0),S[S.length-1]);S.pop();
//2058c fld dword ptr [ebp - 0xf8]
S.push(ldf32((R.ebp - 0xf8|0)));
//20592 fsub dword ptr [esi + 8]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.esi + 8|0)));
//20595 fstp dword ptr [ebp - 0xec]
stf32((R.ebp - 0xec|0),S[S.length-1]);S.pop();
//2059b fld dword ptr [ebp - 0xf0]
S.push(ldf32((R.ebp - 0xf0|0)));
//205a1 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//205a3 fld dword ptr [ebp - 0xf4]
S.push(ldf32((R.ebp - 0xf4|0)));
//205a9 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//205ab faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//205ad fld dword ptr [ebp - 0xec]
S.push(ldf32((R.ebp - 0xec|0)));
//205b3 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//205b5 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//205b7 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//205b9 fld1
S.push(1);
//205bb fdivrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)/(a);S.pop();}
//205bd fld dword ptr [ebp - 0xf4]
S.push(ldf32((R.ebp - 0xf4|0)));
//205c3 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//205c5 fstp dword ptr [ebp - 0xf4]
stf32((R.ebp - 0xf4|0),S[S.length-1]);S.pop();
//205cb fld dword ptr [ebp - 0xf0]
S.push(ldf32((R.ebp - 0xf0|0)));
//205d1 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//205d3 fstp dword ptr [ebp - 0xf0]
stf32((R.ebp - 0xf0|0),S[S.length-1]);S.pop();
//205d9 fmul dword ptr [ebp - 0xec]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xec|0)));
//205df fstp dword ptr [ebp - 0xec]
stf32((R.ebp - 0xec|0),S[S.length-1]);S.pop();
//205e5 fld dword ptr [ebp - 0xf4]
S.push(ldf32((R.ebp - 0xf4|0)));
//205eb mov eax, dword ptr [esi]
R.eax=ld32((R.esi|0));
//205ed fmul dword ptr [ebp - 0xf4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf4|0)));
//205f3 mov dword ptr [ebp - 0x148], eax
st32((R.ebp - 0x148|0),R.eax);
//205f9 fstp qword ptr [ebp - 0xb8]
stf64((R.ebp - 0xb8|0),S[S.length-1]);S.pop();
//205ff fld dword ptr [ebp - 0xf0]
S.push(ldf32((R.ebp - 0xf0|0)));
//20605 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//20607 mov eax, dword ptr [esi + 4]
R.eax=ld32((R.esi + 4|0));
//2060a fld dword ptr [ebp - 0xec]
S.push(ldf32((R.ebp - 0xec|0)));
//20610 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//20612 mov dword ptr [ebp - 0x144], eax
st32((R.ebp - 0x144|0),R.eax);
//20618 fstp qword ptr [ebp - 0xa8]
stf64((R.ebp - 0xa8|0),S[S.length-1]);S.pop();
//2061e fld dword ptr [ebp - 0x148]
S.push(ldf32((R.ebp - 0x148|0)));
//20624 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//20626 mov eax, dword ptr [esi + 8]
R.eax=ld32((R.esi + 8|0));
//20629 fstp qword ptr [ebp - 0xa0]
stf64((R.ebp - 0xa0|0),S[S.length-1]);S.pop();
//2062f fld dword ptr [ebp - 0x144]
S.push(ldf32((R.ebp - 0x144|0)));
//20635 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//20637 mov dword ptr [ebp - 0x140], eax
st32((R.ebp - 0x140|0),R.eax);
//2063d fld dword ptr [ebp - 0x140]
S.push(ldf32((R.ebp - 0x140|0)));
//20643 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//20645 fstp qword ptr [ebp - 0x98]
stf64((R.ebp - 0x98|0),S[S.length-1]);S.pop();
//2064b fld st(1)
S.push(S[S.length-1-1]);
//2064d fmul qword ptr [0x101568]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101568|0)));
//20653 fmul st(2)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-2]);
//20655 fstp qword ptr [ebp - 0x80]
stf64((R.ebp - 0x80|0),S[S.length-1]);S.pop();
//20658 fld qword ptr [0x101570]
S.push(ldf64((0x101570|0)));
//2065e fld st(2)
S.push(S[S.length-1-2]);
//20660 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20662 fld dword ptr [ebp - 0xf0]
S.push(ldf32((R.ebp - 0xf0|0)));
//20668 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//2066a fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//2066c fld dword ptr [ebp - 0x144]
S.push(ldf32((R.ebp - 0x144|0)));
//20672 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20674 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20676 fstp qword ptr [ebp - 0xd0]
stf64((R.ebp - 0xd0|0),S[S.length-1]);S.pop();
//2067c fxch st(4)
{const t=S[S.length-1-4];S[S.length-1-4]=S[S.length-1];S[S.length-1]=t;}
//2067e fmul qword ptr [0x101578]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101578|0)));
//20684 fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//20686 fsub qword ptr [ebp - 0xb8]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.ebp - 0xb8|0)));
//2068c fsub qword ptr [ebp - 0xa8]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.ebp - 0xa8|0)));
//20692 fstp qword ptr [ebp - 0x88]
stf64((R.ebp - 0x88|0),S[S.length-1]);S.pop();
//20698 fld dword ptr [ebp - 0xec]
S.push(ldf32((R.ebp - 0xec|0)));
//2069e fmul qword ptr [0x101580]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101580|0)));
//206a4 fmul dword ptr [ebp - 0x140]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0x140|0)));
//206aa fld dword ptr [ebp - 0xf4]
S.push(ldf32((R.ebp - 0xf4|0)));
//206b0 fmul qword ptr [0x101588]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101588|0)));
//206b6 fmul dword ptr [ebp - 0x148]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0x148|0)));
//206bc fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//206be fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//206c0 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//206c2 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//206c4 fmul st(2)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-2]);
//206c6 fmulp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(a)*(b);S.pop();}
//206c8 faddp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)+(b);S.pop();}
//206ca fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//206cc fstp qword ptr [ebp - 0x78]
stf64((R.ebp - 0x78|0),S[S.length-1]);S.pop();
//206cf fld st(0)
S.push(S[S.length-1-0]);
//206d1 fmul qword ptr [0x101568]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101568|0)));
//206d7 mov eax, dword ptr [ebp - 0xf4]
R.eax=ld32((R.ebp - 0xf4|0));
//206dd fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//206df mov dword ptr [ebp - 0x10c], eax
st32((R.ebp - 0x10c|0),R.eax);
//206e5 mov eax, dword ptr [ebp - 0xf0]
R.eax=ld32((R.ebp - 0xf0|0));
//206eb fld qword ptr [ebp - 0x98]
S.push(ldf64((R.ebp - 0x98|0)));
//206f1 fchs
S[S.length-1]=-S[S.length-1];
//206f3 fsub qword ptr [ebp - 0xa0]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.ebp - 0xa0|0)));
//206f9 mov dword ptr [ebp - 0x108], eax
st32((R.ebp - 0x108|0),R.eax);
//206ff faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//20701 mov eax, dword ptr [ebp - 0xec]
R.eax=ld32((R.ebp - 0xec|0));
//20707 fadd qword ptr [0x1015d8]
S[S.length-1]=(S[S.length-1-0])+(ldf64((0x1015d8|0)));
//2070d mov dword ptr [ebp - 0x104], eax
st32((R.ebp - 0x104|0),R.eax);
//20713 fstp qword ptr [ebp - 0x70]
stf64((R.ebp - 0x70|0),S[S.length-1]);S.pop();
//20716 fld qword ptr [ebp - 0x80]
S.push(ldf64((R.ebp - 0x80|0)));
//20719 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//2071b fcomp qword ptr [0x1015e0]
{const a=S[S.length-1],b=ldf64((0x1015e0|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//20721 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//20723 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//20724 ja 0x20b1a
if(!flags_cf&&!flags_zf){pc=0x20b1a;continue;}
//2072a fld qword ptr [ebp - 0xd0]
S.push(ldf64((R.ebp - 0xd0|0)));
//20730 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//20732 fcomp qword ptr [0x1015e0]
{const a=S[S.length-1],b=ldf64((0x1015e0|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//20738 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//2073a sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//2073b jbe 0x20b64
if(flags_cf||flags_zf){pc=0x20b64;continue;}
//20741 fld1
S.push(1);
//20743 fdiv qword ptr [ebp - 0xd0]
S[S.length-1]=(S[S.length-1-0])/(ldf64((R.ebp - 0xd0|0)));
//20749 fld qword ptr [ebp - 0x70]
S.push(ldf64((R.ebp - 0x70|0)));
//2074c fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//2074e sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20751 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20754 fld qword ptr [ebp - 0x78]
S.push(ldf64((R.ebp - 0x78|0)));
//20757 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20759 sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//2075c fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//2075f fmul qword ptr [ebp - 0x88]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0x88|0)));
//20765 lea edx, [ebp - 0x190]
R.edx=(R.ebp - 0x190|0);
//2076b sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//2076e mov eax, 0x126c6c
R.eax=(1207404|0);
//20773 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20776 call 0x355c4
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x355c4]();
/*fall*/ pc=0x2077b;
case 0x2077b:
//2077b mov edx, 0xe7ff0000
R.edx=(3892248576|0);
//20780 mov ecx, 0x42374876
R.ecx=(1110919286|0);
//20785 mov dword ptr [ebp - 0x60], edx
st32((R.ebp - 0x60|0),R.edx);
//20788 mov dword ptr [ebp - 0x5c], ecx
st32((R.ebp - 0x5c|0),R.ecx);
//2078b test eax, eax
{const r=(R.eax)&(R.eax);flags_zf=+(r===0);flags_sf=+(r<0);flags_cf=0;flags_of=0;}
//2078d jle 0x207d0
if(flags_zf||flags_sf!==flags_of){pc=0x207d0;continue;}
//2078f lea ecx, [eax*8]
R.ecx=(R.eax*8|0);
//20796 xor edx, edx
R.edx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
/*fall*/ pc=0x20798;
case 0x20798:
//20798 fld qword ptr [edx + ebp - 0x190]
S.push(ldf64((R.edx + R.ebp - 0x190|0)));
//2079f fcomp qword ptr [ebp - 0x60]
{const a=S[S.length-1],b=ldf64((R.ebp - 0x60|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//207a2 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//207a4 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//207a5 jae 0x207c9
if(!flags_cf){pc=0x207c9;continue;}
//207a7 fldz
S.push(0);
//207a9 fcomp qword ptr [edx + ebp - 0x190]
{const a=S[S.length-1],b=ldf64((R.edx + R.ebp - 0x190|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//207b0 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//207b2 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//207b3 jae 0x207c9
if(!flags_cf){pc=0x207c9;continue;}
//207b5 mov eax, dword ptr [edx + ebp - 0x190]
R.eax=ld32((R.edx + R.ebp - 0x190|0));
//207bc mov dword ptr [ebp - 0x60], eax
st32((R.ebp - 0x60|0),R.eax);
//207bf mov eax, dword ptr [edx + ebp - 0x18c]
R.eax=ld32((R.edx + R.ebp - 0x18c|0));
//207c6 mov dword ptr [ebp - 0x5c], eax
st32((R.ebp - 0x5c|0),R.eax);
/*fall*/ pc=0x207c9;
case 0x207c9:
//207c9 add edx, 8
R.edx=(R.edx + (8|0))|0;flags_zf=+(R.edx===0);flags_sf=+(R.edx<0);
//207cc cmp edx, ecx
flags_cf=+((R.edx>>>0)<(R.ecx>>>0));flags_zf=+((R.edx)===(R.ecx));{const r=(R.edx-R.ecx)|0;flags_sf=+(r<0);flags_of=+((((R.edx)^(R.ecx))&((R.edx)^r))<0);}
//207ce jl 0x20798
if(flags_sf!==flags_of){pc=0x20798;continue;}
/*fall*/ pc=0x207d0;
case 0x207d0:
//207d0 fld qword ptr [ebp - 0x60]
S.push(ldf64((R.ebp - 0x60|0)));
//207d3 fst dword ptr [ebp - 0x4c]
stf32((R.ebp - 0x4c|0),S[S.length-1]);
//207d6 fmul dword ptr [ebp - 0xf4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf4|0)));
//207dc fadd dword ptr [ebp - 0x100]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x100|0)));
//207e2 fld dword ptr [ebp - 0x4c]
S.push(ldf32((R.ebp - 0x4c|0)));
//207e5 fmul dword ptr [ebp - 0xf0]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf0|0)));
//207eb fadd dword ptr [ebp - 0xfc]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xfc|0)));
//207f1 fstp dword ptr [ebp - 0x20]
stf32((R.ebp - 0x20|0),S[S.length-1]);S.pop();
//207f4 fld dword ptr [ebp - 0x4c]
S.push(ldf32((R.ebp - 0x4c|0)));
//207f7 fmul dword ptr [ebp - 0xec]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xec|0)));
//207fd fadd dword ptr [ebp - 0xf8]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xf8|0)));
//20803 fld st(0)
S.push(S[S.length-1-0]);
//20805 fld st(2)
S.push(S[S.length-1-2]);
//20807 call 0x34d81
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x34d81]();
//2080c fmul qword ptr [0x101590]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101590|0)));
//20812 fmul qword ptr [0x101598]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101598|0)));
//20818 fstp dword ptr [ebp - 0x50]
stf32((R.ebp - 0x50|0),S[S.length-1]);S.pop();
//2081b fld st(1)
S.push(S[S.length-1-1]);
//2081d fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//2081f fmul st(0), st(0)
S[S.length-1-0]=(S[S.length-1-0])*(S[S.length-1-0]);
//20821 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//20823 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//20825 fmul qword ptr [0x1015a0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015a0|0)));
//2082b fstp dword ptr [ebp - 0x44]
stf32((R.ebp - 0x44|0),S[S.length-1]);S.pop();
//2082e fld dword ptr [ebp - 0x50]
S.push(ldf32((R.ebp - 0x50|0)));
//20831 push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20832 fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//20835 pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20836 fld dword ptr [ebp - 0x44]
S.push(ldf32((R.ebp - 0x44|0)));
//20839 mov edx, eax
R.edx=R.eax;
//2083b push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//2083c fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//2083f pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20840 mov ecx, dword ptr [0x10eb9c]
R.ecx=ld32((0x10eb9c|0));
//20846 shl ecx, 0x10
R.ecx=(R.ecx<<(16|0))|0;
//20849 sub eax, ecx
R.eax=(R.eax - R.ecx)|0;flags_zf=+(R.eax===0);flags_sf=+(R.eax<0);
//2084b mov dword ptr [ebp - 0x30], eax
st32((R.ebp - 0x30|0),R.eax);
//2084e mov eax, dword ptr [ebp - 0x34]
R.eax=ld32((R.ebp - 0x34|0));
//20851 fld dword ptr [eax + 0x30]
S.push(ldf32((R.eax + 0x30|0)));
//20854 fsub dword ptr [ebp - 0x20]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.ebp - 0x20|0)));
//20857 fmul st(0), st(0)
S[S.length-1-0]=(S[S.length-1-0])*(S[S.length-1-0]);
//20859 fld dword ptr [ebp - 0x4c]
S.push(ldf32((R.ebp - 0x4c|0)));
//2085c fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//2085e fsubr qword ptr [0x1015e8]
S[S.length-1]=(ldf64((0x1015e8|0)))-(S[S.length-1-0]);
//20864 fadd qword ptr [0x1015f0]
S[S.length-1]=(S[S.length-1-0])+(ldf64((0x1015f0|0)));
//2086a fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//2086c fmul qword ptr [0x1015a8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015a8|0)));
//20872 fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//20874 fst dword ptr [ebp - 0x18]
stf32((R.ebp - 0x18|0),S[S.length-1]);
//20877 fldz
S.push(0);
//20879 fcompp
{const a=S[S.length-1],b=S[S.length-1-1];fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();S.pop();
//2087b fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//2087d sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//2087e jb 0x20887
if(flags_cf){pc=0x20887;continue;}
//20880 mov dword ptr [ebp - 0x18], 0x3f800000
st32((R.ebp - 0x18|0),(1065353216|0));
/*fall*/ pc=0x20887;
case 0x20887:
//20887 fld dword ptr [ebp - 0x18]
S.push(ldf32((R.ebp - 0x18|0)));
//2088a fcomp qword ptr [0x1015e8]
{const a=S[S.length-1],b=ldf64((0x1015e8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//20890 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//20892 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//20893 jb 0x2089c
if(flags_cf){pc=0x2089c;continue;}
//20895 mov dword ptr [ebp - 0x18], 0x48afc800
st32((R.ebp - 0x18|0),(1219479552|0));
/*fall*/ pc=0x2089c;
case 0x2089c:
//2089c fld dword ptr [ebp - 0x18]
S.push(ldf32((R.ebp - 0x18|0)));
//2089f fmul qword ptr [0x1015b0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015b0|0)));
//208a5 fmul qword ptr [0x1015b8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015b8|0)));
//208ab push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//208ac fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//208af pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//208b0 shl eax, 8
R.eax=(R.eax<<(8|0))|0;
//208b3 cmp eax, 0x3f800000
flags_cf=+((R.eax>>>0)<((1065353216|0)>>>0));flags_zf=+((R.eax)===((1065353216|0)));{const r=(R.eax-(1065353216|0))|0;flags_sf=+(r<0);flags_of=+((((R.eax)^((1065353216|0)))&((R.eax)^r))<0);}
//208b8 jle 0x20baf
if(flags_zf||flags_sf!==flags_of){pc=0x20baf;continue;}
//208be mov eax, 0x3f800000
R.eax=(1065353216|0);
/*fall*/ pc=0x208c3;
case 0x208c3:
//208c3 fldz
S.push(0);
//208c5 fmul dword ptr [ebp - 0xf0]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf0|0)));
//208cb fldz
S.push(0);
//208cd fmul dword ptr [ebp - 0xf4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf4|0)));
//208d3 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//208d5 fldz
S.push(0);
//208d7 fmul dword ptr [ebp - 0xec]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xec|0)));
//208dd faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//208df fmul qword ptr [0x101588]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101588|0)));
//208e5 mov dword ptr [edi + 0x1218f0], eax
st32((R.edi + 0x1218f0|0),R.eax);
//208eb mov eax, dword ptr [ebp - 0x30]
R.eax=ld32((R.ebp - 0x30|0));
//208ee push 0xc10e8480
R.esp=(R.esp-4)|0;st32(R.esp,(3238954112|0));
//208f3 shl eax, 8
R.eax=(R.eax<<(8|0))|0;
//208f6 shl edx, 9
R.edx=(R.edx<<(9|0))|0;
//208f9 mov dword ptr [ebx + 0x12299c], eax
st32((R.ebx + 0x12299c|0),R.eax);
//208ff xor eax, eax
R.eax=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//20901 mov dword ptr [ebx + 0x122998], edx
st32((R.ebx + 0x122998|0),R.edx);
//20907 mov dword ptr [ebp - 0xdc], eax
st32((R.ebp - 0xdc|0),R.eax);
//2090d mov dword ptr [ebp - 0xd8], eax
st32((R.ebp - 0xd8|0),R.eax);
//20913 mov dword ptr [ebp - 0xd4], eax
st32((R.ebp - 0xd4|0),R.eax);
//20919 mov dword ptr [ebp - 0x13c], eax
st32((R.ebp - 0x13c|0),R.eax);
//2091f mov dword ptr [ebp - 0x138], eax
st32((R.ebp - 0x138|0),R.eax);
//20925 mov dword ptr [ebp - 0x134], eax
st32((R.ebp - 0x134|0),R.eax);
//2092b mov eax, dword ptr [ebp - 0xf4]
R.eax=ld32((R.ebp - 0xf4|0));
//20931 xor edx, edx
R.edx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//20933 mov dword ptr [ebp - 0x130], eax
st32((R.ebp - 0x130|0),R.eax);
//20939 mov eax, dword ptr [ebp - 0xf0]
R.eax=ld32((R.ebp - 0xf0|0));
//2093f push edx
R.esp=(R.esp-4)|0;st32(R.esp,R.edx);
//20940 mov dword ptr [ebp - 0x12c], eax
st32((R.ebp - 0x12c|0),R.eax);
//20946 mov eax, dword ptr [ebp - 0xec]
R.eax=ld32((R.ebp - 0xec|0));
//2094c fstp qword ptr [ebp - 0xc0]
stf64((R.ebp - 0xc0|0),S[S.length-1]);S.pop();
//20952 mov dword ptr [ebp - 0x128], eax
st32((R.ebp - 0x128|0),R.eax);
//20958 mov eax, dword ptr [ebp - 0xbc]
R.eax=ld32((R.ebp - 0xbc|0));
//2095e push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//2095f mov edx, dword ptr [ebp - 0xc0]
R.edx=ld32((R.ebp - 0xc0|0));
//20965 mov eax, 0x126c6c
R.eax=(1207404|0);
//2096a push edx
R.esp=(R.esp-4)|0;st32(R.esp,R.edx);
//2096b lea edx, [ebp - 0x170]
R.edx=(R.ebp - 0x170|0);
//20971 xor ecx, ecx
R.ecx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//20973 call 0x35548
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x35548]();
//20978 xor edx, edx
R.edx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//2097a mov dword ptr [ebp - 0x58], ecx
st32((R.ebp - 0x58|0),R.ecx);
//2097d mov dword ptr [ebp - 0x54], edx
st32((R.ebp - 0x54|0),R.edx);
//20980 test eax, eax
{const r=(R.eax)&(R.eax);flags_zf=+(r===0);flags_sf=+(r<0);flags_cf=0;flags_of=0;}
//20982 jle 0x209c3
if(flags_zf||flags_sf!==flags_of){pc=0x209c3;continue;}
//20984 lea ecx, [eax*8]
R.ecx=(R.eax*8|0);
/*fall*/ pc=0x2098b;
case 0x2098b:
//2098b fld qword ptr [edx + ebp - 0x170]
S.push(ldf64((R.edx + R.ebp - 0x170|0)));
//20992 fcomp qword ptr [ebp - 0x58]
{const a=S[S.length-1],b=ldf64((R.ebp - 0x58|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//20995 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//20997 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//20998 jbe 0x209bc
if(flags_cf||flags_zf){pc=0x209bc;continue;}
//2099a fldz
S.push(0);
//2099c fcomp qword ptr [edx + ebp - 0x170]
{const a=S[S.length-1],b=ldf64((R.edx + R.ebp - 0x170|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//209a3 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//209a5 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//209a6 jae 0x209bc
if(!flags_cf){pc=0x209bc;continue;}
//209a8 mov eax, dword ptr [edx + ebp - 0x170]
R.eax=ld32((R.edx + R.ebp - 0x170|0));
//209af mov dword ptr [ebp - 0x58], eax
st32((R.ebp - 0x58|0),R.eax);
//209b2 mov eax, dword ptr [edx + ebp - 0x16c]
R.eax=ld32((R.edx + R.ebp - 0x16c|0));
//209b9 mov dword ptr [ebp - 0x54], eax
st32((R.ebp - 0x54|0),R.eax);
/*fall*/ pc=0x209bc;
case 0x209bc:
//209bc add edx, 8
R.edx=(R.edx + (8|0))|0;flags_zf=+(R.edx===0);flags_sf=+(R.edx<0);
//209bf cmp edx, ecx
flags_cf=+((R.edx>>>0)<(R.ecx>>>0));flags_zf=+((R.edx)===(R.ecx));{const r=(R.edx-R.ecx)|0;flags_sf=+(r<0);flags_of=+((((R.edx)^(R.ecx))&((R.edx)^r))<0);}
//209c1 jl 0x2098b
if(flags_sf!==flags_of){pc=0x2098b;continue;}
/*fall*/ pc=0x209c3;
case 0x209c3:
//209c3 fld qword ptr [ebp - 0x58]
S.push(ldf64((R.ebp - 0x58|0)));
//209c6 fld st(0)
S.push(S[S.length-1-0]);
//209c8 fmul dword ptr [ebp - 0xf4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf4|0)));
//209ce fadd dword ptr [ebp - 0x100]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x100|0)));
//209d4 fld st(1)
S.push(S[S.length-1-1]);
//209d6 fmul dword ptr [ebp - 0xf0]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xf0|0)));
//209dc fadd dword ptr [ebp - 0xfc]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xfc|0)));
//209e2 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//209e4 fmul dword ptr [ebp - 0xec]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.ebp - 0xec|0)));
//209ea fadd dword ptr [ebp - 0xf8]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xf8|0)));
//209f0 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//209f2 call 0x34d81
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x34d81]();
//209f7 fmul qword ptr [0x101590]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101590|0)));
//209fd fmul qword ptr [0x101598]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101598|0)));
//20a03 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20a05 fld dword ptr [0x1015c0]
S.push(ldf32((0x1015c0|0)));
//20a0b fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20a0d fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20a0f fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//20a11 fmul qword ptr [0x1015c8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015c8|0)));
//20a17 fmul qword ptr [0x1015d0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x1015d0|0)));
//20a1d mov ecx, dword ptr [ebp - 0x2c]
R.ecx=ld32((R.ebp - 0x2c|0));
//20a20 add edi, 4
R.edi=(R.edi + (4|0))|0;flags_zf=+(R.edi===0);flags_sf=+(R.edi<0);
//20a23 inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//20a24 add ebx, 8
R.ebx=(R.ebx + (8|0))|0;flags_zf=+(R.ebx===0);flags_sf=+(R.ebx<0);
//20a27 mov dword ptr [ebp - 0x2c], ecx
st32((R.ebp - 0x2c|0),R.ecx);
//20a2a fstp dword ptr [ebp - 0x44]
stf32((R.ebp - 0x44|0),S[S.length-1]);S.pop();
//20a2d push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20a2e fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//20a31 pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20a32 fld dword ptr [ebp - 0x44]
S.push(ldf32((R.ebp - 0x44|0)));
//20a35 mov edx, eax
R.edx=R.eax;
//20a37 push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20a38 fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//20a3b pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20a3c fld dword ptr [ebp - 0x100]
S.push(ldf32((R.ebp - 0x100|0)));
//20a42 shl edx, 9
R.edx=(R.edx<<(9|0))|0;
//20a45 shl eax, 9
R.eax=(R.eax<<(9|0))|0;
//20a48 mov dword ptr [ebx + 0x124ae0], edx
st32((R.ebx + 0x124ae0|0),R.edx);
//20a4e fadd dword ptr [ebp - 0x154]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x154|0)));
//20a54 mov dword ptr [ebx + 0x124ae4], eax
st32((R.ebx + 0x124ae4|0),R.eax);
//20a5a fstp dword ptr [ebp - 0x100]
stf32((R.ebp - 0x100|0),S[S.length-1]);S.pop();
//20a60 fld dword ptr [ebp - 0xfc]
S.push(ldf32((R.ebp - 0xfc|0)));
//20a66 mov eax, dword ptr [ebp - 0x28]
R.eax=ld32((R.ebp - 0x28|0));
//20a69 fadd dword ptr [ebp - 0x150]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x150|0)));
//20a6f inc eax
R.eax=(R.eax+1)|0;flags_zf=+(R.eax===0);flags_sf=+(R.eax<0);
//20a70 fstp dword ptr [ebp - 0xfc]
stf32((R.ebp - 0xfc|0),S[S.length-1]);S.pop();
//20a76 fld dword ptr [ebp - 0xf8]
S.push(ldf32((R.ebp - 0xf8|0)));
//20a7c fadd dword ptr [ebp - 0x14c]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x14c|0)));
//20a82 mov dword ptr [ebp - 0x28], eax
st32((R.ebp - 0x28|0),R.eax);
//20a85 fstp dword ptr [ebp - 0xf8]
stf32((R.ebp - 0xf8|0),S[S.length-1]);S.pop();
//20a8b cmp eax, 0x29
flags_cf=+((R.eax>>>0)<((41|0)>>>0));flags_zf=+((R.eax)===((41|0)));{const r=(R.eax-(41|0))|0;flags_sf=+(r<0);flags_of=+((((R.eax)^((41|0)))&((R.eax)^r))<0);}
//20a8e jl 0x2056f
if(flags_sf!==flags_of){pc=0x2056f;continue;}
//20a94 fld dword ptr [ebp - 0x124]
S.push(ldf32((R.ebp - 0x124|0)));
//20a9a fadd dword ptr [ebp - 0xe8]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xe8|0)));
//20aa0 fstp dword ptr [ebp - 0x124]
stf32((R.ebp - 0x124|0),S[S.length-1]);S.pop();
//20aa6 fld dword ptr [ebp - 0x120]
S.push(ldf32((R.ebp - 0x120|0)));
//20aac fadd dword ptr [ebp - 0xe4]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xe4|0)));
//20ab2 fstp dword ptr [ebp - 0x120]
stf32((R.ebp - 0x120|0),S[S.length-1]);S.pop();
//20ab8 fld dword ptr [ebp - 0x11c]
S.push(ldf32((R.ebp - 0x11c|0)));
//20abe fadd dword ptr [ebp - 0xe0]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0xe0|0)));
//20ac4 fstp dword ptr [ebp - 0x11c]
stf32((R.ebp - 0x11c|0),S[S.length-1]);S.pop();
//20aca fld dword ptr [ebp - 0x160]
S.push(ldf32((R.ebp - 0x160|0)));
//20ad0 fadd dword ptr [ebp - 0x118]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x118|0)));
//20ad6 mov ecx, dword ptr [ebp - 0x38]
R.ecx=ld32((R.ebp - 0x38|0));
//20ad9 fstp dword ptr [ebp - 0x160]
stf32((R.ebp - 0x160|0),S[S.length-1]);S.pop();
//20adf fld dword ptr [ebp - 0x15c]
S.push(ldf32((R.ebp - 0x15c|0)));
//20ae5 fadd dword ptr [ebp - 0x114]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x114|0)));
//20aeb inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//20aec fstp dword ptr [ebp - 0x15c]
stf32((R.ebp - 0x15c|0),S[S.length-1]);S.pop();
//20af2 fld dword ptr [ebp - 0x158]
S.push(ldf32((R.ebp - 0x158|0)));
//20af8 fadd dword ptr [ebp - 0x110]
S[S.length-1]=(S[S.length-1-0])+(ldf32((R.ebp - 0x110|0)));
//20afe mov dword ptr [ebp - 0x38], ecx
st32((R.ebp - 0x38|0),R.ecx);
//20b01 fstp dword ptr [ebp - 0x158]
stf32((R.ebp - 0x158|0),S[S.length-1]);S.pop();
//20b07 cmp ecx, 0x1a
flags_cf=+((R.ecx>>>0)<((26|0)>>>0));flags_zf=+((R.ecx)===((26|0)));{const r=(R.ecx-(26|0))|0;flags_sf=+(r<0);flags_of=+((((R.ecx)^((26|0)))&((R.ecx)^r))<0);}
//20b0a jl 0x204d6
if(flags_sf!==flags_of){pc=0x204d6;continue;}
//20b10 lea esp, [ebp - 0x14]
R.esp=(R.ebp - 0x14|0);
//20b13 pop edi
R.edi=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b14 pop esi
R.esi=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b15 pop edx
R.edx=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b16 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b17 pop ebx
R.ebx=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b18 pop ebp
R.ebp=ld32(R.esp);R.esp=(R.esp+4)|0;
//20b19 ret
R.esp=(R.esp+4+0)|0;return;
/*fall*/ pc=0x20b1a;
case 0x20b1a:
//20b1a fld1
S.push(1);
//20b1c fdiv qword ptr [ebp - 0x80]
S[S.length-1]=(S[S.length-1-0])/(ldf64((R.ebp - 0x80|0)));
//20b1f fld qword ptr [ebp - 0x70]
S.push(ldf64((R.ebp - 0x70|0)));
//20b22 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20b24 sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b27 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20b2a fld qword ptr [ebp - 0x78]
S.push(ldf64((R.ebp - 0x78|0)));
//20b2d fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20b2f sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b32 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20b35 fld qword ptr [ebp - 0x88]
S.push(ldf64((R.ebp - 0x88|0)));
//20b3b fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20b3d sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b40 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20b43 fmul qword ptr [ebp - 0xd0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0xd0|0)));
//20b49 lea edx, [ebp - 0x190]
R.edx=(R.ebp - 0x190|0);
//20b4f sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b52 mov eax, 0x126c6c
R.eax=(1207404|0);
//20b57 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20b5a call 0x357f8
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x357f8]();
//20b5f jmp 0x2077b
pc=0x2077b;continue;
/*fall*/ pc=0x20b64;
case 0x20b64:
//20b64 fld qword ptr [ebp - 0x88]
S.push(ldf64((R.ebp - 0x88|0)));
//20b6a fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//20b6c fcomp qword ptr [0x1015e0]
{const a=S[S.length-1],b=ldf64((0x1015e0|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//20b72 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//20b74 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//20b75 ja 0x20b7e
if(!flags_cf&&!flags_zf){pc=0x20b7e;continue;}
//20b77 xor eax, eax
R.eax=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//20b79 jmp 0x2077b
pc=0x2077b;continue;
/*fall*/ pc=0x20b7e;
case 0x20b7e:
//20b7e fld1
S.push(1);
//20b80 fdiv qword ptr [ebp - 0x88]
S[S.length-1]=(S[S.length-1-0])/(ldf64((R.ebp - 0x88|0)));
//20b86 fld qword ptr [ebp - 0x70]
S.push(ldf64((R.ebp - 0x70|0)));
//20b89 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//20b8b sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b8e fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20b91 fmul qword ptr [ebp - 0x78]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0x78|0)));
//20b94 lea edx, [ebp - 0x190]
R.edx=(R.ebp - 0x190|0);
//20b9a sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20b9d mov eax, 0x126c6c
R.eax=(1207404|0);
//20ba2 fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//20ba5 call 0x35548
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x35548]();
//20baa jmp 0x2077b
pc=0x2077b;continue;
/*fall*/ pc=0x20baf;
case 0x20baf:
//20baf cmp eax, 0x1000000
flags_cf=+((R.eax>>>0)<((16777216|0)>>>0));flags_zf=+((R.eax)===((16777216|0)));{const r=(R.eax-(16777216|0))|0;flags_sf=+(r<0);flags_of=+((((R.eax)^((16777216|0)))&((R.eax)^r))<0);}
//20bb4 jge 0x208c3
if(flags_sf===flags_of){pc=0x208c3;continue;}
//20bba mov eax, 0x1000000
R.eax=(16777216|0);
//20bbf jmp 0x208c3
pc=0x208c3;continue;
return;}}}
function f355c4(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x355c4;
for(;;){switch(pc){
case 0x355c4:
//355c4 sub esp, 0x68
R.esp=(R.esp - (104|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//355c7 fld qword ptr [esp + 0x6c]
S.push(ldf64((R.esp + 0x6c|0)));
//355cb fld st(0)
S.push(S[S.length-1-0]);
//355cd fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//355cf fld qword ptr [esp + 0x74]
S.push(ldf64((R.esp + 0x74|0)));
//355d3 fld st(0)
S.push(S[S.length-1-0]);
//355d5 fmul qword ptr [0x102b80]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b80|0)));
//355db fsubrp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(b)-(a);S.pop();}
//355dd fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//355df fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//355e5 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//355e7 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//355e9 fstp qword ptr [esp + 0x48]
stf64((R.esp + 0x48|0),S[S.length-1]);S.pop();
//355ed fld st(2)
S.push(S[S.length-1-2]);
//355ef fmul qword ptr [0x102b88]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b88|0)));
//355f5 fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//355f7 fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//355f9 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//355fb fmul qword ptr [0x102b90]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b90|0)));
//35601 fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//35603 fsubp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)-(b);S.pop();}
//35605 fld qword ptr [esp + 0x7c]
S.push(ldf64((R.esp + 0x7c|0)));
//35609 fmul qword ptr [0x102b98]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b98|0)));
//3560f faddp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)+(b);S.pop();}
//35611 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35613 fld qword ptr [0x104508]
S.push(ldf64((0x104508|0)));
//35619 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//3561b fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//3561d fstp qword ptr [esp + 0x28]
stf64((R.esp + 0x28|0),S[S.length-1]);S.pop();
//35621 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35623 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35625 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35627 fstp qword ptr [esp + 0x50]
stf64((R.esp + 0x50|0),S[S.length-1]);S.pop();
//3562b fmul qword ptr [esp + 0x48]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0x48|0)));
//3562f fmul qword ptr [esp + 0x48]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0x48|0)));
//35633 fmul qword ptr [esp + 0x48]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0x48|0)));
//35637 fld qword ptr [esp + 0x28]
S.push(ldf64((R.esp + 0x28|0)));
//3563b fmul qword ptr [0x102ba0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102ba0|0)));
//35641 fmul qword ptr [esp + 0x28]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0x28|0)));
//35645 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//35647 fst qword ptr [esp + 0x60]
stf64((R.esp + 0x60|0),S[S.length-1]);
//3564b fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//3564d fcomp qword ptr [0x102ba8]
{const a=S[S.length-1],b=ldf64((0x102ba8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35653 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35655 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35656 jbe 0x356e6
if(flags_cf||flags_zf){pc=0x356e6;continue;}
/*fall*/ pc=0x3565c;
case 0x3565c:
//3565c fld qword ptr [esp + 0x28]
S.push(ldf64((R.esp + 0x28|0)));
//35660 fmul qword ptr [0x102bb0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bb0|0)));
//35666 fstp qword ptr [esp + 0x58]
stf64((R.esp + 0x58|0),S[S.length-1]);S.pop();
//3566a fldz
S.push(0);
//3566c fcomp qword ptr [esp + 0x60]
{const a=S[S.length-1],b=ldf64((R.esp + 0x60|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35670 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35672 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35673 jae 0x35725
if(!flags_cf){pc=0x35725;continue;}
//35679 fld qword ptr [esp + 0x60]
S.push(ldf64((R.esp + 0x60|0)));
//3567d fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3567f fst qword ptr [esp + 0x60]
stf64((R.esp + 0x60|0),S[S.length-1]);
//35683 fsub qword ptr [esp + 0x58]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp + 0x58|0)));
//35687 fstp qword ptr [esp + 0x40]
stf64((R.esp + 0x40|0),S[S.length-1]);S.pop();
//3568b fldz
S.push(0);
//3568d fcomp qword ptr [esp + 0x40]
{const a=S[S.length-1],b=ldf64((R.esp + 0x40|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35691 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35693 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35694 ja 0x356f7
if(!flags_cf&&!flags_zf){pc=0x356f7;continue;}
//35696 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//3569c fld qword ptr [esp + 0x40]
S.push(ldf64((R.esp + 0x40|0)));
//356a0 call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
/*fall*/ pc=0x356a5;
case 0x356a5:
//356a5 fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//356a7 fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//356ab fchs
S[S.length-1]=-S[S.length-1];
//356ad fsub qword ptr [esp + 0x60]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp + 0x60|0)));
//356b1 fstp qword ptr [esp + 0x38]
stf64((R.esp + 0x38|0),S[S.length-1]);S.pop();
//356b5 fldz
S.push(0);
//356b7 fcomp qword ptr [esp + 0x38]
{const a=S[S.length-1],b=ldf64((R.esp + 0x38|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//356bb fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//356bd sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//356be ja 0x3570e
if(!flags_cf&&!flags_zf){pc=0x3570e;continue;}
//356c0 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//356c6 fld qword ptr [esp + 0x38]
S.push(ldf64((R.esp + 0x38|0)));
//356ca call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
//356cf fadd qword ptr [edx]
S[S.length-1]=(S[S.length-1-0])+(ldf64((R.edx|0)));
/*fall*/ pc=0x356d1;
case 0x356d1:
//356d1 fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//356d3 fld qword ptr [edx]
S.push(ldf64((R.edx|0)));
//356d5 fsub qword ptr [esp + 0x50]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp + 0x50|0)));
//356d9 mov eax, 1
R.eax=(1|0);
//356de fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//356e0 add esp, 0x68
R.esp=(R.esp + (104|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//356e3 ret 0x18
R.esp=(R.esp+4+24)|0;return;
/*fall*/ pc=0x356e6;
case 0x356e6:
//356e6 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//356e7 xor ecx, ecx
R.ecx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//356e9 mov dword ptr [esp + 0x64], ecx
st32((R.esp + 0x64|0),R.ecx);
//356ed mov dword ptr [esp + 0x68], ecx
st32((R.esp + 0x68|0),R.ecx);
//356f1 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//356f2 jmp 0x3565c
pc=0x3565c;continue;
/*fall*/ pc=0x356f7;
case 0x356f7:
//356f7 fld qword ptr [esp + 0x40]
S.push(ldf64((R.esp + 0x40|0)));
//356fb fchs
S[S.length-1]=-S[S.length-1];
//356fd fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//35703 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35705 call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
//3570a fchs
S[S.length-1]=-S[S.length-1];
//3570c jmp 0x356a5
pc=0x356a5;continue;
/*fall*/ pc=0x3570e;
case 0x3570e:
//3570e fld qword ptr [esp + 0x38]
S.push(ldf64((R.esp + 0x38|0)));
//35712 fchs
S[S.length-1]=-S[S.length-1];
//35714 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//3571a fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//3571c call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
//35721 fsubr qword ptr [edx]
S[S.length-1]=(ldf64((R.edx|0)))-(S[S.length-1-0]);
//35723 jmp 0x356d1
pc=0x356d1;continue;
/*fall*/ pc=0x35725;
case 0x35725:
//35725 jb 0x35799
if(flags_cf){pc=0x35799;continue;}
//35727 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//3572d fld st(0)
S.push(S[S.length-1-0]);
//3572f fchs
S[S.length-1]=-S[S.length-1];
//35731 fmul qword ptr [esp + 0x48]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0x48|0)));
//35735 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//35737 fld qword ptr [esp + 0x60]
S.push(ldf64((R.esp + 0x60|0)));
//3573b fchs
S[S.length-1]=-S[S.length-1];
//3573d fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3573f fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//35743 fchs
S[S.length-1]=-S[S.length-1];
//35745 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35747 call 0x34d81
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x34d81]();
//3574c fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//3574e fld st(1)
S.push(S[S.length-1-1]);
//35750 fcos
S[S.length-1]=Math.cos(S[S.length-1]);
//35752 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//35754 fsin
S[S.length-1]=Math.sin(S[S.length-1]);
//35756 fld st(1)
S.push(S[S.length-1-1]);
//35758 fmul qword ptr [0x102b88]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b88|0)));
//3575e fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//35760 fld qword ptr [esp + 0x50]
S.push(ldf64((R.esp + 0x50|0)));
//35764 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35766 fsub st(1)
S[S.length-1]=(S[S.length-1-0])-(S[S.length-1-1]);
//35768 fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//3576a fld qword ptr [0x21b360]
S.push(ldf64((0x21b360|0)));
//35770 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35772 fld st(3)
S.push(S[S.length-1-3]);
//35774 fadd st(2)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-2]);
//35776 fxch st(3)
{const t=S[S.length-1-3];S[S.length-1-3]=S[S.length-1];S[S.length-1]=t;}
//35778 fchs
S[S.length-1]=-S[S.length-1];
//3577a fxch st(3)
{const t=S[S.length-1-3];S[S.length-1-3]=S[S.length-1];S[S.length-1]=t;}
//3577c fmul st(3)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-3]);
//3577e fsub st(1)
S[S.length-1]=(S[S.length-1-0])-(S[S.length-1-1]);
//35780 fstp qword ptr [edx + 8]
stf64((R.edx + 8|0),S[S.length-1]);S.pop();
//35783 fxch st(3)
{const t=S[S.length-1-3];S[S.length-1-3]=S[S.length-1];S[S.length-1]=t;}
//35785 fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//35787 fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//35789 fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//3578b mov eax, 3
R.eax=(3|0);
//35790 fstp qword ptr [edx + 0x10]
stf64((R.edx + 0x10|0),S[S.length-1]);S.pop();
//35793 add esp, 0x68
R.esp=(R.esp + (104|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35796 ret 0x18
R.esp=(R.esp+4+24)|0;return;
/*fall*/ pc=0x35799;
case 0x35799:
//35799 fldz
S.push(0);
//3579b fcomp qword ptr [esp + 0x58]
{const a=S[S.length-1],b=ldf64((R.esp + 0x58|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//3579f fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//357a1 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//357a2 ja 0x357e3
if(!flags_cf&&!flags_zf){pc=0x357e3;continue;}
//357a4 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//357aa fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//357ae call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
//357b3 fchs
S[S.length-1]=-S[S.length-1];
/*fall*/ pc=0x357b5;
case 0x357b5:
//357b5 fstp qword ptr [esp + 0x30]
stf64((R.esp + 0x30|0),S[S.length-1]);S.pop();
//357b9 fld qword ptr [esp + 0x30]
S.push(ldf64((R.esp + 0x30|0)));
//357bd fld st(0)
S.push(S[S.length-1-0]);
//357bf fmul qword ptr [0x102b88]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b88|0)));
//357c5 fld qword ptr [esp + 0x50]
S.push(ldf64((R.esp + 0x50|0)));
//357c9 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//357cb fsub st(1)
S[S.length-1]=(S[S.length-1-0])-(S[S.length-1-1]);
//357cd fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//357cf fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//357d1 fchs
S[S.length-1]=-S[S.length-1];
//357d3 fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//357d5 mov eax, 2
R.eax=(2|0);
//357da fstp qword ptr [edx + 8]
stf64((R.edx + 8|0),S[S.length-1]);S.pop();
//357dd add esp, 0x68
R.esp=(R.esp + (104|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//357e0 ret 0x18
R.esp=(R.esp+4+24)|0;return;
/*fall*/ pc=0x357e3;
case 0x357e3:
//357e3 fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//357e7 fchs
S[S.length-1]=-S[S.length-1];
//357e9 fld qword ptr [0x104500]
S.push(ldf64((0x104500|0)));
//357ef fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//357f1 call 0x39eca
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x39eca]();
//357f6 jmp 0x357b5
pc=0x357b5;continue;
return;}}}
function f35548(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x35548;
for(;;){switch(pc){
case 0x35548:
//35548 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//35549 sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//3554c fld qword ptr [esp + 0x10]
S.push(ldf64((R.esp + 0x10|0)));
//35550 fmul st(0), st(0)
S[S.length-1-0]=(S[S.length-1-0])*(S[S.length-1-0]);
//35552 fld qword ptr [esp + 0x18]
S.push(ldf64((R.esp + 0x18|0)));
//35556 fmul qword ptr [0x102b68]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102b68|0)));
//3555c fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//3555e fst qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);
//35561 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//35563 xor ecx, ecx
R.ecx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//35565 fcomp qword ptr [0x102b70]
{const a=S[S.length-1],b=ldf64((0x102b70|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//3556b fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//3556d sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//3556e jbe 0x35583
if(flags_cf||flags_zf){pc=0x35583;continue;}
//35570 fldz
S.push(0);
//35572 fcomp qword ptr [esp]
{const a=S[S.length-1],b=ldf64((R.esp|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35575 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35577 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35578 jbe 0x3558a
if(flags_cf||flags_zf){pc=0x3558a;continue;}
//3557a mov eax, ecx
R.eax=R.ecx;
//3557c add esp, 8
R.esp=(R.esp + (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//3557f pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35580 ret 0x10
R.esp=(R.esp+4+16)|0;return;
/*fall*/ pc=0x35583;
case 0x35583:
//35583 mov dword ptr [esp], ecx
st32((R.esp|0),R.ecx);
//35586 mov dword ptr [esp + 4], ecx
st32((R.esp + 4|0),R.ecx);
/*fall*/ pc=0x3558a;
case 0x3558a:
//3558a fld qword ptr [esp]
S.push(ldf64((R.esp|0)));
//3558d fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3558f fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//35592 fld qword ptr [esp + 0x10]
S.push(ldf64((R.esp + 0x10|0)));
//35596 fld st(0)
S.push(S[S.length-1-0]);
//35598 fchs
S[S.length-1]=-S[S.length-1];
//3559a fsub qword ptr [esp]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp|0)));
//3559d fld qword ptr [0x102b78]
S.push(ldf64((0x102b78|0)));
//355a3 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//355a5 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//355a7 fstp qword ptr [edx]
stf64((R.edx|0),S[S.length-1]);S.pop();
//355a9 fld qword ptr [esp]
S.push(ldf64((R.esp|0)));
//355ac fsubrp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(b)-(a);S.pop();}
//355ae fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//355b0 mov ecx, 2
R.ecx=(2|0);
//355b5 fstp qword ptr [edx + 8]
stf64((R.edx + 8|0),S[S.length-1]);S.pop();
//355b8 mov eax, ecx
R.eax=R.ecx;
//355ba add esp, 8
R.esp=(R.esp + (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//355bd pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//355be ret 0x10
R.esp=(R.esp+4+16)|0;return;
//355c1 lea eax, [eax]
R.eax=(R.eax|0);
return;}}}
function f357f8(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x357f8;
for(;;){switch(pc){
case 0x357f8:
//357f8 push ebx
R.esp=(R.esp-4)|0;st32(R.esp,R.ebx);
//357f9 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//357fa push esi
R.esp=(R.esp-4)|0;st32(R.esp,R.esi);
//357fb push edi
R.esp=(R.esp-4)|0;st32(R.esp,R.edi);
//357fc push ebp
R.esp=(R.esp-4)|0;st32(R.esp,R.ebp);
//357fd sub esp, 0xb0
R.esp=(R.esp - (176|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35803 mov ebx, edx
R.ebx=R.edx;
//35805 fld qword ptr [esp + 0xd0]
S.push(ldf64((R.esp + 0xd0|0)));
//3580c fchs
S[S.length-1]=-S[S.length-1];
//3580e fstp qword ptr [esp + 0x18]
stf64((R.esp + 0x18|0),S[S.length-1]);S.pop();
//35812 fld qword ptr [esp + 0xd8]
S.push(ldf64((R.esp + 0xd8|0)));
//35819 fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35820 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35822 fld qword ptr [esp + 0xe0]
S.push(ldf64((R.esp + 0xe0|0)));
//35829 fld st(0)
S.push(S[S.length-1-0]);
//3582b fld qword ptr [0x102bb8]
S.push(ldf64((0x102bb8|0)));
//35831 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35833 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35835 fsubp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(a)-(b);S.pop();}
//35837 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//35839 fstp qword ptr [esp + 0x20]
stf64((R.esp + 0x20|0),S[S.length-1]);S.pop();
//3583d fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35844 fchs
S[S.length-1]=-S[S.length-1];
//35846 fmul qword ptr [esp + 0xc8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0xc8|0)));
//3584d fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//3584f fld qword ptr [esp + 0xd0]
S.push(ldf64((R.esp + 0xd0|0)));
//35856 fmulp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(a)*(b);S.pop();}
//35858 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//3585a fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//3585c faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//3585e fld st(1)
S.push(S[S.length-1-1]);
//35860 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35862 sub esp, 8
R.esp=(R.esp - (8|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35865 fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//35867 mov edx, dword ptr [esp + 0x2c]
R.edx=ld32((R.esp + 0x2c|0));
//3586b fstp qword ptr [esp]
stf64((R.esp|0),S[S.length-1]);S.pop();
//3586e push edx
R.esp=(R.esp-4)|0;st32(R.esp,R.edx);
//3586f mov esi, dword ptr [esp + 0x2c]
R.esi=ld32((R.esp + 0x2c|0));
//35873 push esi
R.esp=(R.esp-4)|0;st32(R.esp,R.esi);
//35874 mov edi, dword ptr [esp + 0x2c]
R.edi=ld32((R.esp + 0x2c|0));
//35878 push edi
R.esp=(R.esp-4)|0;st32(R.esp,R.edi);
//35879 mov ebp, dword ptr [esp + 0x2c]
R.ebp=ld32((R.esp + 0x2c|0));
//3587d push ebp
R.esp=(R.esp-4)|0;st32(R.esp,R.ebp);
//3587e lea edx, [esp + 0x18]
R.edx=(R.esp + 0x18|0);
//35882 call 0x355c4
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x355c4]();
//35887 fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//3588e fmul qword ptr [0x102bc0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bc0|0)));
//35894 mov eax, dword ptr [esp]
R.eax=ld32((R.esp|0));
//35897 fmul qword ptr [esp + 0xc8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.esp + 0xc8|0)));
//3589e mov dword ptr [esp + 0xa8], eax
st32((R.esp + 0xa8|0),R.eax);
//358a5 fsub qword ptr [esp + 0xd0]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp + 0xd0|0)));
//358ac mov eax, dword ptr [esp + 4]
R.eax=ld32((R.esp + 4|0));
//358b0 fadd qword ptr [esp]
S[S.length-1]=(S[S.length-1-0])+(ldf64((R.esp|0)));
//358b3 mov dword ptr [esp + 0xac], eax
st32((R.esp + 0xac|0),R.eax);
//358ba fst qword ptr [esp + 0x80]
stf64((R.esp + 0x80|0),S[S.length-1]);
//358c1 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//358c3 xor ecx, ecx
R.ecx=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//358c5 fcomp qword ptr [0x102bc8]
{const a=S[S.length-1],b=ldf64((0x102bc8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//358cb fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//358cd sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//358ce ja 0x359c1
if(!flags_cf&&!flags_zf){pc=0x359c1;continue;}
/*fall*/ pc=0x358d4;
case 0x358d4:
//358d4 fld qword ptr [esp + 0xa8]
S.push(ldf64((R.esp + 0xa8|0)));
//358db fmul st(0), st(0)
S[S.length-1-0]=(S[S.length-1-0])*(S[S.length-1-0]);
//358dd fld qword ptr [esp + 0xe0]
S.push(ldf64((R.esp + 0xe0|0)));
//358e4 fmul qword ptr [0x102bb8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bb8|0)));
//358ea fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//358ec fst qword ptr [esp + 0xa0]
stf64((R.esp + 0xa0|0),S[S.length-1]);
//358f3 fcomp qword ptr [0x102bf8]
{const a=S[S.length-1],b=ldf64((0x102bf8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//358f9 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//358fb sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//358fc jb 0x359b1
if(flags_cf){pc=0x359b1;continue;}
//35902 fldz
S.push(0);
//35904 fcomp qword ptr [esp + 0xa0]
{const a=S[S.length-1],b=ldf64((R.esp + 0xa0|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//3590b fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//3590d sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//3590e ja 0x35b5c
if(!flags_cf&&!flags_zf){pc=0x35b5c;continue;}
/*fall*/ pc=0x35914;
case 0x35914:
//35914 fld qword ptr [esp + 0xa0]
S.push(ldf64((R.esp + 0xa0|0)));
//3591b fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3591d fld qword ptr [0x102bd8]
S.push(ldf64((0x102bd8|0)));
//35923 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35925 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35927 fstp qword ptr [esp + 0xa0]
stf64((R.esp + 0xa0|0),S[S.length-1]);S.pop();
//3592e fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35935 fld st(0)
S.push(S[S.length-1-0]);
//35937 fmul qword ptr [0x102bd0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bd0|0)));
//3593d fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//3593f fld qword ptr [esp + 0xd0]
S.push(ldf64((R.esp + 0xd0|0)));
//35946 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35948 fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//3594a fst qword ptr [esp + 0x90]
stf64((R.esp + 0x90|0),S[S.length-1]);
//35951 fadd qword ptr [esp + 0xa0]
S[S.length-1]=(S[S.length-1-0])+(ldf64((R.esp + 0xa0|0)));
//35958 fst qword ptr [esp + 0x50]
stf64((R.esp + 0x50|0),S[S.length-1]);
//3595c fcomp qword ptr [0x102bc8]
{const a=S[S.length-1],b=ldf64((0x102bc8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35962 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35964 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35965 jb 0x35990
if(flags_cf){pc=0x35990;continue;}
//35967 fld qword ptr [esp + 0x50]
S.push(ldf64((R.esp + 0x50|0)));
//3596b fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3596d fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35974 fmul qword ptr [0x102bf0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bf0|0)));
//3597a fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//3597c fmul qword ptr [0x102be8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102be8|0)));
//35982 fld st(1)
S.push(S[S.length-1-1]);
//35984 fadd st(1)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-1]);
//35986 fstp qword ptr [ebx]
stf64((R.ebx|0),S[S.length-1]);S.pop();
//35988 fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//3598a add ecx, 2
R.ecx=(R.ecx + (2|0))|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//3598d fstp qword ptr [ebx + 8]
stf64((R.ebx + 8|0),S[S.length-1]);S.pop();
/*fall*/ pc=0x35990;
case 0x35990:
//35990 fld qword ptr [esp + 0x90]
S.push(ldf64((R.esp + 0x90|0)));
//35997 fsub qword ptr [esp + 0xa0]
S[S.length-1]=(S[S.length-1-0])-(ldf64((R.esp + 0xa0|0)));
//3599e fst qword ptr [esp + 0x48]
stf64((R.esp + 0x48|0),S[S.length-1]);
//359a2 fcomp qword ptr [0x102bc8]
{const a=S[S.length-1],b=ldf64((0x102bc8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//359a8 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//359aa sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//359ab jae 0x35b71
if(!flags_cf){pc=0x35b71;continue;}
/*fall*/ pc=0x359b1;
case 0x359b1:
//359b1 mov eax, ecx
R.eax=R.ecx;
//359b3 add esp, 0xb0
R.esp=(R.esp + (176|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//359b9 pop ebp
R.ebp=ld32(R.esp);R.esp=(R.esp+4)|0;
//359ba pop edi
R.edi=ld32(R.esp);R.esp=(R.esp+4)|0;
//359bb pop esi
R.esi=ld32(R.esp);R.esp=(R.esp+4)|0;
//359bc pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//359bd pop ebx
R.ebx=ld32(R.esp);R.esp=(R.esp+4)|0;
//359be ret 0x20
R.esp=(R.esp+4+32)|0;return;
/*fall*/ pc=0x359c1;
case 0x359c1:
//359c1 fldz
S.push(0);
//359c3 fcomp qword ptr [esp + 0x80]
{const a=S[S.length-1],b=ldf64((R.esp + 0x80|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//359ca fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//359cc sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//359cd jae 0x35b46
if(!flags_cf){pc=0x35b46;continue;}
//359d3 fld qword ptr [esp + 0x80]
S.push(ldf64((R.esp + 0x80|0)));
//359da fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//359dc fstp qword ptr [esp + 0x88]
stf64((R.esp + 0x88|0),S[S.length-1]);S.pop();
//359e3 fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//359ea fld st(0)
S.push(S[S.length-1-0]);
//359ec fmul qword ptr [0x102bd0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bd0|0)));
//359f2 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//359f4 fld qword ptr [esp + 0x88]
S.push(ldf64((R.esp + 0x88|0)));
//359fb fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//359fd fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//359ff fld qword ptr [esp + 0xd0]
S.push(ldf64((R.esp + 0xd0|0)));
//35a06 fld st(0)
S.push(S[S.length-1-0]);
//35a08 fmul qword ptr [0x102bd8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bd8|0)));
//35a0e fsubp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)-(b);S.pop();}
//35a10 fld qword ptr [0x102bb8]
S.push(ldf64((0x102bb8|0)));
//35a16 fld st(3)
S.push(S[S.length-1-3]);
//35a18 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35a1a fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35a1c fld qword ptr [esp + 0xd8]
S.push(ldf64((R.esp + 0xd8|0)));
//35a23 fmul qword ptr [0x102be0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102be0|0)));
//35a29 fsubp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)-(b);S.pop();}
//35a2b fld st(3)
S.push(S[S.length-1-3]);
//35a2d fmul st(4)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-4]);
//35a2f fmulp st(4)
{const a=S[S.length-1-4],b=S[S.length-1];S[S.length-1-4]=(a)*(b);S.pop();}
//35a31 fxch st(3)
{const t=S[S.length-1-3];S[S.length-1-3]=S[S.length-1];S[S.length-1]=t;}
//35a33 fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//35a35 fld qword ptr [esp + 0x88]
S.push(ldf64((R.esp + 0x88|0)));
//35a3c fmulp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(a)*(b);S.pop();}
//35a3e fdivrp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(b)/(a);S.pop();}
//35a40 fld st(0)
S.push(S[S.length-1-0]);
//35a42 fadd st(2)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-2]);
//35a44 fstp qword ptr [esp + 0x98]
stf64((R.esp + 0x98|0),S[S.length-1]);S.pop();
//35a4b fsubrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)-(a);S.pop();}
//35a4d fstp qword ptr [esp + 0x58]
stf64((R.esp + 0x58|0),S[S.length-1]);S.pop();
//35a51 fld qword ptr [esp + 0x98]
S.push(ldf64((R.esp + 0x98|0)));
//35a58 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//35a5a fcomp qword ptr [0x102bc8]
{const a=S[S.length-1],b=ldf64((0x102bc8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35a60 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35a62 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35a63 ja 0x35a73
if(!flags_cf&&!flags_zf){pc=0x35a73;continue;}
//35a65 mov dword ptr [esp + 0x98], ecx
st32((R.esp + 0x98|0),R.ecx);
//35a6c mov dword ptr [esp + 0x9c], ecx
st32((R.esp + 0x9c|0),R.ecx);
/*fall*/ pc=0x35a73;
case 0x35a73:
//35a73 fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//35a77 fabs
S[S.length-1]=Math.abs(S[S.length-1]);
//35a79 fcomp qword ptr [0x102bc8]
{const a=S[S.length-1],b=ldf64((0x102bc8|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35a7f fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35a81 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35a82 ja 0x35a8e
if(!flags_cf&&!flags_zf){pc=0x35a8e;continue;}
//35a84 xor esi, esi
R.esi=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//35a86 mov dword ptr [esp + 0x58], esi
st32((R.esp + 0x58|0),R.esi);
//35a8a mov dword ptr [esp + 0x5c], esi
st32((R.esp + 0x5c|0),R.esi);
/*fall*/ pc=0x35a8e;
case 0x35a8e:
//35a8e fldz
S.push(0);
//35a90 fcomp qword ptr [esp + 0x98]
{const a=S[S.length-1],b=ldf64((R.esp + 0x98|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35a97 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35a99 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35a9a ja 0x35adb
if(!flags_cf&&!flags_zf){pc=0x35adb;continue;}
//35a9c fld qword ptr [esp + 0x98]
S.push(ldf64((R.esp + 0x98|0)));
//35aa3 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//35aa5 fld qword ptr [esp + 0x88]
S.push(ldf64((R.esp + 0x88|0)));
//35aac fld st(0)
S.push(S[S.length-1-0]);
//35aae fadd st(2)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-2]);
//35ab0 fld qword ptr [0x102be8]
S.push(ldf64((0x102be8|0)));
//35ab6 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35ab8 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35aba fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35ac1 fmul qword ptr [0x102bf0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bf0|0)));
//35ac7 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35ac9 fadd st(1)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-1]);
//35acb fstp qword ptr [ebx]
stf64((R.ebx|0),S[S.length-1]);S.pop();
//35acd fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//35acf fsubrp st(3)
{const a=S[S.length-1-3],b=S[S.length-1];S[S.length-1-3]=(b)-(a);S.pop();}
//35ad1 fmulp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)*(b);S.pop();}
//35ad3 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//35ad5 add ecx, 2
R.ecx=(R.ecx + (2|0))|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//35ad8 fstp qword ptr [ebx + 8]
stf64((R.ebx + 8|0),S[S.length-1]);S.pop();
/*fall*/ pc=0x35adb;
case 0x35adb:
//35adb fldz
S.push(0);
//35add fcomp qword ptr [esp + 0x58]
{const a=S[S.length-1],b=ldf64((R.esp + 0x58|0));fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();
//35ae1 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//35ae3 sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//35ae4 ja 0x359b1
if(!flags_cf&&!flags_zf){pc=0x359b1;continue;}
//35aea fld qword ptr [esp + 0x58]
S.push(ldf64((R.esp + 0x58|0)));
//35aee fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//35af0 fld st(0)
S.push(S[S.length-1-0]);
//35af2 fld qword ptr [esp + 0x88]
S.push(ldf64((R.esp + 0x88|0)));
//35af9 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35afb fsub st(1)
S[S.length-1]=(S[S.length-1-0])-(S[S.length-1-1]);
//35afd fld qword ptr [0x102be8]
S.push(ldf64((0x102be8|0)));
//35b03 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35b05 fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//35b07 fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35b0e fmul qword ptr [0x102bf0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bf0|0)));
//35b14 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35b16 fadd st(1)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-1]);
//35b18 lea eax, [ecx*8]
R.eax=(R.ecx*8|0);
//35b1f fstp qword ptr [ebx + eax]
stf64((R.ebx + R.eax|0),S[S.length-1]);S.pop();
//35b22 fxch st(3)
{const t=S[S.length-1-3];S[S.length-1-3]=S[S.length-1];S[S.length-1]=t;}
//35b24 faddp st(2)
{const a=S[S.length-1-2],b=S[S.length-1];S[S.length-1-2]=(a)+(b);S.pop();}
//35b26 inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//35b27 fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//35b29 lea eax, [ecx*8]
R.eax=(R.ecx*8|0);
//35b30 fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//35b32 inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//35b33 fstp qword ptr [ebx + eax]
stf64((R.ebx + R.eax|0),S[S.length-1]);S.pop();
//35b36 mov eax, ecx
R.eax=R.ecx;
//35b38 add esp, 0xb0
R.esp=(R.esp + (176|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35b3e pop ebp
R.ebp=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b3f pop edi
R.edi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b40 pop esi
R.esi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b41 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b42 pop ebx
R.ebx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b43 ret 0x20
R.esp=(R.esp+4+32)|0;return;
/*fall*/ pc=0x35b46;
case 0x35b46:
//35b46 jbe 0x358d4
if(flags_cf||flags_zf){pc=0x358d4;continue;}
//35b4c mov eax, ecx
R.eax=R.ecx;
//35b4e add esp, 0xb0
R.esp=(R.esp + (176|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35b54 pop ebp
R.ebp=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b55 pop edi
R.edi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b56 pop esi
R.esi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b57 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b58 pop ebx
R.ebx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35b59 ret 0x20
R.esp=(R.esp+4+32)|0;return;
/*fall*/ pc=0x35b5c;
case 0x35b5c:
//35b5c xor ebp, ebp
R.ebp=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//35b5e mov dword ptr [esp + 0xa0], ebp
st32((R.esp + 0xa0|0),R.ebp);
//35b65 mov dword ptr [esp + 0xa4], ebp
st32((R.esp + 0xa4|0),R.ebp);
//35b6c jmp 0x35914
pc=0x35914;continue;
/*fall*/ pc=0x35b71;
case 0x35b71:
//35b71 fld qword ptr [esp + 0x48]
S.push(ldf64((R.esp + 0x48|0)));
//35b75 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//35b77 fld qword ptr [esp + 0xc8]
S.push(ldf64((R.esp + 0xc8|0)));
//35b7e fmul qword ptr [0x102bf0]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102bf0|0)));
//35b84 fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//35b86 fmul qword ptr [0x102be8]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x102be8|0)));
//35b8c lea eax, [ecx*8]
R.eax=(R.ecx*8|0);
//35b93 fld st(1)
S.push(S[S.length-1-1]);
//35b95 fadd st(1)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-1]);
//35b97 inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//35b98 fstp qword ptr [ebx + eax]
stf64((R.ebx + R.eax|0),S[S.length-1]);S.pop();
//35b9b lea eax, [ecx*8]
R.eax=(R.ecx*8|0);
//35ba2 fsubp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)-(b);S.pop();}
//35ba4 inc ecx
R.ecx=(R.ecx+1)|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);
//35ba5 fstp qword ptr [ebx + eax]
stf64((R.ebx + R.eax|0),S[S.length-1]);S.pop();
//35ba8 mov eax, ecx
R.eax=R.ecx;
//35baa add esp, 0xb0
R.esp=(R.esp + (176|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//35bb0 pop ebp
R.ebp=ld32(R.esp);R.esp=(R.esp+4)|0;
//35bb1 pop edi
R.edi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35bb2 pop esi
R.esi=ld32(R.esp);R.esp=(R.esp+4)|0;
//35bb3 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35bb4 pop ebx
R.ebx=ld32(R.esp);R.esp=(R.esp+4)|0;
//35bb5 ret 0x20
R.esp=(R.esp+4+32)|0;return;
return;}}}
function f20bc4(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x20bc4;
for(;;){switch(pc){
case 0x20bc4:
//20bc4 push ebp
R.esp=(R.esp-4)|0;st32(R.esp,R.ebp);
//20bc5 mov ebp, esp
R.ebp=R.esp;
//20bc7 push ebx
R.esp=(R.esp-4)|0;st32(R.esp,R.ebx);
//20bc8 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//20bc9 push edx
R.esp=(R.esp-4)|0;st32(R.esp,R.edx);
//20bca push esi
R.esp=(R.esp-4)|0;st32(R.esp,R.esi);
//20bcb push edi
R.esp=(R.esp-4)|0;st32(R.esp,R.edi);
//20bcc sub esp, 0x28
R.esp=(R.esp - (40|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//20bcf fild dword ptr [0x10eb9c]
S.push(ld32((0x10eb9c|0)));
//20bd5 fmul dword ptr [0x1015f8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((0x1015f8|0)));
//20bdb fld1
S.push(1);
//20bdd faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//20bdf fst qword ptr [ebp - 0x24]
stf64((R.ebp - 0x24|0),S[S.length-1]);
//20be2 fmul qword ptr [0x101600]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101600|0)));
//20be8 push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20be9 fistp dword ptr [esp]
sti32((R.esp|0),rnd(S.pop()));
//20bec pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20bed fld dword ptr [0x149944]
S.push(ldf32((0x149944|0)));
//20bf3 fld st(0)
S.push(S[S.length-1-0]);
//20bf5 fmul dword ptr [0x101608]
S[S.length-1]=(S[S.length-1-0])*(ldf32((0x101608|0)));
//20bfb fmul qword ptr [ebp - 0x24]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0x24|0)));
//20bfe fsubr dword ptr [0x105d80]
S[S.length-1]=(ldf32((0x105d80|0)))-(S[S.length-1-0]);
//20c04 fstp dword ptr [0x105d80]
stf32((0x105d80|0),S[S.length-1]);S.pop();
//20c0a fld st(0)
S.push(S[S.length-1-0]);
//20c0c fmul dword ptr [0x10160c]
S[S.length-1]=(S[S.length-1-0])*(ldf32((0x10160c|0)));
//20c12 fmul qword ptr [ebp - 0x24]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0x24|0)));
//20c15 fld dword ptr [0x105d7c]
S.push(ldf32((0x105d7c|0)));
//20c1b fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20c1d fsubr st(1)
S[S.length-1]=(S[S.length-1-1])-(S[S.length-1-0]);
//20c1f mov edx, dword ptr [0x1218d8]
R.edx=ld32((0x1218d8|0));
//20c25 fstp st(1)
{const v=S[S.length-1];S.pop();S[S.length-1-0]=v;}
//20c27 fstp dword ptr [0x105d7c]
stf32((0x105d7c|0),S[S.length-1]);S.pop();
//20c2d fmul qword ptr [ebp - 0x24]
S[S.length-1]=(S[S.length-1-0])*(ldf64((R.ebp - 0x24|0)));
//20c30 add edx, eax
R.edx=(R.edx + R.eax)|0;flags_zf=+(R.edx===0);flags_sf=+(R.edx<0);
//20c32 fmul qword ptr [0x101610]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101610|0)));
//20c38 mov ecx, edx
R.ecx=R.edx;
//20c3a mov dword ptr [0x1218d8], edx
st32((0x1218d8|0),R.edx);
//20c40 and ecx, 0x3ff
R.ecx=(R.ecx & (1023|0))|0;flags_zf=+(R.ecx===0);flags_sf=+(R.ecx<0);flags_cf=0;flags_of=0;
//20c46 fld dword ptr [0x1218dc]
S.push(ldf32((0x1218dc|0)));
//20c4c fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20c4e fadd st(1)
S[S.length-1]=(S[S.length-1-0])+(S[S.length-1-1]);
//20c50 mov dword ptr [0x1218d8], ecx
st32((0x1218d8|0),R.ecx);
//20c56 fstp st(1)
{const v=S[S.length-1];S.pop();S[S.length-1-0]=v;}
//20c58 fstp dword ptr [0x1218dc]
stf32((0x1218dc|0),S[S.length-1]);S.pop();
//20c5e fld dword ptr [0x105d7c]
S.push(ldf32((0x105d7c|0)));
//20c64 fld1
S.push(1);
//20c66 fcompp
{const a=S[S.length-1],b=S[S.length-1-1];fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}S.pop();S.pop();
//20c68 fnstsw ax
R.eax=(R.eax&~0xffff)|fsw;
//20c6a sahf
{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}
//20c6b jb 0x20c77
if(flags_cf){pc=0x20c77;continue;}
//20c6d mov dword ptr [0x105d7c], 0x3f800000
st32((0x105d7c|0),(1065353216|0));
/*fall*/ pc=0x20c77;
case 0x20c77:
//20c77 fild dword ptr [0x1218d8]
S.push(ld32((0x1218d8|0)));
//20c7d fmul qword ptr [0x101618]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101618|0)));
//20c83 fmul qword ptr [0x101620]
S[S.length-1]=(S[S.length-1-0])*(ldf64((0x101620|0)));
//20c89 fld st(0)
S.push(S[S.length-1-0]);
//20c8b fcos
S[S.length-1]=Math.cos(S[S.length-1]);
//20c8d fxch st(1)
{const t=S[S.length-1-1];S[S.length-1-1]=S[S.length-1];S[S.length-1]=t;}
//20c8f fsin
S[S.length-1]=Math.sin(S[S.length-1]);
//20c91 fld dword ptr [0x105d7c]
S.push(ldf32((0x105d7c|0)));
//20c97 fxch st(2)
{const t=S[S.length-1-2];S[S.length-1-2]=S[S.length-1];S[S.length-1]=t;}
//20c99 fmul st(2)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-2]);
//20c9b fstp dword ptr [ebp - 0x30]
stf32((R.ebp - 0x30|0),S[S.length-1]);S.pop();
//20c9e fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//20ca0 mov ecx, dword ptr [0x126c68]
R.ecx=ld32((0x126c68|0));
//20ca6 mov eax, dword ptr [0x105d80]
R.eax=ld32((0x105d80|0));
//20cab lea edx, [ecx + 0x2c]
R.edx=(R.ecx + 0x2c|0);
//20cae mov dword ptr [ebp - 0x2c], eax
st32((R.ebp - 0x2c|0),R.eax);
//20cb1 mov eax, dword ptr [ebp - 0x30]
R.eax=ld32((R.ebp - 0x30|0));
//20cb4 fstp dword ptr [ebp - 0x28]
stf32((R.ebp - 0x28|0),S[S.length-1]);S.pop();
//20cb7 mov dword ptr [edx], eax
st32((R.edx|0),R.eax);
//20cb9 mov eax, dword ptr [ebp - 0x2c]
R.eax=ld32((R.ebp - 0x2c|0));
//20cbc mov dword ptr [edx + 4], eax
st32((R.edx + 4|0),R.eax);
//20cbf mov eax, dword ptr [ebp - 0x28]
R.eax=ld32((R.ebp - 0x28|0));
//20cc2 lea ebx, [ebp - 0x3c]
R.ebx=(R.ebp - 0x3c|0);
//20cc5 mov dword ptr [edx + 8], eax
st32((R.edx + 8|0),R.eax);
//20cc8 xor esi, esi
R.esi=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;
//20cca fld dword ptr [ebp - 0x2c]
S.push(ldf32((R.ebp - 0x2c|0)));
//20ccd lea edx, [ebp - 0x30]
R.edx=(R.ebp - 0x30|0);
//20cd0 mov dword ptr [ebp - 0x3c], esi
st32((R.ebp - 0x3c|0),R.esi);
//20cd3 fadd qword ptr [0x101628]
S[S.length-1]=(S[S.length-1-0])+(ldf64((0x101628|0)));
//20cd9 mov eax, ecx
R.eax=R.ecx;
//20cdb fstp dword ptr [ebp - 0x38]
stf32((R.ebp - 0x38|0),S[S.length-1]);S.pop();
//20cde push dword ptr [0x1218dc]
R.esp=(R.esp-4)|0;st32(R.esp,ld32((0x1218dc|0)));
//20ce4 mov dword ptr [ebp - 0x34], esi
st32((R.ebp - 0x34|0),R.esi);
//20ce7 call 0x322dc
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x322dc]();
//20cec push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20ced wait
;
//20cee fnstcw word ptr [esp]
st16((R.esp|0),0x37f);
//20cf1 or word ptr [esp], 0x300
{const a=ld16((R.esp|0));const r=(a | (768|0))|0;st16((R.esp|0),r);flags_zf=+(r===0);flags_sf=+(r<0);}
//20cf7 fldcw word ptr [esp]
;
//20cfa pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
//20cfb mov eax, dword ptr [0x126c68]
R.eax=ld32((0x126c68|0));
//20d00 mov esi, 0x122998
R.esi=(1190296|0);
//20d05 call 0x202a4
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x202a4]();
//20d0a mov ebx, dword ptr [0x1218e0]
R.ebx=ld32((0x1218e0|0));
//20d10 push eax
R.esp=(R.esp-4)|0;st32(R.esp,R.eax);
//20d11 wait
;
//20d12 fnstcw word ptr [esp]
st16((R.esp|0),0x37f);
//20d15 and word ptr [esp], 0xfcff
{const a=ld16((R.esp|0));const r=(a & (64767|0))|0;st16((R.esp|0),r);flags_zf=+(r===0);flags_sf=+(r<0);}
//20d1b fldcw word ptr [esp]
;
//20d1e pop eax
R.eax=ld32(R.esp);R.esp=(R.esp+4)|0;
return;}}}
function f322dc(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x322dc;
for(;;){switch(pc){
case 0x322dc:
//322dc push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//322dd sub esp, 0x38
R.esp=(R.esp - (56|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//322e0 mov ecx, eax
R.ecx=R.eax;
//322e2 mov eax, dword ptr [edx]
R.eax=ld32((R.edx|0));
//322e4 mov dword ptr [esp + 0x24], eax
st32((R.esp + 0x24|0),R.eax);
//322e8 mov eax, dword ptr [edx + 4]
R.eax=ld32((R.edx + 4|0));
//322eb mov dword ptr [esp + 0x28], eax
st32((R.esp + 0x28|0),R.eax);
//322ef mov eax, dword ptr [edx + 8]
R.eax=ld32((R.edx + 8|0));
//322f2 mov dword ptr [esp + 0x2c], eax
st32((R.esp + 0x2c|0),R.eax);
//322f6 mov edx, ebx
R.edx=R.ebx;
//322f8 mov eax, esp
R.eax=R.esp;
//322fa call 0x30244
R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x30244]();
//322ff lea edx, [ecx + 0x2c]
R.edx=(R.ecx + 0x2c|0);
//32302 mov eax, dword ptr [esp + 0x24]
R.eax=ld32((R.esp + 0x24|0));
//32306 mov dword ptr [edx], eax
st32((R.edx|0),R.eax);
//32308 mov eax, dword ptr [esp + 0x28]
R.eax=ld32((R.esp + 0x28|0));
//3230c mov dword ptr [edx + 4], eax
st32((R.edx + 4|0),R.eax);
//3230f mov eax, dword ptr [esp + 0x2c]
R.eax=ld32((R.esp + 0x2c|0));
//32313 fld dword ptr [esp + 0x40]
S.push(ldf32((R.esp + 0x40|0)));
//32317 mov dword ptr [edx + 8], eax
st32((R.edx + 8|0),R.eax);
//3231a fcos
S[S.length-1]=Math.cos(S[S.length-1]);
//3231c fstp dword ptr [esp + 0x30]
stf32((R.esp + 0x30|0),S[S.length-1]);S.pop();
//32320 fld dword ptr [esp + 0x40]
S.push(ldf32((R.esp + 0x40|0)));
//32324 fsin
S[S.length-1]=Math.sin(S[S.length-1]);
//32326 fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//3232a fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//3232c fld dword ptr [esp]
S.push(ldf32((R.esp|0)));
//3232f fmul dword ptr [esp + 0x30]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x30|0)));
//32333 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//32335 fstp dword ptr [ecx + 8]
stf32((R.ecx + 8|0),S[S.length-1]);S.pop();
//32338 fld dword ptr [esp + 0x10]
S.push(ldf32((R.esp + 0x10|0)));
//3233c fmul st(1)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-1]);
//3233e fstp dword ptr [ecx + 0xc]
stf32((R.ecx + 0xc|0),S[S.length-1]);S.pop();
//32341 fld dword ptr [esp + 8]
S.push(ldf32((R.esp + 8|0)));
//32345 fmul dword ptr [esp + 0x30]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x30|0)));
//32349 fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//3234d fmul st(2)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-2]);
//3234f faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//32351 fstp dword ptr [ecx + 0x10]
stf32((R.ecx + 0x10|0),S[S.length-1]);S.pop();
//32354 fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//32358 fmul dword ptr [esp + 0x30]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x30|0)));
//3235c fld dword ptr [esp]
S.push(ldf32((R.esp|0)));
//3235f fchs
S[S.length-1]=-S[S.length-1];
//32361 fmul st(2)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-2]);
//32363 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//32365 fstp dword ptr [ecx + 0x14]
stf32((R.ecx + 0x14|0),S[S.length-1]);S.pop();
//32368 fld dword ptr [esp + 0x10]
S.push(ldf32((R.esp + 0x10|0)));
//3236c fmul dword ptr [esp + 0x30]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x30|0)));
//32370 fstp dword ptr [ecx + 0x18]
stf32((R.ecx + 0x18|0),S[S.length-1]);S.pop();
//32373 fld dword ptr [esp + 8]
S.push(ldf32((R.esp + 8|0)));
//32377 fchs
S[S.length-1]=-S[S.length-1];
//32379 fmulp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)*(b);S.pop();}
//3237b fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//3237f fmul dword ptr [esp + 0x30]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x30|0)));
//32383 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//32385 fstp dword ptr [ecx + 0x1c]
stf32((R.ecx + 0x1c|0),S[S.length-1]);S.pop();
//32388 mov eax, dword ptr [esp + 0x18]
R.eax=ld32((R.esp + 0x18|0));
//3238c mov dword ptr [ecx + 0x20], eax
st32((R.ecx + 0x20|0),R.eax);
//3238f mov eax, dword ptr [esp + 0x1c]
R.eax=ld32((R.esp + 0x1c|0));
//32393 mov dword ptr [ecx + 0x24], eax
st32((R.ecx + 0x24|0),R.eax);
//32396 mov eax, dword ptr [esp + 0x20]
R.eax=ld32((R.esp + 0x20|0));
//3239a mov dword ptr [ecx + 0x28], eax
st32((R.ecx + 0x28|0),R.eax);
//3239d add esp, 0x38
R.esp=(R.esp + (56|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//323a0 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//323a1 ret 4
R.esp=(R.esp+4+4)|0;return;
return;}}}
function f30244(){
let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;
let pc=0x30244;
for(;;){switch(pc){
case 0x30244:
//30244 push ecx
R.esp=(R.esp-4)|0;st32(R.esp,R.ecx);
//30245 sub esp, 0x18
R.esp=(R.esp - (24|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//30248 mov ecx, eax
R.ecx=R.eax;
//3024a fld dword ptr [edx]
S.push(ldf32((R.edx|0)));
//3024c fsub dword ptr [eax + 0x24]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.eax + 0x24|0)));
//3024f fstp dword ptr [esp + 0x14]
stf32((R.esp + 0x14|0),S[S.length-1]);S.pop();
//30253 fld dword ptr [edx + 4]
S.push(ldf32((R.edx + 4|0)));
//30256 fsub dword ptr [eax + 0x28]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.eax + 0x28|0)));
//30259 fstp dword ptr [esp + 8]
stf32((R.esp + 8|0),S[S.length-1]);S.pop();
//3025d fld dword ptr [edx + 8]
S.push(ldf32((R.edx + 8|0)));
//30260 fsub dword ptr [eax + 0x2c]
S[S.length-1]=(S[S.length-1-0])-(ldf32((R.eax + 0x2c|0)));
//30263 fstp dword ptr [esp + 0xc]
stf32((R.esp + 0xc|0),S[S.length-1]);S.pop();
//30267 fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//3026b fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//3026d fld dword ptr [esp + 8]
S.push(ldf32((R.esp + 8|0)));
//30271 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//30273 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//30275 fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//30279 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//3027b faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//3027d fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//3027f fld1
S.push(1);
//30281 fdivrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)/(a);S.pop();}
//30283 fstp dword ptr [esp + 4]
stf32((R.esp + 4|0),S[S.length-1]);S.pop();
//30287 fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//3028b fmul dword ptr [esp + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 4|0)));
//3028f fstp dword ptr [esp + 0x14]
stf32((R.esp + 0x14|0),S[S.length-1]);S.pop();
//30293 fld dword ptr [esp + 8]
S.push(ldf32((R.esp + 8|0)));
//30297 fmul dword ptr [esp + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 4|0)));
//3029b fstp dword ptr [esp + 8]
stf32((R.esp + 8|0),S[S.length-1]);S.pop();
//3029f fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//302a3 fmul dword ptr [esp + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 4|0)));
//302a7 fstp dword ptr [esp + 0xc]
stf32((R.esp + 0xc|0),S[S.length-1]);S.pop();
//302ab fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//302af fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//302b1 fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//302b5 fmul st(0)
S[S.length-1]=(S[S.length-1-0])*(S[S.length-1-0]);
//302b7 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//302b9 fsqrt
S[S.length-1]=Math.sqrt(S[S.length-1]);
//302bb fld1
S.push(1);
//302bd fdivrp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(b)/(a);S.pop();}
//302bf fstp dword ptr [esp + 4]
stf32((R.esp + 4|0),S[S.length-1]);S.pop();
//302c3 fld dword ptr [esp + 0x14]
S.push(ldf32((R.esp + 0x14|0)));
//302c7 fmul dword ptr [esp + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 4|0)));
//302cb fld dword ptr [esp + 0xc]
S.push(ldf32((R.esp + 0xc|0)));
//302cf fmul dword ptr [esp + 4]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 4|0)));
//302d3 mov dword ptr [ecx + 4], 0
st32((R.ecx + 4|0),(0|0));
//302da fstp dword ptr [esp]
stf32((R.esp|0),S[S.length-1]);S.pop();
//302dd fld st(0)
S.push(S[S.length-1-0]);
//302df mov edx, dword ptr [esp]
R.edx=ld32((R.esp|0));
//302e2 fchs
S[S.length-1]=-S[S.length-1];
//302e4 fst dword ptr [ecx + 8]
stf32((R.ecx + 8|0),S[S.length-1]);
//302e7 fmul dword ptr [esp + 8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 8|0)));
//302eb mov dword ptr [ecx], edx
st32((R.ecx|0),R.edx);
//302ed mov edx, dword ptr [esp + 0x14]
R.edx=ld32((R.esp + 0x14|0));
//302f1 fstp dword ptr [ecx + 0xc]
stf32((R.ecx + 0xc|0),S[S.length-1]);S.pop();
//302f4 fmul dword ptr [esp + 0x14]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0x14|0)));
//302f8 mov dword ptr [ecx + 0x18], edx
st32((R.ecx + 0x18|0),R.edx);
//302fb mov edx, dword ptr [esp + 8]
R.edx=ld32((R.esp + 8|0));
//302ff fld dword ptr [esp]
S.push(ldf32((R.esp|0)));
//30302 fmul dword ptr [esp + 0xc]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 0xc|0)));
//30306 mov dword ptr [ecx + 0x1c], edx
st32((R.ecx + 0x1c|0),R.edx);
//30309 faddp st(1)
{const a=S[S.length-1-1],b=S[S.length-1];S[S.length-1-1]=(a)+(b);S.pop();}
//3030b mov edx, dword ptr [esp + 0xc]
R.edx=ld32((R.esp + 0xc|0));
//3030f fstp dword ptr [ecx + 0x10]
stf32((R.ecx + 0x10|0),S[S.length-1]);S.pop();
//30312 fld dword ptr [esp]
S.push(ldf32((R.esp|0)));
//30315 fchs
S[S.length-1]=-S[S.length-1];
//30317 fmul dword ptr [esp + 8]
S[S.length-1]=(S[S.length-1-0])*(ldf32((R.esp + 8|0)));
//3031b mov dword ptr [ecx + 0x20], edx
st32((R.ecx + 0x20|0),R.edx);
//3031e fstp dword ptr [ecx + 0x14]
stf32((R.ecx + 0x14|0),S[S.length-1]);S.pop();
//30321 add esp, 0x18
R.esp=(R.esp + (24|0))|0;flags_zf=+(R.esp===0);flags_sf=+(R.esp<0);
//30324 pop ecx
R.ecx=ld32(R.esp);R.esp=(R.esp+4)|0;
//30325 ret
R.esp=(R.esp+4+0)|0;return;
return;}}}

F[0x202a4]=(...a)=>{if(skipGrid){R.esp+=4;return;}return f202a4(...a);};F[0x355c4]=f355c4;F[0x35548]=f35548;F[0x357f8]=f357f8;F[0x322dc]=f322dc;F[0x30244]=f30244;return f20bc4;};
const run=mk();

let st=null;   // {n, pristine memory}
export function initHole(json){regions=json.map(r=>{const u=new Uint8Array(r.h.length/2);for(let i=0;i<u.length;i++)u[i]=parseInt(r.h.substr(i*2,2),16);return {b:r.b,v:new DataView(u.buffer),u};});regions.push({b:0x3e0000,v:new DataView(new ArrayBuffer(0x20000))});
  st={n:0,init:regions.map(r=>r.u?r.u.slice():null)};}
const step=(n,grid)=>{skipGrid=!grid;st32(0x10eb9c,7*n);R.eax=7;R.esp=0x3effc0;R.ebp=0x3effec;S.length=0;st32(R.esp,0);run();};
// frame n (1-based, one call of the callback per 7-tick frame, tick = 7n): grids g0,g1 (41x26 u,v int32 pairs) and shade (41x26 int32)
let last=null;
export function holeFrame(n){
  if(last&&last.n===n)return last.r;
  if(n<=st.n){regions.forEach((r,i)=>{if(st.init[i])r.u.set(st.init[i]);});st.n=0;}
  while(st.n<n-1){step(st.n+1,false);st.n++;}
  step(n,true);st.n=n;
  const rd=(b,c)=>{const o=new Int32Array(c);for(let i=0;i<c;i++)o[i]=ld32(b+4*i);return o;};
  const r={g0:rd(0x122998,41*26*2),g1:rd(0x124ae8,41*26*2),sh:rd(0x1218f0,41*26)};last={n,r};return r;
}

export const dbg=()=>[0x1218d8,0x1218dc,0x105d7c,0x105d80].map(a=>ld32(a));
