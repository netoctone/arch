const packageJsonNameLength = 'package.json'.length;

export const getPathRelativeToPackageJson = (
  pathFile: string,
  pathPackageJson: string | null
): string => {
  const projectRoot = pathPackageJson ? pathPackageJson.substring(0, pathPackageJson.length - packageJsonNameLength) : null;
  if (projectRoot && pathFile.startsWith(projectRoot)) {
    return pathFile.substring(projectRoot.length);
  }
  return pathFile;
};
