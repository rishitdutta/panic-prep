import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      How do you want to learn?
      <div className="flex flex-row gap-8">
        <Link href="/upload">
          <div className="flex justify-center items-center w-96 h-96 rounded-lg shadow-lg border-1 border-foreground/20">
            Upload notes, lecture slides or Course Material
          </div>
        </Link>
        <Link href="/prompt">
          <div className="flex justify-center items-center w-96 h-96 rounded-lg shadow-lg border-1 border-foreground/20">
            Enter Topic or List of Topics
          </div>
        </Link>
      </div>
    </div>
  );
}
