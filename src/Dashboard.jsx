import { useEffect, useState } from 'react'
import './Dashboard.css'
import gamingBackground from './assets/backgrounds/wallpaper_minecraft_update_aquatic_1920x1080.png'
import customPricingBackground from './assets/backgrounds/wallpaper_minecraft_village_pillage_1920x1080.png'
import axiomSymbol from './assets/brand/axiom-symbol.png'
import axiomHostingWordmark from './assets/brand/axiom-hosting-wordmark.png'
import minecraftSteveFace from './assets/brand/minecraft-steve-face.svg'
import { getBundleDiscount, hostingPlans } from './plans.js'

const serviceCatalog = [
  ...hostingPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    icon: plan.icon,
    featured: plan.featured,
    playerGuide: plan.playerGuide,
    description: plan.description,
    tags: [`${plan.ram} GB RAM`, `${plan.cpu} CPU ${plan.cpu === 1 ? 'thread' : 'threads'}`, `${plan.storage} GB NVMe`],
  })),
  { id: 'minecraft-dragon', name: 'Custom', description: 'Build a Minecraft server around your own resource requirements.', tags: ['Custom resources', 'Build your own'], custom: true },
]

const serviceDetails = {
  ...Object.fromEntries(hostingPlans.map((plan) => [plan.id, {
    name: `${plan.name} Plan`,
    description: plan.description,
    baseMonthly: plan.monthlyPrice,
    normalValue: getBundleDiscount(plan).normalValue,
    bundleDiscount: getBundleDiscount(plan).dollars,
    bundleDiscountPercentage: getBundleDiscount(plan).percentage,
    defaults: { ram: plan.ram, cpu: plan.cpu, ssd: plan.storage, ipv4: plan.ipv4 },
    gameVersions: ['Latest stable', '1.21.x', '1.20.x', 'Custom version'],
  }])),
  'minecraft-dragon': {
    name: 'Dragon Custom',
    description: 'Build a custom Minecraft server for your exact requirements.',
    baseMonthly: 5,
    custom: true,
    defaults: { ram: 4, cpu: 2, ssd: 40, ipv4: 1 },
    gameVersions: ['Latest stable', '1.21.x', '1.20.x', 'Custom version'],
  },
  'minecraft-hosting': {
    name: 'Wolf Plan',
    description: 'A balanced Minecraft package for a small group.',
    baseMonthly: 9,
    normalValue: 10.5,
    bundleDiscount: 1.5,
    bundleDiscountPercentage: 14.2857,
    defaults: { ram: 4, cpu: 2, ssd: 30, ipv4: 1 },
    gameVersions: ['Latest stable', '1.21.x', '1.20.x', 'Custom version'],
  },
}

const configurationOptions = {
  cycles: [
    { id: 'weekly', label: 'Weekly', months: 12 / 52, discount: 0 },
    { id: 'monthly', label: 'Monthly', months: 1, discount: 0 },
    { id: 'quarterly', label: 'Quarterly', months: 3, discount: 0.07 },
    { id: 'yearly', label: 'Yearly', months: 12, discount: 0.15 },
  ],
  locations: ['Ashburn', 'US East', 'US West', 'Europe West'],
}

const billingRecords = []
const defaultOwnedServices = []

function readOwnedServices() {
  if (typeof localStorage === 'undefined') return defaultOwnedServices
  try {
    const stored = JSON.parse(localStorage.getItem('axiom_owned_services') || '[]')
    return Array.isArray(stored) ? stored : defaultOwnedServices
  } catch {
    return defaultOwnedServices
  }
}

