import type { ComponentType } from 'react';
import {
  ArrowLeft as LucideArrowLeft,
  ArrowRight as LucideArrowRight,
  BarChart3 as LucideBarChart3,
  Bell as LucideBell,
  Brain as LucideBrain,
  Calendar as LucideCalendar,
  Copy as LucideCopy,
  ExternalLink as LucideExternalLink,
  Image as LucideImage,
  LayoutDashboard as LucideLayoutDashboard,
  LayoutGrid as LucideLayoutGrid,
  Link as LucideLink,
  Lock as LucideLock,
  LogOut as LucideLogOut,
  MessageCircle as LucideMessageCircle,
  MoreVertical as LucideMoreVertical,
  Pencil as LucidePencil,
  Plus as LucidePlus,
  Share2 as LucideShare2,
  Search as LucideSearch,
  Smile as LucideSmile,
  SmilePlus as LucideSmilePlus,
  Square as LucideSquare,
  Trash2 as LucideTrash2,
  Type as LucideType,
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

export const ArrowLeft = createUiIcon(LucideArrowLeft);
export const ArrowRight = createUiIcon(LucideArrowRight);
export const LogOut = createUiIcon(LucideLogOut);
export const Bell = createUiIcon(LucideBell);
export const BarChart3 = createUiIcon(LucideBarChart3);
export const Brain = createUiIcon(LucideBrain);
export const Plus = createUiIcon(LucidePlus);
export const Share2 = createUiIcon(LucideShare2);
export const Search = createUiIcon(LucideSearch);
export const Smile = createUiIcon(LucideSmile);
export const SmilePlus = createUiIcon(LucideSmilePlus);
export const Square = createUiIcon(LucideSquare);
export const MessageCircle = createUiIcon(LucideMessageCircle);
export const MoreVertical = createUiIcon(LucideMoreVertical);
export const Copy = createUiIcon(LucideCopy);
export const Pencil = createUiIcon(LucidePencil);
export const Trash2 = createUiIcon(LucideTrash2);
export const Users = createUiIcon(LucideUsers);
export const Lock = createUiIcon(LucideLock);
export const Calendar = createUiIcon(LucideCalendar);
export const LayoutDashboard = createUiIcon(LucideLayoutDashboard);
export const LayoutGrid = createUiIcon(LucideLayoutGrid);
export const ExternalLink = createUiIcon(LucideExternalLink);
export const Image = createUiIcon(LucideImage);
export const Link = createUiIcon(LucideLink);
export const Type = createUiIcon(LucideType);
