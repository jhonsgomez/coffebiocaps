// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const nav = document.querySelector('nav');

const CLOSED_HEIGHT = 80;
const OPEN_HEIGHT = 370;

let menuOpen = false;

mobileMenuBtn.addEventListener('click', () => {
    const icon = mobileMenuBtn.querySelector('i');

    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');

    menuOpen = icon.classList.contains('fa-times') ? true : false;

    if (menuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.remove('closed');
        mobileMenu.classList.add('open');
        nav.style.height = OPEN_HEIGHT + 'px';
    } else {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('closed');
        nav.style.height = CLOSED_HEIGHT + 'px';

        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 450);
    }
});


window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        const icon = mobileMenuBtn.querySelector('i');

        if (menuOpen) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
            menuOpen = false;
        }

        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('closed');
        nav.style.height = CLOSED_HEIGHT + 'px';

        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 450);
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Close mobile menu if open
            const icon = mobileMenuBtn.querySelector('i');

            if (menuOpen) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
                menuOpen = false;
            }

            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('closed');
            nav.style.height = CLOSED_HEIGHT + 'px';

            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 450);
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('shadow-lg');
    } else {
        header.classList.remove('shadow-lg');
    }
});
