"""x86/x87 -> JS transpiler for a few self-contained functions.  usage: x2js.py all.asm name:start:end ... > out.js"""
import re,sys
asm={}
order=[]
for l in open(sys.argv[1]).read().split('\n'):
    p=l.split(None,1)
    if len(p)<2:continue
    try:a=int(p[0],16)
    except:continue
    asm[a]=p[1].strip();order.append(a)
REG32=['eax','ebx','ecx','edx','esi','edi','ebp','esp']
def memexpr(s):
    s=s.strip()
    mm=re.match(r'(?:(dword|qword|word|byte) ptr )?\[(.*)\]$',s)
    sz=mm.group(1);ex=mm.group(2)
    ex=re.sub(r'\b(e[a-d]x|e[sd]i|ebp|esp)\b',lambda m:'R.'+m.group(1),ex)
    ex=re.sub(r'(\w+|\.\w+)\*(\d)',lambda m:m.group(1)+'*'+m.group(2),ex)
    return sz,'(%s|0)'%ex
def imm(s):
    s=s.strip()
    if re.fullmatch(r'-?0x[0-9a-f]+|-?\d+',s):return str(int(s,0)|0) if abs(int(s,0))<2**32 else s
    return None
def val(s):
    s=s.strip()
    if s in REG32:return 'R.'+s
    i=imm(s)
    if i is not None:return '(%s|0)'%i
    if '[' in s:
        sz,e=memexpr(s);return 'ld%s(%s)'%({'dword':'32','qword':'32','word':'16','byte':'8',None:'32'}[sz],e)
    raise Exception('val '+s)
def stidx(s):
    m=re.fullmatch(r'st\((\d)\)',s.strip())
    if m:return int(m.group(1))
    if s.strip()=='st':return 0
    return None
def STi(i):return 'S[S.length-1-%d]'%i
def fp_mem(s):
    sz,e=memexpr(s);return sz,e
