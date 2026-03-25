export default function SecuritySection() {
  return (
    <section className="py-24 px-6 md:px-12 relative section-surface-container-low">
      <div className="max-w-5xl mx-auto text-center">
        <span className="material-symbols-outlined text-6xl mb-8 inline-block text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>
          shield
        </span>
        <h2 className="text-4xl font-bold mb-6">Enterprise-Grade Privacy.</h2>
        <p className="text-xl max-w-2xl mx-auto mb-16 text-on-surface-variant">
          Your code is your competitive advantage. We ensure it never leaves your team&apos;s perimeter.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <h5 className="text-2xl font-bold">256-bit</h5>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">
              AES Encryption
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-2xl font-bold">SSO</h5>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">
              SAML & Google Auth
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-2xl font-bold">SOC2</h5>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">
              Compliant Infra
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-2xl font-bold">VPC</h5>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">
              Private Deployment
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
