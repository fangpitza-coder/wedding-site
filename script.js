(function(){
  var stage   = document.getElementById('envelopeStage');
  var opening = document.getElementById('opening-screen');
  var site    = document.getElementById('site');
  var cardHolder = document.getElementById('cardHolder');
  var musicPlayer = document.getElementById('musicPlayer');
  var musicToggle = document.getElementById('musicToggle');
  var openSound = document.getElementById('openSound');
  var slideSound = document.getElementById('slideSound');
  var hero = document.getElementById('hero');
  var coupleStory = document.getElementById('coupleStory');
  function settlePortrait(){
    hero.classList.add('is-story-settled');
  }
  var heroProgress = document.getElementById('heroProgress');
  var opened = false;

  function startHeroSequence(){
    if(!hero || !coupleStory) return;
    // คงผู้เยี่ยมชมไว้ที่จุดบนสุดจนกว่าฉากเปิดหน้าเมนจะจบ
    window.scrollTo(0, 0);
    document.documentElement.classList.add('hero-locked');
    document.body.classList.add('hero-locked');
    var frames = [
      'assets/couple-watercolor-ten/01.png', 'assets/couple-watercolor-ten/02.png',
      'assets/couple-watercolor-ten/03.png', 'assets/couple-watercolor-ten/04.png',
      'assets/couple-watercolor-ten/05.png', 'assets/couple-watercolor-ten/06.png',
      'assets/couple-watercolor-ten/07.png', 'assets/couple-watercolor-ten/08.png',
      'assets/couple-watercolor-ten/09.png', 'assets/couple-watercolor-ten/10.png'
    ];
    // โหลดเฟรมล่วงหน้า เพื่อลดอาการสะดุดขณะเปลี่ยนภาพบนเครือข่ายที่ช้า
    frames.slice(1).forEach(function(frame){
      var image = new Image();
      image.src = frame;
    });
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      coupleStory.src = frames[frames.length - 1];
      hero.classList.add('is-story-playing', 'is-story-settled', 'is-framed', 'is-copy-visible');
      settlePortrait();
      setTimeout(function(){
        document.documentElement.classList.remove('hero-locked');
        document.body.classList.remove('hero-locked');
      }, 300);
      return;
    }
    hero.classList.add('is-story-playing');
    heroProgress.classList.add('is-active');
    var frameIndex = 0;
    coupleStory.src = frames[frameIndex];
    // รอภาพขึ้นกลางจอก่อนเริ่มเล่นเฟรมตามจังหวะเดิม
    setTimeout(function(){
      var frameTimer = setInterval(function(){
        if(frameIndex >= frames.length - 1){
          clearInterval(frameTimer);
          return;
        }
        frameIndex++;
        coupleStory.src = frames[frameIndex];
      }, 350);
    }, 600);
    setTimeout(settlePortrait, 4100);
    setTimeout(function(){ hero.classList.add('is-framed'); }, 5600);
    setTimeout(function(){ hero.classList.add('is-copy-visible'); }, 6100);
    // ปลดการเลื่อนหลังข้อความและฉากเปิดปรากฏครบแล้ว
    setTimeout(function(){
      document.documentElement.classList.remove('hero-locked');
      document.body.classList.remove('hero-locked');
    }, 8000);
  }

  function startMusic(){
    musicPlayer.volume = 0.55;
    var playAttempt = musicPlayer.play();
    if(playAttempt && typeof playAttempt.catch === 'function'){
      playAttempt.catch(function(){
        musicToggle.setAttribute('aria-pressed', 'false');
      });
    }
  }

  function playOpenSound(){
    if(!openSound) return;
    openSound.currentTime = 0;
    openSound.volume = 0.7;
    var playAttempt = openSound.play();
    if(playAttempt && typeof playAttempt.catch === 'function'){
      playAttempt.catch(function(){});
    }
  }

  function playSlideSound(){
    if(!slideSound) return;
    slideSound.currentTime = 0;
    slideSound.volume = 0.55;
    var playAttempt = slideSound.play();
    if(playAttempt && typeof playAttempt.catch === 'function'){
      playAttempt.catch(function(){});
    }
  }

  function toggleMusic(){
    if(musicPlayer.paused){
      startMusic();
      return;
    }
    musicPlayer.pause();
  }

  musicPlayer.addEventListener('playing', function(){
    musicToggle.setAttribute('aria-pressed', 'true');
  });
  musicPlayer.addEventListener('pause', function(){
    musicToggle.setAttribute('aria-pressed', 'false');
  });

  // ให้แต่ละส่วนของหน้าเนื้อหาค่อย ๆ ปรากฏเมื่อเลื่อนมาถึง
  function setupScrollReveal(){
    var targets = document.querySelectorAll(
      '#site .section .eyebrow, #site .section .lede, #site .countdown-date, #site .story-card, #site .detail-card, #site .sch-row, #site .cd-box, #site .g-cell, #site .dress-swatch, #site .loc-box, #site .gift-panel, #site .rsvp-panel, #site .venue-art, #site .dress-illustration'
    );
    if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('motion-ready');
    targets.forEach(function(target){
      target.classList.add('reveal');
      var siblings = Array.prototype.filter.call(target.parentElement.children, function(child){ return child.matches('.cd-box, .dress-swatch, .sch-row, .g-cell'); });
      var delay = Math.max(0, siblings.indexOf(target)) * 110;
      if(target.matches('.lede, .countdown-date')) delay = 140;
      target.style.setProperty('--reveal-delay', Math.min(delay, 440) + 'ms');
    });

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -6% 0px' });
    targets.forEach(function(target){ observer.observe(target); });
  }
  setupScrollReveal();

  function goFullscreen(){
    opening.classList.add('card-focus');
    // จับตำแหน่ง/ขนาดปัจจุบันบนจอ (พิกเซลจริง) แล้ว "แช่แข็ง" เป็น position:fixed
    // ที่จุดเดิมก่อน เพื่อไม่ให้การ์ดกระโดดตำแหน่ง จากนั้นค่อย transition ไปเต็มจอ
    var rect = cardHolder.getBoundingClientRect();
    cardHolder.style.position = 'fixed';
    cardHolder.style.left   = rect.left + 'px';
    cardHolder.style.top    = rect.top + 'px';
    cardHolder.style.width  = rect.width + 'px';
    cardHolder.style.height = rect.height + 'px';
    cardHolder.style.transform = 'none';
    cardHolder.style.zIndex = 10000;
    void cardHolder.offsetWidth; // force reflow ก่อนเพิ่มคลาส transition
    cardHolder.classList.add('fullscreen');

    var vw = window.innerWidth, vh = window.innerHeight;
    var targetH = vh * 0.94;
    var targetW = targetH * (1024/1536); // คงอัตราส่วนภาพจริงของการ์ด (1024x1536) เสมอ
    if(targetW > vw * 0.92){ targetW = vw * 0.92; targetH = targetW * (1536/1024); }
    var left = (vw - targetW) / 2;
    var top  = (vh - targetH) / 2;

    requestAnimationFrame(function(){
      cardHolder.style.left   = left + 'px';
      cardHolder.style.top    = top + 'px';
      cardHolder.style.width  = targetW + 'px';
      cardHolder.style.height = targetH + 'px';
    });
  }

  function openEnvelope(){
    if(opened) return;
    opened = true;
    opening.classList.add('opening-hide-hint');
    playOpenSound();

    // 0.0–0.5s: ตราครั่งจางและย่อ
    stage.classList.add('seal-open');
    scatterPetals();

    // 0.3–1.0s: ซองปิดจางหาย + ฝาหมุนเปิดแบบ 3D
    setTimeout(function(){ stage.classList.add('flap-open'); }, 300);

    // หลังฝาหมุนจบ ให้ฝาอยู่เลเยอร์หลังสุด
    setTimeout(function(){ stage.classList.add('flap-sent-back'); }, 800);

    // 0.8–2.15s: การ์ดขนาดสูงสุด 320px เลื่อนขึ้นจนพ้นซอง
    setTimeout(function(){
      stage.classList.add('card-rise');
      playSlideSound();
    }, 800);

    // 2.2–3.02s: เมื่อพ้นซองแล้ว การ์ดเด้งและขยายเต็มจอ
    setTimeout(goFullscreen, 2200);

    // 4.05s: ค้างการ์ดที่ขยายแล้วราว 1 วินาที ก่อนปลิวออกจากหน้าจอ
    setTimeout(function(){
      cardHolder.classList.add('fly-away');
    }, 4050);

    // 4.75s: หลังการ์ดปลิวออก ค่อยแสดงเนื้อหาหน้าถัดไป และเริ่มเพลงพื้นหลัง ณ จุดนี้
    setTimeout(function(){
      opening.classList.add('hide');
      site.classList.add('show');
      startHeroSequence();
      startMusic();
    }, 4750);

    // 5.35s: ปิดหน้าซอง และเปิดสกอลตามปกติ
    setTimeout(function(){
      opening.style.display = 'none';
      document.body.classList.remove('locked');
    }, 5350);
  }

  function scatterPetals(){
    var shower = document.getElementById('petalShower');
    if(!shower || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Let the last petals finish drifting after the envelope has disappeared.
    document.body.appendChild(shower);
    var random = function(min, max){ return min + Math.random() * (max - min); };
    var sprites = ['assets/ivory-petal.png'];
    var count = window.innerWidth < 600 ? 16 : 24;
    for(var i = 0; i < count; i++){
      var flight = document.createElement('span');
      flight.className = 'petal-flight';
      var petal = document.createElement('img');
      petal.className = 'petal';
      petal.src = sprites[i % sprites.length];
      petal.alt = '';
      petal.setAttribute('aria-hidden', 'true');
      flight.style.setProperty('--petal-left', ((i + Math.random()) / count * 100) + 'vw');
      flight.style.setProperty('--petal-turn', random(-80, 80) + 'deg');
      flight.style.setProperty('--petal-delay', random(0, 2200) + 'ms');
      flight.style.setProperty('--petal-duration', random(6200, 9200) + 'ms');
      flight.style.setProperty('--petal-drift', random(-55, 55) + 'px');
      flight.style.setProperty('--petal-sway', random(12, 30) + 'px');
      flight.style.setProperty('--petal-flutter', random(2400, 4200) + 'ms');
      flight.style.setProperty('--petal-phase', random(-4000, 0) + 'ms');
      flight.style.setProperty('--petal-opacity', random(.45, .8));
      flight.style.width = random(14, 27) + 'px';
      flight.addEventListener('animationend', function(event){
        if(event.animationName === 'petal-flight-fall') this.remove();
      });
      flight.appendChild(petal);
      shower.appendChild(flight);
    }
  }

  opening.addEventListener('click', openEnvelope);
  musicToggle.addEventListener('click', toggleMusic);
  opening.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' ' || e.code === 'Space'){
      e.preventDefault();
      openEnvelope();
    }
  });

  // ---------------- Countdown ----------------
  var weddingDate = new Date('2026-11-28T09:00:00+07:00'); // แก้เวลาเริ่มงานจริงได้ที่นี่
  function tickCountdown(){
    var now = new Date();
    var diff = weddingDate - now;
    if(diff < 0) diff = 0;
    var d = Math.floor(diff / (1000*60*60*24));
    var h = Math.floor((diff / (1000*60*60)) % 24);
    var m = Math.floor((diff / (1000*60)) % 60);
    var s = Math.floor((diff / 1000) % 60);
    document.getElementById('cdDays').textContent  = String(d).padStart(2,'0');
    document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
    document.getElementById('cdMins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cdSecs').textContent  = String(s).padStart(2,'0');
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // ---------------- RSVP (client-side placeholder) ----------------
  function handleRsvpSubmit(e){
    e.preventDefault();
    // TODO: การเชื่อมฟอร์ม RSVP — เปลี่ยนส่วนนี้ให้ส่งข้อมูลไปยังปลายทางจริง เช่น:
    // fetch('https://your-endpoint.example.com/rsvp', {
    //   method: 'POST',
    //   headers: {'Content-Type':'application/json'},
    //   body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    // });
    var note = document.getElementById('rsvpNote');
    note.classList.add('show');
    e.target.reset();
  }
  document.getElementById('rsvpForm').addEventListener('submit', handleRsvpSubmit);

  function handleGiftSubmit(e){
    e.preventDefault();
    document.getElementById('giftNote').classList.add('show');
    e.target.reset();
  }
  document.getElementById('giftForm').addEventListener('submit', handleGiftSubmit);
})();
