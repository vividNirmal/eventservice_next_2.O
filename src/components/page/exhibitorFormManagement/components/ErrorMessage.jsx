export const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-xs absolute -bottom-1 left-0">{error}</div>;
};