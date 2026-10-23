#!/usr/bin/env python3
"""Bake a Shade's weapon variants from its sword strips.

The PixelLab hero sprites all hold the glowing sword. For every frame this finds the blade
(a straight run of glowing pixels sticking out of the body), erases it, recolours the slash
smear for the weapon, and draws a spear or an axe along the same grip line. Fists get the
blade removed and a gold smear.

Output: <hero folder>/arsenal/hero_<anim>.png, one strip per animation with four rows
of 128-wide frames as tall as the hero's own (80 px, 112 for the Bokator fighter): sword (the
original), fists, spear, axe. A spear is held shorter where its head would leave the frame, and an
axe lying along the ground keeps its blade above it.

    pip install numpy scipy pillow
    python3 tools/bake_hero_weapons.py            # Moss Shade, assets/sprites/hero/
    python3 tools/bake_hero_weapons.py firefly    # assets/sprites/heroes/firefly/ (also antler, blue, ember, bokator, angkor)

The Moss Shade's blade glows green; the Firefly, Antler Spirit and Blue Shades' blades glow blue or
teal, so for them the glow tests read the stronger of the green and blue channels, and the Firefly
and Blue Shades' white blade cores count as glow too; the Ember Shade's
blade burns red and orange, so for it they read red against blue. Grip overrides are Moss-only, but for
OWN_OVERRIDES; the Ember Shade's spear keeps the sword's fire smear instead of a recoloured one, and its
attacks come from its own spear moves in heroes/ember/spear/ instead. The Bokator fighter's blade glows
white-gold against tan skin: it is found as the longest thin straight run of gold (his OWN_OVERRIDES
give the line where it is not), all of it goes wherever open air lies either side of it, where it
crosses his body it is covered with what lies beside it and the new edge gets his dark outline, only
smears count as hide frames for him, and his fists row takes his own bare-hand moves from
heroes/bokator/fists/. The Angkor Warrior's gold blade is found and taken away the same way.

OVERRIDES fixes frames where detection misses: g = grip, t = blade tip, in frame pixels;
hide = recolour the smear only and draw no weapon (strike frames where the blade is lost in the smear).
"""
import json, math, os, numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
import sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import shade_fx
SPRITES=os.path.join(ROOT,'apps/web/games/steel-and-dust/assets/sprites/')
HERO=SPRITES+'hero/'
VARIANT=sys.argv[1] if len(sys.argv)>1 and sys.argv[1]!='moss' else None
SRC=SPRITES+'heroes/'+VARIANT+'/' if VARIANT else HERO
OUT=SRC+'arsenal/'
COOL=VARIANT is not None
WARM=VARIANT=='ember'
GILDED=VARIANT in ('bokator','angkor')
# the Firefly and Blue Shades' blades burn white at the core, edged in cyan or blue
PALE=VARIANT in ('firefly','blue')
WHITE_CORE=190
# and their glowing edge reaches this far either side of the blade's line
PALE_EDGE=3.2
PALE_TIP=4.5
# the Moss Shade's blade glows out to this far either side of its line and lies across his cloak and
# legs as often as out in the open, so his body is mended under it the way theirs is
MOSS=VARIANT is None
BRIDGED=PALE or MOSS
MOSS_EDGE=2.3
BLADE_LONGEST=48
meta=json.load(open(HERO+'hero.json'))

# the Bokator fighter's blade glows white-gold against his tan skin: bright and pale, or bright and
# yellower than skin; the test is all or nothing, so it hands back full glow against no base
def gold_glow(fr):
    hsv=np.array(Image.fromarray(fr[...,:3].astype(np.uint8),'RGB').convert('HSV')).astype(float)
    hue,sat,val=hsv[...,0]*360/255,hsv[...,1],hsv[...,2]
    return (val>225)&((sat<140)|(hue>41))

# a white blade core has as much red as blue, so it read as no glow: the blade was found by the
# sparks round it instead, and its core was left behind as a dotted line when it was taken away
def glow_and_base(fr,white=True):
    r,g,b=[fr[...,i].astype(int) for i in range(3)]
    if GILDED: return np.where(gold_glow(fr),255,0),np.zeros_like(r)
    if WARM: return r,b
    if PALE and white: r=np.where(fr[...,:3].min(-1)>=WHITE_CORE,0,r)
    return (np.maximum(g,b) if COOL else g),r
# frames are 128 wide; the Shades' are 80 tall, and a hero whose sword reaches higher has taller ones
FW=128
FH=Image.open(SRC+meta['animations']['idle']['file']).height
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

# the Firefly and Blue Shades hold their blade across the body as often as out in the open, so its
# white core counts toward the line wherever it lies, not only where open air is beside it
def line_votes(fr,A,F):
    if PALE: return F|(A&(fr[...,:3].min(-1)>=WHITE_CORE))
    return F

def detect_line(fr):
    A,Gp,F=masks(fr)
    if WARM or GILDED: Gp,F=warm_glow(A,Gp)
    ys,xs=np.nonzero(F:=line_votes(fr,A,F))
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


# a swing's smear is recoloured as it always was, white core and all; only out of a swing does white
# count, for the arcs a blade leaves as it flails, since there a white belt never runs into one
SMEAR_PIECE=60
def smear_mask(fr,swing=False,armour=True,strike=False,blade=None):
    g,r=glow_and_base(fr,white=not swing); A=fr[...,3]>0; mx=fr[...,:3].max(-1).astype(int)
    B=A&(g>=190)&(g-r>=120)
    cnt=nd.uniform_filter(B.astype(float),size=3)*9
    seed=B&(cnt>=7.5)
    lab,n=nd.label(B|seed,structure=np.ones((3,3)))
    dens=nd.uniform_filter(A.astype(float),size=9)
    keep=np.zeros_like(A)
    # the Ember Shade's cloak and armour burn in the smear's own colours: only a swing-sized blaze is a smear
    smallest=120 if WARM or GILDED else 14
    sizes=np.bincount(lab.ravel())
    # the Bokator fighter's swing breaks where it passes in front of him: once one piece of it is
    # swing-sized, the smaller pieces count as well
    if GILDED and any(sizes[i]>=smallest and (seed&(lab==i)).any() for i in range(1,n+1)): smallest=SMEAR_PIECE
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
    if not (PALE and armour): return keep
    armour=body_glow(fr,A,strike,blade)
    # an eye or a seam right beside the face or the armour stays as drawn with them
    bright=(g>=150)&(g-r>=90)
    beside=nd.binary_dilation(armour,structure=np.ones((3,3)))&~bright
    return keep&~(armour|beside)|(open_white(fr,A) if strike else False)

# the Firefly Shade's art scatters small cyan sparks round him that are his spirit's, not his blade's:
# recoloured as smear they turned gold in one row and blue in the next, so a small loose spark clear of
# the swing stays as drawn in every row
SPARKS=VARIANT=='firefly'
SPARK_MOST=8
SPARK_SPAN=3
SPARK_CLEAR=4
def loose_sparks(fr,sm,band):
    body=(fr[...,3]>0)&~sm&(~band if band is not None else True)
    lab,n=nd.label(sm,structure=np.ones((3,3),bool)); sizes=np.bincount(lab.ravel()); sizes[0]=0
    big=(sizes>=20)[lab]
    clear=nd.distance_transform_edt(~big)>=SPARK_CLEAR if big.any() else np.ones_like(body)
    out=np.zeros_like(body)
    for i,(rows,cols) in enumerate(nd.find_objects(lab),1):
        m=lab==i; beside=nd.binary_dilation(m)&body
        small=sizes[i]<=SPARK_MOST and max(rows.stop-rows.start,cols.stop-cols.start)<=SPARK_SPAN
        if small and clear[m].all() and not beside.any(): out|=m
    return out

# in a strike lost in its smear, the white of the swing out in the open is part of it too
OPEN_WHITE=0.3
def open_white(fr,A):
    white=A&(fr[...,:3].min(-1)>=WHITE_CORE)
    lab,n=nd.label(white,structure=np.ones((3,3)))
    out=np.zeros_like(A)
    for i in range(1,n+1):
        m=lab==i
        ring=nd.binary_dilation(m,structure=np.ones((3,3)))&~m
        if m.sum()>=8 and (ring&~A).sum()>=OPEN_WHITE*ring.sum(): out|=m
    return out

# the Blue Shade's tunic, armour and face, and the Firefly Shade's, glow as bright as a swing; a
# swing's flash meets open air or lies in its own white, while armour and face lie wrapped in the dark
# of the body, so that glow is never a smear. Armour a blade lies against touches its white on one
# side; in a strike, where the blade stays and is recoloured, the glow it blazes through goes with it
ARMOUR_AIR=0.2
IN_WHITE=0.5
BLAZE=0.18
def body_glow(fr,A,strike=False,blade=None):
    white=A&(fr[...,:3].min(-1)>=WHITE_CORE)
    g,r=glow_and_base(fr,white=False)
    # the blade's own glowing edge is taken away with it, so armour it touches is judged on its own
    colour=A&(g>=100)&(g-r>=40)&~white&(~blade if blade is not None else True)
    lab,n=nd.label(colour,structure=np.ones((3,3)))
    out=np.zeros_like(A)
    for i in range(1,n+1):
        m=lab==i
        ring=nd.binary_dilation(m,structure=np.ones((3,3)))&~m
        air,lit=(ring&~A).sum()/ring.sum(),(ring&white).sum()/ring.sum()
        if air<ARMOUR_AIR and lit<(BLAZE if strike else IN_WHITE): out|=m
    return out

def endpoint_density(A,Gp,p):
    x,y=p; h,w=A.shape
    x0,x1=max(0,int(x)-5),min(w,int(x)+6); y0,y1=max(0,int(y)-5),min(h,int(y)+6)
    return (A[y0:y1,x0:x1]&~Gp[y0:y1,x0:x1]).sum()


BLADE_WIDTH=4.0
SLENDER=10

# his blade's gold: the white-gold glow, or a bright yellow, yellower than his skin
def blade_colours(fr):
    hsv=np.array(Image.fromarray(fr[...,:3].astype(np.uint8),'RGB').convert('HSV')).astype(float)
    hue,sat,val=hsv[...,0]*360/255,hsv[...,1],hsv[...,2]
    return (fr[...,3]>0)&(gold_glow(fr)|((val>190)&(hue>=28)&(hue<=60)&(sat>90)))

# the Bokator fighter's blade is the longest straight run of gold in the frame; its grip is the end
# nearer the body
def gilded_blade(fr):
    A=fr[...,3]>0; glow=blade_colours(fr)
    lab,n=nd.label(glow,structure=np.ones((3,3)))
    body=np.argwhere(A&~glow).mean(0)[::-1]
    best=None
    for i in range(1,n+1):
        ys,xs=np.nonzero(lab==i)
        if len(xs)<12: continue
        pts=np.c_[xs,ys].astype(float); c=pts.mean(0)
        u=np.linalg.eigh(np.cov((pts-c).T))[1][:,-1]
        along=(pts-c)@u; across=(pts-c)@np.array([-u[1],u[0]])
        length=along.max()-along.min(); width=across.std()*2
        # his blade is a thin run; the glowing sash and hand wraps are as long but wider, while a blade
        # drawn a little wider still runs ten times its width
        if length<12 or (width>BLADE_WIDTH and length<SLENDER*width): continue
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

# the bright part of his blade is the gold run that is found; its darker lower part runs on toward his
# fist, so the blade is followed back along its line for as long as open air lies on both sides of it,
# which stops it at his fist and never cuts into an arm or a leg it passes; along the run itself, wherever
# open air lies on both sides, all of it goes, its amber base and dark edges too
SHAFT_BACK=40
SHAFT_OPEN=(5,6)
def gilded_shaft(A,g,u,along,perp,L):
    n=np.array([-u[1],u[0]])
    def open_at(p):
        x,y=int(round(p[0])),int(round(p[1]))
        return not (0<=x<FW and 0<=y<FH) or not A[y,x]
    def free(t):
        return all(open_at(g+u*t+n*d) and open_at(g+u*t-n*d) for d in SHAFT_OPEN)
    reach=0
    for t in range(0,-SHAFT_BACK-1,-1):
        if not free(t): break
        reach=t
    ahead=np.array([free(t) for t in range(int(L)+4)])
    free_here=ahead[np.clip(np.round(along).astype(int),0,len(ahead)-1)]
    back=(along>=reach-0.5)&(along<0)&(reach<0)
    return A&(perp<=3.4)&(along<=L+2.5)&(back|((along>=0)&free_here))

# where the blade lies across his body, from the white wrap of his fist to its tip, it is covered with what
# lies just either side of it, so his sash and trousers run on where the blade and its dark edges were
COVER=3.4
def covered_shaft(out,fr,body,g,u,along,L):
    n=np.array([-u[1],u[0]])
    hsv=np.array(Image.fromarray(fr[...,:3].astype(np.uint8),'RGB').convert('HSV')).astype(int)
    wrap=(fr[...,3]>0)&(hsv[...,2]>190)&(hsv[...,1]<70)
    fist=0
    for t in range(0,-SHAFT_BACK-1,-1):
        c=g+u*t
        x,y=int(round(c[0])),int(round(c[1]))
        if wrap[max(0,y-2):y+3,max(0,x-2):x+3].any(): fist=t; break
    ys,xs=np.mgrid[0:FH,0:FW]
    side=(xs-g[0])*n[0]+(ys-g[1])*n[1]
    stripe=body&(along>=fist)&(along<=L+2.5)&(np.abs(side)<=COVER)
    res=out.copy()
    for y,x in zip(*np.nonzero(stripe)):
        sgn=1 if side[y,x]>=0 else -1
        p=np.array([x,y],float)+n*sgn*(2*COVER+1-2*abs(side[y,x]))
        sx,sy=int(round(p[0])),int(round(p[1]))
        # open air beside it means the blade's own edge, which goes with it
        res[y,x]=out[sy,sx] if 0<=sx<FW and 0<=sy<FH else 0
    zone=(along>=fist-1)&(along<=L+3.5)&(np.abs(side)<=COVER+1.5)
    return outlined(res,fr,zone),fist

