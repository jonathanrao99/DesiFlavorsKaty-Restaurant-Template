
const MenuNotes = () => {
  return (
    <section className="bg-your-cream py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Menu Notes Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-center items-center gap-3 mb-4">
              <h3 className="text-xl font-display font-bold text-your-black flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-your-orange/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-your-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Menu Notes
              </h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-1">
                  Veg
                </span>
                <span className="text-gray-700">Vegetarian dishes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-1">
                  Spicy
                </span>
                <span className="text-gray-700">Spicy dishes that pack some heat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-1">
                  Halal
                </span>
                <span className="text-gray-700">All our meat dishes are certified Halal</span>
              </li>
              <li className="pt-3 text-gray-700">
                All dishes are prepared fresh daily. Menu items may vary based on availability, See updated menu on our delivery partners' platforms.
              </li>
              <li className="text-gray-500">
                Please inform us of any allergies or dietary restrictions when ordering.
              </li>
            </ul>
          </div>

          {/* Order Online Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-xl font-display font-bold text-your-black flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-your-orange/10 flex items-center justify-center flex-shrink-0">
                    <svg 
                      className="w-5 h-5 text-your-orange" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                    </svg>
                  </div>
                  Online Ordering
                </h3>
                <span className="text-xs font-medium bg-your-orange/10 text-your-orange px-2 py-1 rounded-full">
                  Available Now
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              Enjoy our authentic Indian cuisine from the comfort of your home through our trusted delivery partners.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <a
                href="http://menus.fyi/10883320"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center group"
              >
                <img 
                  src="/Grubhub.webp" 
                  alt="Order on Grubhub" 
                  className="h-8 w-auto transition-transform group-hover:scale-105"
                  width="32"
                  height="32"
                />
              </a>
              <a
                href="https://order.online/business/your-brand-14145277"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center group"
              >
                <img 
                  src="/Doordash.webp" 
                  alt="Order on Doordash" 
                  className="h-5 w-auto transition-transform group-hover:scale-105"
                  width="20"
                  height="20"
                />
              </a>
              <a
                href="https://www.order.store/store/your-brand-1989-fry-road/drrAdlMVTTin4O0Bdvzo2g"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center group"
              >
                <img 
                  src="/ubereats.png" 
                  alt="Order on UberEats" 
                  className="h-5 w-auto transition-transform group-hover:scale-105"
                  width="20"
                  height="20"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuNotes;
