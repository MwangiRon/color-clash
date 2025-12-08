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

// Game Renderer Utility
window.GameRenderer = {
    renderCell(cell, index, value, isInteractive = false) {
        // Reset base classes
        cell.className = "game-cell bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer flex items-center justify-center text-4xl font-bold transition-all shadow-sm border-2 border-transparent h-24 relative overflow-hidden group";
        
        // Add hover effect if empty and interactive
        if (value === null && isInteractive) {
            cell.classList.add("hover:bg-gray-300", "dark:hover:bg-gray-600", "hover:border-gray-400", "dark:hover:border-gray-500", "active:scale-95");
            // Add ghost piece on hover (optional advanced feature, skipping for simplicity)
        }

        // Render piece
        cell.innerHTML = "";
        
        if (value) {
            const piece = document.createElement("div");
            // Removed scale-0 and separate animation frame for reliability
            piece.className = "w-16 h-16 rounded-full shadow-inner transform transition-transform duration-300 animate-bounce-in";
            
            if (value === "red") {
                piece.classList.add("bg-gradient-to-br", "from-red-400", "to-red-600", "shadow-red-900/50");
                // Add inner gloss
                const gloss = document.createElement("div");
                gloss.className = "absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full transform -rotate-45";
                piece.appendChild(gloss);
            } else if (value === "blue") {
                piece.classList.add("bg-gradient-to-br", "from-blue-400", "to-blue-600", "shadow-blue-900/50");
                // Add inner gloss
                const gloss = document.createElement("div");
                gloss.className = "absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full transform -rotate-45";
                piece.appendChild(gloss);
            }
            
            cell.appendChild(piece);
            cell.classList.add("occupied");
        }
    }
};