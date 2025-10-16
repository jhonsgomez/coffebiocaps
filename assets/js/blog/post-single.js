// Configuración de la API
const WP_API_CONFIG = {
    baseUrl: 'https://coffeebiocaps.com/',
    endpoints: {
        posts: '/wp-json/wp/v2/posts'
    }
};

/**
 * Inicializar carga del post
 */
async function initSinglePost() {
    try {
        showLoadingState();

        const postSlug = getPostSlugFromURL();

        if (!postSlug) {
            showError('No se encontró el slug del post');
            return;
        }

        await loadPost(postSlug);

    } catch (error) {
        showError('Error al cargar el post');
        console.error('Error:', error);
    }
}

/**
 * Obtener slug del post desde la URL
 */
function getPostSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    const container = document.getElementById('post-content');
    if (!container) return;

    container.innerHTML = `
        <div class="flex justify-center items-center py-20">
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-green-primary mx-auto mb-4"></div>
                <p class="font-helvetica text-gray-primary font-bold">Cargando post...</p>
            </div>
        </div>
    `;
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    const container = document.getElementById('post-content');
    if (!container) return;

    container.innerHTML = `
        <div class="flex justify-center items-center py-20">
            <div class="text-center">
                <p class="font-helvetica text-red-500 font-bold text-xl mb-4"><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                <button onclick="window.location.href='index.html'" 
                    class="bg-green-primary text-white px-8 py-3 rounded-full hover-scale font-helvetica font-bold cursor-pointer">
                    <i class="fas fa-arrow-left"></i> Volver al blog
                </button>
            </div>
        </div>
    `;
}

/**
 * Cargar post desde WordPress API
 */
async function loadPost(postSlug) {
    try {
        const url = `${WP_API_CONFIG.baseUrl}${WP_API_CONFIG.endpoints.posts}?slug=${postSlug}&_embed`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();

        if (!posts || posts.length === 0) {
            showError('Post no encontrado');
            return;
        }

        const post = posts[0];

        renderPost(post);
        updateMetaTags(post);

    } catch (error) {
        console.error('Error cargando post:', error);
        throw error;
    }
}

/**
 * Renderizar el post en el DOM
 */
function renderPost(post) {
    const container = document.getElementById('post-content');
    if (!container) return;

    // Obtener imagen destacada
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

    // Obtener categorías
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const categoriesHTML = categories.map(cat =>
        `<span class="bg-green-primary text-md text-white px-3 py-1 rounded-full font-helvetica">${cat.name}</span>`
    ).join(' ');

    // Formatear fecha
    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Autor
    const author = post._embedded?.author?.[0]?.name || 'Coffee Bio Caps';

    container.innerHTML = `
        <!-- Breadcrumb -->
        <nav class="mb-6 animate-fadeInUp" style="height: auto;">
            <ol class="flex items-center space-x-2 text-sm font-helvetica">
                <li><a href="../" class="text-green-primary hover:underline">Inicio</a></li>
                <li class="text-gray-primary">/</li>
                <li><a href="index.html" class="text-green-primary hover:underline">Blog</a></li>
                <li class="text-gray-primary">/</li>
                <li class="text-gray-primary">${post.title.rendered}</li>
            </ol>
        </nav>
        
        <!-- Post Header -->
        <header class="mb-8 animate-fadeInUp">
            <div class="mb-4">
                ${categoriesHTML}
            </div>
            
            <h1 class="font-helvetica font-extrabold text-4xl lg:text-5xl text-black-primary mb-4 leading-tight">
                ${post.title.rendered}
            </h1>
            
            <div class="flex items-center space-x-4 text-gray-primary font-helvetica mb-6">
                <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span>•</span>
                <span><i class="fas fa-user"></i> Por ${author}</span>
            </div>
            
            ${featuredImage ? `
                <div class="rounded-2xl overflow-hidden shadow-lg mb-8">
                    <img src="${featuredImage}" alt="${post.title.rendered}" class="w-full h-auto">
                </div>
            ` : ''}
        </header>
        
        <!-- Post Content -->
        <article class="post-content prose prose-lg max-w-none animate-fadeInUp">
            ${post.content.rendered}
        </article>
        
        <!-- Back Button -->
        <div class="mb-14 text-center animate-fadeInUp">
            <button onclick="window.location.href='index.html'" 
                class="bg-green-primary text-white px-8 py-3 rounded-full hover-scale font-helvetica font-bold cursor-pointer">
                <i class="fas fa-arrow-left"></i> Volver al blog
            </button>
        </div>
        
        <!-- Share Section -->
        <div class="mt-8 pt-8 border-t border-gray-200 animate-fadeInUp">
            <p class="font-helvetica font-bold text-gray-primary mb-4">Compartir este artículo:</p>
            <div class="flex items-center space-x-4">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                   target="_blank"
                   class="bg-blue-700 text-white px-3 py-2 rounded-full hover-scale font-helvetica text-sm cursor-pointer">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title.rendered)}" 
                   target="_blank"
                   class="bg-gray-400 text-white px-3 py-2 rounded-full hover-scale font-helvetica text-sm cursor-pointer">
                    <i class="fa-brands fa-x-twitter"></i>
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                   target="_blank"
                   class="bg-blue-600 text-white px-3 py-2 rounded-full hover-scale font-helvetica text-sm cursor-pointer">
                    <i class="fab fa-linkedin-in"></i>
                </a>
                <button onclick="copyToClipboard()" 
                   class="bg-green-primary text-white px-4 py-2 rounded-full hover-scale font-helvetica text-sm cursor-pointer">
                    <i class="fas fa-link"></i> Copiar enlace
                </button>
            </div>
        </div>
    `;

    // Aplicar estilos al contenido del post
    stylePostContent();
}

/**
 * Aplicar estilos al contenido del post
 */
function stylePostContent() {
    const content = document.querySelector('.post-content');
    if (!content) return;

    // Añadir clases a elementos
    content.querySelectorAll('p').forEach(p => {
        p.classList.add('font-helvetica', 'text-gray-primary', 'leading-relaxed', 'mb-4');
    });

    content.querySelectorAll('h2, h3, h4').forEach(heading => {
        heading.classList.add('font-helvetica', 'font-extrabold', 'text-black-primary', 'mt-8', 'mb-4');
    });

    content.querySelectorAll('img').forEach(img => {
        img.classList.add('rounded-lg', 'shadow-md', 'my-6', 'w-full', 'h-auto');
    });

    content.querySelectorAll('ul, ol').forEach(list => {
        list.classList.add('font-helvetica', 'text-gray-primary', 'ml-6', 'mb-4');
    });

    content.querySelectorAll('a').forEach(link => {
        link.classList.add('text-green-primary', 'hover:underline', 'font-bold');
    });
}

/**
 * Actualizar meta tags del documento
 */
function updateMetaTags(post) {
    // Actualizar título
    document.title = `${post.title.rendered} | Coffee Bio Caps Blog`;

    // Actualizar descripción
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        const excerpt = stripHtml(post.excerpt.rendered).substring(0, 160);
        metaDescription.setAttribute('content', excerpt);
    }

    // Actualizar Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', post.title.rendered);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        const excerpt = stripHtml(post.excerpt.rendered).substring(0, 160);
        ogDescription.setAttribute('content', excerpt);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (ogImage && featuredImage) {
        ogImage.setAttribute('content', featuredImage);
    }
}

/**
 * Limpiar HTML de una cadena
 */
function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Copiar enlace al portapapeles
 */
function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('¡Enlace copiado al portapapeles!');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

/**
 * Iniciar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSinglePost);
} else {
    initSinglePost();
}