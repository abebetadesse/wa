"use client";

export default function VoiceCaptureConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <section aria-labelledby="voice-consent-heading" className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-left">
      <h3 id="voice-consent-heading" className="text-sm font-semibold text-amber-100">
        Before you speak
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-amber-100/80">
        Your browser&apos;s speech recognition provider processes your voice to create a transcript. Depending on your browser, audio may be sent to that provider. This app does not record or store the audio; the transcript may be saved with your case. You can decline and type instead.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onAccept} className="rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400">
          Continue with voice
        </button>
        <button type="button" onClick={onDecline} className="rounded-md border border-white/20 px-3 py-2 text-xs text-white hover:bg-white/5">
          Type instead
        </button>
      </div>
    </section>
  );
}