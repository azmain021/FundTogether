export default function RecoveryCodeNotice({ code }: { code: string }) {
  return (
    <section className="mt-5 rounded-xl border border-[#BDE8D9] bg-[#ECFDF5] p-4 text-sm text-[#102A43]">
      <h2 className="font-bold">Save your recovery code</h2>
      <p className="mt-2 leading-6">Keep it somewhere private. This code is shown once and can reset your password once.</p>
      <code className="mt-3 block w-fit select-all break-all rounded-lg bg-white p-2 font-mono text-sm text-[#047857]">{code}</code>
    </section>
  );
}
