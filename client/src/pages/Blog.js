import React from 'react';
import './Blog.css';

const Blog = () => {
  const articles = [
    {
      id: 1,
      title: 'Top 10 Visa-Free Destinations for Turkish Citizens in 2025',
      date: 'November 20, 2025',
      author: 'Travel Team',
      excerpt: 'Discover the best countries you can visit without a visa as a Turkish passport holder. From tropical beaches to historic cities, explore your options.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      content: `
        <h3>Introduction</h3>
        <p>As a Turkish citizen, you have access to over 110 destinations either visa-free or with visa on arrival. This opens up incredible opportunities for spontaneous travel and adventure.</p>
        
        <h3>Top Visa-Free Destinations</h3>
        <ol>
          <li><strong>Japan (90 days)</strong> - Experience the perfect blend of ancient tradition and cutting-edge technology.</li>
          <li><strong>South Korea (90 days)</strong> - Explore vibrant cities, delicious cuisine, and rich cultural heritage.</li>
          <li><strong>Malaysia (90 days)</strong> - Enjoy diverse cultures, stunning beaches, and amazing food.</li>
          <li><strong>Serbia (90 days)</strong> - Discover beautiful landscapes and warm hospitality in the heart of the Balkans.</li>
          <li><strong>Georgia (365 days)</strong> - Perfect for long-term stays with incredible mountain scenery and wine culture.</li>
          <li><strong>Qatar (90 days)</strong> - Modern luxury meets Arabian tradition in this wealthy Gulf state.</li>
          <li><strong>Hong Kong (90 days)</strong> - A dynamic city where East meets West with incredible skylines.</li>
          <li><strong>Thailand (30 days)</strong> - Tropical paradise with beaches, temples, and delicious street food.</li>
          <li><strong>Indonesia (30 days)</strong> - Thousands of islands to explore, from Bali to Jakarta.</li>
          <li><strong>Brazil (90 days)</strong> - Vibrant culture, carnival, Amazon rainforest, and beautiful beaches.</li>
        </ol>
        
        <h3>Travel Tips</h3>
        <p>Always check the latest visa requirements before traveling, as policies can change. Make sure your passport is valid for at least 6 months beyond your travel dates.</p>
      `
    },
    {
      id: 2,
      title: 'How to Apply for a Schengen Visa: Complete Guide for Turkish Travelers',
      date: 'November 15, 2025',
      author: 'Visa Experts',
      excerpt: 'Planning a European adventure? Learn everything you need to know about applying for a Schengen visa, from required documents to interview tips.',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
      content: `
        <h3>Understanding the Schengen Visa</h3>
        <p>The Schengen visa allows you to visit 27 European countries with a single visa. For Turkish citizens, this is essential for European travel.</p>
        
        <h3>Required Documents</h3>
        <ul>
          <li>Valid passport (at least 3 months beyond your intended stay)</li>
          <li>Completed application form</li>
          <li>Two recent passport photos</li>
          <li>Travel insurance (minimum €30,000 coverage)</li>
          <li>Proof of accommodation (hotel bookings or invitation letter)</li>
          <li>Flight reservations (don't buy tickets until visa is approved!)</li>
          <li>Bank statements (last 3 months)</li>
          <li>Employment letter or proof of ties to Turkey</li>
          <li>Travel itinerary</li>
        </ul>
        
        <h3>Application Process</h3>
        <p>1. Determine which Schengen country to apply to (usually your main destination)</p>
        <p>2. Book an appointment at the consulate or visa center</p>
        <p>3. Prepare all required documents</p>
        <p>4. Attend your appointment and pay the fee (€80 for adults)</p>
        <p>5. Wait for processing (usually 15-30 days)</p>
        
        <h3>Pro Tips</h3>
        <p>Apply 3 months before your trip but no later than 15 days before. Be honest in your application and have all documents organized. Show strong ties to Turkey to demonstrate you'll return.</p>
      `
    },
    {
      id: 3,
      title: 'Best Times to Book Flights: Insider Tips to Save Money',
      date: 'November 10, 2025',
      author: 'Flight Experts',
      excerpt: 'Learn the secrets of flight booking timing. Discover when to buy tickets for the best prices and how to use visa requirements to plan smart travel.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
      content: `
        <h3>The Best Booking Windows</h3>
        <p>Statistical analysis shows the sweet spot for domestic flights is 1-3 months in advance, while international flights should be booked 2-8 months ahead.</p>
        
        <h3>Day of the Week Matters</h3>
        <p>Tuesday and Wednesday tend to have the lowest prices. Airlines often release deals on Monday evenings, so Tuesday morning is prime hunting time.</p>
        
        <h3>Seasonal Considerations</h3>
        <ul>
          <li><strong>Winter (Nov-Feb):</strong> Best prices for European destinations</li>
          <li><strong>Spring (Mar-May):</strong> Book 2-3 months ahead for Asia</li>
          <li><strong>Summer (Jun-Aug):</strong> Most expensive, book 4-6 months early</li>
          <li><strong>Fall (Sep-Oct):</strong> Great deals for off-season travel</li>
        </ul>
        
        <h3>Visa-Smart Booking</h3>
        <p>Consider visa requirements when booking. For destinations requiring visas, book flexible tickets until your visa is approved. For visa-free countries, you can book with confidence.</p>
        
        <h3>Tools to Use</h3>
        <p>Set up price alerts on WithPass and other flight comparison sites. Use incognito mode when searching to avoid price increases based on cookies. Consider nearby airports for better deals.</p>
      `
    },
    {
      id: 4,
      title: 'Digital Nomad Guide: Countries with Extended Visa Options for Turks',
      date: 'November 5, 2025',
      author: 'Digital Nomad Community',
      excerpt: 'Working remotely? Explore countries offering special digital nomad visas and extended stay options perfect for Turkish remote workers.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      content: `
        <h3>The Rise of Digital Nomad Visas</h3>
        <p>More countries are offering special visas for remote workers. These typically allow 6-12 month stays and require proof of remote income.</p>
        
        <h3>Best Digital Nomad Destinations for Turkish Citizens</h3>
        
        <h4>1. Georgia (365 days visa-free)</h4>
        <p>The most generous option! Spend a full year without any visa. Tbilisi has a growing expat community, affordable living, and great internet.</p>
        
        <h4>2. Dubai, UAE (Remote Work Visa)</h4>
        <p>One-year renewable visa for remote workers. Tax-free income, modern infrastructure, but higher cost of living.</p>
        
        <h4>3. Croatia (Digital Nomad Visa)</h4>
        <p>Up to 12 months for remote workers. Beautiful coastline, EU quality of life, and growing nomad community.</p>
        
        <h4>4. Portugal (Digital Nomad Visa)</h4>
        <p>Pathway to residency. Great weather, affordable compared to western Europe, vibrant culture.</p>
        
        <h4>5. Mexico (180 days visa-free)</h4>
        <p>Popular with nomads. Affordable, diverse landscapes, and rich culture. Perfect for 6-month stays.</p>
        
        <h3>Requirements</h3>
        <p>Most digital nomad visas require: proof of employment/income ($2,000-3,000/month), health insurance, clean criminal record, and remote work documentation.</p>
        
        <h3>Tax Considerations</h3>
        <p>Consult with a tax professional. Some countries have tax treaties with Turkey. Being a tax resident in another country can affect your Turkish tax obligations.</p>
      `
    }
  ];

  const [selectedArticle, setSelectedArticle] = React.useState(null);

  if (selectedArticle) {
    return (
      <div className="blog">
        <div className="blog-container">
          <button className="back-button" onClick={() => setSelectedArticle(null)}>
            ← Back to Articles
          </button>
          <article className="article-full">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="article-full-image" />
            <div className="article-full-content">
              <h1>{selectedArticle.title}</h1>
              <div className="article-meta">
                <span>By {selectedArticle.author}</span>
                <span>•</span>
                <span>{selectedArticle.date}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="blog">
      <div className="blog-header">
        <h1>WithPass Travel Blog</h1>
        <p>Travel tips, visa guides, and destination insights for smart travelers</p>
      </div>

      <div className="blog-container">
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article.id} className="article-card" onClick={() => setSelectedArticle(article)}>
              <img src={article.image} alt={article.title} className="article-image" />
              <div className="article-content">
                <h2>{article.title}</h2>
                <div className="article-meta">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <p>{article.excerpt}</p>
                <button className="read-more">Read More →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
