'use client';

import { useEffect } from 'react';
import { initEffects } from '@/lib/effects';

/** Liga as animações de entrada, loops e rolagem da página (não renderiza nada). */
export default function PortfolioEffects() {
    useEffect(() => initEffects(), []);
    return null;
}