# where the blade is gone his body has a new edge, drawn in his own dark outline like the rest of him
def outlined(img,fr,zone):
    dark=lambda a:(a[...,3]>0)&(a[...,:3].max(-1)<45)
    ink=np.median(fr[dark(fr)],0).astype(np.uint8)
    air=nd.binary_dilation(img[...,3]==0,structure=np.array([[0,1,0],[1,1,1],[0,1,0]],bool))
    img=img.copy(); img[zone&(img[...,3]>0)&~dark(img)&air]=ink
    return img

# the sparkles drawn round his blade are left floating once it is gone
def without_sparkles(img,band):
    lab,n=nd.label(img[...,3]>0,structure=np.ones((3,3)))
    sizes=np.bincount(lab.ravel())
    outside=np.bincount(lab[~band].ravel(),minlength=n+1)
    loose=(sizes<=8)&(outside==0); loose[0]=False
    img=img.copy(); img[loose[lab]]=0
    return img

CUT_WIDTH=2.0
def cut_runs(img,runs):
    ys,xs=np.mgrid[0:FH,0:FW]
    for x0,y0,x1,y1 in runs:
        g=np.array([x0,y0],float); d=np.array([x1,y1],float)-g; L=np.linalg.norm(d); u=d/L
        along=(xs-g[0])*u[0]+(ys-g[1])*u[1]; perp=np.abs(-(xs-g[0])*u[1]+(ys-g[1])*u[0])
        img[(along>=-1)&(along<=L+1)&(perp<=CUT_WIDTH)]=0
        img=without_sparkles(img,(along>=-4)&(along<=L+4)&(perp<=CUT_WIDTH+4))
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
# the Ember Shade's own grip fix: on this frame detection takes the smear's tail on the ground for the blade;
# the Bokator fighter's: frames where his blade is merged with his glowing fist or bends, so no straight
# thin run is found, or another run is taken for it; cut = a run off the blade's line, its glint or a
# trail, cut away as well; the Firefly Shade's: frames where a ring of sparks, a blaze or a smear's
# edge is taken for the blade, or the blade is drawn twice as it flails, its cuts the smear edges and
# stubs left beside it, blaze = a swing running through the glow round him, recoloured whole, keep =
# boxes every row shows as drawn, smear = boxes whose glow is recoloured with the swing and under =
# boxes where the weapon passes behind him, burst = boxes whose glow the blade's erase gives back to be
# recoloured with the smear, grip = where the hand holds the drawn weapon, and a frame where the art
# leaves his blade out, its g/t a stub in the open air before his fist, so that the spear or axe is
# still drawn there, from the grip toward its aim; the Moss Shade's: the same
# keys, and paint = pixels [x,y,'#rrggbb'] drawn back by hand in every weapon row (a shin or an outline
# the blade lay along, which nothing beside it can mend), clear = pixels [x,y] taken away there (a
# speck of the blade's dark edge left at his hand) and tint = boxes recoloured whole with the swing, its
# dark edges as well as its glow; the
# Blue Shade's: a blade wider than its found line, a flailing blade whose motion arcs are taken for it, a grip and
# tip found the wrong way round, the glowing pommel hanging under his fist as he raises it (in a
# 'hide' frame its g/t mark only that stub, so it is erased), and the
# spin's end, where the blade is found along its own hooked smear, with the Moss Shade's paint and
# clear for the pommels, hilt stubs and gaps in his outline the blade leaves by his fist, and aim = the
# point his weapon points at from the grip (laid on the ground instead of standing up through his
# hood, or following the drawn blade's angle through his idle and walk); the Angkor Warrior's: frames where a gold arm band is taken for his blade, and None
# where no blade is drawn at all
OWN_OVERRIDES={
    'moss':{
        'idle':{'0':{'g':[64,50],'t':[83,70],'paint':[[67,52,'#2daa58'],[69,52,'#000000'],[66,53,'#3d864d'],
                              [65,54,'#296225'],[67,54,'#0c0b0b'],[68,54,'#000000'],[68,55,'#000000'],
                              [68,56,'#161615'],[69,56,'#000000'],[70,57,'#000000'],[71,58,'#000000'],
                              [71,59,'#000000']],'clear':[[69,54],[70,55],[71,60],[72,60]]},
                '1':{'g':[63,50],'t':[82,70],'paint':[[66,52,'#2daa58'],[65,53,'#3d864d'],[69,53,'#000000'],
                              [64,54,'#296225'],[67,54,'#1c1c1c'],[68,54,'#161615'],[67,55,'#0c0b0b'],
                              [68,55,'#161615'],[69,55,'#161615'],[70,55,'#000000'],[68,56,'#161615'],
                              [69,56,'#161615'],[70,56,'#000000'],[68,57,'#161615'],[69,57,'#161615'],
                              [70,57,'#000000'],[70,58,'#000000'],[70,59,'#000000']],'clear':[[71,60]]},
                '2':{'g':[64.5,52.5],'t':[81,70],'paint':[[65,52,'#2daa58'],[64,53,'#3d864d'],
                              [63,54,'#296225'],[67,54,'#111111'],[69,54,'#000000'],[67,55,'#161615'],
                              [68,55,'#161615'],[69,55,'#000000'],[67,56,'#161615'],[68,56,'#161615'],
                              [69,56,'#000000'],[67,57,'#161615'],[68,57,'#161615'],[69,57,'#000000'],
                              [69,58,'#000000'],[69,59,'#000000'],[70,60,'#000000']]},
                '3':{'g':[63.5,52.5],'t':[80,70],'paint':[[64,52,'#2daa58'],[63,53,'#3d864d'],
                              [62,54,'#296225'],[64,54,'#0c0b0b'],[67,55,'#161615'],[69,55,'#000000'],
                              [67,56,'#161615'],[68,56,'#1c1c1c'],[69,56,'#000000'],[67,57,'#161615'],
                              [68,57,'#161615'],[69,57,'#000000'],[67,58,'#161615'],[68,58,'#161615'],
                              [69,58,'#000000'],[69,59,'#000000'],[69,60,'#000000']],'clear':[[70,61]]},
                '4':{'g':[63.5,52.5],'t':[80,70],'paint':[[64,52,'#2daa58'],[63,53,'#3d864d'],
                              [62,54,'#296225'],[64,54,'#0c0b0b'],[68,57,'#161615'],[69,57,'#1c1c1c'],
                              [70,57,'#000000'],[67,58,'#161615'],[68,58,'#161615'],[69,58,'#161615'],
                              [70,58,'#000000'],[68,59,'#161615'],[69,59,'#161615'],[70,59,'#000000'],
                              [69,60,'#161615'],[70,60,'#000000'],[70,61,'#000000'],[71,62,'#000000']]},
                '5':{'g':[66,54],'t':[81,71],'paint':[[65,52,'#2daa58'],[65,54,'#0c0b0b'],[69,57,'#161615'],
                              [71,57,'#000000'],[68,58,'#161615'],[69,58,'#161615'],[70,58,'#161615'],
                              [71,58,'#000000'],[69,59,'#161615'],[70,59,'#161615'],[71,59,'#000000'],
                              [69,60,'#161615'],[70,60,'#161615'],[71,60,'#000000'],[71,61,'#000000']],
                     'clear':[[72,63]]}},
        'walk':{'0':{'g':[65.5,49.5],'t':[85,69],'cut':[[76,57,78,59]],'paint':[[71,52,'#000000'],
                              [69,53,'#111111'],[70,53,'#0c0b0b'],[71,53,'#000000'],[69,54,'#0c0b0b'],
                              [70,54,'#000000']],'clear':[[71,54]]},
                '1':{'g':[67.5,50.5],'t':[87.5,68.5],'cut':[[80,62,86,67]],'paint':[[69,49,'#000000'],
                              [69,50,'#0c0b0b'],[70,50,'#000000'],[70,51,'#000000'],[71,52,'#000000'],
                              [72,53,'#000000'],[71,54,'#1c1c1c'],[72,54,'#000000'],[72,55,'#000000']],
                     'clear':[[72,56],[73,57],[74,58]]},
                '2':{'g':[70,54],'t':[88,69],'cut':[[72,51,74,51]]},
                '3':{'g':[67,51],'t':[85,70],'paint':[[69,52,'#000000'],[68,53,'#0c0b0b'],[69,53,'#000000'],
                              [68,54,'#0c0b0b']],'clear':[[71,58],[72,59]]},
                '4':{'g':[65.5,52.5],'t':[83,69],'cut':[[72,56,73,57]]},
                '5':{'g':[63.5,51],'t':[80,70],'paint':[[69,57,'#161615'],[71,57,'#000000'],[68,58,'#161615'],
                              [69,58,'#161615'],[70,58,'#161615'],[71,58,'#000000'],[69,59,'#161615'],
                              [70,59,'#161615'],[71,59,'#000000'],[69,60,'#161615'],[70,60,'#161615'],
                              [71,60,'#000000'],[71,61,'#000000']]},
                '6':{'g':[62.5,50.5],'t':[77,71],'cut':[[76,63,77,64],[81,69,83,70]],
                     'paint':[[62,55,'#0c0b0b'],[63,56,'#060505'],[64,57,'#020602'],[65,59,'#0a1a09'],[66,60,'#060505'],[67,61,'#020602'],[72,60,'#060505'],[68,61,'#111111'],[72,61,'#060505'],[68,62,'#111111'],
                              [69,62,'#161615'],[70,62,'#1c1c1c'],[71,62,'#242524'],[72,62,'#1c1c1c'],
                              [73,62,'#000000'],[69,63,'#1c1c1c'],[70,63,'#242524'],[71,63,'#242524'],
                              [72,63,'#111111'],[73,63,'#000000'],[70,64,'#242524'],[71,64,'#242524'],
                              [72,64,'#1c1c1c'],[73,64,'#060505'],[70,65,'#242524'],[71,65,'#242524'],
                              [72,65,'#1c1c1c'],[73,65,'#000000'],[70,66,'#111111'],[71,66,'#242524'],
                              [72,66,'#242524'],[73,66,'#1c1c1c'],[74,66,'#000000'],[71,67,'#111111'],
                              [72,67,'#242524'],[73,67,'#242524'],[74,67,'#1c1c1c'],[75,67,'#000000'],
                              [73,68,'#242524'],[74,68,'#1c1c1c'],[75,68,'#000000'],[74,69,'#1c1c1c'],
                              [75,69,'#161615'],[76,69,'#000000'],[75,70,'#242524'],[76,70,'#1c1c1c'],
                              [77,70,'#060505'],[78,70,'#0c0b0b'],[79,70,'#060505'],[75,71,'#2c312e'],
                              [76,71,'#242524'],[77,71,'#242524'],[79,71,'#2c312e'],[80,71,'#000000'],
                              [79,72,'#000000'],[80,72,'#000000'],[77,73,'#060505'],[78,73,'#060505']]},
                '7':{'g':[63,51.5],'t':[75.5,72.5],'paint':[[62,56,'#0c0b0b'],[63,57,'#060505'],[64,58,'#020602'],[65,60,'#0a1a09'],[67,61,'#111111'],[68,61,'#1c1c1c'],
                              [71,61,'#000000'],[67,62,'#1c1c1c'],[68,62,'#242524'],[71,62,'#000000'],
                              [67,63,'#1c1c1c'],[68,63,'#242524'],[69,63,'#242524'],[71,63,'#000000'],
                              [67,64,'#111111'],[68,64,'#1c1c1c'],[69,64,'#242524'],[70,64,'#242524'],
                              [71,64,'#1c1c1c'],[72,64,'#000000'],[68,65,'#161615'],[69,65,'#242524'],
                              [70,65,'#242524'],[71,65,'#1c1c1c'],[72,65,'#000000'],[69,66,'#1c1c1c'],
                              [70,66,'#242524'],[71,66,'#242524'],[72,66,'#1c1c1c'],[73,66,'#000000'],
                              [69,67,'#111111'],[70,67,'#1c1c1c'],[71,67,'#242524'],[72,67,'#1c1c1c'],
                              [73,67,'#000000'],[71,68,'#1c1c1c'],[72,68,'#242524'],[73,68,'#000000'],
                              [71,69,'#1c1c1c'],[72,69,'#242524'],[73,69,'#000000'],[73,70,'#000000'],
                              [78,73,'#000000']]}},
        'land':{'0':{'g':[63,50],'t':[83,70],'cut':[[73,54,73,59]]},
                '1':{'g':[62,50],'t':[85,68],'cut':[[72,56,75,58.5]],'paint':[[69,56,'#161615'],
                              [70,56,'#000000'],[69,57,'#161615'],[70,57,'#000000'],[71,58,'#000000']],
                     'clear':[[71,59],[71,60],[72,60]]},
                '2':{'g':[62,51],'t':[85,53],'grip':[61,50.9],'len':24,'paint':[[60,50,'#0c0b0b'],
                              [74,50,'#000000'],[60,51,'#111111'],[73,51,'#000000'],[72,53,'#000000']],
                     'clear':[[73,53]]},
                '3':{'g':[60,52],'t':[86,48],'grip':[60,52.1],'len':26,'paint':[[73,48,'#0c0b0b'],
                              [74,48,'#000000'],[74,49,'#000000'],[75,51,'#000000'],[76,51,'#000000'],
                              [77,51,'#000000'],[78,51,'#000000']],'clear':[[79,51]]}},
        'jump':{'0':{'g':[70,56],'t':[94,58.5],'paint':[[70,56,'#1c1c1c'],[70,57,'#111111']]},
                '1':{'g':[70.5,55],'t':[95,45],'cut':[[83,54,85,55]],'paint':[[74,52,'#000000'],
                              [74,53,'#000000'],[75,54,'#000000'],[73,55,'#1c1c1c']],'clear':[[77,51],[78,51],
                              [76,52],[76,54]]},
                '2':{'g':[70,38.5],'t':[95,26.5],'paint':[[77,35,'#000000'],[72,36,'#111111'],
                              [77,36,'#000000'],[72,37,'#1c1c1c'],[77,37,'#000000'],[73,38,'#111111'],
                              [76,38,'#000000']]},
                '3':{'g':[69.5,36.5],'t':[89,17],'paint':[[75,30,'#000000'],[76,31,'#000000'],
                              [72,33,'#1c1c1c'],[73,34,'#111111']],'clear':[[76,29],[78,30],[77,31]]},
                '4':{'g':[69,34],'t':[87.5,14.5],'grip':[68.6,36.9],'paint':[[77,24,'#000000'],
                              [76,25,'#000000'],[72,33,'#111111']],'clear':[[80,21],[79,22],[79,23],[77,25],
                              [76,26]]},
                '5':{'g':[68.5,33.5],'t':[87.5,15.5],'grip':[68.8,35.7],'paint':[[72,33,'#111111']],
                     'clear':[[80,21],[79,22],[79,23],[80,24],[77,25],[76,26],[75,27]]},
                '6':{'g':[67.5,39.5],'t':[87,17],'paint':[[74,30,'#0c0b0b'],[75,30,'#000000'],
                              [75,31,'#0c0b0b'],[76,31,'#000000'],[71,34,'#1c1c1c'],[72,35,'#0c0b0b']],
                     'clear':[[79,23],[79,24],[79,25],[81,25],[78,26],[80,26],[77,27]]},
                '7':{'g':[67.5,43.5],'t':[87,21],'cut':[[83,32,84,33]],'paint':[[76,32,'#000000'],
                              [73,33,'#0c0b0b'],[74,33,'#0c0b0b'],[75,33,'#0c0b0b'],[76,33,'#000000'],
                              [74,34,'#0c0b0b'],[75,34,'#0c0b0b'],[76,34,'#000000'],[75,35,'#0c0b0b'],
                              [76,35,'#000000'],[72,39,'#0c0b0b']],'clear':[[78,29],[77,31],[77,33]]}},
        'dash':{'1':{'g':[61,49.5],'t':[34,64],'cut':[[57,56,58,58]],'clear':[[57,48],[56,49],[57,49]]},
                '2':{'g':[61,49.5],'t':[34,64],'paint':[[56,48,'#000000']],'clear':[[57,48],[56,49],[57,49],
                              [59,52],[59,53],[60,53],[61,53],[60,54]]},
                '3':{'g':[63,48],'t':[35,67],'paint':[[57,50,'#000000'],[55,51,'#000000'],[57,51,'#000000']],
                     'clear':[[53,52],[54,52],[52,53]]}},
        'hurt':{'0':{'g':[61,47],'t':[83,63],'cut':[[77,56,78,57]],'keep':[[50,18,68,41]]},
                '1':{'g':[54,48],'t':[72,68],'cut':[[70,64,71,65]]},
                '2':{'g':[57,53.5],'t':[65.5,70.5],'cut':[[61.5,62,64.5,65.5]]},
                '3':{'g':[57,49],'t':[71.5,69.5],'paint':[[57,53,'#242524'],[62,53,'#000000'],[62,54,'#000000'],
                              [62,55,'#000000'],[60,56,'#111111'],[62,56,'#000000'],[60,57,'#0c0b0b'],
                              [61,57,'#161615'],[62,57,'#000000'],[60,58,'#000000'],[61,58,'#000000'],
                              [61,59,'#000000'],[61,60,'#000000'],[61,61,'#000000'],[62,61,'#000000'],
                              [62,62,'#000000'],[64,63,'#000000']],'clear':[[62,60],[65,64],[66,64],[65,65],
                              [66,65]]}},
        'juggle':{'0':{'g':[59,44.5],'t':[86,35.5],'paint':[[63,41,'#111111'],[64,41,'#0c0b0b'],
                                [69,41,'#000000'],[70,41,'#000000'],[71,41,'#000000'],[72,41,'#000000'],
                                [73,41,'#000000'],[74,41,'#000000'],[63,42,'#1c1c1c'],[64,42,'#242524'],
                                [69,42,'#1c1c1c'],[70,42,'#172e11'],[75,42,'#000000'],[61,43,'#2c312e'],
                                [69,43,'#172e11'],[70,43,'#172e11'],[73,43,'#172e11'],[74,43,'#172e11'],
                                [75,43,'#172e11'],[60,44,'#363e3b'],[64,44,'#172e11'],[60,46,'#111111']],
                       'clear':[[73,39],[70,40],[72,40],[73,40],[77,40],[75,41],[76,41]]},
                  '1':{'g':[56.5,44.5],'t':[75,24],'paint':[[60,43,'#1c1c1c']]},
                  '2':{'g':[58.5,41],'t':[65,19],'cut':[[61.5,37.5,65,30]]},
                  '3':{'g':[57,44],'t':[59,19],'clear':[[60,28],[60,29],[56,36]]}},
        'down':{'0':{'g':[64,52],'t':[83,72],'paint':[[69,58,'#1c1c1c'],[70,58,'#1c1c1c'],[71,58,'#161615'],
                              [70,59,'#060505'],[71,59,'#000000']]},
                '1':{'g':[66,56.5],'t':[86,71],'paint':[[70,58,'#0c0b0b'],[71,58,'#000000'],[70,59,'#0c0b0b'],
                              [71,59,'#000000'],[70,60,'#000000'],[71,60,'#000000'],[71,61,'#000000'],
                              [72,62,'#000000']],'clear':[[72,59],[73,60]]},
                '2':{'g':[77,63.5],'t':[98,66.5],'cut':[[83,67,89,67]]},
                '3':{'g':[80,74.9],'t':[101,73.8],'cut':[[92,77,95,77]],'under':[[84,58,96,73]],
                     'paint':[[86,73,'#020602'],[87,73,'#020602']],'clear':[[81,74],[81,75]]}},
        'getup':{'0':{'g':[80,74.9],'t':[101,73.8],'cut':[[92,77,95,77]],'under':[[84,58,96,73]],
                      'paint':[[87,73,'#020602'],[88,73,'#020602']],'clear':[[82,74],[82,75]]},
                 '1':{'g':[79,74],'t':[102,73.5],'cut':[[95,78,97,78]]},
                 '2':{'g':[82,74],'t':[103,73.5],'paint':[[89,72,'#2c312e'],[90,72,'#000000'],
                               [86,73,'#795840'],[87,73,'#684a34'],[88,73,'#2c312e'],[89,73,'#387136'],
                               [90,73,'#000000'],[85,74,'#000000'],[86,74,'#2e1e14'],[87,74,'#161615'],
                               [88,74,'#2c312e'],[89,74,'#3a5930'],[90,74,'#000000'],[86,75,'#000000'],
                               [87,75,'#000000'],[88,75,'#000000'],[89,75,'#000000']],'clear':[[91,73]]},
                 '3':{'g':[77,72.5],'t':[102,75],'grip':[76,71.4]},
                 '4':{'g':[72.5,52.5],'t':[89,70],'paint':[[77,54,'#000000'],[75,55,'#0c0b0b'],
                               [76,55,'#161615'],[77,55,'#000000'],[75,56,'#161615'],[76,56,'#161615'],
                               [77,56,'#161615'],[78,56,'#000000'],[75,57,'#161615'],[76,57,'#161615'],
                               [77,57,'#161615'],[78,57,'#000000'],[76,58,'#161615'],[77,58,'#161615'],
                               [78,58,'#000000'],[77,59,'#161615'],[78,59,'#000000'],[78,60,'#000000']],
                      'clear':[[79,61],[80,62]]}},
        'ko':{'0':{'g':[63.5,52.5],'t':[82.5,72.5],'paint':[[69,58,'#161615'],[71,58,'#000000'],
                            [68,59,'#111111'],[69,59,'#161615'],[70,59,'#161615'],[71,59,'#000000'],
                            [70,60,'#161615'],[71,60,'#000000'],[70,61,'#161615'],[71,61,'#000000']],
                   'clear':[[72,64]]},
              '1':{'g':[59,51],'t':[86,74]},
              '2':{'g':[69,73.5],'t':[86,65.5],'cut':[[79,70,80,70]],'grip':[66.3,72.8],
                   'paint':[[79,65,'#0c0b0b'],[80,65,'#111111'],[78,66,'#060505'],[79,66,'#0c0b0b'],
                            [77,67,'#060505'],[78,67,'#000000']],
                   'clear':[[x,y] for x in range(65,70) for y in range(74,77)]},
              '3':{'g':[83,75],'t':[92,75],'cut':[[86,74,92,74]],'grip':[83,73.5]}},
        'win':{'0':{'g':[73,45],'t':[93,30],'clear':[[71,41],[72,41],[71,42],[72,42]]},
               '1':{'g':[77.3,36],'t':[79,12],'cut':[[76,35.5,80,35.5],[80.5,37,80.5,38]],'clear':[[75,45],
                             [76,45],[77,45],[78,45],[75,46],[76,46],[77,46],[73,35],[74,35],[72,36],[73,36],
                             [74,36],[72,37],[73,37],[74,37]]},
               '2':{'g':[77.3,36],'t':[79,13],'cut':[[76,36,80,36],[80.5,37,80.5,38]],'clear':[[74,45],
                             [75,45],[76,45],[77,45],[74,46],[75,46],[76,46],[77,46],[75,47],[76,47],[73,36],[74,36],
                             [72,37],[73,37],[74,37]]},
               '3':{'g':[77.3,36],'t':[79,13],'cut':[[76,36,80,36],[80.5,37,80.5,38]],'clear':[[75,45],
                             [76,45],[77,45],[74,46],[75,46],[76,46],[77,46],[75,47],[76,47],[77,47],[73,36],[74,36],
                             [72,37],[73,37],[74,37]]}},
        'slash1':{'0':{'g':[63.5,50],'t':[82,70],'paint':[[69,54,'#161615'],[70,54,'#000000'],
                                [68,55,'#161615'],[69,55,'#161615'],[70,55,'#000000'],[68,56,'#161615'],
                                [69,56,'#161615'],[70,56,'#000000'],[68,57,'#161615'],[69,57,'#161615'],
                                [70,57,'#000000'],[69,58,'#161615'],[70,58,'#000000'],[70,59,'#000000'],
                                [71,60,'#000000']],'clear':[[72,61],[73,62]]},
                  '1':{'g':[62.5,51.5],'t':[83,71],'cut':[[76,64,84,71]],'paint':[[69,63,'#020602'],[70,63,'#0a1a09'],
                               [71,63,'#020602']]},
                  '2':{'g':[59.5,52.5],'t':[68,58.8],'len':22,'tint':[[72,54,72,54],[74,55,74,55],
                               [75,56,75,56]]},
                  '4':{'hide':True,'smear':[[56,25,56,25]]}},
        'slash2':{'0':{'g':[63.5,50],'t':[82,70],'paint':[[69,54,'#161615'],[70,54,'#000000'],
                                [68,55,'#161615'],[69,55,'#161615'],[70,55,'#000000'],[68,56,'#161615'],
                                [69,56,'#161615'],[70,56,'#000000'],[68,57,'#161615'],[69,57,'#161615'],
                                [70,57,'#000000'],[69,58,'#161615'],[70,58,'#000000'],[70,59,'#000000'],
                                [71,60,'#000000']],'clear':[[72,61],[73,62]]},
                  '1':{'g':[64.5,51.5],'t':[83,72],'paint':[[68,54,'#111111'],[66,55,'#0c0b0b'],
                                [67,55,'#111111'],[68,55,'#111111'],[69,55,'#0c0b0b'],[70,55,'#000000'],
                                [68,56,'#111111'],[69,56,'#0c0b0b'],[70,56,'#000000'],[68,57,'#0c0b0b'],
                                [69,57,'#0c0b0b'],[70,57,'#000000'],[69,58,'#0c0b0b'],[70,58,'#000000'],
                                [70,59,'#000000']]},
                  '2':{'g':[67.5,52],'t':[79,61.5],'paint':[[67,52,'#0c0b0b'],[69,52,'#000000'],
                                [67,53,'#0c0b0b'],[68,53,'#0c0b0b'],[69,53,'#0c0b0b'],[70,53,'#000000'],
                                [68,54,'#0c0b0b'],[70,54,'#000000'],[70,55,'#000000']]},
                  '4':{'hide':True,'keep':[[71,22,71,22]]}},
        'spin_slash':{'0':{'g':[63.5,50.5],'t':[82.5,69.5],'paint':[[69,53,'#000000'],[67,54,'#0c0b0b'],
                                    [68,54,'#0c0b0b'],[69,54,'#0c0b0b'],[70,54,'#000000'],[67,55,'#0c0b0b'],
                                    [68,55,'#0c0b0b'],[69,55,'#0c0b0b'],[70,55,'#000000'],[68,56,'#0c0b0b'],
                                    [69,56,'#0c0b0b'],[70,56,'#000000'],[68,57,'#0c0b0b'],[69,57,'#0c0b0b'],
                                    [70,57,'#000000'],[70,58,'#000000'],[70,59,'#000000'],[71,60,'#000000']]},
                      '1':{'g':[63,52],'t':[83,64],'paint':[[69,55,'#000000'],[70,55,'#000000'],
                                    [69,57,'#000000']],'clear':[[71,55],[71,58],[70,59],[71,59],[72,59],
                                    [70,60],[71,60],[72,60],[73,60],[74,60],[71,61],[72,61],[73,61],[72,62],
                                    [73,62]]},
                      '2':{'g':[53,48],'t':[45,49]},
                      '3':{'hide':True,'keep':[[66,47,69,58],[47,47,47,47],[52,48,52,48],[55,49,61,51]]},
                      '4':{'hide':True,'keep':[[58,49,58,50],[57,51,68,57]]},
                      '5':{'g':[62,51.5],'t':[83,63],'paint':[[69,55,'#000000'],[69,56,'#000000']],
                           'clear':[[70,55]]}},
        'thrust':{'0':{'g':[64.5,52.5],'t':[85,64.5],'paint':[[70,54,'#000000'],[66,55,'#111111'],
                                [67,55,'#111111'],[68,55,'#111111'],[69,55,'#0c0b0b'],[71,55,'#000000'],
                                [67,56,'#111111'],[68,56,'#0c0b0b'],[69,56,'#0c0b0b'],[70,56,'#0c0b0b'],
                                [71,56,'#000000'],[69,57,'#0c0b0b'],[70,57,'#000000'],[69,58,'#000000']],
                       'clear':[[71,59],[72,60]]},
                  '1':{'g':[54,50],'t':[91,52],'grip':[60,49.8],'len':31},
                  '2':{'g':[54,47.5],'t':[90,44],'paint':[[68,47,'#000000'],[69,47,'#000000']],'grip':[60,46.9],'len':30,'clear':[[75,42],[76,42],[75,43],
                                [76,43]]},
                  '3':{'g':[55,47.5],'t':[93,44.5],'paint':[[59,47,'#161615'],[60,47,'#000000'],[61,47,'#000000'],[56,48,'#161615'],[60,44,'#242524'],[60,50,'#0c0b0b']],'cut':[[77,52,79,52]],'grip':[61,47],'len':32},
                  '4':{'g':[57,47],'t':[72,47.5],'paint':[[61,50,'#0c0b0b']],'grip':[61,47.1],'len':20,'smear':[[74,44,77,49]]},
                  '5':{'g':[57,47.5],'t':[94,45],'paint':[[61,50,'#0c0b0b']],'grip':[61,47.2],'len':33,'clear':[[87,42],[88,42],[89,42],
                                [70,47],[71,47],[77,48],[74,49],[75,49],[76,49],[77,49],[78,49],[79,49],
                                [80,49],[81,49]],'pocket':10}},
        'rising_dragon':{'0':{'g':[62.5,50.5],'t':[81,71],'cut':[[76,61,77,62]],'paint':[[70,56,'#000000'],
                                       [67,57,'#0c0b0b'],[68,57,'#0c0b0b'],[70,57,'#000000'],
                                       [68,58,'#0c0b0b'],[69,58,'#0c0b0b'],[70,58,'#000000'],
                                       [68,59,'#0c0b0b'],[69,59,'#0c0b0b'],[70,59,'#000000'],
                                       [70,60,'#000000'],[70,61,'#000000'],[69,62,'#000000'],
                                       [69,63,'#000000']],'clear':[[70,62],[70,63],[70,64],[70,65]]},
                         '1':{'g':[62,52],'t':[80,72],'paint':[[71,62,'#000000']],'clear':[[72,62]]},
                         '2':{'hide':True,'keep':[[68,26,74,30]],'smear':[[63,49,70,58],[55,31,63,48]]},
                         '3':{'hide':True,'keep':[[66,21,72,32],[58,32,73,40],[57,34,73,37],[59,26,75,67],
                                      [59,41,78,54],[58,45,76,61],[70,65,77,74]],'smear':[[0,0,127,79]]},
                         '4':{'g':[49.5,48],'t':[49.5,69],'tint':[[37,60,37,61]]},
                         '5':{'g':[53,53],'t':[51.5,73]}},
        'cleave':{'0':{'g':[52,16.5],'t':[26,27.5],'paint':[[50,15,'#000000'],[51,15,'#242524'],
                                [51,16,'#3a5930'],[52,16,'#43a24a'],[51,17,'#3a5930'],[52,17,'#3a5930'],
                                [48,18,'#000000'],[52,18,'#264528'],[49,19,'#2c312e']]},
                  '1':{'g':[49,19],'t':[28,27.5],'paint':[[50,16,'#2c312e']]},
                  '2':{'g':[75,57],'t':[82,64],'len':28,'paint':[[74,58,'#000000'],[75,58,'#000000']],
                       'clear':[[79,56],[80,56],[80,57],[80,58],[77,57],[77,58],[78,58],[74,59],[75,59],
                                [76,59],[77,59],[76,60],[78,60],[75,61],[76,62]]},
                  '3':{'g':[75.5,57.5],'t':[94,77],'paint':[[77,57,'#000000'],[74,60,'#000000']],
                       'clear':[[79,56],[80,56],[78,57],[79,57],[80,57],[78,58],[79,58],[80,58],[77,59],
                                [78,59],[79,59],[77,60],[78,60],[79,60],[75,61],[76,61],[77,61],[78,61],
                                [76,62],[88,72],[87,73],[87,74]]},
                  '4':{'g':[75.5,56.5],'t':[94,77],'paint':[[77,57,'#000000'],[74,59,'#000000']],
                       'clear':[[77,54],[79,55],[78,56],[79,56],[80,56],[78,57],[79,57],[80,57],[77,58],
                                [78,58],[79,58],[77,59],[78,59],[79,59],[75,60],[76,60],[77,60],[78,60],
                                [76,61]]},
                  '5':{'g':[73.5,55.5],'t':[92,76],'paint':[[75,54,'#000000'],[74,57,'#000000']],
                       'clear':[[77,55],[78,55],[76,56],[78,56],[75,57],[72,58],[73,58],[74,58],[75,58],
                                [77,58],[73,59],[74,59],[75,59],[76,59],[74,60],[74,61]]},
                  '6':{'g':[70.5,53.5],'t':[89,73],'clear':[[74,52],[75,52],[74,53],[75,53],[74,54],[75,54],
                                [74,55],[74,56]]},
                  '7':{'g':[64,50],'t':[82,70],'paint':[[68,54,'#161615'],[69,54,'#161615'],[70,54,'#000000'],
                                [67,55,'#0c0b0b'],[68,55,'#161615'],[69,55,'#161615'],[70,55,'#000000'],
                                [68,56,'#161615'],[69,56,'#161615'],[70,56,'#161615'],[71,56,'#000000'],
                                [68,57,'#0c0b0b'],[69,57,'#161615'],[70,57,'#161615'],[71,57,'#000000'],
                                [70,58,'#161615'],[71,58,'#000000'],[70,59,'#161615'],[71,59,'#000000'],
                                [71,60,'#000000']],'clear':[[72,61],[73,62]]}},
        'air_slash':{'0':{'g':[53.5,25.5],'t':[28,41.5],'cut':[[46,25,47,26]],'under':[[56,10,76,30]]},
                     '1':{'g':[57,22],'t':[29,15],'under':[[59,12,76,34]],'paint':[[54,19,'#000000'],
                                   [53,20,'#000000'],[53,21,'#000000'],[52,22,'#000000'],[53,23,'#000000']],
                          'clear':[[54,18]]},
                     '2':{'g':[82,56],'t':[92,74],'clear':[[84,53],[83,54],[84,54]]},
                     '3':{'g':[82,57],'t':[95,75],'cut':[[87,74,88,75]]}},
        'air_rising_cut':{'0':{'g':[65.5,51.5],'t':[84,71],'cut':[[74,55,75,56]],'paint':[[69,53,'#0c0b0b'],
                                        [70,53,'#060505'],[71,54,'#1c1c1c'],[69,55,'#0c0b0b'],
                                        [70,55,'#111111'],[71,55,'#0c0b0b'],[69,56,'#111111'],
                                        [70,56,'#0c0b0b'],[71,56,'#1c1c1c'],[70,57,'#0c0b0b'],
                                        [71,57,'#000000'],[71,58,'#000000']]},
                          '1':{'g':[71,50.5],'t':[85,59.5],'paint':[[75,50,'#060505'],[72,54,'#020602']]},
                          '3':{'hide':True,'clear':[[x,27] for x in range(47,53)]+[[x,28] for x in range(47,53)]
                               +[[x,29] for x in range(45,52)]}},
        'meteor_slash':{'0':{'g':[56,14.5],'t':[31,10.5],'clear':[[54,11],[55,11],[55,12],[53,13],[54,13],
                                      [53,14],[54,14],[53,15],[54,15],[53,16],[54,16],[53,17],[54,17],[53,18],
                                      [54,18]]},
                        '1':{'g':[56,13.5],'t':[29,24],'paint':[[54,12,'#000000'],[55,12,'#000000']],
                             'clear':[[49,15]]},
                        '2':{'g':[80,56],'t':[94,50],'cut':[[82,55.5,82,59.5]],'paint':[[79,53,'#000000']]},
                        '3':{'g':[74.5,62.5],'t':[80,79],'cut':[[75,64,80,79]],'hide':True,
                             'paint':[[73,62,'#0c0b0b'],[71,63,'#0c0b0b']],'clear':[[72,65],[73,66],[73,67],
                                      [73,68],[74,69]]}},
        'plunge':{'0':{'g':[61,52],'t':[80,74],'cut':[[74,63,75,64]],'paint':[[69,61,'#111111'],
                                [70,61,'#111111'],[71,61,'#000000'],[70,62,'#000000']],'clear':[[70,64],
                                [70,65],[71,65],[70,66],[72,66],[70,67]]},
                  '1':{'g':[58,50],'t':[76,72],'paint':[[64,58,'#161615'],[68,62,'#111111'],[69,62,'#111111'],[70,62,'#000000'],
                                [68,63,'#000000'],[68,64,'#000000']]},
                  '2':{'g':[58.5,48],'t':[86.5,66.5]},
                  '3':{'g':[62,59],'t':[85,76],'paint':[[73,67,'#060505'],[74,67,'#1c1c1c'],[73,68,'#060505'],
                                [74,68,'#1c1c1c'],[75,68,'#242524'],[78,68,'#000000'],[74,69,'#060505'],
                                [75,69,'#1c1c1c'],[76,69,'#242524'],[77,69,'#1c1c1c'],[78,69,'#060505'],
                                [75,70,'#161615'],[76,70,'#242524'],[77,70,'#1c1c1c'],[78,70,'#060505'],
                                [76,71,'#1c1c1c'],[77,71,'#242524'],[78,71,'#1c1c1c'],[79,71,'#060505'],
                                [78,72,'#1c1c1c'],[79,72,'#242524'],[80,72,'#060505'],[80,73,'#242524'],
                                [81,73,'#060505'],[80,74,'#060505'],[81,74,'#000000']]}}
    },
    # his run trails the blade behind him: detection follows its lit edge and the erase takes only its
    # glow and the pixels by open air, so the line runs through its middle and its dark core and edge
    # are cleared; in the last frame the cloak's flames are big enough to pass for a smear, so kept
    'ember':{'slash1':{'3':{'g':[65,50],'t':[87,69]}},
             'run':{'0':{'g':[48.5,53],'t':[30,66.5],'clear':[[37,61],[38,60],[39,61],[40,59],[41,58],
                           [42,59],[43,54],[43,55],[43,57],[44,58],[45,55],[46,55],[47,52],[47,54],[47,56],
                           [47,57],[48,53],[48,55]]},
                    '1':{'g':[45.5,52],'t':[29.6,64],'clear':[[37,58],[38,57],[39,58],[40,56],[41,55],
                           [42,56],[43,54],[44,55],[45,53],[46,54],[47,54]]},
                    '2':{'g':[44,51],'t':[29.6,61.8],'clear':[[37,56],[38,55],[39,56],[40,54],[41,53],
                           [42,54],[43,52],[44,53],[44,54],[45,53]]},
                    '3':{'g':[46.5,48.2],'t':[28.6,60.6],'clear':[[36,55],[37,54],[38,55],[39,53],[39,55],
                           [40,52],[40,54],[40,55],[41,49],[41,50],[41,53],[41,54],[41,55],[42,48],[42,49],
                           [42,51],[42,53],[42,54],[43,48],[43,52],[43,53],[44,47],[44,48],[44,50],[44,52],
                           [45,47],[45,49],[45,51],[45,52],[46,48],[46,49],[46,50],[46,51],[47,49],[47,50]]},
                    '4':{'g':[48,48.6],'t':[28.6,62.6],'clear':[[36,57],[37,56],[38,57],[39,55],[40,54],
                           [41,55],[42,50],[42,51],[42,53],[43,54],[44,52],[45,51],[45,53],[46,48],[46,50],
                           [46,52],[46,53],[47,49],[47,51],[48,49],[49,50]]},
                    '5':{'g':[49,50.3],'t':[29.8,64.6],'clear':[[37,59],[38,58],[39,59],[40,57],[41,56],
                           [42,57],[43,55],[44,56],[44,57],[45,53],[45,54],[46,53],[47,52],[47,54],[47,55],
                           [48,51],[48,53],[48,54],[49,51],[50,52]]},
                    '6':{'g':[49,49.2],'t':[29.8,63.8],'clear':[[36,59],[39,58],[40,56],[42,56],[43,54],
                           [44,55],[44,56],[45,52],[46,52],[47,51],[47,53],[47,54],[48,50],[48,52],[48,53],
                           [49,50],[49,53],[50,51]]},
                    '7':{'g':[48.6,49.4],'t':[30.6,62.6],'keep':[[29,39,48,47],[33,48,44,50]],'clear':[
                           [38,57],[39,56],[40,57],[41,55],[42,52],[42,54],[43,51],[43,55],[44,50],[44,53],
                           [45,49],[45,50],[45,54],[45,55],[46,49],[46,52],[47,48],[47,51],[47,53],[48,49],
                           [48,50],[48,52],[49,50],[49,51],[49,52]]}}},
    'bokator':{
        'thrust':{'0':{'g':[66,81],'t':[85.5,88]},'1':{'g':[64,75.5],'t':[89,79.5]},
                  '3':{'g':[93,66.1],'t':[121,65.4],'cut':[[117,63,127,61]]},
                  '4':{'g':[83,64.8],'t':[102,64],'cut':[[29,70.5,48,67.5]]}},
        'rising_dragon':{'0':{'g':[61,96],'t':[89,108.5]},'1':{'g':[62,90.2],'t':[87,105.2]}},
        'cleave':{'4':{'g':[66.5,91.5],'t':[94,107]}},
        'spin_slash':{'0':{'g':[48,65],'t':[25,86.5],'cut':[[25,81,44,62.5]]},'1':{'g':[60,44.5],'t':[96,35.5]}},
        'air_slash':{'3':{'g':[70,82.5],'t':[85,88]}},
        'air_rising_cut':{'3':{'g':[58.9,39.5],'t':[40,34.9],'cut':[[78,44.5,91,55]]}},
        'plunge':{'0':{'g':[73,25],'t':[53,16]}},
        'jump':{'4':{'g':[77,78],'t':[108,93.5]}},
        'ko':{'3':{'g':[60,102.5],'t':[102,106.5]}},
    },
    'firefly':{
        'idle':{'1':{'g':[63.3,51.5],'t':[73.5,66.3],'grip':[60.9,48],'len':22},
                '2':{'g':[62.1,52.7],'t':[74.2,66.8],'smear':[[73,54,77,58]],'paint':[[69,60,'#010307']]},
                '3':{'g':[61.6,54.3],'t':[75.5,67.5],'smear':[[73,54,77,58]],'paint':[[69,60,'#010307']]},
                '5':{'g':[62.5,55.5],'t':[75,68],'smear':[[73,54,77,58]],'paint':[[69,61,'#010307'],[70,61,'#010307']]}},
        'walk':{'1':{'g':[68,51.8],'t':[79.5,67.3],'keep':[[57,18,61,23]]},
                '2':{'g':[70.4,54.6],'t':[81.5,65],'cut':[[80,60,84,62],[77.5,65.5,77.5,67.5]],'keep':[[59,20,62,22]]},
                '3':{'g':[71,55],'t':[79,66],'cut':[[78,57.5,83,59],[83,60,83,65]],'keep':[[73,40,79,51]]},
                '5':{'g':[65.6,51.3],'t':[75.5,65.7],'keep':[[53,14,80,39]]},
                '6':{'g':[62.1,52.6],'t':[71.5,66.3],'keep':[[52,13,80,37]]},
                '7':{'g':[61.2,53.4],'t':[68.6,69.2],'keep':[[52,13,80,35]]}},
        'dash':{'1':{'g':[65.6,45.9],'t':[48,58],'clear':[[63,49]]},
                '2':{'g':[65.6,45.9],'t':[48,58],'clear':[[63,49],[60,48]]},
                '3':{'g':[65.6,45.9],'t':[48,58],'clear':[[63,49],[60,48]]}},
        'jump':{'4':{'g':[73.4,34.5],'t':[86.7,23.7],'cut':[[77.79,31.79,78.21,32.21]]}},
        'land':{'2':{'g':[66.7,55.1],'t':[84.9,59.5],'paint':[[69,55,'#000000']]},'3':{'g':[69.4,56.8],'t':[85.5,48],'cut':[[81.05,54,81.05,58]]}},
        'hurt':{'0':{'g':[63.3,55.5],'t':[85,58.8],'cut':[[66.8,59,75.5,74],[69.6,57.5,72.5,57.5]]},
                '2':{'g':[59.9,47.5],'t':[71,68],'cut':[[63.5,53.5,63.5,54.5]]}},
        'juggle':{'0':{'g':[77.5,47.5],'t':[73,33.7],'cut':[[71,38.5,73.7,49.5],[80,39,82,43.5],[79.79,42.79,80.21,43.21],
                                                       [83.79,42.79,84.21,43.21],[74.79,48.79,75.21,49.21],[73.79,49.79,74.21,50.21]],
                       'keep':[[80,56,84,59]],'under':[[73,44,89,63]]},
                  '2':{'g':[77.5,47.5],'t':[73,33.7],'cut':[[71,38.5,73.7,49.5],[80,39,82,43.5],[79.79,42.79,80.21,43.21],
                                                       [83.79,42.79,84.21,43.21],[74.79,48.79,75.21,49.21],[73.79,49.79,74.21,50.21]],
                       'keep':[[80,56,84,59]],'under':[[73,44,89,63]]}},
        'down':{'2':{'g':[75,71.5],'t':[91,72]},'3':{'g':[83,73.5],'t':[96,72.5],'cut':[[84.5,71.5,93,63]],'clear':[[86,73],[87,72],[87,73]]}},
        'getup':{'0':{'g':[83,73.5],'t':[96,72.5],'cut':[[84.5,71.5,93,63]],'clear':[[86,73],[87,72],[87,73]]},'1':{'g':[76,72.8],'t':[95,71.8],'cut':[[86,74,94,74]]}},
        'ko':{'3':{'g':[87,73.5],'t':[96,72.5],'len':17.5}},
        'slash1':{'2':{'g':[63,52.5],'t':[63,57],'blaze':True,'len':21,'cut':[[67.5,70.5,67.5,71.5]],
                       'smear':[[54,57,56,59],[62,57,65,61]],'keep':[[60,70,66,72],[58,51,59,54]],'tint':[[66,60,66,61]]},
                  '3':{'g':[66,46.5],'t':[81,46.2],'blaze':True,'cut':[[80,46,84.5,46]],'keep':[[74,40,75,40]]},
                  '4':{'g':[73,46.2],'t':[92,45.2],'cut':[[46.5,32.5,46.5,29.5],[50.5,16.5,50.5,19.5]]}},
        'slash2':{'1':{'g':[71,55.5],'t':[74,76.5],'cut':[[70.1,56,70.1,78],[74.1,56,74.1,78],[78.1,62,78.1,78],
                                                       [69.05,73,69.05,78],[73.5,53,75.5,53],[54.6,67.4,57.6,70.4]],'clear':[[59,71]]},
                  '2':{'g':[78,40],'t':[93,40],'cut':[[79,35,79,35.5],[79,43,79,44.5]],'smear':[[80,37,94,56]],'burst':[[80,39,94,43]]},
                  '3':{'hide':True,'smear':[[61,15,63,19],[73,21,73,21]]},'4':{'hide':True,'smear':[[61,15,63,19],[73,21,73,21]]}},
        'spin_slash':{'1':{'g':[76,49.5],'t':[96.5,57],'keep':[[84,55,86,58]]},
                      '2':{'g':[65,46.5],'t':[95.5,46.5],'cut':[[75,41.5,95,42.5],[79,50.5,95,50.5]]},
                      '3':{'g':[48,48.4],'t':[75.9,46.2],'grip':[62,47.3],'len':21},'4':{'g':[48,48.4],'t':[75.9,46.2],'grip':[62,47.3],'len':21},
                      '5':{'g':[48,48.4],'t':[75.9,46.2],'grip':[62,47.3],'len':21}},
        'thrust':{'2':{'g':[84,43.6],'t':[95,44.5],'grip':[76,43],'aim':[100,45],'len':16,'under':[[56,36,78,50]]},
                  '3':{'g':[83.5,41],'t':[100,37.5],'burst':[[85,35,101,44]],'keep':[[64,22,67,25],[55,34,58,35],[66,59,71,66]],
                       'smear':[[72,23,76,26],[78,22,100,37],[77,51,80,54],[82,46,92,58],[88,45,88,45]]},
                  '4':{'g':[83.5,41],'t':[100,37.5],'burst':[[85,35,101,44]],'keep':[[64,22,67,25],[55,34,58,35],[66,59,71,66]],
                       'smear':[[72,23,76,26],[78,22,100,37],[77,51,80,54],[82,46,92,58],[88,45,88,45]]},
                  '5':{'g':[83.5,41],'t':[100,37.5],'burst':[[85,35,101,44]],'keep':[[64,22,67,25],[55,34,58,35],[66,59,71,66]],
                       'smear':[[72,23,76,26],[78,22,100,37],[77,51,80,54],[82,46,92,58],[88,45,88,45]]}},
        'rising_dragon':{'1':{'g':[60.2,62.9],'t':[75.5,75.3],'keep':[[77,53,85,60]]},
                         '2':{'hide':True,'smear':[[82,22,94,62]]},
                         '3':{'g':[59.4,20.6],'t':[38.1,53.4],'len':20,'cut':[[48.5,31.5,40.5,44],[53.95,34,53.95,38],[64,14.5,60,18.5]],
                              'keep':[[67,12,75,19]],'grip':[63.2,14.7],'aim':[40.9,34.8],'under':[[56,12,76,34]]},
                         '4':{'g':[59.4,20.6],'t':[38.1,53.4],'len':20,'cut':[[48.5,31.5,40.5,44],[53.95,34,53.95,38],[64,14.5,60,18.5]],
                              'keep':[[67,12,75,19]],'grip':[63.2,14.7],'aim':[40.9,34.8],'under':[[56,12,76,34]]},
                         '5':{'g':[59.4,20.6],'t':[38.1,53.4],'len':20,'cut':[[48.5,31.5,40.5,44],[53.95,34,53.95,38],[64,14.5,60,18.5]],
                              'keep':[[67,12,75,19]],'grip':[63.2,14.7],'aim':[40.9,34.8],'under':[[56,12,76,34]]}},
        'cleave':{'1':{'g':[59.5,26.5],'t':[53,14.5],'cut':[[51.5,19,52.5,23]],'under':[[56,20,72,44]]},
                  '2':{'g':[68,53.5],'t':[75.5,62.5],'blaze':True,'cut':[[69.3,55.3,73.5,60.5]],
                         'paint':[[70,54,'#474443'],[69,55,'#59606e'],[70,55,'#52555c'],[71,55,'#261d16'],[68,56,'#08110e'],
                         [69,56,'#362f2a'],[70,56,'#52555c'],[71,56,'#474443'],[72,56,'#000000'],[69,57,'#060607'],
                         [70,57,'#08110e'],[71,57,'#445979'],[72,57,'#6585a5'],[73,57,'#000000'],[69,58,'#000000'],
                         [70,58,'#59606e'],[71,58,'#59606e'],[72,58,'#000000'],[73,58,'#060607'],[74,58,'#030603'],
                         [70,59,'#030603'],[71,59,'#000000'],[72,59,'#5d91b4'],[73,59,'#6585a5'],[74,59,'#030603'],
                         [71,60,'#2e3e5f'],[72,60,'#467798'],[74,60,'#000000']]},
                  '3':{'g':[75,63],'t':[85.5,72.5],'cut':[[75.5,67.5,80,71.5],[69,56.5,71.5,59.5],[92.5,46.5,94.5,46.5]],'burst':[[78,57,88,71]],
                       'smear':[[48,21,52,24]]},
                  '4':{'g':[75,61.5],'t':[86.5,71],'cut':[[68.8,56.2,72.2,59],[86,62,90,69]],'smear':[[52,19,55,22],[65,20,69,22]]},
                  '5':{'g':[75,61.5],'t':[86.5,71],'cut':[[68.8,56.2,72.2,59],[86,62,90,69]],'smear':[[52,19,55,22],[65,20,69,22]]},
                  '6':{'g':[73.5,63],'t':[85,73.5],'cut':[[67.5,55.3,71,59.5],[79,60,87,69]],'smear':[[70,16,73,18],[85,30,88,34]]},
                  '7':{'g':[73.5,63],'t':[85,73.5],'cut':[[67.5,55.3,71,59.5],[79,60,87,69]],'smear':[[70,16,73,18],[85,30,88,34]]}},
        'air_slash':{'0':{'g':[67,55],'t':[69,58.5],'len':14},'1':{'g':[80,33.5],'t':[82,33],'len':9,'cut':[[94.5,49.5,97.5,49.5]]},
                     '2':{'g':[6,4],'t':[6,5],'hide':True,'cut':[[72.5,19.5,72.5,21.5]],
                          'paint':[[59,22,'#000000'],[58,23,'#010307'],[59,23,'#010307'],[60,23,'#010307'],
                          [58,24,'#010307'],[59,24,'#000000'],[60,24,'#000000'],[59,25,'#000000']]},
                     '3':{'g':[6,4],'t':[6,5],'hide':True,'cut':[[72.5,19.5,72.5,21.5]],
                          'paint':[[59,22,'#000000'],[58,23,'#010307'],[59,23,'#010307'],[60,23,'#010307'],
                          [58,24,'#010307'],[59,24,'#000000'],[60,24,'#000000'],[59,25,'#000000']]}},
        'air_rising_cut':{'2':{'g':[72,47.5],'t':[72,48.5],'hide':True,'smear':[[74,34,96,62]],
                               'keep':[[62,40,73,47],[73,49,73,49],[62,50,73,50],[62,51,75,56]],'paint':[[75,50,'#000000']]},
                          '3':{'hide':True,'keep':[[63,24,70,36],[59,37,75,47],[73,48,73,48]],'smear':[[73,17,90,48]],
                               'tint':[[72,32,72,32]]}},
        'meteor_slash':{'0':{'g':[63.5,52.5],'t':[72,67],'cut':[[70.5,60,72,66.5],[76.03,58.08,76.63,58.08],
                                                             [76.9,62.37,74.6,64.3],[69.21,69.79,68.79,70.21]],'keep':[[73,36,73,37]]},
                        '1':{'g':[63.5,52.5],'t':[72,67],'cut':[[70.5,60,72,66.5],[76.03,58.08,76.63,58.08],
                                                             [76.9,62.37,74.6,64.3],[69.21,69.79,68.79,70.21]],'keep':[[73,36,73,37]]},
                        '2':{'g':[70,54],'t':[75.5,66],'cut':[[69,62,72.5,60],[69.5,66.5,69.5,69.5]],'smear':[[79,67,79,68]],'burst':[[71,50,88,69]]},
                        '3':{'g':[80,47],'t':[95,47],'cut':[[80.5,43.5,80.5,48],[78,49.5,78,50],[84.5,59.5,84.5,62.5]],'tint':[[85,51,88,54],[81,51,81,51]]}},
        'plunge':{'1':{'g':[75.2,58.5],'t':[92.8,67.5],'keep':[[62,8,95,53]]},
                  '2':{'g':[76.8,63.6],'t':[98,66.4],'keep':[[62,8,95,58]]},
                  '3':{'g':[76.8,63.6],'t':[98,66.4],'keep':[[62,8,95,58]]}},
        'win':{'2':{'g':[72,44.1],'t':[89.2,35.4],'keep':[[81,45,86,49],[87,41,89,45]]},
               '3':{'g':[72.7,42.6],'t':[85.1,28.1],'keep':[[67,35,72,39]],'clear':[[79,29],[80,29]]}},
    },
    'blue':{
        'idle':{'0':{'g':[70.6,52.4],'t':[85.7,65],'grip':[69.6,52.3],'aim':[85,65],'len':20},
                '1':{'g':[70.1,52.8],'t':[83.3,64.7],'grip':[69.4,52.6],'aim':[83.7,65.4],'len':20},
                '2':{'g':[69.6,52.4],'t':[84.2,64.7],'grip':[69.3,52.6],'aim':[84.4,64.8],'len':20},
                '3':{'g':[73,52.3],'t':[87.5,63.5],'grip':[69.7,52.4],'aim':[86.1,63.9],'len':20},
                '4':{'g':[72.2,53.6],'t':[88.5,61.9],'grip':[70.8,52.3],'aim':[87.9,63.1],'len':20},
                '5':{'g':[72.8,53.4],'t':[90.2,61.7],'grip':[71.7,52.3],'aim':[88,62.1],'len':20}},
        'walk':{'0':{'g':[73,51.3],'t':[86.5,61.9],'grip':[70.4,50.5],'aim':[85.8,62.3],'len':19},
                '1':{'g':[71.7,51.5],'t':[87.1,59.8],'grip':[70.7,50.4],'aim':[86.8,60.3],'len':19},
                '2':{'g':[71.9,53.4],'t':[88.3,57.8],'grip':[70.6,51.5],'aim':[87.9,59.2],'len':19},
                '3':{'g':[70.6,54.3],'t':[86.3,58.9],'paint':[[70,54,'#000000']],'grip':[68.9,52.9],
                     'aim':[86,60.1],'len':19},
                '4':{'g':[67.7,52.3],'t':[83.3,60.2],'grip':[66.5,52.7],'aim':[84,61],'len':19},
                '5':{'g':[64.5,52.1],'t':[82.9,60.1],'grip':[65.2,51.6],'aim':[81.7,61.5],'len':19},
                '6':{'g':[65.9,51.8],'t':[82.2,59.3],'grip':[65,50.8],'aim':[81.6,60.6],'len':19},
                '7':{'g':[68.1,52.6],'t':[85.3,58.2],'grip':[66.8,51.2],'aim':[84.7,59.6],'len':19,
                     'clear':[[73,56]]}},
        'jump':{'0':{'g':[76.5,60],'t':[94.3,65.8]},
                '2':{'g':[76.9,31.9],'t':[89.4,19.4],'paint':[[72,35,'#000000'],[70,36,'#000000'],
                     [71,36,'#000000'],[72,36,'#000000'],[70,37,'#000000'],[71,37,'#000000'],
                     [72,37,'#000000']]},
                '3':{'g':[77.3,28.5],'t':[88.1,15.1],'keep':[[79,29,80,30]],
                     'paint':[[79,28,'#000000'],[80,29,'#000000'],[78,31,'#000000'],[73,32,'#000000']],
                     'clear':[[x,y] for x in range(70,74) for y in (33,34)]+[[71,35],[72,35]]},
                '4':{'g':[77,27.2],'t':[87.8,13.9],'paint':[[73,31,'#000000']],
                     'clear':[[78,23],[71,32],[72,32],[73,32],[71,33],[72,33],[73,33],[72,34]]},
                '5':{'g':[77,27.2],'t':[87.8,13.9],'paint':[[73,31,'#000000']],
                     'clear':[[78,23],[72,32],[73,32],[71,33],[72,33],[73,33],[71,34],[72,34]]},
                '6':{'g':[78,33],'t':[89.4,20.3],'cut':[[78,17,83,22]],'paint':[[73,36,'#000000']],
                     'clear':[[x,y] for x in range(70,75) for y in (37,38)]+[[71,39],[72,39]]},
                '7':{'g':[76,47.5],'t':[94,43.5],'clear':[[78,51],[77,52],[78,52],[77,53]]}},
        'land':{'0':{'g':[69,53.3],'t':[89.5,61.5],'paint':[[70,52,'#000000'],[70,53,'#000000'],
                     [70,54,'#000000'],[70,55,'#000000'],[70,56,'#000000'],[70,57,'#000000']]},
                '2':{'g':[79.2,49.4],'t':[85.5,28.2],'clear':[[82,29],[82,30],[81,32]],
                     'paint':[[80,35,'#000000'],[80,36,'#000000'],[79,36,'#19a2eb'],[78,36,'#19a2eb'],
                     [77,36,'#19a2eb'],[76,36,'#19a2eb'],[77,34,'#d8ecff']]},
                '3':{'g':[82.5,48],'t':[82.5,26],
                     'paint':[[80,35,'#000000'],[80,36,'#000000'],[80,37,'#000000'],[80,38,'#000000'],
                     [80,39,'#000000'],[80,40,'#000000'],[79,36,'#19a2eb'],[79,37,'#19a2eb'],
                     [79,38,'#19a2eb'],[79,39,'#19a2eb'],[79,40,'#19a2eb'],[78,40,'#19a2eb'],
                     [77,40,'#19a2eb'],[76,40,'#19a2eb'],[77,38,'#d8ecff']]}},
        'dash':{'1':{'g':[62,52],'t':[55.5,71.5],'cut':[[61,60,61,62],[62.87,62.86,62.88,62.87],
                     [58,66,58,66.5],[55,70,55,70.5]],'paint':[[60,51,'#000000'],[60,52,'#000000'],
                     [61,53,'#000000'],[62,53,'#000000'],[63,53,'#000000'],[65,55,'#000000'],
                     [64,57,'#000000'],[64,58,'#000000']]}},
        'hurt':{'1':{'g':[54.5,49.5],'t':[44,69.5],'paint':[[47,69,'#000000']],
                     'clear':[[48,47],[49,47],[50,47],[51,47],[48,48],[49,48],[49,53]]},
                '2':{'g':[62.5,50],'t':[62.5,70.5],'tint':[[58,47,59,48]],
                     'paint':[[57,50,'#000000'],[58,50,'#000000'],[59,50,'#000000'],[60,50,'#000000']]},
                '3':{'g':[70.1,52.4],'t':[84.7,63],'paint':[[70,55,'#000000']]}},
        'down':{'2':{'g':[85.7,64.3],'t':[92.4,50.2],'clear':[[85,64]]},
                '3':{'g':[80,71.5],'t':[81,59.5],'grip':[80,73.5],'aim':[104,74],'under':[[56,56,79,79]],
                     'paint':[[80,54,'#000000'],[81,69,'#000000']]}},
        'getup':{'0':{'g':[80,71.5],'t':[81,59.5],'grip':[80,73.5],'aim':[104,74],'under':[[56,56,79,79]],
                      'paint':[[80,54,'#000000'],[81,69,'#000000']]},
                 '1':{'g':[82.4,70.1],'t':[84.2,53.1],'cut':[[86,54,86,55]],'aim':[91,48],
                      'paint':[[82,54,'#000000'],[81,55,'#000000'],[82,53,'#29adff'],[81,54,'#29adff'],
                      [80,55,'#29adff'],[79,53,'#d8ecff']]},
                 '2':{'g':[76.5,61.4],'t':[92.5,51.3]},
                 '4':{'g':[70.6,52.4],'t':[85.7,65]}},
        'ko':{'1':{'g':[74,57.5],'t':[92,63.4]}},
        'win':{'1':{'g':[76.9,49.7],'t':[90.2,44.6],'clear':[[76,48],[76,49],[76,50],[76,51],[76,52],
                    [77,49],[77,50],[76,53],[77,53]]},
               '2':{'g':[77.5,44.4],'t':[87.6,29.7],'cut':[[75,47.5,75.5,51],[80.5,43,81,44]],
                    'keep':[[77,45,77,45]]},
               '3':{'g':[78.2,40.3],'t':[82.6,23.9],'cut':[[76,46,76,48]]}},
        'slash1':{'0':{'g':[71.1,52.3],'t':[85.3,61.5]},
                  '1':{'g':[61.7,51.1],'t':[79.3,64.6],'paint':[[58,47,'#000000'],[59,47,'#000000'],
                       [58,48,'#000000'],[59,48,'#000000']]},
                  '2':{'g':[62,50],'t':[30.5,49.5],'cut':[[55.5,46.5,56,47]],'grip':[63.5,50],'len':33},
                  '3':{'g':[62.5,49.9],'t':[69.6,71.8],'keep':[[68,73,74,76]],
                       'paint':[[67,63,'#000000'],[68,63,'#000000'],[69,63,'#000000'],[65,64,'#000000'],
                       [66,64,'#000000'],[65,65,'#000000'],[66,66,'#000000'],[66,67,'#000000'],
                       [66,68,'#000000'],[67,69,'#000000'],[65,66,'#5f574f']]},
                  '4':{'g':[76,51.5],'t':[97,62]}},
        'slash2':{'0':{'g':[71.1,52.3],'t':[85.3,61.5]},
                  '2':{'hide':True,'tint':[[83,54,83,54],[84,55,85,55],[86,56,86,56]]},
                  '3':{'g':[77.5,36],'t':[77.5,16],'blaze':True,'cut':[[74.5,16,91,16],
                       [74.5,21,91,21],[74.5,26,91,26],[74.5,31,91,31],[74.5,33.5,91,33.5]],
                       'clear':[[73,20],[73,21],[73,22],[73,23],[73,24],[73,25],[73,26],[73,27],[73,28],
                       [73,29],[82,36],[81,37],[82,37],[76,43],[77,43],[76,44],[77,44],[76,45],[77,45]],
                       'paint':[[71,21,'#000000'],[72,21,'#000000'],[70,22,'#000000'],[71,22,'#000000'],
                       [67,23,'#000000'],[68,23,'#000000'],[69,23,'#000000'],[70,23,'#000000'],
                       [71,23,'#000000'],[67,24,'#000000'],[68,24,'#000000'],[69,24,'#000000'],
                       [72,24,'#000000'],[69,25,'#000000'],[70,25,'#000000'],[71,25,'#000000'],
                       [72,25,'#000000'],[70,26,'#000000'],[71,26,'#29adff'],[72,26,'#000000'],
                       [70,27,'#000000'],[71,27,'#29adff'],[72,27,'#000000'],[70,28,'#000000'],
                       [71,28,'#29adff'],[72,28,'#000000'],[71,29,'#29adff'],[72,29,'#000000'],
                       [68,30,'#29adff'],[69,30,'#29adff'],[70,30,'#29adff'],[71,30,'#29adff'],
                       [72,30,'#000000'],[69,28,'#d8ecff']]},
                  '4':{'g':[77.5,36],'t':[77.5,16],'blaze':True,'cut':[[74.5,16,91,16],
                       [74.5,21,91,21],[74.5,26,91,26],[74.5,31,91,31],[74.5,33.5,91,33.5]],
                       'clear':[[73,20],[73,21],[73,22],[73,23],[73,24],[73,25],[73,26],[73,27],[73,28],
                       [73,29],[82,36],[81,37],[82,37],[76,43],[77,43],[76,44],[77,44],[76,45],[77,45]],
                       'paint':[[71,21,'#000000'],[72,21,'#000000'],[70,22,'#000000'],[71,22,'#000000'],
                       [67,23,'#000000'],[68,23,'#000000'],[69,23,'#000000'],[70,23,'#000000'],
                       [71,23,'#000000'],[67,24,'#000000'],[68,24,'#000000'],[69,24,'#000000'],
                       [72,24,'#000000'],[69,25,'#000000'],[70,25,'#000000'],[71,25,'#000000'],
                       [72,25,'#000000'],[70,26,'#000000'],[71,26,'#29adff'],[72,26,'#000000'],
                       [70,27,'#000000'],[71,27,'#29adff'],[72,27,'#000000'],[70,28,'#000000'],
                       [71,28,'#29adff'],[72,28,'#000000'],[71,29,'#29adff'],[72,29,'#000000'],
                       [68,30,'#29adff'],[69,30,'#29adff'],[70,30,'#29adff'],[71,30,'#29adff'],
                       [72,30,'#000000'],[69,28,'#d8ecff']]}},
        'spin_slash':{'0':{'g':[69,52.5],'t':[85,63.2]},
                      '1':{'g':[64,53],'t':[81,63.3]},
                      '2':{'g':[60.2,48.9],'t':[50.7,55.9],'paint':[[50,56,'#000000']]},
                      '3':{'g':[49.5,47.5],'t':[31.5,37.5]},
                      '4':{'hide':True,'tint':[[66,56,66,56]]},
                      '5':{'hide':True,'clear':[[71,54],[72,54],[73,54],[74,54],[75,54],[76,54],
                           [77,54],[72,55],[73,55],[74,55],[75,55],[76,55],[77,55],[78,55],[79,55],
                           [72,56],[73,56],[74,56],[75,56],[76,56],[77,56],[78,56],[79,56],[80,56],
                           [81,56],[74,57],[75,57],[76,57],[77,57],[78,57],[79,57],[80,57],[81,57],
                           [75,58],[76,58],[77,58],[78,58],[79,58],[80,58],[81,58],[82,58],[83,58],
                           [84,58],[76,59],[77,59],[78,59],[79,59],[80,59],[81,59],[82,59],[83,59],
                           [84,59],[85,59],[79,60],[80,60],[81,60],[82,60],[83,60],[84,60],[85,60],
                           [86,60],[81,61],[82,61],[83,61],[84,61],[85,61],[86,61],[87,61],[82,62],
                           [83,62],[84,62],[85,62],[86,62],[87,62],[84,63],[85,63],[86,63],[87,63],
                           [88,63]]}},
        'thrust':{'0':{'g':[69.5,52.8],'t':[85.1,61.8],'paint':[[70,54,'#000000']]},
                  '4':{'g':[79,46.4],'t':[96.5,45.8]},
                  '5':{'g':[80,51.3],'t':[94,56.4],'grip':[75,49.5],'aim':[94,56.4],'len':19.5}},
        'rising_dragon':{'0':{'g':[71,54],'t':[85.5,66.5]},
                         '2':{'g':[51,28.1],'t':[33.1,29.5],'under':[[44,12,76,44]],
                              'clear':[[51,24],[52,24],[52,25],[52,26],[51,27],[52,27],[51,28],[52,28],
                              [51,29],[52,29],[51,30],[52,30],[51,31],[52,31],[51,32],[52,32],[50,33],
                              [51,33],[52,33],[51,34],[52,34]]},
                         '3':{'g':[75.4,31.2],'t':[71.7,15.8],'under':[[60,8,80,29]]},
                         '4':{'g':[75.4,31.2],'t':[71.7,15.8],'under':[[60,8,80,29]]},
                         '5':{'g':[77.5,51.5],'t':[93.5,44]}},
        'cleave':{'0':{'g':[73,52],'t':[86,69.8]},
                  '1':{'g':[52.8,23.8],'t':[31.9,27.6],'under':[[48,12,80,40]],
                       'clear':[[50,20],[51,19],[51,20],[52,20]]},
                  '2':{'hide':True,'clear':[[82,29]]},
                  '3':{'hide':True,'blaze':True,'keep':[[66,30,77,42]]},
                  '4':{'hide':True,'blaze':True},
                  '5':{'hide':True,'blaze':True},
                  '6':{'g':[67.2,57.7],'t':[81.4,72.7],'cut':[[70.5,56,71.5,57],[72.5,58,74,62]]},
                  '7':{'g':[67.2,57.7],'t':[81.4,72.7],'cut':[[70.5,56,71.5,57],[72.5,58,74,62]]}},
        'air_slash':{'1':{'g':[57.9,21.2],'t':[45.3,14.4],'smear':[[37,23,45,30],[49,22,56,27]],
                          'under':[[52,8,80,36]]},
                     '2':{'g':[72.8,52.5],'t':[90.2,57.6]},
                     '3':{'g':[72.8,52.5],'t':[90.2,57.6]}},
        'air_rising_cut':{'0':{'g':[71.9,53.4],'t':[88.2,65.8]},
                          '2':{'hide':True,'tint':[[57,19,60,20],[57,21,59,22],[38,38,38,38]]},
                          '3':{'hide':True,'tint':[[57,19,60,20],[57,21,59,22],[38,38,38,38]]},
                          '1':{'g':[73.5,24.5],'t':[89,46],'cut':[[58.5,11.5,62,15],
                               [74,25,74.5,25],[92.5,49.5,90,56]],
                               'grip':[75.8,27.7],'len':22.5,'under':[[56,6,78,32]],
                               'tint':[[57,13,57,13],[60,16,60,16]]}},
        'meteor_slash':{'0':{'g':[81,47],'t':[88.5,47],'cut':[[73.5,47,81,47],[72,43,73,43]]},
                        '1':{'g':[58.9,24.3],'t':[49.1,12.9],'under':[[52,14,76,40]]},
                        '2':{'g':[60,22],'t':[42,22],'under':[[60,14,80,34]],'clear':[[62,18],
                             [63,18],[62,19],[63,19],[61,20],[62,20],[63,20]],
                             'paint':[[65,21,'#000000'],[62,21,'#000000'],[62,22,'#000000'],
                             [62,23,'#000000'],[62,24,'#000000'],[62,25,'#000000'],[62,26,'#000000'],
                             [63,25,'#000000']]},
                        '3':{'g':[66.5,21.5],'t':[51,11.2],'blaze':True,'keep':[[60,24,78,42]],
                             'grip':[62.3,18.7],'len':13.6,'under':[[52,14,78,42]]}},
        'plunge':{'2':{'g':[82,58],'t':[85.5,40.5],'clear':[[80,64],[81,64],[79,65],[80,65],
                       [81,65],[79,66],[80,66],[81,66],[79,67],[80,67]]},
                  '3':{'g':[80,68.5],'t':[84.5,48],'aim':[89.5,42],'clear':[[78,74],[79,74],
                       [80,74],[78,75],[79,75],[80,75],[77,76],[78,76],[79,76],[77,77],[78,77]],
                       'paint':[[84,44,'#000000'],[85,44,'#000000'],[83,46,'#000000'],[82,47,'#000000'],
                       [82,45,'#30a1f4']]}},
    },
    'angkor':{
        'down':{'0':{'g':[74,101.7],'t':[114.6,99.5]}},
        'getup':{'1':None,'3':{'g':[70,88.7],'t':[102.9,104.3]}},
        'ko':{'1':None},
        'spin_slash':{'4':{'g':[83.5,74.4],'t':[109.9,83.3]}},
        'air_rising_cut':{'1':{'g':[86.6,69.3],'t':[110.6,43.6]}},
        # the blade lies across his trailing cloth, so with it gone the cloth's tip and edge float loose
        'run':{'1':{'g':[57.8,78.5],'t':[39.1,84.3],'clear':[[45,78],[46,78],[47,77],[47,78],[48,76],[48,77],
                    [48,78],[49,76],[49,77],[49,78],[49,79],[50,75],[50,76],[50,77],[50,78],[51,75],[51,76],
                    [51,77],[51,78],[52,75],[52,76],[52,77],[52,78],[53,76],[53,77],[54,76]]},
               '2':{'g':[57.8,75.4],'t':[39.1,81.3],'clear':[[52,80],[53,80],[49,81],[50,81],[52,81],[53,81],
                    [54,81],[49,82],[50,82],[51,82],[52,82],[53,82],[54,82],[49,83],[50,83],[51,83]]},
               '5':{'g':[57.8,77.5],'t':[39.1,83.3],'clear':[[46,77],[47,76],[47,77],[48,76],[49,75],[49,76],
                    [49,77],[50,75],[50,76],[50,77],[51,75],[51,76],[52,75],[53,75],[54,75]]}},
    },
}

