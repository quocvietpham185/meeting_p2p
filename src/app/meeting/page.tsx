'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CreateMeetingForm from './CreateMeetingForm';
import { MeetingFormData } from '@/interfaces/models/meeting';

export default function CreateMeetingPage() {
  const router = useRouter();

  const handleStartMeeting = async (data: MeetingFormData) => {
    console.log('Start meeting now:', data);
    
    // TODO: Call API to create meeting
    // const response = await fetch('/api/meetings/create', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // const result = await response.json();
    
    // Navigate to meeting room
    // router.push(`/meeting/room/${data.roomId}`);
    
    alert('Meeting created! (TODO: Navigate to room)');
  };

  const handleScheduleMeeting = async (data: MeetingFormData) => {
    console.log('Schedule meeting:', data);
    
    // TODO: Call API to schedule meeting
    // const response = await fetch('/api/meetings/schedule', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    
    // Navigate to schedule page
    // router.push('/schedule');
    
    alert('Meeting scheduled! (TODO: Navigate to schedule)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CreateMeetingForm
        onStartMeeting={handleStartMeeting}
        onScheduleMeeting={handleScheduleMeeting}
      />
    </div>
  );
}
