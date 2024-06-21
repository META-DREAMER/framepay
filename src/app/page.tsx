import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Onchain Checkout Frame
        </h1>
        {/* github link */}
        <Link className="text-xl text-gray-400 font-mono font-bold hover:underline"
              href="https://github.com/META-DREAMER/onchain-checkout-frame"  target={'_blank'}>
          Github
        </Link>
      </div>
    </main>
  );
}
