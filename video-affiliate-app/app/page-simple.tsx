export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Video Affiliate App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered video analysis and automated Facebook posting
        </p>
        <div className="space-x-4">
          <a 
            href="/dashboard" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          <a 
            href="/dashboard/create" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Review
          </a>
        </div>
      </div>
    </div>
  );
}
