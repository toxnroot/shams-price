'use client';

export default function Checkbox({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex flex-row items-center gap-2.5 dark:text-white text-black w-fit">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer hidden"
      />
      <div className="h-5 w-5 flex items-center justify-center rounded-md border border-[#a2a1a833] bg-[#e8e8e8] dark:bg-[#F3F4F6] peer-checked:bg-[#7152f3] transition">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          className={`w-4 h-4 stroke-white ${checked ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 12.6111L8.92308 17.5L20 6.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-gray-950">{label}</span>
    </label>
  );
}
