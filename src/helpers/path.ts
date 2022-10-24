import fs from 'fs';
import path from 'path';

export function getPath(...args: string[]) {
  let result = path.join(process.cwd(), ...args);
  result = result.replace(/\\/g, '/'); // bloody windows
  return result;
}

export function getPathArr(filepath: string) {
  const filepathArr = filepath.split('/').filter(Boolean);
  return filepathArr;
}

export function getSlugFromPath(filepath: string) {
  const filepathArr = getPathArr(filepath);
  let slug = filepathArr[filepathArr.length - 2];
  if (slug === 'translations') {
    slug = filepathArr[filepathArr.length - 3];
  }
  return slug;
}

export function getLocalesForFilepath(filepath: string, locales: string[]) {
  const dirname = path.dirname(filepath);
  return locales.filter((locale) => fs.existsSync(getPath(dirname, `${locale}.mdx`)));
}

/*
export function getMainFileBasename(filepath: string) {
  const pathArr = filepath.split('/').filter(Boolean);
  const sliceIndex = pathArr[pathArr.length - 2] === 'translations' ? 3 : 2;
  return pathArr.splice(pathArr.length - sliceIndex, sliceIndex).join('/');
}
*/