def frame_annotation(n,fr,ov,k,own):
    if str(k) in own: return own[str(k)]
    smear=COOL and n in ATTACKS and smear_mask(fr,swing=True,armour=False).sum()>=100
    # the Moss Shade hides the weapon in its smear on these frames; the Ember, Firefly and Blue Shades'
    # takes on some of them have no smear at all, so their blade would show in every other weapon's row
    if str(k) in ov and not ((WARM or PALE) and ov[str(k)].get('hide') and not smear): return ov[str(k)]
    if smear: return {'hide':True}
    found=detect(fr)
    # a white swing is found as one line far longer than any blade: it is a smear to recolour
    if PALE and n in ATTACKS and found and math.dist(found['g'],found['t'])>BLADE_LONGEST:
        return {'hide':True}
    return found

def annotations():
    out={}
    for n in ANIMS:
        a=meta['animations'][n]; im=np.array(Image.open(SRC+a['file']).convert('RGBA'))
        ov=OVERRIDES.get(n,{})
        if COOL: ov={k:v for k,v in ov.items() if v.get('hide')}
        # the Bokator fighter's sheets were not drawn on the Moss Shade's frames, so its hide frames do not fit
        if GILDED: ov={}
        own=OWN_OVERRIDES.get(VARIANT or 'moss',{}).get(n,{})
        out[n]=[frame_annotation(n,im[:,k*FW:(k+1)*FW],ov,k,own) for k in range(a['frames'])]
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
    seg=(along>=-0.5)&(along<=L+(PALE_TIP if PALE else 2.5))
    edge=PALE_EDGE if PALE else MOSS_EDGE if MOSS else None
    kill=seg&A&(((perp<=(edge or 1.5))&greenish)|((perp<=(edge or 2.3))&(tr>=0.3)))
    if GILDED:
        kill|=gilded_rails(fr,A,Gp,tr,seg&(along>=2)&(perp<=3.4))
        kill|=gilded_shaft(A,g,u,along,perp,L)
    out[kill]=0
    if BRIDGED: out=bridged(out,kill,g,u,along,-px*u[1]+py*u[0])
    if GILDED:
        out,fist=covered_shaft(out,fr,A&~kill,g,u,along,L)
        out=without_sparkles(out,(along>=-SHAFT_BACK)&(along<=L+12)&(perp<=14))
        # his grip is his fist, which holds the spear or axe drawn in this frame
        return out,g+u*fist,u,L-fist
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

