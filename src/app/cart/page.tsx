"use client"
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
export const fetchCache = 'force-no-store';


interface DisabledTimes {
  [key: string]: string[];
}

const CartPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartPath />
    </Suspense>
  );
}

const CartPath: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedItem = searchParams.get('item');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [disabledTimes, setDisabledTimes] = useState<DisabledTimes>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/date', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json', 
          },
          cache: 'no-store' 
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
  
        const newDisabledTimes = data.reduce((acc: DisabledTimes, curr: any) => {
          const dateStr = new Date(curr.data).toISOString().split('T')[0];
          if (acc[dateStr]) {
            acc[dateStr] = Array.from(new Set([...acc[dateStr], ...curr.time.split(', ')]));
          } else {
            acc[dateStr] = curr.time.split(', ');
          }
          return acc;
        }, {});
  
        setDisabledTimes(newDisabledTimes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (date && selectedTimes.length > 0) {
      const adjustedDate = new Date(date.getTime());
      adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());

      try {
        const response = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item: selectedItem,
            dateTime: selectedTimes,
            date: adjustedDate.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save data');
        }

        console.log('Data saved successfully');
        // Reset selections or navigate user as needed
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('No date or times selected');
    }
    router.push('/cart/success');

  };

  const handleTimeClick = (clickedTime: string) => {
    const [clickedHour, clickedMinute] = clickedTime.split(':').map(Number);
    const startTime = new Date(date || new Date());
    startTime.setHours(clickedHour, clickedMinute, 0, 0);
  
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000)); // 2 hours and 30 minutes later
  
    // Constraint 1: Check if the end time exceeds the daily limit
    const dailyLimit = new Date(startTime);
    dailyLimit.setHours(18, 0, 0, 0); // Assuming the daily limit is 18:00
    if (endTime > dailyLimit) {
      alert("Time exceeds daily limit");
      return;
    }
  
    // Constraint 2: Check for disabled time slots within the range
    let currentTime = new Date(startTime.getTime());
    while (currentTime < endTime) {
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const formattedTime = `${currentHours}:${currentMinutes < 10 ? '0' + currentMinutes : currentMinutes}`;
  
      // Check if the time slot is disabled
      const currentDateStr = date ? date.toISOString().split('T')[0] : null;
      if (currentDateStr && disabledTimes[currentDateStr]?.includes(formattedTime)) {
        alert("Time slot cannot be allotted");
        return;
      }
  
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // Increment by 15 minutes
    }
  
    // If no constraints are violated, proceed with selecting or unselecting the range
    if (selectedTimes.includes(clickedTime)) {
      setSelectedTimes([]);
    } else {
      let newSelectedTimes = [];
      currentTime = new Date(startTime.getTime());
      while (currentTime < endTime) {
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const formattedTime = `${currentHours}:${currentMinutes < 10 ? '0' + currentMinutes : currentMinutes}`;
        newSelectedTimes.push(formattedTime);
        currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
      }
      setSelectedTimes(newSelectedTimes);
    }
  };
  
  

  const times = [];
  const now = new Date();
  const currentDateStr = date ? date.toISOString().split('T')[0] : null;
  for (let i = 10; i < 18; i++) {
    for (let j = 0; j < 60; j += 15) {
      const time = `${i}:${j < 10 ? '0' + j : j}`;
      const timeDate = new Date(date || new Date());
      timeDate.setHours(i, j, 0);
      const isDisabled = (date?.toDateString() === now.toDateString() && timeDate < now) ||
      (currentDateStr && disabledTimes[currentDateStr]?.includes(time));
      times.push(
        <button
          key={time}
          onClick={() => handleTimeClick(time)}
          className={`m-1 p-2 border rounded ${selectedTimes.includes(time) ? 'bg-blue-500 text-white' : 'bg-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!date || isDisabled || false}
        >
          {time}
        </button>
      );
    }
  }

  return (
    <div className="flex flex-col sm:flex-row md:flex-row justify-center items-center bg-gray-100 p-5">
      <div className="m-5 bg-white p-5 rounded shadow w-full sm:w-1/2 md:w-auto">
        <p className="text-lg font-semibold mb-3">Selected item: {selectedItem}</p>
      </div>
      <div className="m-5 bg-white p-5 rounded shadow w-full sm:w-1/2 md:w-auto">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => setDate(newDate)}
          className="rounded-md border"
          disabled={{
            before: new Date(),
          }}
        />
      </div>
      <div className="m-5 bg-white p-5 rounded shadow w-full sm:w-1/2 md:w-auto">
        {times}
      </div>
      <div className="m-5 bg-white p-5 rounded shadow w-full sm:w-1/2 md:w-auto flex justify-center">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded shadow"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
};

export default CartPage;
