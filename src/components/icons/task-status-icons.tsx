import type { TaskStatus } from "@/lib/api"

type Props = {
  status: TaskStatus
}

export function TaskStatusIcon({ status }: Props) {
  const common = "h-4 w-4"

  switch (status) {
    case "todo":
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    case "in_progress":
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <path
            d="M3 8a5 5 0 0 1 8.66-3.54"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 8a5 5 0 0 1-8.66 3.54"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10.5 2.5H13v2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 11V8.5h2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "review":
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <path
            d="M2 8s2.2-3.5 6-3.5S14 8 14 8s-2.2 3.5-6 3.5S2 8 2 8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="8"
            cy="8"
            r="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    case "blocked":
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="5"
            y1="5"
            x2="11"
            y2="11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case "rejected":
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <path
            d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "done":
    default:
      return (
        <svg viewBox="0 0 16 16" className={common} aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M5.5 8.25 7.25 10 10.5 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}


