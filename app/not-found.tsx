import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Signal not found.</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">The market or forecaster profile you opened is not in this MVP dataset.</p>
      <ButtonLink href="/overview" className="mt-6">Back to Overview</ButtonLink>
    </section>
  );
}
