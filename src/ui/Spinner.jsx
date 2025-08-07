const Spinner = () => {
  return (
    <div className="flex items-center justify-center w-screen" style={{ height: 'calc(100vh - 400px)' }}>
      <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
