import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullscreen = false 
}: LoadingSpinnerProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`}></div>
      {text && (
        <p className="text-sm text-text-secondary">{text}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function MapLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-surface bg-opacity-90 flex items-center justify-center z-20">
      <LoadingSpinner 
        size="lg" 
        text={t('common.loading')}
      />
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  );
}