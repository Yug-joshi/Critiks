export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#E2E8F0', /* slate-200 */
        surface: '#F8FAFC', /* slate-50 */
        primary: '#3B82F6', /* blue-500 */
        secondary: '#059669', /* emerald-600 */
        danger: '#DC2626', /* red-600 */
        warning: '#D97706', /* amber-600 */
        textPrimary: '#0F172A', /* slate-900 */
        textSecondary: '#334155' /* slate-700 */
      }
    },
  },
  plugins: [],
}
