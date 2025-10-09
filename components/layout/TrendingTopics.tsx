'use client';

import { useState, useEffect } from 'react';

interface Topic {
  id: string;
  name: string;
  color: string;
}

interface TrendingTopicsProps {
  onTopicChange?: (topicId: string) => void;
}

export function TrendingTopics({ onTopicChange }: TrendingTopicsProps) {
  const [activeTopic, setActiveTopic] = useState('all');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        // Add "All" option at the beginning
        const allTopics = [
          { id: 'all', name: 'Tất cả', color: 'bg-purple-100 text-purple-600' },
          ...data.topics
        ];
        setTopics(allTopics);
        // Set "All" as active by default
        setActiveTopic('all');
        onTopicChange?.('all');
      } else {
        // Fallback to default topics with "All" option
        const defaultTopics = [
          { id: 'all', name: 'Tất cả', color: 'bg-purple-100 text-purple-600' },
          ...getDefaultTopics()
        ];
        setTopics(defaultTopics);
        setActiveTopic('all');
        onTopicChange?.('all');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Fallback to default topics with "All" option
      const defaultTopics = [
        { id: 'all', name: 'Tất cả', color: 'bg-purple-100 text-purple-600' },
        ...getDefaultTopics()
      ];
      setTopics(defaultTopics);
      setActiveTopic('all');
      onTopicChange?.('all');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId: string) => {
    setActiveTopic(topicId);
    onTopicChange?.(topicId);
  };

  const getDefaultTopics = (): Topic[] => [
    { id: 'technology', name: 'Technology', color: 'bg-blue-100 text-blue-600' },
    { id: 'travel', name: 'Travel', color: 'bg-green-100 text-green-600' },
    { id: 'sport', name: 'Sport', color: 'bg-orange-100 text-orange-600' },
    { id: 'business', name: 'Business', color: 'bg-purple-100 text-purple-600' },
    { id: 'management', name: 'Management', color: 'bg-indigo-100 text-indigo-600' },
    { id: 'trends', name: 'Trends', color: 'bg-red-100 text-red-600' },
    { id: 'startups', name: 'Startups', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'news', name: 'News', color: 'bg-gray-100 text-gray-600' },
  ];

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            EXPLORE TRENDING TOPICS
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          EXPLORE TRENDING TOPICS
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          {topics.map((topic) => {
            const isActive = activeTopic === topic.id;
            
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 hover:scale-105
                  ${isActive 
                    ? `${topic.color} shadow-md` 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {topic.name}
              </button>
            );
          })}
        </div>

        {topics.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-600 mb-4">Categories will be available soon!</p>
            {/* Dashboard link hidden for public users */}
            {/* <a 
              href="/dashboard/categories"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Create Categories
            </a> */}
          </div>
        )}
      </div>
    </section>
  );
}
