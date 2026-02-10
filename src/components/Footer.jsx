export default function Footer() {
    return (
        <footer className="bg-brand-bg border-t border-brand-border mt-10 md:mt-20">
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 text-center">
                <h2 className="text-brand-text text-xl font-bold tracking-wide">ATHLIX</h2>
                <p className="text-brand-muted mt-2 md:mt-1 hidden md:block">Nutrition & Training for Real, Lasting Transformation</p>
                <p className="text-gray-400 text-sm mt-3 md:mt-4">© {new Date().getFullYear()} Athlix Nutrition & Training Co.</p>
            </div>
        </footer>
    );
}
