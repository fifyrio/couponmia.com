

export default function RecentPosts() {
  const posts = [
    {
      title: "How to Register Using a Phone Number at Garmin Calculator",
      date: "December 20, 2024",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Save for Independents and Shoe Store! Holiday and Affordable Ideas from MAS",
      date: "December 19, 2024", 
      image: "/api/placeholder/300/200"
    },
    {
      title: "What to Read in Your Model Car - Your Ultimate Shopping Guide",
      date: "December 18, 2024",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Playing Smart! How to Optimize Your Photography Use of a Lifetime Database",
      date: "December 17, 2024",
      image: "/api/placeholder/300/200"
    },
    {
      title: 'Unveiling "Song Kok Sang Mini" - Why This Seoul Sang Yum Yum!',
      date: "December 16, 2024",
      image: "/api/placeholder/300/200"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Recent Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <article key={index} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video bg-card-border relative">
              <div className="w-full h-full bg-gradient-to-br from-brand-lightest to-brand-medium/20 flex items-center justify-center">
                <span className="text-text-muted text-sm font-medium">Image placeholder</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-sm mb-3 leading-relaxed line-clamp-3 text-text-primary">
                {post.title}
              </h3>
              <p className="text-xs text-text-muted font-medium">{post.date}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}