'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Palette, 
  Move, 
  Maximize2, 
  Eye, 
  RotateCcw,
  Monitor,
  Smartphone,
  Square,
  Circle,
  Zap
} from 'lucide-react';

export interface OverlaySettings {
  theme: 'modern' | 'minimal' | 'retro' | 'neon' | 'glass' | 'dark';
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  size: 'small' | 'medium' | 'large' | 'xl';
  opacity: number;
  shape: 'rounde