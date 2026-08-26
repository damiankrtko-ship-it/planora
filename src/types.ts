export type Priority='Nízka'|'Stredná'|'Vysoká';
export type Task={id:string; title:string; due:string; priority:Priority; done:boolean};
export type Note={id:string; title:string; body:string; tags:string[]; pinned:boolean; updated:string};
