/* eslint-disable react/prop-types */
const Input = ({
  name,
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  type = 'text',
  ...rest
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`
        w-full p-4 rounded-xl bg-white/40 border border-blue-100 text-gray-800 shadow
        placeholder-gray-600 focus:outline-none focus:border-[#4e6ef2] backdrop-blur
        ${className}
      `}
      value={value}
      onChange={onChange}
      required={required}
      {...rest}
    />
  );
};

export default Input;
