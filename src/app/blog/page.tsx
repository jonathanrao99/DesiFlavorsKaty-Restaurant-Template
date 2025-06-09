import Link from 'next/link';

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-desi-cream py-12 px-4">
      <section className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-desi-black mb-4">Desi Flavors Blog</h1>
        <p className="text-lg text-gray-700 mb-6">Stories, recipes, and updates from the Desi Flavors Katy team. Check back for new dishes, behind-the-scenes, and more!</p>
      </section>
      <section className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {/* Example blog post cards */}
        <article className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-desi-orange">Our Secret to Perfect Biryani</h2>
          <p className="text-gray-700 mb-4">Discover the spices and techniques that make our biryani a customer favorite. From marination to the final dum, we spill the beans!</p>
          <Link href="#" className="text-desi-orange font-medium mt-auto hover:underline">Read More</Link>
        </article>
        <article className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-desi-orange">Meet the Chef: A Journey in Indian Cuisine</h2>
          <p className="text-gray-700 mb-4">Get to know the culinary mastermind behind Desi Flavors Katy, their favorite dishes, and what inspires our menu.</p>
          <Link href="#" className="text-desi-orange font-medium mt-auto hover:underline">Read More</Link>
        </article>
        <article className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-desi-orange">How to Host the Perfect Indian Party</h2>
          <p className="text-gray-700 mb-4">Tips and tricks for planning a memorable event with authentic Indian food, from menu selection to presentation.</p>
          <Link href="#" className="text-desi-orange font-medium mt-auto hover:underline">Read More</Link>
        </article>
        <article className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-desi-orange">Behind the Scenes: Food Truck Life</h2>
          <p className="text-gray-700 mb-4">A day in the life of our food truck team—prepping, serving, and sharing the love of Indian cuisine with Katy, TX.</p>
          <Link href="#" className="text-desi-orange font-medium mt-auto hover:underline">Read More</Link>
        </article>
      </section>
    </main>
  );
} 
