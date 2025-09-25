/**
 * Auth Layout Component
 * Layout for authentication pages (login, register, etc.)
 */

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <span className="font-bold text-2xl">Nexus Stream</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">
            Transform Knowledge into Power
          </h1>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of teams using Nexus Stream to centralize knowledge, 
            enhance collaboration, and drive innovation with AI-powered insights.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-sm opacity-75">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500K+</div>
              <div className="text-sm opacity-75">Documents</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-sm opacity-75">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">4.8/5</div>
              <div className="text-sm opacity-75">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            {/* Mobile Logo */}
            <Link to="/" className="flex items-center space-x-2 lg:hidden">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">N</span>
              </div>
              <span className="font-semibold">Nexus Stream</span>
            </Link>
          </div>
        </div>

        {/* Auth Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Corporate Nexus Stream. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link to="/help" className="hover:text-primary">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
