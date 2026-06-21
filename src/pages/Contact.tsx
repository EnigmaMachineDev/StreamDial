export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl text-brand-bright mb-6">Contact</h1>

      <div className="space-y-6 text-sm leading-relaxed text-brand-muted">
        <p>
          Have a question, found a bug, or want to suggest a feature? Feel free to reach out.
        </p>

        <div className="bg-brand-panel border border-brand-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-brand-bright mb-1">Email</h2>
            <a
              href="mailto:EnigmaMachineDev@proton.me"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              EnigmaMachineDev@proton.me
            </a>
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-bright mb-1">GitHub</h2>
            <a
              href="https://github.com/EnigmaMachineDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              github.com/EnigmaMachineDev
            </a>
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-bright mb-1">Support</h2>
            <a
              href="https://buymeacoffee.com/EnigmaMachineDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Buy me a coffee
            </a>
          </div>
        </div>

        <p>
          For bug reports, please include your browser name and the channel URL you were trying to
          add so the issue can be reproduced.
        </p>
      </div>
    </div>
  )
}
