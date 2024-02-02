"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const router = useRouter();

  const items = ['1', '2', '3', '4', '5'];

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(event.target.value);
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(`/cart?item=${selectedItem}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        <select
          value={selectedItem}
          onChange={handleSelect}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select an item</option>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button 
          type="submit" 
          className="p-2 mt-2 bg-blue-500 text-white rounded-md"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Page;