import sdkRelease from '../sdk-release.json';

export const getLabel = () => {
  const UDI_PREFIX = '(01)05419980589323(8012)';
  const UDI_PRODUCT = 'CAMRN';
  const CE_LABEL = 'CE 1639';
  const MANUFACTURER =
    'Qompium NV - Kempische Steenweg 303/27 - 3500 Hasselt - Belgium';
  const IFU_URL = 'https://pages.fibricheck.com/document-versions/';

  const versionCode = sdkRelease.version
    .split('.')
    .map((part) => part.padStart(2, '0'))
    .join('');
  const udi = `${UDI_PREFIX}${UDI_PRODUCT}${versionCode}`;

  return {
    componentName: `FibriCheck Camera SDK React Native ${sdkRelease.version}`,
    udi: udi,
    ceLabel: CE_LABEL,
    manufacturer: MANUFACTURER,
    releaseDate: sdkRelease.releaseDate.substring(0, 7), // YYYY-MM format
    ifu: IFU_URL,
  };
};
