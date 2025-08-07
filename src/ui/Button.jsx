/* eslint-disable react/prop-types */
const Button = ({
  type = 'button',
  onClick,
  children,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...rest
}) => {
  const baseStyle = `
    font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-[#6EC1F6] hover:bg-[#178AE4] text-white',
    secondary: 'bg-gray-300 hover:bg-gray-300 text-black',
    danger: 'bg-red-400 hover:bg-red-500 text-white',
    success: 'bg-green-400 hover:bg-green-500 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyle}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
