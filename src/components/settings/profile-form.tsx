"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

type ProfileFormProps = {
  firstNameDefault?: string
  lastNameDefault?: string
  username: string
  email?: string | null
  previewProfileImage: string | null
  savedUsername: string
  nameInitials: string
  isDirty: boolean
  onUsernameChange: (username: string) => void
  onProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveProfileImage: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onChangePasswordClick: () => void
}

export function ProfileForm({
  firstNameDefault,
  lastNameDefault,
  username,
  email,
  previewProfileImage,
  savedUsername,
  nameInitials,
  isDirty,
  onUsernameChange,
  onProfileImageChange,
  onRemoveProfileImage,
  onSubmit,
  onChangePasswordClick,
}: ProfileFormProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
            First name
          </label>
          <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
            <input
              type="text"
              placeholder="First name"
              className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
              defaultValue={firstNameDefault ?? ""}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
            Last name
          </label>
          <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
            <input
              type="text"
              placeholder="Last name"
              className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
              defaultValue={lastNameDefault ?? ""}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
          Username
        </label>
        <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
          <input
            type="text"
            placeholder="username"
            className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
          Profile photo
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#C4C4C4] aspect-square">
            {previewProfileImage ? (
              <Image
                src={previewProfileImage}
                alt="Profile"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-medium text-white">
                {(savedUsername.trim() || nameInitials)[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-md border border-[#CCCCCC] bg-white px-3 py-2 text-xs font-medium text-[#121212]">
              Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onProfileImageChange}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[11px]"
              disabled={!previewProfileImage}
              onClick={onRemoveProfileImage}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
          Email
        </label>
        <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
          <input
            type="email"
            placeholder="Type here"
            className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#666666] outline-none"
            defaultValue={email ?? ""}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-[35px] rounded-md px-4 text-[12px] font-bold leading-[18px]"
          onClick={onChangePasswordClick}
        >
          Change password
        </Button>
        <Button
          type="submit"
          className="h-[35px] w-[272px] rounded-md bg-[#64C882] text-[12px] font-bold leading-[18px] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>
    </form>
  )
}

