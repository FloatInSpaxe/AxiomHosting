const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')

export function getAppPathname() {
  const { pathname } = window.location
  if (!basePath) return pathname
  if (pathname === basePath) return '/'
  return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname
}

export function siteHref(href) {
  if (!basePath || typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//') || href.startsWith(basePath)) return href
  return `${basePath}${href}`
}

export function installBasePathNavigation() {
  if (!basePath) return () => {}

  const handleClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return
    const anchor = event.target.closest?.('a[href]')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    const destination = siteHref(href)
    if (destination === href) return

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank') {
      anchor.setAttribute('href', destination)
      return
    }

    event.preventDefault()
    window.location.assign(destination)
  }

  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}
