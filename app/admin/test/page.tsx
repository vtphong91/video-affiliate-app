'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function AdminTestPage() {
  const { user, userProfile } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      
      const result: TestResult = {
        endpoint,
        method,
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Unknown error',
        timestamp: new Date().toISOString(),
      };

      setResults(prev => [...prev, result]);
      return result;
    } catch (error) {
      const result: TestResult = {
        endpoint,
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
      };

      setResults(prev => [...prev, result]);
      return result;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    console.log('🧪 Running Phase 1 backend tests...');

    // Test 1: Database schema test
    await runTest('/api/admin/migrate', 'GET');

    // Test 2: Get roles
    await runTest('/api/admin/roles', 'GET');

    // Test 3: Get permissions
    await runTest('/api/admin/permissions', 'GET');

    // Test 4: Get members
    await runTest('/api/admin/members', 'GET');

    // Test 5: Update user role (if user exists)
    if (userProfile?.id) {
      await runTest('/api/admin/migrate', 'POST', {
        userId: userProfile.id,
        role: 'admin',
        permissions: ['admin:all']
      });
    }

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 1 Backend Test</h1>
          <p className="text-gray-600">Test database schema and APIs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? 'Testing...' : 'Run All Tests'}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>User ID:</strong> {userProfile?.id || 'N/A'}</p>
            <p><strong>Role:</strong> 
              <Badge className="ml-2" variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}>
                {userProfile?.role || 'N/A'}
              </Badge>
            </p>
            <p><strong>Permissions:</strong> {userProfile?.permissions?.join(', ') || 'N/A'}</p>
            <p><strong>Active:</strong> 
              <Badge className="ml-2" variant={userProfile?.is_active !== false ? 'default' : 'destructive'}>
                {userProfile?.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                      <span className="font-mono text-sm">{result.method}</span>
                      <span className="font-mono text-sm text-gray-600">{result.endpoint}</span>
                    </div>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <p className="text-red-800 text-sm"><strong>Error:</strong> {result.error}</p>
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-green-800 text-sm"><strong>Response:</strong></p>
                      <pre className="text-xs text-green-700 mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => runTest('/api/admin/migrate', 'GET')}
            >
              Test Database Schema
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runTest('/api/admin/roles', 'GET')}
            >
              Test Roles API
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runTest('/api/admin/permissions', 'GET')}
            >
              Test Permissions API
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runTest('/api/admin/members', 'GET')}
            >
              Test Members API
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
