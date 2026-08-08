import { HeroTitle } from "@/components/home/HeroTitle";
import { EmailCapture } from "@/components/home/EmailCapture";

export default function HomePage() {
  return (
    <section className="relative min-h-[85vh]">
      <div className="absolute inset-0 flex -translate-y-12 flex-col items-center justify-center text-center">
        <HeroTitle />
      </div>
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <EmailCapture />
      </div>
    </section>
  );
}
