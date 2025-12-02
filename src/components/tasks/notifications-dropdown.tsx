"use client"

import { useRef, useEffect } from "react"
import { TaskStatusIcon } from "@/components/icons/task-status-icons"
import type { TaskStatus } from "@/lib/api"
import type { Notification } from "@/types/tasks"
import { getStatusLabel, getStatusColorClass } from "@/utils/task-status"

type NotificationsDropdownProps = {
  notifications: Notification[]
  isOpen: boolean
  onToggle: () => void
  onMarkAsRead: (notificationId: string) => void
  onClearAll: () => void
}

export function NotificationsDropdown({
  notifications,
  isOpen,
  onToggle,
  onMarkAsRead,
  onClearAll,
}: NotificationsDropdownProps) {
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        onToggle()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onToggle])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative" ref={notificationsRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] bg-white text-xs font-medium text-[#121212] shadow-sm"
        onClick={onToggle}
      >
        <svg
          className="h-5 w-5 text-[#121212]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D23D3D] text-[8px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-96 rounded-md border bg-white py-2 text-xs shadow-lg">
          <div className="mb-1 flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold uppercase text-[#AAAAAA]">
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                className="text-[11px] font-medium text-[#64C882] hover:text-[#52b66c]"
                onClick={onClearAll}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto px-3">
            {notifications.length === 0 ? (
              <p className="text-[12px] text-[#666666]">No new notifications.</p>
            ) : (
              notifications.map((notification) => {
                const fromLabel = getStatusLabel(notification.fromStatus)
                const toLabel = getStatusLabel(notification.toStatus)
                const fromStatusForIcon =
                  notification.fromStatus === "completed"
                    ? "done"
                    : notification.fromStatus
                const toStatusForIcon =
                  notification.toStatus === "completed"
                    ? "done"
                    : notification.toStatus

                const fromStatusColorClass = getStatusColorClass(
                  notification.fromStatus,
                )
                const toStatusColorClass = getStatusColorClass(
                  notification.toStatus,
                )

                return (
                  <div
                    key={notification.id}
                    className={`cursor-pointer rounded-md px-3 py-3 text-[13px] transition-colors hover:bg-[#F0F0F0] ${
                      notification.read
                        ? "bg-white text-[#666666]"
                        : "bg-[#F7F9FD] text-[#121212]"
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                        {notification.userInitial}
                      </span>
                      <div className="space-y-1">
                        {notification.isApproval ? (
                          <>
                            <p className="text-[13px] leading-relaxed">
                              <span className="font-medium">
                                {notification.userName}
                              </span>{" "}
                              approved task{" "}
                              <span className="font-medium">
                                &quot;{notification.taskTitle}&quot;
                              </span>{" "}
                              and it passed review
                            </p>
                            {notification.reviewerName && (
                              <p className="text-[12px] text-[#666666]">
                                Reviewer:{" "}
                                <span className="font-medium text-[#121212]">
                                  {notification.reviewerName}
                                </span>
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-[13px] leading-relaxed">
                              <span className="font-medium">
                                {notification.userName}
                              </span>{" "}
                              changed task{" "}
                              <span className="font-medium">
                                &quot;{notification.taskTitle}&quot;
                              </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[12px]">
                              <span
                                className={`inline-flex items-center gap-1 ${fromStatusColorClass}`}
                              >
                                <TaskStatusIcon status={fromStatusForIcon as TaskStatus} />
                                <span>{fromLabel}</span>
                              </span>
                              <span className="text-[#AAAAAA]">→</span>
                              <span
                                className={`inline-flex items-center gap-1 ${toStatusColorClass}`}
                              >
                                <TaskStatusIcon status={toStatusForIcon as TaskStatus} />
                                <span>{toLabel}</span>
                              </span>
                            </div>
                            {notification.reviewerName && (
                              <p className="text-[12px] text-[#666666]">
                                Reviewer:{" "}
                                <span className="font-medium text-[#121212]">
                                  {notification.reviewerName}
                                </span>
                              </p>
                            )}
                          </>
                        )}
                        <p className="text-[10px] text-[#AAAAAA]">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