# where the blade lay across the body, with the body on both sides of it, each pixel it covered takes
# the one mirrored across its edge, or across the far edge where the body on its own side is too thin
# to give one, so the body runs on under it; where it lay out in the open, or along the body's edge,
# it just goes
def bridged(out,kill,g,u,along,side):
    n=np.array([-u[1],u[0]]); solid=out[...,3]>0; res=out.copy()
    edge=PALE_EDGE if PALE else MOSS_EDGE
    def at(p):
        x,y=int(round(p[0])),int(round(p[1]))
        return (y,x) if 0<=x<FW and 0<=y<FH and solid[y,x] else None
    for y,x in zip(*np.nonzero(kill)):
        sgn=1 if side[y,x]>=0 else -1
        foot=g+u*along[y,x]; reach=edge+1.5
        if not (at(foot+n*sgn*reach) and at(foot-n*sgn*reach)): continue
        depth=2*(edge+1)-abs(side[y,x])
        source=at(foot+n*sgn*depth) or at(foot-n*sgn*depth)
        if source: res[y,x]=out[source]
    return res

# the holes a blade taken away left with the body all round them; where it ran out into the open
# it just goes
def patched(img,fr):
    solid=img[...,3]>0
    holes=nd.binary_fill_holes(solid)&~solid&(fr[...,3]>0)
    gg,r=glow_and_base(fr)
    return refilled(img,fr,holes,(gg-r>=30)&(gg>=60))

