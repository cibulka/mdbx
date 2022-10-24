import { promises as fsPromises } from 'fs';
import matter from 'gray-matter';

import { MatterData } from '../types';

function getMainFile(filepath: string) {
  const filePathArr = filepath.split('/').filter(Boolean);
  if (filePathArr[filePathArr.length - 2] !== 'translations') return filepath;
  const basename = filePathArr[filePathArr.length - 3];
  const result = [...filePathArr.slice(0, filePathArr.length - 2), `${basename}.mdx`].join('/');
  return result;
}

async function getMatter(filepath: string) {
  let str;
  try {
    str = await fsPromises.readFile(filepath, 'utf-8');
  } catch (e) {
    str = '';
    console.error(`File does not exist: ${filepath}.`);
  }
  const { data, content } = matter(str);

  let contentFormatted = content;
  if (contentFormatted) {
    contentFormatted = contentFormatted.replace(/^\n+/, '').replace(/[ \t]+$/, '');
  }

  return {
    data,
    content,
  };
}

export async function read(filepath: string): Promise<{
  content: string;
  data: MatterData;
}> {
  const mainFile = getMainFile(filepath);

  let defaultData: MatterData;
  if (mainFile === filepath) {
    defaultData = {};
  } else {
    const mainFilePath = getMainFile(filepath);
    defaultData = await getMatter(mainFilePath).then((r) => r.data);
  }

  const { data, content } = await getMatter(filepath);

  return { content, data: { ...defaultData, ...data } };
}
