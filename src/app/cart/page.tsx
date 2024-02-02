"use client"
import { useSearchParams ,useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import React, { useEffect } from "react"

const CartPage = () => {
  const searchParams = useSearchParams()
  const selectedItem = searchParams.get('item')
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = React.useState<string[]>([]);
  const [apiData, setApiData] = React.useState<any[]>([]);
  const router = useRouter()

  useEffect(() => {
    getCart();
  }, []);

  async function getCart() {
    const response = await fetch('/api/date');
    const data = await response.json();
    setApiData(data);
  }

  const isTimeDisabled = (time: string) => {
    const apiItem = apiData.find(item => item.item === selectedItem && new Date(item.data).toDateString() === date?.toDateString());
    return apiItem && apiItem.time.split(', ').includes(time);
  }

  const handleSubmit = async () => {
    if (date) {
      const adjustedDate = new Date(date.getTime());
      adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: selectedItem,
          dateTime: selectedTimes,
          date: adjustedDate
        }),
      });
  
      if (!response.ok) {
        console.error('Failed to save data');
      } else {
        console.log('Data saved successfully');
      }
    }
    router.push('/cart/success');
  };

  const handleTimeClick = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes([]);
    } else {
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date || new Date());
      startTime.setHours(hours, minutes, 0);
  
      const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000) + (30 * 60 * 1000));
  
      if (endTime.getHours() > 18 || (endTime.getHours() === 18 && endTime.getMinutes() > 0)) {
        alert("Time exceeds the limit");
      } else {
        const newSelectedTimes = [];
        let currentTime = new Date(startTime.getTime());
  
        while (currentTime <= endTime) {
          const currentHours = currentTime.getHours();
          const currentMinutes = currentTime.getMinutes();
          const formattedTime = `${currentHours}:${currentMinutes < 10 ? '0' + currentMinutes : currentMinutes}`;
  
          if (isTimeDisabled(formattedTime)) {
            alert("Sorry! Try another time slot");
            return;
          }
  
          newSelectedTimes.push(formattedTime);
  
          currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
        }
  
        setSelectedTimes(newSelectedTimes);
      }
    }
  }

  const times = [];
  const now = new Date();
  for(let i = 10; i < 18; i++) {
    for(let j = 0; j < 60; j += 15) {
      const time = `${i}:${j < 10 ? '0' + j : j}`;
      const timeDate = new Date(date || new Date());
      timeDate.setHours(i, j, 0);
      const isDisabled = date?.toDateString() === now.toDateString() && timeDate < now || isTimeDisabled(time);
      times.push(
        <button 
          key={time}
          onClick={() => handleTimeClick(time)}
          className={`m-1 p-2 border rounded ${selectedTimes.includes(time) ? 'bg-blue-500 text-white' : 'bg-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!date || isDisabled}
        >
          {time}
        </button>
      );
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-100 p-5">
        <div className="m-5 bg-white p-5 rounded shadow">
            <p className="text-lg font-semibold mb-3">Selected item: {selectedItem}</p>
        </div>
        <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
                setDate(newDate);
            }}
            className="rounded-md border m-5 shadow"
            disabled={{
                before: new Date(),
            }}
        />
        <div className="flex flex-wrap m-5 bg-white p-5 rounded shadow">
            {times}
        </div>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded shadow"
          onClick={handleSubmit}
        >
          Submit
        </button>
    </div>
  )
}

export default CartPage;