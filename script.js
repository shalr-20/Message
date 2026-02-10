function openGift() {
  document.querySelector(".gift").style.display = "none";
  document.getElementById("question").style.display = "block";
}

function sayYes() {
  document.getElementById("message").textContent =
    "Score! 😘 Definitely the best choice ever… me as your Valentine 😏";
}

function runAway() {
  let no = document.getElementById("no");
  no.style.left = Math.random() * 80 + "%";
  no.style.top = Math.random() * 80 + "%";
}

document.addEventListener('DOMContentLoaded', function() {
  const noBtn = document.getElementById('no');
  const yesBtn = document.getElementById('yes');
  const buttonsContainer = document.querySelector('.buttons');

  let swapped = false;
  function swapButtons() {
    const yes = document.getElementById('yes');
    const no = document.getElementById('no');
    if (!yes || !no) return;
    if (!swapped) {
      buttonsContainer.insertBefore(no, yes);
      swapped = true;
    } else {
      buttonsContainer.insertBefore(yes, no);
      swapped = false;
    }
  }

  if (noBtn) {
    noBtn.addEventListener('mouseenter', function() {
      swapButtons();
    });
  }

  if (buttonsContainer) {
    buttonsContainer.addEventListener('mouseleave', function() {
      if (swapped) swapButtons();
    });
  }

  // Celebration / fireworks setup
  const celebration = document.getElementById('celebration');
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let cw, ch, anim;

  function resize() { if (canvas) { cw = canvas.width = window.innerWidth; ch = canvas.height = window.innerHeight; } }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  function random(min,max){return Math.random()*(max-min)+min;}

  function createFirework() {
    if (!canvas) return;
    const x = random(0.1*cw, 0.9*cw);
    const y = random(0.1*ch, 0.5*ch);
    const count = 40;
    const hue = Math.floor(random(0,360));
    for (let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = random(1,6);
      particles.push({ x,y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: random(40,80), age:0, hue, alpha:1 });
    }
  }

  function update() {
    if (!ctx) return;
    ctx.clearRect(0,0,cw,ch);
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.vy += 0.05; // gravity
      p.x += p.vx; p.y += p.vy; p.age++; p.alpha = 1 - p.age/p.life;
      ctx.beginPath(); ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`; ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
      if (p.age >= p.life) particles.splice(i,1);
    }
  }

  function loop(){ update(); anim = requestAnimationFrame(loop); }

  function startFireworks(duration=5000) {
    if (!celebration) return;
    celebration.classList.remove('hidden');
    resize();
    loop();
    const fwInterval = setInterval(createFirework, 300);
    setTimeout(()=>{ clearInterval(fwInterval); }, duration-800);
    setTimeout(()=>{ cancelAnimationFrame(anim); }, duration);
  }

  // override sayYes to trigger fireworks and show message/button
  const originalSayYes = window.sayYes;
  window.sayYes = function() {
    if (originalSayYes) originalSayYes();
    startFireworks(6000);
    const letsBtn = document.getElementById('letsGo');
    if (letsBtn) {
      letsBtn.addEventListener('click', function() {
        // User clicked Let's go — play a short preview video then go to local trailer page
        playPreviewVideo('vdo.mp4');
      }, { once: true });
    }
  };

  // close overlay by clicking outside content
  if (celebration) {
    celebration.addEventListener('click', function(e){ if (e.target === celebration) { celebration.classList.add('hidden'); cancelAnimationFrame(anim); } });
  }

  // playPreviewVideo: create an overlay with a short video, navigate to trailer after it ends
  function playPreviewVideo(src) {
    // create overlay
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    overlay.innerHTML = `
      <div class="video-content" role="dialog" aria-modal="true" aria-label="Trailer preview">
        <video id="previewVideo" autoplay muted playsinline>
          <source src="${src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
    document.body.appendChild(overlay);

    const video = document.getElementById('previewVideo');

    // prevent Escape key from interrupting playback
    function keyHandler(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } }
    window.addEventListener('keydown', keyHandler);

    function cleanupAndGo() {
      // remove key listener when we leave
      window.removeEventListener('keydown', keyHandler);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      celebration.classList.add('hidden');
      cancelAnimationFrame(anim);
      window.location.href = 'heist.html';
    }

    if (video) {
      // disable native controls & prevent direct interaction
      video.controls = false;
      video.removeAttribute('controls');
      try { video.controlsList = 'nodownload nofullscreen noremoteplayback'; } catch(e){}
      try { video.disablePictureInPicture = true; } catch(e){}
      video.setAttribute('playsinline', '');
      video.style.pointerEvents = 'none';
      video.addEventListener('contextmenu', function(e){ e.preventDefault(); });

      // Try to ensure audio plays unmuted by resuming the AudioContext (helps unlock audio on some browsers)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          window.__unlockedAudioCtx = window.__unlockedAudioCtx || new AudioCtx();
          window.__unlockedAudioCtx.resume().catch(()=>{});
        }
      } catch(e){}

      // request unmuted playback immediately (user click triggered this function)
      video.muted = false;
      video.volume = 1.0;
      const playPromise = video.play();

      // helper to create a visible 'Tap to play with sound' button when autoplay with sound is blocked
      function showUnmuteButton() {
        if (document.getElementById('unmutePlay')) return;
        const btn = document.createElement('button');
        btn.id = 'unmutePlay';
        btn.className = 'unmute-play';
        btn.textContent = 'Tap to play with sound';
        overlay.appendChild(btn);
        btn.focus();
        btn.addEventListener('click', function() {
          try { if (window.__unlockedAudioCtx) window.__unlockedAudioCtx.resume().catch(()=>{}); } catch(e){}
          video.muted = false;
          video.volume = 1.0;
          video.play().catch(()=>{});
          if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
        }, { once: true });
      }

      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // autoplay with sound blocked — show the fallback UI
          try { if (window.__unlockedAudioCtx) window.__unlockedAudioCtx.resume().catch(()=>{}); } catch(e){}
          showUnmuteButton();
        });
      }

      // some browsers pause even when play() resolves; if video is paused shortly after, show button
      setTimeout(() => { if (video.paused && !video.ended) showUnmuteButton(); }, 300);

      // prevent seeking/skipping by restoring time
      let lastKnownTime = 0;
      video.addEventListener('timeupdate', function() { lastKnownTime = video.currentTime; });
      video.addEventListener('seeking', function() {
        try { video.currentTime = lastKnownTime; } catch(e){}
      });

      // if user somehow pauses, try to resume (unless ended)
      video.addEventListener('pause', function() { if (!video.ended) video.play().catch(()=>{}); });

      // when finished navigate
      video.addEventListener('ended', cleanupAndGo);
    }

    // ignore clicks on overlay — user cannot skip by clicking outside
    overlay.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  /* -----------------------------
     Floating decorative emojis
     ----------------------------- */
  const emojiLayer = document.getElementById('emojiLayer');
  const EMOJIS = ['💖','💕','🎁','🍫','🍬','🌸','🌹','💝','🌺','🍰', '🐻','😍','😘','🥰'];
  function rand(min,max){return Math.random()*(max-min)+min;}

  function placeEmojis(count = 30) {
    if (!emojiLayer) return;
    emojiLayer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'emoji';

      const r = Math.random();
      if (r < 0.12) el.classList.add('big');
      else if (r < 0.55) el.classList.add('medium');
      else el.classList.add('small');

      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left = rand(2, 98) + '%';
      el.style.top = rand(2, 94) + '%';
      el.style.setProperty('--r', rand(-30, 30) + 'deg');
      el.style.opacity = (rand(0.06, 0.25)).toFixed(2);
      el.style.animationDelay = rand(0, 3000) + 'ms';

      // small random drift animation-duration variance
      el.style.animationDuration = (rand(5.5, 8.5)).toFixed(2) + 's';

      emojiLayer.appendChild(el);
    }
  }

  // Initial placement and on resize (recreate)
  placeEmojis(36);
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => placeEmojis(36), 200);
  });

});