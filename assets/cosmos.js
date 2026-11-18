/* Cosmic Portfolio Background — self-contained Canvas 2D engine.
 * Scene 0 wave · 1 constellations · 2 galaxies · 3 path · 4 calm field · 5 convergence.
 * No third-party dependencies. The underlying site remains ordinary accessible HTML.
 */
(() => {
  'use strict';
  const canvas = document.getElementById('cosmos');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('[data-cosmos-scene]')];
  const scenes = sections.map(section => Number(section.dataset.cosmosScene));
  const header = document.querySelector('.topbar');
  const root = document.documentElement;
  const mobile = window.matchMedia('(pointer: coarse)');
  const TWO_PI = Math.PI * 2;
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = v => {v=clamp(v,0,1); return v*v*(3-2*v);};
  const fract = x => x - Math.floor(x);
  const noise = x => fract(Math.sin(x * 127.1 + 78.233) * 43758.5453123);
  const art = ['wave','constellations','galaxies','route','arcs','orbits'];
  const focus = [.61,.64,.77,.62,.71,.625];
  const scriptUrl=document.currentScript.src;
  function loadPlate(name){
    const image=new Image();
    image.addEventListener('load',schedule);
    image.src=new URL(`media/cosmos/${name}.webp`,scriptUrl).href;
    return image;
  }
  const plates=art.map(loadPlate);
  const lightPlates=[];
  const count=1050;
  const dust=Array.from({length:count},(_,i)=>({
    a:noise(i+7), b:noise(i+1757), c:noise(i+3973), d:noise(i+5701)
  }));
  const hubs=[[.139,.349],[.325,.672],[.38,.087],[.656,.367],[.682,.764],[.875,.707],[.956,.495]];
  const edges=[[0,1],[0,2],[1,3],[1,4],[2,3],[3,4],[3,6],[4,5],[5,6]];
  const route=[[.113,.638],[.262,.638],[.422,.502],[.563,.421],[.749,.459],[.902,.264]];
  const galaxies=[[.228,.425],[.825,.151],[.829,.845]];
  const star=[.626,.476];
  const egg=document.querySelector('[aria-controls="cosmos-promo"]');
  const promo=document.querySelector('#cosmos-promo');
  egg?.addEventListener('click',()=>promo.showModal());
  const moodEgg=document.querySelector('.cosmos-egg-mood');
  const moodDialog=document.querySelector('#cosmos-mood');
  moodEgg?.addEventListener('click',()=>moodDialog.showModal());
  const wave=[[0,.64],[.17,.75],[.41,.78],[.56,.64],[.69,.55],[.81,.40],[1,.21]];
  const arcs=[[0,.86],[.135,.785],[.38,.759],[.56,.71],[.64,.625],[.81,.35],[1,.28]];
  let frames=[];
  let vignette;
  let lightVignette;
  let width=0,height=0,raf=0,scrollState=0,lastTime=0,elapsed=0;
  let anchors=[], geometryDirty=true, compact=false, light=false;
  let pointer={x:-9999,y:-9999,targetX:-9999,targetY:-9999,present:false,fade:0,lastX:0,lastY:0,v:0};
  let trail=[];
  let reduced=prefersReduced.matches;
  const mag = (x,y) => Math.hypot(x,y);

  function dimensions() {
    width=canvas.clientWidth;
    height=canvas.clientHeight;
    compact=width<750||mobile.matches;
    const scale=Math.min(window.devicePixelRatio||1,compact?1.35:1.75);
    const pixelWidth=Math.round(width*scale),pixelHeight=Math.round(height*scale);
    if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){
      canvas.width=pixelWidth;
      canvas.height=pixelHeight;
    }
    ctx.setTransform(canvas.width/(width||1),0,0,canvas.height/(height||1),0,0);

    frames=focus.map(center=>{
      const w=Math.max(width,height*2);
      const h=w/2;
      return [clamp(width/2-w*center,width-w,0),(height-h)/2,w,h];
    });
    vignette=ctx.createLinearGradient(0,0,width,compact?height*.53:0);
    vignette.addColorStop(0,'rgba(8,8,10,.83)');
    vignette.addColorStop(.43,'rgba(8,8,10,.51)');
    vignette.addColorStop(1,'rgba(8,8,10,.06)');
    lightVignette=ctx.createLinearGradient(0,0,width,compact?height*.53:0);
    lightVignette.addColorStop(0,'rgba(246,242,234,.94)');
    lightVignette.addColorStop(.46,'rgba(246,242,234,.68)');
    lightVignette.addColorStop(1,'rgba(246,242,234,.04)');

    const style=getComputedStyle(header);
    const inset=['sticky','fixed'].includes(style.position)
      ? header.offsetHeight+(parseFloat(style.top)||0)
      : 0;
    const maxScroll=Math.max(0,document.scrollingElement.scrollHeight-root.clientHeight);
    anchors=sections.map((section,index)=>{
      if(index===0)return 0;
      const bounds=section.getBoundingClientRect();
      return clamp(bounds.top+window.scrollY-inset,0,maxScroll);
    });
    geometryDirty=false;
  }

  function getScrollState() {
    const y=window.scrollY;
    for(let i=1;i<anchors.length;i++){
      const end=anchors[i];
      if(y>=end)continue;
      const span=Math.min(height*.55,(end-anchors[i-1])*.65);
      return i-1+clamp(1-(end-y)/span,0,1);
    }
    return anchors.length-1;
  }

  function schedule(){if(!raf&&!document.hidden&&root.dataset.theme!=="daylight")raf=requestAnimationFrame(tick);}
  function invalidateGeometry(){geometryDirty=true;schedule();}
  function clearPointer(){
    pointer.present=false;
    pointer.fade=0;
    trail.length=0;
  }
  function track(event) {
    if(reduced||event.pointerType==='touch')return;
    if(!pointer.present){
      pointer.x=pointer.lastX=event.clientX;
      pointer.y=pointer.lastY=event.clientY;
      pointer.v=0;
      trail.length=0;
    }
    pointer.present=true; pointer.targetX=event.clientX;pointer.targetY=event.clientY;
  }
  window.addEventListener('pointermove',track,{passive:true});
  root.addEventListener('pointerleave',()=>pointer.present=false);
  window.addEventListener('blur',()=>pointer.present=false);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',invalidateGeometry,{passive:true});
  window.addEventListener('pageshow',invalidateGeometry);
  mobile.addEventListener('change',invalidateGeometry);
  const observer=new ResizeObserver(invalidateGeometry);
  [document.body,header,...sections].forEach(element=>observer.observe(element));
  document.fonts?.ready.then(invalidateGeometry);
  new MutationObserver(schedule).observe(root,{attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTime=0;clearPointer();}
    else invalidateGeometry();
  });
  prefersReduced.addEventListener('change',event=>{
    reduced=event.matches;
    lastTime=0;
    clearPointer();
    schedule();
  });

  function screen(scene,x,y){
    const [left,top,w,h]=frames[scene];
    return [left+x*w,top+y*h];
  }

  // Interpolating the same seeded particles preserves direction on reverse scroll.
  function curve(points,u){
    const pos=clamp(u,0,1)*(points.length-1);
    const i=Math.min(points.length-2,Math.floor(pos)),f=pos-i;
    const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(i+2,points.length-1)];
    return b.map((v,j)=>v+.5*f*((c[j]-a[j])+f*(2*a[j]-5*v+4*c[j]-d[j]+f*(3*v-3*c[j]+d[j]-a[j]))));
  }

  function place(scene,p,i,t){
    const {a,b,c,d}=p;
    if(scene===0||scene===3||scene===4){
      const [x,y]=curve(scene===0?wave:scene===3?route:arcs,a);
      return screen(scene,x,y+(b-.5)*(.031+d*.065)+.005*Math.sin(t*.55+a*14));
    }
    if(scene===1){
      const [ai,bi]=edges[i%edges.length];
      return screen(scene,lerp(hubs[ai][0],hubs[bi][0],a),lerp(hubs[ai][1],hubs[bi][1],a)+(b-.5)*.085);
    }
    const [cx,cy]=scene===2?galaxies[i%3]:star;
    const radius=.012+.14*c;
    const angle=scene===2?c*11+(i%2)*Math.PI+(b-.5)*.38+t*.19:a*TWO_PI+t*.16;
    return screen(scene,cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius*(scene===2?.52:2));
  }

  function mouseEffect(x,y){
    if(pointer.fade<.01)return [x,y,0];
    const dx=x-pointer.x,dy=y-pointer.y,dist=mag(dx,dy)||1;
    const radius=compact?110:190;
    const influence=pointer.fade*Math.pow(Math.max(0,1-dist/radius),2);
    // Elastic repulsion + slight swirl when cursor accelerates
    const push=influence*(13+Math.min(pointer.v,25)*.65);
    return [x+dx/dist*push+(-dy/dist)*influence*pointer.v*.7,y+dy/dist*push+(dx/dist)*influence*pointer.v*.7,influence];
  }
  function gold(alpha) {
    return light?`rgba(115,59,24,${alpha})`:`rgba(255,209,145,${alpha})`;
  }
  function strokeLine(a,b,alpha,widthLine=.6){
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineWidth=widthLine;
    ctx.strokeStyle=gold(alpha);ctx.stroke();
  }
  function glow(x,y,rad,alpha){
    const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(248,191,114,${alpha})`);
    g.addColorStop(.22,`rgba(221,141,66,${alpha*.27})`);
    g.addColorStop(1,'rgba(192,105,44,0)');
    ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,2*rad,2*rad);
  }
  function litStar(x,y,r,alpha){
    if(x < -15||x>width+15||y < -15||y>height+15) return;
    ctx.fillStyle=gold(alpha);
    ctx.beginPath();ctx.arc(x,y,r,0,TWO_PI);ctx.fill();
    if(r>1.4){glow(x,y,r*17,.12*alpha);ctx.strokeStyle=gold(alpha*.32);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x-r*5,y);ctx.lineTo(x+r*5,y);ctx.moveTo(x,y-r*5);ctx.lineTo(x,y+r*5);ctx.stroke();}
  }
  function drawBackdrop(from,to,mix){
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle=light?'#f6f2ea':'#08080a';
    ctx.fillRect(0,0,width,height);
    const paint=(id,alpha)=>{
      const image=light?(lightPlates[id]??=loadPlate(art[id]+'-light')):plates[id];
      if(!image?.naturalWidth)return;
      ctx.globalAlpha=alpha;
      ctx.drawImage(image,...frames[id]);
      ctx.globalAlpha=1;
    };
    paint(from,1);
    if(mix>0)paint(to,mix);

    ctx.fillStyle=light?lightVignette:vignette;
    ctx.fillRect(0,0,width,height);
  }

  function livePoint(scene,[x,y]){
    return mouseEffect(...screen(scene,x,y));
  }

  function livePath(scene,sample,steps,weight){
    let last=livePoint(scene,sample(0));
    for(let i=1;i<=steps;i++){
      const next=livePoint(scene,sample(i/steps));
      const near=Math.max(last[2],next[2]);
      const alpha=weight*(light?.09+near*.53:near*.84);
      if(alpha>.008)strokeLine(last,next,alpha,.65+near*1.3);
      last=next;
    }
  }

  function liveScene(scene,weight,t){
    if(weight<.002||(!light&&pointer.fade<.01))return;
    const node=(point,size)=>{
      const [x,y,near]=livePoint(scene,point);
      if(light||near>.015)litStar(x,y,size+near*3,weight*(light?.22+near*.49:near));
    };

    if(scene===0||scene===3||scene===4){
      const points=scene===0?wave:scene===3?route:arcs;
      const strands=scene===0?7:scene===4?3:1;
      for(let j=0;j<strands;j++){
        livePath(scene,u=>{
          const [x,y]=curve(points,u);
          return [x,y+(j-(strands-1)/2)*.016*Math.sin(u*Math.PI)];
        },70,weight*(j===Math.floor(strands/2)?1:.48));
      }
      if(scene===3){
        route.forEach(point=>node(point,2));
        node(curve(route,(t*.25)%1),1.4);
      }
    }else if(scene===1){
      for(const [a,b] of edges){
        const start=livePoint(scene,hubs[a]),end=livePoint(scene,hubs[b]);
        const near=Math.max(start[2],end[2]);
        if(light||near>.015)strokeLine(start,end,weight*(light?.09+near*.53:near*.82),.75+near);
      }
      hubs.forEach(point=>node(point,2));
    }else{
      const centers=scene===2?galaxies:[star];
      centers.forEach(([x,y])=>{
        for(const radius of [.075,.123,.179]){
          livePath(scene,u=>{
            const angle=u*TWO_PI;
            return [x+radius*Math.cos(angle),y+radius*Math.sin(angle)*(scene===2?.61:2)];
          },56,weight*.7);
        }
        const angle=t*.7;
        node([x+.123*Math.cos(angle),y+.123*Math.sin(angle)*(scene===2?.61:2)],1.85);
        node([x,y],scene===5?3.8:2.4);
      });
    }
  }

  function drawParticles(from,to,mix,t){
    const n=compact?440:count;
    for(let i=0;i<n;i++){
      const p=dust[i];
      let [x,y]=place(from,p,i,t);
      if(mix>0){
        const [nx,ny]=place(to,p,i,t);
        x=lerp(x,nx,mix);
        y=lerp(y,ny,mix);
      }
      if(x<-12||x>width+12||y<-12||y>height+12)continue;
      const [px,py,near]=mouseEffect(x,y);
      const shimmer=reduced?1:.72+.28*Math.sin(t*1.3+p.a*34)**2;
      const base=(light?.28:.5)*(.25+p.d*.75)*(compact?.76:.45+.55*x/width);
      litStar(px,py,.35+p.c*.77+near*.9,Math.min(1,base*shimmer+near*.74));
    }
  }

  function drawPointer(){
    if(pointer.fade<.01||reduced)return;
    glow(pointer.x,pointer.y,150,.12*pointer.fade);
    // Mouse leaves an ephemeral luminous trajectory; no click capture.
    for(let i=1;i<trail.length;i++){
      const a=trail[i-1],b=trail[i];
      strokeLine([a.x,a.y],[b.x,b.y],.24*(1-(elapsed-b.time)/.23)*pointer.fade,1.1);
    }
  }
  function draw(){
    const time=reduced?0:elapsed;
    light=root.dataset.theme==='light';
    const index=Math.floor(scrollState);
    const from=scenes[index],to=scenes[index+1],mix=smooth(scrollState-index);
    if(moodEgg){
      const [x,y]=screen(1,...hubs[0]);
      const bounds=moodEgg.parentElement.getBoundingClientRect();
      const onCanvas=x>=24 && x+24<bounds.left && y>=header.getBoundingClientRect().bottom+24;
      moodEgg.classList.toggle('is-inline',!onCanvas);
      moodEgg.hidden=onCanvas && (!((from===1&&mix<.45)||(to===1&&mix>=.65)) ||
        bounds.top>=height || bounds.bottom<=0);
      moodEgg.style.setProperty('--star-x',x+'px');
      moodEgg.style.setProperty('--star-y',y+'px');
    }
    if(egg){
      const [x,y]=screen(5,...star);
      const headerBottom=header.getBoundingClientRect().bottom;
      egg.hidden=!(from===5||(to===5&&mix>=.65))||y<headerBottom+24;
      egg.style.left=x+'px';
      egg.style.top=y+'px';
    }
    drawBackdrop(from,to,mix);
    liveScene(from,1-mix,time);
    if(mix>0)liveScene(to,mix,time);
    drawParticles(from,to,mix,time);
    drawPointer();
  }
  function tick(timestamp){
    raf=0;
    if(document.hidden||root.dataset.theme==="daylight")return;
    if(geometryDirty)dimensions();
    const target=getScrollState();
    if(reduced){scrollState=Math.round(target);draw();return;}
    if(compact&&lastTime&&timestamp-lastTime<30){schedule();return;}
    const dt=lastTime?Math.min((timestamp-lastTime)/1000,.05):.016;lastTime=timestamp;
    elapsed+=dt;
    scrollState=Math.abs(scrollState-target)<.001?target:lerp(scrollState,target,1-Math.exp(-dt*8));
    pointer.x=lerp(pointer.x,pointer.targetX,1-Math.exp(-dt*12));
    pointer.y=lerp(pointer.y,pointer.targetY,1-Math.exp(-dt*12));
    const speed=mag(pointer.x-pointer.lastX,pointer.y-pointer.lastY);
    pointer.v=lerp(pointer.v,speed,1-Math.exp(-dt*5));
    pointer.lastX=pointer.x;pointer.lastY=pointer.y;
    pointer.fade=lerp(pointer.fade,pointer.present?1:0,1-Math.exp(-dt*(pointer.present?6:2)));
    if(pointer.present&&pointer.fade>.07&&speed>1.6)trail.push({x:pointer.x,y:pointer.y,time:elapsed});
    while(trail.length&&elapsed-trail[0].time>=.23)trail.shift();
    draw();schedule();
  }
  dimensions();
  scrollState=reduced?Math.round(getScrollState()):getScrollState();
  draw();
  document.body.classList.add('cosmos-ready');
  schedule();
})();
