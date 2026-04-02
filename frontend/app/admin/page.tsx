'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 1247,
    courses: 47,
    enrollments: 2847,
    certificates: 1203
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border">
            <h1 className="text-4xl gradient-text mb-8">Admin Dashboard</h1>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="group hover:shadow-xl transition-all p-6 bg-gradient-to-br from-blue-500/10 border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 capitalize">{key}</p>
                      <p className="text-3xl font-black text-blue-600">{value}</p>
                    </div>
                    <i className={`fas fa-${getIcon(key)} text-3xl text-blue-500/50 group-hover:text-blue-500 transition-all`}></i>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <Card className="bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 transition-all">
                <i className="fas fa-plus mr-3"></i>Add Course
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:-translate-y-1 transition-all">
                <i className="fas fa-users mr-3"></i>Manage Users
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getIcon(key: string) {
  const icons = {
    users: 'users',
    courses: 'book',
    enrollments: 'chart-line',
    certificates: 'certificate'
  };
  return icons[key as keyof typeof icons] || 'circle';
}

