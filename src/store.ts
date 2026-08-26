import type {Note, Task} from './types';
const today = new Date().toISOString().slice(0, 10);
export const seedTasks: Task[] = [{id:'1',title:'Pripraviť týždenný plán',due:today,priority:'Vysoká',done:false},{id:'2',title:'Prečítať kapitolu z knihy',due:today,priority:'Stredná',done:false},{id:'3',title:'Večerná prechádzka',due:new Date(Date.now()+86400000).toISOString().slice(0,10),priority:'Nízka',done:true}];
export const seedNotes: Note[] = [{id:'1',title:'Vitaj v Planore',body:'Toto je tvoje pokojné miesto pre myšlienky, úlohy a plány.',tags:['štart'],pinned:true,updated:today},{id:'2',title:'Nápady na víkend',body:'Výlet do prírody, dobrá káva a trochu času bez obrazoviek.',tags:['osobné'],pinned:false,updated:today}];
const VERSION=1, LIMIT=500, KEYS={tasks:'planora_tasks',notes:'planora_notes'} as const;
const protectedFallbacks = new WeakSet<object>();
type Kind=keyof typeof KEYS;
export type LoadStatus='ok'|'empty'|'legacy'|'corrupt'|'invalid'|'unavailable';
export type LoadResult<T>={data:T;status:LoadStatus};
export type SaveResult={ok:true}|{ok:false;error:unknown};
type Envelope<T>={version:number;data:T};
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
const validTask=(v:unknown):v is Task=>{if(!v||typeof v!=='object')return false;const t=v as Task;return text(t.id,100)&&text(t.title,500)&&text(t.due,30)&&['Nízka','Stredná','Vysoká'].includes(t.priority)&&typeof t.done==='boolean'};
const validNote=(v:unknown):v is Note=>{if(!v||typeof v!=='object')return false;const n=v as Note;return text(n.id,100)&&text(n.title,500)&&text(n.body,10000)&&Array.isArray(n.tags)&&n.tags.length<=30&&n.tags.every(t=>text(t,100))&&typeof n.pinned==='boolean'&&text(n.updated,40)};
const validList=<T,>(v:unknown,check:(v:unknown)=>v is T):v is T[]=>Array.isArray(v)&&v.length<=LIMIT&&v.every(check);
function save<T>(kind:Kind,data:T[]):SaveResult{try{if(protectedFallbacks.has(data as object))return{ok:false,error:new Error('Protected fallback')};const check=(kind==='tasks'?validTask:validNote) as (v:unknown)=>v is T;if(!validList(data,check))return{ok:false,error:new Error('Invalid storage data')};localStorage.setItem(KEYS[kind],JSON.stringify({version:VERSION,data}));return{ok:true}}catch(error){return{ok:false,error}}}
function load<T>(kind:Kind,fallback:T[],check:(v:unknown)=>v is T):LoadResult<T[]>{let raw:string|null;try{raw=localStorage.getItem(KEYS[kind])}catch{protectedFallbacks.add(fallback);return{data:fallback,status:'unavailable'}}if(raw===null)return{data:fallback,status:'empty'};let parsed:unknown;try{parsed=JSON.parse(raw)}catch{protectedFallbacks.add(fallback);return{data:fallback,status:'corrupt'}}if(validList(parsed,check)){save(kind,parsed);return{data:parsed,status:'legacy'}}if(parsed&&typeof parsed==='object'&&'version'in parsed&&'data'in parsed){const e=parsed as Envelope<unknown>;if(e.version===VERSION&&validList(e.data,check))return{data:e.data,status:'ok'}}protectedFallbacks.add(fallback);return{data:fallback,status:'invalid'}}
export const loadTasksResult=()=>load('tasks',seedTasks,validTask); export const loadNotesResult=()=>load('notes',seedNotes,validNote);
export const loadTasks=()=>loadTasksResult().data; export const loadNotes=()=>loadNotesResult().data;
export const saveTasksResult=(data:Task[]):SaveResult=>save('tasks',data); export const saveNotesResult=(data:Note[]):SaveResult=>save('notes',data);
// Kept as void-compatible wrappers for the existing UI effects.
export const saveTasks=(data:Task[]):void=>{const result=saveTasksResult(data);if(!result.ok&&!(result.error instanceof Error&&result.error.message==='Protected fallback'))window.dispatchEvent(new Event('planora:storage-error'))}; export const saveNotes=(data:Note[]):void=>{const result=saveNotesResult(data);if(!result.ok&&!(result.error instanceof Error&&result.error.message==='Protected fallback'))window.dispatchEvent(new Event('planora:storage-error'))};
