import { Icon, type IconProps } from '@iconify/react';

type FluentEmojiIconProps = Omit<IconProps, 'icon'> & {
  size?: number | string;
};

function createFluentEmojiIcon(iconName: string) {
  return function FluentEmojiIcon({ size = 24, ...props }: FluentEmojiIconProps) {
    return <Icon icon={iconName} width={size} height={size} {...props} />;
  };
}

/** Expressive emoji — hero, empty states, auth branding */
export const Pin = createFluentEmojiIcon('fluent-emoji:pushpin');
export const Hand = createFluentEmojiIcon('fluent-emoji:waving-hand');
