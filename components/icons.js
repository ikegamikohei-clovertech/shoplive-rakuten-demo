// Small stroke-based icon set shared across screens (no emoji, per design doc).
function Svg({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BroadcastIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="14" r="2" fill="currentColor" stroke="none" />
      <path d="M8.2 10.2a5.4 5.4 0 0 1 7.6 0" />
      <path d="M5.5 7.5a9.2 9.2 0 0 1 13 0" />
    </Svg>
  );
}

export function StoreIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 9l1-5h14l1 5" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="9" y1="20" x2="9" y2="13" />
      <line x1="15" y1="20" x2="15" y2="13" />
    </Svg>
  );
}

export function AdminIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

export function PlusIcon(props) {
  return (
    <Svg {...props} strokeWidth="2.2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function SearchIcon(props) {
  return (
    <Svg {...props} strokeWidth="2.2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function ImageIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <polyline points="21 16 15 10 6 19" />
    </Svg>
  );
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </Svg>
  );
}

export function EyeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function HeartIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21c-4.5-3-9-6.5-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4.5-4.5 8-9 11z" />
    </Svg>
  );
}

export function ChatIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <polyline points="8 16 8 20 12 16" />
    </Svg>
  );
}

export function ClickIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5 3l6 15 2-6 6-2-14-7z" />
    </Svg>
  );
}

export function GripIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="icon" {...props}>
      <circle cx="9" cy="6" r="1.3" />
      <circle cx="15" cy="6" r="1.3" />
      <circle cx="9" cy="12" r="1.3" />
      <circle cx="15" cy="12" r="1.3" />
      <circle cx="9" cy="18" r="1.3" />
      <circle cx="15" cy="18" r="1.3" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <polyline points="4 7 20 7" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </Svg>
  );
}

export function CheckIcon(props) {
  return (
    <Svg {...props} strokeWidth="2.6">
      <polyline points="5 13 10 18 19 6" />
    </Svg>
  );
}

export function XIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
}

export function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="icon" {...props}>
      <polygon points="8 5 19 12 8 19" />
    </svg>
  );
}

export function StopIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </Svg>
  );
}

export function ExternalLinkIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <path d="M14 4h6v6" />
      <line x1="20" y1="4" x2="10" y2="14" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </Svg>
  );
}
