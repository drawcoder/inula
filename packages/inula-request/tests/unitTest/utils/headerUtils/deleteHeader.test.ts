import deleteHeader from '../../../../src/utils/headerUtils/deleteHeader';

describe('deleteHeader function', () => {
  it('should delete existing header property from the object', () => {
    const obj = { 'content-type': 'application/json', 'authorization': 'Bearer token' };
    const headerToDelete = 'content-type';
    const result = deleteHeader.call(obj, headerToDelete);
    expect(result).toBe(true);
    expect(obj).toEqual({ 'authorization': 'Bearer token' });
  });

  it('should return false if header property does not exist', () => {
    const obj = { 'content-type': 'application/json', 'authorization': 'Bearer token' };
    const headerToDelete = 'x-custom-header';
    const result = deleteHeader.call(obj, headerToDelete);
    expect(result).toBe(false);
    expect(obj).toEqual({ 'content-type': 'application/json', 'authorization': 'Bearer token' });
  });

  it('should return false if header parameter is empty', () => {
    const obj = { 'content-type': 'application/json', 'authorization': 'Bearer token' };
    const headerToDelete = '';
    const result = deleteHeader.call(obj, headerToDelete);
    expect(result).toBe(false);
    expect(obj).toEqual({ 'content-type': 'application/json', 'authorization': 'Bearer token' });
  });

  it('should delete header property with different case sensitivity', () => {
    const obj = { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' };
    const headerToDelete = 'content-type';
    const result = deleteHeader.call(obj, headerToDelete);
    expect(result).toBe(true);
    expect(obj).toEqual({ 'Authorization': 'Bearer token' });
  });
});
