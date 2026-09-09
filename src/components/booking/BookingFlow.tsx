"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/primitives";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/marketing/typography";
import { PriceTag } from "@/components/marketing/PriceTag";
import { IconFor, type IconKey, ICONS, CheckIcon } from "@/components/icons";
import { portraitFor } from "@/content/assets";
import { BOOKING_COPY } from "@/content/copy";
import { SAFETY_NOTICE_LONG } from "@/content/site";
import { formatDuration, cn } from "@/lib/utils";
import {
  STEPS,
  type StepKey,
  MODALITY_LABEL,
  resolveTimezone,
  formatSlotFull,
} from "@/lib/booking";
import { createBooking } from "@/lib/actions/booking";
import { BookingCalendar } from "./BookingCalendar";
import type {
  ServiceRow,
  TherapistRow,
  Slot,
  SessionModality,
} from "@/types/database.types";

function iconKeyOf(key: string): IconKey {
  return (key in ICONS ? key : "notes") as IconKey;
}

/** No external store to watch — the zone cannot change mid-session. */
const subscribeNever = () => () => {};
const getServerTimezone = () => "Europe/London";

type Props = {
  services: ServiceRow[];
  therapists: TherapistRow[];
  /** therapist id -> service ids they offer */
  offerings: Record<string, string[]>;
  prefill: { fullName: string; email: string; phone: string } | null;
};

