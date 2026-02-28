// Reusable component: shared UI behavior for Loader.

function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-wrap">
      <div className="loader-circle" />
      <p>{message}</p>
    </div>
  );
}

export default Loader;


