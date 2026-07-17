import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-pill' | 'secondary' | 'trading-up' | 'trading-down' | 'subscribe' | 'text-link';
  children: React.ReactNode;
}

const buttonVariantStyles: Record<string, string> = {
  primary: 'bg-primary text-on-primary text-sm h-10 px-6 rounded-md hover:bg-primary-active disabled:bg-[#eaecef] dark:disabled:bg-hairline-dark disabled:text-muted/60 dark:disabled:text-muted/40 disabled:cursor-not-allowed',
  'primary-pill': 'bg-primary text-on-primary text-sm h-11 px-8 rounded-pill hover:bg-primary-active disabled:bg-[#eaecef] dark:disabled:bg-hairline-dark disabled:text-muted/60 dark:disabled:text-muted/40 disabled:cursor-not-allowed',
  secondary: 'bg-canvas-light text-ink border border-hairline-light hover:bg-surface-strong-light dark:bg-surface-card-dark dark:text-on-dark dark:border-hairline-dark dark:hover:bg-surface-elevated-dark text-sm h-10 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed',
  'trading-up': 'bg-trading-up text-on-dark text-sm h-9 px-5 rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
  'trading-down': 'bg-trading-down text-on-dark text-sm h-9 px-5 rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
  subscribe: 'bg-primary text-on-primary text-xs h-7 px-4 rounded-sm hover:bg-primary-active disabled:bg-[#eaecef] dark:disabled:bg-hairline-dark disabled:text-muted/60 dark:disabled:text-muted/40 disabled:cursor-not-allowed',
  'text-link': 'text-sm font-medium',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const isLink = variant === 'text-link';
  const baseStyles = isLink
    ? 'inline-flex items-center text-primary hover:text-primary-active transition-colors duration-150 select-none'
    : 'inline-flex items-center justify-center font-sans font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 select-none';

  return (
    <button className={`${baseStyles} ${buttonVariantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label className="text-xs font-semibold text-muted dark:text-muted-strong select-none">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-10 px-4 text-sm font-sans rounded-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50
          bg-canvas-light text-ink border-hairline-light placeholder-muted/50
          dark:bg-surface-card-dark dark:text-on-dark dark:border-hairline-dark dark:placeholder-muted/40
          ${error ? 'border-trading-down focus:ring-trading-down/30' : 'focus:border-primary'}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error ? (
        <span className="text-xs text-trading-down font-medium mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-muted dark:text-muted-strong mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
};

interface SearchInputProps extends InputProps {
  onAction?: () => void;
  actionText?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className = '',
  onAction,
  actionText = 'Sign Up',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full max-w-md h-12 bg-surface-card-dark border border-hairline-dark rounded-lg overflow-hidden pr-1 focus-within:ring-2 focus-within:ring-blue-500/50">
      <svg className="w-5 h-5 ml-4 text-muted select-none pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        className={`
          w-full h-full bg-transparent border-none text-on-dark text-sm px-3 focus:outline-none placeholder-muted/60
          ${className}
        `}
        {...props}
      />
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-primary text-on-primary text-xs font-semibold px-4 h-9 rounded-pill hover:bg-primary-active whitespace-nowrap transition-colors duration-150 mr-1 select-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin rounded-full`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-muted/20 dark:bg-muted/10 rounded ${className}`} />
  );
};

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <div className="flex gap-3 items-start max-w-[70%]">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-64 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-3 items-start justify-end max-w-[70%] self-end">
        <div className="flex flex-col gap-2 items-end w-full">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
      <div className="flex gap-3 items-start max-w-[70%]">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
