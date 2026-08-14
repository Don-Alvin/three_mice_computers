import {
  BatteryCharging,
  Bluetooth,
  Cable,
  Cctv,
  Computer,
  Droplet,
  EthernetPort,
  Fan,
  HardDrive,
  Keyboard,
  Laptop,
  type LucideIcon,
  Monitor,
  Mouse,
  Network,
  Plug,
  Printer,
  Speaker,
  Usb,
} from 'lucide-react'
import { createElement } from 'react'

/**
 * Category glyphs, keyed by category slug. Unknown slugs fall back to the
 * generic computer icon, so adding a category in the admin never renders empty.
 *
 * Icons come from lucide-react (house convention). The stroke width is set
 * below rather than left at Lucide's default of 2, to keep the lighter weight
 * the approved prototype uses in the tile grid.
 */
const icons: Record<string, LucideIcon> = {
  laptops: Laptop,
  desktops: Computer,
  monitors: Monitor,
  printers: Printer,
  'flash-disks': Usb,
  'cctv-cameras': Cctv,
  'computer-hubs': Network,
  mouse: Mouse,
  keyboards: Keyboard,
  'multimedia-speakers': Speaker,
  'bluetooth-speakers': Bluetooth,
  'computer-blower': Fan,
  'toner-cartridges': Droplet,
  'hdmi-cables': Cable,
  'extension-cables': Plug,
  ups: BatteryCharging,
}

const resolve = (slug: string): LucideIcon => {
  if (icons[slug]) {
    return icons[slug]
  }

  // Hard disks of every flavour — external, internal, surveillance.
  if (slug.includes('hardisk') || slug.includes('harddisk')) {
    return HardDrive
  }

  // LAN cables, indoor and outdoor.
  if (slug.includes('lan-cable')) {
    return EthernetPort
  }

  return Computer
}

/**
 * `createElement` rather than `const Icon = resolve(slug)` + `<Icon />`: binding
 * a component to a local during render trips react-hooks/static-components,
 * which cannot tell a lookup from a freshly-defined component.
 */
export const CategoryIcon = ({ slug }: { slug: string }) =>
  createElement(resolve(slug), { size: 24, strokeWidth: 1.7, 'aria-hidden': true })
