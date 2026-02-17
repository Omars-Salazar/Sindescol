import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Hacer vi disponible globalmente
global.vi = vi;