# where the blade lay across the body the body runs on under it, in the colours just beside it
def refilled(out,fr,holes,glow):
    res=out.copy()
    for y,x in zip(*np.nonzero(holes)):
        y0,y1,x0,x1=max(0,y-2),min(FH,y+3),max(0,x-2),min(FW,x+3)
        near=fr[y0:y1,x0:x1][(fr[y0:y1,x0:x1,3]>0)&~glow[y0:y1,x0:x1]&~holes[y0:y1,x0:x1]]
        if len(near): res[y,x]=np.median(near,0).astype(np.uint8); res[y,x,3]=255
    return res

# a small piece of a swing fading into the air, with no white in it, is one colour: a darker rim round
# so few pixels left a lit pixel or two inside it, and it read as a hollow box
PIECE_MOST=40
def unlit_pieces(sm,l):
    lab,_=nd.label(sm,structure=np.ones((3,3),bool))
    sizes=np.bincount(lab.ravel()); white=np.bincount(lab.ravel(),weights=(l>=0.85).ravel())
    flat=(sizes<=PIECE_MOST)&(white==0); flat[0]=False
    return flat[lab]

# a pale blade's smear is near white all through, so by lightness alone it took the ramp's lightest
# step whole and read flat cream or white: its bright part follows the stroke instead, a darker rim
# round a broad stroke or a cyan edge, the lightest step only along its white core line
def pale_steps(sm,l):
    d=nd.distance_transform_edt(sm); rim=sm&(d<1.5)&~unlit_pieces(sm,l)
    edged=rim&((nd.maximum_filter(d,size=5)>=2.8)|(nd.maximum_filter(d,size=3)>=2)&(l<0.85))
    core=(d>=2)&(d>=nd.maximum_filter(d,size=3)-0.45)&(l>=0.85)
    return np.where(edged,1,np.where(core,3,2))

