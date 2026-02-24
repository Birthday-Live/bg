// ==================== 性能优化工具 ====================
let rafId = null;
let pendingUpdates = [];

function scheduleUpdate(fn) {
    pendingUpdates.push(fn);
    if (!rafId) {
        rafId = requestAnimationFrame(() => {
            pendingUpdates.forEach(update => update());
            pendingUpdates = [];
            rafId = null;
        });
    }
}

// ==================== 页面加载初始化 ====================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 700);

    updateRuntime();
    setInterval(updateRuntime, 1000);
    initScrollAnimation();
    initAudioVisualizer();
    loadThemePreference();
    initMobileAvatar();
    initMobileMenu();
});

// ==================== 移动端汉堡菜单 ====================
function initMobileMenu() {
    const nav = document.querySelector('header nav');
    const navList = document.querySelector('header nav ul');
    
    if (!nav || !navList) return;
    
    // 创建汉堡按钮
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-btn relative pulse-btn w-11 h-11 glass rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:bg-white/60 transition-all duration-300 hover:scale-110';
    hamburger.innerHTML = '<i class="fas fa-bars text-base"></i>';
    hamburger.id = 'hamburgerBtn';
    
    // 插入到按钮组
    const buttonGroup = document.querySelector('header nav > div:last-child');
    if (buttonGroup) {
        buttonGroup.insertBefore(hamburger, buttonGroup.firstChild);
    }
    
    // 切换菜单
    hamburger.addEventListener('click', () => {
        navList.classList.toggle('mobile-menu-open');
        const icon = hamburger.querySelector('i');
        if (navList.classList.contains('mobile-menu-open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // 点击菜单项后关闭
    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('mobile-menu-open');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ==================== 移动端可拖拽头像悬浮球 ====================
function initMobileAvatar() {
    const avatarImg = document.getElementById('avatarImage');
    if (!avatarImg) return;
    
    // 创建移动端悬浮头像
    const floatAvatar = document.createElement('div');
    floatAvatar.className = 'mobile-avatar-float glass';
    floatAvatar.innerHTML = `<img src="${avatarImg.src}" alt="头像">`;
    document.body.appendChild(floatAvatar);
    
    // 从localStorage读取保存的位置
    const savedPos = localStorage.getItem('avatar-position');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            floatAvatar.style.right = pos.right;
            floatAvatar.style.bottom = pos.bottom;
            floatAvatar.style.left = 'auto';
            floatAvatar.style.top = 'auto';
        } catch (e) {
            console.log('加载头像位置失败:', e);
        }
    }
    
    // 拖拽变量
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // 触摸开始
    floatAvatar.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = floatAvatar.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        floatAvatar.style.transition = 'none';
        e.preventDefault();
    }, { passive: false });
    
    // 触摸移动
    floatAvatar.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        // 边界限制
        const maxX = window.innerWidth - floatAvatar.offsetWidth;
        const maxY = window.innerHeight - floatAvatar.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));
        
        floatAvatar.style.left = boundedX + 'px';
        floatAvatar.style.top = boundedY + 'px';
        floatAvatar.style.right = 'auto';
        floatAvatar.style.bottom = 'auto';
        
        e.preventDefault();
    }, { passive: false });
    
    // 触摸结束
    floatAvatar.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        floatAvatar.style.transition = 'transform 0.2s ease';
        
        // 保存位置
        const rect = floatAvatar.getBoundingClientRect();
        const rightPos = window.innerWidth - rect.right;
        const bottomPos = window.innerHeight - rect.bottom;
        
        localStorage.setItem('avatar-position', JSON.stringify({
            right: rightPos + 'px',
            bottom: bottomPos + 'px'
        }));
    });
    
    // 鼠标拖拽支持（桌面测试用）
    floatAvatar.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = floatAvatar.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        floatAvatar.style.transition = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        const maxX = window.innerWidth - floatAvatar.offsetWidth;
        const maxY = window.innerHeight - floatAvatar.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));
        
        floatAvatar.style.left = boundedX + 'px';
        floatAvatar.style.top = boundedY + 'px';
        floatAvatar.style.right = 'auto';
        floatAvatar.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        floatAvatar.style.transition = 'transform 0.2s ease';
        
        const rect = floatAvatar.getBoundingClientRect();
        const rightPos = window.innerWidth - rect.right;
        const bottomPos = window.innerHeight - rect.bottom;
        
        localStorage.setItem('avatar-position', JSON.stringify({
            right: rightPos + 'px',
            bottom: bottomPos + 'px'
        }));
    });
}

