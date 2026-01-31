export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-white text-xl font-bold tracking-wide">
          ATHLIX
        </h2>
        <p className="text-gray-400 mt-2">
          Nutrition & Training for Real, Lasting Transformation
        </p>
        <p className="text-gray-600 text-sm mt-6">
          © {new Date().getFullYear()} Athlix Nutrition & Training Co.
        </p>
      </div>
    </footer>
  );
}
