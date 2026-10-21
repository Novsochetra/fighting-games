#!/usr/bin/env python3
"""Bake a Shade's weapon variants from its sword strips.

The PixelLab hero sprites all hold the glowing sword. For every frame this finds the blade
(a straight run of glowing pixels sticking out of the body), erases it, recolours the slash
smear for the weapon, and draws a spear or an axe along the same grip line. Fists get the
blade removed and a gold smear.

Output: <hero folder>/arsenal/hero_<anim>.png, one strip per animation with four rows
of 128x80 frames: sword (the original), fists, spear, axe.

    pip install numpy scipy pillow
    python3 tools/bake_hero_weapons.py            # Moss Shade, assets/sprites/hero/
    python3 tools/bake_hero_weapons.py firefly    # assets/sprites/heroes/firefly/ (also antler, blue, ember, bokator)

The Moss Shade's blade glows green; the Firefly, Antler Spirit and Blue Shades' blades glow blue or
teal, so for them the glow tests read the stronger of the green and blue channels; the Ember Shade's
blade burns red and orange, so for it they read red against blue. Grip overrides are Moss-only, but for
EMBER_OVERRIDES; the Ember Shade's spear keeps the sword's fire smear instead of a recoloured one, and its
attacks come from its own spear moves in heroes/ember/spear/ instead. The Bokator fighter's blade glows
white-gold against tan skin: it is found as the longest straight run of gold, erased with its edges and
the sparkles round it, and his fists row takes his own bare-hand moves from heroes/bokator/fists/.

OVERRIDES fixes frames where detection misses: g = grip, t = blade tip, in frame pixels;
hide = recolour the smear only and draw no weapon (strike frames where the blade is lost in the smear).
"""
import json, math, os, numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
import sys
SPRITES=os.path.join(ROOT,'apps/web/games/steel-and-dust/assets/sprites/')
HERO=SPRITES+'hero/'
VARIANT=sys.argv[1] if len(sys.argv)>1 and sys.argv[1]!='moss' else None
SRC=SPRITES+'heroes/'+VARIANT+'/' if VARIANT else HERO
OUT=SRC+'arsenal/'
COOL=VARIANT is not None
WARM=VARIANT=='ember'
GILDED=VARIANT=='bokator'
meta=json.load(open(HERO+'hero.json'))

# the Bokator fighter's blade glows white-gold against his tan skin: bright and pale, or bright and
# yellower than skin; the test is all or nothing, so it hands back full glow against no base
def gold_glow(fr):
    hsv=np.array(Image.fromarray(fr[...,:3].astype(np.uint8),'RGB').convert('HSV')).astype(float)
    hue,sat,val=hsv[...,0]*360/255,hsv[...,1],hsv[...,2]
    return (val>225)&((sat<140)|(hue>41))

def glow_and_base(fr):
    r,g,b=[fr[...,i].astype(int) for i in range(3)]
    if GILDED: return np.where(gold_glow(fr),255,0),np.zeros_like(r)
    if WARM: return r,b
    return (np.maximum(g,b) if COOL else g),r
FW,FH=128,80
ANIMS=list(meta['animations'].keys())

OVERRIDES={
 "walk": {
  "6": {
   "g": [
    63,
    55
   ],
   "t": [
    78,
    71
   ]
  },
  "7": {
   "g": [
    63,
    56
   ],
   "t": [
    77,
    72
   ]
  }
 },
 "jump": {
  "6": {
   "g": [
    73,
    33
   ],
   "t": [
    87,
    17
   ]
  },
  "7": {
   "g": [
    73,
    37
   ],
   "t": [
    87,
    21
   ]
  }
 },
 "juggle": {
  "1": {
   "g": [
    62,
    40
   ],
   "t": [
    75,
    24
   ]
  }
 },
 "dash": {
  "0": {
   "hide": True
  }
 },
 "slash1": {
  "3": {
   "hide": True
  },
  "4": {
   "hide": True
  }
 },
 "slash2": {
  "3": {
   "hide": True
  },
  "4": {
   "hide": True
  }
 },
 "rising_dragon": {
  "2": {
   "hide": True
  },
  "3": {
   "hide": True
  },
  "4": {
   "hide": True
  }
 },
 "cleave": {
  "2": {
   "hide": True
  },
  "3": {
   "g": [
    78,
    58
   ],
   "t": [
    93,
    76
   ]
  }
 },
 "air_slash": {
  "2": {
   "g": [
    82,
    56
   ],
   "t": [
    92,
    74
   ]
  },
  "3": {
   "g": [
    82,
    57
   ],
   "t": [
    95,
    75
   ]
  }
 },
 "air_rising_cut": {
  "2": {
   "hide": True
  },
  "3": {
   "hide": True
  }
 },
 "meteor_slash": {
  "2": {
   "hide": True
  },
  "3": {
   "hide": True
  }
 }
}

