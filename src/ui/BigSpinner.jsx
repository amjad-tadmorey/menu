

export default function BigSpinner() {
  return (
       <div className="flex items-center justify-center w-full h-full" role="status" aria-label="Loading">
      <div
        className="spinner w-36 h-36 rounded-full border-[14px] border-green-200 border-t-green-600"
        style={{ boxShadow: "0 8px 20px rgba(34,197,94,0.2)" }}
      />
    </div>
  );
}
