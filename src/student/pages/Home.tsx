const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Student Home</h1>
      <p>Welcome to LMS Student Dashboard. Courses coming soon!</p>
      <a href="/admin" className="bg-primary text-white px-6 py-3 rounded-xl mt-4 inline-block">Admin (test)</a>
    </div>
  );
};

export default Home;

