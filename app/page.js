import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-catalinaBlue">
      <h1 className="text-black text-4xl font-bold mb-8">Carpooling for the Future</h1>
      <div className=" flex gap-2 items-center justify-center">
        <Link href="/carowner">
          <button className="bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold">
            I am a Car Owner
          </button>
        </Link>
        <Link href="/nonCarOwner">
          <button className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold">
            I am a Non Car Owner
          </button>
        </Link>
      </div>
      <Link className='mt-4' href="/signin">
          <button className="bg-teal-600 text-white py-3 px-8 rounded-lg font-semibold">
            Signin
          </button>
        </Link>
    </div>
  );
}
