const MenuCategories = () => {
  return (
    <div className="w-full bg-orange-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-desi-orange mb-6 mt-5">Available on your favorite delivery platforms:</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a 
              href="http://menus.fyi/10883320" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transform transition-transform duration-300 hover:scale-110 block"
            >
              <img 
                src="/Grubhub.webp" 
                alt="Order on Grubhub" 
                width={120} 
                height={42} 
                className="object-contain h-10 w-auto" 
              />
            </a>
            <a 
              href="https://order.online/business/desi-flavors-katy-14145277" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transform transition-transform duration-300 hover:scale-110 block"
            >
              <img 
                src="/Doordash.webp" 
                alt="Order on DoorDash" 
                width={140} 
                height={50} 
                className="object-contain h-10 w-auto" 
              />
            </a>
            <a 
              href="https://www.order.store/store/desi-flavors-katy-1989-fry-road/drrAdlMVTTin4O0Bdvzo2g" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transform transition-transform duration-300 hover:scale-110 block"
            >
              <img 
                src="/ubereats.png" 
                alt="Order on Uber Eats" 
                width={120} 
                height={42} 
                className="object-contain h-7 w-auto" 
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategories;