def masks(fr):
    g,r=glow_and_base(fr); A=fr[...,3]>0
    Gp=A&(g>=140)&(g-r>=80)
    tr=nd.uniform_filter((~A).astype(float),size=7,mode='constant',cval=1.0)
    F=Gp&(tr>=0.42)
    return A,Gp,F

# embers drift loose all round the Ember Shade and its armour glows through the cracks, so only
# clumps of glow count, and the blade is found wherever it meets open air, not only at its tip
def warm_glow(A,Gp):
    lab,n=nd.label(Gp,structure=np.ones((3,3)))
    clumped=Gp&(np.bincount(lab.ravel())[lab]>=5)
    tr=nd.uniform_filter((~A).astype(float),size=5,mode='constant',cval=1.0)
    return clumped,clumped&(tr>=0.2)

def detect_line(fr):
    A,Gp,F=masks(fr)
    if WARM or GILDED: Gp,F=warm_glow(A,Gp)
    ys,xs=np.nonzero(F)
    if len(xs)<4: return None
    gy,gx=np.nonzero(Gp)
    best=None
    for th in np.arange(0,180,1.5):
        t=math.radians(th); nx,ny=math.cos(t),math.sin(t)
        rho=xs*nx+ys*ny; rg=gx*nx+gy*ny
        bins=np.round(rho).astype(int); gb=np.round(rg).astype(int)
        lo=min(bins.min(),gb.min()); 
        hist=np.bincount(bins-lo)+0.25*np.bincount(gb-lo,minlength=0)[:0].sum() if False else np.bincount(bins-lo)
        # smooth over +-1
        h=hist.astype(float); hs=h.copy(); hs[1:]+=h[:-1]; hs[:-1]+=h[1:]
        k=int(hs.argmax()); v=hs[k]
        if best is None or v>best[0]: best=(v,th,k+lo)
    v,th,rho0=best
    t=math.radians(th); nx,ny=math.cos(t),math.sin(t); dx,dy=-ny,nx
    # pixels near line
    d=gx*nx+gy*ny-rho0; near=np.abs(d)<=1.6
    px_,py_=gx[near],gy[near]; tt=px_*dx+py_*dy
    isF=F[py_,px_]
    order=np.argsort(tt); tt=tt[order]; isF=isF[order]
    # longest run with gaps<=2, maximizing F count
    runs=[];s=0
    for i in range(1,len(tt)+1):
        if i==len(tt) or tt[i]-tt[i-1]>2.5:
            runs.append((isF[s:i].sum(),tt[s],tt[i-1])); s=i
    runs.sort(reverse=True)
    fcount,t0,t1=runs[0]
    if fcount<4 or t1-t0<6: return None
    p0=(dx*t0+nx*rho0, dy*t0+ny*rho0); p1=(dx*t1+nx*rho0, dy*t1+ny*rho0)
    # grip = end closer to body centroid (dense opaque area)
    dens=nd.uniform_filter(A.astype(float),size=9)
    cy,cx=np.nonzero(dens>0.85)
    if len(cx)==0: cy,cx=np.nonzero(A)
    c=(cx.mean(),cy.mean())
    if math.dist(p1,c)<math.dist(p0,c): p0,p1=p1,p0
    return dict(g=[round(p0[0],1),round(p0[1],1)],t=[round(p1[0],1),round(p1[1],1)],f=int(fcount))


