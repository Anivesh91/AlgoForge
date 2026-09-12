import React from 'react';
import { useParams } from 'react-router-dom';

export default function Problem() {
  const { id } = useParams();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Problem Workspace</h1>
      <p className="text-gray-400">Problem ID: {id}</p>
    </div>
  );
}