// ==================== 主题切换 ====================
const themeToggle = document.getElementById('themeToggle');
let isDark = false;

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDark = true;
        document.body.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}

function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        requestAnimationFrame(() => {
            if (isDark) {
                document.body.classList.add('dark-theme');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                saveThemePreference('dark');
            } else {
                document.body.classList.remove('dark-theme');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                saveThemePreference('light');
            }
        });
    });
}

// ==================== 音乐控制 ====================
const musicToggle = document.getElementById('musicToggle');
const playBtn = document.getElementById('playBtn');
const musicInfo = document.getElementById('musicInfo');
const backgroundMusic = document.getElementById('backgroundMusic');
const audioVisualizer = document.getElementById('audioVisualizer');
let isPlaying = false;
let audioContext, analyser, source, dataArray, animationId;

function toggleMusic() {
    if (isPlaying) {
        backgroundMusic.pause();
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (musicInfo) musicInfo.textContent = '点击播放音乐';
        if (audioVisualizer) audioVisualizer.classList.remove('active');
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    } else {
        backgroundMusic.play().then(() => {
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (musicInfo) musicInfo.textContent = '正在播放...';
            if (audioVisualizer) audioVisualizer.classList.add('active');
            startVisualization();
        }).catch(e => console.log('播放失败:', e));
    }
    isPlaying = !isPlaying;
}

if (musicToggle) musicToggle.addEventListener('click', toggleMusic);
if (playBtn) playBtn.addEventListener('click', toggleMusic);

// ==================== 头像切换 ====================
const avatarImage = document.getElementById('avatarImage');
const avatarImages = ['./static/imgs/avg.jpg'];
let currentAvatar = 0;

if (avatarImage) {
    avatarImage.addEventListener('click', () => {
        currentAvatar = (currentAvatar + 1) % avatarImages.length;
        requestAnimationFrame(() => {
            avatarImage.src = avatarImages[currentAvatar];
            avatarImage.style.transform = 'scale(0.85)';
            
            // 同步更新移动端头像
            const floatAvatar = document.querySelector('.mobile-avatar-float img');
            if (floatAvatar) {
                floatAvatar.src = avatarImages[currentAvatar];
            }
            
            setTimeout(() => {
                requestAnimationFrame(() => {
                    avatarImage.style.transform = 'scale(1)';
                });
            }, 300);
        });
    });
}

// ==================== 导航高亮 ====================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 150 && sectionTop + section.offsetHeight > 150) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active', 'text-pink-500', 'bg-white/50');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active', 'text-pink-500', 'bg-white/50');
                }
            });
        });
        scrollTimeout = null;
    }, 100);
}, { passive: true });

// ==================== 平滑滚动 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== 运行时间 ====================
function updateRuntime() {
    const start = new Date('2025-05-01T00:00:00');
    const now = new Date();
    const diff = now - start;

    requestAnimationFrame(() => {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = Math.floor(diff / 86400000);
        if (hoursEl) hoursEl.textContent = Math.floor((diff % 86400000) / 3600000);
        if (minutesEl) minutesEl.textContent = Math.floor((diff % 3600000) / 60000);
        if (secondsEl) secondsEl.textContent = Math.floor((diff % 60000) / 1000);
    });
}

// ==================== 滚动动画 ====================
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

