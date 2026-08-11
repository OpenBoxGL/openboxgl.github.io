import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { requiredRoutes } from './required-routes.mjs';
const root = 'dist';
const files = [];
async function walk(dir) { for (const entry of await readdir(dir,{withFileTypes:true})) { const path=join(dir,entry.name); if(entry.isDirectory()) await walk(path); else if(entry.name.endsWith('.html')) files.push(path); } }
await walk(root);
const routes = new Set(files.map(file => { const path=relative(root,file).replace(/\\/g,'/'); return path==='index.html' ? '/' : `/${path.replace(/\/index\.html$/,'')}/`; }));
for (const route of requiredRoutes) if (!routes.has(route)) throw new Error(`missing required route ${route}`);
const titles = new Set();
for (const file of files) { const html=parse(await readFile(file,'utf8')); if (file.endsWith('/404.html')) continue; const title=html.querySelector('title')?.text.trim(); const description=html.querySelector('meta[name="description"]')?.getAttribute('content'); const h1=html.querySelectorAll('h1'); if(!title || !description || (h1.length!==1 && file !== 'dist/index.html')) throw new Error(`metadata or h1 failure in ${file}`); if(titles.has(title)) throw new Error(`duplicate title ${title}`); titles.add(title); for(const image of html.querySelectorAll('img')) if(!image.getAttribute('alt')?.trim() && !image.getAttribute('src')?.includes('/_astro/openbox')) throw new Error(`image without alt in ${file}`); }
console.log(`verified ${files.length} HTML pages and ${routes.size} routes`);
