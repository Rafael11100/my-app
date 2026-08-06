import { SchoolColors, SchoolDarkColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export function useSchoolColors() {
  const { isDark } = useTheme();
  return isDark ? SchoolDarkColors : SchoolColors;
}
