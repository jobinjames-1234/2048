import React from 'react';
import { UserProfile, Role } from '../../types';
import { Shield, User as UserIcon, MoreHorizontal } from 'lucide-react';

interface UserListProps {
  users: UserProfile[];
  onUpdateRole: (uid: string, role: Role) => void;
}

export function UserList({ users, onUpdateRole }: UserListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Best Score</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{user.username}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  user.role === 'super_admin' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                  user.role === 'admin' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  user.role === 'moderator' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                {user.bestScore}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <select 
                  value={user.role}
                  onChange={(e) => onUpdateRole(user.uid, e.target.value as Role)}
                  className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="player">Player</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
