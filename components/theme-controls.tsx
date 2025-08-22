'use client';

import { useState, useEffect, useContext } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ThemeContext, themeColors, type ThemeColor } from '@/contexts/theme-context';

export default function ThemeControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Try to get theme context, but handle case where it might not be available
  const themeContext = useContext(ThemeContext);
  
  // Use default values if context is not available
  const {
    mode = 'light',
    themeColor = themeColors[0],
    toggleMode = () => {},
    setThemeColor = () => {}
  } = themeContext || {};

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    setIsOpen(false);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="flex items-center space-x-2 h-9 w-18" />;
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Theme Mode Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMode}
        className="rounded-full p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9"
        title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {mode === 'light' ? (
          <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
        ) : (
          <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
        )}
      </Button>

      {/* Theme Color Picker */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9"
            title="Change theme color"
          >
            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {themeColors.map((color) => (
            <DropdownMenuItem
              key={color.value}
              className="cursor-pointer flex items-center justify-between"
              onClick={() => handleColorChange(color)}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ 
                    backgroundColor: `hsl(${color.primary})`,
                  }}
                />
                <span>{color.name}</span>
              </div>
              {themeColor.value === color.value && (
                <Check className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}