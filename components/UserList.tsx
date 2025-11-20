import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setUsers(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
  }, []);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the users in your account including their name, title, email and role.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors">
            Add user
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">User</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Role</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Last Active</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
                <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">Loading users...</td>
                </tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-sm">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    user.status === 'Active' 
                      ? 'bg-green-50 text-green-700 ring-green-600/20' 
                      : user.status === 'Pending' 
                        ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                        : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.lastActive}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-3">
                    <button className="text-primary-600 hover:text-primary-900"><Edit2 size={16}/></button>
                    <button className="text-red-600 hover:text-red-900"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};