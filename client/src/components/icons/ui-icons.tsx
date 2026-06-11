import type { ComponentType } from 'react';
import {
  ArrowRight as LucideArrowRight,
  BarChart3 as LucideBarChart3,
  Bell as LucideBell,
  Calendar as LucideCalendar,
  LayoutDashboard as LucideLayoutDashboard,
  Lock as LucideLock,
  LogOut as LucideLogOut,
  Plus as LucidePlus,
  Users as LucideUsers,
  type LucideProps,
} from 'lucide-react';

type UiIconProps = LucideProps & {
  size?: number | string;
};

function createUiIcon(IconComponent: ComponentType<LucideProps>) {
  return function UiIcon({ size = 20, strokeWidth = 1.75, ...props }: UiIconProps) {
    return <IconComponent size={size} strokeWidth={strokeWidth} {...props} />;
  };
}

/** Minimal line icons — header, buttons, board cards */
export const ArrowRight = createUiIcon(LucideArrowRight);
export const LogOut = createUiIcon(LucideLogOut);
export const Bell = createUiIcon(LucideBell);
export const BarChart3 = createUiIcon(LucideBarChart3);
export const Plus = createUiIcon(LucidePlus);
export const Users = createUiIcon(LucideUsers);
export const Lock = createUiIcon(LucideLock);
export const Calendar = createUiIcon(LucideCalendar);
export const LayoutDashboard = createUiIcon(LucideLayoutDashboard);
