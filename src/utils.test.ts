/// <reference types="jest" />
import { getLabel } from './utils';
import sdkRelease from '../__mocks__/sdk-release.json';

const { version, releaseDate } = sdkRelease;
const zeroPaddedVersion = version
  .split('.')
  .map((part) => part.padStart(2, '0'))
  .join('');

describe('getLabel', () => {
  const label = getLabel();

  it('returns the correct componentName', () => {
    expect(label.componentName).toBe(
      `FibriCheck Camera SDK React Native ${version}`
    );
  });

  it('returns a UDI with the correct prefix', () => {
    expect(label.udi).toMatch(/^\(01\)05419980589323\(8012\)/);
  });

  it('returns a UDI with the CAMRN product code', () => {
    expect(label.udi).toContain('CAMRN');
  });

  it('returns a UDI with a zero-padded version code', () => {
    expect(label.udi).toBe(`(01)05419980589323(8012)CAMRN${zeroPaddedVersion}`);
  });

  it('returns the correct ceLabel', () => {
    expect(label.ceLabel).toBe('CE 1639');
  });

  it('returns the correct manufacturer', () => {
    expect(label.manufacturer).toBe(
      'Qompium NV - Kempische Steenweg 303/27 - 3500 Hasselt - Belgium'
    );
  });

  it('returns releaseDate in YYYY-MM format', () => {
    expect(label.releaseDate).toMatch(/^\d{4}-\d{2}$/);
  });

  it('returns the correct releaseDate from sdk-release.json', () => {
    expect(label.releaseDate).toBe(releaseDate.substring(0, 7));
  });

  it('returns the correct ifu URL', () => {
    expect(label.ifu).toBe('https://pages.fibricheck.com/document-versions/');
  });

  it('returns all required LabelInfo fields', () => {
    const requiredFields = [
      'componentName',
      'udi',
      'ceLabel',
      'manufacturer',
      'releaseDate',
      'ifu',
    ];
    requiredFields.forEach((field) => {
      expect(label).toHaveProperty(field);
      expect(typeof label[field as keyof typeof label]).toBe('string');
    });
  });
});
