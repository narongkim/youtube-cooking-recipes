import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RecipeStatus } from '@/types'

interface StatusDropdownProps {
  value: RecipeStatus
  onChange: (status: RecipeStatus) => void
  disabled?: boolean
}

const STATUS_OPTIONS: RecipeStatus[] = ['저장됨', '만들어봄', '보관함']

/**
 * 레시피 상태 변경 드롭다운
 */
export function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as RecipeStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