def smear_mask(fr):
    g,r=glow_and_base(fr); A=fr[...,3]>0; mx=fr[...,:3].max(-1).astype(int)
    B=A&(g>=190)&(g-r>=120)
    cnt=nd.uniform_filter(B.astype(float),size=3)*9
    seed=B&(cnt>=7.5)
    lab,n=nd.label(B|seed,structure=np.ones((3,3)))
    dens=nd.uniform_filter(A.astype(float),size=9)
    keep=np.zeros_like(A)
    # the Ember Shade's cloak and armour burn in the smear's own colours: only a swing-sized blaze is a smear
    smallest=120 if WARM or GILDED else 14
    for i in range(1,n+1):
        m=lab==i
        if not (seed&m).any() or m.sum()<smallest: continue
        if m.sum()<80 and (dens[m]<0.8).mean()<0.3: continue          # glow that sits inside the body (chest emblem, eyes)
        keep|=m
    dark=A&~((g-r>=30)&(g>=60))&(mx<90)
    nearDark=nd.binary_dilation(dark,structure=np.ones((3,3)))
    loose=A&(g>=150)&(g-r>=90)&(dens<0.42)&~nearDark
    if not (WARM or GILDED): keep|=loose
    if keep.any():
        ring=nd.binary_dilation(keep,structure=np.ones((3,3)))&~keep&A
        keep|=ring&((g-r>=40)&(g>=100)|(mx>=120)&(dens<0.85))
    return keep

def endpoint_density(A,Gp,p):
    x,y=p; h,w=A.shape
    x0,x1=max(0,int(x)-5),min(w,int(x)+6); y0,y1=max(0,int(y)-5),min(h,int(y)+6)
    return (A[y0:y1,x0:x1]&~Gp[y0:y1,x0:x1]).sum()


# the Bokator fighter's blade is the longest straight run of gold in the frame; its grip is the end
# nearer the body
def gilded_blade(fr):
    A=fr[...,3]>0; glow=gold_glow(fr)&A
    lab,n=nd.label(glow,structure=np.ones((3,3)))
    body=np.argwhere(A&~glow).mean(0)[::-1]
    best=None
    for i in range(1,n+1):
        ys,xs=np.nonzero(lab==i)
        if len(xs)<12: continue
        pts=np.c_[xs,ys].astype(float); c=pts.mean(0)
        u=np.linalg.eigh(np.cov((pts-c).T))[1][:,-1]
        along=(pts-c)@u; across=(pts-c)@np.array([-u[1],u[0]])
        length=along.max()-along.min()
        if length<12 or length<4*max(1.0,across.std()*2): continue
        if best is None or length>best[0]: best=(length,c+u*along.min(),c+u*along.max())
    if best is None: return None
    _,p0,p1=best
    if math.dist(p1,body)<math.dist(p0,body): p0,p1=p1,p0
    return dict(g=[round(p0[0],1),round(p0[1],1)],t=[round(p1[0],1),round(p1[1],1)])

# his blade is wide, with an amber edge and a dark outline either side: along the blade those go too,
# but where the blade crosses his body only the gold itself, so no groove is cut into a leg
def gilded_rails(fr,A,Gp,tr,band):
    hsv=np.array(Image.fromarray(fr[...,:3].astype(np.uint8),'RGB').convert('HSV')).astype(float)
    hue,sat,val=hsv[...,0]*360/255,hsv[...,1],hsv[...,2]
    amber=(hue>20)&(hue<55)&(val>140)&(sat>90)
    black=fr[...,:3].max(-1)<45
    return band&A&(Gp|((amber|black)&(tr>=0.2)))

# the sparkles drawn round his blade are left floating once it is gone
def without_sparkles(img,band):
    lab,n=nd.label(img[...,3]>0,structure=np.ones((3,3)))
    sizes=np.bincount(lab.ravel())
    outside=np.bincount(lab[~band].ravel(),minlength=n+1)
    loose=(sizes<=6)&(outside==0); loose[0]=False
    img=img.copy(); img[loose[lab]]=0
    return img

