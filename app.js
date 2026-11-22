const $ = s => document.querySelector(s);
const store = {
  get(k){try{return JSON.parse(localStorage.getItem('ezflo_'+k))||[]}catch{return[]}},
  set(k,v){localStorage.setItem('ezflo_'+k,JSON.stringify(v))}
};
let tasks=store.get('tasks'), sessions=store.get('sessions'), notes=store.get('notes'), courses=store.get('courses');
const pages={home:'Home',tasks:'Task Manager',schedule:'Study Planner',notes:'Smart Notes',gpa:'GPA Calculator',progress:'Progress Tracker',settings:'Settings'};
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showApp(){ $('#welcome').classList.add('hidden');$('#app').classList.remove('hidden');render('home');}
$('#getStarted').addEventListener('click',showApp);
$('#todayText').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
$('#mainNav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)render(b.dataset.page)});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();render('home')});
function go(page){render(page)}
function render(page){
  if(!pages[page])page='home';
  $('#pageTitle').textContent=pages[page];
  document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const content=$('#pageContent');
  const intro=(title,desc)=>`<div class="welcome-row"><div><h1>${title}</h1><p>${desc}</p></div><span class="date-pill">${new Date().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span></div>`;
  if(page==='home'){
    content.innerHTML=intro('Welcome back 👋','A calmer way to plan your day. Choose a tool to get started.')+
    `<div class="stats-grid"><div class="stat-card"><small>Tasks completed</small><strong>${tasks.filter(t=>t.done).length}</strong></div><div class="stat-card"><small>Study sessions</small><strong>${sessions.length}</strong></div><div class="stat-card"><small>Your notes</small><strong>${notes.length}</strong></div></div>
    <h3 class="section-title">Your workspace</h3><div class="module-grid">
    ${[['tasks','✓','Task Manager','Add tasks, set deadlines and tick them off.'],['schedule','▦','Study Planner','Organize subjects and study sessions.'],['notes','▤','Smart Notes','Keep useful thoughts in one place.'],['gpa','％','GPA Calculator','Calculate your grade point average.'],['progress','◷','Progress Tracker','See what you have completed.'],['flo','✦','FloBot Assistant','Get help using EZ Flo.']].map(([p,i,t,d])=>`<button class="module-card" data-open="${p}"><span class="module-icon">${i}</span><b>${t}</b><small>${d}</small></button>`).join('')}</div>
    <h3 class="section-title">How EZ Flo works</h3><div class="panel flow-panel"><div class="flow-steps"><div class="flow-step"><b>① Choose a tool</b><small>Pick a section from the sidebar</small></div><span class="flow-arrow">→</span><div class="flow-step"><b>② Add your details</b><small>Enter tasks, sessions or notes</small></div><span class="flow-arrow">→</span><div class="flow-step"><b>③ Save and track</b><small>Your progress stays in this browser</small></div></div><div class="tip">💡 Tip: Use the small FloBot button in the bottom-right corner whenever you need help finding your way around.</div></div>`;
  }else if(page==='tasks'){
    content.innerHTML=intro('Task Manager','Keep your next steps clear. Add a task and check it off when finished.')+
    `<div class="panel"><h3>Add a task</h3><form id="taskForm" class="form-row"><input class="field" id="taskTitle" placeholder="What do you need to do?" required><input class="field" id="taskDate" type="date" aria-label="Due date"><button class="action-btn">Add Task +</button></form></div><div class="panel"><h3>Your tasks</h3><div class="item-list">${tasks.length?tasks.map((t,i)=>`<div class="list-item ${t.done?'done':''}"><input type="checkbox" data-taskdone="${i}" ${t.done?'checked':''}><div class="item-main">${escapeHTML(t.title)}${t.date?`<small>Due ${escapeHTML(t.date)}</small>`:''}</div><button class="secondary-btn" data-edit-task="${i}">Edit</button><button class="secondary-btn danger-btn" data-delete-task="${i}">Delete</button></div>`).join(''):'<div class="empty">No tasks yet. Add your first task above.</div>'}</div></div>`;
  }else if(page==='schedule'){
    content.innerHTML=intro('Study Planner','Make a simple plan for what you want to study and when.')+
    `<div class="panel"><h3>Add a study session</h3><form id="sessionForm"><div class="form-row"><input class="field" id="subject" placeholder="Subject or topic" required><input class="field" id="studyDate" type="date" required></div><div class="form-row"><input class="field" id="studyTime" type="time"><input class="field" id="studyDuration" placeholder="Duration (e.g. 45 minutes)"><button class="action-btn">Save session</button></div></form></div><div class="panel"><h3>Your schedule</h3><div class="item-list">${sessions.length?sessions.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map((s,i)=>`<div class="list-item"><div class="item-main"><b>${escapeHTML(s.subject)}</b><small>${escapeHTML(s.date)} ${escapeHTML(s.time||'')} · ${escapeHTML(s.duration||'Duration not set')}</small></div><button class="secondary-btn danger-btn" data-delete-session="${i}">Delete</button></div>`).join(''):'<div class="empty">Your study sessions will appear here.</div>'}</div></div>`;
  }else if(page==='notes'){
    content.innerHTML=intro('Smart Notes','Save ideas, reminders and useful information in one place.')+
    `<div class="panel"><h3>Create a note</h3><form id="noteForm"><div class="form-row"><input class="field" id="noteTitle" placeholder="Note title" required><input class="field" id="noteSearch" placeholder="Search your notes..." aria-label="Search notes"></div><textarea class="field" id="noteBody" placeholder="Write your note here..." required></textarea><button class="action-btn" style="margin-top:10px">Save note</button></form></div><div class="note-grid" id="noteGrid">${noteCards(notes)}</div>`;
  }else if(page==='gpa'){
    content.innerHTML=intro('GPA Calculator','Enter each course, credit hours and grade points to calculate your GPA.')+
    `<div class="panel"><h3>Add a course</h3><form id="courseForm"><div class="form-row"><input class="field" id="courseName" placeholder="Course name" required><input class="field" id="credits" type="number" min="0.5" step="0.5" placeholder="Credit hours" required><select class="field" id="grade"><option value="">Select grade points</option>${[4,3.7,3.3,3,2.7,2.3,2,1.7,1,0].map(n=>`<option value="${n}">${n.toFixed(1)}</option>`).join('')}</select><button class="action-btn">Add course</button></div></form><p class="muted">This calculator uses the grade points you select (4.0 scale). Check your institution's official scale before relying on the result.</p></div><div class="panel"><h3>Your courses</h3><div class="item-list">${courses.length?courses.map((c,i)=>`<div class="list-item"><div class="item-main"><b>${escapeHTML(c.name)}</b><small>${c.credits} credit hours · ${Number(c.grade).toFixed(1)} grade points</small></div><button class="secondary-btn danger-btn" data-delete-course="${i}">Remove</button></div>`).join(''):'<div class="empty">Add your courses to calculate your GPA.</div>'}</div><div class="tip"><b>Current GPA: ${gpa().toFixed(2)} / 4.00</b> · Based on credit-hour weighting</div></div>`;
  }else if(page==='progress'){
    const total=tasks.length,done=tasks.filter(t=>t.done).length,percent=total?Math.round(done/total*100):0;
    content.innerHTML=intro('Progress Tracker','A simple snapshot of the work you have recorded in EZ Flo.')+
    `<div class="stats-grid"><div class="stat-card"><small>Tasks completed</small><strong>${done} / ${total}</strong></div><div class="stat-card"><small>Study sessions planned</small><strong>${sessions.length}</strong></div><div class="stat-card"><small>Notes saved</small><strong>${notes.length}</strong></div></div><div class="panel" style="margin-top:16px"><h3>Task completion</h3><div class="progress-bar"><span style="width:${percent}%"></span></div><p class="muted">${percent}% of your tasks are complete. ${total?'Keep taking one step at a time.':'Add a task to start tracking your progress.'}</p></div>`;
  }else if(page==='settings'){
    content.innerHTML=intro('Settings','A few simple details about your EZ Flo workspace.')+
    `<div class="panel"><h3>Privacy and storage</h3><div class="setting-row"><span>Storage</span><b>Saved in this browser</b></div><div class="setting-row"><span>Account</span><b>No account required</b></div><p class="muted">Your tasks, notes, sessions and courses are stored locally on this device. They do not automatically sync to another browser or device. Clearing browser data may remove them.</p></div><div class="panel"><h3>Reset workspace</h3><p class="muted">This permanently clears all EZ Flo information saved in this browser.</p><button class="secondary-btn danger-btn" id="resetData">Clear all my data</button></div>`;
  }
  content.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>b.dataset.open==='flo'?openFlo():go(b.dataset.open)));
  bindForms();
}
function noteCards(arr){return arr.length?arr.map((n,i)=>`<article class="note-card"><b>${escapeHTML(n.title)}</b><p>${escapeHTML(n.body)}</p><button class="secondary-btn" data-edit-note="${i}">Edit</button><button class="secondary-btn danger-btn" data-delete-note="${i}">Delete</button></article>`).join(''):'<div class="empty" style="grid-column:1/-1">No notes yet. Create your first note above.</div>'}
function gpa(){const credits=courses.reduce((a,c)=>a+Number(c.credits),0);return credits?courses.reduce((a,c)=>a+Number(c.credits)*Number(c.grade),0)/credits:0}
function bindForms(){
  $('#taskForm')?.addEventListener('submit',e=>{e.preventDefault();tasks.push({title:$('#taskTitle').value.trim(),date:$('#taskDate').value,done:false});store.set('tasks',tasks);render('tasks')});
  $('#sessionForm')?.addEventListener('submit',e=>{e.preventDefault();sessions.push({subject:$('#subject').value.trim(),date:$('#studyDate').value,time:$('#studyTime').value,duration:$('#studyDuration').value.trim()});store.set('sessions',sessions);render('schedule')});
  $('#noteForm')?.addEventListener('submit',e=>{e.preventDefault();notes.unshift({title:$('#noteTitle').value.trim(),body:$('#noteBody').value.trim()});store.set('notes',notes);render('notes')});
  $('#noteSearch')?.addEventListener('input',e=>{$('#noteGrid').innerHTML=noteCards(notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(e.target.value.toLowerCase())))});
  $('#courseForm')?.addEventListener('submit',e=>{e.preventDefault();courses.push({name:$('#courseName').value.trim(),credits:Number($('#credits').value),grade:Number($('#grade').value)});store.set('courses',courses);render('gpa')});
  document.querySelectorAll('[data-taskdone]').forEach(el=>el.addEventListener('change',()=>{tasks[+el.dataset.taskdone].done=el.checked;store.set('tasks',tasks);render('tasks')}));
  document.querySelectorAll('[data-delete-task]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.deleteTask;if(confirm('Delete this task?')){tasks.splice(i,1);store.set('tasks',tasks);render('tasks')}}));
  document.querySelectorAll('[data-edit-task]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.editTask;const v=prompt('Edit task title:',tasks[i].title);if(v&&v.trim()){tasks[i].title=v.trim();store.set('tasks',tasks);render('tasks')}}));
  document.querySelectorAll('[data-delete-session]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.deleteSession;if(confirm('Delete this study session?')){sessions.splice(i,1);store.set('sessions',sessions);render('schedule')}}));
  document.querySelectorAll('[data-delete-note]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.deleteNote;if(confirm('Delete this note?')){notes.splice(i,1);store.set('notes',notes);render('notes')}}));
  document.querySelectorAll('[data-edit-note]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.editNote;const title=prompt('Edit note title:',notes[i].title);if(title===null)return;const body=prompt('Edit note text:',notes[i].body);if(body!==null){notes[i]={title:title.trim(),body:body.trim()};store.set('notes',notes);render('notes')}}));
  document.querySelectorAll('[data-delete-course]').forEach(el=>el.addEventListener('click',()=>{const i=+el.dataset.deleteCourse;if(confirm('Remove this course?')){courses.splice(i,1);store.set('courses',courses);render('gpa')}}));
  $('#resetData')?.addEventListener('click',()=>{if(confirm('Clear all EZ Flo data saved in this browser?')){['tasks','sessions','notes','courses'].forEach(k=>localStorage.removeItem('ezflo_'+k));tasks=[];sessions=[];notes=[];courses=[];render('settings')}});
}
function openFlo(){$('#floPanel').classList.remove('hidden');$('#floInput').focus()}
$('#floLauncher').addEventListener('click',openFlo);$('#closeFlo').addEventListener('click',()=>$('#floPanel').classList.add('hidden'));
function botAnswer(q){
  const s=q.toLowerCase().trim();
  if(/^(hi|hello|hey|salam|assalam|assalamu|assalam-o-alaikum)/.test(s))return /salam|assalam/.test(s)?'Wa Alaikum Assalam! How can I help you use EZ Flo today?':'Hi! How can I help you use EZ Flo today?';
  if(/task/.test(s))return 'To manage tasks: 1. Open Task Manager from the sidebar. 2. Enter a task in the box. 3. Add a due date if you want. 4. Select Add Task. Use the checkbox to complete a task, Edit to change its title, or Delete to remove it.';
  if(/study|schedule|session|planner/.test(s))return 'To plan study time: 1. Open Study Planner. 2. Enter a subject or topic. 3. Choose a date and optional time and duration. 4. Select Save session. Your sessions appear below the form.';
  if(/note/.test(s))return 'To use Smart Notes: 1. Open Smart Notes. 2. Enter a title and note text. 3. Select Save note. Use the search box to find notes, or Edit and Delete on a note card.';
  if(/gpa|grade|calculator/.test(s))return 'To calculate GPA: 1. Open GPA Calculator. 2. Enter a course name and credit hours. 3. Select the grade points for that course. 4. Select Add course. EZ Flo calculates a credit-hour-weighted GPA on the displayed 4.0 scale.';
  if(/progress/.test(s))return 'Open Progress Tracker from the sidebar. It shows completed tasks, your total tasks, planned study sessions and saved notes. The progress bar shows the percentage of tasks you have completed.';
  if(/home|dashboard|navigate|sidebar/.test(s))return 'Use the sidebar to open Home, Task Manager, Study Planner, Smart Notes, GPA Calculator or Progress Tracker. Home explains the simple EZ Flo workflow and links to each tool.';
  if(/setting|data|privacy|save/.test(s))return 'Your information is saved in this browser on this device. It does not automatically sync to other devices. Open Settings to read about local storage or clear your saved workspace.';
  if(/you|flobot|assistant|help/.test(s))return 'I am FloBot, the EZ Flo guide. Ask me how to use Task Manager, Study Planner, Smart Notes, GPA Calculator, Progress Tracker, the Home page or Settings. I can explain the steps, but I do not change your data for you.';
  return "I'm here to help you with EZ Flo and its features. I can't answer questions outside this website, but I can guide you through anything available inside EZ Flo.";
}
$('#floForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#floInput'),q=input.value.trim();if(!q)return;const user=document.createElement('div');user.className='user-msg';user.textContent=q;$('#floMessages').append(user);const bot=document.createElement('div');bot.className='bot-msg';bot.textContent=botAnswer(q);$('#floMessages').append(bot);input.value='';$('#floMessages').scrollTop=$('#floMessages').scrollHeight});
