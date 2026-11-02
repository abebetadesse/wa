"use client";

export default function VoiceCaptureConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <section aria-labelledby="voice-consent-heading" className="rounded-lg border border-gold/30 bg-gold-soft p-4 text-left">
      <h3 id="voice-consent-heading" className="text-sm font-semibold text-gold-strong">
        Before you speak
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-gold-strong">
        Your browser&apos;s speech recognition provider processes your voice to create a transcript. Depending on your browser, audio may be sent to that provider. This app does not record or store the audio; the transcript may be saved with your case. You can decline and type instead.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onAccept} className="rounded-md bg-gold-fill px-3 py-2 text-xs font-semibold text-gold-foreground hover:bg-gold-fill">
          Continue with voice
        </button>
        <button type="button" onClick={onDecline} className="rounded-md border border-border-strong px-3 py-2 text-xs text-foreground hover:bg-foreground/5">
          Type instead
        </button>
      </div>
    </section>
  );
}