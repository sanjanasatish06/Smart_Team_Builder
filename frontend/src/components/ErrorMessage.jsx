function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <div className="error-icon">!</div>

      <div>
        <h3>Something went wrong</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ErrorMessage;