export function BookingFlow({
  services,
  therapists,
  offerings,
  prefill,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  // The zone only exists on the client. useSyncExternalStore gives the server
  // a stable snapshot, so there is no hydration mismatch and no setState in an
  // effect.
  const timezone = useSyncExternalStore(
    subscribeNever,
    resolveTimezone,
    getServerTimezone,
  );

  // ── Selection, held in the URL so back/forward and refresh work ────────
  const serviceSlug = params.get("service");
  const therapistSlug = params.get("therapist");
  const slotStart = params.get("slot");
  const stepParam = params.get("step") as StepKey | null;

  const service = services.find((s) => s.slug === serviceSlug);
  const therapist = therapists.find((t) => t.slug === therapistSlug);

  const setParams = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null) sp.delete(k);
      else sp.set(k, v);
    }
    router.replace(`/book?${sp.toString()}`, { scroll: false });
  };

  // Derive the furthest step the selection actually supports.
  const reachable: StepKey = !service
    ? "service"
    : !therapist
      ? "therapist"
      : !slotStart
        ? "time"
        : "details";

  const order = STEPS.map((s) => s.key);
  const step: StepKey =
    stepParam && order.indexOf(stepParam) <= order.indexOf(reachable)
      ? stepParam
      : reachable;

  const eligibleTherapists = useMemo(() => {
    if (!service) return therapists;
    return therapists.filter(
      (t) => offerings[t.id]?.includes(service.id) && t.accepts_new,
    );
  }, [service, therapists, offerings]);

  return (
    <div className="pb-24">
      <Container className="pt-10 md:pt-14">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-ink-55 underline underline-offset-4 hover:text-ink"
          >
            Leave booking
          </Link>
          <p className="text-sm text-ink-55">
            Times shown in <span className="text-ink">{timezone}</span>
          </p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <StepRail current={step} reachable={reachable} onJump={(k) => setParams({ step: k })} />

          <div className="min-w-0 lg:col-span-8 lg:col-start-5">
            {step === "service" && (
              <ServiceStep
                services={services}
                onPick={(s) => setParams({ service: s.slug, therapist: null, slot: null, step: "therapist" })}
              />
            )}

            {step === "therapist" && service && (
              <TherapistStep
                therapists={eligibleTherapists}
                onPick={(t) => setParams({ therapist: t.slug, slot: null, step: "time" })}
                onBack={() => setParams({ step: "service" })}
              />
            )}

            {step === "time" && service && therapist && (
              <TimeStep
                service={service}
                therapist={therapist}
                timezone={timezone}
                selected={slotStart}
                onPick={(slot) => setParams({ slot: slot.slot_start, step: "details" })}
                onBack={() => setParams({ step: "therapist" })}
              />
            )}

            {step === "details" && service && therapist && slotStart && (
              <DetailsStep
                service={service}
                therapist={therapist}
                slotStart={slotStart}
                timezone={timezone}
                prefill={prefill}
                onBack={() => setParams({ step: "time" })}
                onConflict={() => setParams({ slot: null, step: "time" })}
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ── Progress rail ────────────────────────────────────────────────────── */

function StepRail({
  current,
  reachable,
  onJump,
}: {
  current: StepKey;
  reachable: StepKey;
  onJump: (k: StepKey) => void;
}) {
  const order = STEPS.map((s) => s.key);
  const currentIndex = order.indexOf(current);
  const reachableIndex = order.indexOf(reachable);

  return (
    <nav aria-label="Booking progress" className="min-w-0 lg:col-span-3">
      <ol className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 lg:sticky lg:top-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const canJump = i <= reachableIndex;
          return (
            <li key={s.key} className="shrink-0 lg:border-t lg:border-ink-12">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onJump(s.key)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 py-2 text-left lg:w-full lg:py-4",
                  canJump ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "eyebrow",
                    active ? "text-ink" : done ? "text-ink-55" : "text-ink-25",
                  )}
                >
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active
                      ? "font-medium text-ink"
                      : done
                        ? "text-ink-55"
                        : "text-ink-25",
                  )}
                >
                  {s.label}
                </span>
                {done && (
                  <span
                    aria-hidden="true"
                    className="ml-auto hidden h-1.5 w-1.5 rounded-pill bg-signal lg:block"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepHeading({
  step,
  title,
  lead,
}: {
  step: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-9">
      <p className="eyebrow text-ink-55">{step}</p>
      <h1 className="mt-3 text-d2">{title}</h1>
      {lead && <p className="mt-4 measure text-lead text-ink-70">{lead}</p>}
    </div>
  );
}

/* ── 01 Service ───────────────────────────────────────────────────────── */

function ServiceStep({
  services,
  onPick,
}: {
  services: ServiceRow[];
  onPick: (s: ServiceRow) => void;
}) {
  return (
    <div>
      <StepHeading
        step="Step 01"
        title="What would you like to book?"
        lead="If you are not sure, start with a first consultation. It costs nothing and takes twenty-five minutes."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="flex h-full w-full flex-col rounded-lg border border-ink-12 p-6 text-left transition-colors duration-fast hover:border-ink-40"
            >
              <div className="flex items-start justify-between gap-4">
                <IconFor name={iconKeyOf(s.icon_key)} className="h-7 w-7 text-ink" />
                <PriceTag
                  cents={s.price_cents}
                  currency={s.currency}
                  size="sm"
                  freeLabel="No cost"
                />
              </div>
              <span className="mt-5 text-d4">{s.name}</span>
              <span className="mt-2 flex-1 text-sm text-ink-70">
                {s.short_desc}
              </span>
              <span className="eyebrow mt-5 text-ink-55">
                {formatDuration(s.duration_min)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 02 Therapist ─────────────────────────────────────────────────────── */

function TherapistStep({
  therapists,
  onPick,
  onBack,
}: {
  therapists: TherapistRow[];
  onPick: (t: TherapistRow) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeading
        step="Step 02"
        title="Who would you like to see?"
        lead="Everyone here is registered and taking new clients. If the fit is not right after the first session, we re-match at no cost."
      />

      {therapists.length === 0 ? (
        <p className="rounded-lg border border-ink-12 p-7 text-ink-70">
          Nobody is currently taking new clients for that service.{" "}
          <button onClick={onBack} className="text-ink underline underline-offset-4">
            Choose another service
          </button>
          .
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {therapists.map((t) => {
            const portrait = portraitFor(t.photo_url);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex h-full w-full gap-4 rounded-lg border border-ink-12 p-4 text-left transition-colors duration-fast hover:border-ink-40"
                >
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
                    {portrait ? (
                      <Image
                        src={portrait.src}
                        alt=""
                        fill
                        sizes="80px"
                        placeholder={portrait.blurDataURL ? "blur" : "empty"}
                        blurDataURL={portrait.blurDataURL}
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center font-display text-xl text-ink/70">
                        {t.initials}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-d4">{t.display_name}</span>
                    <span className="mt-0.5 text-sm text-ink-55">{t.title}</span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {t.specialties.slice(0, 2).map((sp) => (
                        <Chip key={sp}>{sp}</Chip>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

/* ── 03 Time ──────────────────────────────────────────────────────────── */

function TimeStep({
  service,
  therapist,
  timezone,
  selected,
  onPick,
  onBack,
}: {
  service: ServiceRow;
  therapist: TherapistRow;
  timezone: string;
  selected: string | null;
  onPick: (s: Slot) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeading
        step="Step 03"
        title="When suits you?"
        lead={`${formatDuration(service.duration_min)} with ${therapist.display_name}.`}
      />

      <BookingCalendar
        therapistId={therapist.id}
        serviceId={service.id}
        timezone={timezone}
        selected={selected}
        onPick={onPick}
      />

      <div className="mt-10">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

/* ── 04 Details + confirm ─────────────────────────────────────────────── */

function DetailsStep({
  service,
  therapist,
  slotStart,
  timezone,
  prefill,
  onBack,
  onConflict,
}: {
  service: ServiceRow;
  therapist: TherapistRow;
  slotStart: string;
  timezone: string;
  prefill: { fullName: string; email: string; phone: string } | null;
  onBack: () => void;
  onConflict: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string } | null>(null);

  const modalities = service.modalities as SessionModality[];
  const [modality, setModality] = useState<SessionModality>(
    modalities[0] ?? "video",
  );

  if (done) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-pill bg-signal text-ink">
            <CheckIcon className="h-5 w-5" />
          </span>
          <p className="eyebrow text-ink-55">Booked</p>
        </div>
        <h1 className="mt-6 text-d2">{BOOKING_COPY.success}</h1>
        <dl className="mt-10 flex flex-col">
          <Row label="Reference" value={done.reference} />
          <Row label="Service" value={service.name} />
          <Row label="With" value={therapist.display_name} />
          <Row label="When" value={formatSlotFull(slotStart, timezone)} />
          <Row label="How" value={MODALITY_LABEL[modality] ?? modality} />
        </dl>
        <p className="mt-8 text-ink-70">
          Keep the reference above. You can move or cancel the session by
          replying to the confirmation email, or by contacting us with it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" arrow>
            Back to the site
          </ButtonLink>
          <ButtonLink href="/journal" variant="ghost">
            Read the journal
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-ink-55">
          {BOOKING_COPY.cancellationPolicy}
        </p>
      </div>
    );
  }

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createBooking({
        serviceId: service.id,
        therapistId: therapist.id,
        startsAt: new Date(slotStart).toISOString(),
        modality,
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        note: String(formData.get("note") ?? ""),
        timezone,
        consentNotEmergency: formData.get("consentNotEmergency") === "on",
        consentTerms: formData.get("consentTerms") === "on",
      });

      if (res.ok) {
        setDone({ reference: res.reference });
        return;
      }
      if (res.code === "conflict") {
        setError(BOOKING_COPY.conflict);
        onConflict();
        return;
      }
      setError(res.error);
    });
  };

  return (
    <div>
      <StepHeading step="Step 04" title="A few details, then you are done." />

      {/* Summary */}
      <dl className="mb-10 rounded-lg border border-ink-12 p-6">
        <Row label="Service" value={service.name} />
        <Row label="With" value={therapist.display_name} />
        <Row label="When" value={formatSlotFull(slotStart, timezone)} />
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          <span className="eyebrow text-ink-55">Fee</span>
          <PriceTag
            cents={service.price_cents}
            currency={service.currency}
            size="sm"
            freeLabel="No cost"
          />
        </div>
      </dl>

      <form action={submit} className="flex flex-col gap-6">
        <Field label="Full name" name="fullName" required defaultValue={prefill?.fullName} />
        <Field label="Email" name="email" type="email" required defaultValue={prefill?.email} />
        <Field label="Phone (optional)" name="phone" type="tel" defaultValue={prefill?.phone} />

        <fieldset>
          <legend className="text-sm font-medium text-ink">How would you like to meet?</legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {modalities.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onClick={() => setModality(m)}
                  aria-pressed={modality === m}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-sm transition-colors duration-fast",
                    modality === m
                      ? "border-ink bg-ink text-page"
                      : "border-ink-12 text-ink-70 hover:border-ink-40",
                  )}
                >
                  {MODALITY_LABEL[m] ?? m}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <div>
          <label htmlFor="note" className="text-sm font-medium text-ink">
            Anything you would like your therapist to know? (optional)
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            maxLength={500}
            className="mt-2 w-full rounded-md border border-ink-12 bg-paper px-4 py-3 text-ink placeholder:text-ink-40 focus:border-ink-40"
            placeholder="A sentence is plenty. You do not have to explain anything yet."
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-ink-12 pt-6">
          <Consent name="consentNotEmergency" required>
            {BOOKING_COPY.consents.notEmergency}
          </Consent>
          <Consent name="consentTerms" required>
            {BOOKING_COPY.consents.terms}
          </Consent>
          <Consent name="marketingOptIn">
            {BOOKING_COPY.consents.marketing}
          </Consent>
        </div>

        <p className="text-sm text-ink-55">{SAFETY_NOTICE_LONG}</p>

        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" arrow disabled={pending}>
            {pending ? BOOKING_COPY.holding : "Confirm booking"}
          </Button>
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ── Small pieces ─────────────────────────────────────────────────────── */

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-4 py-3",
        !last && "border-b border-ink-12",
      )}
    >
      <dt className="eyebrow text-ink-55">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-ink-12 bg-paper px-4 py-3 text-ink placeholder:text-ink-40 focus:border-ink-40"
      />
    </div>
  );
}

function Consent({
  name,
  required = false,
  children,
}: {
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink-70">
      <input
        type="checkbox"
        name={name}
        required={required}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-signal)]"
      />
      <span>{children}</span>
    </label>
  );
}
