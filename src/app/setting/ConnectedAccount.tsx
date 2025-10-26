// src/app/settings/ConnectedAccounts.tsx

'use client';
import React from 'react';
import Button from '@/components/common/Button';
import { ConnectedAccount } from '@/interfaces/models/user';

interface ConnectedAccountsProps {
  accounts: ConnectedAccount[];
  onConnect: (provider: string) => void;
  onDisconnect: (id: string) => void;
}

export default function ConnectedAccounts({
  accounts,
  onConnect,
  onDisconnect,
}: ConnectedAccountsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Connected Accounts
      </h2>

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {account.provider}
                </p>
                <p className="text-xs text-gray-500">{account.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {account.isConnected ? (
                <>
                  <span className="text-xs text-green-600 font-medium px-3 py-1 bg-green-50 rounded">
                    Connected
                  </span>
                  <button
                    onClick={() => onDisconnect(account.id)}
                    className="text-xs text-red-600 font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => onConnect(account.provider)}
                  text="Connect"
                  text_font_size="text-xs"
                  text_font_weight="font-medium"
                  text_color="text-blue-600"
                  fill_background_color="bg-white"
                  border_border="border border-blue-600"
                  border_border_radius="rounded-lg"
                  padding="py-1 px-3"
                  className="hover:bg-blue-50 transition-colors"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}