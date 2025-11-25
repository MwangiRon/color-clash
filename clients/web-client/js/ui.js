function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add loading spinner
function showLoading(show = true) {
    let spinner = document.getElementById('loading-spinner');
    
    if (show && !spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        spinner.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-8">
                <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                <p class="text-center mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
            </div>
        `;
        document.body.appendChild(spinner);
    } else if (!show && spinner) {
        spinner.remove();
    }
}

// Animate elements on scroll (optional enhancement)
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    });
    
    elements.forEach(el => observer.observe(el));
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});