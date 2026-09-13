const packageJsonNameLength = 'package.json'.length;

export const getPathRelativeToPackageJson = (
  pathFile: string,
  pathPackageJson: string | null
): string => {
  if (pathPackageJson) {
    return pathFile.substring(pathPackageJson.length - packageJsonNameLength);
  }
  return pathFile;
};
