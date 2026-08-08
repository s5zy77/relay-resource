import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { X, Bell, AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications()
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animation-slide-in">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-x-0 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.actionUrl) {
                  navigate(notif.actionUrl);
                  onClose();
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                notif.type === 'overdue'
                  ? 'bg-red-50 border-red-200 hover:bg-red-100/70'
                  : notif.type === 'ai'
                  ? 'bg-purple-50 border-purple-200 hover:bg-purple-100/70'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                {notif.type === 'overdue' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : notif.type === 'ai' ? (
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">{notif.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