// ==================== 音频可视化初始化 ====================
function initAudioVisualizer() {
    const visualizer = document.getElementById('audioVisualizer');
    if (!visualizer) return;
    
    const numBars = 48;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'audio-bar';
        const angle = (i / numBars) * 360;
        
        bar.style.left = '50%';
        bar.style.bottom = '50%';
        bar.style.transform = `translate(-50%, 50%) rotate(${angle}deg) translateY(-200px) translateZ(0)`;
        bar.style.height = '20px';
        bar.style.animationDelay = `${i * 0.02}s`;
        
        bar.dataset.index = i;
        bar.dataset.angle = angle;
        
        fragment.appendChild(bar);
    }
    
    visualizer.appendChild(fragment);
}

// ==================== 音频可视化启动 ====================
function startVisualization() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(backgroundMusic);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.85;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        } catch (e) {
            console.log('可视化初始化失败:', e);
            return;
        }
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    animateVisualizer();
}

// ==================== 音频可视化动画 ====================
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 16;

function animateVisualizer() {
    if (!isPlaying) return;

    const currentTime = performance.now();
    
    if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
        animationId = requestAnimationFrame(animateVisualizer);
        return;
    }
    
    lastUpdateTime = currentTime;
    analyser.getByteFrequencyData(dataArray);
    const bars = document.querySelectorAll('.audio-bar');
    
    requestAnimationFrame(() => {
        bars.forEach((bar, i) => {
            const dataIndex = Math.floor((i / bars.length) * dataArray.length);
            const value = dataArray[dataIndex];
            
            const normalizedValue = value / 255;
            const heightMultiplier = Math.pow(normalizedValue, 0.75);
            const height = 20 + heightMultiplier * 130;
            
            const width = 4 + normalizedValue * 3;
            const opacity = 0.6 + normalizedValue * 0.4;
            
            const scaleY = height / 20;
            const scaleX = width / 5;
            
            const angle = parseFloat(bar.dataset.angle);
            bar.style.transform = `translate(-50%, 50%) rotate(${angle}deg) translateY(-200px) scaleY(${scaleY}) scaleX(${scaleX}) translateZ(0)`;
            bar.style.opacity = opacity;
            
            const hue = (i / bars.length) * 360;
            
            if (value > 100) {
                const intensity = (value - 100) / 155;
                const glow = 15 + intensity * 20;
                const saturation = 75 + intensity * 20;
                const lightness = 65 + intensity * 15;
                
                bar.style.boxShadow = `
                    0 0 ${glow}px hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 + intensity * 0.4}),
                    0 0 ${glow * 1.5}px hsla(${hue + 40}, ${saturation}%, ${lightness}%, ${0.3 + intensity * 0.3}),
                    inset 0 0 8px rgba(255, 255, 255, ${0.2 + intensity * 0.2})
                `;
                
                bar.style.filter = `brightness(${1.15 + intensity * 0.35}) saturate(${1.2 + intensity * 0.3})`;
            } else {
                bar.style.boxShadow = `
                    0 0 8px hsla(${hue}, 70%, 65%, 0.3),
                    inset 0 0 6px rgba(255, 255, 255, 0.15)
                `;
                bar.style.filter = 'brightness(1.1) saturate(1.15)';
            }
        });
    });
    
    if (isPlaying) {
        animationId = requestAnimationFrame(animateVisualizer);
    }
}

// ==================== 图片懒加载 ====================
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.complete) {
                requestAnimationFrame(() => {
                    img.parentElement.classList.remove('image-loading');
                });
            }
            imageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

document.querySelectorAll('.image-loading img').forEach(img => {
    img.addEventListener('load', function () {
        requestAnimationFrame(() => {
            this.parentElement.classList.remove('image-loading');
        });
    });
    imageObserver.observe(img);
});

// ==================== 性能监控（开发环境）====================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            console.log(`FPS: ${frameCount}`);
            frameCount = 0;
            lastTime = currentTime;
        }
        requestAnimationFrame(measureFPS);
    }
    
    // measureFPS(); // 取消注释以监控 FPS
}