def recolor_smear(img,sm,ramp):
    out=img.copy(); cols=[hx(c) for c in ramp]
    r,g,b=[img[...,i].astype(float) for i in range(3)]
    l=(0.25*r+0.6*g+0.15*b)/255
    lit=pale_steps(sm&(img[...,3]>0),l) if PALE else None
    for y,x in zip(*np.nonzero(sm&(img[...,3]>0))):
        v=l[y,x]; k=0 if v<0.42 else 1 if v<0.56 else lit[y,x] if PALE else 2 if v<0.75 else 3
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
    # a spear that would run out of its frame is held shorter, so its head still shows
    while L>4 and not (2<=(G+u*(L+9))[0]<=FW-3 and 2<=(G+u*(L+9))[1]<=FH-3): L-=1
    # and the Moss, Firefly and Blue Shades' butt ends short of the frame's edge, never cut off by it
    butt=11
    while BRIDGED and butt>2 and not (2<=(G-u*butt)[0]<=FW-3 and 2<=(G-u*butt)[1]<=FH-3): butt-=1
    a=G-u*butt; tip=G+u*(L+9)
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
    c=e-u*2.5
    if (c+n*6.5)[1]>FH-4: n=-n                            # an axe lying on the ground keeps its blade above it
    line(Ly,a,e,WOOD); line(Ly,a-n*0.9,e-n*0.9,WOODD); line(Ly,a+n*0.6,e+n*0.6,WOODH)
    pts=[c+n*0.5-u*2,c+n*0.5+u*2,c+n*5.5+u*4.5,c+n*6.5+u*1,c+n*6.5-u*1.5,c+n*5.5-u*4.5]
    fill_poly(Ly,pts,STEEL)
    line(Ly,c+n*6.2+u*3.5,c+n*6.2-u*3.5,STEELH); line(Ly,c+n*5.6+u*4.2,c+n*5.6-u*4.2,STEELH)
    line(Ly,c+n*1.5-u*1.5,c+n*1.5+u*1.5,STEELD)
    for k in (1,2): put(Ly,*(c-n*k),STEELD)   # back spike
    put(Ly,*(c+n*7+u*0),glow)
    put(Ly,*(c-u*0.5+n*0),GOLD)
    return outline_layer(Ly)

