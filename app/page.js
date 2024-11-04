import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-catalinaBlue">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-center">
        Carpooling for the Future
      </h1>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full md:w-auto">
        <Link href="/carowner">
          <button className="bg-orange-600 text-white py-3 px-10 md:px-12 lg:px-16 rounded-lg font-semibold shadow-lg hover:bg-orange-700 transition duration-300 ease-in-out w-full md:w-auto">
            I am a Car Owner
          </button>
        </Link>
        <Link href="/nonCarOwner">
          <button className="bg-green-600 text-white py-3 px-10 md:px-12 lg:px-16 rounded-lg font-semibold shadow-lg hover:bg-green-700 transition duration-300 ease-in-out w-full md:w-auto">
            I am a Non Car Owner
          </button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full md:w-auto items-center justify-center">
        <Link href="/carowner/signin">
          <button className="bg-teal-600 text-white text-sm md:text-base py-3 px-8 rounded-lg font-semibold shadow-md hover:bg-teal-700 transition duration-300 ease-in-out w-full md:w-auto">
            Sign In as a Car Owner
          </button>
        </Link>
        <Link href="/nonCarOwner/signin">
          <button className="bg-teal-600 text-white text-sm md:text-base py-3 px-8 rounded-lg font-semibold shadow-md hover:bg-teal-700 transition duration-300 ease-in-out w-full md:w-auto">
            Sign In as a Non Car Owner
          </button>
        </Link>
      </div>
    </div>
  );
}
