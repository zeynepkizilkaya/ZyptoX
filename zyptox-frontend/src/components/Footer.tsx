import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#fafafa] dark:bg-canvas-dark border-t border-hairline-light dark:border-hairline-dark py-6 px-6 font-sans text-center mt-auto">
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-xs text-muted dark:text-muted-strong select-none">
        <span>© 2026 ZyptoX</span>
        <span>·</span>
        {/* proje linki */}
        <a href="https://github.com/zeynepkizilkaya/ZyptoX/" target="_blank" rel="noopener noreferrer" className="hover:text-ink dark:hover:text-on-dark transition-colors duration-150">GitHub</a>
      </div>
    </footer>
  );
};
