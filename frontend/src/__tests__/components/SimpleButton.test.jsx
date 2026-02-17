import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Componente de ejemplo para testing
const SimpleButton = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

describe('SimpleButton Component', () => {
  it('debe renderizar el botón con el texto correcto', () => {
    render(<SimpleButton>Haz clic</SimpleButton>);
    expect(screen.getByRole('button', { name: /Haz clic/i })).toBeInTheDocument();
  });

  it('debe llamar onClick cuando se hace clic', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<SimpleButton onClick={handleClick}>Clic aquí</SimpleButton>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
