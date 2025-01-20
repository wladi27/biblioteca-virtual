import React from 'react';

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900">
        {/* Animated lights */}
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse top-1/4 left-1/4"></div>
        <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse delay-1000 top-1/2 right-1/4"></div>
        <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse delay-2000 bottom-1/4 left-1/3"></div>
      </div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]"></div>
    </div>
  );
};