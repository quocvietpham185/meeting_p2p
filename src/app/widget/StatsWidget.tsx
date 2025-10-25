
'use client';
import { Stats } from '@/interfaces/models/meeting';
import React from 'react';

interface StatsWidgetProps {
  stats: Stats;
}

export default function StatsWidget({ stats }: StatsWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <h3 className="font-semibold mb-4">Thống kê tuần này</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Tổng cuộc họp</span>
          <span className="text-2xl font-bold">{stats.totalMeetings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Thời gian họp</span>
          <span className="text-2xl font-bold">{stats.avgDuration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Phòng đã tạo</span>
          <span className="text-2xl font-bold">{stats.roomsCreated}</span>
        </div>
      </div>
    </div>
  );
}