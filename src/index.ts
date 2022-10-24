import minimist from 'minimist';
import dayjs from 'dayjs';
import fastGlob from 'fast-glob';
import path from 'path';
import getImageSize from 'image-size';
import fs, { promises as fsPromises } from 'fs';

import { getLocalesForFilepath, getPath, getSlugFromPath } from './helpers/path';
import { read } from './helpers/read';

import { DbItem, DbItemPhoto } from './types';

export * from './types';

async function getPhoto(photo: string | null): Promise<DbItemPhoto | null> {
  if (!photo) return null;

  let result: DbItemPhoto | null;
  try {
    const { width, height } = getImageSize(getPath(photo));
    if (!width || !height) throw new Error('No dims!');
    result = { href: photo, w: width, h: height };
  } catch (e) {
    console.error(e);
    result = null;
  }

  return result;
}

async function getItems(glob: string, locale: string, locales: string[]) {
  let result: DbItem[] = [];

  const filepaths = fastGlob.sync(glob);
  let dirnames: string[] = [];
  for (let i = 0; i < filepaths.length; i += 1) {
    const filepath = filepaths[i];
    const dirname = path.dirname(filepath);

    const filepathLocale = path.basename(filepath, '.mdx');
    const isCurrentLocale = filepathLocale === locale;
    const isFallbackLocale = filepathLocale === locales[0];

    if (!isCurrentLocale) {
      if (!isFallbackLocale) continue;
      const isRequestedLocalePresent = fs.existsSync(getPath(dirname, `${locale}.mdx`));
      if (isRequestedLocalePresent) continue;
    }

    const slug = getSlugFromPath(filepath);
    if (dirnames.includes(dirname)) {
      continue;
    }
    dirnames = [...dirnames, dirname];

    const { data, content } = await read(filepath);
    const fsState = await fsPromises.stat(filepath);

    const photo = typeof data.photo === 'string' ? await getPhoto(data.photo) : null;

    const item: DbItem = {
      data,
      content,
      dateCreated: dayjs(fsState.ctime).toISOString(),
      dateModified: dayjs(fsState.mtime).toISOString(),
      filepath,
      locales: getLocalesForFilepath(filepath, locales),
      slug,
    };
    if (photo) item.photo = photo;
    result = [...result, item];
  }

  return result;
}

type CommandArgs = {
  dest?: string;
  locales?: string;
  posts?: string;
};

async function run() {
  const args = minimist<CommandArgs>(process.argv.slice(2));
  const locales = args.locales?.split(',').map((l) => l.trim());
  if (!locales) throw new Error('Missing locales!');
  const globs = args.posts?.split(',').map((l) => l.trim());
  if (!globs) throw new Error('Missing posts!');
  const dest = args.dest;
  if (!dest) throw new Error('Missing dest!');
  console.log('⌛ started mdx-db', args, locales, globs, dest);

  for (let i = 0; i < locales.length; i += 1) {
    let items: DbItem[] = [];
    const locale = locales[i];
    for (let globI = 0; globI < globs.length; globI += 1) {
      const glob = globs[globI];
      console.log(`|-- doing glob ${glob}.`);
      items = [...items, ...(await getItems(glob, locale, locales))];
    }
    const destPath = getPath(dest, `${locale}.json`);
    await fsPromises.writeFile(destPath, JSON.stringify(items, null, 2)).then(() => {
      console.log(`${locale}: ${items.length} files written.`);
    });
  }
}

run().catch((err) => console.error(err));
