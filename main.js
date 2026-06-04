/**
 * Premium Developer Portfolio Interactivity Engine
 * Handles scroll tracking, card 3D tilt parallax, contact submission, and canvas background.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 0. CINEMATIC HERO SCROLL FRAMES ENGINE
    // ----------------------------------------------------
    const frameCount = 233;
    const heroCanvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');
    const titleBlock = document.getElementById('hero-text-title');
    const descBlock = document.getElementById('hero-text-desc');
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    
    let images = [];
    let loadedCount = 0;
    let heroInitialized = false;
    
    // Setup Canvas and Context
    let heroCtx = null;
    if (heroCanvas) {
        heroCtx = heroCanvas.getContext('2d');
    }
    
    // Helper to format frame path strings
    const getFramePath = (index) => {
        const fileNumber = String(index).padStart(3, '0');
        return `assets/hero_frames/ezgif-frame-${fileNumber}.jpg`;
    };
    
    // Frame loading logic
    const preloadHeroFrames = () => {
        const progressBar = document.getElementById('loader-progress');
        const percentageLabel = document.getElementById('loader-percentage');
        
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                const percentage = Math.floor((loadedCount / frameCount) * 100);
                
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (percentageLabel) percentageLabel.textContent = `${percentage}%`;
                
                if (loadedCount === frameCount) {
                    startHeroAnimation();
                }
            };
            img.onerror = () => {
                // If a frame fails to load, count it anyway to avoid hang-ups
                loadedCount++;
                if (loadedCount === frameCount) {
                    startHeroAnimation();
                }
            };
            img.src = getFramePath(i);
            images.push(img);
        }
    };
    
    // Initialize Hero drawing loop once frames are preloaded
    const startHeroAnimation = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
        }
        
        heroInitialized = true;
        resizeHeroCanvas();
        
        // Boot smooth scroll animation loop
        requestAnimationFrame(renderHeroFrameLoop);
    };
    
    // Resize handler to adjust canvas bounds
    const resizeHeroCanvas = () => {
        if (!heroCanvas || !heroInitialized) return;
        
        heroCanvas.width = heroCanvas.parentElement.offsetWidth;
        heroCanvas.height = heroCanvas.parentElement.offsetHeight;
        
        drawFrame(Math.round(currentFrame));
    };
    
    window.addEventListener('resize', resizeHeroCanvas);
    
    // Draw frame to canvas preserving aspect ratio (Cover mode)
    const drawFrame = (index) => {
        if (!heroCanvas || !heroCtx || !heroInitialized || !images[index]) return;
        
        const img = images[index];
        const canvasW = heroCanvas.width;
        const canvasH = heroCanvas.height;
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        
        if (imgW === 0 || imgH === 0) return;
        
        const imgRatio = imgW / imgH;
        const canvasRatio = canvasW / canvasH;
        
        let renderW, renderH, xOffset, yOffset;
        
        if (canvasRatio > imgRatio) {
            renderW = canvasW;
            renderH = canvasW / imgRatio;
            xOffset = 0;
            yOffset = (canvasH - renderH) / 2;
        } else {
            renderW = canvasH * imgRatio;
            renderH = canvasH;
            xOffset = (canvasW - renderW) / 2;
            yOffset = 0;
        }
        
        heroCtx.clearRect(0, 0, canvasW, canvasH);
        heroCtx.drawImage(img, xOffset, yOffset, renderW, renderH);
    };
    
    // Scroll progress calculations & Lerping variables
    let currentFrame = 0;
    let targetFrame = 0;
    
    const renderHeroFrameLoop = () => {
        if (!heroSection || !heroInitialized) return;
        
        const scrollY = window.scrollY;
        const offsetTop = heroSection.offsetTop;
        const sectionH = heroSection.offsetHeight;
        const viewH = window.innerHeight;
        
        const relativeScroll = scrollY - offsetTop;
        const trackH = sectionH - viewH;
        
        // Clamp relative scroll percent between 0 and 1
        const scrollFraction = Math.max(0, Math.min(1, relativeScroll / trackH));
        
        // Update destination frame index
        targetFrame = scrollFraction * (frameCount - 1);
        
        // Smooth interpolation (lerp)
        currentFrame += (targetFrame - currentFrame) * 0.14;
        
        // Draw interpolated frame
        drawFrame(Math.round(currentFrame));
        
        // ----------------------------------------------------
        // CINEMATIC TEXT BLOCK OPACITIES BASED ON SCROLL POSITION
        // ----------------------------------------------------
        
        // 1. Title Block Fades Out (0% -> 25% scroll)
        if (titleBlock) {
            if (scrollFraction < 0.25) {
                const opacity = 1 - (scrollFraction / 0.22);
                titleBlock.style.opacity = Math.max(0, opacity);
                titleBlock.style.transform = `translate(-50%, -50%) scale(${1 - (scrollFraction * 0.05)})`;
                titleBlock.classList.add('active');
            } else {
                titleBlock.style.opacity = '0';
                titleBlock.classList.remove('active');
            }
        }
        
        // 2. Description Block Fades In & Out (30% -> 75% scroll)
        if (descBlock) {
            if (scrollFraction >= 0.30 && scrollFraction <= 0.75) {
                let opacity = 0;
                if (scrollFraction < 0.42) {
                    // Fade In (30% -> 42%)
                    opacity = (scrollFraction - 0.30) / 0.12;
                } else if (scrollFraction > 0.62) {
                    // Fade Out (62% -> 75%)
                    opacity = 1 - ((scrollFraction - 0.62) / 0.13);
                } else {
                    // Full Solid (42% -> 62%)
                    opacity = 1;
                }
                descBlock.style.opacity = Math.max(0, Math.min(1, opacity));
                descBlock.style.transform = `translate(-50%, -50%) scale(${0.96 + (opacity * 0.04)})`;
                descBlock.classList.add('active');
            } else {
                descBlock.style.opacity = '0';
                descBlock.classList.remove('active');
            }
        }
        
        // 3. Scroll Indicator Fades Out (0% -> 15% scroll)
        if (scrollIndicator) {
            const indicatorOpacity = Math.max(0, 1 - (scrollFraction / 0.12));
            scrollIndicator.style.opacity = indicatorOpacity;
            if (indicatorOpacity === 0) {
                scrollIndicator.classList.add('hide');
            } else {
                scrollIndicator.classList.remove('hide');
            }
        }
        
        requestAnimationFrame(renderHeroFrameLoop);
    };
    
    // Boot frame loading
    preloadHeroFrames();

    // ----------------------------------------------------
    // 1. DYNAMIC NAVIGATION SCROLL-SPY
    // ----------------------------------------------------
    const sections = document.querySelectorAll('.scroll-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // Trigger when section occupies the sweet middle spot
        threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                navItems.forEach(item => {
                    if (item.getAttribute('data-section') === sectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => sectionObserver.observe(section));

    // Smooth scroll for nav items manually (for fine-tuned offsets on mobile)
    navItems.forEach(item => {
        const link = item.querySelector('a');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                // Add minor offset padding for mobile floating navbar
                const mobileOffset = window.innerWidth <= 768 ? 20 : 0;
                window.scrollTo({
                    top: targetId === "#works"
                    ? offsetTop - 40
                    : offsetTop - mobileOffset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----------------------------------------------------
    // 2. 3D PARALLAX & CURSOR GLARE ON GLASS CARDS
    // ----------------------------------------------------
    const cards = document.querySelectorAll('.card-hover-effect');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate mouse coordinates relative to the card container
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert to percentages and offsets (-0.5 to 0.5)
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;
            
            // Max tilt limits (degrees)
            const tiltMaxX = 6;
            const tiltMaxY = 6;
            
            const rotateX = -(dy / yc) * tiltMaxX;
            const rotateY = (dx / xc) * tiltMaxY;
            
            // Dynamic card glare overlay gradient
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            
            // Dynamically set background glow at mouse position
            const cardInner = card.querySelector('.card-inner') || card;
            card.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(46, 117, 89, 0.16) 0%, rgba(10, 16, 13, 0.65) 60%)`;
            card.style.borderColor = `rgba(46, 117, 89, ${0.2 + (Math.abs(dx/xc) * 0.25)})`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Smooth reset values
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.backgroundImage = '';
            card.style.borderColor = '';
        });
    });

    // ----------------------------------------------------
    // 3. CONTACT FORM CONTROL & DIALOG OVERLAY
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const successOverlay = document.getElementById('success-overlay');
    const closeSuccessBtn = document.getElementById('close-success');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Animate form button dispatch feedback
            const submitBtn = contactForm.querySelector('.submit-btn');
            const submitBtnText = submitBtn.querySelector('span');
            submitBtnText.textContent = "SENDING...";
            submitBtn.style.opacity = "0.75";
            submitBtn.style.pointerEvents = "none";
            
            // Simulate server delivery latency (1.5 seconds)
            setTimeout(() => {
                // Reveal elegant overlay success panel
                successOverlay.classList.remove('hide');
                
                // Re-enable form fields and clear inputs
                submitBtnText.textContent = "SEND MESSAGE";
                submitBtn.style.opacity = "1";
                submitBtn.style.pointerEvents = "auto";
                contactForm.reset();
            }, 1200);
        });
    }
    
    if (closeSuccessBtn && successOverlay) {
        closeSuccessBtn.addEventListener('click', () => {
            successOverlay.classList.add('hide');
        });
    }

    // ----------------------------------------------------
    // 4. HIGH-PERFORMANCE AMBIENT PARTICLES
    // ----------------------------------------------------
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        // Settings
        const particleCount = Math.min(60, Math.floor((width * height) / 22000));
        const connectionDistance = 110;
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 1.5 + 1;
                // Alternate between amber particles and emerald particles
                this.color = Math.random() > 0.4 ? 'rgba(46, 117, 89, 0.22)' : 'rgba(255, 142, 83, 0.15)';
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Wrap around edges
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
        
        // Spawn particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Update & draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            // Draw connecting lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(46, 117, 89, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
});

const navLinks = document.querySelectorAll(".nav-item a");

navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = link.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        document.body.classList.add("page-changing");

        setTimeout(() => {
            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            setTimeout(() => {
                document.body.classList.remove("page-changing");
            }, 500);
        }, 250);
    });
});

const carousel = document.getElementById("projectCarousel");

const projectData = {

    priva: {
        title: "Priva",
        sub: "Private Real-Time Chatting Web Application",
        body: `Priva is a real-time private chatting web application designed for seamless one-to-one communication with instant messaging and live online status tracking. It features secure Email OTP authentication, unique user ID creation, friend management, and responsive real-time chat functionality. Built using React.js, FastAPI, MongoDB Atlas, APIs, and modern backend logic for a smooth and scalable communication experience.
        `,
        img: "assets/priva-preview.png",
        color: "#ffffff",

        visitText: "Visit Site ⊙",
        visitLink: "https://priva-omega.vercel.app/"
    },

    greendot: {
        title: "GreenDot",
        sub: "GreenDot – AI Resume Analyzer & Builder",
        body: `GreenDot is an AI-powered Resume Analyzer & Builder designed to help users create professional, ATS-friendly resumes through intelligent skill analysis and role-based matching. The platform analyzes uploaded resumes, identifies missing skills, validates CV authenticity, and provides AI-driven recommendations to improve hiring chances. It also includes secure Email OTP authentication, resume generation, and interview preparation features using Python, Streamlit, MongoDB, Gemini AI, SMTP, and APIs.
        `,
        img: "assets/greendot-preview.png",
        color: "#39ff14",

        visitText: "Visit Site ⊙",
        visitLink: "https://resumescreeningbyabhirup.streamlit.app/"
    },

    coming1:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming2:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming3:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming4:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming5:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming6:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming7:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming8:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming9:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"},
    coming10:{title:"Coming Soon...",sub:"",body:"",img:"",color:"#fff"}

};

function updateBigProject(activeCard) {
    const key = activeCard.dataset.project;
    const data = projectData[key];

    const bigCard = document.querySelector(".priva-big-card");
    const projectsSection = document.querySelector(".projects-section");

    // Coming Soon / unknown card = blank right side like Figma
    if (!data || !data.img) {
        bigCard.style.display = "none";
        projectsSection.classList.add("blank-mode");
        return;
    }

    // Priva / GreenDot = show big card
    bigCard.style.display = "block";
    projectsSection.classList.remove("blank-mode");

    if (key === "greendot") {
        bigCard.classList.add("greendot-mode");
        projectsSection.classList.add("greendot-section");
    } else {
        bigCard.classList.remove("greendot-mode");
        projectsSection.classList.remove("greendot-section");
    }

    document.querySelector(".priva-big-card h1").textContent = data.title;
    document.querySelector(".priva-big-card h1").style.color = data.color;
    document.querySelector(".priva-big-card h4").textContent = data.sub;
    document.querySelector(".priva-big-card p").textContent = data.body;

    const previewImg = document.querySelector(".priva-preview-box img");
    previewImg.src = data.img;

    // Visit Site button link
    const visitBtn = document.querySelector('[data-btn="visit"]');

    if (visitBtn) {
        visitBtn.onclick = () => {
            window.open(data.visitLink, "_blank");
        };
    }

    const bg = data.bg || "assets/images/background4(yellow).jpg";
    projectsSection.style.setProperty("--project-bg", `url("${bg}")`);
}

if (carousel) {
    const cards = [...carousel.querySelectorAll(".project-slide")];

    let active = 2;
    let locked = false;

    function renderCarousel() {
        const total = cards.length;

        cards.forEach((card, i) => {
            let offset = i - active;

            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            card.classList.toggle("active", offset === 0);

            card.style.transform = `
                translateY(${offset * 68}px)
                scale(${offset === 0 ? 1.08 : 1})
            `;

            card.style.opacity = Math.abs(offset) > 4 ? "0" : "1";
            card.style.zIndex = 30 - Math.abs(offset);
        });

        updateBigProject(cards[active]);
    }

    renderCarousel();

    carousel.addEventListener("wheel", (e) => {
        e.preventDefault();

        if (locked) return;
        locked = true;

        if (e.deltaY > 0) {
            active = (active + 1) % cards.length;
        } else {
            active = (active - 1 + cards.length) % cards.length;
        }

        renderCarousel();

        setTimeout(() => {
            locked = false;
        }, 420);
    }, { passive: false });

    const prevBtn = document.querySelector('[data-btn="prev"]');
    const nextBtn = document.querySelector('[data-btn="next"]');

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (locked) return;
            locked = true;

            active = (active - 1 + cards.length) % cards.length;
            renderCarousel();

            setTimeout(() => {
                locked = false;
            }, 420);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (locked) return;
            locked = true;

            active = (active + 1) % cards.length;
            renderCarousel();

            setTimeout(() => {
                locked = false;
            }, 420);
        });
    }
}



const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(button => {
    button.addEventListener("mouseenter", () => {

        navButtons.forEach(btn => {
            btn.classList.remove("active-btn");
        });

        button.classList.add("active-btn");
    });
});

const privaCard = document.querySelector(".priva-big-card");

if (privaCard) {

    privaCard.addEventListener("mousemove", (e) => {

        const rect = privaCard.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        privaCard.style.setProperty("--x", `${x}px`);
        privaCard.style.setProperty("--y", `${y}px`);

        const rotateY = ((x / rect.width) - 0.5) * 5;
        const rotateX = ((y / rect.height) - 0.5) * -5;

        privaCard.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)`;
    });

    privaCard.addEventListener("mouseleave", () => {
        privaCard.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
}

const greenCard = document.querySelector(".priva-big-card");

greenCard.addEventListener("mousemove", (e) => {
    const rect = greenCard.getBoundingClientRect();

    greenCard.style.setProperty("--x", `${e.clientX - rect.left}px`);
    greenCard.style.setProperty("--y", `${e.clientY - rect.top}px`);
});