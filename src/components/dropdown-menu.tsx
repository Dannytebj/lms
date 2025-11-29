"use client"

import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface DropdownMenuProps {
    options: Array<{
        label: string;
        onSelect: () => void;
        disabled?: boolean;
    }>;
    label?: string;
}

export function DropdownMenuDialog({ options, label }: DropdownMenuProps) {

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuGroup>
            {options.map((option, index) => (
              <DropdownMenuItem
                key={index}
                onSelect={option.onSelect}
                disabled={option.disabled}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
