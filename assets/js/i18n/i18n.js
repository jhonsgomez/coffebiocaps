// ─── LOADER ──────────────────────────────────────────────────────────────────

function createLoader() {
    if (document.getElementById('i18n-loader')) return;

    const loader = document.createElement('div');
    loader.id = 'i18n-loader';
    loader.innerHTML = `
        <div id="i18n-loader-card">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="24" fill="#FFFFFF" stroke="#8ca527" stroke-width="1.5"></circle>
                <path d="M26 12 C26 12,38 18,38 28 C38 36,30 40,26 40 C22 40,14 36,14 28 C14 18,26 12,26 12Z" fill="#8ca527" opacity="0.85"></path>
                <path d="M26 40 C26 40,26 28,26 20" stroke="#a5d6a7" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M26 28 C26 28,20 24,18 20" stroke="#a5d6a7" stroke-width="1" stroke-linecap="round"></path>
                <path d="M26 32 C26 32,32 28,34 24" stroke="#a5d6a7" stroke-width="1" stroke-linecap="round"></path>
            </svg>
            <div style="display:flex;gap:7px;">
                <span class="i18n-dot"></span>
                <span class="i18n-dot"></span>
                <span class="i18n-dot"></span>
            </div>
        </div>
    `;

    document.body.appendChild(loader);
}

function showLoader() {
    const loader = document.getElementById('i18n-loader');
    if (loader) {
        // Pequeño delay para que la transición CSS sea visible
        requestAnimationFrame(() => loader.classList.add('visible'));
    }
}

function hideLoader() {
    const loader = document.getElementById('i18n-loader');
    if (!loader) return;

    setTimeout(() => {
        loader.classList.remove('visible');
        loader.addEventListener('transitionend', () => {
            loader.remove();
        }, { once: true });
    }, 500);
}


// ─── TRADUCCIONES ─────────────────────────────────────────────────────────────


const BASE_URL = new URL('../../js/i18n/', import.meta.url).href;

async function loadTranslations(lang) {
    const res = await fetch(`${BASE_URL}${lang}.json`);
    return res.json();
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const raw = el.getAttribute('data-i18n');
        const attrMatch = raw.match(/^\[(.+?)\](.+)/);

        if (attrMatch) {
            const [, attr, key] = attrMatch;
            const text = resolveKey(key, translations);
            if (text) el.setAttribute(attr, text);

        } else if (el.querySelector('[data-i18n]')) {
            const text = resolveKey(raw, translations);
            if (text) {
                const firstTextNode = [...el.childNodes]
                    .find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
                if (firstTextNode) firstTextNode.textContent = text;
            }

        } else {
            const text = resolveKey(raw, translations);
            if (text) {
                if (containsHTML(text)) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        }
    });
}

function containsHTML(str) {
    return /<[a-z][\s\S]*>/i.test(str);
}

function resolveKey(key, obj) {
    return key.split('.').reduce((acc, k) => acc?.[k], obj) ?? null;
}

let currentTranslations = {};


// ─── CAMBIAR IDIOMA ───────────────────────────────────────────────────────────

window.setLanguage = async function (lang) {
    createLoader();
    showLoader();

    try {
        const translations = await loadTranslations(lang);
        currentTranslations = translations;

        applyTranslations(translations);
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('[id^="lang-slider"]').forEach(slider => {
            slider.classList.toggle('right', lang === 'en');
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('lang-btn-active', btn.dataset.lang === lang);
        });

        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));

    } finally {
        // Se oculta siempre, incluso si hay error
        hideLoader();
    }
};

// Función para textos dinámicos: t('blog.page_of', { current: 2, total: 5 })
window.t = function (key, vars = {}) {
    const text = resolveKey(key, currentTranslations);
    if (!text) return key;
    return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
};


// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

async function initI18n() {
    const lang = localStorage.getItem('lang') || 'es';

    // En la carga inicial NO mostramos loader — la página ya tiene el texto en español
    // Solo mostramos loader cuando el usuario CAMBIA de idioma manualmente
    const translations = await loadTranslations(lang);
    currentTranslations = translations;

    // Si el idioma guardado es distinto al default (español del HTML), sí aplicamos
    if (lang !== 'es') {
        applyTranslations(translations);
    }

    document.documentElement.lang = lang;

    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);

    if (activeBtn) {
        activeBtn.classList.toggle('lang-btn-active');
    }

    // a los demas botones les quitamos la clase
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang !== lang) {
            btn.classList.remove('lang-btn-active');
        }
    });

    // si el lenguaje es ingles se debe mover el slider a la derecha
    if (lang === 'en') {
        document.querySelectorAll('.lang-slider').forEach(slider => {
            slider.classList.add('right');

            // agregar la clase lang-btn-active al botón de inglés
            document.querySelectorAll('.lang-btn').forEach(btn => {
                if (btn.dataset.lang === 'en') {
                    btn.classList.add('lang-btn-active');
                } else {
                    btn.classList.remove('lang-btn-active');
                }
            });
        });
    }

    // Si el lenguaje es español se debe mover el slider a la izquierda
    if (lang === 'es') {
        document.querySelectorAll('.lang-slider').forEach(slider => {
            slider.classList.remove('right');
            
            // agregar la clase lang-btn-active al botón de español
            document.querySelectorAll('.lang-btn').forEach(btn => {
                if (btn.dataset.lang === 'es') {
                    btn.classList.add('lang-btn-active');
                } else {
                    btn.classList.remove('lang-btn-active');
                }
            });
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Exportamos funciones y variables necesarias para otros módulos

window.applyTranslations = applyTranslations;

Object.defineProperty(window, 'currentTranslations', {
    get: () => currentTranslations
});