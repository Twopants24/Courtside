import {mkdir,copyFile,cp,writeFile,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await rm(out,{recursive:true,force:true});
await mkdir(new URL('node_modules/three/build/',out),{recursive:true});
for(const file of ['index.html','game.js','style.css'])await copyFile(new URL(file,root),new URL(file,out));
await cp(new URL('stages/',root),new URL('stages/',out),{recursive:true});
for(const file of ['three.module.js','three.core.js'])await copyFile(new URL('node_modules/three/build/'+file,root),new URL('node_modules/three/build/'+file,out));
await copyFile(new URL('node_modules/three/LICENSE',root),new URL('node_modules/three/LICENSE',out));
// Pages cannot run the multiplayer server. Keep the Node version unchanged.
await writeFile(new URL('online.js',out),`const note=document.createElement('p');note.textContent='SINGLE PLAYER · Online duels require the Node server.';note.className='desktop';document.getElementById('start').after(note);\n`);
await writeFile(new URL('.nojekyll',out),'');
console.log('Built single-player Pages site in dist/');
