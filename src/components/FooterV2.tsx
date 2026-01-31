import Link from 'next/link'

const footerLinks = {
  tools: [
    { name: 'Build Editor', href: '/build' },
    { name: 'Calculator', href: '/calculator' },
    { name: 'Crafting', href: '/craft' },
    { name: 'Market', href: '/market' },
    { name: 'PvP Tools', href: '/pvp' },
  ],
  data: [
    { name: 'Destiny Board', href: '/destiny-board' },
    { name: 'Materials', href: '/tools/materials' },
    { name: 'Black Market', href: '/tools/blackmarket' },
    { name: 'Flipper', href: '/tools/flipper' },
    { name: 'Islands', href: '/tools/islands' },
  ],
  resources: [
    { name: 'Guides', href: '/guides' },
    { name: 'Community Builds', href: '/builds/community' },
    { name: 'Roadmap', href: '/roadmap' },
  ],
  account: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Builds', href: '/builds/my' },
    { name: 'Sync Data', href: '/account/sync' },
    { name: 'Sign In', href: '/auth/login' },
  ],
}

export function FooterV2() {
  return (
    <footer className="border-t border-border-light bg-surface-light/50 dark:border-border dark:bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-xl text-accent">
              Albion Codex
            </Link>
            <p className="mt-2 text-sm text-muted-light dark:text-muted">
              All-in-one toolkit for Albion Online players
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text1-light dark:text-text1">
              Tools
            </h3>
            <ul className="space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-accent dark:text-muted dark:hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text1-light dark:text-text1">
              Data
            </h3>
            <ul className="space-y-2">
              {footerLinks.data.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-accent dark:text-muted dark:hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text1-light dark:text-text1">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-accent dark:text-muted dark:hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text1-light dark:text-text1">
              Account
            </h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-accent dark:text-muted dark:hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border-light pt-6 dark:border-border">
          <p className="text-center text-xs text-muted-light dark:text-muted">
            Icons © Sandbox Interactive, used under CC-BY-SA · Albion Codex is a fan project (2026)
          </p>
        </div>
      </div>
    </footer>
  )
}
