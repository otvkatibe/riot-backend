import { validateEmail, validatePassword } from '../../utils/validation.js';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('deve validar emails corretos', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('deve invalidar emails incorretos', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senhas com 8+ caracteres', () => {
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('longpassword')).toBe(true);
    });

    it('deve invalidar senhas curtas', () => {
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });
});