# the boxes [x0,y0,x1,y1] of a 'keep', which every row shows as drawn (an eye or a lit hood that a
# swing's glow runs into, which the smear would take with it), or of a 'smear', whose glow is
# recoloured with the swing (sparks touching the hood, which pass for its trim)
def boxed(boxes):
    zone=np.zeros((FH,FW),bool)
    for x0,y0,x1,y1 in boxes: zone[y0:y1+1,x0:x1+1]=True
    return zone

WCOL={'fists':hx('#ffd23f'),'spear':hx('#a8e6ff'),'axe':hx('#ffa640')}
def blade_band(ann):
    if not (PALE and ann and 'g' in ann): return None
    g=np.array(ann['g'],float); t=np.array(ann['t'],float); u=(t-g)/max(1e-6,np.linalg.norm(t-g))
    ys,xs=np.mgrid[0:FH,0:FW]
    along=(xs-g[0])*u[0]+(ys-g[1])*u[1]; perp=np.abs(-(xs-g[0])*u[1]+(ys-g[1])*u[0])
    return (along>=-0.5)&(along<=np.linalg.norm(t-g)+PALE_TIP)&(perp<=PALE_EDGE)

# where the blade was taken away the body is filled back in, and that is no smear to recolour; a
# 'blaze' frame's swing runs through the glow round him, which it recolours whole
def render_frame(fr,ann,weapon,swing=False):
    band=blade_band(ann)
    if ann and ann.get('blaze'): sm=smear_mask(fr,armour=False)
    else: sm=smear_mask(fr,swing,strike=bool(ann and ann.get('hide')),blade=band)
    if band is not None: sm&=~band
    if SPARKS: sm&=~loose_sparks(fr,sm,band)
    if weapon=='sword': return fr
    img=fr.copy(); grip=None
    if ann and 'g' in ann:
        img,grip,u,L=erase_blade(fr,ann['g'],ann['t'])
        if ann.get('len'): L=ann['len']
        if ann.get('grip'): grip=np.array(ann['grip'],float)
        if ann.get('aim'): u=np.array(ann['aim'],float)-grip; u/=np.linalg.norm(u)
        img=cut_runs(img,ann.get('cut',[]))
        if BRIDGED: img=patched(img,fr)
        # the Moss Shade's body is mended where his blade lay, so his smear is read off the mended frame
        if MOSS and not ann.get('blaze'): sm=smear_mask(img,swing,strike=bool(ann.get('hide')))
    # a 'burst' box gives back the glow the blade's erase took there, a thrust's burst or a swing's
    # smear the blade runs into, to be recoloured with the smear
    if ann and ann.get('burst'):
        gg,r=glow_and_base(fr); back=boxed(ann['burst'])&(fr[...,3]>0); img[back]=fr[back]
        sm|=back&(gg-r>=40)&(gg>=100)
    # added last, so a 'smear' box holds on the Moss Shade's mended frame as well
    if ann and ann.get('smear'):
        gg,r=glow_and_base(fr); sm|=boxed(ann['smear'])&(gg-r>=40)&(gg>=100)
    if ann and ann.get('tint'): sm|=boxed(ann['tint'])
    # the Ember Shade's spear burns with its sword's own fire, so its smear keeps the sword's colours
    if not (WARM and weapon=='spear'): img=recolor_smear(img,sm,RAMPS[weapon])
    if ann and ann.get('keep'): zone=boxed(ann['keep']); img[zone]=fr[zone]
    if ann and (ann.get('paint') or ann.get('clear')): img=touched_up(img,ann)
    if ann and 'g' in ann and not ann.get('hide') and weapon in ('spear','axe'):
        drawn=draw_spear(grip,u,L) if weapon=='spear' else draw_axe(grip,u,L,WCOL['axe'])
        layer=behind(drawn,img,ann); img=comp(img,layer)
        if BRIDGED: img=sealed(img,layer,ann.get('pocket',POCKET_MOST))
    return img

