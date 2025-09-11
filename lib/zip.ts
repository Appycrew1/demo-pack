import JSZip from "jszip";
export async function zipFiles(files:{name:string;content:Buffer}[]){const zip=new JSZip();for(const f of files)zip.file(f.name,f.content);return await zip.generateAsync({type:"nodebuffer"});}
