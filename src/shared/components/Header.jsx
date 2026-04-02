// Header Component - Migrate from lms/_header.html
// For React SPAs

export const Header = ({ title = 'Dashboard', user }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* Topbar content */}
      <h1>{title}</h1>
      {/* User menu, search */}
    </header>
  );
};