def gen(name,start,end):
    addrs=[a for a in order if start<=a<=end]
    targets={start}
    for a in addrs:
        m=re.match(r'(j\w+) (0x[0-9a-f]+)',asm[a])
        if m:targets.add(int(m.group(2),16))
    out=['function %s(){'%name,'let flags_cf=0,flags_zf=0,flags_sf=0,flags_of=0,fsw=0;','let pc=0x%x;'%start,'for(;;){switch(pc){']
    prev=None
    for idx,a in enumerate(addrs):
        if a in targets or idx==0:
            if idx>0:out.append('/*fall*/ pc=0x%x;'%a)
            out.append('case 0x%x:'%a)
        ins=asm[a];mn,_,rest=ins.partition(' ');ops=[x.strip() for x in re.split(r',(?![^\[]*\])',rest)] if rest else []
        c='//%x %s\n'%(a,ins)
        def cc(mn,ops):
            if mn=='mov':
                d,s=ops
                if d in REG32:return 'R.%s=%s;'%(d,val(s))
                sz,e=memexpr(d);return 'st%s(%s,%s);'%({'dword':'32','word':'16','byte':'8'}[sz],e,val(s))
            if mn=='lea':return 'R.%s=%s;'%(ops[0],memexpr(ops[1])[1])
            if mn in('add','sub','xor','and','or'):
                d,s=ops;o={'add':'+','sub':'-','xor':'^','and':'&','or':'|'}[mn]
                if '[' in d:
                    sz,e=memexpr(d);w={'dword':'32','word':'16','byte':'8'}[sz];return '{const a=ld%s(%s);const r=(a %s %s)|0;st%s(%s,r);flags_zf=+(r===0);flags_sf=+(r<0);}'%(w,e,o,val(s),w,e)
                r='(R.%s %s %s)|0'%(d,o,val(s))
                f=''
                if mn=='sub' or mn=='add':f='flags_zf=+(R.%s===0);flags_sf=+(R.%s<0);'%(d,d)
                else:f='flags_zf=+(R.%s===0);flags_sf=+(R.%s<0);flags_cf=0;flags_of=0;'%(d,d)
                if mn=='xor' and d==s: return 'R.%s=0;flags_zf=1;flags_sf=0;flags_cf=0;flags_of=0;'%d
                return 'R.%s=%s;%s'%(d,r,f)
            if mn in('inc','dec'):return 'R.%s=(R.%s%s1)|0;flags_zf=+(R.%s===0);flags_sf=+(R.%s<0);'%(ops[0],ops[0],'+' if mn=='inc' else '-',ops[0],ops[0])
            if mn=='shl':return 'R.%s=(R.%s<<%s)|0;'%(ops[0],ops[0],val(ops[1]))
            if mn in('shr','sar'):return 'R.%s=(R.%s%s%s)|0;'%(ops[0],ops[0],'>>>' if mn=='shr' else '>>',val(ops[1]))
            if mn=='cmp':
                A,B=val(ops[0]),val(ops[1]);return 'flags_cf=+((%s>>>0)<(%s>>>0));flags_zf=+((%s)===(%s));{const r=(%s-%s)|0;flags_sf=+(r<0);flags_of=+((((%s)^(%s))&((%s)^r))<0);}'%(A,B,A,B,A,B,A,B,A)
            if mn=='test':
                A,B=val(ops[0]),val(ops[1]);return '{const r=(%s)&(%s);flags_zf=+(r===0);flags_sf=+(r<0);flags_cf=0;flags_of=0;}'%(A,B)
            if mn=='push':return 'R.esp=(R.esp-4)|0;st32(R.esp,%s);'%val(ops[0])
            if mn=='pop':return 'R.%s=ld32(R.esp);R.esp=(R.esp+4)|0;'%ops[0]
            if mn in('wait','nop'):return ';'
            if mn=='fnstcw':
                sz,e=memexpr(ops[0]);return 'st16(%s,0x37f);'%e
            if mn=='fldcw':return ';'
            if mn=='sahf':return '{const ah=(R.eax>>8)&255;flags_cf=ah&1;flags_zf=(ah>>6)&1;}'
            if mn=='fnstsw':return 'R.eax=(R.eax&~0xffff)|fsw;'
            if mn=='ret':
                n=int(ops[0],0) if ops else 0;return 'R.esp=(R.esp+4+%d)|0;return;'%n
            if mn=='call':
                t=int(ops[0],0);return 'R.esp=(R.esp-4)|0;st32(R.esp,0);F[0x%x]();'%t
            if mn=='jmp':return 'pc=0x%x;continue;'%int(ops[0],0)
            J={'jl':'flags_sf!==flags_of','jle':'flags_zf||flags_sf!==flags_of','jge':'flags_sf===flags_of','jg':'!flags_zf&&flags_sf===flags_of','jb':'flags_cf','jbe':'flags_cf||flags_zf','ja':'!flags_cf&&!flags_zf','jae':'!flags_cf','je':'flags_zf','jne':'!flags_zf'}
            if mn in J:return 'if(%s){pc=0x%x;continue;}'%(J[mn],int(ops[0],0))
            # x87
            if mn=='fld':
                if ops[0].startswith('st'):return 'S.push(%s);'%STi(stidx(ops[0]))
                sz,e=memexpr(ops[0]);return 'S.push(ldf%s(%s));'%('64' if sz=='qword' else '32',e)
            if mn=='fild':
                sz,e=memexpr(ops[0]);return 'S.push(ld%s(%s));'%('16s' if sz=='word' else '32',e)
            if mn=='fldz':return 'S.push(0);'
            if mn=='fld1':return 'S.push(1);'
            if mn in('fst','fstp'):
                pop='S.pop();' if mn=='fstp' else ''
                if ops[0].startswith('st'):
                    i=stidx(ops[0]);return '%s=S[S.length-1];%s'%(STi(i),pop) if mn=='fst' else '{const v=S[S.length-1];S.pop();%s=v;}'%STi(i-1)
                sz,e=memexpr(ops[0]);return 'stf%s(%s,S[S.length-1]);%s'%('64' if sz=='qword' else '32',e,pop)
            if mn=='fistp':
                sz,e=memexpr(ops[0]);return 'sti32(%s,rnd(S.pop()));'%e
            if mn=='fxch':
                i=stidx(ops[0]) if ops else 1;return '{const t=%s;%s=S[S.length-1];S[S.length-1]=t;}'%(STi(i),STi(i))
            if mn=='fabs':return 'S[S.length-1]=Math.abs(S[S.length-1]);'
            if mn=='fchs':return 'S[S.length-1]=-S[S.length-1];'
            if mn=='fsqrt':return 'S[S.length-1]=Math.sqrt(S[S.length-1]);'
            if mn=='fsin':return 'S[S.length-1]=Math.sin(S[S.length-1]);'
            if mn=='fcos':return 'S[S.length-1]=Math.cos(S[S.length-1]);'
            if mn in('fcom','fcomp','fcompp'):
                if ops:
                    if ops[0].startswith('st'):src=STi(stidx(ops[0]))
                    else:
                        sz,e=memexpr(ops[0]);src='ldf%s(%s)'%('64' if sz=='qword' else '32',e)
                else:src=STi(1)
                s='{const a=S[S.length-1],b=%s;fsw=(a<b?0x100:0)|(a===b?0x4000:0)|((a!==a||b!==b)?0x4500:0);}'%src
                if mn=='fcomp':s+='S.pop();'
                if mn=='fcompp':s+='S.pop();S.pop();'
                return s
            base={'fadd':'+','fsub':'-','fsubr':'r-','fmul':'*','fdiv':'/','fdivr':'r/'}
            pm=re.fullmatch(r'(fadd|fsub|fsubr|fmul|fdiv|fdivr)(p?)',mn)
            if pm:
                op=base[pm.group(1)];pop=pm.group(2)=='p'
                def comb(a,b):  # a op b ; r-: b-a
                    if op.startswith('r'):return '(%s)%s(%s)'%(b,op[1:],a)
                    return '(%s)%s(%s)'%(a,op,b)
                if pop:
                    i=stidx(ops[0]) if ops else 1
                    return '{const t=S.pop();%s=%s;}'%(STi(i-1),comb(STi(i-1),'t')) if False else '{const a=%s,b=S[S.length-1];%s=%s;S.pop();}'%(STi(i),STi(i),comb('a','b'))
                if len(ops)==1:
                    if ops[0].startswith('st'):return 'S[S.length-1]=%s;'%comb(STi(0),STi(stidx(ops[0])))
                    sz,e=memexpr(ops[0]);return 'S[S.length-1]=%s;'%comb(STi(0),'ldf%s(%s)'%('64' if sz=='qword' else '32',e))
                if len(ops)==2:
                    d,s=stidx(ops[0]),stidx(ops[1])
                    return '%s=%s;'%(STi(d),comb(STi(d),STi(s)))
            raise Exception('unhandled '+ins)
        out.append(c+cc(mn,ops))
    out.append('return;}}}')
    return '\n'.join(out)
for spec in sys.argv[2:]:
    n,s,e=spec.split(':');print(gen(n,int(s,16),int(e,16)))
