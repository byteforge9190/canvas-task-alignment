import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const Logo = (props: IconProps) => (
  <svg {...base(props)} width={20} height={20} viewBox="0 0 20 20" strokeWidth={1.6}>
    <rect x="2.5" y="2.5" width="15" height="15" rx="4" stroke="url(#logo-g)" />
    <rect x="6" y="6" width="5" height="5" rx="1" fill="#60a5fa" stroke="none" />
    <circle cx="12.5" cy="12.5" r="2.5" fill="#f472b6" stroke="none" />
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
  </svg>
)

export const Undo = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 5.5H3.5V3" />
    <path d="M3.6 5.4A5 5 0 1 1 3 9" />
  </svg>
)

export const Redo = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10 5.5h2.5V3" />
    <path d="M12.4 5.4A5 5 0 1 0 13 9" />
  </svg>
)

export const AlignLeft = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.5 2v12" />
    <rect x="4.5" y="4" width="9" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="4.5" y="9" width="5" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const AlignHCenter = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 2v12" />
    <rect x="3" y="4" width="10" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="5" y="9" width="6" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const AlignRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13.5 2v12" />
    <rect x="2.5" y="4" width="9" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="6.5" y="9" width="5" height="3" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const AlignTop = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 2.5h12" />
    <rect x="4" y="4.5" width="3" height="9" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="9" y="4.5" width="3" height="5" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const AlignVCenter = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 8h12" />
    <rect x="4" y="3" width="3" height="10" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="9" y="5" width="3" height="6" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const AlignBottom = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 13.5h12" />
    <rect x="4" y="2.5" width="3" height="9" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="9" y="6.5" width="3" height="5" rx="0.8" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const DistributeH = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 2.5v11M14 2.5v11" />
    <rect x="5" y="4.5" width="2.5" height="7" rx="0.7" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="8.5" y="4.5" width="2.5" height="7" rx="0.7" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const DistributeV = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.5 2h11M2.5 14h11" />
    <rect x="4.5" y="5" width="7" height="2.5" rx="0.7" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="4.5" y="8.5" width="7" height="2.5" rx="0.7" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
)

export const Pointer = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 2.5l9 4.5-4 1.2-1.6 3.8z" fill="currentColor" opacity="0.9" />
  </svg>
)

export const RectIcon = (props: IconProps) => (
  <svg {...base(props)} width={12} height={12}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
  </svg>
)

export const EllipseIcon = (props: IconProps) => (
  <svg {...base(props)} width={12} height={12}>
    <ellipse cx="8" cy="8" rx="5.5" ry="4.5" />
  </svg>
)
