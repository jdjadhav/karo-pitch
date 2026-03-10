document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scrolled State
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 1.5 Dark Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('karopitch_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');

            // Save preference
            localStorage.setItem('karopitch_theme', isDark ? 'dark' : 'light');

            // Update icon
            if (themeIcon) {
                if (isDark) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            }
        });
    }

    // 2. Intersection Observer for fade animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated in
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Mobile Menu Toggle (Simplified for demo)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // A simple alert for the demo prototype
            // In a real app, this would toggle a mobile menu dropdown
            alert('Mobile menu toggled. In a full build, this opens the side navigation.');
        });
    }

    // 4. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Antigravity Mouse Motion Interaction
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        // Easing for smooth trailing effect
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();

    // 6. Subtle Parallax for Hero Elements
    const heroSection = document.querySelector('.hero');
    const heroBgShapes = document.querySelector('.hero-bg-shapes');
    const heroContent = document.querySelector('.hero-content');

    // Generate Stars
    const stars = [];
    if (heroBgShapes) {
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = 'floating-star';

            // Random properties
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 5;

            // Depth factor determines how much it moves with the mouse (parallax)
            // Smaller stars are "further away" and move less. Larger stars move more.
            const depth = size * 0.02;

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.animationDelay = `${delay}s`;

            heroBgShapes.appendChild(star);
            stars.push({ element: star, depth });
        }
    }

    if (heroSection) {
        let currentMouseX = 0;
        let currentMouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        heroSection.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to center of screen (-0.5 to 0.5)
            targetMouseX = (e.clientX / window.innerWidth) - 0.5;
            targetMouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        function animateHeroParallax() {
            // Smoothly interpolate towards mouse target using lerp
            currentMouseX += (targetMouseX - currentMouseX) * 0.1;
            currentMouseY += (targetMouseY - currentMouseY) * 0.1;

            // Move foreground content slightly in opposite direction of mouse
            if (heroContent) {
                heroContent.style.transform = `translate(${currentMouseX * -20}px, ${currentMouseY * -20}px)`;
            }

            // Move background shapes more aggressively in same direction as mouse
            if (heroBgShapes) {
                heroBgShapes.style.transform = `translate(${currentMouseX * 60}px, ${currentMouseY * 60}px)`;
            }

            // Animate stars individually based on their "depth"
            stars.forEach(starData => {
                const moveX = currentMouseX * 1000 * starData.depth;
                const moveY = currentMouseY * 1000 * starData.depth;
                starData.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            requestAnimationFrame(animateHeroParallax);
        }

        animateHeroParallax();

        // Reset transform on mouse leave for smoother experience
        heroSection.addEventListener('mouseleave', () => {
            targetMouseX = 0;
            targetMouseY = 0;
        });
    }

    // 7. Handle Form Submissions to Backend
    const applyForms = document.querySelectorAll('.apply-form');
    applyForms.forEach(form => {
        // Remove native action handlers
        form.removeAttribute('action');
        form.removeAttribute('method');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get submit button to show loading
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Submitting... <i class="fas fa-spinner fa-spin" style="margin-left: 8px;"></i>';
            submitBtn.disabled = true;

            const formData = {
                founderName: (form.querySelector('#founderName') || {}).value || '',
                founderRole: (form.querySelector('#founderRole') || {}).value || '',
                email: (form.querySelector('#email') || {}).value || '',
                phone: (form.querySelector('#phone') || {}).value || '',
                startupName: (form.querySelector('#startupName') || {}).value || '',
                category: (form.querySelector('#category') || {}).value || '',
                headquarters: (form.querySelector('#headquarters') || {}).value || '',
                website: (form.querySelector('#website') || {}).value || '',
                fundingStage: (form.querySelector('#fundingStage') || {}).value || '',
                revenue: (form.querySelector('#revenue') || {}).value || '',
                pitchDeck: (form.querySelector('#pitchDeck') || {}).value || '',
                description: (form.querySelector('#description') || {}).value || ''
            };

            try {
                const response = await fetch('/api/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Success! Your Pitch Profile has been successfully submitted and saved.');
                    form.reset();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Connection error. Please make sure the Python server is running.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    });

    // 8. Handle Auth Forms via Fetch
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.removeAttribute('action');
        loginForm.removeAttribute('method');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Logging in... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const email = loginForm.querySelector('#loginEmail').value;
            const password = loginForm.querySelector('#loginPassword').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();

                if (response.ok) {
                    window.location.href = 'application.html';
                } else {
                    alert('Login failed: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Connection error. Please make sure the Python server is running.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.removeAttribute('action');
        registerForm.removeAttribute('method');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Creating account... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const name = registerForm.querySelector('#regName').value;
            const email = registerForm.querySelector('#regEmail').value;
            const password = registerForm.querySelector('#regPassword').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const result = await response.json();

                if (response.ok) {
                    alert('Registration successful! Redirecting to application...');
                    window.location.href = 'application.html';
                } else {
                    alert('Registration failed: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Connection error. Please make sure the Python server is running.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
