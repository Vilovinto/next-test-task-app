"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

type ProfileSidebarProps = {
  profileCompletion: number
  profileImage: string | null
  savedUsername: string
  nameInitials: string
  firstNameDefault?: string
  lastNameDefault?: string
  displayName?: string | null
  email?: string | null
  onLogout: () => void
}

export function ProfileSidebar({
  profileCompletion,
  profileImage,
  savedUsername,
  nameInitials,
  firstNameDefault,
  lastNameDefault,
  displayName,
  email,
  onLogout,
}: ProfileSidebarProps) {
  return (
    <aside className="hidden h-full w-[312px] flex-col border-l border-[#F5F6FA] bg-white px-6 py-8 shadow-sm lg:flex">
      <div>
        <h2 className="text-[20px] font-medium leading-[30px] text-[#121212]">
          My Profile
        </h2>
        <p className="mt-1 text-[14px] leading-[21px] text-[#64C882]">
          {profileCompletion}% completed
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="relative h-[100px] w-[100px] aspect-square">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#64C882 ${profileCompletion}%, #F5F6FA ${profileCompletion}% 100%)`,
            }}
          />
          <div className="absolute inset-[4px] rounded-full bg-white" />
          <div className="absolute inset-[10px] overflow-hidden rounded-full bg-[#C4C4C4]">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[24px] font-medium text-white">
                {(savedUsername.trim() || nameInitials)[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[16px] font-medium leading-[24px] text-[#121212]">
            {(firstNameDefault || lastNameDefault
              ? `${firstNameDefault ?? ""} ${lastNameDefault ?? ""}`.trim()
              : displayName) || "User"}
          </p>
          {savedUsername.trim() && (
            <p className="mt-1 text-[14px] leading-[21px] text-[#64C882]">
              @{savedUsername.trim()}
            </p>
          )}
          {email && (
            <p className="mt-1 text-[14px] leading-[21px] text-[#AAAAAA]">
              {email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 h-px w-full bg-[#F5F6FA]" />

      <div className="mt-auto flex flex-col gap-4">
        <Button
          type="button"
          className="h-[35px] w-full rounded-md bg-[#D23D3D] text-[12px] font-bold leading-[18px] text-white hover:bg-[#b63030]"
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  )
}

