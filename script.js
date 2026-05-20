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
    function adjustRadius() {
        if (window.innerWidth <= 600) {
            radius = 110;
        } else {
            radius = 150;
        }
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

    // Initialize list display
    displayThoughts();
});
