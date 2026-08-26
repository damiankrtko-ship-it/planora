import type {Note,Task} from './types';
const today=new Date().toISOString().slice(0,10);
export const seedTasks:Task[]=[{id:'1',title:'Pripraviť týždenný plán',due:today,priority:'Vysoká',done:false},{id:'2',title:'Prečítať kapitolu z knihy',due:today,priority:'Stredná',done:false},{id:'3',title:'Večerná prechádzka',due:new Date(Date.now()+86400000).toISOString().slice(0,10),priority:'Nízka',done:true}];
export const seedNotes:Note[]=[{id:'1',title:'Vitaj v Planore',body:'Toto je tvoje pokojné miesto pre myšlienky, úlohy a plány.',tags:['štart'],pinned:true,updated:today},{id:'2',title:'Nápady na víkend',body:'Výlet do prírody, dobrá káva a trochu času bez obrazoviek.',tags:['osobné'],pinned:false,updated:today}];
const read=<T,>(key:string, fallback:T):T=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
export const loadTasks=()=>read<Task[]>('planora_tasks',seedTasks); export const loadNotes=()=>read<Note[]>('planora_notes',seedNotes);
export const saveTasks=(x:Task[])=>localStorage.setItem('planora_tasks',JSON.stringify(x)); export const saveNotes=(x:Note[])=>localStorage.setItem('planora_notes',JSON.stringify(x));
