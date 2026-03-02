(() => {
    'use strict';

    // ═══ PAGE LOADER ═══
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                pageLoader.classList.add('loaded');
            }, 800);
        });
    }

    // ═══ CUSTOM CURSOR ═══
    const cursorDot = document.createElement('div');
    const cursorRing = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let cx = -100, cy = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });

    function updateCursor() {
        cursorDot.style.left = cx - 3 + 'px';
        cursorDot.style.top = cy - 3 + 'px';
        rx += (cx - rx) * 0.12;
        ry += (cy - ry) * 0.12;
        cursorRing.style.left = rx - 18 + 'px';
        cursorRing.style.top = ry - 18 + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.querySelectorAll('a, button, .btn-primary, .btn-outline, .venture-card, .contact-card, .stat, .ach-item, .detail-card, .edu-item, .exp-item, .skill-bar-item').forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // ═══ HERO NAME — LETTER-BY-LETTER REVEAL ═══
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        const text = heroName.textContent;
        heroName.textContent = '';
        heroName.style.opacity = '1';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = (i * 0.04 + 0.3) + 's';
            heroName.appendChild(span);
        });
    }

    // ═══ IMMERSIVE HERO CANVAS — 3D GLOBE + DENSE STARFIELD + ROCKETS ═══
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h;
        let mouseX = 0, mouseY = 0;

        function resize() {
            const hero = canvas.parentElement;
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        }

        // --- STARS: Multiple layers for depth ---
        const layers = [];
        function createStarLayers() {
            layers.length = 0;
            // 3 layers: far (small, slow), mid, near (big, fast)
            const configs = [
                { count: 300, maxR: 0.8, speed: 0.1, alpha: 0.3 },
                { count: 150, maxR: 1.2, speed: 0.3, alpha: 0.5 },
                { count: 60, maxR: 2.0, speed: 0.6, alpha: 0.8 },
            ];
            configs.forEach(cfg => {
                const stars = [];
                for (let i = 0; i < cfg.count; i++) {
                    stars.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        r: Math.random() * cfg.maxR + 0.2,
                        twinkle: Math.random() * Math.PI * 2,
                        twinkleSpeed: 0.01 + Math.random() * 0.03,
                        baseAlpha: cfg.alpha * (0.4 + Math.random() * 0.6),
                    });
                }
                layers.push({ stars, speed: cfg.speed });
            });
        }

        // --- 3D WIREFRAME GLOBE ---
        const globe = {
            cx: 0, cy: 0, radius: 0,
            rotationY: 0,
            rotationX: 0.3,
            points: [],
            meridians: 18,
            parallels: 12,
        };

        function initGlobe() {
            globe.cx = w * 0.72;
            globe.cy = h * 0.45;
            globe.radius = Math.min(w, h) * 0.28;
        }

        function project3D(lat, lon) {
            const phi = lat;
            const theta = lon + globe.rotationY;

            const x = Math.cos(phi) * Math.sin(theta);
            const y = Math.sin(phi);
            const z = Math.cos(phi) * Math.cos(theta);

            // Simple perspective
            const scale = 1 / (1 + z * 0.15);
            const px = globe.cx + x * globe.radius * scale;
            const py = globe.cy - y * globe.radius * scale;

            return { x: px, y: py, z: z, scale };
        }

        function drawGlobe(t) {
            globe.rotationY = t * 0.15;
            const R = globe.radius;

            // Atmosphere glow
            const grad = ctx.createRadialGradient(globe.cx, globe.cy, R * 0.2, globe.cx, globe.cy, R * 1.6);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0.06)');
            grad.addColorStop(0.3, 'rgba(59, 130, 246, 0.04)');
            grad.addColorStop(0.6, 'rgba(99, 102, 241, 0.02)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(globe.cx, globe.cy, R * 1.6, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            const innerGrad = ctx.createRadialGradient(globe.cx, globe.cy, 0, globe.cx, globe.cy, R);
            innerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
            innerGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.03)');
            innerGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(globe.cx, globe.cy, R, 0, Math.PI * 2);
            ctx.fill();

            // Clean outer circle
            ctx.beginPath();
            ctx.arc(globe.cx, globe.cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Orbiting ring (tilted ellipse)
            ctx.save();
            ctx.translate(globe.cx, globe.cy);
            ctx.rotate(-0.2);
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 1.35, R * 0.25, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Orbiting satellite dot on the ring
            const satAngle = t * 0.5;
            const satX = Math.cos(satAngle) * R * 1.35;
            const satY = Math.sin(satAngle) * R * 0.25;
            ctx.beginPath();
            ctx.arc(satX, satY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#60a5fa';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(satX, satY, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
            ctx.fill();
            ctx.restore();

            // Second orbit ring
            ctx.save();
            ctx.translate(globe.cx, globe.cy);
            ctx.rotate(0.8);
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 1.15, R * 0.3, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.1)';
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 10]);
            ctx.stroke();
            ctx.setLineDash([]);

            const sat2Angle = -t * 0.35;
            const sat2X = Math.cos(sat2Angle) * R * 1.15;
            const sat2Y = Math.sin(sat2Angle) * R * 0.3;
            ctx.beginPath();
            ctx.arc(sat2X, sat2Y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f97316';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sat2X, sat2Y, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
            ctx.fill();
            ctx.restore();
        }

        // --- SHOOTING STARS ---
        let shootingStars = [];

        // --- ROCKETS ---
        let rockets = [];
        function spawnRocket() {
            const side = Math.random() > 0.5;
            rockets.push({
                x: side ? -20 : w + 20,
                y: h * 0.2 + Math.random() * h * 0.5,
                vx: (side ? 1 : -1) * (2 + Math.random() * 2),
                vy: -0.5 - Math.random() * 1.5,
                life: 1,
                size: 1.5 + Math.random(),
                trail: [],
            });
        }

        // --- NEBULA CLOUDS ---
        function drawNebula() {
            // Subtle colored nebula patches
            const nebulas = [
                { x: w * 0.15, y: h * 0.2, r: 250, color: '59, 130, 246' },
                { x: w * 0.82, y: h * 0.7, r: 200, color: '139, 92, 246' },
                { x: w * 0.5, y: h * 0.85, r: 300, color: '99, 102, 241' },
            ];
            nebulas.forEach(n => {
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
                grad.addColorStop(0, `rgba(${n.color}, 0.03)`);
                grad.addColorStop(0.5, `rgba(${n.color}, 0.015)`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // --- MAIN DRAW LOOP ---
        function draw() {
            ctx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001;

            // Nebula background
            drawNebula();

            // Parallax offset based on mouse
            const parallaxX = (mouseX - w / 2) * 0.02;
            const parallaxY = (mouseY - h / 2) * 0.02;

            // Draw star layers with parallax
            layers.forEach((layer, li) => {
                const px = parallaxX * (li + 1) * 0.5;
                const py = parallaxY * (li + 1) * 0.5;

                layer.stars.forEach(s => {
                    const twinkle = (Math.sin(t * s.twinkleSpeed * 60 + s.twinkle) + 1) * 0.5;
                    const alpha = s.baseAlpha * (0.3 + twinkle * 0.7);
                    const sx = ((s.x + px) % w + w) % w;
                    const sy = ((s.y + py) % h + h) % h;

                    ctx.beginPath();
                    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
                    ctx.fill();

                    // Cross-shaped flare on biggest stars
                    if (s.r > 1.5 && twinkle > 0.7) {
                        const flareLen = s.r * 4 * twinkle;
                        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
                        ctx.lineWidth = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(sx - flareLen, sy);
                        ctx.lineTo(sx + flareLen, sy);
                        ctx.moveTo(sx, sy - flareLen);
                        ctx.lineTo(sx, sy + flareLen);
                        ctx.stroke();
                    }
                });
            });

            // Draw 3D globe
            drawGlobe(t);

            // Shooting stars
            if (Math.random() < 0.008) {
                shootingStars.push({
                    x: Math.random() * w * 0.6,
                    y: Math.random() * h * 0.3,
                    vx: 6 + Math.random() * 6,
                    vy: 2 + Math.random() * 3,
                    life: 1,
                    decay: 0.008 + Math.random() * 0.008,
                    len: 80 + Math.random() * 60,
                });
            }

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];
                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life -= ss.decay;
                if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }

                const tailX = ss.x - ss.vx * ss.len * 0.15;
                const tailY = ss.y - ss.vy * ss.len * 0.15;
                const g = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
                g.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
                g.addColorStop(0.3, `rgba(96, 165, 250, ${ss.life * 0.5})`);
                g.addColorStop(1, 'rgba(96, 165, 250, 0)');
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = g;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Bright head
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
                ctx.fill();
                // Head glow
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${ss.life * 0.15})`;
                ctx.fill();
            }

            // Rockets
            if (Math.random() < 0.002) spawnRocket();

            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.trail.push({ x: r.x, y: r.y, life: 1 });
                r.x += r.vx;
                r.y += r.vy;
                r.life -= 0.003;

                if (r.life <= 0 || r.x < -50 || r.x > w + 50 || r.y < -50) {
                    rockets.splice(i, 1);
                    continue;
                }

                // Draw trail
                for (let j = r.trail.length - 1; j >= 0; j--) {
                    const tp = r.trail[j];
                    tp.life -= 0.025;
                    if (tp.life <= 0) { r.trail.splice(j, 1); continue; }

                    ctx.beginPath();
                    ctx.arc(tp.x, tp.y, r.size * tp.life * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(249, 115, 22, ${tp.life * 0.4})`;
                    ctx.fill();
                }

                // Rocket head — bright white dot
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${r.life})`;
                ctx.fill();
                // Engine flame glow
                ctx.beginPath();
                ctx.arc(r.x - r.vx * 2, r.y - r.vy * 2, r.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(249, 115, 22, ${r.life * 0.2})`;
                ctx.fill();
            }

            requestAnimationFrame(draw);
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        window.addEventListener('resize', () => { resize(); createStarLayers(); initGlobe(); });
        resize();
        createStarLayers();
        initGlobe();
        draw();
    }

    // ═══ SCROLL REVEAL ═══
    const revealEls = document.querySelectorAll('.fade-up, .slide-in-left, .scale-in');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.querySelectorAll('.sb-fill[data-width]').forEach(bar => {
                    bar.style.width = bar.dataset.width + '%';
                });
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ═══ COUNTER ANIMATION ═══
    document.querySelectorAll('[data-count]').forEach(el => {
        const cObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const target = parseInt(el.dataset.count);
                const start = Date.now();
                (function animate() {
                    const p = Math.min((Date.now() - start) / 1800, 1);
                    const eased = 1 - Math.pow(1 - p, 4);
                    el.textContent = Math.round(target * eased) + (target > 10 ? '+' : '');
                    if (p < 1) requestAnimationFrame(animate);
                })();
                cObs.unobserve(el);
            }
        }, { threshold: 0.5 });
        cObs.observe(el);
    });

    // ═══ SMOOTH NAV SCROLL ═══
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const mn = document.getElementById('mobileNav');
            const hb = document.getElementById('hamburger');
            if (mn && mn.classList.contains('open')) {
                mn.classList.remove('open');
                hb.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ═══ HAMBURGER ═══
    const hb = document.getElementById('hamburger');
    const mn = document.getElementById('mobileNav');
    if (hb && mn) {
        hb.addEventListener('click', () => {
            hb.classList.toggle('active');
            mn.classList.toggle('open');
            document.body.style.overflow = mn.classList.contains('open') ? 'hidden' : '';
        });
    }

    // ═══ NAV AUTO-HIDE ═══
    const nav = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const cur = window.scrollY;
        if (cur > 200) {
            nav.classList.toggle('hidden', cur > lastScroll + 5);
            if (cur < lastScroll - 5) nav.classList.remove('hidden');
        } else { nav.classList.remove('hidden'); }
        lastScroll = cur;
    });

    // ═══ ACTIVE NAV TRACKING ═══
    const navLinks = document.querySelectorAll('.nav-links a');
    document.querySelectorAll('section[id]').forEach(sec => {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${sec.id}`));
            }
        }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' }).observe(sec);
    });

    // ═══ SCROLL PROGRESS ═══
    const sp = document.getElementById('scrollProgress');
    if (sp) {
        window.addEventListener('scroll', () => {
            sp.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
        });
    }

    // ═══ TILT ON VENTURE CARDS ═══
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -6;
            const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 6;
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ═══ MAGNETIC BUTTONS ═══
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // ═══ PARALLAX GLOW ═══
    const heroGlow = document.querySelector('.hero-glow');
    window.addEventListener('scroll', () => {
        const s = window.scrollY;
        if (heroGlow && s < window.innerHeight) {
            heroGlow.style.transform = `translateY(${s * 0.3}px) scale(${1 + s * 0.0003})`;
        }
    });

    // ═══ BACK TO TOP ═══
    const btt = document.getElementById('backToTop');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.classList.toggle('visible', window.scrollY > 600);
        });
        btt.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

})();
