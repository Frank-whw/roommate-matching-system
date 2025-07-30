'use client';

import React from 'react';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { FieldError } from './error-display';
import { FormError } from '@/lib/errors/types';

// 基础表单字段接口
interface BaseFieldProps {
  label?: string;
  error?: string | FormError | null;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  id?: string;
}

// 输入框字段
interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'time';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  maxLength?: number;
}

export function InputField({
  label,
  error,
  required,
  disabled,
  className = '',
  description,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  step,
  autoComplete,
  maxLength,
  ...props
}: InputFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className={required ? 'required' : ''}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => {
          const newValue = type === 'number' 
            ? parseFloat(e.target.value) || 0 
            : e.target.value;
          onChange(newValue);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={errorMessage ? 'border-red-300 focus:border-red-500' : ''}
        {...props}
      />
      
      <FieldError error={errorMessage} />
    </div>
  );
}

// 文本区域字段
interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  label,
  error,
  required,
  disabled,
  className = '',
  description,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  maxLength,
  ...props
}: TextareaFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className={required ? 'required' : ''}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        <Textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={errorMessage ? 'border-red-300 focus:border-red-500' : ''}
          {...props}
        />
        
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      
      <FieldError error={errorMessage} />
    </div>
  );
}

// 选择框字段
interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  required,
  disabled,
  className = '',
  description,
  id,
  value,
  onChange,
  options,
  placeholder = '请选择...',
  ...props
}: SelectFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className={required ? 'required' : ''}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger 
          id={fieldId}
          className={errorMessage ? 'border-red-300 focus:border-red-500' : ''}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <FieldError error={errorMessage} />
    </div>
  );
}

// 复选框字段
interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}

export function CheckboxField({
  label,
  error,
  required,
  disabled,
  className = '',
  description,
  id,
  checked,
  onChange,
  children,
  ...props
}: CheckboxFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          {...props}
        />
        <Label htmlFor={fieldId} className="text-sm cursor-pointer">
          {children}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
          {description}
        </p>
      )}
      
      <FieldError error={errorMessage} className="ml-6" />
    </div>
  );
}

// 单选按钮组字段
interface RadioGroupFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  orientation?: 'horizontal' | 'vertical';
}

export function RadioGroupField({
  label,
  error,
  required,
  disabled,
  className = '',
  description,
  id,
  value,
  onChange,
  options,
  orientation = 'vertical',
  ...props
}: RadioGroupFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className={required ? 'required' : ''}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={orientation === 'horizontal' ? 'flex flex-wrap gap-4' : ''}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${fieldId}-${option.value}`}
            />
            <div className="flex-1">
              <Label
                htmlFor={`${fieldId}-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      
      <FieldError error={errorMessage} />
    </div>
  );
}