def detect(fr):
    if GILDED: return gilded_blade(fr)
    det=detect_line(fr)
    if not det: return None
    A,Gp,F=masks(fr)
    g,t=det['g'],det['t']
    if endpoint_density(A,Gp,t)>endpoint_density(A,Gp,g): g,t=t,g
    return dict(g=g,t=t)

# in an attack frame with a big smear the blade line is lost in the glow; only the smear is recoloured
ATTACKS={'slash1','slash2','spin_slash','thrust','rising_dragon','cleave','air_slash','air_rising_cut','meteor_slash','plunge'}
# the Ember Shade's own grip fix: on this frame detection takes the smear's tail on the ground for the blade
EMBER_OVERRIDES={'slash1':{'3':{'g':[65,50],'t':[87,69]}}}

def frame_annotation(n,fr,ov,k):
    smear=COOL and n in ATTACKS and smear_mask(fr).sum()>=100
    # the Moss Shade hides the weapon in its smear on these frames; the Ember Shade's take on some of
    # them has no smear at all, so its blade would show in every other weapon's row
    if str(k) in ov and not (WARM and ov[str(k)].get('hide') and not smear): return ov[str(k)]
    if smear: return {'hide':True}
    return detect(fr)

def annotations():
    out={}
    for n in ANIMS:
        a=meta['animations'][n]; im=np.array(Image.open(SRC+a['file']).convert('RGBA'))
        ov=OVERRIDES.get(n,{})
        if COOL: ov={k:v for k,v in ov.items() if v.get('hide')}
        if WARM: ov={**ov,**EMBER_OVERRIDES.get(n,{})}
        out[n]=[frame_annotation(n,im[:,k*FW:(k+1)*FW],ov,k) for k in range(a['frames'])]
    return out


def hx(s): s=s.lstrip('#'); return np.array([int(s[i:i+2],16) for i in (0,2,4)]+[255],dtype=np.uint8)
RAMPS={'fists':['#9a4a1a','#e8822a','#ffd23f','#fff3b0'],
       'spear':['#2a5f9e','#4fb0ff','#a8e6ff','#f2fdff'],
       'axe':['#8e2a1c','#e0603a','#ffa640','#ffeec0']}
OL=hx('#0b0a10')
WOOD=hx('#6e4224');WOODH=hx('#a8703c');WOODD=hx('#4a2a16')
STEEL=hx('#c3ccd8');STEELH=hx('#f4f8ff');STEELD=hx('#7d8899')
GOLD=hx('#d9a441');RED=hx('#d8432f');REDD=hx('#8e2a1c')

def put(L,x,y,c):
    xi,yi=int(round(x)),int(round(y))
    if 0<=xi<L.shape[1] and 0<=yi<L.shape[0]: L[yi,xi]=c
def line(L,p,q,c):
    n=int(max(abs(q[0]-p[0]),abs(q[1]-p[1]))*1.5)+1
    for i in range(n+1):
        put(L,p[0]+(q[0]-p[0])*i/n,p[1]+(q[1]-p[1])*i/n,c)
def fill_poly(L,pts,c):
    xs=[p[0] for p in pts];ys=[p[1] for p in pts]
    for y in range(int(math.floor(min(ys))),int(math.ceil(max(ys)))+1):
        for x in range(int(math.floor(min(xs))),int(math.ceil(max(xs)))+1):
            # point in polygon on pixel center
            inside=False;j=len(pts)-1
            for i in range(len(pts)):
                xi,yi=pts[i];xj,yj=pts[j]
                if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi+1e-9)+xi: inside=not inside
                j=i
            if inside: put(L,x,y,c)

