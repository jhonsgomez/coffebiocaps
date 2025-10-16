// Configuración de la API
const WP_API_CONFIG = {
    baseUrl: 'https://coffeebiocaps.com/',
    postsPerPage: 9,
    endpoints: {
        posts: '/wp-json/wp/v2/posts',
        categories: '/wp-json/wp/v2/categories'
    }
};

// Estado de la aplicación
let currentPage = 1;
let totalPages = 2;
let isLoading = false;

/**
 * Inicializar carga de posts
 */
async function initBlog() {
    try {
        showLoadingState();
        await loadBlogPosts();
        setupPagination();
    } catch (error) {
        showError('Error al cargar los posts del blog');
        console.error('Error:', error);
    }
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    const container = document.querySelector('.blog-grid-principal');
    if (!container) return;

    container.innerHTML = `
        <div class="col-span-3 flex justify-center items-center py-20">
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-green-primary mx-auto mb-4"></div>
                <p class="font-helvetica text-gray-primary font-bold">Cargando posts...</p>
            </div>
        </div>
    `;
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    const container = document.querySelector('.blog-grid-principal');
    if (!container) return;

    container.innerHTML = `
        <div class="col-span-3 flex justify-center items-center py-20">
            <div class="text-center">
                <p class="font-helvetica text-red-500 font-bold text-xl mb-4"><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                <button onclick="initBlog()" 
                    class="bg-green-primary text-white px-8 py-3 rounded-full hover-scale font-helvetica font-bold cursor-pointer">
                    <i class="fas fa-redo"></i> Intentar nuevamente
                </button>
            </div>
        </div>
    `;
}

/**
 * Cargar posts desde WordPress API
 */
async function loadBlogPosts(page = 1) {
    if (isLoading) return;
    isLoading = true;

    try {
        const url = `${WP_API_CONFIG.baseUrl}${WP_API_CONFIG.endpoints.posts}?_embed&per_page=${WP_API_CONFIG.postsPerPage}&page=${page}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtener total de páginas de los headers
        totalPages = parseInt(response.headers.get('X-WP-TotalPages')) || 1;
        currentPage = page;

        const posts = await response.json();

        if (posts.length === 0) {
            showEmptyState();
            return;
        }

        renderPosts(posts);
        updatePaginationControls();

    } catch (error) {
        console.error('Error cargando posts:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

/**
 * Mostrar estado vacío
 */
function showEmptyState() {
    const container = document.querySelector('.blog-grid-principal');
    if (!container) return;

    container.innerHTML = `
        <div class="col-span-3 flex justify-center items-center py-20">
            <div class="text-center">
                <p class="font-helvetica text-gray-primary font-bold text-xl">
                    No hay posts publicados aún.
                </p>
            </div>
        </div>
    `;
}

/**
 * Renderizar posts en el DOM
 */
function renderPosts(posts) {
    const container = document.querySelector('.blog-grid-principal');
    if (!container) return;

    container.innerHTML = '';

    posts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
}

/**
 * Crear tarjeta de post
 */
function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'container-blog-info col-span-1 bg-white rounded-xl p-6 shadow-xl min-h-60 relative animate-fadeInUp';

    // Obtener extracto limpio (sin HTML)
    const excerpt = stripHtml(post.excerpt.rendered).substring(0, 150);

    // Título truncado
    const title = post.title.rendered;

    // URL del post individual
    const postUrl = `post.html?slug=${post.slug}`;

    div.innerHTML = `
        <p class="font-helvetica font-extrabold text-2xl text-black uppercase truncate-title">
            ${title}
        </p>
        <div class="container-blog-info-grid grid grid-cols-3 items-end relative">
            <div class="blog-text col-span-2 h-full flex justify-start items-start">
                <p class="font-helvetica text-gray-primary font-bold leading-5 truncate-text">
                    ${excerpt}${excerpt.length >= 150 ? '...' : ''}
                </p>
            </div>
        </div>
        <button onclick="window.location.href = '${postUrl}'"
            class="bg-green-primary rounded cursor-pointer hover-scale absolute shadow-lg"
            style="right: 1rem; bottom: 1rem;">
            <img src="../assets/img/blog/row.png" alt="Leer más" class="mx-auto w-8">
        </button>
    `;

    return div;
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
 * Configurar paginación
 */
function setupPagination() {
    // Buscar o crear contenedor de paginación
    let paginationContainer = document.getElementById('pagination-container');

    if (!paginationContainer) {
        const aboutSection = document.getElementById('about');
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'flex justify-center items-center gap-4 mt-8 mb-8';

        // Insertar antes del botón "Saber más"
        const saberMasBtn = aboutSection.querySelector('button');
        aboutSection.insertBefore(paginationContainer, saberMasBtn);
    }
}

/**
 * Actualizar controles de paginación
 */
function updatePaginationControls() {
    const container = document.getElementById('pagination-container');

    if (!container || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button 
            onclick="changePage(${currentPage - 1})" 
            ${currentPage === 1 ? 'disabled' : ''}
            class="bg-green-primary text-white px-4 py-2 rounded-full hover-scale font-helvetica font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            ← Anterior
        </button>
        <span class="font-helvetica font-bold text-gray-primary">
            Página ${currentPage} de ${totalPages}
        </span>
        <button 
            onclick="changePage(${currentPage + 1})" 
            ${currentPage === totalPages ? 'disabled' : ''}
            class="bg-green-primary text-white px-4 py-2 rounded-full hover-scale font-helvetica font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            Siguiente →
        </button>
    `;
}

/**
 * Cambiar de página
 */
async function changePage(page) {
    if (page < 1 || page > totalPages || isLoading) return;

    showLoadingState();

    // Scroll suave al inicio de los posts
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    await loadBlogPosts(page);
}

/**
 * Iniciar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
} else {
    initBlog();
}