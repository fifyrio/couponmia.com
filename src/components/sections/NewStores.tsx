export default function NewStores() {
  const stores = [
    "Ecostair", "Thermomedcare", "Solocompetitor", "Memoryhearts", "Gamechangers",
    "Welcomemat AU", "Welcomemat", "The Artema", "MJMJMJK", "Liferelated",
    "La Femme UK Promi...", "legends/holidays AU", "legends Holiday Parks", "Myharvest", "Target",
    "Good Store", "Fynstrade UK", "Eltam", "Localbasket.DE", "Eatworkshop",
    "Amazon", "eBay", "Walmart", "Best Buy", "Nike", "Adidas", "H&M", "Zara",
    "IKEA", "Home Depot", "Costco", "Apple Store", "Samsung", "Dell", "HP",
    "Netflix", "Spotify", "Disney+", "McDonald's", "Starbucks", "KFC", "Pizza Hut",
    "Uber Eats", "DoorDash", "Booking.com", "Expedia", "Airbnb", "Hotels.com",
    "Sephora", "Ulta Beauty", "CVS Pharmacy", "Walgreens", "GameStop", "Steam",
    "PlayStation Store", "Xbox Store", "Nintendo eShop", "Epic Games", "Origin",
    "Barnes & Noble", "Audible", "Kindle Store", "Coursera", "Udemy", "Skillshare"
  ];

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">New Stores</h2>
      
      <div className="bg-card-bg/90 backdrop-blur-sm border border-card-border shadow-lg overflow-hidden rounded-2xl">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {stores.slice(0, 20).map((store, index) => (
              <div 
                key={index} 
                className="text-xs sm:text-sm text-text-secondary hover:text-brand-accent cursor-pointer transition-all duration-300 font-medium p-2 sm:p-3 rounded-xl hover:bg-brand-lightest hover:shadow-md hover:-translate-y-0.5 text-center border border-transparent hover:border-brand-accent/20 truncate"
                title={store}
              >
                {store}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}