"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    wait(3000).then(() => {
        router.push('/');
    });

    
 return (
        <div className="bg-gray-200 p-4">
            <h1 className="text-2xl font-bold mb-2">Your slot has been allocated</h1>
        </div>
    );
};

export default Page;
