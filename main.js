/* ══ CURSOR ══ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function animCursor(){
  cursor.style.left=mx+'px'; cursor.style.top=my+'px';
  rx+=(mx-rx)*0.1; ry+=(my-ry)*0.1;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animCursor);
})();
document.querySelectorAll('a,button,.article-card,.expertise-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ cursor.style.width='18px'; cursor.style.height='18px'; ring.style.width='52px'; ring.style.height='52px'; ring.style.opacity='0.8'; });
  el.addEventListener('mouseleave',()=>{ cursor.style.width='10px'; cursor.style.height='10px'; ring.style.width='36px'; ring.style.height='36px'; ring.style.opacity='0.45'; });
});

/* ══ PARTICLES ══ */
const pc=document.getElementById('particles'), px=pc.getContext('2d');
let pts=[];
function resizeP(){ pc.width=window.innerWidth; pc.height=window.innerHeight; }
window.addEventListener('resize',()=>{ resizeP(); resizeR(); });
resizeP();
class Pt {
  constructor(){ this.reset(); }
  reset(){ this.x=Math.random()*pc.width; this.y=Math.random()*pc.height; this.vx=(Math.random()-.5)*.25; this.vy=(Math.random()-.5)*.25; this.a=Math.random()*.35+.04; this.s=Math.random()*1.2+.3; }
  tick(){ this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>pc.width||this.y<0||this.y>pc.height) this.reset(); }
  draw(){ px.beginPath(); px.arc(this.x,this.y,this.s,0,Math.PI*2); px.fillStyle=`rgba(93,150,58,${this.a})`; px.fill(); }
}
for(let i=0;i<100;i++) pts.push(new Pt());
(function animPts(){
  px.clearRect(0,0,pc.width,pc.height);
  pts.forEach(p=>{ p.tick(); p.draw(); });
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
    const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
    if(d<90){ px.beginPath(); px.moveTo(pts[i].x,pts[i].y); px.lineTo(pts[j].x,pts[j].y); px.strokeStyle=`rgba(61,90,62,${.09*(1-d/90)})`; px.lineWidth=.4; px.stroke(); }
  }
  requestAnimationFrame(animPts);
})();

