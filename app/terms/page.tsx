// ponytail: placeholder legal copy, have it reviewed before launch
const sections: [string, string][] = [
  ["Who we are", "Gust Academy is a private academy. Contact: gustacademy@gmail.com, +373 60 000 154."],
  ["Data we collect", "Through the contact form we collect your first name, last name, email address and, optionally, phone number."],
  ["Why we collect it", "We use your data only to respond to your enquiry and to contact you about Gust Academy courses. We do not sell or share it with third parties."],
  ["Where it is stored", "Submissions are stored in a Google Sheet accessible only to Gust Academy staff."],
  ["Your rights", "You may ask us at any time to access, correct or delete your data, or withdraw your consent, by writing to gustacademy@gmail.com."],
  ["Use of this website", "The content of this website belongs to Gust Academy and may not be reproduced without permission. Course information may change without notice."],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#980001] px-6 pb-16 pt-32 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="font-display text-5xl">Terms &amp; Conditions</h1>
        {sections.map(([title, body]) => (
          <section key={title}>
            <h2 className="font-mono text-sm uppercase tracking-widest">{title}</h2>
            <p className="mt-1 font-mono text-sm leading-6 text-white/80">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
