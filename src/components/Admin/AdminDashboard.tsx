import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../../services/db';
import { UserList } from './UserList';
import { UserProfile, Role } from '../../types';
import { Shield, Users, Trophy, Settings, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlayers: 0,
    highScore: 0
  });

  const loadData = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    
    // Simple stats calculation
    setStats({
      totalUsers: allUsers.length,
      activePlayers: allUsers.filter(u => u.bestScore > 0).length,
      highScore: Math.max(...allUsers.map(u => u.bestScore), 0)
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRole = async (uid: string, role: Role) => {
    await updateUserRole(uid, role);
    loadData(); // Refresh
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            System Control Center
          </h1>
          <p className="text-slate-500 mt-1 italic font-serif">Management & Administration Hub</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center min-w-[120px]">
             <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
             <div className="text-2xl font-bold dark:text-white">{stats.totalUsers}</div>
             <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Total Users</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center min-w-[120px]">
             <Activity className="w-5 h-5 text-green-500 mx-auto mb-1" />
             <div className="text-2xl font-bold dark:text-white">{stats.activePlayers}</div>
             <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Active Players</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center min-w-[120px]">
             <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
             <div className="text-2xl font-bold dark:text-white">{stats.highScore}</div>
             <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Global Top</div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Identity Management</h3>
          <button 
            onClick={loadData}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Refresh Database
          </button>
        </div>
        <UserList users={users} onUpdateRole={handleUpdateRole} />
      </section>

      <footer className="text-[10px] text-slate-400 font-mono flex gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
        <span>SYSTEM VERSION: 1.0.4-PRO</span>
        <span>STATUS: OPERATIONAL</span>
        <span>LAST SYNC: {new Date().toLocaleTimeString()}</span>
      </footer>
    </div>
  );
}
