import { useTheme } from '../../lib/theme';
import { ToastContainer as RTToastContainer } from 'react-toastify';

export default function AppToastContainer() {
  const { resolvedTheme } = useTheme();

  return (
    <RTToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={resolvedTheme}
    />
  );
}