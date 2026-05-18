/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        muted: '#5f6f82',
        line: '#d7e3ef',
        paper: '#f7fbff',
        panel: '#ffffff',
        teal: '#2a7fdb',
        blue: '#2a7fdb',
        sun: '#d9ebff',
        coral: '#1f5f9c',
        mist: '#edf6ff',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'system-ui', 'sans-serif'],
        serif: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'system-ui', 'sans-serif'],
      },
    },
  },
};
