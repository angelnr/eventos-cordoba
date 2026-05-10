/// <reference types="jest" />

import { canTransition, getAllowedTransitions } from '../services/eventStatusService';

describe('canTransition', () => {
  // Transiciones válidas desde SCHEDULED
  it('SCHEDULED → FULL debe ser válida', () => {
    expect(canTransition('SCHEDULED' as any, 'FULL' as any)).toBe(true);
  });

  it('SCHEDULED → CANCELLED debe ser válida', () => {
    expect(canTransition('SCHEDULED' as any, 'CANCELLED' as any)).toBe(true);
  });

  it('SCHEDULED → FINISHED debe ser válida', () => {
    expect(canTransition('SCHEDULED' as any, 'FINISHED' as any)).toBe(true);
  });

  // Transiciones válidas desde FULL
  it('FULL → SCHEDULED debe ser válida', () => {
    expect(canTransition('FULL' as any, 'SCHEDULED' as any)).toBe(true);
  });

  it('FULL → CANCELLED debe ser válida', () => {
    expect(canTransition('FULL' as any, 'CANCELLED' as any)).toBe(true);
  });

  it('FULL → FINISHED debe ser válida', () => {
    expect(canTransition('FULL' as any, 'FINISHED' as any)).toBe(true);
  });

  // CANCELLED es terminal — sin transiciones salientes
  it('CANCELLED → SCHEDULED debe ser inválida (CANCELLED es terminal)', () => {
    expect(canTransition('CANCELLED' as any, 'SCHEDULED' as any)).toBe(false);
  });

  it('CANCELLED → FULL debe ser inválida', () => {
    expect(canTransition('CANCELLED' as any, 'FULL' as any)).toBe(false);
  });

  it('CANCELLED → FINISHED debe ser inválida', () => {
    expect(canTransition('CANCELLED' as any, 'FINISHED' as any)).toBe(false);
  });

  // FINISHED es terminal — sin transiciones salientes
  it('FINISHED → SCHEDULED debe ser inválida', () => {
    expect(canTransition('FINISHED' as any, 'SCHEDULED' as any)).toBe(false);
  });

  it('FINISHED → CANCELLED debe ser inválida', () => {
    expect(canTransition('FINISHED' as any, 'CANCELLED' as any)).toBe(false);
  });

  it('FINISHED → FULL debe ser inválida', () => {
    expect(canTransition('FINISHED' as any, 'FULL' as any)).toBe(false);
  });

  // Mismo estado — siempre inválido
  it('Mismo estado (SCHEDULED → SCHEDULED) debe ser inválido', () => {
    expect(canTransition('SCHEDULED' as any, 'SCHEDULED' as any)).toBe(false);
  });
});

describe('getAllowedTransitions', () => {
  it('SCHEDULED debe permitir FULL, CANCELLED, FINISHED', () => {
    const allowed = getAllowedTransitions('SCHEDULED' as any);
    expect(allowed).toContain('FULL');
    expect(allowed).toContain('CANCELLED');
    expect(allowed).toContain('FINISHED');
    expect(allowed).toHaveLength(3);
  });

  it('FULL debe permitir SCHEDULED, CANCELLED, FINISHED', () => {
    const allowed = getAllowedTransitions('FULL' as any);
    expect(allowed).toContain('SCHEDULED');
    expect(allowed).toContain('CANCELLED');
    expect(allowed).toContain('FINISHED');
    expect(allowed).toHaveLength(3);
  });

  it('CANCELLED no debe tener transiciones permitidas (terminal)', () => {
    const allowed = getAllowedTransitions('CANCELLED' as any);
    expect(allowed).toHaveLength(0);
  });

  it('FINISHED no debe tener transiciones permitidas (terminal)', () => {
    const allowed = getAllowedTransitions('FINISHED' as any);
    expect(allowed).toHaveLength(0);
  });
});