function readCartCookie() {
  const value = document.cookie.split('; ').find((entry) => entry.startsWith('axiom_cart='))?.split('=').slice(1).join('=')
  if (!value) return []
  try {
    const parsed = JSON.parse(decodeURIComponent(value))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCartCookie(cart) {
  document.cookie = `axiom_cart=${encodeURIComponent(JSON.stringify(cart))}; Max-Age=2592000; Path=/; SameSite=Lax`
}

function DashboardIcon({ name }) {
  const paths = {
    home: <><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5V16l-8 5-8-5V7.5Z" /><path d="M12 12v9" /></>,
    services: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 10h16M4 15h16M8 7h.01M8 12.5h.01M8 17.5h.01" /></>,
    domains: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14.2 14.2 0 0 1 0 18M12 3a14.2 14.2 0 0 0 0 18" /></>,
    billing: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
    support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13a2 2 0 0 0 2 2h1v-4H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-4h1a2 2 0 0 1 2 2Z" /><path d="M17 15v1a3 3 0 0 1-3 3h-2" /></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></>,
    collapse: <><path d="m14 7-5 5 5 5" /><path d="M20 4v16" /></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M9 4v16" /></>,
    account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" /></>,
    cart: <><path d="M3 4h2l2.2 10h9.9l2-7H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
    console: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M12 15h5" /></>,
    news: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function DragonHeadIcon() {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 9 5-5 3 4 3-4 5 5-2 4 3 4-4 10H11L7 17l3-4Z" /><path d="M11 13h3M18 13h3M12 20h8M10 9l-4-3M22 9l4-3" /></svg>
}

function PackageMobIcon({ name }) {
  const icons = {
    bee: <><path d="M7 8h10v8H7zM9 8V6h6v2M9 10h6M9 14h6" /><path d="M7 10 4 8v5l3 1M17 10l3-2v5l-3 1" /></>,
    wolf: <><path d="m7 8 2-3 3 2 3-2 2 3v8l-5 3-5-3Z" /><path d="M9 12h.01M15 12h.01M10 15h4" /></>,
    spider: <><circle cx="12" cy="12" r="4" /><path d="M8.5 10 5 7M8 12H3M8.5 14 5 17M15.5 10 19 7M16 12h5M15.5 14l3.5 3" /><path d="M11 11h.01M13 11h.01" /></>,
    blaze: <><path d="M9 5h6v7H9zM8 15h8M6 9H4M20 9h-2M7 19l2-3M17 19l-2-3" /><path d="M11 8h.01M13 8h.01" /></>,
    slime: <><rect x="5" y="6" width="14" height="13" rx="3" /><path d="M8 12h2M14 12h2M9 16h6" /></>,
    wither: <><path d="M4 8h5v5H4zM10 6h5v7h-5zM16 8h5v5h-5zM7 13h10v4H7zM9 17v3M15 17v3" /><path d="M6 10h.01M12 9h.01M18 10h.01" /></>,
    guardian: <><path d="m4 12 4-6h8l4 6-4 6H8Z" /><path d="M9 10h6v4H9zM4 12H2M22 12h-2M7 7 5 4M17 7l2-3M7 17l-2 3M17 17l2 3" /></>,
    'iron-golem': <><path d="M8 4h8v6h3v8h-3v3H8v-3H5v-8h3Z" /><path d="M10 7h1M13 7h1M10 14h4M8 18h8" /></>,
    warden: <><path d="M7 7h10v11H7zM7 9 4 6v6M17 9l3-3v6M10 11h.01M14 11h.01M10 15h4" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function PageHeader({ title, copy, centered = false }) {
  return (
    <header className={`dashboard-page-header${centered ? ' is-centered' : ''}`}>
      <h1>{title}</h1>
      {copy && <p>{copy}</p>}
    </header>
  )
}

function HomePage({ ownedServices = defaultOwnedServices }) {
  const panelUrl = import.meta.env.VITE_PTERODACTYL_PANEL_URL

  if (!ownedServices.length) {
    return (
      <section className="server-overview server-overview--empty">
        <div className="server-empty-simple">
          <h2>No servers yet</h2>
          <p>You do not have a Minecraft server on this account yet.</p>
          <div><a href="/packages">Buy a server</a><a href="/documents">View documents</a></div>
        </div>
      </section>
    )
  }

  const gridSize = ownedServices.length === 1 ? 'one' : ownedServices.length === 2 ? 'two' : 'many'

  return (
    <section className="server-overview">
      <div className={`owned-server-grid owned-server-grid--${gridSize}`}>
        {ownedServices.map((server) => (
          <article className="owned-server-card" key={server.id}>
            <div className="dashboard-card-icon"><DashboardIcon name="services" /></div>
            <div>
              <span>{server.status ?? 'Server'}</span>
              <h2>{server.name}</h2>
              <p>{server.description ?? 'Connected to your Axiom Hosting account.'}</p>
            </div>
            {server.panelUrl || panelUrl
              ? <a href={server.panelUrl || panelUrl}>Open console</a>
              : <button type="button" disabled>Console not connected</button>}
          </article>
        ))}
      </div>
    </section>
  )
}

function ServerWorkspacePage({ server, tab }) {
  const labels = { console: 'Console', files: 'Files', backups: 'Backups', settings: 'Settings' }
  const descriptions = {
    console: 'View live server output and run commands.',
    files: 'Browse and manage the files for this Minecraft server.',
    backups: 'Create, download, and restore server backups.',
    settings: 'Manage versions, startup options, networking, and server details.',
  }
  return (
    <section className="server-workspace-page">
      <PageHeader title={labels[tab]} copy={`${server.name} · ${descriptions[tab]}`} />
      <div className={`server-workspace-panel server-workspace-panel--${tab}`}>
        <span>{server.name}</span>
        <h2>{labels[tab]}</h2>
        <p>{descriptions[tab]}</p>
      </div>
    </section>
  )
}

function ServicesPage() {
  return (
    <>
      <PageHeader title="Packages" centered />
      <div className="package-grid">
        {serviceCatalog.map((service) => {
          const details = serviceDetails[service.id]
          if (service.custom) {
            return (
              <article className="package-card is-custom" key={service.id}>
                <div className="package-custom-heading"><div className="package-icon" aria-hidden="true"><DragonHeadIcon /></div><div className="package-name"><h2>Dragon Custom</h2><span>Build a server around your own needs</span></div></div>
                <ul className="package-features"><li>Choose RAM and CPU threads</li><li>Choose NVMe storage</li><li>Select a region and Minecraft version</li></ul>
                <a href={`/packages/configure/${service.id}`}>Customize server <span aria-hidden="true">→</span></a>
              </article>
            )
          }
          return <article className={`package-card${service.featured ? ' is-featured' : ''}`} key={service.id}>{service.featured && <span className="package-popular">Most popular</span>}<div className="package-icon" aria-hidden="true"><PackageMobIcon name={service.icon} /></div><div className="package-name"><h2>{service.name}</h2><span>24/7 always online</span></div><p className="package-price"><strong>${details.baseMonthly.toFixed(2)}</strong><small>/month</small></p><div className="package-divider" /><ul className="package-features"><li>{details.defaults.ram} GB RAM</li><li>{details.defaults.cpu} CPU threads</li><li>{details.defaults.ssd} GB NVMe storage</li><li>Ideal for up to {service.playerGuide} players</li></ul><div className="package-value"><span>${details.normalValue.toFixed(2)} normal value</span><strong>Save ${details.bundleDiscount.toFixed(2)} · {Math.round(details.bundleDiscountPercentage)}%</strong></div><a href={`/packages/configure/${service.id}`}>Select {service.name} <span aria-hidden="true">→</span></a></article>
        })}
      </div>
    </>
  )
}

function GamingServicesPage() {
  return <ServicesPage />
}

function BusinessServicesPage() {
  return <ServicesPage />
}

function ResourceRange({ label, value, min, max, step, suffix, ticks, onChange, allowCustomAbove = false }) {
  const progress = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  const commitValue = (input) => {
    const parsed = Number(input.value)
    if (!Number.isFinite(parsed)) {
      input.value = String(value)
      return
    }
    const clamped = allowCustomAbove ? Math.max(min, parsed) : Math.min(max, Math.max(min, parsed))
    const snapped = allowCustomAbove && clamped > max ? Math.round(clamped) : min + Math.round((clamped - min) / step) * step
    onChange(snapped)
    input.value = String(snapped)
  }

  return (
    <div className="resource-range">
      <span className="resource-range-heading">
        <strong>{label}</strong>
        <label className="resource-range-value">
          <span className="visually-hidden">Set {label}</span>
          <input
            key={value}
            type="number"
            min={min}
            max={allowCustomAbove ? undefined : max}
            step={step}
            defaultValue={value}
            style={{ width: `${Math.max(String(value).length, 1) + 0.35}ch` }}
            onInput={(event) => { event.currentTarget.style.width = `${Math.max(event.currentTarget.value.length, 1) + 0.35}ch` }}
            onFocus={(event) => event.target.select()}
            onBlur={(event) => commitValue(event.currentTarget)}
            onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
          />
          {suffix && <span>{suffix.trim()}</span>}
        </label>
      </span>
      <div className="resource-range-control" style={{ '--range-progress': `${progress}%` }}>
        <div className="resource-range-track" aria-hidden="true"><span className="resource-range-fill" /><span className="resource-range-thumb" /></div>
        <input className="resource-range-input" aria-label={label} type="range" min={min} max={max} step={step} value={Math.min(value, max)} onChange={(event) => onChange(Number(event.target.value))} />
        <div className="resource-range-ticks">{ticks.map((tick) => <button type="button" aria-label={`Set ${label} to ${tick}${suffix}`} key={tick} style={{ left: `${((tick - min) / (max - min)) * 100}%` }} onClick={() => onChange(tick)} />)}</div>
      </div>
      <span className="resource-range-limits"><small>{min}{suffix}</small><small>{max}{suffix}{allowCustomAbove ? ' slider · type more above' : ''}</small></span>
    </div>
  )
}

function ServiceConfigurationPage({ serviceId, addToCart }) {
  const service = serviceDetails[serviceId]
  const [configuration, setConfiguration] = useState(() => ({
    cycle: 'monthly',
    ram: service?.defaults?.ram ?? 4,
    cpu: service?.defaults?.cpu ?? 2,
    ssd: service?.defaults?.ssd ?? 40,
    ipv4: service?.defaults?.ipv4 ?? 1,
    location: configurationOptions.locations[0],
    gameVersion: service?.gameVersions?.[0] ?? '',
  }))
  if (!service) return <ServicesPage />

  const selectedCycle = configurationOptions.cycles.find((cycle) => cycle.id === configuration.cycle)
  const resourcePrice = service.custom ? ((configuration.ram - 2) * 1) + ((configuration.cpu - 1) * 2.5) + (Math.max(0, configuration.ssd - 10) / 100 * 5) + ((configuration.ipv4 - 1) * 2.5) : 0
  const monthlyPrice = service.baseMonthly + resourcePrice
  const discountedMonthlyPrice = monthlyPrice * (1 - selectedCycle.discount)
  const totalPrice = discountedMonthlyPrice * selectedCycle.months
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice)
  const heroImage = service.custom ? customPricingBackground : gamingBackground

  const updateConfiguration = (name, value) => setConfiguration((current) => ({ ...current, [name]: value }))

  const submitConfiguration = (event) => {
    event.preventDefault()
    const resources = service.custom ? configuration : service.defaults
    const summary = [`${resources.ram} GB RAM`, `${resources.cpu} CPU threads`, `${resources.ssd} GB NVMe`, `${resources.ipv4} IPv4`, configuration.location, configuration.gameVersion].filter(Boolean).join(' · ')
    addToCart({ id: `${serviceId}-${configuration.cycle}-${summary}`, name: service.name, description: summary, billingCycle: selectedCycle.label, price: formattedPrice, type: 'Hosting package' })
  }

  return (
    <>
      <section className={`configuration-hero${service.custom ? ' is-custom' : ''}`} style={{ '--configuration-hero-image': `url(${heroImage})` }}>
        <div>
          {service.custom && <span className="configuration-hero-kicker">Custom Minecraft hosting</span>}
          <h1>{service.custom ? <>Build your <span>server.</span></> : service.name}</h1>
          <p>{service.description}</p>
        </div>
      </section>
      <form className="service-configurator" onSubmit={submitConfiguration}>
        <div className="service-configurator-controls">
          <div className="configurator-heading"><div className="dashboard-card-icon"><DashboardIcon name="services" /></div><h2>{service.custom ? 'Custom Configuration' : 'Your package'}</h2></div>
          {!service.custom && <article className="selected-package-card">
            <div><span>Selected package</span><h3>{service.name}</h3><p>{service.description}</p></div>
            <dl><div><dt>RAM</dt><dd>{service.defaults.ram} GB</dd></div><div><dt>CPU</dt><dd>{service.defaults.cpu} threads</dd></div><div><dt>Storage</dt><dd>{service.defaults.ssd} GB NVMe</dd></div></dl>
            <div className="selected-package-value"><span>Normal resource value <strong>${service.normalValue.toFixed(2)}</strong></span><span>Bundle discount <strong>${service.bundleDiscount.toFixed(2)} · {Math.round(service.bundleDiscountPercentage)}%</strong></span></div>
          </article>}
          <fieldset className="billing-cycle"><legend>Billing cycle</legend><div>{configurationOptions.cycles.map((cycle) => <button className={configuration.cycle === cycle.id ? 'is-selected' : ''} type="button" key={cycle.id} onClick={() => updateConfiguration('cycle', cycle.id)}><span>{cycle.label}</span>{cycle.discount > 0 && <small>{Math.round(cycle.discount * 100)}% off</small>}</button>)}</div></fieldset>
          {service.custom && <div className="resource-ranges"><ResourceRange label="CPU threads" value={configuration.cpu} min={1} max={16} step={1} suffix="" ticks={Array.from({ length: 16 }, (_, index) => index + 1)} onChange={(value) => updateConfiguration('cpu', value)} /><ResourceRange label="RAM" value={configuration.ram} min={2} max={64} step={2} suffix=" GB" ticks={[2, 8, 16, 24, 32, 40, 48, 56, 64]} onChange={(value) => updateConfiguration('ram', value)} /><ResourceRange label="NVMe storage" value={configuration.ssd} min={10} max={400} step={10} suffix=" GB" ticks={[10, 50, 100, 150, 200, 250, 300, 350, 400]} allowCustomAbove onChange={(value) => updateConfiguration('ssd', value)} /></div>}
          <section className="deployment-options" aria-labelledby="deployment-options-title">
            <div className="deployment-options-heading"><span>Deployment</span><h3 id="deployment-options-title">Choose where it runs</h3></div>
            <fieldset><legend>Location</legend><div className="deployment-option-grid">{configurationOptions.locations.map((location) => <button className={configuration.location === location ? 'is-selected' : ''} type="button" key={location} onClick={() => updateConfiguration('location', location)}>{location}</button>)}</div></fieldset>
          </section>
          {service.gameVersions && <div className="service-configurator-fields"><label>Game version<select value={configuration.gameVersion} onChange={(event) => updateConfiguration('gameVersion', event.target.value)}>{service.gameVersions.map((version) => <option key={version}>{version}</option>)}</select></label></div>}
        </div>
        <aside className="configuration-summary" aria-live="polite">
          <span>Price</span><div className="configuration-price"><strong>{formattedPrice}</strong><small>/ {selectedCycle.label.toLowerCase()}</small></div>
          {selectedCycle.discount > 0 && <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discountedMonthlyPrice)} per month · {Math.round(selectedCycle.discount * 100)}% off</p>}
          <dl>
            <div><dt>Package</dt><dd>{service.name}</dd></div><div><dt>RAM</dt><dd>{service.custom ? configuration.ram : service.defaults.ram} GB</dd></div><div><dt>CPU</dt><dd>{service.custom ? configuration.cpu : service.defaults.cpu} threads</dd></div><div><dt>Storage</dt><dd>{service.custom ? configuration.ssd : service.defaults.ssd} GB NVMe</dd></div><div><dt>IPv4</dt><dd>{service.custom ? configuration.ipv4 : service.defaults.ipv4}</dd></div>{!service.custom && <><div><dt>Normal value</dt><dd>${service.normalValue.toFixed(2)}</dd></div><div><dt>Bundle discount</dt><dd>${service.bundleDiscount.toFixed(2)} · {Math.round(service.bundleDiscountPercentage)}%</dd></div></>}<div><dt>Location</dt><dd>{configuration.location}</dd></div>{configuration.gameVersion && <div><dt>Minecraft version</dt><dd>{configuration.gameVersion}</dd></div>}<div><dt>Billing</dt><dd>{selectedCycle.label}{selectedCycle.discount > 0 ? ` · ${Math.round(selectedCycle.discount * 100)}% off` : ''}</dd></div>
          </dl>
          <button type="submit">Add package to cart</button>
        </aside>
      </form>

      <section className="configuration-faq" aria-labelledby="configuration-faq-title">
        <div className="configuration-section-heading">
          <span>Questions and answers</span>
          <h2 id="configuration-faq-title">Before you order</h2>
        </div>
        <div className="configuration-faq-list">
          <details>
            <summary>What can I choose?</summary>
            <p>The four standard packages have fixed resources. The Dragon Custom package lets you build a custom server. Every package includes billing-cycle, version, and location choices.</p>
          </details>
          <details>
            <summary>Which location should I choose?</summary>
            <p>Choose the location closest to the people who will use the server. A shorter distance usually provides lower latency.</p>
          </details>
          <details>
            <summary>Can I ask about a package before ordering?</summary>
            <p>Yes. Send the support team your intended player count and modpack details, and they can help you choose a package.</p>
          </details>
          <details>
            <summary>How do the billing discounts work?</summary>
            <p>Quarterly billing includes 7% off and yearly billing includes 15% off. The price panel updates as you change the billing cycle.</p>
          </details>
        </div>
      </section>

      <section className="configuration-support" aria-labelledby="configuration-support-title">
        <div><span>Need support?</span><h2 id="configuration-support-title">Talk to the team before you order.</h2></div>
        <a href="/support">Create a support ticket <span aria-hidden="true">→</span></a>
      </section>
    </>
  )
}

function BillingPage() {
  return (
    <section className="billing-table-wrap">
      {billingRecords.length ? <table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
        <tbody>{billingRecords.map((record) => <tr key={record.id}><td>{record.date}</td><td>{record.description}</td><td>{record.amount}</td><td>{record.status}</td><td><a href={record.receiptUrl}>PDF</a></td></tr>)}</tbody>
      </table> : <div className="dashboard-empty billing-empty"><h2>No billing yet.</h2><p>Would you like to purchase a Minecraft server?</p><a href="/packages">View available plans</a></div>}
    </section>
  )
}

function SupportPage() {
  const [status, setStatus] = useState('')
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
  const submitTicket = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (!supportEmail) { setStatus('The support email has not been configured yet.'); return }
    const subject = encodeURIComponent(`[Support] ${data.get('subject')}`)
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`)
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
  }
  return (
    <form className="ticket-form" onSubmit={submitTicket}>
      <label>Name<input name="name" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label className="ticket-wide">Subject<input name="subject" required /></label>
      <label className="ticket-wide">Message<textarea name="message" rows="7" required /></label>
      <button type="submit">Create ticket</button>
      {status && <p className="dashboard-form-message" aria-live="polite">{status}</p>}
    </form>
  )
}

function CheckoutPage({ cart, removeFromCart }) {
  return (
    <>
      <PageHeader title="Finish your order" copy="Review your selections before continuing to secure checkout." />
      <section className="checkout-panel">
        {cart.length ? cart.map((item) => <div key={item.id}><span><strong>{item.name}</strong><small>{item.billingCycle ? `${item.billingCycle} · ${item.description}` : item.type}</small></span><span>{item.price ?? 'Price confirmed at checkout'}</span><button type="button" onClick={() => removeFromCart(item.id)}>Remove</button></div>) : <div className="dashboard-empty"><p>Your cart is empty.</p></div>}
        <button className="checkout-continue" type="button" disabled>Secure checkout not connected</button>
      </section>
    </>
  )
}

function CartDrawer({ cart, open, setOpen, removeFromCart }) {
  if (!cart.length) return null

  return (
    <>
      <button className="cart-fab" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label="Open cart"><DashboardIcon name="cart" /><span>{cart.length}</span></button>
      <aside className={`cart-drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="cart-drawer-header"><div><span>Your order</span><h2>Cart</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></div>
        <div className="cart-items">{cart.map((item) => <div key={item.id}><span><strong>{item.name}</strong><small>{item.price ? `${item.price} · ${item.billingCycle}` : item.type}</small></span><button type="button" onClick={() => removeFromCart(item.id)}>Remove</button></div>)}</div>
        <a href="/packages/checkout">Finish order</a>
      </aside>
    </>
  )
}

export function PublicStore({ pathname, footer }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState(readCartCookie)

  useEffect(() => { writeCartCookie(cart) }, [cart])
  const addToCart = (item) => {
    setCart((current) => current.some((entry) => entry.id === item.id) ? current : [...current, item])
    setCartOpen(true)
  }
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.id !== id))
  const page = pathname.replace(/^\/(services|packages)\/?/, '') || 'services'
  const configuredServiceId = page.startsWith('configure/') ? page.split('/').at(-1) : null
  const pages = {
    services: <ServicesPage />,
    gaming: <GamingServicesPage />,
    business: <BusinessServicesPage />,
    checkout: <CheckoutPage cart={cart} removeFromCart={removeFromCart} />,
  }

  return (
    <div className="public-store-shell">
      <main className="public-store-main">{configuredServiceId ? <ServiceConfigurationPage serviceId={configuredServiceId} addToCart={addToCart} /> : (pages[page] ?? <ServicesPage />)}</main>
      {configuredServiceId && footer}
      <CartDrawer cart={cart} open={cartOpen} setOpen={setCartOpen} removeFromCart={removeFromCart} />
    </div>
  )
}

