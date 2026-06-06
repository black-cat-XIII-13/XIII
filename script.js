/* ==========================================================================
   BLACK CAT PORTFOLIO - JAVASCRIPT LOGIC & INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DYNAMIC MOUSE CURSOR GLOW ---
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    // Expand cursor glow on clicking
    document.addEventListener('mousedown', () => {
        cursorGlow.style.width = '450px';
        cursorGlow.style.height = '450px';
    });
    document.addEventListener('mouseup', () => {
        cursorGlow.style.width = '300px';
        cursorGlow.style.height = '300px';
    });

    // --- 2. STARFIELD PARTICLE BACKGROUND ---
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle class
    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = -Math.random() * 0.4 - 0.1; // slow rising up
            this.alpha = Math.random() * 0.5 + 0.2;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.color = Math.random() > 0.8 ? '212, 175, 55' : '255, 255, 255'; // Some gold, mostly white
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.fadeSpeed;

            // Reset when faded or offscreen
            if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.reset();
                this.y = height + 5; // Start from bottom
            }
        }

        draw() {
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = `rgba(${this.color}, ${this.alpha})`;
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const starCount = Math.min(80, Math.floor((width * height) / 15000));
    const stars = Array.from({ length: starCount }, () => new Star());

    function animateStars() {
        ctx.shadowBlur = 0; // Reset shadow for clear screen
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animateStars);
    }
    animateStars();

    // --- 3. BACKGROUND MUSIC (HTML5 Audio) ---
    const audioToggle = document.getElementById('audio-toggle');
    const audioStatus = audioToggle.querySelector('.audio-status');
    
    // Create and configure HTML5 Audio object
    const bgAudio = new Audio('العراب.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0; // Start at 0 for smooth fade-in
    
    let isPlaying = false;
    let fadeInterval = null;

    function fadeAudio(targetVolume, duration = 1000, callback = null) {
        if (fadeInterval) clearInterval(fadeInterval);
        
        const startVolume = bgAudio.volume;
        const diff = targetVolume - startVolume;
        const steps = 20;
        const stepTime = duration / steps;
        let currentStep = 0;

        fadeInterval = setInterval(() => {
            currentStep++;
            bgAudio.volume = Math.max(0, Math.min(1, startVolume + (diff * (currentStep / steps))));
            if (currentStep >= steps) {
                bgAudio.volume = targetVolume;
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, stepTime);
    }

    function startMusic() {
        bgAudio.play()
            .then(() => {
                fadeAudio(0.5, 1500); // smooth fade to 50% volume
                audioToggle.classList.add('playing');
                audioStatus.textContent = 'موسيقى العراب';
                isPlaying = true;
            })
            .catch(error => {
                console.error("Audio playback failed:", error);
            });
    }

    function stopMusic() {
        fadeAudio(0, 1000, () => {
            bgAudio.pause();
        });
        audioToggle.classList.remove('playing');
        audioStatus.textContent = 'صامت';
        isPlaying = false;
    }

    function toggleAudio() {
        if (!isPlaying) {
            startMusic();
        } else {
            stopMusic();
        }
    }

    audioToggle.addEventListener('click', toggleAudio);

    // --- LOGO PREVIEW: TAP TO SHOW (Mobile + Desktop click fallback) ---
    const logoLink = document.querySelector('.logo-img-link');

    if (logoLink) {
        // عند النقر/اللمس على اللوجو
        logoLink.addEventListener('click', (e) => {
            e.preventDefault(); // نمنع الـ anchor من الانتقال فوراً
            const isOpen = logoLink.classList.contains('logo-preview-open');

            if (isOpen) {
                // إذا كان مفتوحاً: أغلقه ثم انتقل للـ hero
                logoLink.classList.remove('logo-preview-open');
                // بعد إغلاق البريفيو، ننتقل للـ hero
                setTimeout(() => {
                    const hero = document.getElementById('hero');
                    if (hero) window.scrollTo({ top: hero.offsetTop - 80, behavior: 'smooth' });
                }, 150);
            } else {
                // افتحه
                logoLink.classList.add('logo-preview-open');
            }
        });

        // إغلاق البريفيو عند النقر في أي مكان آخر
        document.addEventListener('click', (e) => {
            if (!logoLink.contains(e.target)) {
                logoLink.classList.remove('logo-preview-open');
            }
        });

        // إغلاق البريفيو عند التمرير (مهم على الموبايل)
        window.addEventListener('scroll', () => {
            logoLink.classList.remove('logo-preview-open');
        }, { passive: true });
    }

    // --- MOBILE MENU TOGGLE ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navContainer = document.querySelector('.nav-container');

    if (mobileMenuToggle && navContainer) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('open');
            navContainer.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navContainer.contains(e.target) && !mobileMenuToggle.contains(e.target) && navContainer.classList.contains('open')) {
                mobileMenuToggle.classList.remove('open');
                navContainer.classList.remove('open');
            }
        });
    }

    // --- 4. SCROLL FADE-IN & NAV SPY ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -40% 0px', // Center-heavy triggering
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Highlight corresponding nav link
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
        // Force hero visible at start
        if(section.id === 'hero') {
            section.classList.add('visible');
        }
    });

    // Smooth navigation clicking
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (mobileMenuToggle && mobileMenuToggle.classList.contains('open')) {
                mobileMenuToggle.classList.remove('open');
                navContainer.classList.remove('open');
            }
        });
    });

    // --- 5. THE 13 REFLECTIONS CIRCLE LAYOUT ---
    const reflections = [
        "القط الأسود لا يرى في عتمة الليل إلا النور المكنون.",
        "الرقم 13 ليس فألاً سيئاً، بل تفردٌ واعٍ خارج عن نسق القطيع البائد.",
        "الصمت ليس خواءً من المعنى، بل هو تزاحم الحكمة وتكثيف الفكرة.",
        "تبدأ الفلسفة حيث تنتهي المسلمات، ويبدأ اليقين حيث يتأمل العقل آيات البديع.",
        "القرآن لا يكبح جماح التفكير الفلسفي، بل يمنح العقل براهين ما وراء المادة.",
        "الصف الثالث الثانوي ليس غاية المنى، بل هو عتبة العبور من التلقين إلى فجر الفهم.",
        "في غياهب الليل، يتحد لون القط بالكون، ليعلن أن الوعي الفردي هو المصباح الوحيد.",
        "أعظم خطايا الفكر هي كثرة الثرثرة؛ الحقائق العظمى تلخصها الإشارات الموجزة.",
        "الوجود بلا غاية هو دورانٌ عبثي في العدم، وهو ما تأباه الفطرة السليمة.",
        "طار ابن سينا بعقل المحلق، وشك ديكارت في ظله، فوجدا في نور الوحي جواب الحيرة.",
        "كلما اتسعت البصيرة الروحية والفلسفية، ضاقت العبارة واكتفت بالصمت الجميل.",
        "13 تساؤلاً فلسفياً كافية لهدم صروح الجهل الموروث وبناء يقين متين.",
        "النهاية المادية ليست فناءً مطلقاً، بل هي انتقال الأثر والوعي لبعد دائم الخلود."
    ];

    const wheel = document.getElementById('reflections-wheel');
    const displayPanel = document.querySelector('.reflection-display-panel');
    const displayPlaceholder = displayPanel.querySelector('.display-placeholder');
    const displayContent = displayPanel.querySelector('.display-content');
    const reflectionNumber = displayPanel.querySelector('.reflection-number');
    const reflectionText = displayPanel.querySelector('.reflection-text');

    const totalNodes = 13;
    let radius = 150; // default radius

    // Responsive wheel radius adjustment
    // نحسب الـ radius من حجم العجلة الفعلي في DOM
    // هذا يضمن التزامن التلقائي مع قيم min() و clamp() في CSS
    function adjustRadius() {
        const wheelSize = wheel.offsetWidth || 400;
        // الـ radius = 37.5% من حجم العجلة (للحفاظ على نسب منسجمة)
        radius = Math.round(wheelSize * 0.375);
        positionNodes();
    }

    function positionNodes() {
        const nodes = wheel.querySelectorAll('.reflection-node');
        nodes.forEach((node, i) => {
            // angle step
            const angle = (i * (2 * Math.PI / totalNodes)) - (Math.PI / 2); // Start at top
            const x = Math.round(radius * Math.cos(angle));
            const y = Math.round(radius * Math.sin(angle));
            
            // Offset from center (taking node size into account)
            node.style.left = `calc(50% + ${x}px - ${node.offsetWidth/2}px)`;
            node.style.top = `calc(50% + ${y}px - ${node.offsetHeight/2}px)`;
        });
    }

    // Generate Nodes
    for (let i = 0; i < totalNodes; i++) {
        const node = document.createElement('div');
        node.className = 'reflection-node';
        // Display numerals in Arabic (١, ٢, ٣...)
        const arabicNumeral = (i + 1).toLocaleString('ar-EG');
        node.textContent = arabicNumeral;
        node.setAttribute('data-index', i);
        
        node.addEventListener('click', () => {
            // Remove active classes
            wheel.querySelectorAll('.reflection-node').forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            
            // Show content with fade animation
            displayPlaceholder.style.display = 'none';
            displayContent.style.display = 'flex';
            
            // Reset animation
            reflectionText.style.animation = 'none';
            void reflectionText.offsetWidth; // trigger reflow
            reflectionText.style.animation = 'fadeIn 0.5s forwards ease';
            
            reflectionNumber.textContent = `التأمل رقم ${arabicNumeral} (Ref. ${(i+1).toString().padStart(2, '0')})`;
            reflectionText.textContent = reflections[i];
        });
        
        wheel.appendChild(node);
    }

    adjustRadius();
    window.addEventListener('resize', adjustRadius);

    // --- 6. SILENCE BOX FORM & LOCAL STORAGE ---
    const silenceForm = document.getElementById('silence-form');
    const nameInput = document.getElementById('silent-name');
    const thoughtInput = document.getElementById('silent-thought');
    const silenceFeedback = document.getElementById('silence-feedback');
    const thoughtsList = document.getElementById('thoughts-list');

    // Load existing thoughts from localStorage
    let thoughts = JSON.parse(localStorage.getItem('silent_thoughts')) || [];

    // Max length enforcement and character counter label
    thoughtInput.setAttribute('maxlength', '100');
    thoughtInput.addEventListener('input', () => {
        const remaining = 100 - thoughtInput.value.length;
        if(remaining <= 10) {
            thoughtInput.style.borderColor = 'var(--color-green)';
        } else {
            thoughtInput.style.borderColor = '';
        }
    });

    function displayThoughts() {
        thoughtsList.innerHTML = '';
        if (thoughts.length === 0) {
            thoughtsList.innerHTML = '<p style="font-size: 0.85rem; color: var(--color-text-muted); font-style: italic; text-align: center;">الصندوق فارغ حالياً. ساد الهدوء...</p>';
            return;
        }

        thoughts.slice().reverse().forEach(thought => {
            const item = document.createElement('div');
            item.className = 'thought-item';
            
            const dateStr = new Date(thought.timestamp).toLocaleString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
            });

            item.innerHTML = `
                <div class="thought-header">
                    <span class="thought-author">${escapeHtml(thought.name || 'عابر صامت')}</span>
                    <span>${dateStr}</span>
                </div>
                <div class="thought-text">"${escapeHtml(thought.text)}"</div>
            `;
            thoughtsList.appendChild(item);
        });
    }

    window.submitSilence = function() {
        const text = thoughtInput.value.trim();
        const name = nameInput.value.trim() || 'عابر صامت';

        if (!text) return;

        const newThought = {
            name: name,
            text: text,
            timestamp: new Date().getTime()
        };

        thoughts.push(newThought);
        // Limit local thoughts history to 15 items
        if(thoughts.length > 15) {
            thoughts.shift();
        }

        localStorage.setItem('silent_thoughts', JSON.stringify(thoughts));
        
        // Reset form
        thoughtInput.value = '';
        nameInput.value = '';

        // Show feedback
        silenceFeedback.textContent = 'سُجلت فكرتك الصامتة في الفراغ بنجاح.';
        silenceFeedback.className = 'silence-feedback success';
        
        setTimeout(() => {
            silenceFeedback.textContent = '';
            silenceFeedback.className = 'silence-feedback';
        }, 4000);

        displayThoughts();
    };

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- 7. SHADOW CLOCK INTERACTIVE LOGIC ---
    
    // Clock DOM Elements
    const digitalClock = document.getElementById('digital-clock');
    const gearsContainer = document.getElementById('clock-gears');
    const faceNumbersContainer = document.getElementById('clock-face-numbers');
    
    const catContainer = document.getElementById('clock-cat-container');
    const catBobGroup = document.getElementById('cat-bobbing-group');
    const catEyes = document.getElementById('cat-eyes');
    const clockSvg = document.getElementById('shadow-clock-svg');
    
    const handMinute = document.getElementById('clock-hand-minute');
    const handSecond = document.getElementById('clock-hand-second');

    const legFL = document.getElementById('leg-front-left');
    const legFR = document.getElementById('leg-front-right');
    const legBL = document.getElementById('leg-back-left');
    const legBR = document.getElementById('leg-back-right');

    // 7a. Generate Clock Face Numbers
    const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const rFace = 182; // radius for numbers placement
    
    numbers.forEach(h => {
        const angle = ((h - 3) * 30 * Math.PI) / 180;
        const x = 250 + rFace * Math.cos(angle);
        const y = 250 + rFace * Math.sin(angle);
        
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('class', 'clock-number cinzel');
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.textContent = h;
        faceNumbersContainer.appendChild(textElement);
    });

    // 7b. Helper: Draw Gear teeth SVG Path
    function drawGearPath(cx, cy, teeth, m) {
        const rp = m * teeth;
        const ro = rp + m;
        const ri = rp - 1.25 * m;
        
        const points = [];
        const angleStep = (2 * Math.PI) / teeth;
        
        const tBottom = 0.35;
        const tSlope = 0.15;
        const tTop = 0.35;
        
        for (let i = 0; i < teeth; i++) {
            const baseAngle = i * angleStep;
            const a0 = baseAngle;
            const a1 = baseAngle + angleStep * tBottom;
            const a2 = a1 + angleStep * tSlope;
            const a3 = a2 + angleStep * tTop;
            
            points.push(`${cx + ri * Math.cos(a0)},${cy + ri * Math.sin(a0)}`);
            points.push(`${cx + ri * Math.cos(a1)},${cy + ri * Math.sin(a1)}`);
            points.push(`${cx + ro * Math.cos(a2)},${cy + ro * Math.sin(a2)}`);
            points.push(`${cx + ro * Math.cos(a3)},${cy + ro * Math.sin(a3)}`);
        }
        
        return `M ${points.join(' L ')} Z`;
    }

    // 7c. Generate Gear SVGs and configure
    const m = 2.2;
    const gearsConfig = [
        { id: 'gear-center', cx: 250, cy: 250, teeth: 28, speedMult: 1, offset: 0, color: 'var(--color-gold)' },
        { id: 'gear-top-left', cx: 178.4, cy: 178.4, teeth: 18, speedMult: -28/18, offset: 10, color: 'var(--color-gold)' },
        { id: 'gear-top-right', cx: 321.6, cy: 178.4, teeth: 18, speedMult: -28/18, offset: 10, color: 'var(--color-gold)' },
        { id: 'gear-bottom', cx: 250, cy: 360, teeth: 22, speedMult: -28/22, offset: 8, color: 'var(--color-violet)' },
        { id: 'gear-bottom-small', cx: 185.2, cy: 397.4, teeth: 12, speedMult: 28/12, offset: 15, color: 'var(--color-green)' }
    ];

    gearsConfig.forEach(g => {
        const rp = m * g.teeth;
        const ri = rp - 1.25 * m;
        const innerRimRadius = ri - 2;
        
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', g.id);
        group.setAttribute('class', 'clock-gear');
        group.style.stroke = g.color;
        group.style.fill = 'none';
        group.style.strokeWidth = '1';
        group.style.opacity = g.id === 'gear-center' ? '0.12' : '0.22';
        group.style.filter = 'drop-shadow(0 0 3px rgba(255,255,255,0.05))';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', drawGearPath(g.cx, g.cy, g.teeth, m));
        group.appendChild(path);
        
        const circleRim = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleRim.setAttribute('cx', g.cx);
        circleRim.setAttribute('cy', g.cy);
        circleRim.setAttribute('r', innerRimRadius);
        group.appendChild(circleRim);
        
        const hubOuter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hubOuter.setAttribute('cx', g.cx);
        hubOuter.setAttribute('cy', g.cy);
        hubOuter.setAttribute('r', 13);
        group.appendChild(hubOuter);
        
        const hubInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hubInner.setAttribute('cx', g.cx);
        hubInner.setAttribute('cy', g.cy);
        hubInner.setAttribute('r', 7);
        hubInner.setAttribute('fill', g.color);
        group.appendChild(hubInner);
        
        const spokesCount = g.teeth > 20 ? 6 : 4;
        for (let i = 0; i < spokesCount; i++) {
            const angle = (i * 2 * Math.PI) / spokesCount;
            const x1 = g.cx + 13 * Math.cos(angle);
            const y1 = g.cy + 13 * Math.sin(angle);
            const x2 = g.cx + innerRimRadius * Math.cos(angle);
            const y2 = g.cy + innerRimRadius * Math.sin(angle);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            group.appendChild(line);
        }
        gearsContainer.appendChild(group);
    });

    // 7d. Interactive Mouse & Animation States
    let mouseX = 250;
    let mouseY = 250;
    let targetMouseX = 250;
    let targetMouseY = 250;
    
    document.addEventListener('mousemove', (e) => {
        if (!clockSvg) return;
        const rect = clockSvg.getBoundingClientRect();
        const scaleX = 500 / rect.width;
        const scaleY = 500 / rect.height;
        targetMouseX = (e.clientX - rect.left) * scaleX;
        targetMouseY = (e.clientY - rect.top) * scaleY;
    });

    // Clock System Variables
    const R_cat = 216; // Cat walks on outer rim of radius 216
    let catAngle = -90; // Starts at 12 o'clock (-90 degrees)
    let gearAngle = 0;
    let walkTime = 0;
    let currentEyeX = 0;
    let currentEyeY = 0;

    // 7e. Main Loop
    function animateClock() {
        // Interpolate mouse coordinates smoothly
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
        
        const now = new Date();
        const hrs = now.getHours();
        const mins = now.getMinutes();
        const secs = now.getSeconds();
        const ms = now.getMilliseconds();
        
        // Update Digital Clock
        if (digitalClock) {
            const pad = (n) => n.toString().padStart(2, '0');
            digitalClock.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        }
        
        // Calculate Target Hour Angle (12 o'clock is -90 deg. Each hour is 30 deg.)
        const currentHour = hrs % 12;
        let targetHourAngle = -90 + currentHour * 30;
        
        // Normalise target to be clockwise (ahead of catAngle)
        while (targetHourAngle < catAngle) {
            targetHourAngle += 360;
        }
        
        // Walk State Machine
        const angleDiff = targetHourAngle - catAngle;
        
        if (angleDiff > 0.15) {
            // Cat walks towards designated hour (constant speed or ease)
            const speed = Math.min(angleDiff, 0.85); // 0.85 degrees per frame
            catAngle += speed;
            walkTime += 0.16; // walk cycles
            
            // Bobbing body animation (sitting bounce) and leg swing
            const bob = 1.0 * Math.abs(Math.sin(walkTime * 2.2));
            if (catBobGroup) {
                catBobGroup.setAttribute('transform', `translate(0, ${bob})`);
            }
            // Leg animation
            const legAngle = Math.sin(walkTime * 3) * 15; // swing amplitude
            if (legFL) legFL.setAttribute('transform', `rotate(${legAngle}, -10, -30)`);
            if (legFR) legFR.setAttribute('transform', `rotate(${-legAngle}, 10, -30)`);
            if (legBL) legBL.setAttribute('transform', `rotate(${legAngle}, -10, -10)`);
            if (legBR) legBR.setAttribute('transform', `rotate(${-legAngle}, 10, -10)`);
        } else {
            // Cat stops exactly at the hour
            catAngle = targetHourAngle;
            if (catBobGroup) catBobGroup.setAttribute('transform', 'translate(0, 0)');
        }
        
        // Position Cat on Clock Rim
        const catRad = (catAngle * Math.PI) / 180;
        const catX = 250 + R_cat * Math.cos(catRad);
        const catY = 250 + R_cat * Math.sin(catRad);
        const catRotation = catAngle + 90; // tangent clockwise
        
        if (catContainer) {
            catContainer.setAttribute('transform', `translate(${catX}, ${catY}) rotate(${catRotation})`);
        }
        
        // Rotate cogs in background
        gearAngle += 0.15;
        gearsConfig.forEach(g => {
            const angle = gearAngle * g.speedMult + g.offset;
            const el = document.getElementById(g.id);
            if (el) {
                el.setAttribute('transform', `rotate(${angle}, ${g.cx}, ${g.cy})`);
            }
        });
        
        // --- ROTATE CLOCK HANDS ---
        const minAngle = mins * 6 + secs * 0.1;
        const secAngle = secs * 6 + ms * 0.006;
        
        if (handMinute) {
            handMinute.setAttribute('transform', `rotate(${minAngle}, 250, 250)`);
        }
        if (handSecond) {
            handSecond.setAttribute('transform', `rotate(${secAngle}, 250, 250)`);
        }
        
        // --- EYE TRACKING ---
        // Cat head center relative to container is (-20.5, -34)
        // Calculate absolute head coordinates
        const phi = (catRotation * Math.PI) / 180;
        const headX = catX + (-20.5) * Math.cos(phi) - (-34) * Math.sin(phi);
        const headY = catY + (-20.5) * Math.sin(phi) + (-34) * Math.cos(phi);
        
        const dx = mouseX - headX;
        const dy = mouseY - headY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let ex = 0;
        let ey = 0;
        if (dist > 1) {
            const maxDisp = 1.8;
            ex = (dx / dist) * maxDisp;
            ey = (dy / dist) * maxDisp;
        }
        
        currentEyeX += (ex - currentEyeX) * 0.12;
        currentEyeY += (ey - currentEyeY) * 0.12;
        
        if (catEyes) {
            catEyes.setAttribute('transform', `translate(${currentEyeX}, ${currentEyeY})`);
        }
        
        requestAnimationFrame(animateClock);
    }
    
    animateClock();

    // Initialize list display
    displayThoughts();
});