# a pocket of air a few pixels across, shut in by his weapon's outline against his body or inside the
# weapon's own drawing, reads as a hole, so it takes the outline; a frame's 'pocket' sets a larger one
POCKET_MOST=6
def sealed(img,layer,most):
    air=img[...,3]==0; held=layer[...,3]>0
    lab,n=nd.label(air); sizes=np.bincount(lab.ravel(),minlength=n+1)
    touching=np.bincount(lab.ravel(),weights=nd.binary_dilation(held).ravel(),minlength=n+1)>0
    pocket=(sizes<=most)&touching; pocket[0]=False
    out=img.copy(); out[pocket[lab]]=OL
    return out

# 'paint' and 'clear' go on last, under the weapon, so a hand-drawn pixel is what every weapon row shows
def touched_up(img,ann):
    img=img.copy()
    for x,y,colour in ann.get('paint',[]): img[y,x]=hx(colour)
    for x,y in ann.get('clear',[]): img[y,x]=0
    return img

# in an 'under' box his weapon passes behind him (a spear's butt behind his hood as he swings it back,
# an axe head lying beside his head on the ground), so there his body is drawn over it
def behind(layer,img,ann):
    if not ann.get('under'): return layer
    layer=layer.copy(); layer[boxed(ann['under'])&(img[...,3]>0)]=0
    return layer

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
                strip[wi*FH:(wi+1)*FH,k*FW:(k+1)*FW]=render_frame(fr,ann[n][k],w,n in ATTACKS)
        if n=='dash':strip[:,0:FW]=strip[:,FW:2*FW]   # the first dash frame is a full-body smear; the game shows the clean lean frames only
        for wi,w in enumerate(WEAPS):
            own=own_row(n,N,w)
            if own is not None: strip[wi*FH:(wi+1)*FH]=own
        res[n]=strip
        if outdir: save_indexed(strip,outdir+'hero_'+n+'.png')
    return res


def glow_mask(fr): return masks(fr)[1]

# the Moss, Firefly, Antler Spirit and Blue Shades are dressed in their element after the bake
# (tools/shade_fx/), their ultimate too, which then plays from arsenal/ as well
# the effects come after the weapon (a firefly by its haft, the glow of the hand that holds it), so they
# can shut a pixel or two of air against it; in the spear and axe rows such a pocket, where the fists
# row has none, is the weapon's and takes its outline
def pockets_closed(strip):
    out=strip.copy()
    for k in range(strip.shape[1]//FW):
        open_air=small_pockets(strip[FH:2*FH,k*FW:(k+1)*FW])
        for row in (2,3):
            fr=out[row*FH:(row+1)*FH,k*FW:(k+1)*FW]
            fr[small_pockets(fr)&~open_air]=OL
    return out

# air the effects shut in (a firefly's cross or trail against a smear's rim or the cloak's outline),
# where the drawn frame had open air, takes the colour most of the pixels round it have in that row;
# past a single pixel only against his dark body, as the gaps between a burst's bright rays stay open
SPECK_MOST=1
DARK_RING=0.3
def specks_closed(strip,drawn):
    out=strip.copy()
    for k in range(strip.shape[1]//FW):
        art=drawn[:,k*FW:(k+1)*FW]
        open_air=(art[...,3]==0)&~small_pockets(art)
        for row in range(strip.shape[0]//FH):
            fr=out[row*FH:(row+1)*FH,k*FW:(k+1)*FW]
            lab,n=nd.label(small_pockets(fr))
            for i in range(1,n+1):
                hole=lab==i
                if open_air[hole].all() and (hole.sum()<=SPECK_MOST or dark_ring(fr,hole)):
                    fr[hole]=most_round(fr,hole)
    return out

def ring_of(fr,hole): return fr[nd.binary_dilation(hole)&~hole&(fr[...,3]>0)]

def dark_ring(fr,hole):
    ring=ring_of(fr,hole).astype(float)
    return ((0.25*ring[:,0]+0.6*ring[:,1]+0.15*ring[:,2])/255<DARK_RING).mean()>=0.5

def most_round(fr,hole):
    colours=[tuple(c) for c in ring_of(fr,hole)]
    return max(sorted(set(colours)),key=colours.count)

# the strip as drawn, with the bake's copy of the second dash frame over the first
def drawn_strip(name):
    art=np.array(Image.open(SRC+meta['animations'][name]['file']).convert('RGBA'))
    if name=='dash': art[:,0:FW]=art[:,FW:2*FW]
    return art

def small_pockets(fr):
    lab,n=nd.label(fr[...,3]==0); sizes=np.bincount(lab.ravel(),minlength=n+1)
    small=sizes<=POCKET_MOST; small[0]=False
    return small[lab]

def bake_dressed(outdir):
    hero=VARIANT or 'moss'
    strips=shade_fx.dress(hero,bake_all(annotations()),meta,smear_mask,glow_mask)
    if BRIDGED: strips={n:specks_closed(pockets_closed(strip),drawn_strip(n)) for n,strip in strips.items()}
    for n,strip in strips.items(): save_indexed(strip,outdir+'hero_'+n+'.png')
    ult=shade_fx.dress_ult(hero,SRC+'hero_ult.png',smear_mask,glow_mask)
    if ult is not None and BRIDGED: ult=specks_closed(ult,np.array(Image.open(SRC+'hero_ult.png').convert('RGBA')))
    if ult is not None: save_indexed(ult,outdir+'hero_ult.png')
    return strips

if __name__=='__main__':
    os.makedirs(OUT,exist_ok=True)
    bake_dressed(OUT)
    print('wrote',len(ANIMS),'strips to',os.path.relpath(OUT,ROOT))
