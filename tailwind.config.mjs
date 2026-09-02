/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        muted: '#75645f',
        line: '#ead9d2',
        paper: '#fff8f4',
        panel: '#ffffff',
        teal: '#F04A1D',
        blue: '#F04A1D',
        sun: '#ffd8a8',
        coral: '#b92712',
        mist: '#fff0e8',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'system-ui', 'sans-serif'],
        serif: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'system-ui', 'sans-serif'],
      },
    },
  },
};