export default function Dashboard({ pathname }) {
  const [ownedServices] = useState(readOwnedServices)
  const page = pathname.replace(/^\/dashboard\/?/, '') || 'home'
  const serverRoute = page.match(/^server\/([^/]+)\/(console|files|backups|settings)$/)
  const activeServer = serverRoute ? ownedServices.find((server) => String(server.id) === decodeURIComponent(serverRoute[1])) : null
  const activeServerTab = serverRoute?.[2]
  const accountName = localStorage.getItem('axiom_account_name') || import.meta.env.VITE_ACCOUNT_NAME || 'Account'
  const pages = {
    home: <HomePage ownedServices={ownedServices} />,
    billing: <BillingPage />,
    support: <SupportPage />,
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/" aria-label="Axiom Hosting website"><img className="dashboard-brand-wordmark" src={axiomHostingWordmark} alt="AxiomHosting" /><img className="dashboard-brand-symbol" src={axiomSymbol} alt="" /></a>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className={page === 'home' ? 'is-active' : ''} href="/dashboard"><span className="dashboard-nav-icon"><DashboardIcon name="home" /></span><span><strong>Servers</strong></span></a>
          <a href="/packages"><span className="dashboard-nav-icon"><DashboardIcon name="services" /></span><span><strong>Order a server</strong></span></a>
          <a className={page === 'billing' ? 'is-active' : ''} href="/dashboard/billing"><span className="dashboard-nav-icon"><DashboardIcon name="billing" /></span><span><strong>Billing</strong></span></a>
        </nav>

        {ownedServices.length > 0 && <nav className="dashboard-server-nav" aria-label="Your servers">
          {ownedServices.map((server) => {
            const serverPath = `/dashboard/server/${encodeURIComponent(server.id)}`
            const isCurrentServer = activeServer?.id === server.id
            return <details key={server.id} open={isCurrentServer}>
              <summary><span className="dashboard-nav-icon"><DashboardIcon name="services" /></span><span className="dashboard-server-copy"><strong>{server.name}</strong><small>{server.status ?? 'Minecraft server'}</small></span><span className="dashboard-server-chevron" aria-hidden="true">⌄</span></summary>
              <div className="dashboard-server-links">
                {['console', 'files', 'backups', 'settings'].map((tab) => <a className={isCurrentServer && activeServerTab === tab ? 'is-active' : ''} href={`${serverPath}/${tab}`} key={tab}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}
              </div>
            </details>
          })}
        </nav>}

        <div className="dashboard-sidebar-bottom">
          <a href="/support"><span className="dashboard-nav-icon"><DashboardIcon name="support" /></span><span><strong>Get support</strong></span></a>
          <a className="dashboard-logout" href="/"><span className="dashboard-nav-icon"><DashboardIcon name="logout" /></span><span><strong>Log out</strong></span></a>
        </div>
      </aside>
      <div className="dashboard-topbar">
        <button className="dashboard-profile-control" type="button" aria-label="Open account profile">
          <img className="dashboard-profile-avatar" src={minecraftSteveFace} alt="Minecraft character avatar" />
          <span className="dashboard-profile-copy"><strong>{accountName}</strong><small>Account</small></span>
        </button>
      </div>
      <main className="dashboard-main">{activeServer ? <ServerWorkspacePage server={activeServer} tab={activeServerTab} /> : (pages[page] ?? <HomePage ownedServices={ownedServices} />)}</main>
    </div>
  )
}