def erase_blade(fr,g,t):
    out=fr.copy(); A,Gp,F=masks(fr)
    gg,r=glow_and_base(fr)
    greenish=(gg-r>=30)&(gg>=60)
    tr=nd.uniform_filter((~A).astype(float),size=5,mode='constant',cval=1.0)
    g=np.array(g,float);t=np.array(t,float);u=(t-g)/max(1e-6,np.linalg.norm(t-g));L=np.linalg.norm(t-g)
    ys,xs=np.mgrid[0:FH,0:FW]
    px=xs-g[0];py=ys-g[1];along=px*u[0]+py*u[1];perp=np.abs(-px*u[1]+py*u[0])
    seg=(along>=-0.5)&(along<=L+2.5)
    kill=seg&A&(((perp<=1.5)&greenish)|((perp<=2.3)&(tr>=0.3)))
    if GILDED: kill|=gilded_rails(fr,A,Gp,tr,seg&(along>=2)&(perp<=3.4))
    out[kill]=0
    if GILDED: out=without_sparkles(out,(along>=2)&(along<=L+8)&(perp<=8))
    # walk inward from the grip while the line is still glowing green: that is the hilt end of the blade
    grip=g.copy();miss=0
    for s in range(1,10):
        p=g-u*s;hit=False
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                x,y=int(round(p[0]+dx)),int(round(p[1]+dy))
                if 0<=x<FW and 0<=y<FH and Gp[y,x] and abs(-(x-g[0])*u[1]+(y-g[1])*u[0])<=1.3:
                    hit=True
                    nb=[fr[yy,xx] for yy in range(y-2,y+3) for xx in range(x-2,x+3)
                        if 0<=xx<FW and 0<=yy<FH and fr[yy,xx,3]>0 and not Gp[yy,xx] and not greenish[yy,xx]]
                    out[y,x]=(np.median(np.array(nb),0).astype(np.uint8) if nb else np.array([28,28,28,255],np.uint8))
                    out[y,x,3]=255
        if hit: grip=p.copy();miss=0
        else:
            miss+=1
            if miss>=2: break
    return out,grip,u,L+np.linalg.norm(grip-g)

def recolor_smear(img,sm,ramp):
    out=img.copy(); cols=[hx(c) for c in ramp]
    r,g,b=[img[...,i].astype(float) for i in range(3)]
    l=(0.25*r+0.6*g+0.15*b)/255
    for y,x in zip(*np.nonzero(sm&(img[...,3]>0))):
        v=l[y,x]; k=0 if v<0.42 else 1 if v<0.56 else 2 if v<0.75 else 3
        out[y,x]=cols[k]
    return out

def outline_layer(L):
    m=L[...,3]>0
    ring=nd.binary_dilation(m,structure=np.array([[0,1,0],[1,1,1],[0,1,0]]))&~m
    O=np.zeros_like(L);O[ring]=OL;O[m]=L[m]
    return O

def comp(base,layer):
    out=base.copy();m=layer[...,3]>0;out[m]=layer[m];return out

def draw_spear(G,u,L):
    Ly=np.zeros((FH,FW,4),np.uint8); n=np.array([-u[1],u[0]])
    if n[1]<0: n=-n                      # n points "down"
    a=G-u*11; tip=G+u*(L+9)
    hb=tip-u*7                           # head base
    line(Ly,a,hb,WOOD); line(Ly,a+n*0.9,hb+n*0.9,WOODD); line(Ly,a-n*0.6,hb-n*0.6,WOODH)
    pts=[hb+n*1.6,hb+u*3+n*2.0,tip,hb+u*3-n*2.0,hb-n*1.6]
    fill_poly(Ly,pts,STEEL); line(Ly,hb+u*1,tip-u*0.5,STEELH); line(Ly,hb+u*3+n*1.6,tip,STEELD)
    line(Ly,hb-n*1.8,hb+n*1.8,GOLD)
    for k in range(1,4): put(Ly,*(hb-u*1+np.array([0,k])),RED if k<3 else REDD); put(Ly,*(hb-u*2+np.array([0,k+0.5])),REDD)
    return outline_layer(Ly)

