'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userGetRequest } from '@/service/viewService';

/**
 * API Tester Component for Development
 * Helps test API endpoints directly
 */
export function ApiTester() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testEventApi = async () => {
    if (!token.trim()) {
      alert('Please enter a token');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Testing API with token:', token);
      const response = await userGetRequest(`get-event-details-using-token/${token}`);
      console.log('🧪 API Response:', response);
      setResult(response);
    } catch (error) {
      console.error('🧪 API Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">API Tester (Dev Only)</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0 text-xs space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Test Token:</label>
            <Input
              type="text"
              placeholder="Enter token to test"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="text-xs"
            />
          </div>
          
          <Button
            onClick={testEventApi}
            disabled={loading}
            className="w-full text-xs"
            size="sm"
          >
            {loading ? 'Testing...' : 'Test Event API'}
          </Button>
          
          {result && (
            <div className="mt-3">
              <h4 className="font-semibold mb-1">Result:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-40 overflow-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