/* ══ RADAR CANVAS (rich) ══ */
const rc=document.getElementById('radar-canvas'), rx2=rc.getContext('2d');
function resizeR(){ rc.width=rc.offsetWidth||window.innerWidth*0.5; rc.height=window.innerHeight; }
resizeR();
let radarAngle=0;
const blips=[
  {angle:0.4, dist:0.28, size:3, id:'TGT-01'},
  {angle:1.1, dist:0.52, size:2.5, id:'TGT-02'},
  {angle:2.3, dist:0.38, size:2, id:'TGT-03'},
  {angle:3.7, dist:0.65, size:3.5, id:'TGT-04'},
  {angle:4.9, dist:0.44, size:2, id:'TGT-05'},
  {angle:5.5, dist:0.72, size:2.5, id:'TGT-06'},
];
const trails=blips.map(()=>[]);
(function animRadar(){
  const W=rc.width, H=rc.height;
  const cx=W*0.5, cy=H*0.5;
  const R=Math.min(W*0.72, H*0.42);
  rx2.clearRect(0,0,W,H);

  // outer rings
  [1,.7,.5,.3,.15].forEach(f=>{
    rx2.beginPath(); rx2.arc(cx,cy,R*f,0,Math.PI*2);
    rx2.strokeStyle=`rgba(61,90,62,${f===1?0.5:0.22})`; rx2.lineWidth=f===1?1:0.5; rx2.stroke();
  });

  // crosshairs
  rx2.save(); rx2.strokeStyle='rgba(61,90,62,0.3)'; rx2.lineWidth=0.5;
  rx2.setLineDash([4,8]);
  rx2.beginPath(); rx2.moveTo(cx-R*1.05,cy); rx2.lineTo(cx+R*1.05,cy); rx2.stroke();
  rx2.beginPath(); rx2.moveTo(cx,cy-R*1.05); rx2.lineTo(cx,cy+R*1.05); rx2.stroke();
  rx2.restore();

  // diagonal ticks
  [45,135,225,315].forEach(deg=>{
    const rad=deg*Math.PI/180;
    rx2.beginPath();
    rx2.moveTo(cx+Math.cos(rad)*R*.95, cy+Math.sin(rad)*R*.95);
    rx2.lineTo(cx+Math.cos(rad)*R*1.04, cy+Math.sin(rad)*R*1.04);
    rx2.strokeStyle='rgba(93,150,58,0.4)'; rx2.lineWidth=1; rx2.stroke();
  });

  // degree labels
  rx2.font='9px "Space Mono", monospace';
  rx2.fillStyle='rgba(93,150,58,0.45)';
  rx2.textAlign='center';
  ['N','045','E','135','S','225','W','315'].forEach((lbl,i)=>{
    const a=i*Math.PI/4-Math.PI/2;
    const d=R*1.12;
    rx2.fillText(lbl, cx+Math.cos(a)*d, cy+Math.sin(a)*d+4);
  });

  // range labels
  rx2.fillStyle='rgba(93,150,58,0.35)'; rx2.font='8px "Space Mono",monospace';
  ['25km','50km','75km'].forEach((lbl,i)=>{
    const r=R*[.3,.5,.7][i];
    rx2.fillText(lbl, cx+r+4, cy-4);
  });

  // sweep gradient
  rx2.save();
  rx2.translate(cx,cy); rx2.rotate(radarAngle);
  const sweepGrad=rx2.createConicalGradient ? null : null;
  // use arc sector
  rx2.beginPath();
  rx2.moveTo(0,0);
  rx2.arc(0,0,R,-Math.PI/2,-Math.PI/2+Math.PI*.5, false);
  const sg=rx2.createRadialGradient(0,0,0,0,0,R);
  sg.addColorStop(0,'rgba(93,150,58,0.0)');
  sg.addColorStop(0.8,'rgba(61,90,62,0.0)');
  sg.addColorStop(1,'rgba(93,150,58,0.18)');
  rx2.fillStyle=sg; rx2.fill();

  // sweep line
  rx2.beginPath(); rx2.moveTo(0,0); rx2.lineTo(R,0);
  rx2.strokeStyle='rgba(125,170,82,0.9)'; rx2.lineWidth=1.5; rx2.stroke();
  rx2.restore();

  // sweep glow trail (conic approximation via arc slices)
  for(let i=0;i<20;i++){
    const a=radarAngle - (i/20)*Math.PI*.5;
    rx2.beginPath();
    rx2.moveTo(cx,cy);
    rx2.arc(cx,cy,R,a,a+Math.PI*0.025,false);
    rx2.fillStyle=`rgba(61,90,62,${0.06*(1-i/20)})`;
    rx2.fill();
  }

  // blips
  blips.forEach((b,bi)=>{
    const bAngle=b.angle;
    // check if sweep just passed this blip (within 0.5 rad)
    let diff = (radarAngle%(Math.PI*2)) - bAngle;
    if(diff<0) diff+=Math.PI*2;
    if(diff<0.5){
      const bx=cx+Math.cos(bAngle)*R*b.dist;
      const by=cy+Math.sin(bAngle)*R*b.dist;
      trails[bi].push({x:bx,y:by,t:1.0});
    }
    // draw trails
    trails[bi]=trails[bi].filter(t=>t.t>0);
    trails[bi].forEach(t=>{
      rx2.beginPath(); rx2.arc(t.x,t.y,b.size*t.t,0,Math.PI*2);
      rx2.fillStyle=`rgba(125,170,82,${t.t*0.8})`; rx2.fill();
      // ripple
      rx2.beginPath(); rx2.arc(t.x,t.y,b.size*3*(1-t.t)+b.size,0,Math.PI*2);
      rx2.strokeStyle=`rgba(125,170,82,${t.t*0.3})`; rx2.lineWidth=0.5; rx2.stroke();
      // ID label
      if(t.t>0.5){
        rx2.font=`${7}px "Space Mono",monospace`;
        rx2.fillStyle=`rgba(93,150,58,${t.t})`; rx2.textAlign='left';
        rx2.fillText(b.id, t.x+8, t.y-4);
      }
      t.t-=0.008;
    });
  });

  // center dot
  rx2.beginPath(); rx2.arc(cx,cy,4,0,Math.PI*2);
  rx2.fillStyle='rgba(125,170,82,0.9)'; rx2.fill();
  rx2.beginPath(); rx2.arc(cx,cy,10,0,Math.PI*2);
  rx2.strokeStyle='rgba(125,170,82,0.4)'; rx2.lineWidth=1; rx2.stroke();

  // HUD readouts
  rx2.font='8px "Space Mono",monospace'; rx2.textAlign='left';
  rx2.fillStyle='rgba(93,150,58,0.6)';
  const now=new Date();
  const ts=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}Z`;
  rx2.fillText(`TIME: ${ts}`, W*.05, H*.06);
  rx2.fillText(`MODE: SURVEILLANCE`, W*.05, H*.06+14);
  rx2.fillText(`RANGE: 100KM`, W*.05, H*.06+28);
  rx2.fillText(`CONTACTS: ${blips.length}`, W*.05, H*.06+42);
  rx2.textAlign='right';
  rx2.fillText(`SECTOR: MENA`, W*.95, H*.06);
  rx2.fillText(`STATUS: ACTIVE`, W*.95, H*.06+14);

  radarAngle+=0.018;
  requestAnimationFrame(animRadar);
})();

/* ══ FIGURE SCROLL FADE ══ */
const figWrap=document.getElementById('figure-wrap');
window.addEventListener('scroll',()=>{
  const scrollY=window.scrollY;
  const heroH=document.getElementById('hero').offsetHeight;
  const fade=Math.max(0, 1 - (scrollY / (heroH * 0.75)));
  figWrap.style.opacity=fade;
}, {passive:true});


/* ══ SCROLL REVEAL ══ */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(r=>observer.observe(r));

/* ══ ARTICLE FILTER ══ */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.article-card').forEach(c=>{
      c.style.display=(f==='all'||c.dataset.cat===f)?'':'none';
    });
  });
});

/* ══ SKILL BAR TRIGGER ══ */
const sgEl=document.getElementById('skills-grid');
new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){
    sgEl.querySelectorAll('.skill-bar').forEach((b,i)=>{
      setTimeout(()=>{ const pct=b.style.getPropertyValue('--pct'); b.style.setProperty('--pct','0%'); requestAnimationFrame(()=>{ setTimeout(()=>b.style.setProperty('--pct',pct),50); },i*80); },i*80);
    });
  }
},{threshold:0.2}).observe(sgEl);

/* ══ CLOCK in nav coords ══ */
setInterval(()=>{
  const el=document.querySelector('.nav-coords');
  if(el){ const n=new Date(); el.textContent=`24°28'N 54°22'E  //  ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}Z`; }
},1000);
/* ══ CONTACT FORM ══ */
function sendContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();

  if (!name || !email || !message) {
    const btn = document.querySelector('.contact-form button');
    const orig = btn.textContent;
    btn.textContent = '⚠ FILL ALL REQUIRED FIELDS';
    btn.style.background = '#3a1a1a';
    btn.style.borderColor = '#FF4444';
    btn.style.color = '#FF4444';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2500);
    return;
  }

  const body = `From: ${name}\nEmail: ${email}\n\n${message}`;
  const mailto = `mailto:ahmed.h.altohami@gmail.com`
    + `?subject=${encodeURIComponent(subject || 'Message from Website')}`
    + `&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;

  // Show confirmation
  const btn = document.querySelector('.contact-form button');
  const orig = btn.textContent;
  btn.textContent = '✓ MESSAGE READY — CHECK YOUR EMAIL CLIENT';
  btn.style.background = 'var(--mil-light)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 4000);
}