def draw_axe(G,u,L,glow):
    Ly=np.zeros((FH,FW,4),np.uint8); n=np.array([-u[1],u[0]])
    if n[0]<-0.3 or (abs(n[0])<=0.3 and n[1]<0): n=-n     # blade faces forward (or down)
    H=max(12,min(17,L*0.85)); a=G-u*3; e=G+u*H
    line(Ly,a,e,WOOD); line(Ly,a-n*0.9,e-n*0.9,WOODD); line(Ly,a+n*0.6,e+n*0.6,WOODH)
    c=e-u*2.5
    pts=[c+n*0.5-u*2,c+n*0.5+u*2,c+n*5.5+u*4.5,c+n*6.5+u*1,c+n*6.5-u*1.5,c+n*5.5-u*4.5]
    fill_poly(Ly,pts,STEEL)
    line(Ly,c+n*6.2+u*3.5,c+n*6.2-u*3.5,STEELH); line(Ly,c+n*5.6+u*4.2,c+n*5.6-u*4.2,STEELH)
    line(Ly,c+n*1.5-u*1.5,c+n*1.5+u*1.5,STEELD)
    for k in (1,2): put(Ly,*(c-n*k),STEELD)   # back spike
    put(Ly,*(c+n*7+u*0),glow)
    put(Ly,*(c-u*0.5+n*0),GOLD)
    return outline_layer(Ly)

WCOL={'fists':hx('#ffd23f'),'spear':hx('#a8e6ff'),'axe':hx('#ffa640')}
def render_frame(fr,ann,weapon):
    sm=smear_mask(fr)
    if weapon=='sword': return fr
    img=fr.copy(); grip=None
    if ann and 'g' in ann:
        img,grip,u,L=erase_blade(fr,ann['g'],ann['t'])
        if ann.get('len'): L=ann['len']
    # the Ember Shade's spear burns with its sword's own fire, so its smear keeps the sword's colours
    if not (WARM and weapon=='spear'): img=recolor_smear(img,sm,RAMPS[weapon])
    if ann and 'g' in ann and not ann.get('hide'):
        if weapon=='spear': img=comp(img,draw_spear(grip,u,L))
        elif weapon=='axe': img=comp(img,draw_axe(grip,u,L,WCOL['axe']))
    return img

WEAPS=['sword','fists','spear','axe']
def save_indexed(a,path):
    # exact palette PNG (pixel art has well under 256 colours), about a third of the RGBA size
    a=a.copy(); a[a[...,3]==0]=0
    cols,inv=np.unique(a.reshape(-1,4),axis=0,return_inverse=True)
    assert len(cols)<=256, path
    im=Image.fromarray(inv.reshape(a.shape[:2]).astype(np.uint8),'P')
    im.putpalette(cols[:,:3].astype(np.uint8).tobytes())
    im.save(path,optimize=True,transparency=bytes(cols[:,3].astype(np.uint8)))
# a hero with moves of its own for a weapon keeps them in <hero>/<weapon>/ (the Ember Shade's spear,
# the Bokator fighter's bare hands), one row per attack with the sword strip's frame count; they take
# that weapon's row instead of a sword swing with the weapon drawn in
def own_row(n,N,weapon):
    path=SRC+weapon+'/hero_'+n+'.png'
    if not os.path.exists(path): return None
    row=np.array(Image.open(path).convert('RGBA'))
    assert row.shape==(FH,FW*N,4), path
    return row

def bake_all(ann,outdir=None):
    res={}
    for n in ANIMS:
        a=meta['animations'][n]; im=np.array(Image.open(SRC+a['file']).convert('RGBA'))
        N=a['frames']; strip=np.zeros((FH*4,FW*N,4),np.uint8)
        for k in range(N):
            fr=im[:,k*FW:(k+1)*FW]
            for wi,w in enumerate(WEAPS):
                strip[wi*FH:(wi+1)*FH,k*FW:(k+1)*FW]=render_frame(fr,ann[n][k],w)
        if n=='dash':strip[:,0:FW]=strip[:,FW:2*FW]   # the first dash frame is a full-body smear; the game shows the clean lean frames only
        for wi,w in enumerate(WEAPS):
            own=own_row(n,N,w)
            if own is not None: strip[wi*FH:(wi+1)*FH]=own
        res[n]=strip
        if outdir: save_indexed(strip,outdir+'hero_'+n+'.png')
    return res


if __name__=='__main__':
    os.makedirs(OUT,exist_ok=True)
    bake_all(annotations(),OUT)
    print('wrote',len(ANIMS),'strips to',os.path.relpath(OUT,ROOT))
