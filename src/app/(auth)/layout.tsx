import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/layout/primitives";
import { PHOTO, IMAGE_QUALITY } from "@/content/assets";
import { SITE } from "@/content/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const photo = PHOTO.windowLight;

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col">
        <Container className="py-8">
          <Logo />
        </Container>

        <main id="main" className="flex flex-1 items-center">
          <Container className="w-full py-10">
            <div className="mx-auto w-full max-w-[26rem]">{children}</div>
          </Container>
        </main>

        <Container className="py-8">
          <p className="text-sm text-ink-55">
            {SITE.name} is not an emergency service.{" "}
            <Link
              href="/crisis-support"
              className="text-ink underline underline-offset-4"
            >
              Crisis support
            </Link>
          </p>
        </Container>
      </div>

      {/* Quiet companion image; decorative, so it carries no alt text. */}
      <div className="relative hidden lg:block">
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="50vw"
          quality={IMAGE_QUALITY.feature}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          className="object-cover"
        />
      </div>
    </div>
  );
}
