import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
