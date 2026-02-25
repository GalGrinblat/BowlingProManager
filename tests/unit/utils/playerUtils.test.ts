import {
  getPlayerDisplayName,
  getPlayerFullName,
} from '../../../src/utils/playerUtils';

describe('getPlayerDisplayName', () => {
  it('joins first and last name with a space', () => {
    expect(getPlayerDisplayName({ firstName: 'Alice', lastName: 'Smith' })).toBe('Alice Smith');
  });

  it('trims extra whitespace', () => {
    expect(getPlayerDisplayName({ firstName: '', lastName: 'Smith' })).toBe('Smith');
    expect(getPlayerDisplayName({ firstName: 'Alice', lastName: '' })).toBe('Alice');
  });
});

describe('getPlayerFullName', () => {
  it('includes middle name when provided', () => {
    expect(
      getPlayerFullName({ firstName: 'Alice', middleName: 'Marie', lastName: 'Smith' })
    ).toBe('Alice Marie Smith');
  });

  it('falls back to display name when middle name is absent', () => {
    expect(
      getPlayerFullName({ firstName: 'Alice', middleName: undefined, lastName: 'Smith' })
    ).toBe('Alice Smith');
  });

  it('falls back to display name when middle name is empty string', () => {
    expect(
      getPlayerFullName({ firstName: 'Alice', middleName: '', lastName: 'Smith' })
    ).toBe('Alice Smith');
  });

  it('trims result when parts are empty', () => {
    expect(
      getPlayerFullName({ firstName: '', middleName: undefined, lastName: 'Smith' })
    ).toBe('Smith');
  });
});
