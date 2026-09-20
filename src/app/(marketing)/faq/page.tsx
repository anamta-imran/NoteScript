import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about NoteScript.",
};

const faqs = [
  {
    question: "Is this ChatGPT with a notebook skin?",
    answer:
      "No. There is no generative model. Formatting is rule-based.",
  },
  {
    question: "Do I need a card for Free?",
    answer:
      "No. Checkout only starts when you choose Student or Pro.",
  },
  {
    question: "What happens at the free limit?",
    answer:
      "New generations are blocked until the period resets or you upgrade. Existing notes stay available.",
  },
];

export default function FaqPage() {
  return (
    <main className="bg-[#fcfbfe]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-170px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#eee7f8] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[#e5dced] bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#72558f] shadow-sm">
            FAQ
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[#292230] sm:text-5xl">
            Questions?
            <span className="block text-[#80639d]">
              We have answers.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#756d7d] sm:text-lg">
            A few things you might want to know before creating your first
            NoteScript note.
          </p>
        </div>
      </section>

      {/* FAQ cards */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="group rounded-[24px] border border-[#e9e3ef] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(62,39,82,0.08)] sm:p-8"
            >
              <div className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e9f8] text-sm font-bold text-[#72558f]">
                  0{index + 1}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#292230] sm:text-xl">
                    {faq.question}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[#756d7d] sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* More help */}
      <section className="border-t border-[#eee8f2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e9f8] text-xl text-[#72558f]">
            ?
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#292230]">
            Still curious?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[#756d7d]">
            Explore how NoteScript works, what it can do, and which plan fits
            your workflow.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl bg-[#80639d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(126,95,160,0.25)] transition hover:opacity-90"
            >
              How it works
            </a>

            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-[#ddd4e5] bg-white px-5 py-2.5 text-sm font-semibold text-[#4b4052] transition hover:bg-[#faf8fc]"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}