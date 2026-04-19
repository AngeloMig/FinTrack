/* ============ DATA & CONFIG (unchanged from original) ============ */

loadData();
function normalizePaySchedule(){const fallbackAccount=(nwAccounts&&nwAccounts[0]&&nwAccounts[0].key)||(DEFAULT_NW_ACCOUNTS[0]&&DEFAULT_NW_ACCOUNTS[0].key)||'bdo';if(!paySchedule||typeof paySchedule!=='object')paySchedule={mode:'twice',days:[5,20]};const mode=paySchedule.mode==='monthly'?'monthly':'twice';let days=(paySchedule.days||[]).map(x=>Math.min(31,Math.max(1,parseInt(x)||1))).filter(Boolean);if(!days.length)days=mode==='monthly'?[30]:[5,20];days=[...new Set(days)].sort((a,b)=>a-b);if(mode==='monthly')days=[days[0]];while(mode==='twice'&&days.length<2)days.push(days.length?20:5);let splits=Array.isArray(paySchedule.splits)?paySchedule.splits:[];if(!splits.length){const even=Math.round((salary||0)/days.length);splits=days.map((day,idx)=>({day,amount:idx===days.length-1?Math.max(0,Math.round((salary||0)-even*(days.length-1))):even,account:fallbackAccount}))}splits=splits.map((s,idx)=>({day:Math.min(31,Math.max(1,parseInt(s.day)||days[idx]||days[0])),amount:Math.max(0,parseFloat(s.amount)||0),account:s.account||fallbackAccount})).sort((a,b)=>a.day-b.day);const received=(paySchedule&&typeof paySchedule.received==='object'&&paySchedule.received)?paySchedule.received:{};paySchedule={...paySchedule,mode,days:splits.map(s=>s.day),splits,received};}
normalizePaySchedule();

const now=new Date();
const toLocal=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayStr=toLocal(now);
let moneyFlowViewerTheme=localStorage.getItem('ft_money_flow_theme')||'auto';
let filterMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
let activeMonthCloseKey='';
let budgetReviewExpanded=localStorage.getItem('ft_budget_review_expanded')!=='0';
const fmt=n=>"₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtSigned=n=>{n=Number(n||0);if(n===0)return fmt(0);return`${n>0?'+':'-'}${fmt(Math.abs(n))}`};
const fmtShort=n=>{n=Number(n||0);if(Math.abs(n)>=1e6)return"₱"+(n/1e6).toFixed(1)+"M";if(Math.abs(n)>=1e3)return"₱"+Math.round(n/1e3)+"K";return"₱"+Math.round(n).toLocaleString()};
const fmtBudget=n=>{const value=Number(n||0);return"₱"+value.toLocaleString("en-PH",{minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:2})};
const esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML};
const BORROWED_INCOME_SOURCES=['borrowed money','loan release','cash advance','cash advance / debt proceeds','debt proceeds'];
function isBorrowedIncomeSource(source){
  const normalized=String(source||'').trim().toLowerCase();
  if(!normalized)return false;
  return BORROWED_INCOME_SOURCES.includes(normalized)||normalized.includes('loan')||normalized.includes('cash advance')||normalized.includes('debt proceeds');
}
function currentTimeStr(){const d=new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function stampRecord(obj){const d=new Date();return{...obj,time:obj.time||currentTimeStr(),createdAt:obj.createdAt||d.toISOString()}}
function getSortStamp(item){if(item&&item.createdAt)return item.createdAt;const date=item&&item.date?item.date:'0000-00-00';const time=item&&item.time?item.time:'00:00';return `${date}T${time.length===5?time+':00':time}`}
function formatDateTime(item){if(!item)return'';return item.time?`${item.date} ${item.time}`:(item.date||'')}
function allCats(){return[...CATS,...customCats]}
function getCatInfo(name){return allCats().find(c=>c.name===name)||{icon:'📦',colorClass:'cat-default'}}
function getWeek(d){const s=new Date(d.getFullYear(),d.getMonth(),1);return Math.ceil(((d-s)/864e5+s.getDay()+1)/7)}
function getStartOfWeek(d){const start=new Date(d.getFullYear(),d.getMonth(),d.getDate());const dayOffset=(start.getDay()+6)%7;start.setDate(start.getDate()-dayOffset);start.setHours(0,0,0,0);return start}

function applyDark(){document.body.classList.toggle('dark',darkMode);document.getElementById('dark-toggle').textContent=darkMode?'☀️':'🌙';applyMoneyFlowViewerTheme()}
function toggleDark(){darkMode=!darkMode;applyDark();saveData()}
applyDark();

let _appConfirmCb=null;
function showAlert(msg,title='Notice'){document.getElementById('app-alert-title').textContent=title;document.getElementById('app-alert-body').textContent=msg;openModal('modal-app-alert');}
function showConfirm(msg,onOk,title='Confirm',danger=false){_appConfirmCb=onOk||null;document.getElementById('app-confirm-title').textContent=title;document.getElementById('app-confirm-body').textContent=msg;const ok=document.getElementById('app-confirm-ok');ok.textContent=danger?'Delete':'OK';ok.className=danger?'btn btn-danger':'btn btn-primary';openModal('modal-app-confirm');}
function _appConfirmOk(){closeModal('modal-app-confirm');const cb=_appConfirmCb;_appConfirmCb=null;if(cb)cb();}
function _appConfirmCancel(){closeModal('modal-app-confirm');_appConfirmCb=null;}

/* ── Category Group Tagging ── */
const CAT_GROUP_KEYWORDS={
  needs:['food','grocery','groceries','rice','baon','lunch','dinner','breakfast','meal','water','electric','electricity','rent','bill','insurance','transport','commute','fare','gas','petrol','fuel','medicine','medical','health','hygiene','internet','phone','load','data','utilities','tuition','school','education','laundry','toiletries','vitamin','dental','doctor','hospital','clinic','commute','public transport'],
  savings:['savings','saving','investment','invest','fund','emergency','goal','pension','retirement','stock','mp2','uitf','mutual','crypto','forex','deposit'],
  wants:['movie','cinema','game','gaming','shopping','clothes','clothing','fashion','hobby','hobbies','leisure','vacation','travel','trip','gift','restaurant','dine','dining','delivery','takeout','bar','concert','coffee','cafe','snack','gym','fitness','subscription','streaming','netflix','spotify','entertainment','personal','self-care','beauty','salon','grooming','haircut','makeup','skincare','mall','appliance','gadget','ride','ridehailing','grab']
};
function suggestCatGroup(name){const l=name.toLowerCase();if(CAT_GROUP_KEYWORDS.savings.some(k=>l.includes(k)))return'savings';if(CAT_GROUP_KEYWORDS.needs.some(k=>l.includes(k)))return'needs';if(CAT_GROUP_KEYWORDS.wants.some(k=>l.includes(k)))return'wants';return null;}
function catGroupLabel(g){return g==='needs'?'Need':g==='wants'?'Want':g==='savings'?'Savings':'Other';}
function catGroupClass(g){return g==='needs'?'cat-group-needs':g==='wants'?'cat-group-wants':g==='savings'?'cat-group-savings':'cat-group-other';}
function catGroupDotColor(g){return g==='needs'?'var(--green)':g==='wants'?'var(--accent)':g==='savings'?'#a855f7':'var(--text3)';}

let _selectedCatGroup='wants';
let _editCatGroup='wants';

function selectCatGroup(g){_selectedCatGroup=g;['needs','wants','savings'].forEach(x=>{const b=document.getElementById('cgb-'+x);if(b)b.className='cat-group-btn'+(x===g?' active-'+x:'');});}
function selectEditCatGroup(g){_editCatGroup=g;['needs','wants','savings'].forEach(x=>{const b=document.getElementById('ecgb-'+x);if(b)b.className='cat-group-btn'+(x===g?' active-'+x:'');});}

function onCustomCatInput(){
  const name=document.getElementById('f-custom-cat')?.value||'';
  const sug=suggestCatGroup(name);
  const el=document.getElementById('cat-group-suggestion');
  if(sug&&name.length>=2){if(el){el.style.display='block';el.textContent='💡 Suggested: '+catGroupLabel(sug);}selectCatGroup(sug);}
  else{if(el)el.style.display='none';}
}

function setCatGroup(name,group){const c=customCats.find(x=>x.name===name);if(!c)return;c.group=group;c.groupExplicit=true;saveData();renderSettings();}
function cycleCatGroup(name){const c=customCats.find(x=>x.name===name);if(!c)return;const order=['needs','wants','savings'];const idx=order.indexOf(c.group||'wants');c.group=order[(idx+1)%order.length];c.groupExplicit=true;saveData();renderSettings();}

let _catSortDraft={};
function openCatWizard(){
  _catSortDraft={};
  customCats.forEach(c=>{_catSortDraft[c.name]=c.group||'wants';});
  renderCatSort();
  openModal('modal-cat-sort');
}
function renderCatSort(){
  const el=document.getElementById('cat-sort-list');if(!el)return;
  if(!customCats.length){el.innerHTML='<div class="empty" style="padding:16px"><div class="empty-icon">🏷️</div><div class="empty-text">No custom categories to sort.</div></div>';return;}
  el.innerHTML=customCats.map(c=>{
    const g=_catSortDraft[c.name]||c.group||'wants';
    const safe=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return`<div class="cat-sort-item"><div class="cat-sort-name">${c.icon||'📦'} ${esc(c.name)}</div><div class="cat-group-picker">
      ${['needs','wants','savings'].map(x=>`<button type="button" class="cat-group-btn${x===g?' active-'+x:''}" onclick="_catSortDraft['${safe}']='${x}';renderCatSort()">${x==='needs'?'🟢 Need':x==='wants'?'🔵 Want':'🟣 Savings'}</button>`).join('')}
    </div></div>`;
  }).join('');
}
function saveCatSort(){
  customCats.forEach(c=>{if(_catSortDraft[c.name]){c.group=_catSortDraft[c.name];c.groupExplicit=true;}});
  closeModal('modal-cat-sort');saveData();render();
  showActionToast('Category tags saved','Budget split updated','🏷️');
}
function openModal(id){document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function syncHistoryDrawerState(){
  const drawer=document.getElementById('history-drawer');
  const scrim=document.getElementById('history-drawer-scrim');
  if(drawer){
    drawer.classList.toggle('show',historyDrawerOpen);
    drawer.setAttribute('aria-hidden',historyDrawerOpen?'false':'true');
  }
  if(scrim)scrim.classList.toggle('show',historyDrawerOpen);
  document.body.classList.toggle('history-drawer-open',historyDrawerOpen);
}
function updateDrawerOffset(){const offset=Math.max(0,Math.floor((window.innerWidth-480)/2));document.documentElement.style.setProperty('--drawer-offset',offset+'px')}
function openHistoryDrawer(){updateDrawerOffset();historyDrawerOpen=true;syncHistoryDrawerState()}
function closeHistoryDrawer(){historyDrawerOpen=false;syncHistoryDrawerState()}
window.addEventListener('resize',updateDrawerOffset);
updateDrawerOffset();

function updateGreetingCarousel(){
  document.querySelectorAll('.greeting-slide').forEach((s,i)=>s.classList.toggle('active',i===greetingCardIndex));
  document.querySelectorAll('.greeting-tab').forEach((t,i)=>t.classList.toggle('active',i===greetingCardIndex));
}
function restartGreetingAutoSlide(){
  if(greetingAutoSlideTimer) clearInterval(greetingAutoSlideTimer);
  greetingAutoSlideTimer=setInterval(()=>{
    greetingCardIndex=(greetingCardIndex+1)%3;
    updateGreetingCarousel();
  },6000);
}
function setGreetingCard(index){
  greetingCardIndex=((index%3)+3)%3;
  updateGreetingCarousel();
  restartGreetingAutoSlide();
}
function nextGreetingCard(){
  greetingCardIndex=(greetingCardIndex+1)%3;
  updateGreetingCarousel();
  restartGreetingAutoSlide();
}
function prevGreetingCard(){
  greetingCardIndex=(greetingCardIndex+2)%3;
  updateGreetingCarousel();
  restartGreetingAutoSlide();
}

let actionToastTimer=null;
function showActionToast(title,body,icon='✓',opts={}){const toast=document.getElementById('action-toast');if(!toast)return;document.getElementById('action-toast-title').textContent=title||'Saved';document.getElementById('action-toast-body').textContent=body||'';document.getElementById('action-toast-icon').textContent=icon||'✓';const undoBtn=document.getElementById('action-toast-undo');if(undoBtn){undoBtn.style.display=opts.showUndo?'inline-flex':'none'}toast.classList.remove('show');if(actionToastTimer)clearTimeout(actionToastTimer);requestAnimationFrame(()=>toast.classList.add('show'));actionToastTimer=setTimeout(()=>{toast.classList.remove('show');if(undoBtn)undoBtn.style.display='none'},opts.duration||3200)}
function undoLastTransfer(){if(!lastTransferUndo)return;const t=lastTransferUndo.transfer;adjustAccountBalance(t.from,lastTransferUndo.totalDeduction);adjustAccountBalance(t.to,-t.amount);transfers=transfers.filter(x=>x.id!==t.id);if(lastTransferUndo.feeEntryId){entries=entries.filter(e=>e.id!==lastTransferUndo.feeEntryId)}lastTransferUndo=null;saveData();render();showActionToast('Transfer undone','The account balances were restored.','↩️')}
function showMilestoneSheet({icon='🎉',title='Milestone reached',body='You just completed something important.',statLabel='Completed amount',statValue=''}={}){document.getElementById('milestone-icon').textContent=icon;document.getElementById('milestone-title').textContent=title;document.getElementById('milestone-body').textContent=body;document.getElementById('milestone-stat-label').textContent=statLabel;document.getElementById('milestone-stat-value').textContent=statValue||'';openModal('modal-milestone')}

function showTab(name){if(name!=='history')closeHistoryDrawer();document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.nav-item').forEach(t=>t.classList.remove('active'));document.getElementById('sec-'+name).classList.add('active');const n=document.querySelector(`.nav-item[data-tab="${name}"]`);if(n)n.classList.add('active');render();if(name==='more' && localStorage.getItem('ft_onboarded')==='1' && !tutorialActive && !moreTutorialActive && localStorage.getItem('ft_more_tutorial_done')!=='1'){setTimeout(startMoreTutorial,350)}}
function changeMonth(dir){const d=new Date(filterMonth+'-01');d.setMonth(d.getMonth()+dir);filterMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;render()}
function changeYear(dir){viewYear+=dir;render()}

function toggleShowMore(){
  showMoreExpanded=!showMoreExpanded;
  document.getElementById('analytics-expanded').style.display=showMoreExpanded?'block':'none';
  document.getElementById('show-more-toggle').textContent=showMoreExpanded?'📊 Hide charts & analytics':'📊 Show charts & analytics';
}

function openAllBudgets(){
  if(!showMoreExpanded)toggleShowMore();
  requestAnimationFrame(()=>{
    const card=document.getElementById('budget-bars-card');
    if(card)card.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

function getCashflowTimelineMockData(){
  normalizePaySchedule();
  const monthKey=currentMonthKey();
  const today=new Date(todayStr+'T00:00:00');
  const endOfMonth=new Date(today.getFullYear(),today.getMonth()+1,0);
  const baseBalance=Object.values(nwBalances||{}).reduce((sum,val)=>sum+Number(val||0),0)||0;
  const fmtDate=(d)=>d.toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  const makeDate=(day)=>new Date(today.getFullYear(),today.getMonth(),Math.min(Math.max(parseInt(day)||1,1),endOfMonth.getDate()));
  const events=[];

  (paySchedule.splits||[]).forEach(split=>{
    const due=makeDate(split.day);
    const key=getSalaryReceiptKey(monthKey,split.day);
    const alreadyReceived=!!((paySchedule.received||{})[key]);
    if(!alreadyReceived && due>=today){
      const acc=getAccountInfo(split.account||getDefaultAccountKey());
      events.push({
        type:'income',
        icon:'💰',
        name:'Salary',
        meta:`${acc.name} • Scheduled`,
        amount:Number(split.amount||0),
        date:due
      });
    }
  });

  (recurring||[]).forEach(item=>{
    if(item.lastPaid===monthKey) return;
    let due=recurringDueDate(item,monthKey);
    if(due<today) due=new Date(today);
    if(due>endOfMonth) return;
    const iconInfo=item.type==='bill'?getCatInfo(item.category||item.name):{icon:'💰'};
    events.push({
      type:item.type==='bill'?'bill':'income',
      icon:iconInfo.icon|| (item.type==='bill'?'🧾':'💰'),
      name:item.name || item.category || (item.type==='bill'?'Bill':'Income'),
      meta:item.type==='bill'?'Recurring bill':'Recurring income',
      amount:(item.type==='bill'?-1:1)*Number(item.amount||0),
      date:due
    });
  });

  const ac=allCats();
  const catTotals=getMonthCategoryTotals(monthKey);
  const daysInMonth=endOfMonth.getDate();
  const dayOfMonth=Math.max(today.getDate(),1);
  const safeDays=Math.max(dayOfMonth,7);
  const variableCats=ac
    .filter(cat=>cat.type==='variable' && cat.group!=='savings')
    .map(cat=>{
      const spent=Number(catTotals[cat.name]||0);
      const budget=Number(budgets[cat.name]||0);
      if(spent<=0 && budget<=0) return null;
      let projectedTotal=spent;
      if(spent>0){
        const rawTrend=(spent/safeDays)*daysInMonth;
        projectedTotal=dayOfMonth<7 ? Math.max(spent, spent+(rawTrend-spent)*0.35) : Math.max(spent, rawTrend);
      }
      if(budget>0){
        projectedTotal=Math.min(Math.max(projectedTotal, spent), Math.max(budget, spent));
      }
      const futureAmount=Math.max(Math.round((projectedTotal-spent)*100)/100,0);
      if(futureAmount<=0) return null;
      return {...cat,futureAmount};
    })
    .filter(Boolean)
    .sort((a,b)=>b.futureAmount-a.futureAmount)
    .slice(0,3);

  variableCats.forEach((cat,idx)=>{
    const offset=Math.max(1,Math.round(((idx+1)/(variableCats.length+1))*Math.max((endOfMonth-today)/86400000,1)));
    const eventDate=new Date(today);
    eventDate.setDate(today.getDate()+offset);
    events.push({
      type:'projected',
      icon:cat.icon||'🛒',
      name:`${cat.name} (est.)`,
      meta:'Projected spending',
      amount:-Number(cat.futureAmount||0),
      date:eventDate
    });
  });

  const data=events
    .filter(item=>item.amount!==0)
    .sort((a,b)=>a.date-b.date || (a.amount-b.amount));

  let running=baseBalance;
  let lowestBalance=baseBalance;
  let lowestDate=today;
  return data.map(item=>{
    running+=item.amount;
    if(running<lowestBalance){lowestBalance=running;lowestDate=item.date}
    return {...item,dateLabel:fmtDate(item.date),runningBalance:running,lowestBalance,lowestDateLabel:fmtDate(lowestDate)};
  });
}

function renderCashflowNotification(){
  const wrap=document.getElementById('notif-cashflow');
  if(!wrap) return;
  const items=getCashflowTimelineMockData();
  if(!items || !items.length){
    wrap.innerHTML='';
    return;
  }
  wrap.innerHTML = items.slice(0,3).map(item=>`
    <div class="notif-cf-item">
      <div class="notif-cf-icon">${item.icon}</div>
      <div class="notif-cf-main">
        <div class="notif-cf-name">${item.name}</div>
        <div class="notif-cf-meta">${item.dateLabel} • ${item.meta}</div>
      </div>
      <div class="notif-cf-amount ${item.type}">${item.amount>=0?'+':''}${fmt(item.amount)}</div>
    </div>
  `).join('');
}

function renderCashflowTimeline(){
  const wrap=document.getElementById('cashflow-timeline');
  const card=document.getElementById('cashflow-timeline-card');
  if(!wrap||!card)return;
  const items=getCashflowTimelineMockData();
  if(!items.length){
    card.style.display='none';
    return;
  }
  card.style.display='block';
  const last=items.reduce((min,item)=>item.runningBalance<min.runningBalance?item:min,items[0]);
  wrap.innerHTML=`
    <div class="cashflow-list">
      ${items.map(item=>`
        <div class="cashflow-item">
          <div class="cashflow-icon ${item.type}">${item.icon}</div>
          <div class="cashflow-main">
            <div class="cashflow-name">${item.name}</div>
            <div class="cashflow-meta">${item.dateLabel} • ${item.meta}</div>
            <div class="cashflow-balance">Balance after this: ${fmt(item.runningBalance)}</div>
          </div>
          <div class="cashflow-amount ${item.type}">${item.amount>=0?'+':''}${fmt(item.amount)}</div>
        </div>
      `).join('')}
    </div>
    <div class="cashflow-summary">
      <div class="cashflow-summary-icon">⚠️</div>
      <div>
        <div class="cashflow-summary-title">Lowest projected balance</div>
        <div class="cashflow-summary-body">${fmt(last.runningBalance)} on ${last.dateLabel}</div>
      </div>
    </div>
  `;
}

function getPreviousMonthKeyFrom(monthKey=filterMonth){const d=new Date((monthKey||filterMonth)+'-01T00:00:00');d.setMonth(d.getMonth()-1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function getCarryoverOverspend(monthKey=filterMonth){const prev=getPreviousMonthKeyFrom(monthKey);const prevSpent=getMonthSpent(prev);const prevPlanned=Number(salary||0);return Math.max(prevSpent-prevPlanned,0)}
function getMonthEntries(monthKey=filterMonth){
  return entries.filter(e=>(e.date||'').slice(0,7)===monthKey);
}
function getMonthIncome(monthKey=filterMonth){
  return incomes.filter(i=>(i.date||'').slice(0,7)===monthKey && !i.isSalaryDeposit && !isBorrowedIncomeSource(i.source));
}
function getMonthSpent(monthKey=filterMonth){
  return getMonthEntries(monthKey).reduce((sum,e)=>sum+Number(e.amount||0),0);
}
function getMonthIncomeTotal(monthKey=filterMonth){
  return getMonthIncome(monthKey).reduce((sum,i)=>sum+Number(i.amount||0),0);
}
function formatMonthLabel(monthKey=currentMonthKey()){
  if(!monthKey)return'';
  const[y,m]=monthKey.split('-').map(Number);
  if(!y||!m)return monthKey;
  return new Date(y,m-1,1).toLocaleDateString('en-PH',{month:'long',year:'numeric'});
}
function getMonthCloseToneClass(readyCount,total){
  if(total>0&&readyCount>=total)return'good';
  if(total>0&&readyCount>=Math.ceil(total*.6))return'warn';
  return'risk';
}
function getRecurringStatusForMonth(item,monthKey=currentMonthKey()){
  const paid=item.lastPaid===monthKey;
  const due=recurringDueDate(item,monthKey);
  const today=new Date(todayStr+'T00:00:00');
  const monthEnd=new Date(due.getFullYear(),due.getMonth()+1,0);
  monthEnd.setHours(23,59,59,999);
  if(paid)return{state:'paid',label:'Paid',color:'var(--green)',days:0,due};
  if(monthEnd<today)return{state:'missed',label:'Not marked',color:'var(--red)',days:-1,due};
  const days=Math.ceil((due-today)/864e5);
  if(days<0)return{state:'overdue',label:`Overdue by ${Math.abs(days)}d`,color:'var(--red)',days,due};
  if(days===0)return{state:'due',label:'Due today',color:'var(--amber)',days,due};
  return{state:'upcoming',label:`Due in ${days}d`,color:'var(--blue)',days,due};
}
function getSalaryReceiptSummary(monthKey=currentMonthKey()){
  normalizePaySchedule();
  const splits=paySchedule.splits||[];
  const received=paySchedule.received||{};
  const items=splits.map(split=>{
    const key=getSalaryReceiptKey(monthKey,split.day);
    const record=received[key]||null;
    return{split,record,key};
  });
  const plannedTotal=items.reduce((sum,item)=>sum+Number(item.split.amount||0),0);
  const receivedTotal=items.reduce((sum,item)=>sum+Number(item.record?(item.record.amount??item.split.amount??0):0),0);
  const receivedCount=items.filter(item=>item.record).length;
  return{items,plannedTotal,receivedTotal,receivedCount,totalCount:items.length,missingCount:Math.max(items.length-receivedCount,0)};
}
function getMonthCloseData(monthKey=currentMonthKey()){
  const expenseEntries=entries.filter(entry=>(entry.date||'').slice(0,7)===monthKey);
  const incomeEntries=incomes.filter(income=>(income.date||'').slice(0,7)===monthKey);
  const borrowedEntries=incomeEntries.filter(income=>isBorrowedIncomeSource(income.source));
  const trackedIncomeEntries=incomeEntries.filter(income=>!isBorrowedIncomeSource(income.source));
  const extraIncomeEntries=trackedIncomeEntries.filter(income=>!income.isSalaryDeposit);
  const salarySummary=getSalaryReceiptSummary(monthKey);
  const categoryTotals=getMonthCategoryTotals(monthKey);
  const topSpend=Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1])[0]||null;
  const recurringItems=recurring.map(item=>({item,status:getRecurringStatusForMonth(item,monthKey)}));
  const recurringOpenCount=recurringItems.filter(item=>item.status.state!=='paid').length;
  const recurringMissedCount=recurringItems.filter(item=>item.status.state==='overdue'||item.status.state==='missed').length;
  const budgetedCategories=allCats().filter(cat=>cat.group!=='savings'&&Number(budgets[cat.name]||0)>0);
  const overBudgetCount=budgetedCategories.filter(cat=>Number(categoryTotals[cat.name]||0)>Number(budgets[cat.name]||0)).length;
  const monthSnapshot=nwHistory.find(item=>item.month===monthKey)||null;
  const journalEntry=journal.find(item=>(item.month||'')===monthKey)||journal.find(item=>(item.date||'').slice(0,7)===monthKey)||null;
  const goalSavedTotal=goalContributions.filter(item=>(item.date||'').slice(0,7)===monthKey).reduce((sum,item)=>sum+Number(item.amount||0),0);
  const debtPaidTotal=debtPayments.filter(item=>(item.date||'').slice(0,7)===monthKey).reduce((sum,item)=>sum+Number(item.amount||0),0);
  const activeDebtCount=debts.filter(debt=>Number(debt.total||0)>0).length;
  const debtTargets=getDebtModeTargets(salary);
  const debtAttackTarget=Math.max(Number(budgetStrategy.debtAttackTarget||0),0);
  const debtBudgetUnderTarget=budgetStrategy.preset==='debt'&&activeDebtCount>0&&debtTargets.debtAttackAlloc>0&&debtAttackTarget<debtTargets.debtAttackAlloc;
  const spentTotal=expenseEntries.reduce((sum,item)=>sum+Number(item.amount||0),0);
  const trackedIncomeTotal=trackedIncomeEntries.reduce((sum,item)=>sum+Number(item.amount||0),0);
  const borrowedTotal=borrowedEntries.reduce((sum,item)=>sum+Number(item.amount||0),0);
  const checks=[
    {tag:'Inflow',title:'Capture inflow',done:salarySummary.totalCount===0||salarySummary.missingCount===0,detail:salarySummary.totalCount?`Salary ${salarySummary.receivedCount}/${salarySummary.totalCount} confirmed`:'No salary schedule configured',meta:`${fmtShort(salarySummary.receivedTotal)} received${extraIncomeEntries.length?` · ${fmtShort(extraIncomeEntries.reduce((sum,item)=>sum+Number(item.amount||0),0))} extra`:''}`},
    {tag:'Recurring',title:'Confirm recurring items',done:recurringItems.length===0||recurringOpenCount===0,detail:recurringItems.length?`${recurringItems.length-recurringOpenCount}/${recurringItems.length} marked this month`:'No recurring items configured',meta:recurringMissedCount?`${recurringMissedCount} need attention`:recurringOpenCount?`${recurringOpenCount} still open`:'Everything marked'},
    {tag:'Reality',title:'Review spending pressure',done:borrowedEntries.length===0&&overBudgetCount===0&&!debtBudgetUnderTarget,detail:topSpend?`${topSpend[0]} led at ${fmtShort(topSpend[1])}`:'No spending trend yet',meta:borrowedEntries.length?`${fmtShort(borrowedTotal)} borrowed logged`:overBudgetCount?`${overBudgetCount} categories over budget`:debtBudgetUnderTarget?`Debt attack short by ${fmtShort(Math.max(debtTargets.debtAttackAlloc-debtAttackTarget,0))}`:debtPaidTotal>0?`${fmtShort(debtPaidTotal)} paid to debt`:'No pressure flags detected'},
    {tag:'Balances',title:'Save net worth snapshot',done:!!monthSnapshot,detail:monthSnapshot?`${fmtShort(monthSnapshot.net||0)} net worth saved`:'No balance snapshot saved yet',meta:monthSnapshot?`Assets ${fmtShort(monthSnapshot.total||0)}`:'Save balances from More'},
    {tag:'Note',title:'Write close note',done:!!journalEntry,detail:journalEntry?(journalEntry.title||'Journal note saved'):'No close note saved yet',meta:journalEntry?`${(journalEntry.note||'').split(/\s+/).filter(Boolean).length} words captured`:'Write what worked, what slipped, and next-month adjustments'}
  ];
  const readyCount=checks.filter(check=>check.done).length;
  return{
    monthKey,
    monthLabel:formatMonthLabel(monthKey),
    spentTotal,
    trackedIncomeTotal,
    borrowedTotal,
    netTotal:trackedIncomeTotal-spentTotal,
    debtPaidTotal,
    goalSavedTotal,
    overBudgetCount,
    monthSnapshot,
    topSpend,
    checks,
    readyCount,
    readinessPct:checks.length?Math.round((readyCount/checks.length)*100):0
  };
}
function renderMonthCloseCard(monthKey=currentMonthKey()){
  const mount=document.getElementById('month-close-card');
  if(!mount)return;
  const data=getMonthCloseData(monthKey);
  const tone=getMonthCloseToneClass(data.readyCount,data.checks.length);
  const nextCheck=data.checks.find(check=>!check.done)||data.checks[data.checks.length-1];
  mount.innerHTML=`<div class="month-close-preview"><div class="month-close-preview-head"><div><div class="month-close-kicker">${esc(data.monthLabel)}</div><div class="month-close-preview-title">${data.readyCount}/${data.checks.length} checks ready</div><div class="month-close-preview-sub">${esc(nextCheck.done?'This month is ready for a clean close.':`${nextCheck.title} is the next step.`)}</div></div><div class="month-close-preview-score ${tone}"><div>${data.readinessPct}%</div><div class="month-close-preview-score-label">${tone==='good'?'Ready':tone==='warn'?'Almost':'Review'}</div></div></div><div class="month-close-preview-stats"><div class="month-close-preview-stat"><span>Inflow</span><strong>${fmtShort(data.trackedIncomeTotal)}</strong></div><div class="month-close-preview-stat"><span>Spent</span><strong>${fmtShort(data.spentTotal)}</strong></div><div class="month-close-preview-stat"><span>Net</span><strong class="${data.netTotal>=0?'month-close-positive':'month-close-negative'}">${fmtShort(data.netTotal)}</strong></div><div class="month-close-preview-stat"><span>Debt paid</span><strong>${fmtShort(data.debtPaidTotal)}</strong></div></div><div class="month-close-step-strip">${data.checks.map((check,idx)=>`<div class="month-close-step-pill ${check.done?'done':''}"><span>${check.done?'✓':idx+1}</span><strong>${esc(check.tag)}</strong></div>`).join('')}</div><button class="btn btn-primary" onclick="openMonthCloseWizard('${monthKey}')">Open Close Wizard</button></div>`;
}
function renderMonthCloseWizard(monthKey=activeMonthCloseKey||currentMonthKey()){
  const mount=document.getElementById('month-close-content');
  if(!mount)return;
  const data=getMonthCloseData(monthKey);
  const tone=getMonthCloseToneClass(data.readyCount,data.checks.length);
  const outstanding=data.checks.filter(check=>!check.done);
  const readinessLabel=tone==='good'?'Ready to close':tone==='warn'?'Almost ready':'Needs review';
  mount.innerHTML=`<div class="month-close-shell"><div class="month-close-hero"><div class="month-close-kicker">Month Close Wizard</div><div class="month-close-title-row"><div><h3>Close ${esc(data.monthLabel)}</h3><div class="month-close-subtitle">End-of-month review — cash flow, debt pressure, balances, and final notes.</div></div><span class="month-close-status-pill ${tone}">${readinessLabel}</span></div><div class="month-close-net-highlight ${data.netTotal>=0?'good':'risk'}"><span>Net this month</span><strong>${fmtSigned(data.netTotal)}</strong></div><div class="month-close-hero-stats"><div class="month-close-hero-stat"><span>Tracked inflow</span><strong>${fmt(data.trackedIncomeTotal)}</strong></div><div class="month-close-hero-stat"><span>Total spent</span><strong>${fmt(data.spentTotal)}</strong></div><div class="month-close-hero-stat"><span>Borrowed logged</span><strong>${fmt(data.borrowedTotal)}</strong></div><div class="month-close-hero-stat"><span>Debt paid</span><strong>${fmt(data.debtPaidTotal)}</strong></div></div><div class="month-close-step-dots">${data.checks.map(check=>`<div class="month-close-step-dot ${check.done?'done':'open'}"></div>`).join('')}</div><div class="month-close-progress-meta"><span>${data.readyCount} of ${data.checks.length} checks complete</span><span>${outstanding.length?`${outstanding.length} remaining`:'All complete'}</span></div></div><div class="month-close-section"><div class="month-close-section-title">Close flow</div><div class="month-close-step-grid">${data.checks.map((check,idx)=>`<div class="month-close-step-card ${check.done?'done':'open'}"><div class="month-close-step-top"><span class="month-close-step-num ${check.done?'done':'open'}">${check.done?'✓':String(idx+1).padStart(2,'0')}</span><span class="month-close-step-state ${check.done?'done':'open'}">${check.done?'Ready':'Open'}</span></div><div class="month-close-step-label">${esc(check.tag)}</div><div class="month-close-step-title">${esc(check.title)}</div><div class="month-close-step-detail">${esc(check.detail)}</div><div class="month-close-step-meta">${esc(check.meta)}</div></div>`).join('')}</div></div><div class="month-close-section"><div class="month-close-section-title">What this month says</div><div class="month-close-insight-grid"><div class="month-close-insight-card"><span>Top spending lane</span><strong>${data.topSpend?esc(data.topSpend[0]):'No category yet'}</strong><div>${data.topSpend?fmtShort(data.topSpend[1]):'Log more activity to reveal patterns'}</div></div><div class="month-close-insight-card ${data.overBudgetCount>0?'risk':'good'}"><span>Budget pressure</span><strong>${data.overBudgetCount} over-budget ${data.overBudgetCount===1?'category':'categories'}</strong><div>${data.overBudgetCount?'Trim or rebalance before next month':'No categories running over'}</div></div><div class="month-close-insight-card ${data.goalSavedTotal>0?'good':''}"><span>Goal funding</span><strong>${fmtShort(data.goalSavedTotal)}</strong><div>${data.goalSavedTotal>0?'Added into savings goals this month':'No goal contributions logged yet'}</div></div><div class="month-close-insight-card ${data.monthSnapshot?'good':'warn'}"><span>Balances snapshot</span><strong>${data.monthSnapshot?fmtShort(data.monthSnapshot.net||0):'Missing'}</strong><div>${data.monthSnapshot?'Net worth snapshot saved':'Save balances before closing'}</div></div></div></div>${outstanding.length?`<div class="month-close-section"><div class="month-close-section-title">Still needed</div><div class="month-close-recommendation">${outstanding.map((check,idx)=>`<div class="month-close-recommendation-row"><span>${idx+1}</span><div><strong>${esc(check.title)}</strong><div>${esc(check.meta)}</div></div></div>`).join('')}</div></div>`:`<div class="month-close-all-clear">All close checks are in place — this month is ready to close.</div>`}</div>`;
}
function openMonthCloseWizard(monthKey=currentMonthKey()){
  activeMonthCloseKey=monthKey||currentMonthKey();
  renderMonthCloseWizard(activeMonthCloseKey);
  openModal('modal-month-close');
}
function isBudgetTrackedEntry(entry){
  return !!entry&&!entry.isDebtPayment&&!entry.isGoalContribution&&entry.category!=='Transfer Fees';
}
function getMonthCategoryTotals(monthKey=filterMonth){
  const totals={};
  getMonthEntries(monthKey).filter(isBudgetTrackedEntry).forEach(e=>{
    if(!e.category)return;
    totals[e.category]=(totals[e.category]||0)+Number(e.amount||0);
  });
  return totals;
}
function isBudgetOver(spent,budget){
  return Number(budget||0)>0&&Math.round(Number(spent||0)*100)>Math.round(Number(budget||0)*100);
}
function getBudgetProgressItems(categories=allCats(),monthKey=filterMonth){
  const totals=getMonthCategoryTotals(monthKey);
  return categories.filter(c=>c.group!=='savings').map(c=>{
    const spent=Number(totals[c.name]||0);
    const budget=Number(budgets[c.name]||0);
    const pct=budget>0?(spent/budget)*100:0;
    return {...c,spent,budget,pct,over:isBudgetOver(spent,budget)};
  });
}
function formatBudgetProgress(spent,budget){
  return Number(budget||0)>0?`${fmtBudget(spent)} / ${fmtBudget(budget)}`:`${fmtBudget(spent)} spent`;
}
function getDaysLeftInShownMonth(){
  const base=new Date(filterMonth+'-01T00:00:00');
  const daysInMonth=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();
  const currentMonth=todayStr.slice(0,7)===filterMonth;
  const today=currentMonth ? new Date(todayStr+'T00:00:00').getDate() : 1;
  return Math.max(daysInMonth-today+1,1);
}

function renderAnalyticsSummary(){
  const wrap=document.getElementById('analytics-summary');
  if(!wrap)return;
  const monthSpent=getMonthSpent();
  const monthIncome=Number(salary||0);
  const carryoverOverspend=getCarryoverOverspend();
  const remaining=Math.max(monthIncome-carryoverOverspend-monthSpent,0);
  const safe=getSafeSpendRealData();
  const safeDaily=safe.daily;
  const statusClass=safe.status;
  const monthlyStatus=statusClass==='good'?'On Track':statusClass==='warn'?'Tight':'At Risk';
  const statusText=statusClass==='good'?'You are on track this month.':statusClass==='warn'?'Your spending room is getting tighter.':'Your remaining budget is tight.';

  const [fy,fm]=(filterMonth||'').split('-');
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthLabel=(monthNames[parseInt(fm,10)-1]||filterMonth)+' '+fy;

  const spentPct=monthIncome>0?Math.min(100,Math.round(monthSpent/monthIncome*100)):0;
  const progressCls=spentPct>85?'risk':spentPct>70?'warn':'good';

  const remRatio=monthIncome>0?remaining/monthIncome:1;
  const remValCls=remRatio<0.15?'sum-val-risk':remRatio<0.30?'sum-val-warn':'';
  const remSub=remRatio<0.15?'Running low — be careful':remRatio<0.30?'Getting tighter':'After bills & reserves';

  const daysElapsed=Math.max(1,new Date(todayStr+'T00:00:00').getDate());
  const avgDaily=Math.round(monthSpent/daysElapsed);

  wrap.innerHTML=`
    <div class="ms-prog-wrap">
      <div class="ms-prog-labels">
        <span>${fmtShort(monthSpent)} spent</span>
        <span>${spentPct}% of ${fmtShort(monthIncome)}</span>
      </div>
      <div class="ms-prog-track">
        <div class="ms-prog-fill ${progressCls}" style="width:${spentPct}%"></div>
      </div>
    </div>
    <div class="summary-grid">
      <div class="summary-stat">
        <div class="summary-label">Spent this month</div>
        <div class="summary-value">${fmt(monthSpent)}</div>
        <div class="summary-sub">Avg ${fmt(avgDaily)}/day in ${monthLabel}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Left to spend</div>
        <div class="summary-value ${remValCls}">${fmt(remaining)}</div>
        <div class="summary-sub">${remSub}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Daily safe limit</div>
        <div class="summary-value">${fmt(safeDaily)}</div>
        <div class="summary-sub">÷ ${safe.daysLeft} day${safe.daysLeft===1?'':'s'} remaining</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Monthly status</div>
        <div class="summary-value"><span class="sum-status-badge ${statusClass}">${monthlyStatus}</span></div>
        <div class="summary-sub">${statusClass==='good'?'Spending pace is healthy':statusClass==='warn'?'Stay controlled':'Limit spending now'}</div>
      </div>
    </div>
    <div class="summary-status ${statusClass}">${statusText}</div>
  `;
}

function renderAnalyticsInsights(){
  const wrap=document.getElementById('analytics-insights');
  if(!wrap)return;
  const monthSpent=getMonthSpent();
  const monthEntries=getMonthEntries();
  const catTotals=getMonthCategoryTotals();
  const sortedCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const safe=getSafeSpendRealData();
  const safeDaily=safe.daily;
  const insights=[];

  if(monthEntries.length===0){
    insights.push({icon:'📝',title:'No spending logged yet',body:'Add your first expense this month to unlock more useful breakdowns and patterns.'});
    insights.push({icon:'💸',title:'Your full budget is still available',body:'Because there is no logged spending yet, your daily limit is still wide open.'});
    insights.push({icon:'🎯',title:'Good time to build the habit',body:'The earlier you log this month, the smarter your insights will become.'});
  } else {
    // Spike detection: compare current vs previous month per category
    const prevKey=getPreviousMonthKeyFrom(filterMonth);
    const prevTotals=getMonthCategoryTotals(prevKey);
    const allCatNames=new Set([...Object.keys(catTotals),...Object.keys(prevTotals)]);
    let biggestSpike=null, biggestDrop=null;
    allCatNames.forEach(cat=>{
      const curr=Number(catTotals[cat]||0);
      const prev=Number(prevTotals[cat]||0);
      if(prev<=0||curr<=0) return;
      const diff=curr-prev;
      const pct=Math.round((diff/prev)*100);
      const absDiff=Math.abs(diff);
      if(absDiff<500) return; // ignore tiny fluctuations
      if(pct>=50&&(!biggestSpike||absDiff>biggestSpike.absDiff))
        biggestSpike={cat,curr,prev,pct,absDiff};
      if(pct<=-30&&(!biggestDrop||absDiff>biggestDrop.absDiff))
        biggestDrop={cat,curr,prev,pct,absDiff};
    });

    if(biggestSpike){
      insights.push({
        icon:'📈',
        title:`${biggestSpike.cat} spending spiked`,
        body:`Up ${biggestSpike.pct}% vs last month — ${fmt(biggestSpike.curr)} this month vs ${fmt(biggestSpike.prev)} last month.`,
        highlight:'warn'
      });
    }
    if(biggestDrop){
      insights.push({
        icon:'📉',
        title:`${biggestDrop.cat} spending dropped`,
        body:`Down ${Math.abs(biggestDrop.pct)}% vs last month — ${fmt(biggestDrop.curr)} this month vs ${fmt(biggestDrop.prev)} last month.`,
        highlight:'good'
      });
    }

    if(sortedCats[0]) insights.push({icon:'📌',title:`${sortedCats[0][0]} is your biggest category`,body:`It accounts for ${fmt(sortedCats[0][1])} of spending so far this month.`});
    insights.push({icon:'📅',title:'Your current daily pace',body:`To stay balanced, try to keep average spending around ${fmt(safeDaily)} per day for the rest of the month.`});
    const totalBudget=Object.values(budgets||{}).reduce((a,b)=>a+Number(b||0),0);
    if(totalBudget>0) insights.push({icon:'🧭',title:'Your spending vs budget',body:`You have used ${Math.round((monthSpent/totalBudget)*100)}% of your visible monthly budgets so far.`});
  }

  wrap.innerHTML=`<div class="insights-list">${insights.slice(0,4).map(x=>`
    <div class="insight-item${x.highlight?' insight-'+x.highlight:''}">
      <div class="insight-icon">${x.icon}</div>
      <div>
        <div class="insight-title">${x.title}</div>
        <div class="insight-body">${x.body}</div>
      </div>
    </div>`).join('')}</div>`;
}

function renderBudgetFocus(){
  const wrap=document.getElementById('budget-focus');
  if(!wrap)return;
  const active=getBudgetProgressItems().filter(x=>x.spent>0||x.budget>0).sort((a,b)=>Number(b.over)-Number(a.over)||b.pct-a.pct||b.spent-a.spent);
  const risky=active.filter(x=>x.over||x.pct>=70||x.spent>0).slice(0,5);
  if(!risky.length){
    wrap.innerHTML=`
      <div class="empty-analytics">
        <div class="empty-analytics-icon">✅</div>
        <div class="empty-analytics-title">No categories need attention yet</div>
        <div class="empty-analytics-body">Once spending starts, this area will highlight the categories that deserve a closer look.</div>
      </div>`;
    return;
  }
  wrap.innerHTML=`<div class="focus-list">${risky.map(x=>{
    const tag = x.over ? 'Over budget' : x.pct>=70 ? 'Near limit' : 'Active';
    const tagClass = x.over ? 'risk' : 'warn';
    const meta=x.budget>0?`${formatBudgetProgress(x.spent,x.budget)} used`:`${fmtBudget(x.spent)} spent`;
    return `
      <div class="focus-item">
        <div class="focus-top">
          <div>
            <div class="focus-name">${x.name}</div>
            <div class="focus-meta">${meta}</div>
          </div>
          <span class="focus-tag ${tagClass}">${tag}</span>
        </div>
        <div class="progress">
          <div class="progress-track"><div class="progress-fill" style="width:${Math.min(x.pct||0,100)}%;background:${x.over?'var(--red)':'var(--amber)'}"></div></div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

function renderTrendSummary(){
  const wrap=document.getElementById('trend-summary');
  if(!wrap)return;
  const base=new Date(filterMonth+'-01T00:00:00');
  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(base.getFullYear(),base.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    months.push({key,label:d.toLocaleDateString('en-PH',{month:'short'}),spent:getMonthSpent(key)});
  }
  const avg=months.reduce((sum,m)=>sum+m.spent,0)/months.length;
  const latest=months[months.length-1].spent;
  const prev=months[months.length-2]?.spent||0;
  let note='Spending is stable over time.';
  if(latest>prev && prev>0) note='Spending is trending up compared with last month.';
  else if(latest<prev && prev>0) note='Spending is lower than last month.';
  wrap.innerHTML=`<div class="trend-note">Average monthly spending: <strong>${fmt(avg)}</strong>. ${note}</div>`;
}

function renderSpendingCalendar(){
  const wrap=document.getElementById('spending-calendar');
  if(!wrap)return;
  const [fy,fm]=(filterMonth||'').split('-');
  const year=parseInt(fy),month=parseInt(fm)-1;
  const firstDay=new Date(year,month,1);
  const daysInMonth=new Date(year,month+1,0).getDate();
  const offset=(firstDay.getDay()+6)%7; // Monday-first
  const daySpent={};
  entries.filter(e=>(e.date||'').startsWith(filterMonth)).forEach(e=>{
    const d=parseInt((e.date||'').slice(8,10));
    if(d)daySpent[d]=(daySpent[d]||0)+Number(e.amount||0);
  });
  const safe=getSafeSpendRealData();
  const dailyRef=safe.daily>0?safe.daily:Math.max(Number(salary||0)/30,1);
  const dayLabels=['Mo','Tu','We','Th','Fr','Sa','Su'];
  const cells=[];
  for(let i=0;i<offset;i++)cells.push('<div></div>');
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${filterMonth}-${String(d).padStart(2,'0')}`;
    const spent=daySpent[d]||0;
    const isToday=dateStr===todayStr;
    const isFuture=dateStr>todayStr;
    let cls='spend-cal-day';
    if(isFuture)cls+=' spend-cal-future';
    else if(spent===0)cls+=' spend-cal-zero';
    else{
      const ratio=spent/dailyRef;
      if(ratio<=0.3)cls+=' spend-cal-low';
      else if(ratio<=0.8)cls+=' spend-cal-mid';
      else if(ratio<=1.2)cls+=' spend-cal-high';
      else cls+=' spend-cal-over';
    }
    if(isToday)cls+=' spend-cal-today';
    cells.push(`<div class="${cls}" onclick="showCalDay('${dateStr}')" title="${fmt(spent)}">${d}</div>`);
  }
  const rem=cells.length%7;
  if(rem>0)for(let i=rem;i<7;i++)cells.push('<div></div>');
  const header=dayLabels.map(l=>`<div class="spend-cal-header-cell">${l}</div>`).join('');
  wrap.innerHTML=`
    <div class="spend-cal">
      <div class="spend-cal-grid spend-cal-header-row">${header}</div>
      <div class="spend-cal-grid">${cells.join('')}</div>
      <div class="spend-cal-legend">
        <span class="spend-cal-leg spend-cal-zero">No spend</span>
        <span class="spend-cal-leg spend-cal-low">Low</span>
        <span class="spend-cal-leg spend-cal-mid">Moderate</span>
        <span class="spend-cal-leg spend-cal-high">High</span>
        <span class="spend-cal-leg spend-cal-over">Over limit</span>
      </div>
      <div id="spend-cal-detail" class="spend-cal-detail"></div>
    </div>`;
}

function showCalDay(dateStr){
  const detail=document.getElementById('spend-cal-detail');
  if(!detail)return;
  if(detail.dataset.active===dateStr){detail.innerHTML='';detail.dataset.active='';return;}
  detail.dataset.active=dateStr;
  const dayEntries=entries.filter(e=>e.date===dateStr);
  const total=dayEntries.reduce((sum,e)=>sum+Number(e.amount||0),0);
  const dateLabel=new Date(dateStr+'T00:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
  if(!dayEntries.length){detail.innerHTML=`<div class="spend-cal-detail-head"><strong>${dateLabel}</strong><span style="color:var(--text3)">No spending</span></div>`;return;}
  detail.innerHTML=`<div class="spend-cal-detail-head"><strong>${dateLabel}</strong><span>${fmt(total)}</span></div>${dayEntries.map(e=>`<div class="spend-cal-detail-row"><span class="spend-cal-detail-cat">${getCatInfo(e.category||'').icon||'📦'} ${esc(e.category||'—')}</span><span class="spend-cal-detail-amt">${fmt(e.amount)}</span></div>`).join('')}`;
}

function openBudgetInlineEdit(btn,name,currentBudget){
  const valSpan=btn.previousElementSibling;
  if(!valSpan)return;
  const inp=document.createElement('input');
  inp.type='number';inp.className='budget-inline-input';
  inp.value=currentBudget||'';inp.placeholder='0';inp.min='0';
  const save=()=>{const val=parseFloat(inp.value)||0;budgets[name]=val;saveData();render();};
  inp.addEventListener('blur',save);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape')render();});
  valSpan.replaceWith(inp);btn.style.display='none';
  inp.focus();inp.select();
}

function rgbaFromHex(hex,alpha=.35){
  const clean=String(hex||'').replace('#','');
  if(clean.length!==6)return`rgba(99,102,241,${alpha})`;
  const num=parseInt(clean,16);
  if(Number.isNaN(num))return`rgba(99,102,241,${alpha})`;
  return`rgba(${(num>>16)&255},${(num>>8)&255},${num&255},${alpha})`;
}
function truncateMoneyFlowLabel(label,max=18){const text=String(label||'').trim();return text.length>max?text.slice(0,Math.max(max-1,1))+'…':text}
function addMoneyFlowAmount(map,key,amount,seed={}){const next=(map.get(key)||{...seed,amount:0});next.amount=Number(next.amount||0)+Number(amount||0);map.set(key,next);return next}
function getMoneyFlowSourceIcon(source){const lower=String(source||'').toLowerCase();if(lower==='salary')return'💼';if(lower.includes('bonus'))return'✨';if(lower.includes('gift'))return'🎁';if(lower.includes('freelance'))return'🧑‍💻';if(isBorrowedIncomeSource(lower))return'💳';if(lower==='existing balance')return'🏦';return'💵'}
function getMoneyFlowCategoryMeta(entry){
  if(entry.isGoalContribution)return{label:'Goal Contribution',group:'savings',icon:'🎯'};
  if(entry.isDebtPayment)return{label:'Debt Payment',group:'spending',icon:'💳'};
  const info=getCatInfo(entry.category||'');
  const group=info.group==='savings'?'savings':'spending';
  return{label:entry.category||'Uncategorized',group,icon:info.icon||'📦'};
}
function buildMoneyFlowData(monthKey=currentMonthKey()){
  const monthIncomes=incomes.filter(i=>(i.date||'').slice(0,7)===monthKey&&Number(i.amount||0)>0&&!isBorrowedIncomeSource(i.source));
  const monthEntries=entries.filter(e=>(e.date||'').slice(0,7)===monthKey&&Number(e.amount||0)>0);
  const sourceTotals=new Map();
  const sourceAccountFlows=new Map();
  const accountMeta=new Map();
  const accountInTotals=new Map();
  const accountOutTotals=new Map();
  const rawCategoryTotals=new Map();
  const rawAccountCategoryFlows=new Map();

  monthIncomes.forEach(income=>{
    const source=(income.source||'Other Income').trim()||'Other Income';
    const account=income.account||getDefaultAccountKey()||'';
    const amount=Number(income.amount||0);
    addMoneyFlowAmount(sourceTotals,source,amount,{label:source,icon:getMoneyFlowSourceIcon(source)});
    addMoneyFlowAmount(sourceAccountFlows,`${source}|||${account}`,amount,{source,account});
    addMoneyFlowAmount(accountInTotals,account,amount,{key:account});
    const accInfo=getAccountInfo(account);
    accountMeta.set(account,{key:account,label:accInfo.name,icon:accInfo.icon||'🏦'});
  });

  monthEntries.forEach(entry=>{
    const account=entry.account||getDefaultAccountKey()||'';
    const amount=Number(entry.amount||0);
    const categoryMeta=getMoneyFlowCategoryMeta(entry);
    addMoneyFlowAmount(rawCategoryTotals,categoryMeta.label,amount,{...categoryMeta});
    addMoneyFlowAmount(rawAccountCategoryFlows,`${account}|||${categoryMeta.label}`,amount,{account,label:categoryMeta.label,group:categoryMeta.group});
    addMoneyFlowAmount(accountOutTotals,account,amount,{key:account});
    const accInfo=getAccountInfo(account);
    accountMeta.set(account,{key:account,label:accInfo.name,icon:accInfo.icon||'🏦'});
  });

  const spendingCategories=[...rawCategoryTotals.values()].filter(cat=>cat.group==='spending').sort((a,b)=>b.amount-a.amount);
  const savingsCategories=[...rawCategoryTotals.values()].filter(cat=>cat.group==='savings').sort((a,b)=>b.amount-a.amount);
  const keptCategoryLabels=new Set([
    ...spendingCategories.slice(0,4).map(cat=>cat.label),
    ...savingsCategories.slice(0,3).map(cat=>cat.label)
  ]);
  const groupedCategories=new Map();
  const accountCategoryFlows=new Map();

  rawAccountCategoryFlows.forEach(flow=>{
    const rawMeta=rawCategoryTotals.get(flow.label);
    const label=keptCategoryLabels.has(flow.label)?flow.label:'Other';
    const group=keptCategoryLabels.has(flow.label)?rawMeta.group:'other';
    const icon=keptCategoryLabels.has(flow.label)?rawMeta.icon:'📦';
    addMoneyFlowAmount(groupedCategories,label,flow.amount,{label,group,icon});
    addMoneyFlowAmount(accountCategoryFlows,`${flow.account}|||${label}`,flow.amount,{account:flow.account,label});
  });

  if(!accountCategoryFlows.size){
    return{hasActivity:false,monthKey,reason:monthIncomes.length?'No spending or savings activity recorded yet this month.':'No money-flow activity recorded yet this month.'};
  }

  accountOutTotals.forEach((totals,account)=>{
    const outgoing=Number(totals.amount||0);
    const incoming=Number(accountInTotals.get(account)?.amount||0);
    if(outgoing>incoming){
      const difference=outgoing-incoming;
      addMoneyFlowAmount(sourceTotals,'Existing Balance',difference,{label:'Existing Balance',icon:'🏦'});
      addMoneyFlowAmount(sourceAccountFlows,`Existing Balance|||${account}`,difference,{source:'Existing Balance',account});
      addMoneyFlowAmount(accountInTotals,account,difference,{key:account});
    }
  });

  const sources=[...sourceTotals.values()].sort((a,b)=>b.amount-a.amount).map((source,idx)=>({id:`source:${source.label}`,label:source.label,icon:source.icon,total:Number(source.amount||0),color:source.label==='Existing Balance'?'#94a3b8':CHART_COLORS[(idx+1)%CHART_COLORS.length]}));
  const accounts=[...accountMeta.values()].sort((a,b)=>{const aTotal=Math.max(Number(accountInTotals.get(a.key)?.amount||0),Number(accountOutTotals.get(a.key)?.amount||0));const bTotal=Math.max(Number(accountInTotals.get(b.key)?.amount||0),Number(accountOutTotals.get(b.key)?.amount||0));return bTotal-aTotal}).map((account,idx)=>({id:`account:${account.key}`,key:account.key,label:account.label,icon:account.icon,total:Math.max(Number(accountInTotals.get(account.key)?.amount||0),Number(accountOutTotals.get(account.key)?.amount||0)),color:CHART_COLORS[(idx+5)%CHART_COLORS.length]}));
  let spendingColorIndex=0;
  let savingsColorIndex=7;
  const categories=[...groupedCategories.values()].sort((a,b)=>{const groupOrder={spending:0,savings:1,other:2};if(groupOrder[a.group]!==groupOrder[b.group])return groupOrder[a.group]-groupOrder[b.group];return b.amount-a.amount}).map(category=>({id:`category:${category.label}`,label:category.label,icon:category.icon,group:category.group,total:Number(category.amount||0),color:category.label==='Other'?'#94a3b8':category.group==='savings'?CHART_COLORS[(savingsColorIndex++)%CHART_COLORS.length]:CHART_COLORS[(spendingColorIndex++)%CHART_COLORS.length]}));

  const sourceColorByLabel=new Map(sources.map(source=>[source.label,source.color]));
  const categoryColorByLabel=new Map(categories.map(category=>[category.label,category.color]));
  const accountRank=new Map(accounts.map((account,idx)=>[account.key,idx]));
  const categoryRank=new Map(categories.map((category,idx)=>[category.label,idx]));
  const links=[
    ...[...sourceAccountFlows.values()].sort((a,b)=>(sourceTotals.get(b.source)?.amount||0)-(sourceTotals.get(a.source)?.amount||0)||((accountRank.get(a.account)??0)-(accountRank.get(b.account)??0))).map(flow=>({id:`source:${flow.source}->account:${flow.account}`,source:`source:${flow.source}`,target:`account:${flow.account}`,value:Number(flow.amount||0),color:rgbaFromHex(sourceColorByLabel.get(flow.source),.42)})),
    ...[...accountCategoryFlows.values()].sort((a,b)=>(accountRank.get(a.account)??0)-(accountRank.get(b.account)??0)||((categoryRank.get(a.label)??0)-(categoryRank.get(b.label)??0))).map(flow=>({id:`account:${flow.account}->category:${flow.label}`,source:`account:${flow.account}`,target:`category:${flow.label}`,value:Number(flow.amount||0),color:rgbaFromHex(categoryColorByLabel.get(flow.label),.40)}))
  ];

  return{
    hasActivity:true,
    monthKey,
    sources,
    accounts,
    categories,
    links,
    totalIncome:monthIncomes.reduce((sum,income)=>sum+Number(income.amount||0),0),
    totalOutflow:monthEntries.reduce((sum,entry)=>sum+Number(entry.amount||0),0),
    savingsOutflow:categories.filter(category=>category.group==='savings').reduce((sum,category)=>sum+category.total,0),
    existingBalanceUsed:Number(sourceTotals.get('Existing Balance')?.amount||0),
    accountsUsed:accounts.length
  };
}
const MONEY_FLOW_ZOOM_MIN=.4;
const MONEY_FLOW_ZOOM_MAX=2.5;
const MONEY_FLOW_ZOOM_STEP=.25;
let moneyFlowZoom=1;
let moneyFlowStageGestureState=null;
function getMoneyFlowEffectiveTheme(){
  return moneyFlowViewerTheme==='dark'||moneyFlowViewerTheme==='light'?moneyFlowViewerTheme:(darkMode?'dark':'light');
}
function applyMoneyFlowViewerTheme(){
  const shell=document.getElementById('money-flow-fullscreen-shell');
  const effectiveTheme=getMoneyFlowEffectiveTheme();
  if(shell){
    shell.classList.remove('money-flow-theme-light','money-flow-theme-dark');
    shell.classList.add(effectiveTheme==='dark'?'money-flow-theme-dark':'money-flow-theme-light');
  }
  const lightBtn=document.getElementById('money-flow-theme-light');
  const darkBtn=document.getElementById('money-flow-theme-dark');
  if(lightBtn){
    lightBtn.classList.toggle('active',effectiveTheme==='light');
    lightBtn.setAttribute('aria-pressed',effectiveTheme==='light'?'true':'false');
  }
  if(darkBtn){
    darkBtn.classList.toggle('active',effectiveTheme==='dark');
    darkBtn.setAttribute('aria-pressed',effectiveTheme==='dark'?'true':'false');
  }
}
function setMoneyFlowViewerTheme(theme){
  const nextTheme=theme==='dark'?'dark':theme==='light'?'light':'auto';
  moneyFlowViewerTheme=moneyFlowViewerTheme===nextTheme?'auto':nextTheme;
  localStorage.setItem('ft_money_flow_theme',moneyFlowViewerTheme);
  applyMoneyFlowViewerTheme();
}
function getMoneyFlowMonthLabel(monthKey=currentMonthKey()){
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-PH',{month:'short',year:'numeric'});
}
function getMoneyFlowSummaryMarkup(data){
  if(!data||!data.hasActivity)return'';
  const spendingOutflow=Math.max(Number(data.totalOutflow||0)-Number(data.savingsOutflow||0),0);
  const summaryPills=[
    `<div class="money-flow-pill money-flow-pill-income">Income <strong>${fmtShort(data.totalIncome)}</strong></div>`,
    `<div class="money-flow-pill money-flow-pill-spending">Spending <strong>${fmtShort(spendingOutflow)}</strong></div>`,
    `<div class="money-flow-pill money-flow-pill-savings">Savings <strong>${fmtShort(data.savingsOutflow)}</strong></div>`,
    `<div class="money-flow-pill">${data.accountsUsed} account${data.accountsUsed===1?"":"s"}</div>`
  ];
  if(data.existingBalanceUsed>0)summaryPills.push(`<div class="money-flow-pill money-flow-pill-balance">Balance <strong>${fmtShort(data.existingBalanceUsed)}</strong></div>`);
  return summaryPills.join("");
}
function getMoneyFlowInsight(data){
  if(!data||!data.hasActivity)return "A live view of how money moves through your accounts this month.";
  const total=Number(data.totalOutflow||0);
  const savings=Number(data.savingsOutflow||0);
  if(total<=0)return "Money is moving. Tap the chart to explore the full breakdown.";
  const savePct=Math.round(savings/total*100);
  const spendPct=100-savePct;
  if(savePct>=20)return savePct+"% of your outflow went to savings this month. Strong discipline.";
  if(savePct>0)return spendPct+"% spending, "+savePct+"% savings this month. Tap to explore the full breakdown.";
  return "All outflow went to spending this month. Tap the chart to see where it went.";
}
function getMoneyFlowCaption(data){
  return data&&data.existingBalanceUsed>0?"Small categories grouped into Other. Existing Balance shown when an account spent more than its recorded income.":"Small categories grouped into Other.";
}
const MONEY_FLOW_FILTERS=[
  {key:'all',label:'All'},
  {key:'income',label:'Income'},
  {key:'spending',label:'Spending'},
  {key:'savings',label:'Savings'},
  {key:'debt',label:'Debt'}
];
let moneyFlowViewerFilter='all';
let moneyFlowViewerSelection=null;
let moneyFlowDrawerMode='peek';
let moneyFlowDrawerSuppressToggleUntil=0;
let moneyFlowFitScale=1;
let moneyFlowSuppressTapUntil=0;
let moneyFlowLastBackgroundTapAt=0;
function getMoneyFlowAllNodes(data){
  return[...(data?.sources||[]),...(data?.accounts||[]),...(data?.categories||[])];
}
function getMoneyFlowNodeMap(data){
  return new Map(getMoneyFlowAllNodes(data).map(node=>[node.id,node]));
}
function getMoneyFlowLinkMap(data){
  return new Map((data?.links||[]).map(link=>[link.id,link]));
}
function getMoneyFlowNodeKind(nodeId=''){
  if(String(nodeId).startsWith('source:'))return'source';
  if(String(nodeId).startsWith('account:'))return'account';
  return'category';
}
function fmtSignedMoneyFlow(value){
  return fmtSigned(value);
}
function getMoneyFlowPercentLabel(value,total){
  return total>0?`${Math.round((Number(value||0)/Number(total||0))*100)}%`:'0%';
}
function getMoneyFlowFilterContext(data,filterMode=moneyFlowViewerFilter){
  const linkIds=new Set();
  const nodeIds=new Set();
  const categoriesById=new Map((data?.categories||[]).map(category=>[category.id,category]));
  const allLinks=data?.links||[];
  const sourceLinks=allLinks.filter(link=>getMoneyFlowNodeKind(link.source)==='source');
  const accountLinks=allLinks.filter(link=>getMoneyFlowNodeKind(link.source)==='account');
  const addLink=link=>{
    linkIds.add(link.id);
    nodeIds.add(link.source);
    nodeIds.add(link.target);
  };
  if(filterMode==='income'){
    sourceLinks.forEach(addLink);
    return{linkIds,nodeIds};
  }
  if(filterMode==='spending'){
    const spendingLinks=accountLinks.filter(link=>{
      const category=categoriesById.get(link.target);
      return !!(category&&(category.label==='Other'||(category.group==='spending'&&category.label!=='Debt Payment')));
    });
    const accountIds=new Set(spendingLinks.map(link=>link.source));
    spendingLinks.forEach(addLink);
    sourceLinks.filter(link=>accountIds.has(link.target)).forEach(addLink);
    return{linkIds,nodeIds};
  }
  if(filterMode==='savings'){
    const savingsLinks=accountLinks.filter(link=>{
      const category=categoriesById.get(link.target);
      return !!(category&&category.group==='savings');
    });
    const accountIds=new Set(savingsLinks.map(link=>link.source));
    savingsLinks.forEach(addLink);
    sourceLinks.filter(link=>accountIds.has(link.target)).forEach(addLink);
    return{linkIds,nodeIds};
  }
  if(filterMode==='debt'){
    const debtLinks=accountLinks.filter(link=>link.target==='category:Debt Payment');
    const accountIds=new Set(debtLinks.map(link=>link.source));
    debtLinks.forEach(addLink);
    sourceLinks.filter(link=>accountIds.has(link.target)).forEach(addLink);
    return{linkIds,nodeIds};
  }
  allLinks.forEach(addLink);
  return{linkIds,nodeIds};
}
function getMoneyFlowViewState(data,filterMode=moneyFlowViewerFilter,selection=moneyFlowViewerSelection){
  const allNodes=getMoneyFlowAllNodes(data);
  const visibleContext=getMoneyFlowFilterContext(data,filterMode);
  const visibleNodeIds=filterMode==='all'?new Set(allNodes.map(node=>node.id)):visibleContext.nodeIds;
  const visibleLinkIds=filterMode==='all'?new Set((data?.links||[]).map(link=>link.id)):visibleContext.linkIds;
  let activeNodeIds=new Set(visibleNodeIds);
  let activeLinkIds=new Set(visibleLinkIds);
  const selectedNodeIds=new Set();
  const selectedLinkIds=new Set();
  let normalizedSelection=selection;
  if(selection&&selection.type==='node'&&visibleNodeIds.has(selection.id)){
    const connectedLinks=(data?.links||[]).filter(link=>visibleLinkIds.has(link.id)&&(link.source===selection.id||link.target===selection.id));
    activeNodeIds=new Set([selection.id]);
    activeLinkIds=new Set(connectedLinks.map(link=>link.id));
    connectedLinks.forEach(link=>{
      activeNodeIds.add(link.source);
      activeNodeIds.add(link.target);
    });
    selectedNodeIds.add(selection.id);
    if(!connectedLinks.length)normalizedSelection=null;
  }else if(selection&&selection.type==='link'&&visibleLinkIds.has(selection.id)){
    const link=(data?.links||[]).find(item=>item.id===selection.id);
    if(link){
      activeLinkIds=new Set([link.id]);
      activeNodeIds=new Set([link.source,link.target]);
      selectedLinkIds.add(link.id);
    }else{
      normalizedSelection=null;
    }
  }else if(selection){
    normalizedSelection=null;
  }
  if(!normalizedSelection){
    activeNodeIds=filterMode==='all'?new Set(allNodes.map(node=>node.id)):visibleNodeIds;
    activeLinkIds=filterMode==='all'?new Set((data?.links||[]).map(link=>link.id)):visibleLinkIds;
  }
  return{filterMode,selection:normalizedSelection,visibleNodeIds,visibleLinkIds,activeNodeIds,activeLinkIds,selectedNodeIds,selectedLinkIds};
}
function getMoneyFlowFilterLabel(filterMode=moneyFlowViewerFilter){
  return MONEY_FLOW_FILTERS.find(filter=>filter.key===filterMode)?.label||'All';
}
function getMoneyFlowDrawerHandleMarkup(opts={}){
  const expanded=!!opts.expanded;
  const ariaLabel=opts.ariaLabel||(expanded?'Collapse money flow details':'Show money flow details');
  const label=opts.label||'';
  const meta=opts.meta||'';
  const arrow=expanded?'›':'‹';
  return`<button class="money-flow-side-drawer-tab ${expanded?'is-open':'is-peek'}" type="button" aria-label="${esc(ariaLabel)}" onclick="toggleMoneyFlowDrawer()"><span class="money-flow-side-drawer-arrow" aria-hidden="true">${arrow}</span>${label?`<span class="money-flow-side-drawer-label">${esc(label)}</span>`:''}${meta?`<span class="money-flow-side-drawer-meta">${esc(meta)}</span>`:''}</button>`;
}
function getMoneyFlowDefaultTrayData(data,state){
  const filterMode=state.filterMode||'all';
  const visibleLinks=(data.links||[]).filter(link=>state.visibleLinkIds.has(link.id));
  const visibleAccounts=(data.accounts||[]).filter(account=>state.visibleNodeIds.has(account.id));
  const topSource=(data.sources||[]).filter(source=>state.visibleNodeIds.has(source.id))[0]||(data.sources||[])[0];
  const topAccount=visibleAccounts.sort((a,b)=>{
    const aFlow=visibleLinks.filter(link=>link.source===a.id||link.target===a.id).reduce((sum,link)=>sum+Number(link.value||0),0);
    const bFlow=visibleLinks.filter(link=>link.source===b.id||link.target===b.id).reduce((sum,link)=>sum+Number(link.value||0),0);
    return bFlow-aFlow;
  })[0]||(data.accounts||[])[0];
  let topOutflow=(data.categories||[]).filter(category=>state.visibleNodeIds.has(category.id))[0]||(data.categories||[])[0];
  let trackedTotal=0;
  if(filterMode==='income'){
    trackedTotal=visibleLinks.filter(link=>getMoneyFlowNodeKind(link.source)==='source').reduce((sum,link)=>sum+Number(link.value||0),0);
    topOutflow=topAccount;
  }else if(filterMode==='savings'){
    const savingsCategories=(data.categories||[]).filter(category=>category.group==='savings'&&state.visibleNodeIds.has(category.id));
    topOutflow=savingsCategories[0]||topOutflow;
    trackedTotal=savingsCategories.reduce((sum,category)=>sum+Number(category.total||0),0);
  }else if(filterMode==='debt'){
    topOutflow=(data.categories||[]).find(category=>category.id==='category:Debt Payment')||topOutflow;
    trackedTotal=visibleLinks.filter(link=>link.target==='category:Debt Payment').reduce((sum,link)=>sum+Number(link.value||0),0);
  }else if(filterMode==='spending'){
    const spendingCategories=(data.categories||[]).filter(category=>state.visibleNodeIds.has(category.id)&&category.label!=='Debt Payment'&&(category.label==='Other'||category.group==='spending'));
    topOutflow=spendingCategories[0]||topOutflow;
    trackedTotal=spendingCategories.reduce((sum,category)=>sum+Number(category.total||0),0);
  }else{
    trackedTotal=Number(data.totalOutflow||0);
  }
  const trayTitle=filterMode==='all'?'Flow map':`${getMoneyFlowFilterLabel(filterMode)} routes`;
  const trayHint=filterMode==='all'?'Tap a node or connector to focus a route. Double tap empty space to reset zoom.':`Showing ${getMoneyFlowFilterLabel(filterMode).toLowerCase()} routes. Tap a node or connector for details.`;
  return{
    filterMode,
    visibleLinks,
    topSource,
    topAccount,
    topOutflow,
    trackedTotal,
    trayTitle,
    trayHint,
    monthLabel:getMoneyFlowMonthLabel(data.monthKey||currentMonthKey())
  };
}
function getMoneyFlowPeekDrawerMarkup(data,state){
  const summary=getMoneyFlowDefaultTrayData(data,state);
  const routeCount=summary.visibleLinks.length;
  const routeLabel=`${routeCount} route${routeCount===1?'':'s'}`;
  return`<div class="money-flow-detail-tray money-flow-side-drawer money-flow-side-drawer-peek" id="money-flow-detail-drawer" data-drawer-mode="peek">${getMoneyFlowDrawerHandleMarkup({label:'Flow map',meta:routeCount?String(routeCount):'0',ariaLabel:'Show money flow details'})}</div>`;
}
function getMoneyFlowDefaultTrayMarkup(data,state){
  const summary=getMoneyFlowDefaultTrayData(data,state);
  if(!summary.visibleLinks.length){
    return`<div class="money-flow-detail-tray money-flow-side-drawer money-flow-side-drawer-open money-flow-detail-tray-compact" id="money-flow-detail-drawer" data-drawer-mode="open">${getMoneyFlowDrawerHandleMarkup({expanded:true})}<div class="money-flow-side-drawer-panel"><div class="money-flow-detail-head"><div><div class="money-flow-detail-kicker">${esc(getMoneyFlowFilterLabel(summary.filterMode))}</div><div class="money-flow-detail-title">No matching routes</div></div></div><div class="money-flow-detail-hint">This filter does not have tracked flow in ${esc(summary.monthLabel)}. Try another filter or switch back to All.</div></div></div>`;
  }
  return`<div class="money-flow-detail-tray money-flow-side-drawer money-flow-side-drawer-open money-flow-detail-tray-compact" id="money-flow-detail-drawer" data-drawer-mode="open">${getMoneyFlowDrawerHandleMarkup({expanded:true})}<div class="money-flow-side-drawer-panel"><div class="money-flow-detail-head"><div><div class="money-flow-detail-kicker">${esc(summary.monthLabel)}</div><div class="money-flow-detail-title">${summary.trayTitle}</div></div><div class="money-flow-detail-pill">${summary.visibleLinks.length} route${summary.visibleLinks.length===1?'':'s'}</div></div><div class="money-flow-detail-stats money-flow-detail-stats-compact"><div class="money-flow-detail-stat"><span class="money-flow-detail-label">Top in</span><strong>${summary.topSource?`${esc(summary.topSource.label)} ${fmtShort(summary.topSource.total)}`:'--'}</strong></div><div class="money-flow-detail-stat"><span class="money-flow-detail-label">Top account</span><strong>${summary.topAccount?`${esc(summary.topAccount.label)} ${fmtShort(summary.topAccount.total)}`:'--'}</strong></div><div class="money-flow-detail-stat"><span class="money-flow-detail-label">${summary.filterMode==='income'?'Tracked inflow':'Top outflow'}</span><strong>${summary.filterMode==='income'?fmtShort(summary.trackedTotal):(summary.topOutflow?`${esc(summary.topOutflow.label)} ${fmtShort(summary.topOutflow.total)}`:'--')}</strong></div></div><div class="money-flow-detail-hint">${summary.trayHint} Tracked total: ${fmt(summary.trackedTotal)}.</div></div></div>`;
}
function getMoneyFlowSelectionTrayMarkup(data,state){
  const nodeMap=getMoneyFlowNodeMap(data);
  const linkMap=getMoneyFlowLinkMap(data);
  if(!state.selection)return getMoneyFlowDefaultTrayMarkup(data,state);
  if(state.selection.type==='link'){
    const link=linkMap.get(state.selection.id);
    if(!link)return getMoneyFlowDefaultTrayMarkup(data,state);
    const source=nodeMap.get(link.source);
    const target=nodeMap.get(link.target);
    const shareBase=getMoneyFlowNodeKind(link.source)==='source'?((data.totalIncome||0)+(data.existingBalanceUsed||0)):Math.max(Number(data.totalOutflow||0),1);
    const routeType=getMoneyFlowNodeKind(link.source)==='source'?'Income route':'Outflow route';
    return`<div class="money-flow-detail-tray money-flow-side-drawer money-flow-side-drawer-open" id="money-flow-detail-drawer" data-drawer-mode="open">${getMoneyFlowDrawerHandleMarkup({expanded:true})}<div class="money-flow-side-drawer-panel"><div class="money-flow-detail-head"><div><div class="money-flow-detail-kicker">${routeType}</div><div class="money-flow-detail-title">${source?esc(source.label):'Source'} to ${target?esc(target.label):'Target'}</div><div class="money-flow-detail-sub">This connector represents one tracked route in your money map.</div></div><div class="money-flow-detail-pill">${fmtShort(link.value)}</div></div><div class="money-flow-detail-stats"><div class="money-flow-detail-stat"><span class="money-flow-detail-label">Route value</span><strong>${fmt(link.value)}</strong></div><div class="money-flow-detail-stat"><span class="money-flow-detail-label">Share</span><strong>${getMoneyFlowPercentLabel(link.value,shareBase)}</strong></div><div class="money-flow-detail-stat"><span class="money-flow-detail-label">Stage</span><strong>${routeType}</strong></div></div><div class="money-flow-detail-hint">Tap empty space to clear focus. Double tap empty space to reset zoom.</div></div></div>`;
  }
  const node=nodeMap.get(state.selection.id);
  if(!node)return getMoneyFlowDefaultTrayMarkup(data,state);
  const connectedLinks=(data.links||[]).filter(link=>state.visibleLinkIds.has(link.id)&&(link.source===node.id||link.target===node.id));
  const incomingLinks=connectedLinks.filter(link=>link.target===node.id).sort((a,b)=>b.value-a.value);
  const outgoingLinks=connectedLinks.filter(link=>link.source===node.id).sort((a,b)=>b.value-a.value);
  const incomingTotal=incomingLinks.reduce((sum,link)=>sum+Number(link.value||0),0);
  const outgoingTotal=outgoingLinks.reduce((sum,link)=>sum+Number(link.value||0),0);
  const topIn=nodeMap.get(incomingLinks[0]?.source||'');
  const topOut=nodeMap.get(outgoingLinks[0]?.target||'');
  const kind=getMoneyFlowNodeKind(node.id);
  let kicker='Node focus';
  let subtitle='This node is part of the currently visible flow.';
  let stats=[];
  if(kind==='source'){
    kicker='Income source';
    subtitle='Tracks how this source enters your accounts this month.';
    stats=[
      {label:'Flow',value:fmt(node.total)},
      {label:'Share',value:getMoneyFlowPercentLabel(node.total,(data.totalIncome||0)+(data.existingBalanceUsed||0))},
      {label:'Sent to',value:topOut?esc(topOut.label):'--'}
    ];
  }else if(kind==='account'){
    kicker='Account';
    subtitle='Shows what came into this account and where it went next.';
    stats=[
      {label:'In',value:fmt(incomingTotal)},
      {label:'Out',value:fmt(outgoingTotal)},
      {label:'Net',value:fmtSignedMoneyFlow(incomingTotal-outgoingTotal)}
    ];
  }else{
    kicker=node.label==='Debt Payment'?'Debt outflow':node.group==='savings'?'Savings outflow':'Spending outflow';
    subtitle='Shows how much this category received from your tracked accounts.';
    stats=[
      {label:'Received',value:fmt(incomingTotal||node.total)},
      {label:'Share',value:getMoneyFlowPercentLabel(node.total,Math.max(Number(data.totalOutflow||0),1))},
      {label:'From',value:topIn?esc(topIn.label):'--'}
    ];
  }
  return`<div class="money-flow-detail-tray money-flow-side-drawer money-flow-side-drawer-open" id="money-flow-detail-drawer" data-drawer-mode="open">${getMoneyFlowDrawerHandleMarkup({expanded:true})}<div class="money-flow-side-drawer-panel"><div class="money-flow-detail-head"><div><div class="money-flow-detail-kicker">${kicker}</div><div class="money-flow-detail-title">${esc(node.label)}</div><div class="money-flow-detail-sub">${subtitle}</div></div><div class="money-flow-detail-pill">${connectedLinks.length} route${connectedLinks.length===1?'':'s'}</div></div><div class="money-flow-detail-stats">${stats.map(stat=>`<div class="money-flow-detail-stat"><span class="money-flow-detail-label">${stat.label}</span><strong>${stat.value}</strong></div>`).join('')}</div><div class="money-flow-detail-hint">${topOut?`Largest next step: ${esc(topOut.label)}.`:topIn?`Largest source: ${esc(topIn.label)}.`:'Tap empty space to clear focus.'} Double tap empty space to reset zoom.</div></div></div>`;
}
function getMoneyFlowDetailTrayMarkup(data,state){
  if(moneyFlowDrawerMode==='peek')return getMoneyFlowPeekDrawerMarkup(data,state);
  return state.selection?getMoneyFlowSelectionTrayMarkup(data,state):getMoneyFlowDefaultTrayMarkup(data,state);
}
function getMoneyFlowFilterChipsMarkup(){
  return`<div class="money-flow-filter-bar">${MONEY_FLOW_FILTERS.map(filter=>`<button class="money-flow-filter-chip ${moneyFlowViewerFilter===filter.key?'active':''}" type="button" aria-pressed="${moneyFlowViewerFilter===filter.key?'true':'false'}" onclick="setMoneyFlowFilter('${filter.key}')">${filter.label}</button>`).join('')}</div>`;
}
function makeMoneyFlowSvg(data,opts={}){
  const width=opts.width||960;
  const height=opts.height||470;
  const nodeWidth=opts.nodeWidth||148;
  const marginTop=opts.marginTop||54;
  const marginBottom=opts.marginBottom||18;
  const gapY=opts.gapY||18;
  const minNodeHeight=opts.minNodeHeight||22;
  const stageLabelY=opts.stageLabelY||22;
  const nodeRadius=opts.nodeRadius||18;
  const accentWidth=opts.accentWidth||9;
  const labelX=opts.labelX||14;
  const labelY=opts.labelY||17;
  const subLabelY=opts.subLabelY||34;
  const labelMaxCategory=opts.labelMaxCategory||17;
  const labelMaxDefault=opts.labelMaxDefault||18;
  const svgClass=opts.svgClass||'money-flow-svg';
  const ariaLabel=opts.ariaLabel||'Money flow Sankey diagram for the current month';
  const svgIdAttr=opts.svgId?` id="${opts.svgId}"`:'';
  const linkClipId=opts.linkClipId||`${opts.svgId||'money-flow-links'}-clip`;
  const interactive=!!opts.interactive;
  const viewState=interactive?getMoneyFlowViewState(data,opts.filterMode||moneyFlowViewerFilter,opts.selection||moneyFlowViewerSelection):null;
  const focusMode=interactive&&!!(viewState?.selection||((opts.filterMode||moneyFlowViewerFilter)!=='all'));
  const columns=[data.sources,data.accounts,data.categories];
  const maxNodes=Math.max(...columns.map(column=>column.length),1);
  const maxTotal=Math.max(...columns.map(column=>column.reduce((sum,node)=>sum+Number(node.total||0),0)),1);
  const usableHeight=height-marginTop-marginBottom-gapY*Math.max(maxNodes-1,0);
  const scale=usableHeight/maxTotal;
  const xPositions=[20,Math.round((width-nodeWidth)/2),width-nodeWidth-20];
  const linkClipRects=[
    {x:xPositions[0]+nodeWidth,y:0,width:Math.max(xPositions[1]-(xPositions[0]+nodeWidth),0),height},
    {x:xPositions[1]+nodeWidth,y:0,width:Math.max(xPositions[2]-(xPositions[1]+nodeWidth),0),height}
  ].filter(rect=>rect.width>0);

  columns.forEach((column,columnIndex)=>{
    const totalH=column.reduce((s,n)=>s+Math.max(minNodeHeight,Number(n.total||0)*scale),0)+gapY*Math.max(column.length-1,0);
    const avail=height-marginTop-marginBottom;
    let currentY=marginTop+Math.max(0,Math.round((avail-totalH)/2));
    column.forEach(node=>{
      node.x=xPositions[columnIndex];
      node.y=currentY;
      node.height=Math.max(minNodeHeight,Number(node.total||0)*scale);
      node.inOffset=0;
      node.outOffset=0;
      currentY+=node.height+gapY;
    });
  });

  const nodeById=new Map([...data.sources,...data.accounts,...data.categories].map(node=>[node.id,node]));
  const paths=data.links.map(link=>{
    const source=nodeById.get(link.source);
    const target=nodeById.get(link.target);
    if(!source||!target)return'';
    const thickness=Math.max(Number(link.value||0)*scale,6);
    const x1=source.x+nodeWidth;
    const y1=source.y+source.outOffset+(thickness/2);
    source.outOffset+=thickness;
    const x2=target.x;
    const y2=target.y+target.inOffset+(thickness/2);
    target.inOffset+=thickness;
    const curve=Math.max((x2-x1)*.38,48);
    const linkClasses=['money-flow-link'];
    if(interactive){
      linkClasses.push('is-interactive');
      if(focusMode){
        if(viewState?.selectedLinkIds.has(link.id))linkClasses.push('is-selected');
        else if(viewState?.activeLinkIds.has(link.id))linkClasses.push('is-active');
        else linkClasses.push('is-muted');
      }
    }
    const dataAttr=interactive?` data-link-id="${encodeURIComponent(link.id)}"`:'';
    return`<path class="${linkClasses.join(' ')}"${dataAttr} d="M ${x1} ${y1} C ${x1+curve} ${y1}, ${x2-curve} ${y2}, ${x2} ${y2}" stroke="${link.color}" stroke-width="${thickness}"></path>`;
  }).join('');

  const stageLabels=[{x:xPositions[0]+nodeWidth/2,label:'Income'},{x:xPositions[1]+nodeWidth/2,label:'Accounts'},{x:xPositions[2]+nodeWidth/2,label:'Outflows'}];
  const nodes=[...data.sources,...data.accounts,...data.categories].map(node=>{
    const label=`${node.icon?`${node.icon} `:''}${truncateMoneyFlowLabel(node.label,node.id.startsWith('category:')?labelMaxCategory:labelMaxDefault)}`;
    const amountLine=node.height>=Math.max(38,subLabelY+4)?`<text class="money-flow-node-sub" x="${node.x+labelX}" y="${node.y+subLabelY}">${esc(fmtShort(node.total))}</text>`:'';
    const nodeClasses=['money-flow-node-group'];
    if(interactive){
      nodeClasses.push('is-interactive');
      if(focusMode){
        if(viewState?.selectedNodeIds.has(node.id))nodeClasses.push('is-selected');
        else if(viewState?.activeNodeIds.has(node.id))nodeClasses.push('is-active');
        else nodeClasses.push('is-muted');
      }
    }
    const dataAttr=interactive?` data-node-id="${encodeURIComponent(node.id)}"`:'';
    return`<g class="${nodeClasses.join(' ')}"${dataAttr}><rect class="money-flow-node" x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${node.height}" rx="${nodeRadius}"></rect><rect class="money-flow-node-tint" x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${node.height}" rx="${nodeRadius}" fill="${node.color}" fill-opacity="0.07"></rect><rect class="money-flow-node-accent" x="${node.x}" y="${node.y}" width="${accentWidth}" height="${node.height}" rx="${nodeRadius}" fill="${node.color}"></rect><text class="money-flow-node-label" x="${node.x+labelX}" y="${node.y+labelY}">${esc(label)}</text>${amountLine}</g>`;
  }).join('');
  const defs=linkClipRects.length?`<defs><clipPath id="${linkClipId}" clipPathUnits="userSpaceOnUse">${linkClipRects.map(rect=>`<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"></rect>`).join('')}</clipPath></defs>`:'';
  const linkLayer=linkClipRects.length?`<g clip-path="url(#${linkClipId})">${paths}</g>`:`<g>${paths}</g>`;
  return`<svg${svgIdAttr} class="${svgClass}" data-base-width="${width}" data-base-height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ariaLabel)}">${defs}<g>${stageLabels.map(stage=>`<text class="money-flow-stage" x="${stage.x}" y="${stageLabelY}" text-anchor="middle">${stage.label}</text><line class="money-flow-stage-line" x1="${stage.x-28}" y1="${stageLabelY+7}" x2="${stage.x+28}" y2="${stageLabelY+7}" stroke-linecap="round"></line>`).join('')}</g>${linkLayer}<g>${nodes}</g></svg>`;
}
function applyMoneyFlowZoom(nextZoom=moneyFlowZoom){
  const svg=document.getElementById('money-flow-fullscreen-svg');
  if(!svg)return;
  moneyFlowZoom=Math.min(MONEY_FLOW_ZOOM_MAX,Math.max(MONEY_FLOW_ZOOM_MIN,Number(nextZoom)||1));
  const baseWidth=Number(svg.getAttribute('data-base-width')||1440);
  const baseHeight=Number(svg.getAttribute('data-base-height')||900);
  const stage=document.getElementById('money-flow-fullscreen-stage');
  const effectiveScale=moneyFlowZoom*(isMoneyFlowRotatedFallback()?moneyFlowFitScale:1);
  const scaledWidth=Math.round(baseWidth*effectiveScale);
  svg.style.width=`${scaledWidth}px`;
  if(stage){
    if(isMoneyFlowRotatedFallback()){
      const scaledHeight=Math.round(baseHeight*effectiveScale);
      stage.style.setProperty('--money-flow-rotated-box-width',`${scaledHeight}px`);
      stage.style.setProperty('--money-flow-rotated-box-height',`${scaledWidth}px`);
    }else{
      stage.style.removeProperty('--money-flow-rotated-box-width');
      stage.style.removeProperty('--money-flow-rotated-box-height');
    }
  }
  const zoomOutBtn=document.getElementById('money-flow-zoom-out');
  const zoomInBtn=document.getElementById('money-flow-zoom-in');
  const zoomResetBtn=document.getElementById('money-flow-zoom-reset');
  const zoomLabel=moneyFlowZoom>=1?`${moneyFlowZoom.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')}x`:`${Math.round(moneyFlowZoom*100)}%`;
  if(zoomOutBtn)zoomOutBtn.disabled=moneyFlowZoom<=MONEY_FLOW_ZOOM_MIN+.001;
  if(zoomInBtn)zoomInBtn.disabled=moneyFlowZoom>=MONEY_FLOW_ZOOM_MAX-.001;
  if(zoomResetBtn){
    zoomResetBtn.disabled=Math.abs(moneyFlowZoom-1)<.001;
    zoomResetBtn.textContent=zoomLabel;
  }
}
function zoomMoneyFlowAroundPoint(nextZoom,clientX,clientY){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  const svg=document.getElementById('money-flow-fullscreen-svg');
  if(!stage||!svg)return;
  const prevZoom=Math.max(Number(moneyFlowZoom||1),.01);
  const rect=stage.getBoundingClientRect();
  const focusX=(clientX-rect.left)+stage.scrollLeft;
  const focusY=(clientY-rect.top)+stage.scrollTop;
  applyMoneyFlowZoom(nextZoom);
  const ratio=moneyFlowZoom/prevZoom;
  stage.scrollLeft=(focusX*ratio)-(clientX-rect.left);
  stage.scrollTop=(focusY*ratio)-(clientY-rect.top);
}
function stepMoneyFlowZoom(direction){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  if(!stage)return applyMoneyFlowZoom(moneyFlowZoom+(direction*MONEY_FLOW_ZOOM_STEP));
  const rect=stage.getBoundingClientRect();
  zoomMoneyFlowAroundPoint(moneyFlowZoom+(direction*MONEY_FLOW_ZOOM_STEP),rect.left+(rect.width/2),rect.top+(rect.height/2));
}
function resetMoneyFlowZoom(){
  applyMoneyFlowZoom(1);
}
function unlockMoneyFlowOrientation(){
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}
}
function fitMoneyFlowStage(){
  const shell=document.getElementById('money-flow-fullscreen-shell');
  const stage=document.getElementById('money-flow-fullscreen-stage');
  const viewer=document.querySelector('#money-flow-fullscreen-content .money-flow-fullscreen-viewer');
  if(!shell||!stage||!viewer)return;
  const pad=isMoneyFlowRotatedFallback()?10:24;
  const topbar=document.querySelector('#money-flow-fullscreen-content .money-flow-fullscreen-topbar');
  const safeTop=(topbar?topbar.offsetHeight:0)+12;
  const safeBottom=0;
  viewer.style.setProperty('--money-flow-safe-top',`${safeTop}px`);
  viewer.style.setProperty('--money-flow-safe-bottom',`${safeBottom}px`);
  const availableWidth=Math.max(shell.clientWidth-pad,320);
  const availableHeight=Math.max(shell.clientHeight-safeTop-safeBottom-pad,180);
  const svg=document.getElementById('money-flow-fullscreen-svg');
  const baseWidth=Number(svg?.getAttribute('data-base-width')||1600);
  if(isMoneyFlowRotatedFallback()){
    let portraitWidth=availableWidth;
    let portraitHeight=Math.round(portraitWidth*(16/9));
    if(portraitHeight>availableHeight){
      portraitHeight=availableHeight;
      portraitWidth=Math.round(portraitHeight*(9/16));
    }
    moneyFlowFitScale=baseWidth>0?(portraitHeight/baseWidth):1;
    stage.style.width=`${portraitWidth}px`;
    stage.style.height=`${portraitHeight}px`;
    applyMoneyFlowZoom(moneyFlowZoom);
    return;
  }
  moneyFlowFitScale=1;
  let displayWidth=availableWidth;
  let displayHeight=Math.round(displayWidth*(9/16));
  if(displayHeight>availableHeight){
    displayHeight=availableHeight;
    displayWidth=Math.round(displayHeight*(16/9));
  }
  stage.style.width=`${displayWidth}px`;
  stage.style.height=`${displayHeight}px`;
  applyMoneyFlowZoom(moneyFlowZoom);
}
function shouldRotateMoneyFlowFallback(){
  const modal=document.getElementById('modal-money-flow');
  if(!modal||!modal.classList.contains('show'))return false;
  return window.innerWidth<=900&&window.innerHeight>window.innerWidth;
}
function syncMoneyFlowOrientationState(){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  if(stage)stage.classList.toggle('money-flow-stage-force-rotate',shouldRotateMoneyFlowFallback());
  requestAnimationFrame(fitMoneyFlowStage);
}
function isMoneyFlowRotatedFallback(){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  return !!(stage&&stage.classList.contains('money-flow-stage-force-rotate'));
}
function getMoneyFlowPointerDistance(a,b){
  return Math.hypot((b.x||0)-(a.x||0),(b.y||0)-(a.y||0));
}
function getMoneyFlowPointerCenter(a,b){
  return{x:((a.x||0)+(b.x||0))/2,y:((a.y||0)+(b.y||0))/2};
}
function setupMoneyFlowStageGestures(){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  if(!stage||stage.dataset.gesturesBound==='1')return;
  const state={pointers:new Map(),panPointerId:null,panStartX:0,panStartY:0,panScrollLeft:0,panScrollTop:0,pinchDistance:0,pinchZoom:1,panMoved:false};
  const refreshSinglePanState=()=>{
    if(state.pointers.size!==1){
      state.panPointerId=null;
      return;
    }
    const [pointerId,pointer]=[...state.pointers.entries()][0];
    state.panPointerId=pointerId;
    state.panStartX=pointer.x;
    state.panStartY=pointer.y;
    state.panScrollLeft=stage.scrollLeft;
    state.panScrollTop=stage.scrollTop;
    state.panMoved=false;
  };
  const handlePointerEnd=e=>{
    const wasPinching=state.pointers.size>=2||state.pinchDistance>0;
    const movedDuringPan=state.panPointerId===e.pointerId&&state.panMoved;
    state.pointers.delete(e.pointerId);
    if(state.pointers.size<2){
      state.pinchDistance=0;
      state.pinchZoom=moneyFlowZoom;
    }
    if(wasPinching||movedDuringPan)moneyFlowSuppressTapUntil=Date.now()+220;
    refreshSinglePanState();
    stage.classList.toggle('is-dragging',state.pointers.size===1);
  };
  stage.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(stage.setPointerCapture)stage.setPointerCapture(e.pointerId);
    if(state.pointers.size===1){
      refreshSinglePanState();
      stage.classList.add('is-dragging');
    }else if(state.pointers.size===2){
      const [first,second]=[...state.pointers.values()];
      state.pinchDistance=getMoneyFlowPointerDistance(first,second)||1;
      state.pinchZoom=moneyFlowZoom;
      stage.classList.remove('is-dragging');
    }
  });
  stage.addEventListener('pointermove',e=>{
    if(!state.pointers.has(e.pointerId))return;
    state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(state.pointers.size>=2){
      const [first,second]=[...state.pointers.values()];
      const nextDistance=getMoneyFlowPointerDistance(first,second)||1;
      const center=getMoneyFlowPointerCenter(first,second);
      e.preventDefault();
      if(state.pinchDistance>0){
        zoomMoneyFlowAroundPoint(state.pinchZoom*(nextDistance/state.pinchDistance),center.x,center.y);
      }
      return;
    }
    if(state.panPointerId!==e.pointerId)return;
    e.preventDefault();
    const dx=e.clientX-state.panStartX;
    const dy=e.clientY-state.panStartY;
    if(Math.abs(dx)>6||Math.abs(dy)>6)state.panMoved=true;
    if(isMoneyFlowRotatedFallback()){
      stage.scrollLeft=state.panScrollLeft-dy;
      stage.scrollTop=state.panScrollTop+dx;
      return;
    }
    stage.scrollLeft=state.panScrollLeft-dx;
    stage.scrollTop=state.panScrollTop-dy;
  },{passive:false});
  stage.addEventListener('pointerup',handlePointerEnd);
  stage.addEventListener('pointercancel',handlePointerEnd);
  stage.addEventListener('lostpointercapture',handlePointerEnd);
  stage.dataset.gesturesBound='1';
  moneyFlowStageGestureState=state;
}
function shouldIgnoreMoneyFlowTap(){
  return Date.now()<moneyFlowSuppressTapUntil;
}
function rerenderMoneyFlowFullscreen(preserveViewport=true){
  renderMoneyFlowFullscreenContent(buildMoneyFlowData(),{preserveViewport});
}
function toggleMoneyFlowDrawer(forceMode=''){
  if(Date.now()<moneyFlowDrawerSuppressToggleUntil)return;
  if(forceMode==='peek'||forceMode==='summary'){
    moneyFlowDrawerMode=forceMode;
  }else{
    moneyFlowDrawerMode=moneyFlowDrawerMode==='peek'?'summary':'peek';
  }
  rerenderMoneyFlowFullscreen(true);
}
function setupMoneyFlowDrawerGestures(){
  const drawer=document.getElementById('money-flow-detail-drawer');
  const handle=drawer?drawer.querySelector('.money-flow-side-drawer-tab'):null;
  if(!drawer||!handle||handle.dataset.gesturesBound==='1')return;
  const state={pointerId:null,startX:0,startY:0,dragging:false};
  const finish=e=>{
    if(state.pointerId!==e.pointerId)return;
    const dx=e.clientX-state.startX;
    const dy=e.clientY-state.startY;
    const drawerMode=drawer.getAttribute('data-drawer-mode')||'peek';
    if(Math.abs(dx)>Math.abs(dy)+8){
      if(drawerMode==='peek'&&dx<-24){
        moneyFlowDrawerMode='summary';
        moneyFlowDrawerSuppressToggleUntil=Date.now()+220;
        rerenderMoneyFlowFullscreen(true);
      }else if(drawerMode!=='peek'&&dx>24){
        moneyFlowDrawerMode='peek';
        moneyFlowDrawerSuppressToggleUntil=Date.now()+220;
        rerenderMoneyFlowFullscreen(true);
      }
    }
    state.pointerId=null;
    state.dragging=false;
  };
  handle.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    state.pointerId=e.pointerId;
    state.startX=e.clientX;
    state.startY=e.clientY;
    state.dragging=false;
    if(handle.setPointerCapture)handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove',e=>{
    if(state.pointerId!==e.pointerId)return;
    const dx=e.clientX-state.startX;
    const dy=e.clientY-state.startY;
    if(Math.abs(dx)>Math.abs(dy)+6){
      state.dragging=true;
      e.preventDefault();
    }
  },{passive:false});
  handle.addEventListener('pointerup',finish);
  handle.addEventListener('pointercancel',finish);
  handle.addEventListener('lostpointercapture',finish);
  handle.dataset.gesturesBound='1';
}
function setMoneyFlowFilter(filter){
  if(!MONEY_FLOW_FILTERS.find(item=>item.key===filter))return;
  const hadSelection=!!moneyFlowViewerSelection;
  moneyFlowViewerFilter=filter;
  moneyFlowViewerSelection=null;
  if(hadSelection)moneyFlowDrawerMode='peek';
  moneyFlowLastBackgroundTapAt=0;
  rerenderMoneyFlowFullscreen(true);
}
function handleMoneyFlowNodeTap(nodeId){
  if(shouldIgnoreMoneyFlowTap())return;
  moneyFlowViewerSelection=moneyFlowViewerSelection&&moneyFlowViewerSelection.type==='node'&&moneyFlowViewerSelection.id===nodeId?null:{type:'node',id:nodeId};
  moneyFlowDrawerMode=moneyFlowViewerSelection?'summary':'peek';
  moneyFlowLastBackgroundTapAt=0;
  rerenderMoneyFlowFullscreen(true);
}
function handleMoneyFlowLinkTap(linkId){
  if(shouldIgnoreMoneyFlowTap())return;
  moneyFlowViewerSelection=moneyFlowViewerSelection&&moneyFlowViewerSelection.type==='link'&&moneyFlowViewerSelection.id===linkId?null:{type:'link',id:linkId};
  moneyFlowDrawerMode=moneyFlowViewerSelection?'summary':'peek';
  moneyFlowLastBackgroundTapAt=0;
  rerenderMoneyFlowFullscreen(true);
}
function handleMoneyFlowBackgroundTap(){
  if(shouldIgnoreMoneyFlowTap())return;
  const nowTs=Date.now();
  if(nowTs-moneyFlowLastBackgroundTapAt<320){
    moneyFlowLastBackgroundTapAt=0;
    moneyFlowViewerSelection=null;
    moneyFlowDrawerMode='peek';
    moneyFlowDrawerSuppressToggleUntil=0;
    resetMoneyFlowZoom();
    rerenderMoneyFlowFullscreen(false);
    return;
  }
  moneyFlowLastBackgroundTapAt=nowTs;
  if(moneyFlowViewerSelection){
    moneyFlowViewerSelection=null;
    moneyFlowDrawerMode='peek';
    rerenderMoneyFlowFullscreen(true);
  }
}
function setupMoneyFlowInteractiveHandlers(){
  const stage=document.getElementById('money-flow-fullscreen-stage');
  if(!stage||stage.dataset.interactionsBound==='1')return;
  stage.addEventListener('click',function(e){
    if(shouldIgnoreMoneyFlowTap())return;
    const linkEl=e.target.closest('.money-flow-link[data-link-id]');
    if(linkEl){
      handleMoneyFlowLinkTap(decodeURIComponent(linkEl.getAttribute('data-link-id')||''));
      return;
    }
    const nodeEl=e.target.closest('.money-flow-node-group[data-node-id]');
    if(nodeEl){
      handleMoneyFlowNodeTap(decodeURIComponent(nodeEl.getAttribute('data-node-id')||''));
      return;
    }
    handleMoneyFlowBackgroundTap();
  });
  stage.addEventListener('dblclick',function(e){
    if(e.target.closest('.money-flow-link[data-link-id], .money-flow-node-group[data-node-id]'))return;
    e.preventDefault();
    moneyFlowViewerSelection=null;
    moneyFlowDrawerMode='peek';
    moneyFlowDrawerSuppressToggleUntil=0;
    moneyFlowLastBackgroundTapAt=0;
    resetMoneyFlowZoom();
    rerenderMoneyFlowFullscreen(false);
  });
  stage.dataset.interactionsBound='1';
}
function renderMoneyFlowFullscreenContentLegacy(data=buildMoneyFlowData(),opts={}){
  const mount=document.getElementById('money-flow-fullscreen-content');
  if(!mount)return;
  const previousStage=opts.preserveViewport?document.getElementById('money-flow-fullscreen-stage'):null;
  const previousScrollLeft=previousStage?previousStage.scrollLeft:0;
  const previousScrollTop=previousStage?previousStage.scrollTop:0;
  if(!data.hasActivity){
    mount.innerHTML=`<div class="money-flow-fullscreen-viewer"><div class="money-flow-fullscreen-overlay"><div class="money-flow-fullscreen-close"><button class="money-flow-overlay-btn" type="button" aria-label="Close fullscreen money flow" title="Close" onclick="closeMoneyFlowFullscreen()">X</button></div></div><div class="money-flow-fullscreen-stage money-flow-fullscreen-stage-empty" id="money-flow-fullscreen-stage"><div class="empty"><div class="empty-icon">🌊</div><div class="empty-text">${esc(data.reason||'No money-flow activity recorded yet this month.')}</div></div></div></div>`;
    applyMoneyFlowViewerTheme();
    syncMoneyFlowOrientationState();
    return;
  }
  mount.innerHTML=`<div class="money-flow-fullscreen-viewer"><div class="money-flow-fullscreen-overlay"><div class="money-flow-fullscreen-controls"><button class="money-flow-overlay-btn" id="money-flow-zoom-out" type="button" aria-label="Zoom out" title="Zoom out" onclick="stepMoneyFlowZoom(-1)">-</button><button class="money-flow-overlay-btn" id="money-flow-zoom-reset" type="button" aria-label="Reset zoom" title="Reset zoom" onclick="resetMoneyFlowZoom()">1x</button><button class="money-flow-overlay-btn" id="money-flow-zoom-in" type="button" aria-label="Zoom in" title="Zoom in" onclick="stepMoneyFlowZoom(1)">+</button><button class="money-flow-overlay-btn money-flow-theme-btn" id="money-flow-theme-light" type="button" aria-label="Use light mode" title="Light mode" onclick="setMoneyFlowViewerTheme('light')">☀</button><button class="money-flow-overlay-btn money-flow-theme-btn" id="money-flow-theme-dark" type="button" aria-label="Use dark mode" title="Dark mode" onclick="setMoneyFlowViewerTheme('dark')">🌙</button></div><div class="money-flow-fullscreen-close"><button class="money-flow-overlay-btn" type="button" aria-label="Close fullscreen money flow" title="Close" onclick="closeMoneyFlowFullscreen()">X</button></div></div><div class="money-flow-fullscreen-stage" id="money-flow-fullscreen-stage"><div class="money-flow-fullscreen-canvas">${makeMoneyFlowSvg(data,{width:1600,height:900,nodeWidth:238,marginTop:64,marginBottom:24,gapY:22,minNodeHeight:26,labelMaxCategory:26,labelMaxDefault:24,stageLabelY:26,labelY:21,subLabelY:40,svgClass:'money-flow-svg money-flow-fullscreen-svg',svgId:'money-flow-fullscreen-svg',ariaLabel:'Fullscreen money flow Sankey diagram for the current month'})}</div></div></div>`;
  applyMoneyFlowZoom(moneyFlowZoom);
  applyMoneyFlowViewerTheme();
  setupMoneyFlowStageGestures();
  syncMoneyFlowOrientationState();
}
function renderMoneyFlowFullscreenContent(data=buildMoneyFlowData(),opts={}){
  const mount=document.getElementById('money-flow-fullscreen-content');
  if(!mount)return;
  const previousStage=opts.preserveViewport?document.getElementById('money-flow-fullscreen-stage'):null;
  const previousScrollLeft=previousStage?previousStage.scrollLeft:0;
  const previousScrollTop=previousStage?previousStage.scrollTop:0;
  const emptyReason=esc(data.reason||'No money-flow activity recorded yet this month.');
  if(!data.hasActivity){
    mount.innerHTML=`<div class="money-flow-fullscreen-viewer"><div class="money-flow-fullscreen-overlay"><div class="money-flow-fullscreen-topbar"><div class="money-flow-fullscreen-controls"><button class="money-flow-overlay-btn" type="button" aria-label="Close fullscreen money flow" title="Close" onclick="closeMoneyFlowFullscreen()">X</button></div></div></div><div class="money-flow-fullscreen-stage money-flow-fullscreen-stage-empty" id="money-flow-fullscreen-stage"><div class="empty"><div class="empty-icon">~</div><div class="empty-text">${emptyReason}</div></div></div></div>`;
    applyMoneyFlowViewerTheme();
    syncMoneyFlowOrientationState();
    return;
  }
  const viewState=getMoneyFlowViewState(data,moneyFlowViewerFilter,moneyFlowViewerSelection);
  moneyFlowViewerSelection=viewState.selection||null;
  mount.innerHTML=`<div class="money-flow-fullscreen-viewer"><div class="money-flow-fullscreen-overlay"><div class="money-flow-fullscreen-topbar money-flow-fullscreen-topbar-controls"><div class="money-flow-fullscreen-controls"><button class="money-flow-overlay-btn" id="money-flow-zoom-out" type="button" aria-label="Zoom out" title="Zoom out" onclick="stepMoneyFlowZoom(-1)">-</button><button class="money-flow-overlay-btn" id="money-flow-zoom-reset" type="button" aria-label="Reset zoom" title="Reset zoom" onclick="resetMoneyFlowZoom()">1x</button><button class="money-flow-overlay-btn" id="money-flow-zoom-in" type="button" aria-label="Zoom in" title="Zoom in" onclick="stepMoneyFlowZoom(1)">+</button><button class="money-flow-overlay-btn money-flow-theme-btn" id="money-flow-theme-light" type="button" aria-label="Use light mode" title="Light mode" onclick="setMoneyFlowViewerTheme('light')">&#9728;</button><button class="money-flow-overlay-btn money-flow-theme-btn" id="money-flow-theme-dark" type="button" aria-label="Use dark mode" title="Dark mode" onclick="setMoneyFlowViewerTheme('dark')">&#9790;</button><button class="money-flow-overlay-btn" type="button" aria-label="Close fullscreen money flow" title="Close" onclick="closeMoneyFlowFullscreen()">X</button></div></div></div><div class="money-flow-fullscreen-stage" id="money-flow-fullscreen-stage"><div class="money-flow-fullscreen-canvas">${makeMoneyFlowSvg(data,{width:1600,height:900,nodeWidth:238,marginTop:64,marginBottom:24,gapY:22,minNodeHeight:26,labelMaxCategory:26,labelMaxDefault:24,stageLabelY:26,labelY:21,subLabelY:40,svgClass:'money-flow-svg money-flow-fullscreen-svg',svgId:'money-flow-fullscreen-svg',ariaLabel:'Fullscreen money flow Sankey diagram for the current month',interactive:true,filterMode:moneyFlowViewerFilter,selection:moneyFlowViewerSelection})}</div></div></div>`;
  applyMoneyFlowZoom(moneyFlowZoom);
  applyMoneyFlowViewerTheme();
  setupMoneyFlowStageGestures();
  setupMoneyFlowInteractiveHandlers();
  const stage=document.getElementById('money-flow-fullscreen-stage');
  if(stage&&opts.preserveViewport){
    stage.scrollLeft=previousScrollLeft;
    stage.scrollTop=previousScrollTop;
  }
  syncMoneyFlowOrientationState();
}
function syncMoneyFlowFullscreen(data=buildMoneyFlowData()){
  const modal=document.getElementById('modal-money-flow');
  if(!modal||!modal.classList.contains('show'))return;
  renderMoneyFlowFullscreenContent(data);
}
async function openMoneyFlowFullscreen(){
  const modal=document.getElementById('modal-money-flow');
  const shell=document.getElementById('money-flow-fullscreen-shell');
  if(!modal||!shell)return;
  moneyFlowZoom=1;
  moneyFlowViewerFilter='all';
  moneyFlowViewerSelection=null;
  moneyFlowDrawerMode='peek';
  moneyFlowDrawerSuppressToggleUntil=0;
  moneyFlowSuppressTapUntil=0;
  moneyFlowLastBackgroundTapAt=0;
  renderMoneyFlowFullscreenContent(buildMoneyFlowData());
  openModal('modal-money-flow');
  syncMoneyFlowOrientationState();
  if(document.fullscreenElement!==shell&&shell.requestFullscreen){
    try{await shell.requestFullscreen({navigationUI:'hide'})}catch(e){}
  }
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}
  setTimeout(syncMoneyFlowOrientationState,220);
}
async function closeMoneyFlowFullscreen(){
  const modal=document.getElementById('modal-money-flow');
  const shell=document.getElementById('money-flow-fullscreen-shell');
  if(!modal)return;
  if(document.fullscreenElement===shell){
    try{await document.exitFullscreen()}catch(e){}
  }
  unlockMoneyFlowOrientation();
  moneyFlowViewerSelection=null;
  moneyFlowDrawerMode='peek';
  moneyFlowDrawerSuppressToggleUntil=0;
  moneyFlowSuppressTapUntil=0;
  moneyFlowLastBackgroundTapAt=0;
  if(shell)shell.classList.remove('money-flow-force-rotate');
  closeModal('modal-money-flow');
}
function renderMoneyFlowCard(){
  const mount=document.getElementById('money-flow-card');
  if(!mount)return;
  const data=buildMoneyFlowData();
  const monthLabel=getMoneyFlowMonthLabel(data.monthKey||currentMonthKey());
  const headerActions=`<div class="money-flow-head-actions"><button class="btn btn-sm btn-ghost money-flow-expand-btn" type="button" onclick="openMoneyFlowFullscreen()">Fullscreen</button><span class="card-badge">${monthLabel}</span></div>`;
  if(!data.hasActivity){
    mount.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Money Flow This Month</span><span class="card-badge">${monthLabel}</span></div>${helpMode?'<div class="help-inline">Follow how income moves through accounts into this month\'s categories.</div>':''}<div class="money-flow-meta">A live view of how money is moving through your current month.</div><div id="money-flow-chart" class="money-flow-chart"><div class="empty"><div class="empty-icon">🌊</div><div class="empty-text">${esc(data.reason||'No money-flow activity recorded yet this month.')}</div></div></div></div>`;
    syncMoneyFlowFullscreen(data);
    return;
  }
  mount.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Money Flow This Month</span>${headerActions}</div>${helpMode?'<div class="help-inline">Tracks this month\'s flow from income sources into accounts, then out into your biggest spending and savings categories.</div>':''}<div class="money-flow-meta">${getMoneyFlowInsight(data)}</div><div class="money-flow-summary">${getMoneyFlowSummaryMarkup(data)}</div><div id="money-flow-chart" class="money-flow-chart money-flow-chart-preview" onclick="openMoneyFlowFullscreen()" title="Open fullscreen money flow view">${makeMoneyFlowSvg(data)}</div><div class="money-flow-caption">${getMoneyFlowCaption(data)} <span class="money-flow-inline-link">Tap the chart or use Fullscreen for a closer view.</span></div></div>`;
  syncMoneyFlowFullscreen(data);
}


let safeSpendBreakdownStyle=0;
function setSafeSpendStyle(i){safeSpendBreakdownStyle=i;renderSafeSpendCard();}

function _ssStyle0(s){
  const base=Math.max(s.totalIncome,1);
  const spentW=Math.round(s.spent/base*100);
  const carryW=s.carryoverOverspend>0?Math.round(s.carryoverOverspend/base*100):0;
  const billsW=Math.round(s.upcomingBillsTotal/base*100);
  const bufferW=Math.round(s.buffer/base*100);
  const freeW=Math.max(0,100-spentW-carryW-billsW-bufferW);
  return `
    <div class="alloc-bar">
      <div class="alloc-seg alloc-spent" style="width:${spentW}%"></div>
      ${carryW>0?`<div class="alloc-seg alloc-carry" style="width:${carryW}%"></div>`:''}
      ${billsW>0?`<div class="alloc-seg alloc-bills" style="width:${billsW}%"></div>`:''}
      <div class="alloc-seg alloc-buffer" style="width:${bufferW}%"></div>
      <div class="alloc-seg alloc-free" style="width:${freeW}%"></div>
    </div>
    <div class="alloc-rows">
      <div class="alloc-row" onclick="toggleBreakdown('salary',this)" data-breakdown="salary">
        <span class="alloc-dot alloc-income"></span><span class="alloc-name">Monthly salary</span><span class="alloc-val">+${fmt(s.monthlyIncome)}</span>
      </div>
      <div class="alloc-row" onclick="toggleBreakdown('spent',this)" data-breakdown="spent">
        <span class="alloc-dot alloc-spent"></span><span class="alloc-name">Spent so far</span><span class="alloc-val neg">−${fmt(s.spent)}</span>
      </div>
      ${s.carryoverOverspend>0?`<div class="alloc-row" onclick="toggleBreakdown('carryover',this)" data-breakdown="carryover"><span class="alloc-dot alloc-carry"></span><span class="alloc-name">Last month overspend</span><span class="alloc-val neg">−${fmt(s.carryoverOverspend)}</span></div>`:''}
      <div class="alloc-row" onclick="toggleBreakdown('bills',this)" data-breakdown="bills">
        <span class="alloc-dot alloc-bills"></span><span class="alloc-name">Upcoming bills</span><span class="alloc-val neg">−${fmt(s.upcomingBillsTotal)}</span>
      </div>
      <div class="alloc-row" onclick="toggleBreakdown('buffer',this)" data-breakdown="buffer">
        <span class="alloc-dot alloc-buffer"></span><span class="alloc-name">Safety buffer (10%)</span><span class="alloc-val neg">−${fmt(s.buffer)}</span>
      </div>
    </div>
    <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>
    <div class="alloc-result">
      <div class="alloc-result-lhs"><span class="alloc-dot alloc-free"></span><span class="alloc-result-rem">${fmt(s.remaining)} left</span><span class="alloc-result-op">÷ ${s.daysLeft} day${s.daysLeft===1?'':'s'}</span></div>
      <div class="alloc-result-rhs">= <strong>${fmt(s.daily)}</strong>/day</div>
    </div>`;
}

function _ssStyle1(s){
  const base=Math.max(s.monthlyIncome,1);
  const spentDeg=Math.round(s.spent/base*360);
  const billsDeg=Math.round(s.upcomingBillsTotal/base*360);
  const bufferDeg=Math.round(s.buffer/base*360);
  const freeDeg=Math.max(0,360-spentDeg-billsDeg-bufferDeg);
  const a1=spentDeg, a2=a1+billsDeg, a3=a2+bufferDeg;
  const gradient=`conic-gradient(var(--red) 0deg ${a1}deg,var(--amber) ${a1}deg ${a2}deg,var(--border) ${a2}deg ${a3}deg,var(--accent) ${a3}deg 360deg)`;
  const items=[
    {cls:'alloc-spent',label:'Spent',val:fmt(s.spent)},
    ...(s.upcomingBillsTotal>0?[{cls:'alloc-bills',label:'Bills',val:fmt(s.upcomingBillsTotal)}]:[]),
    {cls:'alloc-buffer',label:'Buffer',val:fmt(s.buffer)},
    {cls:'alloc-free',label:'Remaining',val:fmt(s.remaining)},
  ];
  return `
    <div class="ss-donut-wrap">
      <div class="ss-donut" style="background:${gradient}"></div>
      <div class="ss-donut-legend">
        ${items.map(i=>`<div class="alloc-dl-item"><span class="alloc-dot ${i.cls}"></span><span class="alloc-dl-label">${i.label}</span><span class="alloc-dl-val">${i.val}</span></div>`).join('')}
      </div>
    </div>
    <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>
    <div class="alloc-result" style="margin-top:10px">
      <div class="alloc-result-lhs"><span class="alloc-dot alloc-free"></span><span class="alloc-result-rem">${fmt(s.remaining)} left</span><span class="alloc-result-op">÷ ${s.daysLeft} day${s.daysLeft===1?'':'s'}</span></div>
      <div class="alloc-result-rhs">= <strong>${fmt(s.daily)}</strong>/day</div>
    </div>`;
}

function _ssStyle2(s){
  const chips=[
    {cls:'fchip-base',amount:fmtShort(s.monthlyIncome),label:'salary',op:null},
    {cls:'fchip-spent',amount:fmtShort(s.spent),label:'spent',op:'−'},
    ...(s.upcomingBillsTotal>0?[{cls:'fchip-bills',amount:fmtShort(s.upcomingBillsTotal),label:'bills',op:'−'}]:[]),
    {cls:'fchip-buffer',amount:fmtShort(s.buffer),label:'buffer',op:'−'},
  ];
  return `
    <div class="ss-formula">
      ${chips.map(c=>`${c.op?`<span class="ss-fop">${c.op}</span>`:''}<div class="ss-fchip ${c.cls}"><span class="ss-famt">${c.amount}</span><span class="ss-flabel">${c.label}</span></div>`).join('')}
    </div>
    <div class="ss-formula-result">
      <span class="ss-freq-eq">=</span>
      <span class="ss-freq-rem">${fmt(s.remaining)}</span>
      <span class="ss-freq-op">÷ ${s.daysLeft} day${s.daysLeft===1?'':'s'}</span>
      <span class="ss-freq-eq">=</span>
      <span class="ss-freq-daily">${fmt(s.daily)}<span class="ss-freq-unit">/day</span></span>
    </div>
    <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>`;
}

function _ssStyle3(s){
  const rows=[
    {label:'Monthly salary',val:`+${fmt(s.monthlyIncome)}`,cls:'ll-pos',breakdown:'salary'},
    {label:'Spent so far',val:`−${fmt(s.spent)}`,cls:'ll-neg',breakdown:'spent'},
    ...(s.carryoverOverspend>0?[{label:'Carryover overspend',val:`−${fmt(s.carryoverOverspend)}`,cls:'ll-neg',breakdown:'carryover'}]:[]),
    {label:'Upcoming bills',val:`−${fmt(s.upcomingBillsTotal)}`,cls:'ll-neg',breakdown:'bills'},
    {label:'Safety buffer (10%)',val:`−${fmt(s.buffer)}`,cls:'ll-neg',breakdown:'buffer'},
  ];
  return `
    <div class="ss-ledger">
      ${rows.map(r=>`<div class="ss-ledger-row" onclick="toggleBreakdown('${r.breakdown}',this)" data-breakdown="${r.breakdown}"><span class="ss-ledger-lbl">${r.label}</span><span class="ss-ledger-val ${r.cls}">${r.val}</span></div>`).join('')}
      <div class="ss-ledger-total"><span>Remaining</span><span>${fmt(s.remaining)}</span></div>
    </div>
    <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>
    <div class="ss-ledger-daily">${fmt(s.remaining)} ÷ ${s.daysLeft} days = <strong>${fmt(s.daily)}/day</strong></div>`;
}

function _ssStyle4(s){
  const base=Math.max(s.monthlyIncome,1);
  const afterSpend=Math.max(s.monthlyIncome-(s.carryoverOverspend||0)-s.spent,0);
  const afterBills=Math.max(afterSpend-s.upcomingBillsTotal,0);
  const afterBuffer=Math.max(afterBills-s.buffer,0);
  const w1=100, w2=Math.round(afterSpend/base*100), w4=Math.round(afterBuffer/base*100);
  const steps=[
    {label:'Salary',sub:`+${fmt(s.monthlyIncome)}`,w:w1,cls:'step-full'},
    {label:'After spending',sub:`−${fmt(s.spent)}`,w:w2,cls:'step-mid'},
    {label:'After bills & buffer',sub:`−${fmt(s.upcomingBillsTotal+s.buffer)}`,w:w4,cls:'step-rem'},
  ];
  return `
    <div class="ss-steps">
      ${steps.map(st=>`
        <div class="ss-step-row">
          <div class="ss-step-meta"><span class="ss-step-lbl">${st.label}</span><span class="ss-step-sub">${st.sub}</span></div>
          <div class="ss-step-track"><div class="ss-step-bar ${st.cls}" style="width:${st.w}%"></div></div>
        </div>`).join('')}
    </div>
    <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>
    <div class="ss-steps-result">${fmt(s.remaining)} remaining ÷ ${s.daysLeft} days = <strong>${fmt(s.daily)}/day</strong></div>`;
}

function renderBreakdownExplainer(s){
  const labels=['Bar & rows','Donut chart','Formula','Ledger','Step bars'];
  const picker=`<div class="ss-style-picker">${labels.map((l,i)=>`<button class="ss-style-btn${i===safeSpendBreakdownStyle?' active':''}" onclick="setSafeSpendStyle(${i})">${l}</button>`).join('')}</div>`;
  const fns=[_ssStyle0,_ssStyle1,_ssStyle2,_ssStyle3,_ssStyle4];
  return picker+fns[safeSpendBreakdownStyle](s);
}

function getSafeSpendRealData(){
  const monthKey = currentMonthKey();
  const daysLeft = getDaysLeftInShownMonth();
  const monthlyIncome = Number(salary || 0);
  const carryoverOverspend = getCarryoverOverspend(monthKey);
  const spent = getMonthSpent(monthKey);

  const today = new Date(todayStr + 'T00:00:00');
  const upcomingBillsList = (recurring || [])
    .filter(r => r.type === 'bill')
    .map(r => {
      const due = recurringDueDate(r, monthKey);
      const paid = r.lastPaid === monthKey;
      return { ...r, due, paid };
    })
    .filter(r => !r.paid && r.due >= today)
    .sort((a,b)=>a.due-b.due);

  const upcomingBillsTotal = upcomingBillsList.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const extraIncome = getMonthIncomeTotal(monthKey);
  const totalIncome = monthlyIncome;
  const buffer = Math.floor(totalIncome * 0.1);
  const remaining = Math.max(totalIncome - carryoverOverspend - spent - upcomingBillsTotal - buffer, 0);
  const daily = Math.floor(remaining / Math.max(daysLeft, 1));

  let status = 'good', label = 'On track';
  if (daily < 200) { status = 'risk'; label = 'Risk'; }
  else if (daily < 500) { status = 'warn'; label = 'Tight'; }

  let note = 'Based on your salary, spending, and remaining bills.';
  if (status === 'warn') note = 'You still have room, but need to stay controlled.';
  if (status === 'risk') note = 'Your remaining budget is tight. Limit spending today.';

  return {
    monthlyIncome,
    extraIncome,
    totalIncome,
    spent,
    carryoverOverspend,
    upcomingBillsTotal,
    buffer,
    remaining,
    daysLeft,
    daily,
    status,
    label,
    note,
    nextBill: upcomingBillsList[0] || null
  };
}

function renderSafeSpendCard(){
  const wrap=document.getElementById('safe-spend-content');
  const card=document.getElementById('safe-spend-card');
  if(!wrap||!card)return;
  const s=getSafeSpendRealData();
  card.style.display='block';

  const spendable = Math.max(s.monthlyIncome - (s.carryoverOverspend||0) - s.upcomingBillsTotal - s.buffer, 1);
  const budgetPct = Math.min(100, Math.round((s.spent / spendable) * 100));

  const todaySpent = entries.filter(e => e.date === todayStr).reduce((sum, e) => sum + Number(e.amount||0), 0);
  const todayPct = s.daily > 0 ? Math.round(todaySpent / s.daily * 100) : 0;
  const todayCls = todayPct >= 100 ? 'risk' : todayPct >= 70 ? 'warn' : 'good';
  const todayBarW = Math.min(100, todayPct);
  const todayLeft = Math.max(s.daily - todaySpent, 0);
  const todayLeftLabel = todaySpent >= s.daily ? 'Limit reached' : `${fmt(todayLeft)} left today`;

  wrap.innerHTML=`
    <div class="safe-spend-title-row">
      <div class="safe-spend-title-left">
        <div class="card-title">Safe to Spend Today</div>
        <div class="safe-spend-info-wrap">
          <button class="safe-spend-info-btn" type="button" onclick="toggleSafeSpendInfo(event)">i</button>
          <div id="safe-spend-info-copy" class="safe-spend-info-copy">
            <div class="safe-spend-info-title">Safe to Spend Today</div>
            This uses your salary, spending so far, unpaid bills, and a safety buffer to estimate a safer daily amount for the rest of the month.
          </div>
        </div>
      </div>
      <div class="safe-spend-badge-wrap">
        <div class="safe-spend-label-inline">Daily Limit</div>
        <div class="safe-spend-status ${s.status}">${s.label}</div>
      </div>
    </div>
    <div class="safe-spend-main">
      <div class="safe-spend-amount ${s.status!=='good'?s.status:''}">${fmt(s.daily)}</div>
    </div>
    <div class="safe-spend-meta-row">
      <span class="safe-spend-meta">${fmt(s.remaining)} remaining this month</span>
      <span class="safe-spend-days-pill">${s.daysLeft} day${s.daysLeft===1?'':'s'} left</span>
    </div>
    <div class="safe-spend-progress-track">
      <div class="safe-spend-progress-fill ${s.status}" style="width:${budgetPct}%"></div>
    </div>
    <div class="safe-spend-progress-label">
      <span>${fmtShort(s.spent)} spent</span>
      <span>${budgetPct}% of budget</span>
    </div>

    <div class="safe-spend-today">
      <div class="safe-spend-today-header">
        <span class="safe-spend-today-title">Today</span>
        <span class="safe-spend-today-amounts">
          <span class="safe-spend-today-spent ${todayCls}">${fmt(todaySpent)}</span>
          <span class="safe-spend-today-of">/ ${fmt(s.daily)}</span>
        </span>
        <span class="safe-spend-today-left ${todayCls}">${todayLeftLabel}</span>
      </div>
      <div class="safe-spend-today-track">
        <div class="safe-spend-today-fill ${todayCls}" style="width:${todayBarW}%"></div>
      </div>
    </div>

    <div class="safe-spend-explainer">${renderBreakdownExplainer(s)}</div>
  `;
}

function toggleSafeSpendInfo(event){
  if(event) event.stopPropagation();
  const el = document.getElementById('safe-spend-info-copy');
  if(!el) return;
  el.classList.toggle('show');
}

document.addEventListener('click', function(e){
  const pop = document.getElementById('safe-spend-info-copy');
  const wrap = document.querySelector('.safe-spend-info-wrap');
  if(pop && wrap && !wrap.contains(e.target)) pop.classList.remove('show');
});

function toggleBreakdown(type, chipEl){
  const el = document.getElementById('safe-spend-breakdown-detail');
  if(!el) return;

  document.querySelectorAll('[data-breakdown]').forEach(chip=>chip.classList.remove('active'));

  if(el.dataset.active === type){
    el.innerHTML = '';
    el.dataset.active = '';
    el.style.display = 'none';
    return;
  }

  let html = '';
  if(type === 'carryover'){
    const carry=getCarryoverOverspend();
    html = `<div class="safe-spend-detail-title">Previous month overspend</div><div class="safe-spend-detail-item">Last month went over your declared salary by <strong>${fmt(carry)}</strong>. That amount reduces this month's available room.</div>`;
  }
  if(type === 'bills'){
    const bills = (recurring||[])
      .filter(r => r.type === 'bill')
      .map(r => ({...r, paid: r.lastPaid === currentMonthKey()}))
      .filter(r => !r.paid);

    html = bills.length
      ? `<div class="safe-spend-detail-title">Upcoming bills</div>` + bills.map(b=>`<div class="safe-spend-detail-item">• ${b.name} — ${fmtShort(b.amount)}</div>`).join('')
      : '<div class="safe-spend-detail-title">Upcoming bills</div><div class="safe-spend-detail-item">No upcoming bills this month.</div>';
  }

  if(type === 'spent'){
    html = `<div class="safe-spend-detail-title">Spent this month</div><div class="safe-spend-detail-item">• Total spent so far — ${fmtShort(getMonthSpent())}</div>`;
  }

  if(type === 'salary'){
    html = `<div class="safe-spend-detail-title">Starting budget</div><div class="safe-spend-detail-item">• Monthly starting budget — ${fmtShort(salary)}</div>`;
  }

  if(type === 'buffer'){
    html = `<div class="safe-spend-detail-title">Safety buffer</div><div class="safe-spend-detail-item">• Protected before daily limit — ${fmtShort(Math.floor(salary * 0.1))}</div>`;
  }

  el.innerHTML = html;
  el.dataset.active = type;
  el.style.display = 'block';
  if(chipEl) chipEl.classList.add('active');
}



function buildCatSelect(selId){const sel=document.getElementById(selId);if(!sel)return;const prev=sel.value;sel.innerHTML='';const groups={fixed:'Fixed Bills',variable:'Variable',savings:'Savings'};Object.keys(groups).forEach(g=>{const cats=allCats().filter(c=>c.type===g);if(!cats.length)return;const og=document.createElement('optgroup');og.label=groups[g];cats.forEach(c=>{const o=document.createElement('option');o.value=c.name;o.textContent=(c.icon||'')+' '+c.name;og.appendChild(o)});sel.appendChild(og)});const oc=customCats.filter(c=>c.type==='other');if(oc.length){const og=document.createElement('optgroup');og.label='Custom';oc.forEach(c=>{const o=document.createElement('option');o.value=c.name;o.textContent=c.name;og.appendChild(o)});sel.appendChild(og)}const og=document.createElement('optgroup');og.label='─────';const o=document.createElement('option');o.value='__other__';o.textContent='➕ Add Custom...';og.appendChild(o);sel.appendChild(og);if(prev&&sel.querySelector(`option[value="${CSS.escape(prev)}"]`))sel.value=prev}
function toggleCustom(){const isOther=document.getElementById('f-cat').value==='__other__';document.getElementById('custom-cat-wrap').style.display=isOther?'block':'none';document.getElementById('custom-cat-group-wrap').style.display=isOther?'block':'none';if(isOther){selectCatGroup('wants');const el=document.getElementById('cat-group-suggestion');if(el)el.style.display='none';}}

function makeKeyFromName(name){let base=(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||('account-'+Date.now());let key=base,i=2;while(nwAccounts.find(a=>a.key===key)){key=base+'-'+i;i++}return key}
function getAccountDeleteImpact(key){const counts={expenses:entries.filter(e=>e.account===key).length,income:incomes.filter(i=>i.account===key).length,transfers:transfers.filter(t=>t.from===key||t.to===key).length,goalLogs:goalContributions.filter(c=>c.account===key).length,debtLogs:debtPayments.filter(p=>p.account===key).length,salarySchedule:(paySchedule?.splits||[]).filter(s=>s.account===key).length,salaryReceipts:Object.values(paySchedule?.received||{}).filter(r=>r&&r.account===key).length};const parts=[counts.expenses?`${counts.expenses} expense${counts.expenses!==1?'s':''}`:'',counts.income?`${counts.income} income record${counts.income!==1?'s':''}`:'',counts.transfers?`${counts.transfers} transfer${counts.transfers!==1?'s':''}`:'',counts.goalLogs?`${counts.goalLogs} goal contribution${counts.goalLogs!==1?'s':''}`:'',counts.debtLogs?`${counts.debtLogs} debt payment log${counts.debtLogs!==1?'s':''}`:'',counts.salarySchedule?`${counts.salarySchedule} salary schedule slot${counts.salarySchedule!==1?'s':''}`:'',counts.salaryReceipts?`${counts.salaryReceipts} salary receipt${counts.salaryReceipts!==1?'s':''}`:''].filter(Boolean);return{total:Object.values(counts).reduce((sum,val)=>sum+Number(val||0),0),message:parts.join(', ')}}
function clearDeletedAccountSoftReferences(key){Object.values(addFlowState.lastExpenseByCategory||{}).forEach(pattern=>{if(pattern&&pattern.account===key)pattern.account=''});addFlowState.favoriteExpenseTemplates=(addFlowState.favoriteExpenseTemplates||[]).map(template=>template.account===key?{...template,account:''}:template);Object.values(addFlowState.lastIncomeBySource||{}).forEach(pattern=>{if(pattern&&pattern.account===key)pattern.account=''})}
function setNwAccountType(type){
  document.getElementById('nw-type-asset').classList.toggle('active',type==='asset');
  document.getElementById('nw-type-credit').classList.toggle('active',type==='credit_card');
  document.getElementById('nw-link-debt-row').style.display=type==='credit_card'?'':'none';
  document.getElementById('nw-cc-limit-row').style.display=type==='credit_card'?'':'none';
  document.getElementById('nw-acc-balance-row').style.display=type==='asset'?'':'none';
  document.getElementById('nw-transfer-btn').style.display='none';
  if(type==='credit_card')document.getElementById('nw-acc-icon').value='💳';
}
function populateNwDebtSelect(selectedId=''){
  const sel=document.getElementById('nw-linked-debt');
  if(!sel)return;
  const linkedIds=new Set(nwAccounts.filter(a=>a.linkedDebtId&&a.key!==editingNetWorthKey).map(a=>String(a.linkedDebtId)));
  sel.innerHTML='<option value="">No debt linked</option>';
  debts.filter(d=>Number(d.total||0)>0&&!linkedIds.has(String(d.id))).forEach(d=>{
    const o=document.createElement('option');
    o.value=d.id;
    o.textContent=`${d.name} · ${fmt(Number(d.total||0))}`;
    sel.appendChild(o);
  });
  if(selectedId)sel.value=String(selectedId);
}
function openNetWorthAdd(){editingNetWorthKey=null;document.getElementById('nw-modal-title').textContent='Add Net Worth Account';document.getElementById('nw-acc-icon').value='🏦';document.getElementById('nw-acc-name').value='';document.getElementById('nw-acc-balance').value='';document.getElementById('nw-cc-limit').value='';document.getElementById('nw-delete-btn').style.display='none';document.getElementById('nw-transfer-btn').style.display='none';setNwAccountType('asset');populateNwDebtSelect();openModal('modal-nw-account')}
function openNetWorthEdit(key){const acc=nwAccounts.find(a=>a.key===key);if(!acc)return;editingNetWorthKey=key;document.getElementById('nw-modal-title').textContent='Edit Account';document.getElementById('nw-acc-icon').value=acc.icon||'🏦';document.getElementById('nw-acc-name').value=acc.name||'';document.getElementById('nw-acc-balance').value=nwBalances[key]||0;document.getElementById('nw-cc-limit').value=acc.creditLimit||'';document.getElementById('nw-delete-btn').style.display='inline-flex';setNwAccountType(acc.accountType||'asset');populateNwDebtSelect(acc.linkedDebtId||'');if(acc.accountType!=='credit_card')document.getElementById('nw-transfer-btn').style.display='inline-flex';openModal('modal-nw-account')}
function saveNetWorthAccount(){
  const icon=document.getElementById('nw-acc-icon').value||'🏦';
  const name=document.getElementById('nw-acc-name').value.trim();
  const isCreditCard=document.getElementById('nw-type-credit').classList.contains('active');
  const accountType=isCreditCard?'credit_card':'asset';
  const linkedDebtId=isCreditCard?(document.getElementById('nw-linked-debt').value||null):null;
  const creditLimit=isCreditCard?(parseFloat(document.getElementById('nw-cc-limit').value)||0):0;
  const linkedDebt=linkedDebtId?debts.find(d=>String(d.id)===String(linkedDebtId)):null;
  const balance=isCreditCard?Number(linkedDebt?.total||0):(parseFloat(document.getElementById('nw-acc-balance').value)||0);
  if(!name){showAlert('Enter an account name.');return;}
  if(editingNetWorthKey){const acc=nwAccounts.find(a=>a.key===editingNetWorthKey);if(!acc)return;acc.icon=icon;acc.name=name;acc.accountType=accountType;acc.linkedDebtId=linkedDebtId||null;acc.creditLimit=creditLimit||null;nwBalances[editingNetWorthKey]=balance;}
  else{const key=makeKeyFromName(name);nwAccounts.push({key,name,icon,accountType,linkedDebtId:linkedDebtId||null,creditLimit:creditLimit||null});nwBalances[key]=balance;}
  closeModal('modal-nw-account');saveData();render();
}
function deleteNetWorthAccount(){if(!editingNetWorthKey)return;const account=nwAccounts.find(a=>a.key===editingNetWorthKey);if(!account)return;if(nwAccounts.length<=1){showAlert('Keep at least one account in the app.');return;}const impact=getAccountDeleteImpact(editingNetWorthKey);if(impact.total){showAlert(`Can't delete ${account.name} yet. It is still used by ${impact.message}. Move or update those records first.`);return;}showConfirm(`Delete ${account.name}?`,()=>{clearDeletedAccountSoftReferences(editingNetWorthKey);nwAccounts=nwAccounts.filter(a=>a.key!==editingNetWorthKey);delete nwBalances[editingNetWorthKey];closeModal('modal-nw-account');saveData();render();showActionToast('Account deleted',account.name,'🗑️');},'Delete',true);}
function buildAccountSelect(selId,includeBlank=false,includeCreditCards=false){const sel=document.getElementById(selId);if(!sel)return;const prev=sel.value;sel.innerHTML='';if(includeBlank){const blank=document.createElement('option');blank.value='';blank.textContent='Select account';sel.appendChild(blank)}nwAccounts.filter(a=>a.accountType!=='credit_card'||includeCreditCards).forEach(a=>{const o=document.createElement('option');o.value=a.key;o.textContent=`${a.icon} ${a.name}`;sel.appendChild(o)});if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;else if(!prev&&sel.options.length)sel.selectedIndex=includeBlank?0:0}
function getDefaultAccountKey(){return nwAccounts.length?nwAccounts[0].key:''}
function adjustAccountBalance(key,delta){if(!key)return;if(nwBalances[key]===undefined)nwBalances[key]=0;nwBalances[key]=Number(nwBalances[key]||0)+Number(delta||0)}
function syncLegacyTransactionAccounts(){entries.forEach(e=>{if(e.account===undefined)e.account=''});incomes.forEach(i=>{if(i.account===undefined)i.account=''});debtPayments.forEach(p=>{if(p.account===undefined)p.account='';if(p.markedMonthly===undefined)p.markedMonthly=true;if(p.fee===undefined)p.fee=0})}
function getAccountInfo(key){return nwAccounts.find(a=>a.key===key)||{name:'No account',icon:'🏷️',key:''}}
function isCCAccount(key){const a=nwAccounts.find(x=>x.key===key);return a?.accountType==='credit_card';}
function getSpendValidationState(account,amount,refundedAmount=0){const normalizedAmount=Math.max(Number(amount||0),0);const acc=nwAccounts.find(a=>a.key===account);if(acc?.accountType==='credit_card'){const current=Number(nwBalances[account]||0);const creditLimit=Number(acc.creditLimit||0);const available=creditLimit>0?Math.max(creditLimit-current,0):Infinity;const hasEnough=creditLimit<=0||normalizedAmount<=available;return{current,available,after:current+normalizedAmount,amount:normalizedAmount,hasEnough,isCreditCard:true,creditLimit};}const current=Number(nwBalances[account]||0);const available=current+Math.max(Number(refundedAmount||0),0);return{current,available,after:available-normalizedAmount,amount:normalizedAmount,hasEnough:normalizedAmount<=available}}
function renderSpendBalancePreview({wrapId,buttonId,title,account,amount,submitLabel,afterLabel,refundedAmount=0,extraLines=[],okMessage='Enough balance for this expense.',warningMessage='Not enough balance in this account.'}){const wrap=document.getElementById(wrapId);const button=document.getElementById(buttonId);const state=getSpendValidationState(account,amount,refundedAmount);if(state.isCreditCard){const ccInfo=getAccountInfo(account);if(wrap){if(state.amount===0){wrap.style.display='none';}else{const limitLine=state.creditLimit>0?`<div>Available credit: <strong>${fmt(Math.max(state.creditLimit-state.current,0))}</strong> · Limit: ${fmt(state.creditLimit)}</div>`:'';wrap.style.display='';wrap.innerHTML=`<div class="add-subtitle" style="margin-bottom:4px">${title}</div><div><strong>${esc(ccInfo.name)}</strong> — credit card</div>${limitLine}<div>After this charge: <strong>${fmt(state.after)}</strong> outstanding</div><div class="add-balance-ok">💳 Charged to credit card</div>`;}}if(button){button.disabled=state.amount===0||!account||!state.hasEnough;button.textContent=!state.hasEnough?'Over Credit Limit':submitLabel;}return state;}const lines=[`<div><strong>${esc(getAccountInfo(account).name)}</strong> now: ${fmt(state.current)}</div>`];if(refundedAmount>0)lines.push(`<div>Available after refund: <strong>${fmt(state.available)}</strong></div>`);extraLines.filter(Boolean).forEach(line=>lines.push(line));lines.push(`<div>${afterLabel}: <strong>${fmt(state.after)}</strong></div>`);if(state.amount>0)lines.push(state.hasEnough?`<div class="add-balance-ok">${okMessage}</div>`:`<div class="add-balance-warning">${warningMessage}</div>`);if(wrap){if(state.amount===0){wrap.style.display='none';}else{wrap.style.display='';wrap.innerHTML=`<div class="add-subtitle" style="margin-bottom:4px">${title}</div>${lines.join('')}`;}}if(button){const canSubmit=state.amount>0&&!!account&&state.hasEnough;button.disabled=!canSubmit;button.textContent=!state.hasEnough&&state.amount>0?'Not Enough Balance':submitLabel}return state}
function setTransferFee(value){document.getElementById('t-fee').value=value;updateTransferSummary()}
function setDebtPaymentFee(value){document.getElementById('dp-fee').value=value;updateDebtPaymentPreview()}
function updateTransferSummary(){const from=document.getElementById('t-from')?.value||'';const to=document.getElementById('t-to')?.value||'';const amount=parseFloat(document.getElementById('t-amount')?.value)||0;const fee=parseFloat(document.getElementById('t-fee')?.value)||0;const summary=document.getElementById('transfer-summary');if(!summary)return;const fromName=from?getAccountInfo(from).name:'Source account';const toName=to?getAccountInfo(to).name:'Destination account';const total=Math.max(0,amount)+Math.max(0,fee);const fromAfter=from?Number(nwBalances[from]||0)-total:0;const toAfter=to?Number(nwBalances[to]||0)+Math.max(0,amount):0;summary.innerHTML=`<div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text3);margin-bottom:6px">Transfer summary</div><div><strong>Transfer amount:</strong> ${fmt(amount)}</div><div><strong>Fee:</strong> ${fmt(fee)}</div><div><strong>Total deducted from ${esc(fromName)}:</strong> ${fmt(total)}</div><div><strong>Amount received in ${esc(toName)}:</strong> ${fmt(amount)}</div><div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><strong>${esc(fromName)} after transfer:</strong> ${fmt(fromAfter)}<br><strong>${esc(toName)} after transfer:</strong> ${fmt(toAfter)}</div>${fee>0?'<div style="margin-top:6px;color:var(--text3)">The fee will be logged as a separate Transfer Fees expense.</div>':''}`;}
function openTransferModal(prefillFrom=''){if(!nwAccounts||nwAccounts.length<2){showAlert('Add at least two accounts to transfer money.');return;}const fromEl=document.getElementById('t-from');const toEl=document.getElementById('t-to');const opts=nwAccounts.map(a=>`<option value="${a.key}">${a.icon} ${esc(a.name)}</option>`).join('');fromEl.innerHTML=opts;toEl.innerHTML=opts;const first=prefillFrom&&nwAccounts.find(a=>a.key===prefillFrom)?prefillFrom:nwAccounts[0].key;let second=(nwAccounts.find(a=>a.key!==first)||nwAccounts[0]).key;if(second===first&&nwAccounts[1])second=nwAccounts[1].key;fromEl.value=first;toEl.value=second;document.getElementById('t-date').value=todayStr;document.getElementById('t-amount').value='';document.getElementById('t-fee').value='0';document.getElementById('t-note').value='';updateTransferSummary();openModal('modal-transfer')}
function openTransferFromEditingAccount(){if(!editingNetWorthKey)return;closeModal('modal-nw-account');openTransferModal(editingNetWorthKey)}
/* ===== XM / TRADE CYCLE ===== */
function openTradeCycle(){
  const xmBalance=Number(nwBalances['xm']||0);
  if(xmBalance<=0){showAlert('XM Wallet balance is ₱0. Deposit funds to XM first using Transfer.');return;}
  document.getElementById('tc-xm-balance').textContent=fmt(xmBalance);
  document.getElementById('tc-withdrawal').value='';
  document.getElementById('tc-date').value=todayStr;
  document.getElementById('tc-note').value='';
  document.getElementById('tc-preview').style.display='none';
  buildAccountSelect('tc-dest',false);
  const destSel=document.getElementById('tc-dest');
  [...destSel.options].forEach(o=>{if(o.value==='xm')o.remove()});
  openModal('modal-trade-cycle');
}
function updateTradeCyclePreview(){
  const xmBalance=Number(nwBalances['xm']||0);
  const withdrawal=parseFloat(document.getElementById('tc-withdrawal').value)||0;
  const preview=document.getElementById('tc-preview');
  if(!preview)return;
  if(!withdrawal){preview.style.display='none';return;}
  const pnl=withdrawal-xmBalance;
  let html='';
  if(pnl>0){
    html=`<div style="color:var(--green);font-weight:600">📈 Trading Profit: ${fmt(pnl)}</div><div style="font-size:12px;color:var(--text3);margin-top:4px">Principal ${fmt(xmBalance)} returns as transfer + ${fmt(pnl)} logged as income</div>`;
  }else if(pnl<0){
    html=`<div style="color:var(--red);font-weight:600">📉 Trading Loss: ${fmt(Math.abs(pnl))}</div><div style="font-size:12px;color:var(--text3);margin-top:4px">Recovering ${fmt(withdrawal)} of ${fmt(xmBalance)} deposited capital</div>`;
  }else{
    html=`<div style="color:var(--text2);font-weight:600">🔁 Breakeven — no profit or loss recorded</div>`;
  }
  preview.innerHTML=html;
  preview.style.display='block';
}
function settleTradeCycle(){
  const withdrawal=parseFloat(document.getElementById('tc-withdrawal').value);
  const dest=document.getElementById('tc-dest').value;
  const date=document.getElementById('tc-date').value;
  const note=document.getElementById('tc-note').value.trim();
  if(!withdrawal||withdrawal<=0){showAlert('Enter the withdrawal amount.');return;}
  if(!dest){showAlert('Choose a destination account.');return;}
  if(!date){showAlert('Enter a date.');return;}
  if(dest==='xm'){showAlert('Destination must be a different account from XM Wallet.');return;}
  const xmBalance=Number(nwBalances['xm']||0);
  if(xmBalance<=0){showAlert('XM Wallet balance is 0. Nothing to settle.');return;}
  const pnl=withdrawal-xmBalance;
  const cycleNote=note||'Trade cycle settled';
  if(pnl>=0){
    // Transfer principal from XM to dest, then log profit income
    adjustAccountBalance('xm',-xmBalance);
    adjustAccountBalance(dest,xmBalance);
    transfers.unshift(stampRecord({id:nextTransferId++,from:'xm',to:dest,amount:xmBalance,fee:0,date,note:cycleNote+(pnl>0?' (principal back)':'')}));
    if(pnl>0){
      incomes.unshift(stampRecord({id:nextIncId++,date,source:'Trading Profit',amount:pnl,account:dest,note:cycleNote+` · Profit ${fmt(pnl)}`}));
      adjustAccountBalance(dest,pnl);
    }
  }else{
    // Transfer withdrawal back, then log the loss from XM
    const loss=Math.abs(pnl);
    adjustAccountBalance('xm',-withdrawal);
    adjustAccountBalance(dest,withdrawal);
    transfers.unshift(stampRecord({id:nextTransferId++,from:'xm',to:dest,amount:withdrawal,fee:0,date,note:cycleNote+' (partial recovery)'}));
    entries.unshift(stampRecord({id:nextId++,date,category:'Trading Loss',amount:loss,account:'xm',note:cycleNote+` · Loss ${fmt(loss)}`}));
    adjustAccountBalance('xm',-loss);
  }
  closeModal('modal-trade-cycle');
  saveData();render();
  showActionToast(
    pnl>0?`Trading Profit ${fmt(pnl)}`:pnl<0?`Trading Loss ${fmt(Math.abs(pnl))}`:'Trade cycle closed (breakeven)',
    `XM → ${getAccountInfo(dest).name}`,
    pnl>0?'📈':pnl<0?'📉':'🔁'
  );
}
function addTransfer(){const from=document.getElementById('t-from').value;const to=document.getElementById('t-to').value;const amount=parseFloat(document.getElementById('t-amount').value);const fee=parseFloat(document.getElementById('t-fee').value)||0;const date=document.getElementById('t-date').value;const note=document.getElementById('t-note').value;if(!from||!to||from===to){showAlert('Choose two different accounts.');return;}if(!date||!amount||amount<=0){showAlert('Enter date and amount.');return;}if(fee<0){showAlert('Fee cannot be negative.');return;}const totalDeduction=amount+fee;if((Number(nwBalances[from]||0))<totalDeduction){showAlert('Not enough balance in the selected source account.');return;}adjustAccountBalance(from,-totalDeduction);adjustAccountBalance(to,amount);const transferRecord=stampRecord({id:nextTransferId++,from,to,amount,fee,date,note});transfers.unshift(transferRecord);let feeEntryId=null;if(fee>0){feeEntryId=nextId;entries.unshift(stampRecord({id:nextId++,date,category:'Transfer Fees',amount:fee,account:from,note:`Transfer fee: ${getAccountInfo(from).name} → ${getAccountInfo(to).name}${note?` · ${note}`:''}`}));transferRecord.feeEntryId=feeEntryId}lastTransferUndo={transfer:transferRecord,totalDeduction,feeEntryId};document.getElementById('t-amount').value='';document.getElementById('t-fee').value='0';document.getElementById('t-note').value='';closeModal('modal-transfer');saveData();render();showActionToast(`${fmt(amount)} transferred`,`${getAccountInfo(from).name} → ${getAccountInfo(to).name}${fee>0?` · Fee ${fmt(fee)}`:''}`,'🔁',{showUndo:true,duration:5200})}
function deleteTransferWithConfirm(id){const t=transfers.find(x=>x.id===id);if(!t)return;showConfirm(`Delete transfer: ${getAccountInfo(t.from).name} → ${getAccountInfo(t.to).name} · ${fmt(t.amount)}?\n\nThis will restore the balances of both accounts.`,()=>{deleteTransfer(id);showActionToast('Transfer deleted',`${getAccountInfo(t.from).name||'?'} → ${getAccountInfo(t.to).name||'?'}`,'🗑️');},'Delete',true);}
function renderTransferHistory(){const wrap=document.getElementById('transfer-history');if(!wrap)return;if(!transfers.length){wrap.innerHTML='<div class="empty"><div class="empty-text">No transfers yet.</div></div>';return;}wrap.innerHTML=`<div class="tx-list">${transfers.slice(0,8).map(t=>`<div class="tx-item"><div class="tx-icon" style="width:32px;height:32px;border-radius:9px;background:var(--surface2);font-size:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center">🔁</div><div class="tx-info"><div class="tx-name" style="font-size:12px;font-weight:600;color:var(--text1)">${esc(getAccountInfo(t.from).name)} → ${esc(getAccountInfo(t.to).name)}</div><div class="tx-meta" style="font-size:10px">${esc(t.date||'')} · ${t.fee&&Number(t.fee)>0?`Fee ${fmt(t.fee)}`:'No fee'}${t.note?` · ${esc(t.note)}`:''}</div></div><div class="tx-amount" style="font-size:13px;font-weight:600;color:var(--text2)">${fmt(t.amount)}</div><button class="btn-icon tx-delete" onclick="deleteTransferWithConfirm(${t.id})" style="border:none;background:none;color:var(--red);font-size:12px;cursor:pointer;padding:4px 6px;margin-left:2px" title="Delete">✕</button></div>`).join('')}</div>`;}
function findTransferFeeEntryId(transfer){if(transfer.feeEntryId&&entries.some(e=>e.id===transfer.feeEntryId))return transfer.feeEntryId;const feeAmount=Number(transfer.fee||0);if(feeAmount<=0)return null;const match=entries.find(e=>e.category==='Transfer Fees'&&e.account===transfer.from&&Number(e.amount||0)===feeAmount&&e.date===transfer.date&&(e.note||'').startsWith('Transfer fee:'));return match?match.id:null}
function deleteTransfer(id){const t=transfers.find(x=>x.id===id);if(!t)return;const feeEntryId=findTransferFeeEntryId(t);adjustAccountBalance(t.from,Number(t.amount||0)+Number(t.fee||0));adjustAccountBalance(t.to,-Number(t.amount||0));if(feeEntryId)entries=entries.filter(e=>e.id!==feeEntryId);transfers=transfers.filter(x=>x.id!==id);if(lastTransferUndo?.transfer?.id===id)lastTransferUndo=null;saveData();render()}

/* Onboarding */
const ONBOARD_DEFAULT_ACCOUNTS=[{key:'cash',name:'Cash',icon:'💵',selected:true,balance:0},{key:'gcash',name:'GCash',icon:'📱',selected:true,balance:0},{key:'maya',name:'Maya',icon:'📲',selected:false,balance:0},{key:'bdo',name:'BDO Savings',icon:'🏦',selected:true,balance:0},{key:'unionbank',name:'UnionBank',icon:'💳',selected:false,balance:0}];
const ONBOARD_DEFAULT_BILLS=[{name:'Electric Bill',amount:0,day:5,category:'Electric Bill',selected:true},{name:'Water',amount:0,day:10,category:'Water',selected:false},{name:'Spotify',amount:169,day:12,category:'Spotify',selected:false},{name:'Insurance / HMO',amount:0,day:15,category:'Insurance / HMO',selected:false}];
let onboardAccounts=JSON.parse(JSON.stringify(ONBOARD_DEFAULT_ACCOUNTS));
let onboardBills=JSON.parse(JSON.stringify(ONBOARD_DEFAULT_BILLS));

function renderOnboardingProgress(){const el=document.getElementById('onboard-progress');if(!el)return;el.innerHTML=[0,1,2,3,4].map(i=>`<span class="${i<=onboardStep?'active':''}"></span>`).join('');document.querySelectorAll('.onboard-step').forEach((s,idx)=>s.classList.toggle('active',idx===onboardStep))}
function nextOnboardStep(){if(onboardStep===1){const sal=parseFloat(document.getElementById('ob-salary').value)||0;if(sal<=0){showAlert('Enter your monthly salary.');return;}}if(onboardStep===2){if(!onboardAccounts.some(a=>a.selected)){showAlert('Select at least one account.');return;}}onboardStep=Math.min(onboardStep+1,4);renderOnboardingProgress()}
function prevOnboardStep(){onboardStep=Math.max(onboardStep-1,0);renderOnboardingProgress()}
function toggleOnboardPayMode(){const mode=document.getElementById('ob-pay-mode').value;document.getElementById('ob-pay-twice-row').style.display=mode==='twice'?'grid':'none';document.getElementById('ob-pay-monthly-row').style.display=mode==='monthly'?'block':'none';const split2=document.getElementById('ob-salary-split-2');if(split2)split2.style.display=mode==='twice'?'grid':'none'}
function renderOnboardSalaryAccounts(){['ob-pay-account-1','ob-pay-account-2'].forEach((id,idx)=>{const sel=document.getElementById(id);if(!sel)return;const prev=sel.value;sel.innerHTML=onboardAccounts.map(a=>`<option value="${a.key}">${a.icon} ${a.name}</option>`).join('');if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;else sel.value=onboardAccounts[idx]?.key||onboardAccounts[0]?.key||''})}
function syncOnboardSalarySplitAmounts(){const salaryVal=parseFloat(document.getElementById('ob-salary')?.value)||0;const mode=document.getElementById('ob-pay-mode')?.value||'twice';const amt1=document.getElementById('ob-pay-amt-1');const amt2=document.getElementById('ob-pay-amt-2');if(!amt1||!amt2)return;if(mode==='monthly'){amt1.value=salaryVal?Math.round(salaryVal):'';amt2.value='';}else{const first=Math.round(salaryVal/2);const second=Math.max(0,Math.round(salaryVal-first));amt1.value=salaryVal?first:'';amt2.value=salaryVal?second:'';}}
function renderOnboardAccounts(){const wrap=document.getElementById('ob-account-list');if(!wrap)return;wrap.innerHTML=onboardAccounts.map((a,idx)=>`<div class="mini-item"><label style="display:flex;align-items:center;gap:10px;flex:1"><input type="checkbox" ${a.selected?'checked':''} onchange="onboardAccounts[${idx}].selected=this.checked;renderOnboardSalaryAccounts()"><span>${a.icon} ${a.name}</span></label><div style="display:flex;align-items:center;gap:6px"><span style="color:var(--text3)">₱</span><input type="number" class="input" value="${a.balance||0}" style="width:92px;text-align:right" onchange="onboardAccounts[${idx}].balance=parseFloat(this.value)||0"></div></div>`).join('');renderOnboardSalaryAccounts()}
function renderOnboardBills(){const wrap=document.getElementById('ob-bills-list');if(!wrap)return;wrap.innerHTML=onboardBills.map((b,idx)=>`<div class="mini-item" style="align-items:flex-start"><label style="display:flex;align-items:center;gap:10px;flex:1;padding-top:8px"><input type="checkbox" ${b.selected?'checked':''} onchange="onboardBills[${idx}].selected=this.checked"><span>${b.name}</span></label><div style="display:grid;grid-template-columns:84px 72px;gap:6px"><input type="number" class="input" placeholder="Amount" value="${b.amount||0}" onchange="onboardBills[${idx}].amount=parseFloat(this.value)||0"><input type="number" class="input" placeholder="Day" min="1" max="31" value="${b.day||1}" onchange="onboardBills[${idx}].day=parseInt(this.value)||1"></div></div>`).join('')}
function maybeStartOnboarding(){const firstRun=!localStorage.getItem('ft_onboarded');if(firstRun){document.getElementById('ob-salary').value=salary||'';document.getElementById('ob-pay-mode').value=paySchedule?.mode||'twice';if((paySchedule?.days||[]).length){document.getElementById('ob-pay-1').value=paySchedule.days[0]||5;document.getElementById('ob-pay-2').value=paySchedule.days[1]||20;document.getElementById('ob-pay-single').value=paySchedule.days[0]||30}renderOnboardAccounts();renderOnboardSalaryAccounts();const splits=paySchedule?.splits||[];if(splits[0]){document.getElementById('ob-pay-amt-1').value=splits[0].amount||'';document.getElementById('ob-pay-account-1').value=splits[0].account||onboardAccounts[0]?.key||''}if(splits[1]){document.getElementById('ob-pay-amt-2').value=splits[1].amount||'';document.getElementById('ob-pay-account-2').value=splits[1].account||onboardAccounts[1]?.key||onboardAccounts[0]?.key||''}toggleOnboardPayMode();syncOnboardSalarySplitAmounts();renderOnboardBills();onboardStep=0;renderOnboardingProgress();document.getElementById('onboard-overlay').classList.add('show')}}
function skipOnboarding(){localStorage.setItem('ft_onboarded','1');document.getElementById('onboard-overlay').classList.remove('show')}
function finishOnboarding(){const sal=parseFloat(document.getElementById('ob-salary').value)||0;if(sal<=0){showAlert('Enter your monthly salary.');return;}salary=sal;const mode=document.getElementById('ob-pay-mode').value;let days=[],splits=[];if(mode==='monthly'){const day=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-single').value)||30));const amount=parseFloat(document.getElementById('ob-pay-amt-1').value)||sal;const account=document.getElementById('ob-pay-account-1').value||onboardAccounts[0]?.key||'';days=[day];splits=[{day,amount,account}]}else{const d1=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-1').value)||5));const d2=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-2').value)||20));const a1=parseFloat(document.getElementById('ob-pay-amt-1').value)||Math.round(sal/2);const a2=parseFloat(document.getElementById('ob-pay-amt-2').value)||Math.max(0,sal-a1);const acc1=document.getElementById('ob-pay-account-1').value||onboardAccounts[0]?.key||'';const acc2=document.getElementById('ob-pay-account-2').value||onboardAccounts[1]?.key||onboardAccounts[0]?.key||'';splits=[{day:d1,amount:a1,account:acc1},{day:d2,amount:a2,account:acc2}].sort((a,b)=>a.day-b.day);days=splits.map(s=>s.day)}if(Math.round(splits.reduce((sum,s)=>sum+Number(s.amount||0),0))!==Math.round(sal)){showAlert('Your payday amounts should add up to your monthly salary.');return;}paySchedule={mode,days,splits};const requiredSalaryAccounts=new Set(splits.map(s=>s.account).filter(Boolean));onboardAccounts.forEach(a=>{if(requiredSalaryAccounts.has(a.key))a.selected=true});nwAccounts=onboardAccounts.filter(a=>a.selected).map(a=>({key:a.key,name:a.name,icon:a.icon}));if(!nwAccounts.length)nwAccounts=[{key:'cash',name:'Cash',icon:'💵'}];nwBalances={};nwAccounts.forEach(a=>{const found=onboardAccounts.find(x=>x.key===a.key);nwBalances[a.key]=found?Number(found.balance||0):0});recurring=recurring.filter(r=>!ONBOARD_DEFAULT_BILLS.some(b=>b.name===r.name));onboardBills.filter(b=>b.selected&&Number(b.amount||0)>0).forEach(b=>{recurring.push({id:nextRecurringId++,type:'bill',name:b.name,amount:Number(b.amount||0),day:parseInt(b.day)||1,category:b.category,lastPaid:''})});const totalBills=onboardBills.filter(b=>b.selected).reduce((s,b)=>s+Number(b.amount||0),0);const baseNeeds=Math.max(salary*0.5-totalBills,0);const baseWants=Math.max(salary*0.3-169,0);budgets['Electric Bill']=Number(onboardBills.find(b=>b.name==='Electric Bill'&&b.selected)?.amount||budgets['Electric Bill']||0);budgets['Water']=Number(onboardBills.find(b=>b.name==='Water'&&b.selected)?.amount||budgets['Water']||0);budgets['Spotify']=Number(onboardBills.find(b=>b.name==='Spotify'&&b.selected)?.amount||budgets['Spotify']||0);budgets['Insurance / HMO']=Number(onboardBills.find(b=>b.name==='Insurance / HMO'&&b.selected)?.amount||budgets['Insurance / HMO']||0);budgets['Groceries & Food']=Math.round(baseNeeds*0.6);budgets['Transport']=Math.round(baseNeeds*0.15);budgets['Health / Medical']=Math.round(baseNeeds*0.1);budgets['Miscellaneous / Buffer']=Math.round(baseNeeds*0.15);budgets['Entertainment']=Math.round(baseWants*0.55);budgets['Personal / Self-Care']=Math.round(baseWants*0.25);budgets['Education / Self-Improvement']=Math.round(baseWants*0.2);budgets['Savings (BDO)']=Math.max(Math.round(salary*0.1),0);budgets['Emergency Fund (Digital Bank)']=Math.max(Math.round(salary*0.05),0);budgets['Investments (MP2/UITF)']=Math.max(Math.round(salary*0.05),0);budgets['Big Purchases / Goals']=0;localStorage.setItem('ft_onboarded','1');saveData();document.getElementById('onboard-overlay').classList.remove('show');render();setTimeout(()=>{if(shouldStartTutorial())startTutorial()},350)}

/* Edit entries/income */
function toggleEditCustom(){const wrap=document.getElementById('me-custom-cat-wrap');if(!wrap)return;wrap.style.display=document.getElementById('me-cat').value==='__other__'?'block':'none'}
function openEntryEdit(id){const e=entries.find(x=>x.id===id);if(!e)return;if((e.isDebtPayment||e.isDebtPaymentFee)&&e.debtPaymentId){showAlert('Edit the linked debt payment instead.');return;}if(e.isGoalContribution&&e.goalContributionId){showAlert('Edit the linked goal contribution instead.');return;}editingEntryId=id;buildCatSelect('me-cat');document.getElementById('me-date').value=e.date;document.getElementById('me-amount').value=e.amount;document.getElementById('me-note').value=e.note||'';document.getElementById('me-cat').value=e.category;buildAccountSelect('me-account',true,true);document.getElementById('me-account').value=e.account||'';toggleEditCustom();updateEntryEditPreview();openModal('modal-edit-entry')}
function saveEntryEdit(){const e=entries.find(x=>x.id===editingEntryId);if(!e)return;let cat=document.getElementById('me-cat').value;const date=document.getElementById('me-date').value;const amount=parseFloat(document.getElementById('me-amount').value);const note=document.getElementById('me-note').value;const account=document.getElementById('me-account').value;if(!date||!amount||amount<=0){showAlert('Enter date and amount.');return;}if(!account){showAlert('Choose an account.');return;}if(cat==='__other__'){const cn=document.getElementById('me-custom-cat').value.trim();if(!cn){showAlert('Enter category name.');return;}if(!allCats().find(c=>c.name===cn)){customCats.push({name:cn,budget:0,type:'other',group:'wants',icon:'🏷️',colorClass:'cat-default'});budgets[cn]=0}cat=cn;document.getElementById('me-custom-cat').value=''}const refundedAmount=account===e.account?Number(e.amount||0):0;const balanceState=getSpendValidationState(account,amount,refundedAmount);if(!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}if(!isCCAccount(e.account))adjustAccountBalance(e.account,e.amount);e.date=date;e.amount=amount;e.note=note;e.category=cat;e.account=account;if(!isCCAccount(account))adjustAccountBalance(account,-amount);closeModal('modal-edit-entry');saveData();render()}
function deleteEditingEntry(){if(editingEntryId===null)return;if(deleteEntry(editingEntryId))closeModal('modal-edit-entry')}
function duplicateEditingEntry(){const e=entries.find(x=>x.id===editingEntryId);if(!e)return;const account=e.account||'';const amount=Number(e.amount||0);const balanceState=getSpendValidationState(account,amount);if(account&&!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}const duplicate=stampRecord({...e,id:nextId++,date:todayStr,note:e.note?e.note+' (copy)':'Copy'});entries.unshift(duplicate);if(!isCCAccount(account))adjustAccountBalance(account,-amount);rememberExpensePattern(duplicate);closeModal('modal-edit-entry');saveData();render();showActionToast(`${fmt(amount)} duplicated`,duplicate.category,'🧾')}
function openIncomeEdit(id){const i=incomes.find(x=>x.id===id);if(!i)return;if(i.isSalaryDeposit){showAlert('Scheduled salary deposits are locked. Delete the deposit first if you need to log it again correctly.');return;}editingIncomeId=id;document.getElementById('mi-date').value=i.date;document.getElementById('mi-amount').value=i.amount;document.getElementById('mi-source').value=i.source;buildAccountSelect('mi-account',true);document.getElementById('mi-account').value=i.account||'';document.getElementById('mi-note').value=i.note||'';openModal('modal-edit-income')}
function saveIncomeEdit(){const i=incomes.find(x=>x.id===editingIncomeId);if(!i)return;if(i.isSalaryDeposit){showAlert('Scheduled salary deposits cannot be edited here. Delete the deposit first if you need to log it again correctly.');return;}const date=document.getElementById('mi-date').value;const amount=parseFloat(document.getElementById('mi-amount').value);const source=document.getElementById('mi-source').value;const account=document.getElementById('mi-account').value;const note=document.getElementById('mi-note').value;if(!date||!amount||amount<=0){showAlert('Enter date and amount.');return;}adjustAccountBalance(i.account,-i.amount);i.date=date;i.amount=amount;i.source=source;i.account=account;i.note=note;adjustAccountBalance(account,amount);closeModal('modal-edit-income');saveData();render()}
function deleteEditingIncome(){if(editingIncomeId===null)return;if(deleteIncome(editingIncomeId))closeModal('modal-edit-income')}
function duplicateEditingIncome(){const i=incomes.find(x=>x.id===editingIncomeId);if(!i)return;if(i.isSalaryDeposit){showAlert('Scheduled salary deposits cannot be duplicated.');return;}const duplicate=stampRecord({...i,id:nextIncId++,date:todayStr,note:i.note?i.note+' (copy)':'Copy'});incomes.unshift(duplicate);adjustAccountBalance(duplicate.account,Number(duplicate.amount||0));rememberIncomePattern(duplicate);closeModal('modal-edit-income');saveData();render();showActionToast(`${fmt(duplicate.amount)} duplicated`,duplicate.source,'💵')}

/* Recurring */
function monthKeyFromDate(dateStr){return(dateStr||'').slice(0,7)}
function currentMonthKey(){return`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`}
function recurringDueDate(item,baseMonth){const[y,m]=baseMonth.split('-').map(Number);const lastDay=new Date(y,m,0).getDate();const day=Math.min(Math.max(parseInt(item.day||1),1),lastDay);return new Date(y,m-1,day)}
function recurringStatus(item){return getRecurringStatusForMonth(item,currentMonthKey())}
function toggleRecurringType(){const type=document.getElementById('r-type')?.value||'bill';const wrap=document.getElementById('r-cat-wrap');if(wrap)wrap.style.display=type==='bill'?'block':'none'}
function addRecurring(){const type=document.getElementById('r-type').value;const name=document.getElementById('r-name').value.trim();const amount=parseFloat(document.getElementById('r-amount').value)||0;const day=parseInt(document.getElementById('r-day').value)||0;const category=document.getElementById('r-cat').value;if(!name||amount<=0||day<1||day>31){showAlert('Enter a valid name, amount, and day.');return;}if(type==='bill'&&!category){showAlert('Choose a category.');return;}recurring.unshift({id:nextRecurringId++,type,name,amount,day,category:type==='bill'?category:'',lastPaid:''});['r-name','r-amount','r-day'].forEach(id=>document.getElementById(id).value='');document.getElementById('r-type').value='bill';toggleRecurringType();closeModal('modal-add-recurring');saveData();render()}
function markRecurringPaid(id){const item=recurring.find(x=>x.id===id);if(!item)return;const monthKey=currentMonthKey();const account=getDefaultAccountKey();if(item.lastPaid===monthKey){showAlert('Already marked as paid this month.');return;}if(!account){showAlert(item.type==='bill'?'Add an account first to pay recurring bills.':'Add an account first to receive recurring income.');return;}if(item.type==='bill'){const balanceState=getSpendValidationState(account,Number(item.amount||0));if(!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}entries.unshift(stampRecord({id:nextId++,date:todayStr,category:item.category||'Miscellaneous / Buffer',amount:item.amount,note:'Recurring: '+item.name,account}));adjustAccountBalance(account,-item.amount)}else{incomes.unshift(stampRecord({id:nextIncId++,date:todayStr,source:item.name,amount:item.amount,note:'Recurring income',account}));adjustAccountBalance(account,item.amount)}item.lastPaid=monthKey;saveData();render()}
function deleteRecurring(id){const item=recurring.find(r=>r.id===id);if(!item)return false;showConfirm(`Delete recurring ${item.type==='bill'?'bill':'income'} "${item.name}"?`,()=>{recurring=recurring.filter(r=>r.id!==id);saveData();render();showActionToast('Recurring item deleted',item.name,'🗑️');},'Delete',true);return true}

/* Alert settings */
function setAlertToggle(key,val){alertSettings[key]=val;saveData();render()}
function setAlertThreshold(val){alertSettings.budgetThreshold=Math.min(100,Math.max(1,parseInt(val)||80));saveData();render()}

/* Smart alerts */
function getDebtRealityAlertData(){
  const currentMonth=currentMonthKey();
  const borrowedThisMonth=incomes.filter(i=>(i.date||'').startsWith(currentMonth)&&isBorrowedIncomeSource(i.source));
  const debtModeActive=budgetStrategy.preset==='debt';
  const debtTarget=Math.max(Number(budgetStrategy.debtAttackTarget||0),0);
  const recommendedDebtTarget=getDebtModeTargets(salary).debtAttackAlloc;
  const savingsBudget=Math.round(Number(salary||0)*(Number(budgetStrategy.savingsPct||0)/100));
  return{borrowedThisMonth,debtModeActive,debtTarget,recommendedDebtTarget,savingsBudget};
}
function getSmartAlerts(ac,catTotals,totalIncome,remaining,monthTotal,daysLeft){const alerts=[];const threshold=alertSettings.budgetThreshold||80;ac.filter(c=>c.group!=='savings'&&(budgets[c.name]||0)>0).forEach(c=>{const spent=catTotals[c.name]||0;const budget=budgets[c.name]||0;const pct=spent/budget*100;if(pct>=100)alerts.push({type:'critical',icon:'🚨',title:`${c.name} is over budget`,detail:`Spent ${fmtShort(spent)} of ${fmtShort(budget)} (${Math.round(pct)}%)`});else if(pct>=threshold)alerts.push({type:'warn',icon:'⚠️',title:`${c.name} is near limit`,detail:`Spent ${Math.round(pct)}% of budget · ${fmtShort(Math.max(budget-spent,0))} left`})});if(alertSettings.overspendForecast){const dayOfMonth=now.getDate();const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();if(dayOfMonth>=5&&dayOfMonth<daysInMonth){const projected=(monthTotal/dayOfMonth)*daysInMonth;if(projected>totalIncome)alerts.push({type:'critical',icon:'📉',title:'On track to overspend this month',detail:`Projected spend ${fmtShort(projected)} vs income ${fmtShort(totalIncome)}`});else if(projected>totalIncome*0.9)alerts.push({type:'warn',icon:'📅',title:'Month-end cash will be tight',detail:`Projected remaining ${fmtShort(totalIncome-projected)} if spending continues`})}}if(alertSettings.lowBalanceAlerts){if(remaining<0)alerts.push({type:'critical',icon:'🧯',title:'You are in the red',detail:`Current remaining balance is ${fmtShort(remaining)}`});else if(daysLeft>0&&remaining/Math.max(daysLeft,1)<200)alerts.push({type:'warn',icon:'💸',title:'Daily budget is very low',detail:`Only ${fmtShort(remaining/Math.max(daysLeft,1))} per day left this month`})}if(alertSettings.recurringDueSoon){recurring.forEach(r=>{const s=recurringStatus(r);if(s.state==='due')alerts.push({type:'warn',icon:r.type==='bill'?'🧾':'💵',title:`${r.name} is due today`,detail:`${r.type==='bill'?'Bill':'Income'} · ${fmtShort(r.amount)}`});else if(s.state==='upcoming'&&s.days<=3)alerts.push({type:'info',icon:r.type==='bill'?'🗓️':'💰',title:`${r.name} due soon`,detail:`In ${s.days} day${s.days!==1?'s':''} · ${fmtShort(r.amount)}`});else if(s.state==='overdue')alerts.push({type:'critical',icon:'⏰',title:`${r.name} is overdue`,detail:`Past due by ${Math.abs(s.days)} day${Math.abs(s.days)!==1?'s':''}`})})}if(alertSettings.spikeAlerts){const lastMonthDate=new Date(now.getFullYear(),now.getMonth()-1,1);const lastMonthKey=`${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth()+1).padStart(2,'0')}`;const lastMonthTotals={};entries.filter(e=>e.date.startsWith(lastMonthKey)&&!e.isDebtPayment&&!e.isGoalContribution&&e.category!=='Transfer Fees').forEach(e=>{lastMonthTotals[e.category]=(lastMonthTotals[e.category]||0)+e.amount});ac.filter(c=>c.group!=='savings').forEach(c=>{const current=catTotals[c.name]||0;const prev=lastMonthTotals[c.name]||0;if(prev>=500&&current>prev*1.5)alerts.push({type:'info',icon:'📈',title:`${c.name} spending spiked`,detail:`${fmtShort(current)} this month vs ${fmtShort(prev)} last month`})})}if(alertSettings.badRealityAlerts!==false){const debtReality=getDebtRealityAlertData();if(debtReality.debtTarget<debtReality.recommendedDebtTarget&&debtReality.recommendedDebtTarget>0)alerts.push({type:'critical',icon:'🎯',title:'Debt payoff budget this month is below target',detail:`Debt attack is ${fmtShort(debtReality.debtTarget)} vs target ${fmtShort(debtReality.recommendedDebtTarget)}`});if(debtReality.debtModeActive&&debtReality.borrowedThisMonth.length)alerts.push({type:'critical',icon:'🧨',title:'New borrowing recorded while debt mode is active',detail:`${debtReality.borrowedThisMonth.length} borrowed-money record${debtReality.borrowedThisMonth.length===1?'':'s'} logged this month`});if(debtReality.savingsBudget>debtReality.debtTarget&&debtReality.debtTarget>0)alerts.push({type:'warn',icon:'⚖️',title:'Savings allocation is higher than debt allocation',detail:`Savings ${fmtShort(debtReality.savingsBudget)} vs debt attack ${fmtShort(debtReality.debtTarget)}`});if(debtReality.borrowedThisMonth.length)alerts.push({type:'warn',icon:'💳',title:'Loan proceeds were recorded as income',detail:`${fmtShort(debtReality.borrowedThisMonth.reduce((sum,item)=>sum+Number(item.amount||0),0))} of borrowed money was logged under income sources`})}const seen=new Set();return alerts.filter(a=>{const key=a.title+'|'+a.detail;if(seen.has(key))return false;seen.add(key);return true}).slice(0,6)}

/* Forecast */
function getProjectedRecurringImpact(){const monthKey=currentMonthKey();const today=new Date(todayStr+'T00:00:00');let expenses=0,income=0;recurring.forEach(r=>{if(r.lastPaid===monthKey)return;const due=recurringDueDate(r,monthKey);if(due>=today){if(r.type==='bill')expenses+=Number(r.amount||0);else income+=Number(r.amount||0)}});return{expenses,income}}
function getForecastData(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft){
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const dayOfMonth=Math.max(now.getDate(),1);
  const safeDays=Math.max(dayOfMonth,7);
  function getProjectedCategoryValue(cat,spent,budget){
    spent=Number(spent||0);
    budget=Number(budget||0);
    if(cat.type==='fixed'){
      const recurringMatch=recurring.find(r=>r.type==='bill'&&r.category===cat.name&&r.lastPaid!==currentMonthKey());
      return recurringMatch?Math.max(spent,Number(recurringMatch.amount||0)):spent;
    }
    if(cat.type==='variable'){
      if(spent<=0)return 0;
      const rawTrend=(spent/safeDays)*daysInMonth;
      let projected=dayOfMonth<7?Math.max(spent,spent+(rawTrend-spent)*0.35):Math.max(spent,rawTrend);
      if(dayOfMonth<7&&budget>0)projected=Math.min(projected,Math.max(spent,budget*1.5));
      return projected;
    }
    return spent;
  }
  const avgDailySpend=monthTotal/safeDays;
  const fixedSpent=ac.filter(c=>c.type==='fixed').reduce((sum,c)=>sum+getProjectedCategoryValue(c,catTotals[c.name]||0,budgets[c.name]||0),0);
  const variableProjectedSpend=ac.filter(c=>c.type==='variable').reduce((sum,c)=>sum+getProjectedCategoryValue(c,catTotals[c.name]||0,budgets[c.name]||0),0);
  const recurringImpact=getProjectedRecurringImpact();
  const budgetProjectedSpend=fixedSpent+variableProjectedSpend+recurringImpact.expenses;
  const projectedSpend=Math.max(budgetProjectedSpend,monthTotal);
  const projectedIncome=totalIncome+recurringImpact.income;
  const projectedBalance=projectedIncome-projectedSpend;
  const safeDailySpend=daysLeft>0?Math.max((remaining-recurringImpact.expenses+recurringImpact.income)/daysLeft,0):0;
  let status='On Track',color='var(--green)',subtitle='Looking healthy.';
  if(projectedBalance<0){
    status='Overspending';
    color='var(--red)';
    subtitle='May finish the month negative.';
  }else if(projectedBalance<projectedIncome*0.1){
    status='Tight';
    color='var(--amber)';
    subtitle='Watch daily spending.';
  }else if(projectedBalance>projectedIncome*0.2){
    status='Strong';
    color='var(--blue)';
    subtitle='Strong month-end cushion.';
  }
  return{avgDailySpend,fixedSpent,variableProjectedSpend,budgetProjectedSpend,projectedSpend,projectedIncome,projectedBalance,safeDailySpend,recurringImpact,status,color,subtitle};
}

/* Smart insights */
function getSmartInsights(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft,forecast){const insights=[];const nonSavings=ac.filter(c=>c.group!=='savings');const overBudget=nonSavings.map(c=>{const spent=catTotals[c.name]||0;const budget=budgets[c.name]||0;const pct=budget>0?(spent/budget*100):0;return{...c,spent,budget,pct}}).filter(c=>c.budget>0&&c.spent>c.budget).sort((a,b)=>(b.spent-b.budget)-(a.spent-a.budget));if(overBudget.length){const c=overBudget[0];insights.push({type:'warning',icon:'⚠️',title:`${c.name} is over budget`,detail:`Over by ${fmtShort(c.spent-c.budget)} (${Math.round(c.pct)}% used).`})}const topSpend=Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];if(topSpend&&topSpend[1]>0)insights.push({type:'info',icon:'📌',title:`Top spending: ${topSpend[0]}`,detail:`${fmtShort(topSpend[1])} this month.`});const savingsBudget=ac.filter(c=>c.group==='savings').reduce((s,c)=>s+Number(budgets[c.name]||0),0);const savingsRate=totalIncome>0?(savingsBudget/totalIncome*100):0;if(savingsRate>=15)insights.push({type:'good',icon:'✅',title:'Savings plan looks healthy',detail:`About ${Math.round(savingsRate)}% of income allocated to savings.`});else insights.push({type:'tip',icon:'💡',title:'Savings allocation is low',detail:'Try moving a little from wants into savings.'});const safeSpendNow=getSafeSpendRealData();if(safeSpendNow&&safeSpendNow.daily>0)insights.push({type:'tip',icon:'💡',title:'Safe daily spend target',detail:`Aim for around ${fmtShort(safeSpendNow.daily)} per day.`});const seen=new Set();return insights.filter(x=>{const key=x.title+'|'+x.detail;if(seen.has(key))return false;seen.add(key);return true}).slice(0,5)}

/* Notifications */
function toggleNotifications(){
  const panel=document.getElementById('notif-panel');
  if(!panel)return;
  panel.classList.toggle('show');
  if(panel.classList.contains('show')){
    panel.scrollTop=0;
  }
}
function markNotificationsSeen(){notificationsSeenAt=Date.now();saveData();const badge=document.getElementById('notif-badge');if(badge)badge.style.display='none'}
function getNotificationItems(ac,catTotals,forecast){const items=[];const monthKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;(recurring||[]).forEach(r=>{const paid=r.lastPaid===monthKey;const daysLeft=r.day-now.getDate();if(r.type==='bill'&&!paid&&daysLeft<0)items.push({type:'danger',icon:'🚨',title:`${r.name} is overdue`,detail:`Due on day ${r.day}.`,ts:5});else if(r.type==='bill'&&!paid&&daysLeft===0)items.push({type:'warning',icon:'🧾',title:`${r.name} is due today`,detail:`Amount ${fmtShort(r.amount)}.`,ts:4});else if(r.type==='bill'&&!paid&&daysLeft<=2&&daysLeft>=1)items.push({type:'info',icon:'📅',title:`${r.name} due soon`,detail:`Due in ${daysLeft} day${daysLeft!==1?'s':''}.`,ts:3})});if(forecast&&forecast.projectedBalance<0)items.push({type:'danger',icon:'📉',title:'Negative month-end forecast',detail:`Projected ${fmtShort(forecast.projectedBalance)} at month end.`,ts:5});ac.filter(c=>c.group!=='savings').forEach(c=>{const spent=catTotals[c.name]||0;const budget=budgets[c.name]||0;if(!budget)return;if(spent>budget)items.push({type:'warning',icon:'⚠️',title:`${c.name} over budget`,detail:`Over by ${fmtShort(spent-budget)}.`,ts:4})});const unique=[],seen=new Set();items.sort((a,b)=>b.ts-a.ts);for(const item of items){const key=item.title+'|'+item.detail;if(!seen.has(key)){seen.add(key);unique.push(item)}}return unique.slice(0,10)}

/* CRUD */

function rememberExpensePattern(entry){const key=entry.category||'__unknown__';addFlowState.lastExpenseByCategory[key]={account:entry.account||'',note:entry.note||'',amount:Number(entry.amount||0),date:entry.date||todayStr};}
function rememberIncomePattern(income){const key=income.source||'Other';addFlowState.lastIncomeBySource[key]={account:income.account||'',note:income.note||'',amount:Number(income.amount||0),date:income.date||todayStr};}
function updateAddPreviews(){
  const expAcc=document.getElementById('f-account')?.value||'';
  const expAmount=parseFloat(document.getElementById('f-amount')?.value)||0;
  renderSpendBalancePreview({wrapId:'expense-balance-preview',buttonId:'tour-target-submit-expense',title:'Expense balance preview',account:expAcc,amount:expAmount,submitLabel:'Add Expense',afterLabel:'After this expense',okMessage:'Enough balance for this expense.',warningMessage:'Not enough balance in this account.'});
  const incWrap=document.getElementById('income-balance-preview');
  const incAcc=document.getElementById('inc-account')?.value||'';
  const incAmount=parseFloat(document.getElementById('inc-amount')?.value)||0;
  if(incWrap){
    if(incAmount===0){incWrap.style.display='none';}else{
      const current=Number(nwBalances[incAcc]||0);
      incWrap.style.display='';
      incWrap.innerHTML=`<div class="add-subtitle" style="margin-bottom:4px">Income balance preview</div><div><strong>${esc(getAccountInfo(incAcc).name)}</strong> now: ${fmt(current)}</div><div>After this income: <strong>${fmt(current+incAmount)}</strong></div>`;
    }
  }
}
function updateEntryEditPreview(){const e=entries.find(x=>x.id===editingEntryId);const wrap=document.getElementById('me-balance-preview');if(!e||!wrap)return;const account=document.getElementById('me-account')?.value||'';const amount=parseFloat(document.getElementById('me-amount')?.value)||0;const refundedAmount=account===e.account?Number(e.amount||0):0;const extraLines=account&&account!==e.account?[`<div>${esc(getAccountInfo(e.account).name)} will get back <strong>${fmt(e.amount||0)}</strong> when you save.</div>`]:[];renderSpendBalancePreview({wrapId:'me-balance-preview',buttonId:'me-save-btn',title:'Edit balance preview',account,amount,submitLabel:'Save',afterLabel:'After saving this edit',refundedAmount,extraLines,okMessage:'Enough balance for this edit.',warningMessage:'Not enough balance in this account.'})}
function updateGoalContributionPreview(){const wrap=document.getElementById('gc-balance-preview');if(!wrap)return;const account=document.getElementById('gc-account')?.value||'';const amount=parseFloat(document.getElementById('gc-amount')?.value)||0;renderSpendBalancePreview({wrapId:'gc-balance-preview',buttonId:'gc-save-btn',title:'Contribution balance preview',account,amount,submitLabel:'Save',afterLabel:'After this contribution',okMessage:'Enough balance for this contribution.',warningMessage:'Not enough balance in this account.'})}
function updateDebtPaymentPreview(){const wrap=document.getElementById('dp-balance-preview');const debt=debts.find(d=>d.id===activeDebtPaymentDebtId);if(!wrap||!debt)return;const account=document.getElementById('dp-account')?.value||'';const rawAmount=parseFloat(document.getElementById('dp-amount')?.value)||0;const fee=Math.max(parseFloat(document.getElementById('dp-fee')?.value)||0,0);const amount=Math.min(rawAmount,Math.max(Number(debt.total||0),0));const totalDeduction=amount>0?amount+fee:0;const extraLines=rawAmount>amount&&amount>0?[`<div>Only <strong>${fmt(amount)}</strong> will be applied because that is the remaining debt balance.</div>`]:[];if(amount>0)extraLines.push(`<div>Applied to debt: <strong>${fmt(amount)}</strong></div>`);if(amount>0&&fee>0){extraLines.push(`<div>Bank transfer fee: <strong>${fmt(fee)}</strong></div>`);extraLines.push(`<div>Total deducted today: <strong>${fmt(totalDeduction)}</strong></div>`)}renderSpendBalancePreview({wrapId:'dp-balance-preview',buttonId:'dp-save-btn',title:'Payment balance preview',account,amount:totalDeduction,submitLabel:'Save Payment',afterLabel:fee>0?'After payment and fee':'After this payment',extraLines,okMessage:fee>0?'Enough balance for this payment and fee.':'Enough balance for this payment.',warningMessage:fee>0?'Not enough balance in this account for the payment and fee.':'Not enough balance in this account.'})}
function renderExpenseTemplates(){const wrap=document.getElementById('expense-templates');if(!wrap)return;const templates=addFlowState.favoriteExpenseTemplates||[];if(!templates.length){wrap.innerHTML='<div class="add-empty-note">No saved templates yet</div>';return;}wrap.innerHTML=templates.map((t,idx)=>{const accountName=t.account?getAccountInfo(t.account).name:'';return`<button type="button" class="template-card" onclick="applyExpenseTemplate(${idx})"><div class="template-kicker">${esc(t.category||'Template')}</div><div class="template-title">${esc(t.label||'Template')}</div><div class="template-meta-row"><span class="template-amount">${t.amount?fmtShort(t.amount):'Custom amount'}</span>${accountName?`<span class="template-account">${esc(accountName)}</span>`:''}</div></button>`}).join('');}
function applyExpenseTemplate(idx){const t=(addFlowState.favoriteExpenseTemplates||[])[idx];if(!t)return;document.getElementById('f-cat').value=t.category;toggleCustom();if(t.account)document.getElementById('f-account').value=t.account;if(t.note!==undefined)document.getElementById('f-note').value=t.note;if(t.amount)document.getElementById('f-amount').value=t.amount;updateAddPreviews();renderExpenseSuggestions();}
function applyExpenseAmount(value){document.getElementById('f-amount').value=value;updateAddPreviews();}
function applyExpensePattern(category){const p=(addFlowState.lastExpenseByCategory||{})[category];if(!p)return;if(p.account)document.getElementById('f-account').value=p.account;if(p.note)document.getElementById('f-note').value=p.note;if(p.amount)document.getElementById('f-amount').value=p.amount;updateAddPreviews();}
function renderExpenseSuggestions(){const wrap=document.getElementById('expense-suggestions');if(!wrap)return;const cat=document.getElementById('f-cat')?.value||'';const pattern=(addFlowState.lastExpenseByCategory||{})[cat];const sameCat=entries.filter(e=>e.category===cat).sort((a,b)=>new Date(getSortStamp(b))-new Date(getSortStamp(a))).slice(0,8);const amounts=[...new Set(sameCat.map(e=>Number(e.amount||0)).filter(v=>v>0))].slice(0,3);const notes=[...new Set(sameCat.map(e=>e.note).filter(Boolean))].slice(0,2);let html='<div class="add-suggestion-row">';if(pattern&&pattern.account)html+=`<button type="button" class="quick-chip" onclick="applyExpensePattern(${JSON.stringify(cat)})">Use last ${esc(getAccountInfo(pattern.account).name)}</button>`;amounts.forEach(v=>html+=`<button type="button" class="quick-chip" onclick="applyExpenseAmount(${v})">${fmtShort(v)}</button>`);notes.forEach(n=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('f-note').value=${JSON.stringify(n)}">${esc(n)}</button>`);html+='</div>';wrap.innerHTML=html;}
function applyIncomePattern(source){const p=(addFlowState.lastIncomeBySource||{})[source];if(!p)return;if(p.account)document.getElementById('inc-account').value=p.account;if(p.note)document.getElementById('inc-note').value=p.note;if(p.amount)document.getElementById('inc-amount').value=p.amount;updateAddPreviews();}
function renderIncomeSuggestions(){const wrap=document.getElementById('income-suggestions');if(!wrap)return;const source=document.getElementById('inc-source')?.value||'';const pattern=(addFlowState.lastIncomeBySource||{})[source];const sameSource=incomes.filter(i=>i.source===source).sort((a,b)=>new Date(getSortStamp(b))-new Date(getSortStamp(a))).slice(0,8);const amounts=[...new Set(sameSource.map(i=>Number(i.amount||0)).filter(v=>v>0))].slice(0,3);const notes=[...new Set(sameSource.map(i=>i.note).filter(Boolean))].slice(0,2);let html='<div class="add-suggestion-row">';if(pattern&&pattern.account)html+=`<button type="button" class="quick-chip" onclick="applyIncomePattern(${JSON.stringify(source)})">Use last ${esc(getAccountInfo(pattern.account).name)}</button>`;amounts.forEach(v=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('inc-amount').value=${v};updateAddPreviews()">${fmtShort(v)}</button>`);notes.forEach(n=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('inc-note').value=${JSON.stringify(n)}">${esc(n)}</button>`);html+='</div>';wrap.innerHTML=html;}
function resetExpenseForm(keepCategory=false){document.getElementById('f-amount').value='';if(!keepCategory){document.getElementById('f-cat').selectedIndex=0;toggleCustom();}document.getElementById('f-date').value=todayStr;document.getElementById('f-note').value='';updateAddPreviews();renderExpenseSuggestions();}
function resetIncomeForm(keepSource=false){document.getElementById('inc-amount').value='';if(!keepSource)document.getElementById('inc-source').selectedIndex=0;document.getElementById('inc-date').value=todayStr;document.getElementById('inc-note').value='';updateAddPreviews();renderIncomeSuggestions();}
function checkLikelyDuplicateExpense(entry){return entries.some(e=>e.date===entry.date&&e.category===entry.category&&Number(e.amount||0)===Number(entry.amount||0)&&(e.note||'')===(entry.note||''));}
function ensureCustomExpenseCategory(rawName,group='wants'){const name=(rawName||'').trim();if(!name)return'';if(!allCats().find(c=>c.name===name)){customCats.push({name,budget:0,type:'other',group,groupExplicit:true,icon:'🏷️',colorClass:'cat-default'});budgets[name]=0}return name}
function addEntryCore(stayOnAdd=false,afterSave=null){const date=document.getElementById('f-date').value||todayStr;const amount=parseFloat(document.getElementById('f-amount').value);let category=document.getElementById('f-cat').value;const account=document.getElementById('f-account').value;const note=document.getElementById('f-note').value.trim();if(category==='__other__'){category=ensureCustomExpenseCategory(document.getElementById('f-custom-cat').value,_selectedCatGroup);if(!category){showAlert('Enter custom category name.');return;}document.getElementById('f-custom-cat').value='';document.getElementById('custom-cat-group-wrap').style.display='none';}if(!date||!amount||amount<=0||!category||!account){showAlert('Please complete all required fields.');return;}const balanceState=getSpendValidationState(account,amount);if(!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}const entry=stampRecord({id:nextId++,date,amount,category,account,note});if(checkLikelyDuplicateExpense(entry)){showConfirm('This looks similar to a recent expense. Add anyway?',()=>{entries.unshift(entry);if(!isCCAccount(account))adjustAccountBalance(account,-amount);rememberExpensePattern(entry);saveData();resetExpenseForm(true);render();showActionToast(`${fmt(amount)} expense added`,`${category} · ${getAccountInfo(account).name}`,'🧾');if(typeof afterSave==='function'){afterSave(entry);return}if(stayOnAdd){showTab('add');return}showTab('dashboard');});return;}entries.unshift(entry);if(!isCCAccount(account))adjustAccountBalance(account,-amount);rememberExpensePattern(entry);saveData();resetExpenseForm(true);render();showActionToast(`${fmt(amount)} expense added`,`${category} · ${getAccountInfo(account).name}`,'🧾');if(typeof afterSave==='function'){afterSave(entry);return}if(stayOnAdd){showTab('add');return}showTab('dashboard');}
function addIncomeCore(stayOnAdd=false,afterSave=null){const date=document.getElementById('inc-date').value||todayStr;const amount=parseFloat(document.getElementById('inc-amount').value);const source=document.getElementById('inc-source').value;const account=document.getElementById('inc-account').value;const note=document.getElementById('inc-note').value.trim();if(!date||!amount||amount<=0||!source||!account){showAlert('Please complete all required fields.');return;}const income=stampRecord({id:nextIncId++,date,source,amount,note,account});incomes.unshift(income);adjustAccountBalance(account,amount);rememberIncomePattern(income);saveData();resetIncomeForm(true);render();showActionToast(`${fmt(amount)} income added`,`${source} · ${getAccountInfo(account).name}`,'💰');if(typeof afterSave==='function'){afterSave(income);return}if(stayOnAdd){showTab('add');return}showTab('dashboard');}
function addEntry(){const needsTutorialAdvance=tutorialActive&&TUTORIAL_STEPS[tutorialStep]&&TUTORIAL_STEPS[tutorialStep].submit;addEntryCore(false,needsTutorialAdvance?tutorialAfterExpenseSaved:null)}
function quickAdd(c){document.getElementById('f-cat').value=c;toggleCustom();showTab('add');document.getElementById('f-amount').focus()}
function deleteEntry(id){const e=entries.find(x=>x.id===id);if(!e)return false;if((e.isDebtPayment||e.isDebtPaymentFee)&&e.debtPaymentId)return deleteDebtPayment(e.debtPaymentId);if(e.isGoalContribution&&e.goalContributionId)return deleteGoalContribution(e.goalContributionId);showConfirm(`Delete this ${e.category} expense for ${fmt(e.amount)}?`,()=>{if(!isCCAccount(e.account))adjustAccountBalance(e.account,e.amount);entries=entries.filter(entry=>entry.id!==id);saveData();render();showActionToast('Expense deleted',`${e.category} · ${fmt(e.amount)}`,'🗑️');},'Delete',true);return true}
function addIncome(){addIncomeCore()}
function deleteIncome(id){const i=incomes.find(x=>x.id===id);if(!i)return false;showConfirm(`Delete this ${i.source} income for ${fmt(i.amount)}?`,()=>{if(i.isSalaryDeposit)clearSalaryReceiptForIncome(i);adjustAccountBalance(i.account,-i.amount);incomes=incomes.filter(income=>income.id!==id);saveData();render();showActionToast('Income deleted',`${i.source} · ${fmt(i.amount)}`,'🗑️');},'Delete',true);return true}
function addGoal(){const name=document.getElementById('g-name').value.trim();const target=parseFloat(document.getElementById('g-target').value)||0;const current=parseFloat(document.getElementById('g-current').value)||0;const monthly=parseFloat(document.getElementById('g-monthly').value)||0;const targetDate=document.getElementById('g-target-date').value||'';if(!name||target<=0){showAlert('Enter name and target.');return;}goals.push({id:nextGoalId++,name,target,current,monthly,targetDate});['g-name','g-target','g-current','g-monthly','g-target-date'].forEach(id=>document.getElementById(id).value='');closeModal('modal-add-goal');saveData();render()}
function getGoalContributions(goalId){return goalContributions.filter(c=>c.goalId===goalId).sort((a,b)=>getSortStamp(b).localeCompare(getSortStamp(a))||b.id-a.id)}
function getGoalContributionSummary(goalId){const list=getGoalContributions(goalId);return{count:list.length,total:list.reduce((s,c)=>s+Number(c.amount||0),0),latest:list[0]||null}}
function getGoalDeleteImpact(goalId){const contributionIds=new Set(goalContributions.filter(c=>c.goalId===goalId).map(c=>c.id));const contributions=contributionIds.size;const linkedEntries=entries.filter(e=>e.goalId===goalId||contributionIds.has(e.goalContributionId)).length;return{contributions,linkedEntries}}
function openGoalContribution(id){const g=goals.find(x=>x.id===id);if(!g)return;activeGoalContributionGoalId=id;document.getElementById('gc-amount').value=g.monthly||'';document.getElementById('gc-date').value=todayStr;buildAccountSelect('gc-account',true);document.getElementById('gc-account').value=getDefaultAccountKey();document.getElementById('gc-note').value='';updateGoalContributionPreview();openModal('modal-goal-contribution')}
function applyQuickGoalContribution(amount){document.getElementById('gc-amount').value=amount;updateGoalContributionPreview()}
function applyGoalMonthlyContribution(){const g=goals.find(x=>x.id===activeGoalContributionGoalId);if(!g)return;document.getElementById('gc-amount').value=Number(g.monthly||0)||'';updateGoalContributionPreview()}
function saveGoalContribution(){const g=goals.find(x=>x.id===activeGoalContributionGoalId);if(!g)return;let amount=parseFloat(document.getElementById('gc-amount').value)||0;const date=document.getElementById('gc-date').value;const account=document.getElementById('gc-account').value||getDefaultAccountKey();const note=document.getElementById('gc-note').value.trim();if(amount<=0||!date){showAlert('Enter a valid amount and date.');return;}if(!account){showAlert('Choose an account.');return;}const hasTarget=Number(g.target||0)>0;const remaining=hasTarget?Math.max(Number(g.target||0)-Number(g.current||0),0):Infinity;if(hasTarget&&remaining===0){showAlert(`${g.name} is already fully funded. Edit the goal to increase the target if you want to save more.`);return;}function _doSaveGoalContribution(finalAmount){const balanceState=getSpendValidationState(account,finalAmount);if(!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}g.current=Number(g.current||0)+finalAmount;const contributionId=nextGoalContributionId++;goalContributions.unshift(stampRecord({id:contributionId,goalId:g.id,name:g.name,amount:finalAmount,date,account,note}));entries.unshift(stampRecord({id:nextId++,date,category:'Goal Contribution',amount:finalAmount,note:`Goal Contribution: ${g.name}${note?` · ${note}`:''}`,account,isGoalContribution:true,goalId:g.id,goalContributionId:contributionId}));adjustAccountBalance(account,-finalAmount);const goalDone=Number(g.current||0)>=Number(g.target||0)&&hasTarget;closeModal('modal-goal-contribution');saveData();render();showActionToast(`${fmt(finalAmount)} added to ${g.name}`,`New saved amount: ${fmt(g.current||0)}`,'🎯');if(goalDone)showMilestoneSheet({icon:'🎯',title:'Goal completed',body:`${g.name} is now fully funded.`,statLabel:'Saved total',statValue:fmt(g.current||0)});}if(hasTarget&&amount>remaining){showConfirm(`Only ${fmt(remaining)} is needed to complete this goal.\n\nThe contribution will be capped at ${fmt(remaining)} so your account balance stays accurate. Continue?`,()=>{_doSaveGoalContribution(remaining);});return;}_doSaveGoalContribution(amount);}
function deleteGoalContribution(id){const gc=goalContributions.find(x=>x.id===id);if(!gc)return false;const g=goals.find(x=>x.id===gc.goalId);showConfirm(`Delete this contribution of ${fmt(gc.amount)}${g?` for ${g.name}`:''}?`,()=>{if(g)g.current=Math.max(0,Number(g.current||0)-Number(gc.amount||0));adjustAccountBalance(gc.account,Number(gc.amount||0));goalContributions=goalContributions.filter(x=>x.id!==id);entries=entries.filter(e=>e.goalContributionId!==id);saveData();render();if(document.getElementById('modal-goal-history')?.classList.contains('show')&&g)openGoalHistory(g.id);showActionToast('Contribution deleted',`${g?.name||'Goal'} · ${fmt(gc.amount)}`,'🗑️');},'Delete',true);return true}
function openGoalHistory(id){const g=goals.find(x=>x.id===id);if(!g)return;document.getElementById('gh-title').textContent=`${g.name} Contributions`;const list=getGoalContributions(id);document.getElementById('gh-list').innerHTML=list.length?`<div class="tx-list">${list.map(c=>{const ai=getAccountInfo(c.account);return `<div class="tx-item"><div class="tx-icon cat-savings">🎯</div><div class="tx-info"><div class="tx-name">${fmt(c.amount)}</div><div class="tx-meta">${c.date}${c.note?` · ${esc(c.note)}`:''}${ai.name?` · ${esc(ai.name)}`:''}</div></div><button class="btn-icon tx-delete" onclick="deleteGoalContribution(${c.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}).join('')}</div>`:'<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">No contributions yet</div></div>';openModal('modal-goal-history')}
function openGoalEdit(id){const g=goals.find(x=>x.id===id);if(!g)return;editingGoalId=id;document.getElementById('mg-name').value=g.name;document.getElementById('mg-target').value=g.target;document.getElementById('mg-current').value=g.current;document.getElementById('mg-monthly').value=g.monthly;document.getElementById('mg-target-date').value=g.targetDate||'';openModal('modal-edit-goal')}
function saveGoalEdit(){const g=goals.find(x=>x.id===editingGoalId);if(!g)return;g.name=document.getElementById('mg-name').value.trim()||g.name;g.target=parseFloat(document.getElementById('mg-target').value)||g.target;g.current=parseFloat(document.getElementById('mg-current').value)||0;g.monthly=parseFloat(document.getElementById('mg-monthly').value)||0;g.targetDate=document.getElementById('mg-target-date').value||'';closeModal('modal-edit-goal');saveData();render()}
function deleteGoal(){const goal=goals.find(g=>g.id===editingGoalId);if(!goal)return false;const impact=getGoalDeleteImpact(editingGoalId);if(impact.contributions||impact.linkedEntries){showAlert(`Can't delete ${goal.name} yet. It still has ${impact.contributions} contribution log${impact.contributions!==1?'s':''} and ${impact.linkedEntries} linked transaction${impact.linkedEntries!==1?'s':''}. Remove the contribution history first so balances and savings progress stay consistent.`);return false;}showConfirm(`Delete ${goal.name}?`,()=>{goals=goals.filter(g=>g.id!==editingGoalId);closeModal('modal-edit-goal');saveData();render();showActionToast('Goal deleted',goal.name,'🗑️');},'Delete',true);return true}
function getDebtLenderTypeForProduct(type=''){
  return({'Credit Card':'Credit Card Issuer','Personal Loan':'Bank','Friend/Family':'Friend/Family','BNPL':'Fintech / BNPL','Other':'Other'})[type]||'Other';
}
function syncDebtLenderType(selectId,type){
  const lenderEl=document.getElementById(selectId);
  if(!lenderEl)return;
  lenderEl.value=getDebtLenderTypeForProduct(type);
}
function toggleDebtTypeFields(){const type=document.getElementById('d-type').value;const showDeadline=type==='Friend/Family';const showLender=type==='Other';document.getElementById('d-deadline-group').style.display=showDeadline?'':'none';document.getElementById('d-lender-type-group').style.display=showLender?'':'none';if(!showDeadline)document.getElementById('d-deadline').value='';if(showLender)return;syncDebtLenderType('d-lender-type',type)}
function toggleDebtEditTypeFields(){const type=document.getElementById('md-type').value;const showDeadline=type==='Friend/Family';const showLender=type==='Other';document.getElementById('md-deadline-group').style.display=showDeadline?'':'none';document.getElementById('md-lender-type-group').style.display=showLender?'':'none';if(!showDeadline)document.getElementById('md-deadline').value='';if(showLender)return;syncDebtLenderType('md-lender-type',type)}
function addDebt(){const name=document.getElementById('d-name').value.trim();const type=document.getElementById('d-type').value;const total=parseFloat(document.getElementById('d-total').value)||0;const payment=parseFloat(document.getElementById('d-payment').value)||0;const interest=parseFloat(document.getElementById('d-interest').value)||0;const due=document.getElementById('d-due').value.trim();const deadline=document.getElementById('d-deadline').value||'';const lenderType=type==='Other'?(document.getElementById('d-lender-type').value||'Other'):getDebtLenderTypeForProduct(type);const minDue=parseFloat(document.getElementById('d-min-due').value)||0;const lateFeeRisk=document.getElementById('d-late-fee-risk').value||'Unknown';if(!name||total<=0){showAlert('Enter name and amount.');return;}debts.push({id:nextDebtId++,name,type,total,payment,interest,due,deadline,lenderType,minDue,lateFeeRisk});['d-name','d-total','d-payment','d-interest','d-due','d-deadline','d-min-due'].forEach(id=>document.getElementById(id).value='');document.getElementById('d-type').selectedIndex=0;document.getElementById('d-lender-type').selectedIndex=0;document.getElementById('d-late-fee-risk').value='Unknown';toggleDebtTypeFields();closeModal('modal-add-debt');saveData();render()}
function openDebtEdit(id){const d=debts.find(x=>x.id===id);if(!d)return;editingDebtId=id;document.getElementById('md-name').value=d.name;document.getElementById('md-type').value=d.type||'Other';document.getElementById('md-total').value=d.total;document.getElementById('md-payment').value=d.payment;document.getElementById('md-interest').value=d.interest;document.getElementById('md-due').value=d.due||'';document.getElementById('md-lender-type').value=d.lenderType||getDebtLenderTypeForProduct(d.type);document.getElementById('md-min-due').value=d.minDue||'';document.getElementById('md-late-fee-risk').value=d.lateFeeRisk||'Unknown';document.getElementById('md-deadline').value=d.deadline||'';toggleDebtEditTypeFields();openModal('modal-edit-debt')}
function saveDebtEdit(){const d=debts.find(x=>x.id===editingDebtId);if(!d)return;d.name=document.getElementById('md-name').value.trim()||d.name;d.type=document.getElementById('md-type').value||d.type;d.total=parseFloat(document.getElementById('md-total').value)||0;d.payment=parseFloat(document.getElementById('md-payment').value)||0;d.interest=parseFloat(document.getElementById('md-interest').value)||0;d.due=document.getElementById('md-due').value.trim();d.lenderType=d.type==='Other'?(document.getElementById('md-lender-type').value||'Other'):getDebtLenderTypeForProduct(d.type);d.minDue=parseFloat(document.getElementById('md-min-due').value)||0;d.lateFeeRisk=document.getElementById('md-late-fee-risk').value||'Unknown';if(d.type==='Friend/Family')d.deadline=document.getElementById('md-deadline').value||'';else d.deadline='';closeModal('modal-edit-debt');saveData();render()}
function getDebtDeleteImpact(debtId){const paymentIds=new Set(debtPayments.filter(p=>p.debtId===debtId).map(p=>p.id));const payments=paymentIds.size;const linkedEntries=entries.filter(e=>e.debtId===debtId||paymentIds.has(e.debtPaymentId)).length;return{payments,linkedEntries}}
function deleteDebt(){const debt=debts.find(d=>d.id===editingDebtId);if(!debt)return;const impact=getDebtDeleteImpact(editingDebtId);if(impact.payments||impact.linkedEntries){showAlert(`Can't delete ${debt.name} yet. It still has ${impact.payments} payment log${impact.payments!==1?'s':''} and ${impact.linkedEntries} linked transaction${impact.linkedEntries!==1?'s':''}. Remove the payment history first so balances and history stay consistent.`);return;}showConfirm(`Delete ${debt.name}?`,()=>{debts=debts.filter(d=>d.id!==editingDebtId);closeModal('modal-edit-debt');saveData();render();showActionToast('Debt deleted',debt.name,'🗑️');},'Delete',true);}
function getDebtPaymentsForDebt(id){return debtPayments.filter(p=>p.debtId===id).sort((a,b)=>getSortStamp(b).localeCompare(getSortStamp(a))||b.id-a.id)}
function refreshDebtPaymentDerivedState(debtId){const debt=debts.find(d=>d.id===debtId);if(!debt)return;const remaining=getDebtPaymentsForDebt(debtId);const latest=remaining[0]||null;const latestMarked=remaining.find(p=>p.markedMonthly)||null;if(latestMarked)debt.lastPaidMonth=(latestMarked.date||'').slice(0,7);else delete debt.lastPaidMonth;if(latest){debt.lastPaidDate=latest.date;debt.lastPaidAmount=latest.amount}else{delete debt.lastPaidDate;delete debt.lastPaidAmount}}
function getDebtPaymentFee(payment){return Math.max(Number(payment&&payment.fee||0),0)}
function getDebtPaymentTotalDeduction(payment){return Math.max(Number(payment&&payment.amount||0),0)+getDebtPaymentFee(payment)}
function getDebtPaymentFeeMeta(payment){const fee=getDebtPaymentFee(payment);return fee>0?` · Fee ${fmt(fee)}`:''}
function getDebtPaymentSummary(id){const list=getDebtPaymentsForDebt(id);const total=list.reduce((sum,p)=>sum+Number(p.amount||0),0);return{count:list.length,total,latest:list[0]||null}}
function getActiveDebts(){return debts.filter(d=>Number(d.total||0)>0)}
function getPaidOffDebts(){return debts.filter(d=>Number(d.total||0)<=0)}
function getDebtPayoffProjection(remaining,payment,annualRate){
  if(remaining<=0)return{months:0,payoffDate:null,totalInterest:0,isViable:true};
  if(payment<=0)return{months:null,payoffDate:null,totalInterest:null,isViable:false};
  let months,totalInterest=0;
  if(annualRate>0){
    const r=annualRate/100/12;
    if(payment<=remaining*r)return{months:null,payoffDate:null,totalInterest:null,isViable:false};
    months=Math.ceil(-Math.log(1-(r*remaining)/payment)/Math.log(1+r));
    totalInterest=Math.max(Math.round(payment*months-remaining),0);
  }else{
    months=Math.ceil(remaining/payment);
  }
  const payoffDate=new Date();payoffDate.setMonth(payoffDate.getMonth()+months);
  return{months,payoffDate,totalInterest,isViable:true};
}
function openDebtHistory(id){const debt=debts.find(d=>d.id===id);if(!debt)return;document.getElementById('dh-title').textContent=`${debt.name} Payments`;const list=getDebtPaymentsForDebt(id);document.getElementById('dh-list').innerHTML=list.length?list.map(p=>`<div class="tx-item"><div class="tx-icon cat-debt">💳</div><div class="tx-info"><div class="tx-name">${fmt(p.amount)}</div><div class="tx-meta">${esc(formatDateTime(p))}${p.markedMonthly?' · monthly':''}${p.account?` · ${esc(getAccountInfo(p.account).name)}`:''}${getDebtPaymentFeeMeta(p)}${p.note?` · ${esc(p.note)}`:''}</div></div></div>`).join(''):`<div class="empty"><div class="empty-text">No payments yet</div></div>`;openModal('modal-debt-history')}
function openDebtPayment(id){const debt=debts.find(x=>x.id===id);if(!debt)return;activeDebtPaymentDebtId=id;document.getElementById('dp-debt-name').textContent=`Payment for ${debt.name}`;document.getElementById('dp-amount').value=debt.payment||debt.total||'';document.getElementById('dp-date').value=todayStr;document.getElementById('dp-note').value='';document.getElementById('dp-fee').value='0';document.getElementById('dp-mark-paid').value='yes';buildAccountSelect('dp-account',true);document.getElementById('dp-account').value=getDefaultAccountKey();updateDebtPaymentPreview();openModal('modal-debt-payment')}
function saveDebtPayment(){const debt=debts.find(d=>d.id===activeDebtPaymentDebtId);if(!debt)return;const rawAmount=parseFloat(document.getElementById('dp-amount').value)||0;const fee=Math.max(parseFloat(document.getElementById('dp-fee').value)||0,0);const date=document.getElementById('dp-date').value;const account=document.getElementById('dp-account').value||getDefaultAccountKey();const note=document.getElementById('dp-note').value.trim();const markPaid=document.getElementById('dp-mark-paid').value==='yes';if(rawAmount<=0||!date){showAlert('Enter a valid amount and date.');return;}if(!account){showAlert('Choose an account.');return;}const amount=Math.min(rawAmount,Math.max(Number(debt.total||0),0));if(amount<=0){showAlert('This debt is already fully paid.');return;}const totalDeduction=amount+fee;const balanceState=getSpendValidationState(account,totalDeduction);if(!balanceState.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);return;}debt.total=Math.max(0,Number(debt.total||0)-amount);if(markPaid)debt.lastPaidMonth=(date||todayStr).slice(0,7);debt.lastPaidDate=date;debt.lastPaidAmount=amount;const paymentId=nextDebtPaymentId++;debtPayments.unshift(stampRecord({id:paymentId,debtId:debt.id,name:debt.name,amount,fee,date,account,note,markedMonthly:markPaid}));if(fee>0)entries.unshift(stampRecord({id:nextId++,date,category:'Transfer Fees',amount:fee,account,note:`Debt payment fee: ${debt.name}${note?` · ${note}`:''}`,isDebtPaymentFee:true,debtId:debt.id,debtPaymentId:paymentId}));entries.unshift(stampRecord({id:nextId++,date,category:'Debt Payment',amount,note:`Debt Payment: ${debt.name}${note?` · ${note}`:''}`,account,isDebtPayment:true,debtId:debt.id,debtPaymentId:paymentId}));adjustAccountBalance(account,-totalDeduction);
  // Sync linked NW credit card account balance
  const linkedNwAcc=nwAccounts.find(a=>a.accountType==='credit_card'&&String(a.linkedDebtId)===String(debt.id));
  if(linkedNwAcc)nwBalances[linkedNwAcc.key]=Math.max(0,Number(debt.total||0));
  const cleared=Number(debt.total||0)<=0;closeModal('modal-debt-payment');saveData();render();showActionToast(`${fmt(amount)} paid to ${debt.name}`,`Remaining balance: ${fmt(debt.total||0)}${fee>0?` · Fee ${fmt(fee)}`:''}`,'💳');if(cleared)showMilestoneSheet({icon:'🎉',title:'Debt cleared',body:`${debt.name} is now fully paid.`,statLabel:'Amount cleared',statValue:fmt(amount)})}
function deleteDebtPayment(paymentId){const payment=debtPayments.find(p=>p.id===paymentId);if(!payment)return false;showConfirm(`Delete this debt payment of ${fmt(payment.amount)} for ${payment.name}?`,()=>{const debt=debts.find(d=>d.id===payment.debtId);if(debt)debt.total=Number(debt.total||0)+Number(payment.amount||0);adjustAccountBalance(payment.account,getDebtPaymentTotalDeduction(payment));debtPayments=debtPayments.filter(p=>p.id!==paymentId);entries=entries.filter(e=>e.debtPaymentId!==paymentId);refreshDebtPaymentDerivedState(payment.debtId);saveData();render();showActionToast('Debt payment deleted',`${payment.name} · ${fmt(payment.amount)}${getDebtPaymentFee(payment)>0?` · Fee ${fmt(getDebtPaymentFee(payment))}`:''}`,'🗑️');},'Delete',true);return true}
function addWish(){const name=document.getElementById('w-name').value.trim();const price=parseFloat(document.getElementById('w-price').value)||0;const priority=document.getElementById('w-priority').value;if(!name){showAlert('Enter item name.');return;}wishlist.push({id:nextWishId++,name,price,priority,addedDate:todayStr});document.getElementById('w-name').value='';document.getElementById('w-price').value='';closeModal('modal-add-wish');saveData();render()}
function deleteWish(id){const wish=wishlist.find(w=>w.id===id);if(!wish)return false;showConfirm(`Remove "${wish.name}" from your wishlist?`,()=>{wishlist=wishlist.filter(w=>w.id!==id);saveData();render();showActionToast('Wish removed',wish.name,'🗑️');},'Delete',true);return true}
function buyWish(id){const w=wishlist.find(x=>x.id===id);if(!w)return;showConfirm(`Buy "${w.name}" and log ${fmt(w.price)}?`,()=>{entries.unshift({id:nextId++,date:todayStr,category:'Big Purchases / Goals',amount:w.price,note:'Wishlist: '+w.name,account:getDefaultAccountKey()});adjustAccountBalance(getDefaultAccountKey(),-w.price);wishlist=wishlist.filter(x=>x.id!==id);saveData();render();});}
function addJournal(){const month=document.getElementById('j-month').value;const title=document.getElementById('j-title').value.trim();const note=document.getElementById('j-note').value.trim();if(!note){showAlert('Write something!');return;}journal.unshift({id:nextJournalId++,month:month||filterMonth,title,note,date:todayStr});document.getElementById('j-title').value='';document.getElementById('j-note').value='';closeModal('modal-add-journal');saveData();render()}
function deleteJournal(id){const entry=journal.find(j=>j.id===id);if(!entry)return false;showConfirm(`Delete this journal entry${entry.title?` "${entry.title}"`:''}?`,()=>{journal=journal.filter(j=>j.id!==id);saveData();render();showActionToast('Journal deleted',entry.title||entry.month||'Journal entry','🗑️');},'Delete',true);return true}
function saveNetWorth(){nwAccounts.forEach(a=>{const el=document.getElementById('nw-'+a.key);if(el)nwBalances[a.key]=parseFloat(el.value)||0});const total=nwAccounts.reduce((s,a)=>s+(nwBalances[a.key]||0),0);const totalDebt=debts.reduce((s,d)=>s+d.total,0);const mo=filterMonth;const existing=nwHistory.findIndex(h=>h.month===mo);const rec={month:mo,total,debt:totalDebt,net:total-totalDebt,balances:{...nwBalances}};if(existing>=0)nwHistory[existing]=rec;else nwHistory.push(rec);nwHistory.sort((a,b)=>a.month.localeCompare(b.month));saveData();render()}
function openEditModal(n){editingCat=n;document.getElementById('modal-edit-name').value=n;const c=customCats.find(x=>x.name===n);_editCatGroup=c?.group||'wants';selectEditCatGroup(_editCatGroup);openModal('modal-edit-cat')}
function openDeleteModal(n){deletingCat=n;const cnt=entries.filter(e=>e.category===n).length;document.getElementById('modal-delete-msg').innerHTML=`Delete <strong>"${esc(n)}"</strong>?`+(cnt?` (${cnt} transaction${cnt>1?'s':''} will move to Misc)`:' No transactions to move.');openModal('modal-delete-cat')}
function confirmEdit(){const nn=document.getElementById('modal-edit-name').value.trim();if(!nn)return;const idx=customCats.findIndex(c=>c.name===editingCat);if(idx===-1)return;if(nn===editingCat&&customCats[idx].group===_editCatGroup){closeModal('modal-edit-cat');return;}if(nn!==editingCat&&allCats().find(c=>c.name===nn)){showAlert('Name exists.');return;}entries.forEach(e=>{if(e.category===editingCat)e.category=nn});budgets[nn]=budgets[editingCat]||0;delete budgets[editingCat];customCats[idx].name=nn;customCats[idx].group=_editCatGroup;customCats[idx].groupExplicit=true;closeModal('modal-edit-cat');saveData();render()}
function confirmDelete(){if(!deletingCat)return;entries.forEach(e=>{if(e.category===deletingCat)e.category='Miscellaneous / Buffer'});delete budgets[deletingCat];customCats=customCats.filter(c=>c.name!==deletingCat);closeModal('modal-delete-cat');saveData();render()}

/* Rebalance & Smart Budget */
let rebalanceMode='503020',pendingBudgetPreview=null,pendingSmartRefreshPreview=null,smartBudgetMode='503020';
function selectRebalanceMode(mode){rebalanceMode=mode;['503020','lastmonth','savemore'].forEach(m=>{const el=document.getElementById('rebalance-mode-'+m);if(el)el.classList.toggle('active',m===mode)});renderBudgetPreview()}
function getLastMonthKey(){const d=new Date(now.getFullYear(),now.getMonth()-1,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function getFixedBudgetMap(useCurrentFallback=true){const fixedMap={};allCats().filter(c=>c.type==='fixed').forEach(c=>{const recurringAmt=recurring.filter(r=>r.type==='bill'&&r.category===c.name).reduce((s,r)=>s+Number(r.amount||0),0);const currentBudget=Number(budgets[c.name]||0);if(recurringAmt>0&&currentBudget>0)fixedMap[c.name]=Math.min(recurringAmt,currentBudget);else fixedMap[c.name]=recurringAmt||(useCurrentFallback?currentBudget:0)});return fixedMap}
function computeBudgetPreview(mode,salaryValue){const ac=allCats();const fixedMap=getFixedBudgetMap(true);const fixedTotal=Object.values(fixedMap).reduce((s,v)=>s+Number(v||0),0);const variableNeedsCats=ac.filter(c=>c.type==='variable'&&c.group==='needs');const variableWantsCats=ac.filter(c=>c.type==='variable'&&c.group==='wants');const savingsCats=ac.filter(c=>c.group==='savings');const result={};Object.keys(fixedMap).forEach(k=>result[k]=Math.round(fixedMap[k]||0));if(mode==='503020'||mode==='savemore'){const split=mode==='savemore'?{needs:50,wants:20,savings:30}:{needs:50,wants:30,savings:20};const targetNeeds=Math.max((salaryValue*split.needs/100)-fixedTotal,0);const targetWants=Math.max(salaryValue*split.wants/100,0);const targetSavings=Math.max(salaryValue*split.savings/100,0);const nw={'Groceries & Food':.55,Transport:.15,'Health / Medical':.10,'Education / Self-Improvement':.08,'Miscellaneous / Buffer':.12};const ww={Entertainment:.45,'Personal / Self-Care':.30,'Education / Self-Improvement':.10,'Miscellaneous / Buffer':.15};const sw={'Savings (BDO)':.40,'Emergency Fund (Digital Bank)':.30,'Investments (MP2/UITF)':.20,'Big Purchases / Goals':.10};variableNeedsCats.forEach(c=>{result[c.name]=Math.round(targetNeeds*(nw[c.name]??(1/Math.max(variableNeedsCats.length,1))))});variableWantsCats.forEach(c=>{result[c.name]=Math.round(targetWants*(ww[c.name]??(1/Math.max(variableWantsCats.length,1))))});savingsCats.forEach(c=>{result[c.name]=Math.round(targetSavings*(sw[c.name]??(1/Math.max(savingsCats.length,1))))})}else if(mode==='lastmonth'){const lastMonthKey=getLastMonthKey();const lastTotals={};entries.filter(e=>e.date.startsWith(lastMonthKey)).forEach(e=>{lastTotals[e.category]=(lastTotals[e.category]||0)+Number(e.amount||0)});variableNeedsCats.forEach(c=>{result[c.name]=Math.round(Number(lastTotals[c.name]||budgets[c.name]||0)*1.1)});variableWantsCats.forEach(c=>{result[c.name]=Math.round(Number(lastTotals[c.name]||budgets[c.name]||0)*1.05)});savingsCats.forEach(c=>{result[c.name]=Math.round(Number(budgets[c.name]||0))});const totalPlanned=Object.values(result).reduce((s,v)=>s+Number(v||0),0);if(totalPlanned>salaryValue){const trimTarget=totalPlanned-salaryValue;const reducible=variableWantsCats.reduce((s,c)=>s+Number(result[c.name]||0),0);if(reducible>0)variableWantsCats.forEach(c=>{const share=Number(result[c.name]||0)/reducible;result[c.name]=Math.max(0,Math.round(Number(result[c.name]||0)-trimTarget*share))})}}const total=Object.values(result).reduce((s,v)=>s+Number(v||0),0);return{budgets:result,total,fixedTotal}}
function renderBudgetPreview(){const salaryValue=parseFloat(document.getElementById('rebalance-salary')?.value)||0;if(salaryValue<=0){document.getElementById('rebalance-summary').innerHTML='';document.getElementById('rebalance-preview').innerHTML='<div class="empty"><div class="empty-text">Enter a salary to preview.</div></div>';pendingBudgetPreview=null;return}const preview=computeBudgetPreview(rebalanceMode,salaryValue);pendingBudgetPreview=preview;const changed=Object.keys(preview.budgets).map(name=>{const current=Number(budgets[name]||0);const next=Number(preview.budgets[name]||0);return{name,current,next,diff:next-current}}).filter(x=>x.current!==x.next).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));document.getElementById('rebalance-summary').innerHTML=`<div class="card" style="padding:14px;margin:0"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div style="font-size:13px;font-weight:700">Planned: ${fmtShort(preview.total)}</div><div style="font-size:13px;font-weight:700;color:${preview.total>salaryValue?'var(--red)':'var(--green)'}">Salary: ${fmtShort(salaryValue)}</div></div></div>`;if(!changed.length){document.getElementById('rebalance-preview').innerHTML='<div class="empty"><div class="empty-text">No changes.</div></div>';return}document.getElementById('rebalance-preview').innerHTML=`<div style="display:grid;gap:8px;margin-top:10px">${changed.slice(0,12).map(item=>`<div style="padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-size:13px;font-weight:600">${esc(item.name)}</div><div style="font-size:12px;font-weight:700;color:${item.diff>0?'var(--green)':item.diff<0?'var(--red)':'var(--text3)'}">${item.diff>0?'+':''}${fmtShort(item.diff)}</div></div><div style="font-size:12px;color:var(--text3);margin-top:4px">${fmtShort(item.current)} → ${fmtShort(item.next)}</div></div>`).join('')}</div>`}
function openBudgetRebalance(){document.getElementById('rebalance-salary').value=salary||'';selectRebalanceMode(rebalanceMode);renderBudgetPreview();openModal('modal-budget-rebalance')}
function applyBudgetRebalance(){if(!pendingBudgetPreview){showAlert('Preview first.');return;}Object.keys(pendingBudgetPreview.budgets).forEach(name=>{budgets[name]=Math.round(Number(pendingBudgetPreview.budgets[name]||0))});saveData();closeModal('modal-budget-rebalance');render();showTab('more')}

function getPreviousMonthKeyFrom(monthKey){const d=new Date(monthKey+'-01T00:00:00');d.setMonth(d.getMonth()-1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function getRecentCompleteMonthKeys(count=3){let monthKey=currentMonthKey();const keys=[];for(let i=0;i<count;i++){monthKey=getPreviousMonthKeyFrom(monthKey);keys.push(monthKey)}return keys}
function getMonthCategorySpend(monthKey){const totals={};entries.filter(e=>(e.date||'').slice(0,7)===monthKey).forEach(e=>{totals[e.category]=(totals[e.category]||0)+Number(e.amount||0)});return totals}
function getVolatilityBuffer(values){const nonZero=values.filter(v=>v>0);if(!nonZero.length)return 1.05;const avg=nonZero.reduce((s,v)=>s+v,0)/nonZero.length;const spread=(Math.max(...nonZero)-Math.min(...nonZero))/Math.max(avg,1);if(spread>1)return 1.15;if(spread>.5)return 1.10;return 1.05}
function normalizeSmartRefreshBudgets(result,salaryValue,variableNeedsCats,variableWantsCats){
  let total=Object.values(result).reduce((s,v)=>s+Number(v||0),0);
  if(total<=salaryValue)return result;
  let excess=total-salaryValue;
  const trimGroup=(cats)=>{const pool=cats.reduce((s,c)=>s+Number(result[c.name]||0),0);if(pool<=0)return;const reduction=Math.min(excess,pool);cats.forEach(c=>{const current=Number(result[c.name]||0);const share=pool?current/pool:0;result[c.name]=Math.max(0,Math.round(current-(reduction*share)))});total=Object.values(result).reduce((s,v)=>s+Number(v||0),0);excess=Math.max(total-salaryValue,0)};
  trimGroup(variableWantsCats);
  if(excess>0)trimGroup(variableNeedsCats);
  return result;
}
function computeSmartRefreshPreview(salaryValue){
  const ac=allCats();
  const recentMonths=getRecentCompleteMonthKeys(3);
  const monthlyTotals=recentMonths.map(getMonthCategorySpend);
  const fixedCats=ac.filter(c=>c.type==='fixed');
  const variableNeedsCats=ac.filter(c=>c.type==='variable'&&c.group==='needs');
  const variableWantsCats=ac.filter(c=>c.type==='variable'&&c.group==='wants');
  const savingsCats=ac.filter(c=>c.group==='savings');
  const result={};
  const details=[];
  fixedCats.forEach(c=>{
    const recurringAmt=recurring.filter(r=>r.type==='bill'&&r.category===c.name).reduce((s,r)=>s+Number(r.amount||0),0);
    const current=Number(budgets[c.name]||0);
    const next=Math.round(recurringAmt>0?recurringAmt:current);
    result[c.name]=next;
    details.push({name:c.name,current,next,diff:next-current,confidence:recurringAmt>0?'high':'low',source:recurringAmt>0?'Recurring bills':'Current budget',reason:recurringAmt>0?'Based on your current recurring bill setup.':'No recurring bill found, so current budget stays.',group:c.group,type:c.type});
  });
  const buildFlexible=(cats,groupLabel)=>{
    cats.forEach(c=>{
      const vals=monthlyTotals.map(t=>Number(t[c.name]||0));
      const activeMonths=vals.filter(v=>v>0).length;
      const current=Number(budgets[c.name]||0);
      if(activeMonths<2){
        result[c.name]=Math.round(current);
        details.push({name:c.name,current,next:Math.round(current),diff:0,confidence:'low',source:'Current budget',reason:`Still learning ${c.name}. Not enough history yet, so current budget stays.`,group:c.group,type:c.type});
        return;
      }
      const weighted=(vals[0]||0)*0.5 + (vals[1]||0)*0.3 + (vals[2]||0)*0.2;
      const buffered=Math.round(weighted*getVolatilityBuffer(vals));
      result[c.name]=buffered;
      details.push({name:c.name,current,next:buffered,diff:buffered-current,confidence:activeMonths>=3?'high':'medium',source:'3-month behavior',reason:`Based on your last 3 months of ${groupLabel.toLowerCase()} spending with a small variability buffer.`,group:c.group,type:c.type});
    });
  };
  buildFlexible(variableNeedsCats,'Needs');
  buildFlexible(variableWantsCats,'Wants');
  savingsCats.forEach(c=>{
    const current=Math.round(Number(budgets[c.name]||0));
    result[c.name]=current;
    details.push({name:c.name,current,next:current,diff:0,confidence:'locked',source:'Current target',reason:'Savings categories stay unchanged in Smart Refresh.',group:c.group,type:c.type});
  });
  normalizeSmartRefreshBudgets(result,salaryValue,variableNeedsCats,variableWantsCats);
  details.forEach(d=>{d.next=Math.round(Number(result[d.name]||0));d.diff=d.next-d.current});
  const total=Object.values(result).reduce((s,v)=>s+Number(v||0),0);
  return{budgets:result,total,details,recentMonths};
}
function getSmartRefreshBadge(conf){if(conf==='high')return{label:'High confidence',bg:'var(--green-soft)',color:'var(--green)'};if(conf==='medium')return{label:'Medium confidence',bg:'var(--amber-soft)',color:'var(--amber)'};if(conf==='locked')return{label:'Unchanged',bg:'var(--accent-soft)',color:'var(--accent)'};return{label:'Keep default',bg:'var(--surface2)',color:'var(--text2)'}}
function renderSmartRefreshPreview(){
  const salaryValue=parseFloat(document.getElementById('smart-refresh-salary')?.value)||0;
  const summary=document.getElementById('smart-refresh-summary');
  const previewEl=document.getElementById('smart-refresh-preview');
  if(!summary||!previewEl)return;
  if(salaryValue<=0){
    summary.innerHTML='';
    previewEl.innerHTML='<div class="empty"><div class="empty-text">Enter your declared salary to preview suggestions.</div></div>';
    pendingSmartRefreshPreview=null;
    return;
  }
  const preview=computeSmartRefreshPreview(salaryValue);
  pendingSmartRefreshPreview=preview;
  const changed=preview.details.filter(d=>d.current!==d.next).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
  const unchangedCount=preview.details.length-changed.length;
  summary.innerHTML=`<div class="smart-refresh-summary-card"><div class="smart-refresh-summary-top"><div><div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text3);margin-bottom:4px">Suggested total</div><div style="font-size:20px;font-weight:800;letter-spacing:-.03em">${fmt(preview.total)}</div></div><div style="text-align:right"><div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text3);margin-bottom:4px">Declared salary</div><div style="font-size:20px;font-weight:800;letter-spacing:-.03em;color:${preview.total>salaryValue?'var(--red)':'var(--green)'}">${fmt(salaryValue)}</div></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><span class="smart-refresh-pill">3-month learning</span><span class="smart-refresh-pill">Suggest first</span><span class="smart-refresh-pill">Savings unchanged</span></div><div style="font-size:12px;color:var(--text2);line-height:1.6">Built from ${preview.recentMonths.join(', ')}. Fixed categories follow recurring bills, flexible categories learn from recent spending, and low-data categories keep their current defaults.</div></div>`;
  const groups=[
    {key:'needs',title:'Needs'},
    {key:'wants',title:'Wants'},
    {key:'savings',title:'Savings'}
  ];
  previewEl.innerHTML=groups.map(group=>{
    const items=preview.details.filter(d=>d.group===group.key).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
    if(!items.length)return '';
    return `<div class="smart-refresh-group"><div class="smart-refresh-group-title">${group.title}</div>${items.map(item=>{const badge=getSmartRefreshBadge(item.confidence);const diffClass=item.diff>0?'smart-refresh-diff-up':item.diff<0?'smart-refresh-diff-down':'smart-refresh-diff-flat';return `<div class="smart-refresh-item"><div class="smart-refresh-item-top"><div style="min-width:0"><div class="smart-refresh-item-name">${esc(item.name)}</div><div class="smart-refresh-item-source">${esc(item.source)}</div></div><span style="font-size:11px;font-weight:700;padding:4px 9px;border-radius:999px;background:${badge.bg};color:${badge.color};white-space:nowrap">${badge.label}</span></div><div class="smart-refresh-item-mid"><div style="font-size:12px;color:var(--text2)">${fmtShort(item.current)} <span style="opacity:.55">→</span> <strong style="color:var(--text)">${fmtShort(item.next)}</strong></div><div class="${diffClass}" style="font-size:12px;font-weight:800">${item.diff>0?'+':''}${fmtShort(item.diff)}</div></div><div style="font-size:12px;color:var(--text2);line-height:1.6">${esc(item.reason)}</div></div>`}).join('')}</div>`;
  }).join('') + `<div class="smart-refresh-foot">${changed.length?`${changed.length} categories would change.`:'No category changes suggested.'} ${unchangedCount?`${unchangedCount} categories stay as they are.`:''}</div>`;
}
function openSmartRefresh(){const el=document.getElementById('smart-refresh-salary');if(el)el.value=salary||'';renderSmartRefreshPreview();openModal('modal-smart-refresh')}
function applySmartRefresh(){if(!pendingSmartRefreshPreview){showAlert('Preview suggestions first.');return;}Object.keys(pendingSmartRefreshPreview.budgets).forEach(name=>{budgets[name]=Math.round(Number(pendingSmartRefreshPreview.budgets[name]||0))});saveData();closeModal('modal-smart-refresh');render();showActionToast('Smart Refresh applied','Suggested budgets were applied to your categories.','🧠');showTab('more')}
function selectSmartMode(mode){smartBudgetMode=mode;const a=document.getElementById('smart-mode-503020');const b=document.getElementById('smart-mode-conservative');if(a)a.classList.toggle('active',mode==='503020');if(b)b.classList.toggle('active',mode==='conservative')}
function getRecurringBillAmount(categoryName){return recurring.filter(r=>r.type==='bill'&&r.category===categoryName).reduce((sum,r)=>sum+Number(r.amount||0),0)}
function runSmartBudgetSetup(){const newSalary=parseFloat(document.getElementById('smart-salary').value)||0;const billMode=document.getElementById('smart-bill-mode').value;if(newSalary<=0){showAlert('Enter a valid salary.');return;}salary=newSalary;const split=smartBudgetMode==='conservative'?{needs:45,wants:20,savings:35}:{needs:50,wants:30,savings:20};const fixedCats=allCats().filter(c=>c.type==='fixed');const variableNeedsCats=allCats().filter(c=>c.type==='variable'&&c.group==='needs');const variableWantsCats=allCats().filter(c=>c.type==='variable'&&c.group==='wants');const savingsCats=allCats().filter(c=>c.group==='savings');let fixedTotal=0;fixedCats.forEach(c=>{const recurringAmt=getRecurringBillAmount(c.name);let amount=0;if(billMode==='keep')amount=Math.max(Number(budgets[c.name]||0),recurringAmt);else amount=recurringAmt||Number(budgets[c.name]||0)||0;budgets[c.name]=Math.round(amount);fixedTotal+=budgets[c.name]});const targetNeeds=Math.max((salary*split.needs/100)-fixedTotal,0);const targetWants=Math.max(salary*split.wants/100,0);const targetSavings=Math.max(salary*split.savings/100,0);const nw={'Groceries & Food':.55,Transport:.15,'Health / Medical':.10,'Education / Self-Improvement':.08,'Miscellaneous / Buffer':.12};const ww={Entertainment:.45,'Personal / Self-Care':.30,'Education / Self-Improvement':.10,'Miscellaneous / Buffer':.15};const sw={'Savings (BDO)':.40,'Emergency Fund (Digital Bank)':.30,'Investments (MP2/UITF)':.20,'Big Purchases / Goals':.10};variableNeedsCats.forEach(c=>{budgets[c.name]=Math.round(targetNeeds*(nw[c.name]??(1/Math.max(variableNeedsCats.length,1))))});variableWantsCats.forEach(c=>{budgets[c.name]=Math.round(targetWants*(ww[c.name]??(1/Math.max(variableWantsCats.length,1))))});savingsCats.forEach(c=>{budgets[c.name]=Math.round(targetSavings*(sw[c.name]??(1/Math.max(savingsCats.length,1))))});saveData();closeModal('modal-smart-budget');render();showTab('more')}

/* Export & Backup */
function parseHistoryCategoryValues(raw){
  if(!raw)return [];
  try{
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed.filter(Boolean):[];
  }catch(err){
    return [];
  }
}
function setHistorySelectedCategories(values){
  const el=document.getElementById('hist-filter-values');
  if(el)el.value=JSON.stringify(Array.isArray(values)?values:[]);
}
function getHistorySelectedCategories(){
  return parseHistoryCategoryValues(document.getElementById('hist-filter-values')?.value||'');
}
function normalizeHistorySelectedCategories(categoryNames,values=getHistorySelectedCategories()){
  const valid=(Array.isArray(values)?values:[]).filter(name=>categoryNames.includes(name));
  if(!categoryNames.length)return [];
  return valid.length?valid:[...categoryNames];
}
function getHistoryCategorySummaryLabel(selected,categoryNames){
  if(!categoryNames.length)return 'No Categories';
  if(selected.length>=categoryNames.length)return 'All Categories';
  if(selected.length===1)return selected[0];
  if(selected.length===2)return `${selected[0]}, ${selected[1]}`;
  return `${selected.length} Categories`;
}
function setHistoryQuickPreset(value){
  const el=document.getElementById('hist-quick-preset');
  if(el)el.value=value||'';
}
function getHistoryQuickPreset(){
  return document.getElementById('hist-quick-preset')?.value||'';
}
function shiftHistoryDate(dateStr,days){
  if(!dateStr)return '';
  const date=new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate()+days);
  return toLocal(date);
}
function renderHistoryQuickRanges(){
  const wrap=document.getElementById('hist-quick-ranges');
  if(!wrap)return;
  const active=getHistoryQuickPreset();
  const presets=[
    {key:'today',label:'Today'},
    {key:'yesterday',label:'Yesterday'},
    {key:'last7',label:'Last 7 Days'},
    {key:'thisMonth',label:'This Month'},
    {key:'lastMonth',label:'Last Month'}
  ];
  wrap.innerHTML=presets.map(preset=>`<button type="button" class="quick-chip ${active===preset.key?'active':''}" onclick="applyHistoryQuickRange('${preset.key}')">${preset.label}</button>`).join('');
}
function reopenHistoryCategoryMenu(){
  requestAnimationFrame(()=>{
    const details=document.getElementById('hist-filter-details');
    if(details)details.open=true;
  });
}
function selectAllHistoryCategories(){
  const selected=allCats().map(c=>c.name);
  setHistorySelectedCategories(selected);
  render();
  reopenHistoryCategoryMenu();
}
function selectOnlyHistoryCategory(value){
  setHistorySelectedCategories(value?[value]:allCats().map(c=>c.name));
  render();
  reopenHistoryCategoryMenu();
}
function openHistoryPicker(input,event){
  if(!input||typeof input.showPicker!=='function')return;
  if(event?.type==='pointerdown'){
    event.preventDefault();
    input.focus({preventScroll:true});
  }
  try{
    input.showPicker();
  }catch(err){}
}
function applyHistoryQuickRange(preset){
  const monthEl=document.getElementById('hist-month');
  const dayEl=document.getElementById('hist-day');
  const weekEl=document.getElementById('hist-week');
  const fromEl=document.getElementById('hist-from');
  const toEl=document.getElementById('hist-to');
  if(monthEl)monthEl.value='';
  if(dayEl)dayEl.value='';
  if(weekEl)weekEl.value='';
  if(fromEl)fromEl.value='';
  if(toEl)toEl.value='';
  if(preset==='today'){
    if(dayEl)dayEl.value=todayStr;
    if(monthEl)monthEl.value=todayStr.slice(0,7);
  }else if(preset==='yesterday'){
    const yesterday=shiftHistoryDate(todayStr,-1);
    if(dayEl)dayEl.value=yesterday;
    if(monthEl)monthEl.value=yesterday.slice(0,7);
  }else if(preset==='last7'){
    if(fromEl)fromEl.value=shiftHistoryDate(todayStr,-6);
    if(toEl)toEl.value=todayStr;
  }else if(preset==='thisMonth'){
    if(monthEl)monthEl.value=currentMonthKey();
  }else if(preset==='lastMonth'){
    if(monthEl)monthEl.value=getLastMonthKey();
  }
  setHistoryQuickPreset(preset);
  render();
}
function updateHistoryCategorySelection(value,checked){
  const categoryNames=allCats().map(c=>c.name);
  let selected=normalizeHistorySelectedCategories(categoryNames);
  if(checked&&!selected.includes(value))selected.push(value);
  if(!checked)selected=selected.filter(name=>name!==value);
  if(!selected.length)selected=[...categoryNames];
  setHistorySelectedCategories(selected);
  render();
  reopenHistoryCategoryMenu();
}
function buildHistoryCategoryFilter(categories=allCats()){
  const wrap=document.getElementById('hist-filter-wrap');
  if(!wrap)return;
  const categoryNames=categories.map(c=>c.name);
  const selected=normalizeHistorySelectedCategories(categoryNames);
  const wasOpen=!!document.getElementById('hist-filter-details')?.open;
  setHistorySelectedCategories(selected);
  wrap.innerHTML=`<details class="hist-multi" id="hist-filter-details" ${wasOpen?'open':''}><summary class="input hist-multi-summary"><span class="hist-multi-summary-text">${esc(getHistoryCategorySummaryLabel(selected,categoryNames))}</span><span class="hist-multi-chevron">v</span></summary><div class="hist-multi-menu"><div class="hist-multi-actions"><button type="button" class="btn btn-ghost btn-sm hist-multi-action" onclick="event.preventDefault();event.stopPropagation();selectAllHistoryCategories()">All</button></div><div class="hist-multi-options">${categories.map(cat=>`<div class="hist-multi-option-row"><label class="hist-multi-option"><input type="checkbox" ${selected.includes(cat.name)?'checked':''} onchange='updateHistoryCategorySelection(${JSON.stringify(cat.name)},this.checked)'><span>${cat.icon?`${cat.icon} `:''}${esc(cat.name)}</span></label><button type="button" class="btn btn-ghost btn-sm hist-multi-only" onclick='event.preventDefault();event.stopPropagation();selectOnlyHistoryCategory(${JSON.stringify(cat.name)})'>Only</button></div>`).join('')}</div></div></details><input type="hidden" id="hist-filter-values">`;
  setHistorySelectedCategories(selected);
}
function handleHistoryMonthChange(){
  const dayEl=document.getElementById('hist-day');
  const weekEl=document.getElementById('hist-week');
  const fromEl=document.getElementById('hist-from');
  const toEl=document.getElementById('hist-to');
  if(dayEl)dayEl.value='';
  if(weekEl)weekEl.value='';
  if(fromEl)fromEl.value='';
  if(toEl)toEl.value='';
  setHistoryQuickPreset('');
  render();
}
function handleHistoryDayChange(){
  const dayEl=document.getElementById('hist-day');
  const weekEl=document.getElementById('hist-week');
  const monthEl=document.getElementById('hist-month');
  const fromEl=document.getElementById('hist-from');
  const toEl=document.getElementById('hist-to');
  const day=dayEl?.value||'';
  if(weekEl)weekEl.value='';
  if(fromEl)fromEl.value='';
  if(toEl)toEl.value='';
  if(day&&monthEl)monthEl.value=day.slice(0,7);
  setHistoryQuickPreset('');
  render();
}
function handleHistoryWeekChange(){
  const dayEl=document.getElementById('hist-day');
  const monthEl=document.getElementById('hist-month');
  const fromEl=document.getElementById('hist-from');
  const toEl=document.getElementById('hist-to');
  if(dayEl)dayEl.value='';
  if(monthEl)monthEl.value='';
  if(fromEl)fromEl.value='';
  if(toEl)toEl.value='';
  setHistoryQuickPreset('');
  render();
}
function handleHistoryRangeChange(){
  const monthEl=document.getElementById('hist-month');
  const dayEl=document.getElementById('hist-day');
  const weekEl=document.getElementById('hist-week');
  const fromEl=document.getElementById('hist-from');
  const toEl=document.getElementById('hist-to');
  if(monthEl)monthEl.value='';
  if(dayEl)dayEl.value='';
  if(weekEl)weekEl.value='';
  if(fromEl&&toEl&&fromEl.value&&toEl.value&&fromEl.value>toEl.value){
    const tmp=fromEl.value;
    fromEl.value=toEl.value;
    toEl.value=tmp;
  }
  setHistoryQuickPreset('');
  render();
}
function getHistoryState(){return{search:(document.getElementById('hist-search')?.value||'').trim().toLowerCase(),categories:getHistorySelectedCategories(),month:document.getElementById('hist-month')?.value||'',day:document.getElementById('hist-day')?.value||'',week:document.getElementById('hist-week')?.value||'',from:document.getElementById('hist-from')?.value||'',to:document.getElementById('hist-to')?.value||'',type:document.getElementById('hist-type')?.value||'all',account:document.getElementById('hist-account')?.value||'all',sort:document.getElementById('hist-sort')?.value||'newest',min:parseFloat(document.getElementById('hist-min')?.value),max:parseFloat(document.getElementById('hist-max')?.value)}}
function matchesHistorySearch(item,search){if(!search)return true;const haystack=[item.kind||'',item.category||'',item.source||'',item.isDebtPayment?'debt payment':'',getAccountInfo(item.account).name||'',item.note||'',item.date||'',String(item.amount||''),fmtShort(item.amount||0),fmt(item.amount||0)].join(' ').toLowerCase();return haystack.includes(search)}
function sortHistoryItems(items,mode){if(mode==='oldest')return items.sort((a,b)=>getSortStamp(a).localeCompare(getSortStamp(b)));if(mode==='highest')return items.sort((a,b)=>b.amount-a.amount);if(mode==='lowest')return items.sort((a,b)=>a.amount-b.amount);return items.sort((a,b)=>getSortStamp(b).localeCompare(getSortStamp(a)))}
function getISOWeekKey(dateStr){
  if(!dateStr)return '';
  const [year,month,day]=String(dateStr).split('-').map(Number);
  if(!year||!month||!day)return '';
  const date=new Date(Date.UTC(year,month-1,day));
  const dayNum=date.getUTCDay()||7;
  date.setUTCDate(date.getUTCDate()+4-dayNum);
  const weekYear=date.getUTCFullYear();
  const yearStart=new Date(Date.UTC(weekYear,0,1));
  const week=Math.ceil((((date-yearStart)/86400000)+1)/7);
  return `${weekYear}-W${String(week).padStart(2,'0')}`;
}
function getDateRangeForISOWeek(weekKey){
  const match=/^(\d{4})-W(\d{2})$/.exec(weekKey||'');
  if(!match)return{start:'',end:''};
  const year=Number(match[1]);
  const week=Number(match[2]);
  const jan4=new Date(Date.UTC(year,0,4));
  const jan4Day=jan4.getUTCDay()||7;
  const monday=new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate()-jan4Day+1+(week-1)*7);
  const sunday=new Date(monday);
  sunday.setUTCDate(monday.getUTCDate()+6);
  const start=`${monday.getUTCFullYear()}-${String(monday.getUTCMonth()+1).padStart(2,'0')}-${String(monday.getUTCDate()).padStart(2,'0')}`;
  const end=`${sunday.getUTCFullYear()}-${String(sunday.getUTCMonth()+1).padStart(2,'0')}-${String(sunday.getUTCDate()).padStart(2,'0')}`;
  return{start,end};
}
function getHistoryDateBounds(state){
  if(state.from||state.to)return{start:state.from||'',end:state.to||''};
  if(state.day)return{start:state.day,end:state.day};
  if(state.week)return getDateRangeForISOWeek(state.week);
  if(state.month){
    const [year,month]=state.month.split('-').map(Number);
    if(!year||!month)return{start:'',end:''};
    const lastDay=new Date(year,month,0).getDate();
    return{start:`${state.month}-01`,end:`${state.month}-${String(lastDay).padStart(2,'0')}`};
  }
  return{start:'',end:''};
}
function getHistoryPeriodLabel(state){
  const formatLabel=dateStr=>dateStr?new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'';
  if(state.from||state.to){
    if(state.from&&state.to)return `${formatLabel(state.from)} to ${formatLabel(state.to)}`;
    if(state.from)return `From ${formatLabel(state.from)}`;
    return `Until ${formatLabel(state.to)}`;
  }
  if(state.day)return formatLabel(state.day);
  if(state.week){
    const range=getDateRangeForISOWeek(state.week);
    return range.start&&range.end?`${formatLabel(range.start)} to ${formatLabel(range.end)}`:state.week;
  }
  if(state.month){
    const [year,month]=state.month.split('-').map(Number);
    return year&&month?new Date(year,month-1,1).toLocaleDateString('en-PH',{month:'long',year:'numeric'}):state.month;
  }
  return 'All time';
}
function matchesHistoryPeriod(dateStr,state){
  if(!dateStr)return false;
  if(state.from||state.to){
    if(state.from&&dateStr<state.from)return false;
    if(state.to&&dateStr>state.to)return false;
    return true;
  }
  if(state.day)return dateStr===state.day;
  if(state.week)return getISOWeekKey(dateStr)===state.week;
  if(state.month)return dateStr.startsWith(state.month);
  return true;
}
function filterHistoryCollections(state=getHistoryState()){
  const categoryNames=allCats().map(c=>c.name);
  const selectedCategories=normalizeHistorySelectedCategories(categoryNames,state.categories);
  const selectedSet=new Set(selectedCategories);
  const hasCategoryFilter=selectedCategories.length>0&&selectedCategories.length<categoryNames.length;
  let expenseData=[...entries].filter(item=>matchesHistoryPeriod(item.date,state));
  let incomeData=[...incomes].filter(item=>matchesHistoryPeriod(item.date,state));
  if(hasCategoryFilter)expenseData=expenseData.filter(item=>selectedSet.has(item.category));
  if(state.account&&state.account!=='all'){
    expenseData=expenseData.filter(item=>item.account===state.account);
    incomeData=incomeData.filter(item=>item.account===state.account);
  }
  if(!Number.isNaN(state.min)){
    expenseData=expenseData.filter(item=>item.amount>=state.min);
    incomeData=incomeData.filter(item=>item.amount>=state.min);
  }
  if(!Number.isNaN(state.max)){
    expenseData=expenseData.filter(item=>item.amount<=state.max);
    incomeData=incomeData.filter(item=>item.amount<=state.max);
  }
  if(state.search){
    expenseData=expenseData.filter(item=>matchesHistorySearch({kind:'expense',...item},state.search));
    incomeData=incomeData.filter(item=>matchesHistorySearch({kind:'income',...item},state.search));
  }
  sortHistoryItems(expenseData,state.sort);
  sortHistoryItems(incomeData,state.sort);
  return{expenseData,incomeData,selectedCategories};
}
function getHistorySummaryMetrics(historyCards,expenseTotal,incomeTotal,state){
  const netTotal=incomeTotal-expenseTotal;
  const largest=historyCards.reduce((top,item)=>!top||Number(item.amount||0)>Number(top.amount||0)?item:top,null);
  const bounds=getHistoryDateBounds(state);
  let spanDays=0;
  if(bounds.start&&bounds.end){
    spanDays=Math.max(1,Math.round((new Date(`${bounds.end}T00:00:00`)-new Date(`${bounds.start}T00:00:00`))/86400000)+1);
  }else{
    spanDays=new Set(historyCards.map(item=>item.date).filter(Boolean)).size;
  }
  const avgSpendPerDay=spanDays?expenseTotal/spanDays:0;
  return{
    netTotal,
    largest,
    spanDays,
    avgSpendPerDay,
    periodLabel:getHistoryPeriodLabel(state)
  };
}
function getHistorySortLabel(mode){return({newest:'Newest',oldest:'Oldest',highest:'Highest Amount',lowest:'Lowest Amount'})[mode]||'Newest'}
function getHistoryGroupModeLabel(mode){return({none:'Transactions',day:'Day',category:'Category',account:'Account'})[mode]||'Transactions'}
function getHistoryQuickPresetLabel(preset){return({today:'Today',yesterday:'Yesterday',last7:'Last 7 Days',thisMonth:'This Month',lastMonth:'Last Month'})[preset]||''}
function getHistoryAmountFilterLabel(state){
  const hasMin=!Number.isNaN(state.min);
  const hasMax=!Number.isNaN(state.max);
  if(hasMin&&hasMax)return `${fmtShort(state.min)} to ${fmtShort(state.max)}`;
  if(hasMin)return `Min ${fmtShort(state.min)}`;
  if(hasMax)return `Max ${fmtShort(state.max)}`;
  return '';
}
function getHistoryActiveFilterLabels(state=getHistoryState(),groupMode=getHistoryGroupMode()){
  const labels=[];
  const categoryNames=allCats().map(c=>c.name);
  const selectedCategories=normalizeHistorySelectedCategories(categoryNames,state.categories);
  if(state.search)labels.push(`Search: ${state.search}`);
  if(selectedCategories.length&&selectedCategories.length<categoryNames.length)labels.push(selectedCategories.length===1?selectedCategories[0]:`${selectedCategories.length} categories`);
  const quickPreset=getHistoryQuickPreset();
  if(quickPreset&&quickPreset!=='thisMonth')labels.push(getHistoryQuickPresetLabel(quickPreset));
  else if(!quickPreset&&(state.from||state.to||state.day||state.week||(state.month&&state.month!==filterMonth)))labels.push(getHistoryPeriodLabel(state));
  if(state.type!=='all')labels.push(state.type==='expense'?'Expenses only':'Income only');
  if(state.account&&state.account!=='all')labels.push(getAccountInfo(state.account).name);
  const amountLabel=getHistoryAmountFilterLabel(state);
  if(amountLabel)labels.push(amountLabel);
  if(groupMode!=='none')labels.push(`Group: ${getHistoryGroupModeLabel(groupMode)}`);
  if(state.sort!=='newest')labels.push(getHistorySortLabel(state.sort));
  return labels;
}
function renderHistoryTopbar(state,historySummary){
  const labels=getHistoryActiveFilterLabels(state,getHistoryGroupMode());
  const sub=document.getElementById('history-topbar-sub');
  if(sub)sub.textContent=labels.length?`${historySummary.periodLabel} • ${labels.length} active filter${labels.length===1?'':'s'}`:`${historySummary.periodLabel} • Open Search & Filters to refine the list.`;
  const count=document.getElementById('history-filter-count');
  if(count){
    if(labels.length){count.textContent=String(labels.length);count.style.display='inline-flex'}
    else count.style.display='none';
  }
  const wrap=document.getElementById('history-active-filters');
  if(wrap)wrap.innerHTML=labels.map(label=>`<span class="history-active-chip">${esc(label)}</span>`).join('');
}
function getHistoryGroupMode(){return document.getElementById('hist-group')?.value||'none'}
function getHistoryPresetState(){
  const state=getHistoryState();
  return{...state,group:getHistoryGroupMode(),quickPreset:getHistoryQuickPreset()};
}
function normalizeHistoryPresetStateForCompare(state={}){
  return{
    search:state.search||'',
    categories:[...(state.categories||[])].sort(),
    month:state.month||'',
    day:state.day||'',
    week:state.week||'',
    from:state.from||'',
    to:state.to||'',
    type:state.type||'all',
    account:state.account||'all',
    sort:state.sort||'newest',
    min:Number.isNaN(Number(state.min))?'':String(state.min??''),
    max:Number.isNaN(Number(state.max))?'':String(state.max??''),
    group:state.group||'none',
    quickPreset:state.quickPreset||''
  };
}
function isHistoryPresetStateMatch(a,b){
  return JSON.stringify(normalizeHistoryPresetStateForCompare(a))===JSON.stringify(normalizeHistoryPresetStateForCompare(b));
}
function applyHistoryStateToInputs(state={},presetName=''){
  const byId=(id)=>document.getElementById(id);
  if(byId('hist-search'))byId('hist-search').value=state.search||'';
  if(byId('hist-month'))byId('hist-month').value=state.month||'';
  if(byId('hist-day'))byId('hist-day').value=state.day||'';
  if(byId('hist-week'))byId('hist-week').value=state.week||'';
  if(byId('hist-from'))byId('hist-from').value=state.from||'';
  if(byId('hist-to'))byId('hist-to').value=state.to||'';
  if(byId('hist-type'))byId('hist-type').value=state.type||'all';
  if(byId('hist-account'))byId('hist-account').value=state.account||'all';
  if(byId('hist-sort'))byId('hist-sort').value=state.sort||'newest';
  if(byId('hist-min'))byId('hist-min').value=state.min??'';
  if(byId('hist-max'))byId('hist-max').value=state.max??'';
  if(byId('hist-group'))byId('hist-group').value=state.group||'none';
  if(byId('hist-preset-name'))byId('hist-preset-name').value=presetName||'';
  setHistoryQuickPreset(state.quickPreset||'');
  setHistorySelectedCategories(Array.isArray(state.categories)&&state.categories.length?state.categories:allCats().map(c=>c.name));
}
function saveHistoryPreset(){
  const input=document.getElementById('hist-preset-name');
  const name=(input?.value||'').trim();
  if(!name){showAlert('Enter a preset name first.');return;}
  const state=getHistoryPresetState();
  const existing=historySavedPresets.find(p=>p.id===historyActivePresetId)||historySavedPresets.find(p=>p.name.toLowerCase()===name.toLowerCase());
  if(existing){
    existing.name=name;
    existing.state=state;
    historyActivePresetId=existing.id;
  }else{
    historyActivePresetId=nextHistoryPresetId;
    historySavedPresets.unshift({id:nextHistoryPresetId++,name,state});
  }
  saveData();
  render();
  showActionToast('Preset saved',name,'🗂️');
}
function loadHistoryPreset(id){
  const preset=historySavedPresets.find(p=>p.id===id);
  if(!preset)return;
  historyActivePresetId=id;
  applyHistoryStateToInputs(preset.state||{},preset.name||'');
  render();
}
function deleteHistoryPreset(id){
  const preset=historySavedPresets.find(p=>p.id===id);
  if(!preset)return;
  showConfirm(`Delete preset "${preset.name}"?`,()=>{
    historySavedPresets=historySavedPresets.filter(p=>p.id!==id);
    if(historyActivePresetId===id)historyActivePresetId=null;
    saveData();
    render();
  },'Delete',true);
}
function renderHistoryPresets(){
  const wrap=document.getElementById('hist-presets');
  if(!wrap)return;
  if(!historySavedPresets.length){wrap.innerHTML='';return;}
  const currentState=getHistoryPresetState();
  wrap.innerHTML=`<div class="history-preset-wrap"><div class="history-preset-title">Saved Presets</div><div class="history-preset-list">${historySavedPresets.map(preset=>{const active=isHistoryPresetStateMatch(preset.state||{},currentState);return `<div class="history-preset-chip ${active?'active':''}"><button type="button" class="history-preset-load" onclick="loadHistoryPreset(${preset.id})">${esc(preset.name)}</button><button type="button" class="history-preset-delete" onclick="event.stopPropagation();deleteHistoryPreset(${preset.id})">×</button></div>`}).join('')}</div></div>`;
}
function getFilteredHistoryData(state=getHistoryState()){
  const {expenseData,incomeData}=filterHistoryCollections(state);
  const historyCards=[];
  if(state.type!=='income')historyCards.push(...expenseData.map(item=>({kind:'expense',...item})));
  if(state.type!=='expense')historyCards.push(...incomeData.map(item=>({kind:'income',...item})));
  sortHistoryItems(historyCards,state.sort);
  return{expenseData,incomeData,historyCards};
}
function getHistoryCardKey(item){return`${item.kind}:${item.id}`}
function getHistoryVisibleLimit(){return 20}
function getHistoryViewKey(state=getHistoryState(),groupMode=getHistoryGroupMode()){return JSON.stringify(normalizeHistoryPresetStateForCompare({...state,group:groupMode,quickPreset:getHistoryQuickPreset()}))}
function getVisibleHistoryCards(historyCards,state=getHistoryState(),groupMode=getHistoryGroupMode()){
  const nextKey=getHistoryViewKey(state,groupMode);
  const limit=getHistoryVisibleLimit();
  if(historyLastViewKey!==nextKey){
    historyLastViewKey=nextKey;
    historyVisibleCount=limit;
  }
  historyVisibleCount=Math.max(limit,historyVisibleCount||limit);
  return historyCards.slice(0,historyVisibleCount);
}
function loadMoreHistory(){
  historyVisibleCount+=getHistoryVisibleLimit();
  render();
}
function getHistoryItemLabel(item){
  if(item.kind==='income')return item.source||'Income';
  if(item.isDebtPayment)return'Debt Payment';
  if(item.isGoalContribution)return'Goal Contribution';
  return item.category||'Expense';
}
function getHistoryItemMeta(item){
  if(item.kind==='income')return `${formatDateTime(item)} · Received in ${getAccountInfo(item.account||'cash').name}${item.note?` · ${item.note}`:''}`;
  if(item.isDebtPayment){const payment=debtPayments.find(p=>p.id===item.debtPaymentId);return `${formatDateTime(item)} · ${(item.note||'').replace(/^Debt Payment:\s*/,'')}${item.account?` · ${getAccountInfo(item.account).name}`:''}${getDebtPaymentFeeMeta(payment)}`;}
  if(item.isGoalContribution)return `${formatDateTime(item)} · ${(item.note||'').replace(/^Goal Contribution:\s*/,'')}${item.account?` · ${getAccountInfo(item.account).name}`:''}`;
  return `${formatDateTime(item)}${item.note?` · ${item.note}`:''}`;
}
function getHistoryItemIcon(item){
  if(item.kind==='income')return{icon:'💵',className:'cat-income'};
  if(item.isDebtPayment)return{icon:'💳',className:'cat-debt'};
  if(item.isGoalContribution)return{icon:'🎯',className:'cat-savings'};
  const catInfo=getCatInfo(item.category);
  return{icon:catInfo.icon||'📦',className:catInfo.colorClass};
}
function getHistoryItemOpenAction(item){
  if(historyBulkMode)return canSelectHistoryItem(item)?`toggleHistoryItemSelection('${getHistoryCardKey(item)}',${!historySelectedKeys.has(getHistoryCardKey(item))})`:'';
  if(item.kind==='income')return item.isSalaryDeposit?'':`openIncomeEdit(${item.id})`;
  if(item.isDebtPayment||item.isGoalContribution||item.isDebtPaymentFee)return'';
  return`openEntryEdit(${item.id})`;
}
function getHistoryItemGroupLabel(item,mode){
  if(mode==='day')return item.date?new Date(`${item.date}T00:00:00`).toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'}):'No date';
  if(mode==='category'){
    if(item.kind==='income')return `Income · ${item.source||'Other'}`;
    if(item.isDebtPayment)return'Debt Payment';
    if(item.isGoalContribution)return'Goal Contribution';
    return item.category||'Uncategorized';
  }
  if(mode==='account')return getAccountInfo(item.account||'cash').name;
  return'Transactions';
}
function buildHistoryGroups(historyCards,mode){
  if(mode==='none')return[{key:'all',label:'Transactions',items:historyCards,expenseTotal:historyCards.filter(item=>item.kind==='expense').reduce((sum,item)=>sum+Number(item.amount||0),0),incomeTotal:historyCards.filter(item=>item.kind==='income').reduce((sum,item)=>sum+Number(item.amount||0),0)}];
  const groups=new Map();
  historyCards.forEach(item=>{
    const label=getHistoryItemGroupLabel(item,mode);
    const key=`${mode}:${label}`;
    if(!groups.has(key))groups.set(key,{key,label,items:[],expenseTotal:0,incomeTotal:0});
    const group=groups.get(key);
    group.items.push(item);
    if(item.kind==='income')group.incomeTotal+=Number(item.amount||0);
    else group.expenseTotal+=Number(item.amount||0);
  });
  return[...groups.values()];
}
function canChangeHistoryItemCategory(item){return item.kind==='expense'&&!item.isDebtPayment&&!item.isGoalContribution&&!item.isDebtPaymentFee}
function canChangeHistoryItemAccount(item){return !!item.account&&!item.isDebtPaymentFee}
function canSelectHistoryItem(item){return !item.isDebtPaymentFee}
function syncHistorySelection(historyCards){
  historyVisibleSelectionKeys=historyCards.filter(canSelectHistoryItem).map(getHistoryCardKey);
  historySelectedKeys=new Set([...historySelectedKeys].filter(key=>historyVisibleSelectionKeys.includes(key)));
  if(!historyBulkMode&&historySelectedKeys.size)historySelectedKeys=new Set();
}
function getSelectedHistoryItems(historyCards){return historyCards.filter(item=>historySelectedKeys.has(getHistoryCardKey(item)))}
function toggleHistoryBulkMode(){
  historyBulkMode=!historyBulkMode;
  if(!historyBulkMode)historySelectedKeys=new Set();
  render();
}
function toggleHistoryItemSelection(key,checked){
  if(checked)historySelectedKeys.add(key);
  else historySelectedKeys.delete(key);
  render();
}
function toggleHistorySelectAllVisible(){
  const allSelected=historyVisibleSelectionKeys.length&&historyVisibleSelectionKeys.every(key=>historySelectedKeys.has(key));
  if(allSelected)historyVisibleSelectionKeys.forEach(key=>historySelectedKeys.delete(key));
  else historyVisibleSelectionKeys.forEach(key=>historySelectedKeys.add(key));
  render();
}
function clearHistorySelection(){historySelectedKeys=new Set();render()}
function getHistoryCardByKey(key){
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  return historyCards.find(item=>getHistoryCardKey(item)===key)||null;
}
function removeHistoryItem(item){
  if(!item)return false;
  if(item.kind==='income'){
    const income=incomes.find(x=>x.id===item.id);
    if(!income)return false;
    if(income.isSalaryDeposit)clearSalaryReceiptForIncome(income);
    adjustAccountBalance(income.account,-Number(income.amount||0));
    incomes=incomes.filter(x=>x.id!==item.id);
    return true;
  }
  if(item.isDebtPayment||item.isDebtPaymentFee){
    const payment=debtPayments.find(p=>p.id===item.debtPaymentId);
    if(!payment)return false;
    const debt=debts.find(d=>d.id===payment.debtId);
    if(debt)debt.total=Number(debt.total||0)+Number(payment.amount||0);
    adjustAccountBalance(payment.account,getDebtPaymentTotalDeduction(payment));
    debtPayments=debtPayments.filter(p=>p.id!==payment.id);
    entries=entries.filter(e=>e.debtPaymentId!==payment.id);
    refreshDebtPaymentDerivedState(payment.debtId);
    return true;
  }
  if(item.isGoalContribution){
    const contribution=goalContributions.find(c=>c.id===item.goalContributionId);
    if(!contribution)return false;
    const goal=goals.find(g=>g.id===contribution.goalId);
    if(goal)goal.current=Math.max(0,Number(goal.current||0)-Number(contribution.amount||0));
    adjustAccountBalance(contribution.account,Number(contribution.amount||0));
    goalContributions=goalContributions.filter(c=>c.id!==contribution.id);
    entries=entries.filter(e=>e.goalContributionId!==contribution.id);
    return true;
  }
  const entry=entries.find(e=>e.id===item.id);
  if(!entry)return false;
  adjustAccountBalance(entry.account,Number(entry.amount||0));
  entries=entries.filter(e=>e.id!==entry.id);
  return true;
}
function deleteHistorySingle(key){
  const item=getHistoryCardByKey(key);
  if(!item)return;
  const label=getHistoryItemLabel(item);
  showConfirm(`Delete ${label} for ${fmt(item.amount||0)}?`,()=>{
    removeHistoryItem(item);
    saveData();
    render();
    showActionToast('Transaction deleted',`${label} · ${fmt(item.amount||0)}`,'🗑️');
  },'Delete',true);
}
function bulkDeleteHistorySelection(){
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  if(!selectedItems.length){showAlert('Select at least one transaction.');return;}
  showConfirm(`Delete ${selectedItems.length} selected transaction${selectedItems.length===1?'':'s'}?`,()=>{
    selectedItems.forEach(removeHistoryItem);
    historySelectedKeys=new Set();
    saveData();
    render();
    showActionToast('Selected transactions deleted',`${selectedItems.length} item${selectedItems.length===1?'':'s'} removed.`,'🗑️');
  },'Delete',true);
}
function exportHistoryItemsCSV(items,filename){
  if(!items.length){showAlert('No transactions selected.');return;}
  const expenseItems=items.filter(item=>item.kind==='expense');
  const incomeItems=items.filter(item=>item.kind==='income');
  const rows=[];
  if(expenseItems.length){
    rows.push(['--- EXPENSES ---']);
    rows.push(['Date','Category','Account','Amount','Note']);
    rows.push(...expenseItems.map(item=>[item.date,toCsvCell(item.category),toCsvCell(getAccountInfo(item.account).name),item.amount,toCsvCell(item.note||'')]));
  }
  if(incomeItems.length){
    rows.push(['--- INCOME ---']);
    rows.push(['Date','Source','Account','Amount','Note']);
    rows.push(...incomeItems.map(item=>[item.date,toCsvCell(item.source),toCsvCell(getAccountInfo(item.account).name),item.amount,toCsvCell(item.note||'')]));
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));
  a.download=filename;
  a.click();
}
function bulkExportHistorySelection(){
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  exportHistoryItemsCSV(selectedItems,`finance-selected-${todayStr}.csv`);
}
function applyHistoryItemCategoryChange(item,newCategory){
  if(!canChangeHistoryItemCategory(item)||!newCategory)return false;
  const entry=entries.find(e=>e.id===item.id);
  if(!entry)return false;
  entry.category=newCategory;
  return true;
}
function bulkUpdateHistoryCategory(){
  const category=document.getElementById('hist-bulk-category')?.value||'';
  if(!category){showAlert('Choose a category first.');return;}
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  const changed=selectedItems.filter(item=>applyHistoryItemCategoryChange(item,category)).length;
  if(!changed){showAlert('Select at least one regular expense to change category.');return;}
  saveData();
  render();
  showActionToast('Category updated',`${changed} expense${changed===1?'':'s'} moved to ${category}.`,'🏷️');
}
function getHistoryAccountDeltas(items,newAccount){
  const deltas={};
  items.forEach(item=>{
    if(!canChangeHistoryItemAccount(item)||item.account===newAccount)return;
    const payment=item.isDebtPayment?debtPayments.find(p=>p.id===item.debtPaymentId):null;
    const amount=item.isDebtPayment&&payment?getDebtPaymentTotalDeduction(payment):Number(item.amount||0);
    const oldAccount=item.account;
    if(item.kind==='income'){
      deltas[oldAccount]=(deltas[oldAccount]||0)-amount;
      deltas[newAccount]=(deltas[newAccount]||0)+amount;
    }else{
      deltas[oldAccount]=(deltas[oldAccount]||0)+amount;
      deltas[newAccount]=(deltas[newAccount]||0)-amount;
    }
  });
  return deltas;
}
function applyHistoryItemAccountChange(item,newAccount){
  if(!canChangeHistoryItemAccount(item)||item.account===newAccount||!newAccount)return false;
  const amount=Number(item.amount||0);
  const oldAccount=item.account;
  if(item.kind==='income'){
    adjustAccountBalance(oldAccount,-amount);
    adjustAccountBalance(newAccount,amount);
    const income=incomes.find(x=>x.id===item.id);
    if(income&&income.isSalaryDeposit)syncSalaryReceiptAccountForIncome(income,newAccount);
    if(income)income.account=newAccount;
    return true;
  }
  const payment=item.isDebtPayment?debtPayments.find(p=>p.id===item.debtPaymentId):null;
  const accountAmount=item.isDebtPayment&&payment?getDebtPaymentTotalDeduction(payment):amount;
  adjustAccountBalance(oldAccount,accountAmount);
  adjustAccountBalance(newAccount,-accountAmount);
  if(item.isDebtPayment){
    if(payment)payment.account=newAccount;
    entries.filter(e=>e.debtPaymentId===item.debtPaymentId).forEach(entry=>entry.account=newAccount);
    return true;
  }
  if(item.isGoalContribution){
    const contribution=goalContributions.find(c=>c.id===item.goalContributionId);
    if(contribution)contribution.account=newAccount;
    const entry=entries.find(e=>e.goalContributionId===item.goalContributionId);
    if(entry)entry.account=newAccount;
    return true;
  }
  const entry=entries.find(e=>e.id===item.id);
  if(entry)entry.account=newAccount;
  return true;
}
function bulkUpdateHistoryAccount(){
  const newAccount=document.getElementById('hist-bulk-account')?.value||'';
  if(!newAccount){showAlert('Choose an account first.');return;}
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  if(!selectedItems.length){showAlert('Select at least one transaction.');return;}
  const deltas=getHistoryAccountDeltas(selectedItems,newAccount);
  const insufficient=Object.entries(deltas).find(([account,delta])=>Number(nwBalances[account]||0)+delta<0);
  if(insufficient){showAlert(`Not enough balance in ${getAccountInfo(insufficient[0]).name} after this move.`);return;}
  const changed=selectedItems.filter(item=>applyHistoryItemAccountChange(item,newAccount)).length;
  if(!changed){showAlert('Selected transactions are already using that account.');return;}
  saveData();
  render();
  showActionToast('Account updated',`${changed} transaction${changed===1?'':'s'} moved to ${getAccountInfo(newAccount).name}.`,'🏦');
}
function renderHistoryBulkBar(historyCards){
  const wrap=document.getElementById('history-bulk');
  if(!wrap)return;
  if(!historyCards.length){wrap.innerHTML='';return;}
  syncHistorySelection(historyCards);
  const selectedItems=getSelectedHistoryItems(historyCards);
  const regularExpenseCount=selectedItems.filter(canChangeHistoryItemCategory).length;
  const accountEligibleCount=selectedItems.filter(canChangeHistoryItemAccount).length;
  const allVisibleSelected=historyVisibleSelectionKeys.length&&historyVisibleSelectionKeys.every(key=>historySelectedKeys.has(key));
  if(!historyBulkMode){
    wrap.innerHTML=`<div class="card history-bulk-card"><div class="history-bulk-row"><div><div class="history-bulk-title">Bulk actions</div><div class="history-bulk-sub">Select multiple history items to export, delete, or edit together.</div></div><button class="btn btn-ghost btn-sm" onclick="toggleHistoryBulkMode()">Select</button></div></div>`;
    return;
  }
  wrap.innerHTML=`<div class="card history-bulk-card"><div class="history-bulk-row"><div><div class="history-bulk-title">${selectedItems.length} selected</div><div class="history-bulk-sub">${historyCards.length} visible item${historyCards.length===1?'':'s'} in this filtered view.</div></div><button class="btn btn-ghost btn-sm" onclick="toggleHistoryBulkMode()">Done</button></div><div class="history-bulk-actions"><button class="btn btn-ghost btn-sm" onclick="toggleHistorySelectAllVisible()">${allVisibleSelected?'Clear Visible':'Select All Visible'}</button><button class="btn btn-ghost btn-sm" onclick="clearHistorySelection()">Clear</button><button class="btn btn-ghost btn-sm" onclick="bulkExportHistorySelection()">Export Selected</button><button class="btn btn-ghost btn-sm" onclick="bulkDeleteHistorySelection()">Delete Selected</button></div><div class="history-bulk-grid"><div class="input-group" style="margin:0"><label class="input-label">Change Category</label><select class="input" id="hist-bulk-category"><option value="">Choose category</option>${allCats().map(cat=>`<option value="${esc(cat.name)}">${cat.icon||''} ${esc(cat.name)}</option>`).join('')}</select><div class="history-bulk-help">${regularExpenseCount} regular expense${regularExpenseCount===1?'':'s'} eligible</div></div><button class="btn btn-ghost btn-sm history-bulk-apply" onclick="bulkUpdateHistoryCategory()">Apply Category</button><div class="input-group" style="margin:0"><label class="input-label">Move Account</label><select class="input" id="hist-bulk-account"><option value="">Choose account</option>${nwAccounts.map(acc=>`<option value="${acc.key}">${acc.icon} ${esc(acc.name)}</option>`).join('')}</select><div class="history-bulk-help">${accountEligibleCount} item${accountEligibleCount===1?'':'s'} eligible</div></div><button class="btn btn-ghost btn-sm history-bulk-apply" onclick="bulkUpdateHistoryAccount()">Apply Account</button></div></div>`;
}
function renderHistoryCard(item){
  const key=getHistoryCardKey(item);
  const iconInfo=getHistoryItemIcon(item);
  const selected=historySelectedKeys.has(key);
  const clickAction=getHistoryItemOpenAction(item);
  const selectionMarkup=historyBulkMode&&canSelectHistoryItem(item)?`<label class="history-select-box" onclick="event.stopPropagation()"><input type="checkbox" ${selected?'checked':''} onchange="toggleHistoryItemSelection('${key}',this.checked)"></label>`:'';
  const deleteMarkup=historyBulkMode||item.isDebtPaymentFee?'':`<button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteHistorySingle('${key}')" style="border:none;color:var(--red);font-size:12px">✕</button>`;
  return`<div class="tx-item history-tx-item ${historyBulkMode?'history-tx-item-selectable':''} ${selected?'history-tx-item-selected':''}" ${clickAction?`onclick="${clickAction}"`:''}>${selectionMarkup}<div class="tx-icon ${iconInfo.className}">${iconInfo.icon}</div><div class="tx-info"><div class="tx-name">${esc(getHistoryItemLabel(item))}</div><div class="tx-meta">${esc(getHistoryItemMeta(item))}</div></div><div class="tx-amount" style="color:${item.kind==='income'?'var(--green)':'var(--red)'}">${item.kind==='income'?'+':'-'}${fmt(item.amount)}</div>${deleteMarkup}</div>`;
}
function renderHistoryLoadMore(totalCount,visibleCount){
  if(totalCount<=visibleCount)return'';
  const remaining=totalCount-visibleCount;
  const nextLoad=Math.min(getHistoryVisibleLimit(),remaining);
  return `<button class="show-more-btn" type="button" onclick="loadMoreHistory()">Load more ${nextLoad} transaction${nextLoad===1?'':'s'} (${remaining} remaining)</button>`;
}
function renderHistoryCardsContent(historyCards,groupMode,totalCount=historyCards.length){
  if(!historyCards.length)return'<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions match</div></div>';
  const content=groupMode==='none'
    ?`<div class="tx-list">${historyCards.map(renderHistoryCard).join('')}</div>`
    :buildHistoryGroups(historyCards,groupMode).map(group=>`<div class="history-group"><div class="history-group-head"><div class="history-group-title">${esc(group.label)}</div><div class="history-group-meta">${group.items.length} item${group.items.length===1?'':'s'} · -${fmtShort(group.expenseTotal)} / +${fmtShort(group.incomeTotal)}</div></div><div class="tx-list">${group.items.map(renderHistoryCard).join('')}</div></div>`).join('');
  return `${content}${renderHistoryLoadMore(totalCount,historyCards.length)}`;
}
function resetHistoryFilters(){
  ['hist-search','hist-min','hist-max','hist-day','hist-week','hist-from','hist-to'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  const typeEl=document.getElementById('hist-type');if(typeEl)typeEl.value='all';
  const sortEl=document.getElementById('hist-sort');if(sortEl)sortEl.value='newest';
  const accountEl=document.getElementById('hist-account');if(accountEl)accountEl.value='all';
  const monthEl=document.getElementById('hist-month');if(monthEl)monthEl.value=filterMonth;
  const groupEl=document.getElementById('hist-group');if(groupEl)groupEl.value='none';
  const presetEl=document.getElementById('hist-preset-name');if(presetEl)presetEl.value='';
  setHistoryQuickPreset('thisMonth');
  setHistorySelectedCategories(allCats().map(c=>c.name));
  historyBulkMode=false;
  historySelectedKeys=new Set();
  historyActivePresetId=null;
  historyVisibleCount=getHistoryVisibleLimit();
  historyLastViewKey='';
  render();
}
function toCsvCell(value){return `"${String(value??'').replace(/"/g,'""')}"`}
function exportCSV(){
  const hs=getHistoryState();
  let{expenseData,incomeData}=filterHistoryCollections(hs);
  if(hs.type==='expense')incomeData=[];
  if(hs.type==='income')expenseData=[];
  if(!expenseData.length&&!incomeData.length){showAlert('No data.');return;}
  const rows=[];
  if(expenseData.length){
    rows.push(['--- EXPENSES ---']);
    rows.push(['Date','Category','Account','Amount','Note']);
    rows.push(...expenseData.map(item=>[item.date,toCsvCell(item.category),toCsvCell(getAccountInfo(item.account).name),item.amount,toCsvCell(item.note||'')]));
  }
  if(incomeData.length){
    rows.push(['--- INCOME ---']);
    rows.push(['Date','Source','Account','Amount','Note']);
    rows.push(...incomeData.map(item=>[item.date,toCsvCell(item.source),toCsvCell(getAccountInfo(item.account).name),item.amount,toCsvCell(item.note||'')]));
  }
  const periodKey=hs.from||hs.to?(hs.from||'start')+'_'+(hs.to||'end'):hs.day||hs.week||hs.month||'all';
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));
  a.download=`finance-${periodKey}.csv`;
  a.click();
}
function backupData(){const data=localStorage.getItem('ft_all');if(!data){showAlert('No data.');return;}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=`finance-backup-${todayStr}.json`;a.click();document.getElementById('backup-msg').textContent='✅ Backup downloaded!'}
function isBackupPayloadValid(data){if(!data||typeof data!=='object'||Array.isArray(data))return false;const knownKeys=['salary','budgets','entries','customCats','incomes','goals','nwBalances','nwHistory','debts','wishlist','journal','recurring','nwAccounts','transfers','paySchedule','alertSettings','budgetStrategy','debtPayments','goalContributions','historySavedPresets','addFlowState'];if(!knownKeys.some(key=>key in data))return false;const arrayKeys=['entries','customCats','incomes','goals','nwHistory','debts','wishlist','journal','recurring','nwAccounts','transfers','debtPayments','goalContributions','historySavedPresets'];if(arrayKeys.some(key=>key in data&&!Array.isArray(data[key])))return false;const objectKeys=['budgets','nwBalances','paySchedule','alertSettings','budgetStrategy','addFlowState'];if(objectKeys.some(key=>key in data&&(!data[key]||typeof data[key]!=='object'||Array.isArray(data[key]))))return false;return true}
function restoreData(evt){const file=evt.target.files[0];if(!file)return;const input=evt.target;const msg=document.getElementById('backup-msg');const r=new FileReader();r.onload=function(e){try{const raw=e.target.result;const d=JSON.parse(raw);if(!isBackupPayloadValid(d)){if(msg)msg.textContent='Invalid backup file.';input.value='';showAlert('Invalid backup file.');return;}showConfirm('Restore this backup? Your current local data will be replaced.',()=>{localStorage.setItem('ft_all',JSON.stringify(d));if(msg)msg.textContent='Backup restored. Reloading...';location.reload();});input.value='';}catch(err){if(msg)msg.textContent='Could not restore backup.';input.value='';showAlert('Could not restore this backup file.');}};r.readAsText(file)}

function getPaydayInfo(){const d=now.getDate();const days=[...(paySchedule?.days||[5,20])].map(x=>parseInt(x)).filter(x=>x>=1&&x<=31).sort((a,b)=>a-b);if(!days.length)return{daysUntil:0,nextDate:now,periodLabel:'No paydays set'};let next=null;for(const day of days){if(d<=day){next=new Date(now.getFullYear(),now.getMonth(),day);break}}if(!next)next=new Date(now.getFullYear(),now.getMonth()+1,days[0]);let periodLabel='';if(paySchedule?.mode==='monthly')periodLabel=`Every month on the ${days[0]}${days[0]===1?'st':days[0]===2?'nd':days[0]===3?'rd':'th'}`;else periodLabel=days.map(day=>`${day}${day===1?'st':day===2?'nd':day===3?'rd':'th'}`).join(' & ');return{daysUntil:Math.ceil((next-now)/864e5),nextDate:next,periodLabel}}

let activeSalaryReceiptKey='';
function getSalaryReceiptKey(monthKey,day){return `${monthKey}-${parseInt(day)}`}
function formatOrdinalDay(day){const n=parseInt(day)||0;const mod100=n%100;if(mod100>=11&&mod100<=13)return`${n}th`;const mod10=n%10;return`${n}${mod10===1?'st':mod10===2?'nd':mod10===3?'rd':'th'}`}
function getSalaryReceiptRecord(key){return key&&paySchedule?.received?paySchedule.received[key]||null:null}
function findSalaryReceiptKeyForIncome(income){if(!income?.isSalaryDeposit)return'';if(income.salaryReceiptKey)return income.salaryReceiptKey;normalizePaySchedule();const incomeMonth=(income.date||'').slice(0,7);const monthEntries=Object.entries(paySchedule.received||{}).filter(([key,record])=>record&&key.startsWith(`${incomeMonth}-`));const exactMatches=monthEntries.filter(([,record])=>Number(record.amount??0)===Number(income.amount||0)&&(record.account||'')===(income.account||'')&&(record.note||'')===(income.note||'')&&(!record.date||record.date===income.date));if(exactMatches.length===1)return exactMatches[0][0];const relaxedMatches=monthEntries.filter(([,record])=>Number(record.amount??0)===Number(income.amount||0)&&(record.note||'')===(income.note||'')&&(!record.date||record.date===income.date));if(relaxedMatches.length===1)return relaxedMatches[0][0];const noteDayMatch=(income.note||'').match(/day\s+(\d{1,2})/i);if(noteDayMatch&&incomeMonth)return getSalaryReceiptKey(incomeMonth,noteDayMatch[1]);return''}
function hasOtherSalaryIncomeForKey(key,excludeIncomeId=null){if(!key)return false;return incomes.some(income=>income.id!==excludeIncomeId&&income.isSalaryDeposit&&findSalaryReceiptKeyForIncome(income)===key)}
function syncSalaryReceiptAccountForIncome(income,newAccount){const key=findSalaryReceiptKeyForIncome(income);if(!key)return false;income.salaryReceiptKey=key;if(paySchedule?.received?.[key])paySchedule.received[key].account=newAccount;return true}
function clearSalaryReceiptForIncome(income){const key=findSalaryReceiptKeyForIncome(income);if(!key)return false;income.salaryReceiptKey=key;if(hasOtherSalaryIncomeForKey(key,income.id))return false;if(paySchedule?.received?.[key])delete paySchedule.received[key];if(activeSalaryReceiptKey===key)activeSalaryReceiptKey='';return true}
function getPendingSalarySplits(){normalizePaySchedule();const monthKey=currentMonthKey();const todayDay=now.getDate();const received=paySchedule.received||{};return (paySchedule.splits||[]).filter(split=>split.day<=todayDay&&!received[getSalaryReceiptKey(monthKey,split.day)]).sort((a,b)=>a.day-b.day)}
function openSalaryReceiptModal(day){normalizePaySchedule();const monthKey=currentMonthKey();const split=(paySchedule.splits||[]).find(s=>parseInt(s.day)===parseInt(day));if(!split)return;activeSalaryReceiptKey=getSalaryReceiptKey(monthKey,split.day);document.getElementById('salary-receive-subtext').textContent=`Confirm your salary deposit for day ${split.day}.`;document.getElementById('sr-amount').value=split.amount||'';document.getElementById('sr-date').value=todayStr;buildAccountSelect('sr-account',false);document.getElementById('sr-account').value=split.account||getDefaultAccountKey();document.getElementById('sr-note').value='';openModal('modal-salary-receive')}
function saveSalaryReceipt(){normalizePaySchedule();const amount=parseFloat(document.getElementById('sr-amount').value)||0;const date=document.getElementById('sr-date').value||todayStr;const account=document.getElementById('sr-account').value||getDefaultAccountKey();const note=(document.getElementById('sr-note').value||'').trim();if(amount<=0){showAlert('Enter a valid salary amount.');return;}const split=(paySchedule.splits||[]).find(s=>getSalaryReceiptKey(currentMonthKey(),s.day)===activeSalaryReceiptKey);if(!split){showAlert('Salary schedule not found.');return;}const incomeNote=note||`Scheduled salary · day ${split.day}`;incomes.unshift(stampRecord({id:nextIncId++,date,source:'Salary',amount,note:incomeNote,account,isSalaryDeposit:true}));adjustAccountBalance(account,amount);paySchedule.received=paySchedule.received||{};paySchedule.received[activeSalaryReceiptKey]={amount,date,account,note:incomeNote,createdAt:new Date().toISOString()};closeModal('modal-salary-receive');saveData();render();showActionToast(`${fmt(amount)} salary received`,`${getAccountInfo(account).name}`,'💼');showTab('dashboard')}
function renderSalaryPromptCard(){const wrap=document.getElementById('salary-prompt-card');if(!wrap)return;const pending=getPendingSalarySplits();if(!pending.length){wrap.innerHTML='';return}const nextSplit=pending[0];const accountInfo=getAccountInfo(nextSplit.account);wrap.innerHTML=`<div class="card"><div class="card-header"><div><div class="card-title">Receive Salary</div><div class="card-subtitle">Payday for the ${nextSplit.day}${nextSplit.day===1?'st':nextSplit.day===2?'nd':nextSplit.day===3?'rd':'th'} is ready to confirm</div></div><span class="card-badge" style="background:var(--green-soft);color:var(--green)">${fmt(nextSplit.amount)}</span></div><div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:12px">Default account: <strong>${esc(accountInfo.name)}</strong>. You can change it before saving.</div><button class="btn btn-primary" onclick="openSalaryReceiptModal(${nextSplit.day})">💵 Receive Salary</button></div>`}


function makeDonutSVG(data,size){const total=data.reduce((s,d)=>s+d.value,0);if(total===0)return'';let cum=0;const r=size/2-6,ir=r*0.62,cx=size/2,cy=size/2;const paths=data.map(d=>{const pct=d.value/total;const s=cum*2*Math.PI-Math.PI/2;cum+=pct;const e=cum*2*Math.PI-Math.PI/2;const lg=pct>0.5?1:0;return`<path d="M${cx+r*Math.cos(s)},${cy+r*Math.sin(s)} A${r},${r} 0 ${lg} 1 ${cx+r*Math.cos(e)},${cy+r*Math.sin(e)} L${cx+ir*Math.cos(e)},${cy+ir*Math.sin(e)} A${ir},${ir} 0 ${lg} 0 ${cx+ir*Math.cos(s)},${cy+ir*Math.sin(s)}Z" fill="${d.color}" opacity="0.9"/>`}).join('');return`<svg viewBox="0 0 ${size} ${size}" class="donut-svg">${paths}<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="800">${fmtShort(total)}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" fill="var(--text3)" font-size="9" font-weight="500">Total Spent</text></svg>`}

function calcHealthScore(){
  const ac=allCats();
  const needsB=ac.filter(c=>c.group==='needs').reduce((s,c)=>s+(budgets[c.name]||0),0);
  const wantsB=ac.filter(c=>c.group==='wants').reduce((s,c)=>s+(budgets[c.name]||0),0);
  const monthlyExp=needsB+wantsB;
  const me=entries.filter(e=>e.date.startsWith(filterMonth)&&!e.isDebtPayment&&!e.isGoalContribution&&e.category!=='Transfer Fees');
  const allMe=entries.filter(e=>e.date.startsWith(filterMonth));
  const totalDebt=debts.reduce((s,d)=>s+d.total,0);
  const monthlyDebtPayments=debts.reduce((s,d)=>s+Number(d.payment||0),0);
  const activeDebts=debts.filter(d=>d.total>0);
  const efGoal=goals.find(g=>g.name.toLowerCase().includes('emergency'));
  const efCur=efGoal?efGoal.current:0;
  const factors=[];

  // 1. Savings Rate (15 pts) — savings entries + goal contributions vs salary
  const savingsEntries=me.filter(e=>{const cat=ac.find(c=>c.name===e.category);return cat&&cat.group==='savings';}).reduce((s,e)=>s+e.amount,0);
  const goalContribAmt=allMe.filter(e=>e.isGoalContribution).reduce((s,e)=>s+e.amount,0);
  const actualSavings=savingsEntries+goalContribAmt;
  const sr=salary>0?actualSavings/salary:0;
  const srPct=Math.round(sr*100);
  const savScore=Math.min(15,Math.max(0,sr>=0.25?15:sr>=0.20?Math.round(12+(sr-0.20)/0.05*3):sr>=0.15?Math.round(10+(sr-0.15)/0.05*2):sr>=0.10?Math.round(7+(sr-0.10)/0.05*3):sr>=0.05?Math.round(3+(sr-0.05)/0.05*4):Math.round(sr/0.05*3)));
  factors.push({name:'Savings Rate',icon:'💰',score:savScore,max:15,
    why:'What % of your salary you\'re setting aside each month — through savings categories or goal contributions. Aim for 20%+ for long-term security.',
    detail:salary>0?`Saving ${srPct}% of income · ${fmt(actualSavings)} this month`:'Set your salary in Settings to calculate',
    tone:savScore>=13?'Excellent':savScore>=9?'Good':savScore>=5?'Building':savScore>=2?'Low':'None',
    color:savScore>=12?'var(--green)':savScore>=8?'var(--blue)':savScore>=4?'var(--amber)':'var(--red)',
    insight:savScore>=12?'Great savings habit — keep it consistent.':salary>0?`At ${srPct}%, try to reach ${srPct<10?'10':'20'}%. ${fmt(Math.max(salary*0.20-actualSavings,0))} more would hit 20%.`:'Add your salary in Settings so this factor scores correctly.'});

  // 2. Budget Discipline (15 pts) — how well spending stayed within limits
  const budgetedCats=ac.filter(c=>Number(budgets[c.name]||0)>0);
  let totalBW=0,penaltyBW=0;
  budgetedCats.forEach(c=>{const spent=me.filter(e=>e.category===c.name).reduce((s,e)=>s+e.amount,0);const budget=Number(budgets[c.name]||0);totalBW+=budget;if(spent>budget)penaltyBW+=Math.min(spent-budget,budget*2);});
  const adherence=totalBW>0?Math.max(0,1-penaltyBW/totalBW):1;
  const bdScore=Math.round(adherence*15);
  const overCats=budgetedCats.filter(c=>{const sp=me.filter(e=>e.category===c.name).reduce((s,e)=>s+e.amount,0);return sp>Number(budgets[c.name]||0)}).length;
  factors.push({name:'Budget Discipline',icon:'📊',score:bdScore,max:15,
    why:'How well your spending stayed within each category\'s budget limit. Overruns silently drain your savings and can push you into debt.',
    detail:budgetedCats.length===0?'No budget limits set yet':overCats===0?`All ${budgetedCats.length} categories within budget`:`${overCats} of ${budgetedCats.length} budgeted categories over limit`,
    tone:bdScore>=14?'Excellent':bdScore>=10?'Mostly ok':bdScore>=6?'Some overruns':bdScore>=2?'Over budget':'No budgets',
    color:bdScore>=12?'var(--green)':bdScore>=9?'var(--blue)':bdScore>=5?'var(--amber)':'var(--red)',
    insight:overCats===0&&budgetedCats.length>0?'All categories within budget — excellent discipline.':budgetedCats.length===0?'Set budget limits on your categories to score this factor.':overCats===1?'One category over. Review it to stay on track.':overCats<=3?`${overCats} categories exceeded their limits. Adjust spending or increase budgets.`:`${overCats} overruns this month — consider a budget rebalance.`});

  // 3. Budget Coverage (10 pts) — what % of spending has a budget assigned
  const totalSpentMe=me.reduce((s,e)=>s+e.amount,0);
  const spentInBudgetedCats=me.filter(e=>Number(budgets[e.category]||0)>0).reduce((s,e)=>s+e.amount,0);
  const covPct=totalSpentMe>0?spentInBudgetedCats/totalSpentMe:1;
  const bcScore=totalSpentMe===0?8:Math.min(10,Math.round(covPct*10));
  const unbudgetedAmt=Math.max(totalSpentMe-spentInBudgetedCats,0);
  factors.push({name:'Budget Coverage',icon:'🗂️',score:bcScore,max:10,
    why:'How much of your spending falls under a budget you\'ve set. Money spent in unbudgeted categories are blind spots — you can\'t plan what you don\'t track.',
    detail:totalSpentMe===0?'No expenses logged yet':`${Math.round(covPct*100)}% of spending is budgeted${unbudgetedAmt>0?' · '+fmt(unbudgetedAmt)+' untracked':''}`,
    tone:bcScore>=9?'Fully planned':bcScore>=7?'Mostly tracked':bcScore>=5?'Gaps exist':'Needs work',
    color:bcScore>=8?'var(--green)':bcScore>=6?'var(--blue)':bcScore>=4?'var(--amber)':'var(--red)',
    insight:bcScore>=9?'All spending has a budget — excellent planning.':unbudgetedAmt>0?`${fmt(unbudgetedAmt)} spent in categories with no budget. Set limits on those categories to track and control them.`:'Log expenses and assign budget limits to improve this score.'});

  // 4. Emergency Fund (15 pts) — months of expenses covered, target 6
  let efScore=0;
  if(monthlyExp>0){const mos=efCur/monthlyExp;efScore=mos>=6?15:mos>=3?Math.round(11+(mos-3)/3*4):mos>=1?Math.round(6+(mos-1)/2*5):mos>=0.5?Math.round(3+(mos-0.5)/0.5*3):Math.round(mos/0.5*3);}else if(efCur>0)efScore=8;
  efScore=Math.min(15,Math.max(0,efScore));
  const mosCov=monthlyExp>0?efCur/monthlyExp:0;
  factors.push({name:'Emergency Fund',icon:'🛡️',score:efScore,max:15,
    why:'Your financial safety net — how many months of expenses you could cover if income suddenly stopped. The standard target is 6 months; 3 months is the minimum.',
    detail:monthlyExp>0?`${mosCov.toFixed(1)} of 6 months covered · ${fmt(efCur)} saved`:efCur>0?`${fmt(efCur)} saved · Set category groups to calculate months`:'No emergency fund goal found — create one in Goals',
    tone:mosCov>=6?'Fully covered':mosCov>=3?'At baseline':mosCov>=1?'Growing':mosCov>0?'Just starting':'Not started',
    color:efScore>=12?'var(--green)':efScore>=8?'var(--blue)':efScore>=4?'var(--amber)':'var(--red)',
    insight:efScore>=15?'Fully funded emergency cushion — excellent.':efScore>=11?`${fmt(Math.max(monthlyExp*6-efCur,0))} more to reach 6 months.`:efScore>=6?`3 months is the minimum baseline — ${fmt(Math.max(monthlyExp*3-efCur,0))} to go.`:'Create a goal with "emergency" in the name to start tracking your fund here.'});

  // 5. Debt Load (10 pts) — monthly debt payments vs salary (DTI ratio)
  const dti=salary>0?monthlyDebtPayments/salary:monthlyDebtPayments>0?1:0;
  const dhScore=Math.min(10,Math.max(0,totalDebt===0?10:dti<0.10?Math.round(8+(0.10-dti)/0.10*2):dti<0.20?Math.round(6+(0.20-dti)/0.10*2):dti<0.36?Math.round(3+(0.36-dti)/0.16*3):dti<0.43?Math.round(1+(0.43-dti)/0.07):0));
  factors.push({name:'Debt Load',icon:'⚖️',score:dhScore,max:10,
    why:'What percentage of your monthly income goes to debt payments (Debt-to-Income ratio). Above 36% is a financial danger zone — less income left for living and saving.',
    detail:totalDebt===0?'No active debts — completely debt-free':dti>0?`${Math.round(dti*100)}% of income goes to debt payments · ${fmtShort(totalDebt)} total owed`:fmtShort(totalDebt)+' total owed · no planned payments set',
    tone:totalDebt===0?'Debt-free':dti<0.10?'Very low':dti<0.20?'Manageable':dti<0.36?'High':'Debt-heavy',
    color:dhScore>=8?'var(--green)':dhScore>=5?'var(--blue)':dhScore>=3?'var(--amber)':'var(--red)',
    insight:totalDebt===0?'No debt — all income is yours to keep.':dti<0.20?'Debt payments are manageable relative to income.':dti<0.36?`${Math.round(dti*100)}% DTI is high — look to pay down balances to free up income.`:'Debt consumes too much income. Focus aggressively on payoff to reduce this ratio.'});

  // 6. Debt Trajectory (10 pts) — are you actively paying debts this month?
  const paidThisMonth=activeDebts.filter(d=>d.lastPaidMonth===currentMonthKey()).length;
  let dtScore=10,dtDetail='',dtTone='',dtInsight='';
  if(activeDebts.length===0){dtScore=10;dtDetail='No active debts to service';dtTone='Debt-free';dtInsight='Stay debt-free to keep this score high.';}
  else{const paidPctD=paidThisMonth/activeDebts.length;dtScore=Math.round(paidPctD*10);dtDetail=`${paidThisMonth} of ${activeDebts.length} active debts paid this month`;dtTone=paidPctD>=1?'All paid':paidPctD>=0.75?'On track':paidPctD>=0.50?'Partial':'Falling behind';dtInsight=paidPctD>=1?'All debts serviced this month — balances are shrinking.':paidPctD>0?`${activeDebts.length-paidThisMonth} debt${activeDebts.length-paidThisMonth!==1?'s':''} without a logged payment this month. Log them to confirm progress.`:'No debt payments logged this month. Missed payments add interest and stall payoff progress.';}
  factors.push({name:'Debt Trajectory',icon:'📉',score:dtScore,max:10,
    why:'Whether you\'re actively making payments on each debt this month. Consistent payments shrink balances, reduce interest, and improve your debt-free timeline.',
    detail:dtDetail,tone:dtTone,color:dtScore>=8?'var(--green)':dtScore>=6?'var(--blue)':dtScore>=4?'var(--amber)':'var(--red)',insight:dtInsight});

  // 7. Income Sufficiency (10 pts) — do expenses + debt fit within salary?
  const totalExpenses=me.reduce((s,e)=>s+e.amount,0);
  const debtPayLogged=allMe.filter(e=>e.isDebtPayment).reduce((s,e)=>s+e.amount,0);
  const totalOutflow=totalExpenses+debtPayLogged;
  const spendRatio=salary>0?totalOutflow/salary:totalOutflow>0?2:0;
  const cashLeftIS=salary-totalOutflow;
  const isScore=salary===0?5:spendRatio<=0.65?10:spendRatio<=0.80?8:spendRatio<=0.90?6:spendRatio<=1.00?4:spendRatio<=1.10?2:0;
  factors.push({name:'Income Sufficiency',icon:'💵',score:isScore,max:10,
    why:'Whether your total expenses and debt payments this month stay within your salary. If spending exceeds income, you\'re going backwards — building debt or draining savings.',
    detail:salary===0?'Set your salary in Settings to measure this':cashLeftIS>=0?`${fmt(cashLeftIS)} of salary left after expenses & debt (${Math.round(spendRatio*100)}% used)`:`${fmt(Math.abs(cashLeftIS))} over salary — expenses & debt exceed income`,
    tone:isScore>=9?'Comfortable':isScore>=7?'On track':isScore>=5?'Tight':isScore>=3?'Maxed out':'Over income',
    color:isScore>=8?'var(--green)':isScore>=5?'var(--blue)':isScore>=3?'var(--amber)':'var(--red)',
    insight:isScore>=8?'Healthy headroom — spending is well within your salary.':isScore>=5?'Getting close to your salary limit. Monitor spending closely.':salary>0?'Expenses and debt exceed salary this month. Review large expenses or reduce discretionary spending.':'Set your salary in Settings so this factor measures correctly.'});

  // 8. Goal Progress (10 pts) — actively contributing to financial goals
  const activeGoals=goals.filter(g=>!g.completed);
  const goalContribThisMonth=allMe.filter(e=>e.isGoalContribution).reduce((s,e)=>s+e.amount,0);
  let gpScore=6,gpDetail='',gpTone='',gpInsight='';
  if(activeGoals.length===0){gpScore=6;gpDetail='No active goals set';gpTone='No goals';gpInsight='Create financial goals — house fund, vacation, emergency fund — to track purpose-driven saving.';}
  else if(goalContribThisMonth>0){gpScore=Math.min(10,8+Math.round(goalContribThisMonth/(salary||goalContribThisMonth)*4));gpDetail=`${fmt(goalContribThisMonth)} contributed to goals this month · ${activeGoals.length} active goal${activeGoals.length!==1?'s':''}`;gpTone='Active';gpInsight='Contributing to goals this month — building intentional wealth.';}
  else{gpScore=2;gpDetail=`${activeGoals.length} active goal${activeGoals.length!==1?'s':''} — no contributions logged this month`;gpTone='No activity';gpInsight='Log a goal contribution this month to move your goals forward and boost this score.';}
  factors.push({name:'Goal Progress',icon:'🎯',score:gpScore,max:10,
    why:'Whether you\'re actively funding your financial goals this month — house down payment, vacation fund, investment top-up, etc. Regular contributions build intentional wealth over time.',
    detail:gpDetail,tone:gpTone,color:gpScore>=8?'var(--green)':gpScore>=6?'var(--blue)':gpScore>=4?'var(--amber)':'var(--red)',insight:gpInsight});

  // 9. Net Worth Trend (5 pts) — is total wealth growing vs last snapshot?
  let nwtScore=3,nwtDetail='Not enough snapshots yet',nwtTone='No data',nwtInsight='Save your account balances regularly to start tracking net worth growth.';
  if(nwHistory&&nwHistory.length>=2){
    const sorted=[...nwHistory].sort((a,b)=>(a.month||'').localeCompare(b.month||''));
    const lat=sorted[sorted.length-1];const prv=sorted[sorted.length-2];
    const latNW=lat.net!==undefined?lat.net:lat.total||0;
    const prvNW=prv.net!==undefined?prv.net:prv.total||0;
    const change=latNW-prvNW;
    const changePct=prvNW!==0?change/Math.abs(prvNW):0;
    nwtScore=changePct>=0.05?5:changePct>=0.01?4:changePct>=-0.01?3:changePct>=-0.05?2:1;
    nwtTone=nwtScore>=4?'Growing':nwtScore>=3?'Stable':nwtScore>=2?'Declining':'Falling';
    nwtDetail=change>=0?`+${fmtShort(change)} vs last snapshot · ${fmtShort(latNW)} net worth`:`${fmtShort(change)} vs last snapshot · ${fmtShort(latNW)} net worth`;
    nwtInsight=nwtScore>=4?'Net worth is on the rise — great trajectory.':nwtScore>=3?'Stable — aim for consistent upward movement.':nwtScore>=2?'Net worth dipped. Review large expenses or rising debts.':'Net worth is falling. Prioritize reducing debt or cutting expenses.';
  }
  factors.push({name:'Net Worth Trend',icon:'📈',score:nwtScore,max:5,
    why:'Is your total wealth (assets minus debts) growing month to month? Consistent upward trend means you\'re building real long-term financial strength.',
    detail:nwtDetail,tone:nwtTone,color:nwtScore>=4?'var(--green)':nwtScore>=3?'var(--blue)':nwtScore>=2?'var(--amber)':'var(--red)',insight:nwtInsight});

  const total=factors.reduce((s,f)=>s+f.score,0);
  let grade,color;
  if(total>=90){grade='Excellent';color='var(--green)'}
  else if(total>=75){grade='Great';color='var(--blue)'}
  else if(total>=60){grade='Good';color='var(--amber)'}
  else if(total>=40){grade='Fair';color='#f97316'}
  else{grade='Needs Work';color='var(--red)'}
  const tips=factors.filter(f=>f.score/f.max<0.6).sort((a,b)=>(a.score/a.max)-(b.score/b.max)).slice(0,3);
  return{total,grade,color,factors,tips};
}

function toggleFHBody(){
  const body=document.getElementById('fh-body');
  const toggle=document.getElementById('fh-toggle');
  if(!body||!toggle)return;
  const isOpen=body.classList.toggle('open');
  toggle.classList.toggle('open',isOpen);
  const chevron=toggle.querySelector('.fh-toggle-chevron');
  if(chevron)chevron.textContent=isOpen?'▴':'▾';
}
function buildHealthScoreHTML(hs){
  const circ=2*Math.PI*54;
  const offset=circ-(hs.total/100)*circ;
  const needAttention=hs.factors.filter(f=>f.score/f.max<0.6).length;
  const attentionColor=needAttention===0?'var(--green)':needAttention<=2?'var(--amber)':'var(--red)';
  const toggleLabel=needAttention===0
    ?`<span class="fh-toggle-dot" style="background:var(--green)"></span>${hs.factors.length} factors · <span style="color:var(--green)">All on track</span>`
    :`<span class="fh-toggle-dot" style="background:${attentionColor}"></span>${hs.factors.length} factors · <span style="color:${attentionColor}">${needAttention} need attention</span>`;
  const factorHTML=hs.factors.map(f=>{
    const pct=Math.round((f.score/f.max)*100);
    const tone=pct>=80?'good':pct>=50?'mid':'low';
    const toneClass=`fh-tone-${tone}`;
    return `<div class="fh-factor fh-factor-${tone}"><div class="fh-factor-top"><div class="fh-factor-left"><span class="fh-factor-icon">${f.icon}</span><div class="fh-factor-label-col"><div class="fh-factor-name">${f.name}</div><div class="fh-factor-why">${f.why}</div></div></div><div class="fh-factor-right"><div class="fh-factor-pts" style="color:${f.color}">${f.score}<span class="fh-factor-max">/${f.max}</span></div><div class="fh-tone-badge ${toneClass}">${f.tone}</div></div></div><div class="fh-factor-track"><div class="fh-factor-fill" style="width:${pct}%;background:${f.color}"></div></div><div class="fh-factor-status-row"><span class="fh-factor-detail">${f.detail}</span></div>${tone!=='good'?`<div class="fh-factor-tip">💡 ${f.insight}</div>`:''}</div>`;
  }).join('');
  const tipsHTML=hs.tips.length
    ?`<div class="fh-tips"><div class="fh-tips-header">Top improvements</div>${hs.tips.map(t=>`<div class="fh-tip-card"><span class="fh-tip-icon">${t.icon}</span><div class="fh-tip-body"><div class="fh-tip-name">${t.name}</div><div class="fh-tip-insight">${t.insight}</div></div><div class="fh-tip-score" style="color:${t.color}">${t.score}/${t.max}</div></div>`).join('')}</div>`
    :`<div class="fh-perfect"><span>✅</span><div><strong>Strong across the board</strong><div class="fh-perfect-sub">All areas performing well. Keep it up.</div></div></div>`;
  return `<div class="fh-wrap"><div class="fh-header"><svg width="100" height="100" viewBox="0 0 130 130"><defs><linearGradient id="fh-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${hs.color}"/><stop offset="100%" stop-color="${hs.color}" stop-opacity="0.5"/></linearGradient></defs><circle cx="65" cy="65" r="54" class="score-bg" style="stroke-width:11"/><circle cx="65" cy="65" r="54" fill="none" stroke="url(#fh-grad)" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" class="score-fill" style="stroke-width:11"/><text x="65" y="60" text-anchor="middle" style="fill:var(--text)" font-size="34" font-weight="800">${hs.total}</text><text x="65" y="78" text-anchor="middle" style="fill:var(--text3)" font-size="11">out of 100</text></svg><div class="fh-header-grade" style="color:${hs.color}">${hs.grade}</div><div class="fh-header-sub">Financial Health Score</div></div><div class="fh-scale"><div class="fh-scale-bar"><div class="fh-scale-seg" style="flex:40;background:var(--red)"></div><div class="fh-scale-seg" style="flex:20;background:#f97316"></div><div class="fh-scale-seg" style="flex:15;background:var(--amber)"></div><div class="fh-scale-seg" style="flex:15;background:var(--blue)"></div><div class="fh-scale-seg" style="flex:10;background:var(--green)"></div><div class="fh-scale-thumb" style="left:calc(${hs.total}% - 6px)"></div></div><div class="fh-scale-labels"><span>Needs Work</span><span>Fair</span><span>Good</span><span>Great</span><span>Excellent</span></div></div><div class="fh-toggle" id="fh-toggle" onclick="toggleFHBody()"><div class="fh-toggle-label">${toggleLabel}</div><span class="fh-toggle-chevron">▾</span></div><div class="fh-body" id="fh-body"><div class="fh-factors">${factorHTML}</div>${tipsHTML}</div></div>`;
}


let helpMode=localStorage.getItem('ft_help_mode')==='1';

const TOOLTIP_CONTENT={
  forecast:{title:'Monthly Snapshot',body:'Gives you a quick view of your projected month-end balance and your next payday. It is designed to help you decide how careful you need to be right now.'},
  upcoming:{title:'Due Soon',body:'Shows unpaid recurring bills or income that are closest to their due dates. Use the Pay button to log them quickly and keep your forecast accurate.'},
  alerts:{title:'Alerts & Insights',body:'Combines warnings and suggestions in one place. Alerts show risks that need attention. Insights highlight patterns and improvement opportunities.'},
  budget_attention:{title:'Budget Attention',body:'Focuses only on categories that are near their limits or already over budget, so you do not have to scan every category daily.'},
  recent:{title:'Recent Transactions',body:'Shows your latest entries for quick review. Open History to search, filter, edit, or export your transactions.'},
  add_expense:{title:'Add Expense',body:'Log spending here. Choose a category, amount, account, and optional note so the app can track your budget and balances correctly.'},
  add_income:{title:'Extra Income',body:'Log extra income here. Assigning an account will increase that account balance automatically.'},
  history:{title:'History & Filters',body:'Search and filter expenses or income by multiple categories, quick date chips, month, specific day, week, custom date range, account, amount, and type. You can also export the filtered results as CSV.'},
  goals:{title:'Financial Health',body:'Shows your overall money score using savings, budget discipline, emergency fund progress, and debt health.'},
  more:{title:'Net Worth',body:'Track the balances of your accounts and compare total assets against total debts to see your real net worth.'}
};

function setTooltipContent(id,key){
  const el=document.getElementById(id), data=TOOLTIP_CONTENT[key];
  if(!el||!data) return;
  const t=el.querySelector('.tooltip-title'), b=el.querySelector('.tooltip-body');
  if(t) t.textContent=data.title;
  if(b) b.textContent=data.body;
}
function toggleTooltip(event,id){
  event.stopPropagation();
  document.querySelectorAll('.tooltip-pop.show').forEach(p=>{ if(p.id!==id) p.classList.remove('show'); });
  const el=document.getElementById(id);
  if(el) el.classList.toggle('show');
}
function closeAllTooltips(){
  document.querySelectorAll('.tooltip-pop.show').forEach(p=>p.classList.remove('show'));
}
function toggleHelpMode(){
  helpMode=!helpMode;
  localStorage.setItem('ft_help_mode', helpMode ? '1' : '0');
  render();
}
function tooltipMarkup(id){
  return `<span class="tooltip-anchor"><button class="tooltip-dot" onclick="toggleTooltip(event,'${id}')">i</button><span class="tooltip-pop" id="${id}"><div class="tooltip-title"></div><div class="tooltip-body"></div></span></span>`;
}


let tutorialActive=false;
let tutorialStep=0;
let tutorialJustSavedExpense=false;

const TUTORIAL_STEPS=[
  {target:'tour-target-nav-add', title:'Start with Add', body:'Use the Add tab to log your first expense. This is the main action that powers the whole app.', tab:'dashboard'},
  {target:'tour-target-amount', title:'Enter the amount', body:'Type how much you spent. Example: 150 for lunch, 420 for a ride, or 2450 for groceries.', tab:'add', require:'amount', allowInput:true},
  {target:'tour-target-category', title:'Choose a category', body:'Pick where this expense belongs, like Groceries, Transport, or Entertainment.', tab:'add', require:'category', allowInput:true},
  {target:'tour-target-account', title:'Choose the paying account', body:'Select the wallet or bank account that paid for this expense. This keeps your balances accurate.', tab:'add', require:'account', allowInput:true},
  {target:'tour-target-date', title:'Confirm the date', body:'Use today or change it if the expense happened earlier.', tab:'add', allowInput:true},
  {target:'tour-target-note', title:'Add an optional note', body:'Notes are helpful for things like store names, bill details, or reminders.', tab:'add', allowInput:true},
  {target:'tour-target-submit-expense', title:'Save your first expense', body:'Tap here to add it. Once saved, the tutorial will take you back to Home and explain what changed.', tab:'add', submit:true},
  {target:'compact-forecast', title:'Read your monthly snapshot', body:'This gives you a quick forecast of where your month may end, plus your next payday.', tab:'dashboard'},
  {target:'alerts-insights-card', title:'Watch alerts and insights', body:'This section explains what needs attention and what you can improve next.', tab:'dashboard'},
  {target:'tour-target-bell', title:'Check the notification bell', body:'Important updates like due bills and budget warnings are stored here.', tab:'dashboard'}
];

function shouldStartTutorial(){
  return !localStorage.getItem('ft_guided_tutorial_done');
}
function startTutorial(){
  tutorialActive=true;
  tutorialStep=0;
  tutorialJustSavedExpense=false;
  document.getElementById('tour-overlay').classList.add('show');
  renderTutorialStep();
}
function finishTutorial(){
  tutorialActive=false;
  document.getElementById('tour-overlay').classList.remove('show');
  document.getElementById('tour-card').classList.remove('show');
  document.getElementById('tour-highlight').classList.add('hidden');
  document.querySelectorAll('.tour-target-active').forEach(el=>el.classList.remove('tour-target-active'));
  localStorage.setItem('ft_guided_tutorial_done','1');
}
function skipTutorial(){
  finishTutorial();
}
function prevTutorialStep(){
  if(!tutorialActive) return;
  tutorialStep=Math.max(0,tutorialStep-1);
  tutorialJustSavedExpense=false;
  renderTutorialStep();
}
function validateTutorialStep(step){
  if(step.require==='amount'){
    const val=parseFloat(document.getElementById('f-amount')?.value||'');
    if(!(val>0)){ showAlert('Please enter an amount first.'); return false; }
  }
  if(step.require==='category'){
    const val=document.getElementById('f-cat')?.value||'';
    if(!val || val==='__other__'){ showAlert('Please choose a category first.'); return false; }
  }
  if(step.require==='account'){
    const val=document.getElementById('f-account')?.value||'';
    if(!val){ showAlert('Please choose an account first.'); return false; }
  }
  return true;
}
function nextTutorialStep(){
  if(!tutorialActive) return;
  const step=TUTORIAL_STEPS[tutorialStep];
  if(!step) return;
  if(step.submit){
    const amount=parseFloat(document.getElementById('f-amount')?.value||'');
    const category=document.getElementById('f-cat')?.value||'';
    const account=document.getElementById('f-account')?.value||'';
    if(!(amount>0)){ showAlert('Enter an amount first.'); return; }
    if(!category || category==='__other__'){ showAlert('Choose a category first.'); return; }
    if(!account){ showAlert('Choose an account first.'); return; }
    addEntry();
    return;
  }
  if(!validateTutorialStep(step)) return;
  tutorialStep++;
  renderTutorialStep();
}
function positionTourCard(targetRect){
  const card=document.getElementById('tour-card');
  const vw=window.innerWidth, vh=window.innerHeight;
  const cardW=Math.min(320, vw-24);
  card.style.width=cardW+'px';
  card.style.visibility='hidden';
  card.classList.add('show');
  const cardRect=card.getBoundingClientRect();
  let top=targetRect.bottom+14;
  if(top+cardRect.height > vh-12) top=Math.max(12, targetRect.top-cardRect.height-14);
  let left=Math.min(vw-cardW-12, Math.max(12, targetRect.left));
  if(left < 12) left=12;
  card.style.left=left+'px';
  card.style.top=top+'px';
  card.style.visibility='visible';
}
function renderTutorialStep(){
  if(!tutorialActive) return;
  const step=TUTORIAL_STEPS[tutorialStep];
  if(!step){ finishTutorial(); return; }
  if(step.tab) showTab(step.tab);

  document.querySelectorAll('.tour-target-active').forEach(el=>el.classList.remove('tour-target-active'));

  const target=document.getElementById(step.target);
  if(!target){
    setTimeout(renderTutorialStep, 150);
    return;
  }
  target.classList.add('tour-target-active');
  target.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(()=>{
    const rect=target.getBoundingClientRect();
    const pad=8;
    const highlight=document.getElementById('tour-highlight');
    highlight.style.top=(rect.top-pad)+'px';
    highlight.style.left=(rect.left-pad)+'px';
    highlight.style.width=(rect.width+pad*2)+'px';
    highlight.style.height=(rect.height+pad*2)+'px';
    highlight.classList.remove('hidden');

    const card=document.getElementById('tour-card');
    document.getElementById('tour-step-badge').textContent=`Step ${tutorialStep+1} of ${TUTORIAL_STEPS.length}`;
    document.getElementById('tour-title').textContent=step.title;
    document.getElementById('tour-body').textContent=step.body;
    document.getElementById('tour-back-btn').style.visibility=tutorialStep===0?'hidden':'visible';
    document.getElementById('tour-back-btn').onclick=prevTutorialStep;
    document.getElementById('tour-next-btn').onclick=nextTutorialStep;
    document.getElementById('tour-next-btn').textContent=step.submit?'Save it':(step.allowInput?'I entered it':'Next');
    document.getElementById('tour-progress').innerHTML=TUTORIAL_STEPS.map((_,i)=>`<span class="${i===tutorialStep?'active':''}"></span>`).join('');
    positionTourCard(rect);
    card.classList.add('show');

    const focusable=target.querySelector('input,select,textarea,button');
    if(step.allowInput && focusable && focusable.focus) focusable.focus();
  }, 260);
}

let moreTutorialActive=false;
let moreTutorialStep=0;
const MORE_TUTORIAL_STEPS=[
  {target:'tour-target-networth-card', title:'Track your money', body:'Add your account balances here like BDO, GCash, Maya, or Cash. This card powers your net worth.'},
  {target:'tour-target-networth-add', title:'Add accounts', body:'Use + Add to create accounts for every place you keep money.'},
  {target:'nw-inputs', title:'Enter balances', body:'Type the current amount inside each account. Example: GCash = ₱2,500.'},
  {target:'tour-target-networth-save', title:'Save balances', body:'Tap this to update your net worth total instantly.'},
  {target:'tour-target-recurring-card', title:'Recurring bills and income', body:'Add monthly items like salary, electric bill, Spotify, rent, or subscriptions so the app can forecast better.'},
  {target:'tour-target-smart-setup', title:'Smart Setup', body:'Use Smart Setup to automatically build budgets from your salary and recurring bills.'},
  {target:'tour-target-rebalance', title:'Rebalance', body:'Use Rebalance when your spending changes and you want the app to suggest better budget amounts.'},
  {target:'tour-target-backup-card', title:'Backup your data', body:'Download a backup so you do not lose your data if you switch devices or clear your browser.'}
];

function startMoreTutorial(){
  if(localStorage.getItem('ft_more_tutorial_done')==='1') return;
  if(tutorialActive || moreTutorialActive) return;
  moreTutorialActive=true;
  moreTutorialStep=0;
  document.getElementById('tour-overlay').classList.add('show');
  document.getElementById('tour-card').classList.add('show');
  renderMoreTutorialStep();
}
function finishMoreTutorial(){
  moreTutorialActive=false;
  const overlay=document.getElementById('tour-overlay');
  const card=document.getElementById('tour-card');
  const highlight=document.getElementById('tour-highlight');
  overlay.classList.remove('show');
  card.classList.remove('show');
  card.style.display='none';
  card.style.visibility='hidden';
  highlight.classList.add('hidden');
  document.querySelectorAll('.tour-target-active').forEach(el=>el.classList.remove('tour-target-active'));
  localStorage.setItem('ft_more_tutorial_done','1');
}
function nextMoreTutorialStep(){
  if(!moreTutorialActive) return;
  moreTutorialStep++;
  renderMoreTutorialStep();
}
function prevMoreTutorialStep(){
  if(!moreTutorialActive) return;
  moreTutorialStep=Math.max(0, moreTutorialStep-1);
  renderMoreTutorialStep();
}
function renderMoreTutorialStep(){
  if(!moreTutorialActive) return;
  const step=MORE_TUTORIAL_STEPS[moreTutorialStep];
  if(!step){ finishMoreTutorial(); return; }

  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(t=>t.classList.remove('active'));
  document.getElementById('sec-more').classList.add('active');
  const moreNav=document.querySelector('.nav-item[data-tab="more"]');
  if(moreNav) moreNav.classList.add('active');
  render();

  document.querySelectorAll('.tour-target-active').forEach(el=>el.classList.remove('tour-target-active'));

  const target=document.getElementById(step.target);
  if(!target){
    setTimeout(renderMoreTutorialStep, 180);
    return;
  }

  target.classList.add('tour-target-active');
  target.scrollIntoView({behavior:'smooth', block:'center'});

  setTimeout(()=>{
    const rect=target.getBoundingClientRect();
    const isSmallButton = step.target==='tour-target-smart-setup' || step.target==='tour-target-rebalance';
    const pad = isSmallButton ? 2 : 8;
    const highlight=document.getElementById('tour-highlight');

    highlight.style.top=(rect.top-pad)+'px';
    highlight.style.left=(rect.left-pad)+'px';
    highlight.style.width=(rect.width+pad*2)+'px';
    highlight.style.height=(rect.height+pad*2)+'px';
    highlight.style.borderRadius = isSmallButton ? '12px' : '14px';
    highlight.classList.remove('hidden');

    const card=document.getElementById('tour-card');
    card.classList.add('show');
    card.style.display='block';
    card.style.visibility='visible';
    card.style.opacity='1';

    document.getElementById('tour-step-badge').textContent=`More ${moreTutorialStep+1} of ${MORE_TUTORIAL_STEPS.length}`;
    document.getElementById('tour-title').textContent=step.title;
    document.getElementById('tour-body').textContent=step.body;
    document.getElementById('tour-back-btn').style.visibility=moreTutorialStep===0?'hidden':'visible';
    document.getElementById('tour-next-btn').textContent=moreTutorialStep===MORE_TUTORIAL_STEPS.length-1?'Done':'Next';
    document.getElementById('tour-progress').innerHTML=MORE_TUTORIAL_STEPS.map((_,i)=>`<span class="${i===moreTutorialStep?'active':''}"></span>`).join('');

    const backBtn=document.getElementById('tour-back-btn');
    const nextBtn=document.getElementById('tour-next-btn');
    backBtn.onclick=prevMoreTutorialStep;
    nextBtn.onclick=moreTutorialStep===MORE_TUTORIAL_STEPS.length-1 ? function(){ finishMoreTutorial(); } : nextMoreTutorialStep;

    const vw=window.innerWidth;
    const vh=window.innerHeight;
    const cardWidth=Math.min(320, vw-24);
    const cardHeight=190;
    card.style.width=cardWidth+'px';
    card.style.left='50%';
    card.style.right='auto';
    card.style.transform='translateX(-50%)';

    const desiredTop = rect.bottom + 20;
    const maxTop = vh - cardHeight - 16;
    const minTop = 16;

    if(desiredTop <= maxTop){
      card.style.top = Math.max(minTop, desiredTop) + 'px';
      card.style.bottom = 'auto';
    } else {
      card.style.top = 'auto';
      card.style.bottom = (vw<=480 ? 86 : 24) + 'px';
    }
  }, 280);
}

function tutorialAfterExpenseSaved(){
  if(!tutorialActive) return;
  tutorialJustSavedExpense=true;
  showTab('dashboard');
  const toast=document.getElementById('tour-toast');
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 2500);
  setTimeout(()=>{
    tutorialStep=7;
    renderTutorialStep();
  }, 450);
}


function getDebtModeTargets(baseIncome){
  const income=Math.max(Number(baseIncome||0),0);
  const livingTarget=45000;
  const emergencyTarget=5000;
  const livingAlloc=Math.min(livingTarget,income);
  const emergencyAlloc=Math.min(emergencyTarget,Math.max(income-livingAlloc,0));
  const debtAttackAlloc=Math.max(income-livingAlloc-emergencyAlloc,0);
  return{livingTarget,emergencyTarget,debtAttackAlloc,livingAlloc,emergencyAlloc};
}
function applyBudgetPreset(preset,opts={}){
  budgetStrategy.preset=preset;
  budgetStrategy.custom=false;
  if(preset==='balanced'){
    budgetStrategy.needsPct=50; budgetStrategy.wantsPct=30; budgetStrategy.savingsPct=20;
  }else if(preset==='aggressive'){
    budgetStrategy.needsPct=40; budgetStrategy.wantsPct=20; budgetStrategy.savingsPct=40;
  }else if(preset==='survival'){
    budgetStrategy.needsPct=70; budgetStrategy.wantsPct=20; budgetStrategy.savingsPct=10;
  }else if(preset==='debt'){
    const targets=getDebtModeTargets(salary);
    const base=Math.max(Number(salary||0),1);
    const needsPct=Math.round(((targets.livingAlloc+targets.debtAttackAlloc)/base)*100);
    const savingsPct=Math.round((targets.emergencyAlloc/base)*100);
    budgetStrategy.needsPct=Math.max(0,Math.min(100,needsPct));
    budgetStrategy.wantsPct=0;
    budgetStrategy.savingsPct=Math.max(0,Math.min(100,100-budgetStrategy.needsPct));
    budgetStrategy.debtAttackTarget=targets.debtAttackAlloc;
    const savingsNames=allCats().filter(c=>c.group==='savings').map(c=>c.name);
    savingsNames.forEach(name=>{budgetStrategy.weights.savings[name]=name.toLowerCase().includes('emergency')?100:0});
  }
  if(!opts.auto)budgetStrategy.debtAutoApplied=true;
  if(opts.auto)budgetStrategy.debtAutoApplied=true;
  saveData();
  if(!opts.silent)render();
}
function setBudgetStrategyPct(group,val){
  val=Math.max(0,Math.min(100,parseInt(val)||0));
  budgetStrategy.custom=true;
  budgetStrategy.preset='custom';
  budgetStrategy[group+'Pct']=val;
  let total=budgetStrategy.needsPct+budgetStrategy.wantsPct+budgetStrategy.savingsPct;
  if(total!==100){
    // adjust the largest of the other two groups to keep the total at 100
    const others=['needs','wants','savings'].filter(x=>x!==group);
    const dominant=others.sort((a,b)=>budgetStrategy[b+'Pct']-budgetStrategy[a+'Pct'])[0];
    budgetStrategy[dominant+'Pct']=Math.max(0,budgetStrategy[dominant+'Pct']-(total-100));
    total=budgetStrategy.needsPct+budgetStrategy.wantsPct+budgetStrategy.savingsPct;
    if(total!==100){
      const last=others.find(x=>x!==dominant);
      budgetStrategy[last+'Pct']=Math.max(0,100-budgetStrategy.needsPct-budgetStrategy.wantsPct-budgetStrategy.savingsPct+budgetStrategy[last+'Pct']);
    }
  }
  saveData();
  render();
}
function setBudgetWeight(group,name,val){
  val=Math.max(0,parseInt(val)||0);
  budgetStrategy.weights[group][name]=val;
  saveData();
}
function normalizeWeights(group,names){
  const current=names.map(n=>Number(budgetStrategy.weights[group][n]||0));
  let sum=current.reduce((s,v)=>s+v,0);
  if(sum<=0){
    const equal=Math.floor(100/names.length);
    names.forEach((n,i)=>budgetStrategy.weights[group][n]=i===names.length-1?100-equal*(names.length-1):equal);
    return;
  }
  let assigned=0;
  names.forEach((n,i)=>{
    const pct=i===names.length-1 ? 100-assigned : Math.round((Number(budgetStrategy.weights[group][n]||0)/sum)*100);
    budgetStrategy.weights[group][n]=pct;
    assigned+=pct;
  });
  // small fix if rounding overflow/underflow
  const total=names.reduce((s,n)=>s+Number(budgetStrategy.weights[group][n]||0),0);
  if(total!==100 && names.length){
    budgetStrategy.weights[group][names[names.length-1]]=Number(budgetStrategy.weights[group][names[names.length-1]]||0)+(100-total);
  }
}
function getStrategyMeta(){
  const ac=allCats();
  const fixedNeeds=ac.filter(c=>c.group==='needs' && c.type==='fixed').reduce((s,c)=>s+Number(budgets[c.name]||0),0);
  const fixedWants=ac.filter(c=>c.group==='wants' && c.type==='fixed').reduce((s,c)=>s+Number(budgets[c.name]||0),0);
  const fixedSavings=ac.filter(c=>c.group==='savings' && c.type==='fixed').reduce((s,c)=>s+Number(budgets[c.name]||0),0);
  const needsBudget=Math.round(salary*(budgetStrategy.needsPct/100));
  const wantsBudget=Math.round(salary*(budgetStrategy.wantsPct/100));
  const savingsBudget=Math.round(salary*(budgetStrategy.savingsPct/100));
  return {
    fixedNeeds,fixedWants,fixedSavings,
    needsBudget,wantsBudget,savingsBudget,
    needsRemaining:Math.max(needsBudget-fixedNeeds,0),
    wantsRemaining:Math.max(wantsBudget-fixedWants,0),
    savingsRemaining:Math.max(savingsBudget-fixedSavings,0),
    fixedOverflow:fixedNeeds>needsBudget || fixedWants>wantsBudget || fixedSavings>savingsBudget
  };
}
function autoDistributeByStrategy(){
  const ac=allCats();
  const meta=getStrategyMeta();

  const groups={
    needs: ac.filter(c=>c.group==='needs'),
    wants: ac.filter(c=>c.group==='wants'),
    savings: ac.filter(c=>c.group==='savings')
  };

  // keep fixed amounts as-is; distribute only remaining group budget across variable/savings members by weights
  groups.needs.forEach(c=>{ if(c.type==='fixed') budgets[c.name]=Math.round(Number(budgets[c.name]||0)); });
  groups.wants.forEach(c=>{ if(c.type==='fixed') budgets[c.name]=Math.round(Number(budgets[c.name]||0)); });
  groups.savings.forEach(c=>{ if(c.type==='fixed') budgets[c.name]=Math.round(Number(budgets[c.name]||0)); });

  const variableNeeds=groups.needs.filter(c=>c.type!=='fixed').map(c=>c.name);
  const variableWants=groups.wants.filter(c=>c.type!=='fixed').map(c=>c.name);
  const variableSavings=groups.savings.filter(c=>c.type!=='fixed').map(c=>c.name);

  normalizeWeights('needs', variableNeeds);
  normalizeWeights('wants', variableWants);
  normalizeWeights('savings', variableSavings);

  function distribute(names, total, group){
    let assigned=0;
    names.forEach((name, idx)=>{
      const weight=Number(budgetStrategy.weights[group][name]||0);
      const amount=idx===names.length-1 ? Math.max(0,Math.round(total-assigned)) : Math.max(0,Math.round(total*(weight/100)));
      budgets[name]=amount;
      assigned+=amount;
    });
  }

  distribute(variableNeeds, meta.needsRemaining, 'needs');
  distribute(variableWants, meta.wantsRemaining, 'wants');
  distribute(variableSavings, meta.savingsRemaining, 'savings');

  saveData();
  render();
}


function openStrategyAdvanced(){
  renderStrategyAdvanced();
  openModal('modal-strategy-advanced');
}
function renderStrategyAdvanced(){
  const box=document.getElementById('strategy-advanced-content');
  if(!box) return;
  const needsNames=allCats().filter(c=>c.group==='needs' && c.type!=='fixed').map(c=>c.name);
  const wantsNames=allCats().filter(c=>c.group==='wants' && c.type!=='fixed').map(c=>c.name);
  const savingsNames=allCats().filter(c=>c.group==='savings' && c.type!=='fixed').map(c=>c.name);

  function section(title, group, names, color){
    return `<div class="card" style="padding:14px;margin:0 0 12px 0">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px;color:${color}">${title}</div>
      <div style="display:grid;gap:8px">
        ${names.map(name=>`<div style="display:grid;grid-template-columns:minmax(0,1fr) 76px;gap:8px;align-items:center">
          <div style="font-size:12px">${esc(name)}</div>
          <input class="input" type="number" min="0" value="${Number(budgetStrategy.weights[group][name]||0)}" data-group="${group}" data-name="${esc(name)}">
        </div>`).join('')}
      </div>
    </div>`;
  }

  box.innerHTML = `
    ${section('Needs weights','needs',needsNames,'var(--blue)')}
    ${section('Wants weights','wants',wantsNames,'var(--amber)')}
    ${section('Savings weights','savings',savingsNames,'var(--green)')}
  `;
}
function saveStrategyAdvanced(){
  const box=document.getElementById('strategy-advanced-content');
  if(!box) return;
  box.querySelectorAll('input[data-group][data-name]').forEach(inp=>{
    const group=inp.getAttribute('data-group');
    const name=inp.getAttribute('data-name');
    budgetStrategy.weights[group][name]=Math.max(0, parseInt(inp.value)||0);
  });
  saveData();
  closeModal('modal-strategy-advanced');
  render();
}

function renderSettings(){render()}
function toggleBudgetReview(){
  budgetReviewExpanded=!budgetReviewExpanded;
  localStorage.setItem('ft_budget_review_expanded',budgetReviewExpanded?'1':'0');
  render();
}
function setSalaryBudgetValue(val){
  salary=Math.max(0,parseFloat(val)||0);
  saveData();
  render();
}
function setBudgetAmount(name,val){
  budgets[name]=Math.max(0,parseFloat(val)||0);
  saveData();
  render();
}
function adjustBudgetAmount(name,delta){
  const next=Math.max(0,Number(budgets[name]||0)+Number(delta||0));
  budgets[name]=Math.round(next*100)/100;
  saveData();
  render();
}
function buildBudgetSplitRows(needsBudget,wantsBudget,savingsBudget){
  const amounts=[Number(needsBudget||0),Number(wantsBudget||0),Number(savingsBudget||0)];
  const total=amounts.reduce((sum,val)=>sum+val,0);
  let runningPct=0;
  const actualPcts=amounts.map((amount,idx)=>{
    if(total<=0)return 0;
    if(idx===amounts.length-1)return Math.max(0,100-runningPct);
    const pct=Math.max(0,Math.round((amount/total)*100));
    runningPct+=pct;
    return pct;
  });
  return[
    {key:'needs',label:'Needs',amount:amounts[0],actualPct:actualPcts[0],targetPct:Number(budgetStrategy.needsPct||0),color:'var(--blue)'},
    {key:'wants',label:'Wants',amount:amounts[1],actualPct:actualPcts[1],targetPct:Number(budgetStrategy.wantsPct||0),color:'var(--amber)'},
    {key:'savings',label:'Savings',amount:amounts[2],actualPct:actualPcts[2],targetPct:Number(budgetStrategy.savingsPct||0),color:'var(--green)'}
  ];
}
function getBudgetSplitSummary(needsBudget,wantsBudget,savingsBudget,totalBudgeted){
  const rows=buildBudgetSplitRows(needsBudget,wantsBudget,savingsBudget);
  const maxDiff=rows.reduce((max,row)=>Math.max(max,Math.abs(row.actualPct-row.targetPct)),0);
  const tone=maxDiff<=5?'good':maxDiff<=12?'warn':'risk';
  const status=maxDiff<=5?'Aligned with target':maxDiff<=12?'Slight drift from target':'Drifting from target';
  const presetLabel=budgetStrategy.preset==='balanced'?'Balanced 50/30/20':budgetStrategy.preset==='aggressive'?'Aggressive 40/20/40':budgetStrategy.preset==='survival'?'Survival 70/20/10':budgetStrategy.preset==='debt'?'Debt Mode':budgetStrategy.custom?'Custom split':'Current preset';
  return{rows,total:Number(totalBudgeted||0),tone,status,presetLabel};
}
function getBudgetSplitDiffMeta(actualPct,targetPct){
  const diff=actualPct-targetPct;
  if(diff===0)return{label:'On target',tone:'good'};
  if(diff>0)return{label:`${diff}% high`,tone:diff>12?'risk':'warn'};
  return{label:`${Math.abs(diff)}% low`,tone:Math.abs(diff)>12?'risk':'warn'};
}
function getBudgetRemainingMeta(spent,budget){
  spent=Number(spent||0);
  budget=Number(budget||0);
  const remaining=budget-spent;
  if(budget<=0){
    if(spent>0)return{label:`Over ${fmtBudget(Math.abs(remaining))}`,tone:'risk'};
    return{label:'Not set',tone:'neutral'};
  }
  if(remaining<0)return{label:`Over ${fmtBudget(Math.abs(remaining))}`,tone:'risk'};
  if(spent>=budget*0.85)return{label:`${fmtBudget(remaining)} left`,tone:'warn'};
  return{label:`${fmtBudget(remaining)} left`,tone:'good'};
}
function getBudgetReviewMeta(totalBudgeted,budgetTrackedSpent,budgetProjectedSpend){
  const spent=Number(budgetTrackedSpent||0);
  const projected=Number(budgetProjectedSpend||0);
  const total=Number(totalBudgeted||0);
  const remaining=total-spent;
  const projectedGap=total-projected;
  const progressPct=total>0?Math.min((spent/total)*100,100):0;
  let tone='good',status='On track',summary='Your current month is sitting inside the budget.';
  if(projectedGap<0){
    tone='risk';
    status='Projected over budget';
    summary=`At the current pace, you may finish ${fmtBudget(Math.abs(projectedGap))} over budget.`;
  }else if(remaining<0){
    tone='risk';
    status='Already over budget';
    summary=`This month is already ${fmtBudget(Math.abs(remaining))} above the budgeted plan.`;
  }else if(projectedGap<=Math.max(total*0.08,2000)){
    tone='warn';
    status='Close to the edge';
    summary=`Projection leaves only ${fmtBudget(Math.max(projectedGap,0))} of cushion.`;
  }
  return{total,spent,projected,remaining,projectedGap,progressPct,tone,status,summary};
}
function getUnallocatedBudgetGuidance(unalloc){
  const remaining=Number(unalloc||0);
  const threshold=Math.max(5000,Math.round(Math.max(Number(salary||0),0)*0.1));
  if(remaining>0&&remaining<threshold)return null;
  if(remaining<0){
    return{
      tone:'risk',
      title:`Budgets exceed salary by ${fmtBudget(Math.abs(remaining))}`,
      detail:'Trim wants first, then lower savings targets only if needed.'
    };
  }
  if(remaining<=0)return null;
  const activeDebts=getActiveDebts();
  if(activeDebts.length||budgetStrategy.preset==='debt'){
    return{
      tone:'warn',
      title:`${fmtBudget(remaining)} is still unallocated`,
      detail:'Consider pushing it to Debt attack first, then Emergency Fund.'
    };
  }
  const emergencyBudget=Number(budgets['Emergency Fund (Digital Bank)']||0);
  if(emergencyBudget<Math.max(Number(salary||0)*0.1,5000)){
    return{
      tone:'good',
      title:`${fmtBudget(remaining)} is still unallocated`,
      detail:'Consider topping up Emergency Fund or Savings (BDO).'
    };
  }
  return{
    tone:'good',
    title:`${fmtBudget(remaining)} is still unallocated`,
    detail:'Consider assigning it to Investments (MP2/UITF) or Big Purchases / Goals.'
  };
}
function renderBudgetReviewCard({totalBudgeted,budgetTrackedSpent,budgetProjectedSpend,daysLeft}){
  const mount=document.getElementById('budget-review-card');
  if(!mount)return;
  const review=getBudgetReviewMeta(totalBudgeted,budgetTrackedSpent,budgetProjectedSpend);
  const projectionLabel=review.projectedGap>=0?`Projected under by ${fmtBudget(review.projectedGap)}`:`Projected over by ${fmtBudget(Math.abs(review.projectedGap))}`;
  const body=budgetReviewExpanded?`<div class="budget-review-body"><div class="budget-review-grid"><div class="budget-review-stat"><span>Budgeted</span><strong>${fmt(review.total)}</strong><div>Category plan for this month</div></div><div class="budget-review-stat"><span>Spent</span><strong>${fmt(review.spent)}</strong><div>${review.remaining>=0?`${fmtBudget(review.remaining)} left`:`${fmtBudget(Math.abs(review.remaining))} over`}</div></div><div class="budget-review-stat"><span>Projected end</span><strong>${fmt(review.projected)}</strong><div>${projectionLabel}</div></div></div><div class="budget-review-progress"><div class="budget-review-progress-meta"><span>Used so far</span><span>${Math.round(review.progressPct)}%</span></div><div class="budget-review-progress-track"><div class="budget-review-progress-fill ${review.tone}" style="width:${review.progressPct}%"></div></div></div><div class="budget-review-foot">${daysLeft} day${daysLeft!==1?'s':''} left in the month</div></div>`:'';
  mount.innerHTML=`<div class="budget-review-shell"><div class="budget-review-head"><div><div class="budget-review-kicker">Current month report</div><div class="budget-review-title">${review.status}</div><div class="budget-review-sub">${review.summary}</div></div><button class="btn btn-sm btn-ghost" onclick="toggleBudgetReview()">${budgetReviewExpanded?'Hide details':'Show details'}</button></div><div class="budget-review-highlight ${review.tone}"><span>${projectionLabel}</span><strong>${fmt(review.projected)}</strong></div>${body}</div>`;
}
const BUDGET_SECTION_META={
  bills:       {label:'Bills & Utilities', icon:'🏠'},
  subscriptions:{label:'Subscriptions',    icon:'📡'},
  food:        {label:'Food',              icon:'🍽️'},
  transport:   {label:'Transport',         icon:'🚌'},
  health:      {label:'Health',            icon:'❤️'},
  personal:    {label:'Personal',          icon:'✨'},
  lifestyle:   {label:'Lifestyle',         icon:'🎉'},
  education:   {label:'Education',         icon:'📚'},
  buffer:      {label:'Buffer & Fees',     icon:'📦'},
  savings:     {label:'Savings',           icon:'💰'},
  other:       {label:'Other',             icon:'🏷️'},
};
function toggleBudgetSection(id){
  const el=document.getElementById('bsec-'+id);
  if(el)el.classList.toggle('bsec-collapsed');
}
function renderBudgetSettingsContent({ac,totalBudgeted,needsB,wantsB,savsB,unalloc,catTotals}){
  const mount=document.getElementById('settings-content');
  if(!mount)return;
  const split=getBudgetSplitSummary(needsB,wantsB,savsB,totalBudgeted);
  const guidance=getUnallocatedBudgetGuidance(unalloc);
  mount.innerHTML=`
    <div class="budget-settings-shell">
      <div class="budget-split-panel">
        <div class="budget-split-head">
          <div>
            <div class="budget-split-kicker">Allocation mix</div>
            <div class="budget-split-title">${split.status}</div>
          </div>
          <div class="budget-split-total-text">${split.total>0?fmtBudget(split.total):''}</div>
        </div>
        <div class="budget-split-bar">
          ${split.rows.map(row=>`<div class="budget-split-segment" style="width:${row.actualPct}%;background:${row.color}" title="${row.label}: ${row.actualPct}%"></div>`).join('')}
        </div>
        <div class="budget-split-legend">
          ${split.rows.map(row=>{
            const diff=getBudgetSplitDiffMeta(row.actualPct,row.targetPct);
            const statusColor=diff.label==='On target'?'var(--green)':diff.tone==='warn'?'var(--amber)':'var(--red)';
            return `<div class="budget-split-row"><div class="budget-split-row-left"><span class="budget-split-dot" style="background:${row.color}"></span><span class="budget-split-row-label">${row.label}</span></div><div class="budget-split-row-mid"><span class="budget-split-row-pct" style="color:${row.color}">${row.actualPct}%</span><span class="budget-split-row-amt">${fmtBudget(row.amount)}</span></div><span class="budget-split-row-status" style="color:${statusColor}">${diff.label}</span></div>`;
          }).join('')}
        </div>
        <div class="budget-split-footer">${split.presetLabel}</div>
      </div>
      <div class="setting-item">
        <div class="setting-left">
          <div class="setting-icon">&#128176;</div>
          <div>
            <div class="setting-name">Monthly Salary</div>
            <div class="setting-desc">Take-home pay used for budget planning</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <span style="color:var(--text3)">PHP</span>
          <input type="number" class="input setting-input" id="s-salary" value="${salary}" onchange="setSalaryBudgetValue(this.value)">
        </div>
      </div>
      ${guidance?`<div class="budget-guidance ${guidance.tone}"><strong>${guidance.title}</strong><div>${guidance.detail}</div></div>`:''}
      <div class="budget-category-list">
        ${(()=>{
          const sectionOrder=['bills','subscriptions','food','transport','health','personal','lifestyle','education','buffer','savings','other'];
          const grouped={};
          ac.forEach(c=>{const s=c.section||'other';(grouped[s]=grouped[s]||[]).push(c);});
          return sectionOrder.filter(s=>grouped[s]&&grouped[s].length).map(sId=>{
            const cats=grouped[sId];
            const meta=BUDGET_SECTION_META[sId]||BUDGET_SECTION_META.other;
            const secTotal=cats.reduce((sum,c)=>sum+Number(budgets[c.name]||0),0);
            const secSpent=cats.reduce((sum,c)=>sum+Number(catTotals[c.name]||0),0);
            const anyOver=cats.some(c=>Number(catTotals[c.name]||0)>Number(budgets[c.name]||0)&&Number(budgets[c.name]||0)>0);
            const rows=cats.map(c=>{
              const bgt=Number(budgets[c.name]||0);
              const spent=Number(catTotals[c.name]||0);
              const pctOfSalary=salary>0?Math.round((bgt/salary)*100):0;
              const spentPct=bgt>0?Math.min((spent/bgt)*100,100):0;
              const overBudget=bgt>0&&spent>bgt;
              const isCustom=customCats.some(x=>x.name===c.name);
              const grpLabel=catGroupLabel(c.group);
              const grpClass=catGroupClass(c.group);
              const safeName=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
              const remainingMeta=getBudgetRemainingMeta(spent,bgt);
              const showMeta=spent>0||bgt>0;
              const showChip=bgt>0;
              return `<div class="budget-category-row"><div class="budget-category-main"><div class="setting-icon">${c.icon||'&#128230;'}</div><div class="budget-category-copy"><div class="budget-category-top"><div class="setting-name">${esc(c.name)}</div>${isCustom?`<button class="cat-group-pill ${grpClass}" onclick="cycleCatGroup('${safeName}')" title="Tap to change group">${grpLabel}</button>`:`<span class="cat-group-pill ${grpClass}" style="cursor:default">${grpLabel}</span>`}</div>${showMeta?`<div class="budget-category-meta"><span>${formatBudgetProgress(spent,bgt)}</span>${pctOfSalary>0?`<span>${pctOfSalary}% of salary</span>`:''}</div>`:''} ${spent>0?`<div class="budget-category-progress"><div class="budget-category-progress-fill" style="width:${spentPct}%;background:${overBudget?'var(--red)':'var(--accent)'}"></div></div>`:''}</div></div><div class="budget-category-actions"><div class="budget-input-row"><span>PHP</span><input type="number" class="input setting-input" value="${bgt}" onchange="setBudgetAmount('${safeName}',this.value)"></div>${showChip?`<span class="budget-remaining-chip ${remainingMeta.tone}">${remainingMeta.label}</span>`:''}</div></div>`;
            }).join('');
            return `<div class="budget-section bsec-collapsed" id="bsec-${sId}"><button class="budget-section-header" onclick="toggleBudgetSection('${sId}')"><div class="budget-section-left"><span class="budget-section-icon">${meta.icon}</span><span class="budget-section-name">${meta.label}</span><span class="budget-section-count">${cats.length}</span></div><div class="budget-section-right">${anyOver?'<span class="budget-section-over-dot"></span>':''}<span class="budget-section-total">${fmtBudget(secTotal)}</span><span class="budget-section-chevron">▾</span></div></button><div class="budget-section-body">${rows}</div></div>`;
          }).join('');
        })()}
      </div>
      <div class="budget-settings-footer">
        <div>Total budgeted <strong>${fmt(totalBudgeted)}</strong></div>
        <div>Unallocated <strong style="color:${unalloc>=0?'var(--accent)':'var(--red)'}">${fmt(unalloc)}</strong></div>
      </div>
    </div>`;
}

function setDebtPayoffMethod(method){
  debtPayoffSettings.method=method;
  saveData();
  render();
}
function getDebtPayoffData(remaining, forecast, needsBudget){
  const activeDebts=getActiveDebts();
  const monthlyMinimum=activeDebts.reduce((s,d)=>s+Number(d.minDue||d.payment||0),0);
  const safeBuffer=Math.max(Number(needsBudget||0)*0.05, 1000);
  const projectedCushion=Math.max(Number(forecast?.projectedBalance||0)-safeBuffer,0);
  const remainingCushion=Math.max(Number(remaining||0)-safeBuffer,0);
  const rawExtra=Math.max(Math.min(projectedCushion,remainingCushion),0);
  const extraPayment=forecast?.projectedBalance<0?0:rawExtra;
  const method=debtPayoffSettings.method||'snowball';
  let sorted=[];
  if(method==='avalanche'){
    sorted=[...activeDebts].sort((a,b)=>{const byInterest=Number(b.interest||0)-Number(a.interest||0);if(byInterest!==0)return byInterest;return Number(a.total||0)-Number(b.total||0);});
  }else if(method==='snowball'){
    sorted=[...activeDebts].sort((a,b)=>{const byBalance=Number(a.total||0)-Number(b.total||0);if(byBalance!==0)return byBalance;return Number(b.interest||0)-Number(a.interest||0);});
  }else{
    sorted=[...activeDebts];
  }
  const targetDebt=method==='minimum'?null:(sorted.find(d=>Number(d.total||0)>0)||null);
  const debtPressurePct=needsBudget>0?Math.round(monthlyMinimum/needsBudget*100):0;
  const riskFlags=[];
  if(monthlyMinimum>needsBudget&&needsBudget>0)riskFlags.push('Debt payments exceed your full Needs budget.');
  else if(debtPressurePct>=60)riskFlags.push(`Debt payments are using ${debtPressurePct}% of your Needs budget.`);
  if(forecast?.projectedBalance<0)riskFlags.push('Month-end forecast is negative — avoid extra payments for now.');
  const targetMonthsMinOnly=targetDebt&&Number(targetDebt.payment||0)>0?Math.ceil(Number(targetDebt.total||0)/Number(targetDebt.payment||0)):null;
  const targetMonthsWithExtra=targetDebt&&(Number(targetDebt.payment||0)+extraPayment)>0?Math.ceil(Number(targetDebt.total||0)/(Number(targetDebt.payment||0)+extraPayment)):targetMonthsMinOnly;
  // Auto-recommendation
  const maxInterest=activeDebts.length?Math.max(...activeDebts.map(d=>Number(d.interest||0))):0;
  const highIntDebt=activeDebts.length?[...activeDebts].sort((a,b)=>Number(b.interest||0)-Number(a.interest||0))[0]:null;
  const smallDebts=activeDebts.filter(d=>Number(d.total||0)>0&&Number(d.total||0)<=20000);
  let recMethod,recReason;
  if(extraPayment<=0||forecast?.projectedBalance<0){recMethod='minimum';recReason='Your budget is tight right now. Stick to minimums until you have more breathing room.';}
  else if(maxInterest>=10&&highIntDebt){recMethod='avalanche';recReason=`${esc(highIntDebt.name)} is at ${highIntDebt.interest}% APR — your most expensive debt. Avalanche targets it first and saves the most interest.`;}
  else if(smallDebts.length>=2){recMethod='snowball';recReason=`You have ${smallDebts.length} smaller debts you can clear soon. Snowball knocks them out first and builds momentum.`;}
  else{recMethod='avalanche';recReason='Avalanche is the most cost-efficient strategy — it minimizes total interest paid.';}
  const isOnRec=method===recMethod;
  const methodDesc={minimum:'Pay only the required minimum on each debt. No extra payments.',snowball:'Pay minimums on all, then throw every extra peso at the smallest balance.',avalanche:'Pay minimums on all, then target the highest-interest debt first.'};
  return {method, monthlyMinimum, extraPayment, targetDebt, debtPressurePct, riskFlags, targetMonthsMinOnly, targetMonthsWithExtra, recMethod, recReason, isOnRec, methodDesc:methodDesc[method]||''};
}
function renderDebtFocusCard(data){
  const el=document.getElementById('debt-focus-card');
  if(!el)return;
  if(!debts.length){el.innerHTML='';return}
  const activeDebts=getActiveDebts();
  if(!activeDebts.length){
    el.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Debt Focus</span><span class="card-badge" style="background:var(--green-soft);color:var(--green)">Cleared</span></div>
      <div style="display:grid;gap:10px">
        <div style="padding:12px;background:var(--surface2);border-radius:var(--radius-sm)">
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">Status</div>
          <div style="font-size:13px;font-weight:700">All tracked debts are fully paid.</div>
          <div style="font-size:12px;color:var(--text2);margin-top:4px">${getPaidOffDebts().length} paid-off account${getPaidOffDebts().length!==1?'s':''} kept in history below.</div>
        </div>
      </div></div>`;
    return;
  }
  const methodLabel=data.methodLabel||'Snowball';
  const paidThisMonth=debts.filter(d=>d.lastPaidMonth===currentMonthKey()).length;
  el.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Debt Focus</span><span class="card-badge" style="background:var(--red-soft);color:var(--red)">${methodLabel}</span></div>
    <div style="display:grid;gap:10px">
      <div style="padding:12px;background:var(--surface2);border-radius:var(--radius-sm)">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">This month</div>
        <div style="font-size:13px;font-weight:700">${paidThisMonth} of ${debts.length} debts paid</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">Minimums due: ${fmtShort(data.monthlyMinimum||0)}</div>
      </div>
      <div style="padding:12px;background:var(--surface2);border-radius:var(--radius-sm)">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">Focus</div>
        <div style="font-size:13px;font-weight:700">${data.targetDebt?esc(data.targetDebt.name):'Pay minimums on all debts'}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">${data.extraPayment>0&&data.targetDebt?`Suggested extra payment: ${fmtShort(data.extraPayment)}`:'No safe extra payment right now'}</div>
      </div>
      ${data.riskText?`<div style="font-size:12px;color:var(--red);font-weight:600">${data.riskText}</div>`:''}
    </div></div>`;
}

/* ============ MAIN RENDER ============ */
function render(){
  try{ renderCashflowNotification(); }catch(e){}
  try{ renderSafeSpendCard(); }catch(e){}
  try{ renderAnalyticsSummary(); }catch(e){}
  try{
    document.querySelectorAll('.g-tag').forEach(tag=>{
      if((tag.textContent||'').includes('/day')) tag.remove();
    });
  }catch(e){}
  try{ renderAnalyticsInsights(); }catch(e){}
  try{ renderSpendingCalendar(); }catch(e){}
  try{ renderBudgetFocus(); }catch(e){}
  try{ renderTrendSummary(); }catch(e){}


  const helpBtn=document.getElementById('help-toggle-btn');
  if(helpBtn){helpBtn.textContent=helpMode?'❓':'❔';helpBtn.style.background=helpMode?'var(--accent-soft)':'var(--surface)';helpBtn.style.color=helpMode?'var(--accent)':'var(--text)';helpBtn.style.borderColor=helpMode?'var(--accent)':'var(--border)'}
  nwAccounts.forEach(a=>{if(nwBalances[a.key]===undefined)nwBalances[a.key]=0});
  syncLegacyTransactionAccounts();
  const ac=allCats();
  const totalBudgeted=ac.reduce((s,c)=>s+(budgets[c.name]||0),0);
  const needsB=ac.filter(c=>c.group==='needs').reduce((s,c)=>s+(budgets[c.name]||0),0);
  const wantsB=ac.filter(c=>c.group==='wants').reduce((s,c)=>s+(budgets[c.name]||0),0);
  const savsB=ac.filter(c=>c.group==='savings').reduce((s,c)=>s+(budgets[c.name]||0),0);
  const monthlyExp=needsB+wantsB;const unalloc=salary-totalBudgeted;
    const carryoverOverspend=getCarryoverOverspend();
  const totalIncome=Number(salary||0);const totalDebt=debts.reduce((s,d)=>s+d.total,0);
  if(totalDebt>0 && !budgetStrategy.custom && budgetStrategy.preset!=='debt' && !budgetStrategy.debtAutoApplied){
    applyBudgetPreset('debt',{silent:true,auto:true});
  }
  const me=entries.filter(e=>e.date.startsWith(filterMonth));
  const monthTotal=me.reduce((s,e)=>s+e.amount,0);
  const todayTotal=entries.filter(e=>e.date===todayStr).reduce((s,e)=>s+e.amount,0);
  const weekStart=getStartOfWeek(now);
  const todayEnd=new Date(`${todayStr}T23:59:59`);
  const weekTotal=entries.filter(e=>{const d=new Date(`${e.date}T00:00:00`);return d>=weekStart&&d<=todayEnd}).reduce((s,e)=>s+e.amount,0);
  const remaining=totalIncome-carryoverOverspend-monthTotal;const actualSavings=me.filter(e=>{const cat=ac.find(c=>c.name===e.category);return cat&&cat.group==='savings';}).reduce((s,e)=>s+e.amount,0);const savRate=totalIncome>0?Math.round(actualSavings/totalIncome*100):0;
  const catTotals=getMonthCategoryTotals();
  const budgetTrackedSpent=Object.values(catTotals).reduce((sum,val)=>sum+Number(val||0),0);
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const daysLeft=Math.max(daysInMonth-now.getDate()+1,1);
  const dailyLeft=daysLeft>0?remaining/daysLeft:0;
  const forecast=getForecastData(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft);


  // Budget strategy card
  const strategyMeta=getStrategyMeta();
  const bsEl=document.getElementById('budget-strategy-card');
  if(bsEl){
    const totalPct=budgetStrategy.needsPct+budgetStrategy.wantsPct+budgetStrategy.savingsPct;
    const presetLabel=budgetStrategy.preset==='balanced'?'50/30/20':budgetStrategy.preset==='aggressive'?'40/20/40':budgetStrategy.preset==='survival'?'70/20/10':budgetStrategy.preset==='debt'?'Debt Mode':'Custom';
    bsEl.innerHTML=`
      <div style="font-size:12px;color:var(--text3);margin-bottom:10px">
        This feature helps the app recommend and auto-build category budgets from your salary.
      </div>

      <div class="quick-actions" style="margin-bottom:12px">
        <button class="quick-chip" style="${budgetStrategy.preset==='balanced'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('balanced')">Balanced 50/30/20</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='aggressive'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('aggressive')">Aggressive 40/20/40</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='survival'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('survival')">Survival 70/20/10</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='debt'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('debt')">Debt Mode</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='custom'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}">Custom</button>
      </div>

      <div class="card" style="padding:14px;margin:0 0 12px 0">
        <div style="display:grid;gap:12px">
          <div>
            <div class="progress-header"><span class="progress-label">Needs</span><span class="progress-value">${budgetStrategy.needsPct}% · ${fmtShort(strategyMeta.needsBudget)}</span></div>
            <input class="input" type="range" min="0" max="100" value="${budgetStrategy.needsPct}" oninput="setBudgetStrategyPct('needs',this.value)">
          </div>
          <div>
            <div class="progress-header"><span class="progress-label">Wants</span><span class="progress-value">${budgetStrategy.wantsPct}% · ${fmtShort(strategyMeta.wantsBudget)}</span></div>
            <input class="input" type="range" min="0" max="100" value="${budgetStrategy.wantsPct}" oninput="setBudgetStrategyPct('wants',this.value)">
          </div>
          <div>
            <div class="progress-header"><span class="progress-label">Savings</span><span class="progress-value">${budgetStrategy.savingsPct}% · ${fmtShort(strategyMeta.savingsBudget)}</span></div>
            <input class="input" type="range" min="0" max="100" value="${budgetStrategy.savingsPct}" oninput="setBudgetStrategyPct('savings',this.value)">
          </div>
        </div>
        <div style="font-size:11px;color:${totalPct===100?'var(--green)':'var(--red)'};margin-top:8px;font-weight:700">
          Total: ${totalPct}% · Preset: ${presetLabel}
        </div>
        ${strategyMeta.fixedOverflow?`<div style="margin-top:8px;font-size:11px;color:var(--red);font-weight:700">⚠ Fixed bills are higher than one of your current group allocations.</div>`:''}
      </div>

      ${budgetStrategy.preset==='debt'?(()=>{const targets=getDebtModeTargets(salary);return `<div style="padding:12px;background:var(--surface2);border-radius:var(--radius-xs);border-left:3px solid var(--red);margin-bottom:12px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Debt Mode Targets</div>
        <div style="display:grid;gap:6px;font-size:12px;color:var(--text2)">
          <div>Living/Bills: <strong>${fmtShort(targets.livingAlloc)}</strong></div>
          <div>Emergency cash: <strong>${fmtShort(targets.emergencyAlloc)}</strong></div>
          <div>Debt attack: <strong>${fmtShort(targets.debtAttackAlloc)}</strong></div>
          <div>Investments/goals: <strong>₱0</strong> (temporarily)</div>
        </div>
      </div>`;})():''}

      <div style="display:grid;gap:8px;margin-bottom:12px">${[{label:'Needs',color:'var(--blue)',fixed:strategyMeta.fixedNeeds,budget:strategyMeta.needsBudget},{label:'Wants',color:'var(--amber)',fixed:strategyMeta.fixedWants,budget:strategyMeta.wantsBudget},{label:'Savings',color:'var(--green)',fixed:strategyMeta.fixedSavings,budget:strategyMeta.savingsBudget}].map(g=>{const free=Math.max(g.budget-g.fixed,0);const usedPct=g.budget>0?Math.min(g.fixed/g.budget*100,100):0;return`<div style="padding:10px 12px;background:var(--surface2);border-radius:var(--radius-xs);border-left:3px solid ${g.color}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:${g.color}">${g.label}</span><span style="font-size:11px;color:var(--text3)">Budget: <strong>${fmtShort(g.budget)}</strong></span></div><div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:5px"><div style="height:100%;width:${usedPct}%;background:${g.color};border-radius:2px;transition:width .4s"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)"><span>Fixed: ${fmtShort(g.fixed)}</span><span style="color:${free>0?'var(--green)':'var(--red)'};font-weight:600">Free: ${fmtShort(free)}</span></div></div>`}).join('')}</div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="autoDistributeByStrategy()">Auto Balance Budgets</button>
        <button class="btn btn-ghost btn-sm" onclick="openStrategyAdvanced()">Advanced distribution</button>
      </div>
    `;
  }
  renderBudgetReviewCard({totalBudgeted,budgetTrackedSpent,budgetProjectedSpend:forecast.budgetProjectedSpend,daysLeft});
  try{
    renderMonthCloseCard(currentMonthKey());
    if(document.getElementById('modal-month-close')?.classList.contains('show'))renderMonthCloseWizard(activeMonthCloseKey||currentMonthKey());
  }catch(e){
    console.error('FinTrack: month close render failed',e);
  }

  // Greeting carousel
  const hour=now.getHours();const greet=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  let payInfo=null;
  try{ payInfo=getPaydayInfo(); }catch(e){ payInfo=null; }
  const spentPct=Math.max(0,Math.min(totalIncome>0?(monthTotal/totalIncome)*100:0,100));
  const safeNow=getSafeSpendRealData();
  const safeDaily=safeNow&&safeNow.daily?safeNow.daily:0;
  const savingsTone=savRate>=30?'Strong':savRate>=20?'Healthy':'Building';
  const greetKicker=remaining<0?'Over budget this month':spentPct>90?'Nearing your limit':payInfo&&payInfo.daysUntil<=2?'Payday is almost here':daysLeft<=3?'Month is almost over':savRate>=20?'Strong savings this month':greet;
  const momentumKicker=savRate>=30?'Excellent momentum':savRate>=20?'Looking good this month':savRate>0?'Keep building momentum':'Start tracking savings';
  const payDayClass=payInfo&&Number.isFinite(payInfo.daysUntil)?(payInfo.daysUntil<=2?' g-tag-payday-soon':payInfo.daysUntil<=7?' g-tag-payday-close':''):'';
  const payChip=payInfo&&Number.isFinite(payInfo.daysUntil)?`<div class="g-tag${payDayClass}">💸 Payday in ${payInfo.daysUntil}d</div>`:'';
  const progressFillClass=spentPct>90?'greeting-progress-fill greeting-progress-fill--risk':spentPct>65?'greeting-progress-fill greeting-progress-fill--warn':'greeting-progress-fill';
  const spendProgressText=totalIncome>0?`${fmt(monthTotal)} of ${fmtShort(totalIncome)}`:`${fmt(monthTotal)} spent`;
  const daysElapsed=Math.max(daysInMonth-daysLeft,1);
  const dailyAvg=daysElapsed>1?monthTotal/daysElapsed:0;
  const todayVsAvg=dailyAvg>0?Math.round((todayTotal-dailyAvg)/dailyAvg*100):0;
  const prevWeekEndDate=new Date(now);prevWeekEndDate.setDate(now.getDate()-7);prevWeekEndDate.setHours(23,59,59,999);
  const prevWeekStartDate=new Date(now);prevWeekStartDate.setDate(now.getDate()-14);prevWeekStartDate.setHours(0,0,0,0);
  const prevWeekTotal=entries.filter(e=>{const d=new Date(`${e.date}T00:00:00`);return d>=prevWeekStartDate&&d<=prevWeekEndDate;}).reduce((s,e)=>s+Number(e.amount||0),0);
  const weekVsPrev=prevWeekTotal>0?Math.round((weekTotal-prevWeekTotal)/prevWeekTotal*100):0;
  const todayTrendHtml=dailyAvg>0&&daysElapsed>1?(todayVsAvg>15?`<span class="greeting-mini-trend greeting-mini-trend--up">&#8593; ${Math.abs(todayVsAvg)}% vs avg</span>`:todayVsAvg<-15?`<span class="greeting-mini-trend greeting-mini-trend--down">&#8595; ${Math.abs(todayVsAvg)}% vs avg</span>`:''):'';
  const weekTrendHtml=prevWeekTotal>0?(weekVsPrev>15?`<span class="greeting-mini-trend greeting-mini-trend--up">&#8593; ${Math.abs(weekVsPrev)}% vs last wk</span>`:weekVsPrev<-15?`<span class="greeting-mini-trend greeting-mini-trend--down">&#8595; ${Math.abs(weekVsPrev)}% vs last wk</span>`:''):'';
  const spendRhythm=`<div class="greeting-mini-stats"><div class="greeting-mini-stat" onclick="showTab('history')" style="cursor:pointer"><span class="greeting-mini-label">&#128336; Today</span><strong>${fmt(todayTotal)}</strong>${todayTrendHtml}</div><div class="greeting-mini-stat" onclick="showTab('history')" style="cursor:pointer"><span class="greeting-mini-label">&#128197; This week</span><strong>${fmt(weekTotal)}</strong>${weekTrendHtml}</div></div>`;
  const slide0=`
    <div class="greeting-slide ${greetingCardIndex===0?'active':''}">
      <div class="greeting-top">
        <div class="greeting-kicker">${greetKicker}</div>
        <div class="greeting-side-pill">✨ Monthly overview</div>
      </div>
      <div class="greeting-value">${fmt(remaining)}</div>
      <div class="greeting-label">Available this month</div>
      <div class="greeting-subline"><span>${fmtShort(monthTotal)} spent</span>${carryoverOverspend>0?`<span>• ${fmtShort(carryoverOverspend)} carryover</span>`:""}<span>• ${daysLeft} days left</span></div>
      <div class="greeting-chip-row">${savRate>=20?`<div class="g-tag">🔥 ${savRate}% savings</div>`:''}${payChip}</div>
      ${spendRhythm}
      <div class="greeting-progress">
        <div class="greeting-progress-track"><div class="${progressFillClass}" style="width:${spentPct}%"></div></div>
        <div class="greeting-progress-meta"><span>${spendProgressText}${carryoverOverspend>0?` · ${fmtShort(carryoverOverspend)} carryover`:''}</span><span>${Math.round(spentPct)}% used</span></div>
      </div>
    </div>`;
  const slide1=`
    <div class="greeting-slide ${greetingCardIndex===1?'active':''}">
      <div class="greeting-top">
        <div class="greeting-kicker">${safeNow.status==='good'?'You are on track':safeNow.status==='warn'?'Stay a little tighter':'Watch your pace'}</div>
        <div class="greeting-side-pill">🧠 Daily guidance</div>
      </div>
      <div class="greeting-value">${fmt(safeDaily)}</div>
      <div class="greeting-label">Safe to spend today</div>
      <div class="greeting-subline"><span>Bills and buffer already accounted for</span></div>
      <div class="greeting-chip-row"><div class="g-tag">🧾 Bills ${fmtShort(safeNow.upcomingBillsTotal||0)}</div><div class="g-tag">🛡️ Buffer ${fmtShort(safeNow.buffer||0)}</div>${payChip}</div>
    </div>`;
  const slide2=`
    <div class="greeting-slide ${greetingCardIndex===2?'active':''}">
      <div class="greeting-top">
        <div class="greeting-kicker">${momentumKicker}</div>
        <div class="greeting-side-pill">🌟 Momentum</div>
      </div>
      <div class="greeting-value">${savRate}%</div>
      <div class="greeting-label">Income going to savings</div>
      <div class="greeting-subline"><span>${savingsTone} savings pace</span><span>• ${daysLeft} days left</span></div>
      <div class="greeting-chip-row"><div class="g-tag">✅ ${safeNow.status==='good'?'On track':safeNow.status==='warn'?'Tight but okay':'Needs attention'}</div><div class="g-tag">💸 ${fmtShort(monthTotal)} spent</div>${payChip}</div>
    </div>`;
  document.getElementById('greeting-card').innerHTML=`
    <div class="greeting-carousel">
      <div class="greeting-slides">${slide0}${slide1}${slide2}</div>
      <div class="greeting-nav">
        <div class="greeting-tabs">
          <button class="greeting-tab ${greetingCardIndex===0?'active':''}" onclick="setGreetingCard(0)">Overview</button>
          <button class="greeting-tab ${greetingCardIndex===1?'active':''}" onclick="setGreetingCard(1)">Daily</button>
          <button class="greeting-tab ${greetingCardIndex===2?'active':''}" onclick="setGreetingCard(2)">Savings</button>
        </div>
      </div>
    </div>`;

  // Compact forecast + payday
  const pay=getPaydayInfo();
  document.getElementById('compact-forecast').innerHTML=`<div class="forecast-strip"><div class="fs-box"><div class="fs-label">Month-End</div><div class="fs-value" style="color:${forecast.projectedBalance>=0?'var(--green)':'var(--red)'}">${fmtShort(forecast.projectedBalance)}</div><div style="font-size:11px;color:${forecast.color};font-weight:600;margin-top:2px">${forecast.status}</div></div><div class="fs-box"><div class="fs-label">Payday</div><div class="fs-value" style="color:var(--accent)">${pay.daysUntil}d</div><div style="font-size:11px;color:var(--text3);margin-top:2px">${pay.nextDate.toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</div></div></div>`;
  renderSalaryPromptCard();

  const debtPayoffData=getDebtPayoffData(remaining,forecast,needsB);
  renderDebtFocusCard(debtPayoffData);

  // Upcoming bills (only unpaid ones)
  const unpaidRecurring=recurring.map(r=>({item:r,status:recurringStatus(r)})).filter(({status})=>status.state!=='paid').sort((a,b)=>a.status.days-b.status.days).slice(0,3);
  const ubCard=document.getElementById('upcoming-bills-card');
  if(unpaidRecurring.length){
    ubCard.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Due Soon ${tooltipMarkup('tip-upcoming')}</span><span style="font-size:12px;color:var(--accent);cursor:pointer;font-weight:600" onclick="showTab('more')">All →</span></div>${helpMode?'<div class="help-inline">Upcoming unpaid recurring items.</div>':''}<div class="tx-list">${unpaidRecurring.map(({item,status})=>`<div class="tx-item"><div class="tx-icon ${item.type==='bill'?'cat-electric':'cat-income'}" style="width:36px;height:36px">${item.type==='bill'?'🧾':'💵'}</div><div class="tx-info"><div class="tx-name">${esc(item.name)}</div><div class="tx-meta" style="color:${status.color}">${status.label} · ${fmtShort(item.amount)}</div></div><button class="btn btn-sm btn-primary" style="padding:6px 10px" onclick="markRecurringPaid(${item.id})">Pay</button></div>`).join('')}</div></div>`;
  }else{
    ubCard.innerHTML='';
  }

  // Combined Alerts & Insights (tabbed)
  const smartAlerts=getSmartAlerts(ac,catTotals,totalIncome,remaining,monthTotal,daysLeft);
  const insights=getSmartInsights(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft,forecast);
  const aiCard=document.getElementById('alerts-insights-card');
  const hasAlerts=smartAlerts.length>0;
  const hasInsights=insights.length>0;
  if(hasAlerts||hasInsights){
    const defaultTab=hasAlerts?'alerts':'insights';
    aiCard.innerHTML=`<div class="card"><div class="card-header" style="margin-bottom:10px"><span class="card-title">Alerts & Insights ${tooltipMarkup('tip-alerts')}</span></div>${helpMode?'<div class="help-inline">Warnings and suggestions based on your current month.</div>':''}<div class="tab-row"><button class="tab-btn ${defaultTab==='alerts'?'active':''}" onclick="switchAITab('alerts')">⚠️ Alerts${hasAlerts?' ('+smartAlerts.length+')':''}</button><button class="tab-btn ${defaultTab==='insights'?'active':''}" onclick="switchAITab('insights')">💡 Insights</button></div><div class="tab-pane ${defaultTab==='alerts'?'active':''}" id="ai-pane-alerts"><div style="display:grid;gap:8px">${smartAlerts.map(a=>`<div style="padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:${a.type==='critical'?'var(--red-soft)':'var(--surface2)'}"><div style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px"><span>${a.icon}</span><span>${esc(a.title)}</span></div><div style="font-size:12px;color:var(--text2);margin-top:3px">${esc(a.detail)}</div></div>`).join('')}</div></div><div class="tab-pane ${defaultTab==='insights'?'active':''}" id="ai-pane-insights"><div style="display:grid;gap:8px">${insights.map(i=>`<div style="padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:${i.type==='warning'?'var(--red-soft)':i.type==='good'?'var(--green-soft)':'var(--surface2)'}"><div style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px"><span>${i.icon}</span><span>${esc(i.title)}</span></div><div style="font-size:12px;color:var(--text2);margin-top:3px">${esc(i.detail)}</div></div>`).join('')}</div></div></div>`;
  }else{
    aiCard.innerHTML='';
  }
  renderMoneyFlowCard();

  // Budget attention — only show categories near or over limit
  const budgetProgressItems=getBudgetProgressItems(ac).filter(c=>c.budget>0||c.spent>0).sort((a,b)=>Number(b.over)-Number(a.over)||b.pct-a.pct||b.spent-a.spent);
  const problemCats=budgetProgressItems.filter(c=>c.budget>0&&c.pct>=75);
  const budgetAttCard=document.getElementById('budget-attention-card');
  if(problemCats.length){
    budgetAttCard.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Budget Attention</span><span style="font-size:12px;color:var(--text3);cursor:pointer;font-weight:600" onclick="openAllBudgets()">All budgets →</span></div>${problemCats.slice(0,4).map(c=>{const color=c.over?'var(--red)':'var(--amber)';return`<div class="progress"><div class="progress-header"><span class="progress-label">${c.icon||'📦'} ${esc(c.name.length>22?c.name.substring(0,22)+'…':c.name)} ${c.over?'<span style="color:var(--red);font-size:11px">⚠️ over</span>':''}</span><span class="progress-value" style="color:${color}">${formatBudgetProgress(c.spent,c.budget)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(c.pct,100)}%;background:${color}"></div></div></div>`}).join('')}</div>`;
  }else{
    budgetAttCard.innerHTML='';
  }

  // Recent tx
  const recent=entries.slice(0,5);
  document.getElementById('recent-tx').innerHTML=recent.length?`<div class="tx-list">${recent.map(e=>{if(e.isDebtPayment){const ai=getAccountInfo(e.account);const payment=debtPayments.find(p=>p.id===e.debtPaymentId);return`<div class="tx-item"><div class="tx-icon cat-debt">💳</div><div class="tx-info"><div class="tx-name">Debt Payment</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}${ai.name?' · '+esc(ai.name):''}${getDebtPaymentFeeMeta(payment)}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}if(e.isGoalContribution){const ai=getAccountInfo(e.account);return`<div class="tx-item"><div class="tx-icon cat-savings">🎯</div><div class="tx-info"><div class="tx-name">Goal Contribution</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}${ai.name?' · '+esc(ai.name):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}const ci=getCatInfo(e.category);const clickAction=e.isDebtPaymentFee?'':` onclick="openEntryEdit(${e.id})"`;return`<div class="tx-item"${clickAction}><div class="tx-icon ${ci.colorClass}">${ci.icon||'📦'}</div><div class="tx-info"><div class="tx-name">${esc(e.category)}</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}).join('')}</div>`:'<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions yet</div></div>';

  setTooltipContent('tip-forecast','forecast');
  setTooltipContent('tip-upcoming','upcoming');
  setTooltipContent('tip-alerts','alerts');
  setTooltipContent('tip-budget-attention','budget_attention');
  setTooltipContent('tip-recent','recent');
  // Notifications
  const notificationItems=getNotificationItems(ac,catTotals,forecast);
  const notifList=document.getElementById('notif-list');
  if(notifList)notifList.innerHTML=notificationItems.length?notificationItems.map(n=>`<div class="notif-item ${n.type}"><div style="font-size:13px;font-weight:700;display:flex;gap:8px;align-items:center"><span>${n.icon}</span><span>${esc(n.title)}</span></div><div style="font-size:12px;color:var(--text2);margin-top:4px">${esc(n.detail)}</div></div>`).join(''):'<div class="empty"><div class="empty-icon">🔔</div><div class="empty-text">No notifications</div></div>';
  const notifBadge=document.getElementById('notif-badge');
  if(notifBadge){if(notificationItems.length){notifBadge.textContent=notificationItems.length>9?'9+':String(notificationItems.length);notifBadge.style.display='flex'}else notifBadge.style.display='none'}

  // === ANALYTICS (inside Show More) ===
  document.getElementById('stats-grid').innerHTML=[
    {l:'Today',v:fmtShort(todayTotal),color:'var(--accent)'},{l:'This Week',v:fmtShort(weekTotal),color:'var(--purple)'},
    {l:'Month Spent',v:fmtShort(monthTotal),color:'var(--amber)'},{l:'Daily Budget',v:daysLeft>0?fmtShort(dailyLeft):'—',color:dailyLeft<0?'var(--red)':'var(--green)',sub:daysLeft>0?`${daysLeft} days left`:'Month over'},
  ].map(s=>`<div class="stat-card"><div class="stat-label">${s.l}</div><div class="stat-value" style="color:${s.color}">${s.v}</div>${s.sub?`<div class="stat-change" style="color:var(--text3)">${s.sub}</div>`:''}</div>`).join('');

  // Health mini
  const hs=calcHealthScore();
  const circ=2*Math.PI*42;const offset=circ-(hs.total/100)*circ;
  document.getElementById('health-mini').innerHTML=`<div class="card" style="cursor:pointer" onclick="showTab('goals')"><div style="display:flex;align-items:center;gap:16px"><svg width="56" height="56" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="score-bg" stroke-width="7"/><circle cx="50" cy="50" r="42" fill="none" stroke="${hs.color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" class="score-fill"/><text x="50" y="50" class="score-text" font-size="22">${hs.total}</text></svg><div><div style="font-weight:700;font-size:14px;color:${hs.color}">${hs.grade}</div><div style="font-size:12px;color:var(--text3)">Financial Health Score</div></div></div></div>`;

  // Donut
  document.getElementById('donut-month').textContent=filterMonth;
  const donutData=ac.filter(c=>c.group!=='savings'&&(catTotals[c.name]||0)>0).map((c,i)=>({label:c.name,value:catTotals[c.name],color:CHART_COLORS[i%CHART_COLORS.length]}));
  if(donutData.length){const total=donutData.reduce((s,d)=>s+d.value,0);document.getElementById('donut-area').innerHTML=`<div class="donut-container">${makeDonutSVG(donutData,160)}<div class="donut-legend">${donutData.map(d=>`<div class="legend-item"><div class="legend-dot" style="background:${d.color}"></div><span class="legend-label">${esc(d.label.length>18?d.label.substring(0,18)+'…':d.label)}</span><span class="legend-value">${Math.round(d.value/total*100)}%</span></div>`).join('')}</div></div>`}else document.getElementById('donut-area').innerHTML='<div class="empty"><div class="empty-icon">📊</div><div class="empty-text">No spending recorded yet</div></div>';

  // Budget bars (full)
  document.getElementById('budget-bars').innerHTML=budgetProgressItems.length?budgetProgressItems.map(c=>{const pct=c.budget>0?Math.min(c.pct,100):0;const color=c.over?'var(--red)':pct>=80?'var(--amber)':'var(--green)';return`<div class="progress"><div class="progress-header"><span class="progress-label">${c.icon||'📦'} ${esc(c.name.length>22?c.name.substring(0,22)+'…':c.name)}</span><div class="budget-val-row"><span class="progress-value" style="color:${color}">${formatBudgetProgress(c.spent,c.budget)}</span><button class="budget-edit-btn" onclick="openBudgetInlineEdit(this,'${esc(c.name)}',${c.budget})" title="Edit budget">✏</button></div></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div></div>`}).join(''):'<div class="empty"><div class="empty-icon">📒</div><div class="empty-text">Set a budget or log spending to populate this list</div></div>';

  // Month chart
  const months=[];for(let i=5;i>=0;i--){const dt=new Date(now.getFullYear(),now.getMonth()-i,1);const key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;months.push({label:dt.toLocaleDateString('en-PH',{month:'short'}),total:entries.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+e.amount,0)})}const maxM=Math.max(...months.map(m=>m.total),1);
  document.getElementById('month-chart').innerHTML=`<div class="bar-chart">${months.map((m,i)=>`<div class="bar-row"><div class="bar-label">${m.label}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(m.total/maxM*100,2)}%;background:${i===5?'var(--accent)':'var(--text3)'};opacity:${i===5?1:.4}">${m.total/maxM>.15?fmtShort(m.total):''}</div></div><div class="bar-amount">${fmtShort(m.total)}</div></div>`).join('')}</div>`;

  // === FORMS ===
  buildCatSelect('f-cat');buildCatSelect('me-cat');
  buildAccountSelect('f-account',true,true);if(!document.getElementById('f-account').value)document.getElementById('f-account').value=getDefaultAccountKey();
  buildAccountSelect('inc-account',true);if(!document.getElementById('inc-account').value)document.getElementById('inc-account').value=getDefaultAccountKey();
  buildAccountSelect('me-account',true,true);buildAccountSelect('mi-account',true);buildAccountSelect('t-from',true);buildAccountSelect('t-to',true);buildCatSelect('r-cat');
  const xmBalDisplay=document.getElementById('xm-balance-display');if(xmBalDisplay)xmBalDisplay.textContent=fmt(Number(nwBalances['xm']||0));
  const meCat=document.getElementById('me-cat');if(meCat)meCat.onchange=toggleEditCustom;
  document.getElementById('quick-buttons').innerHTML=[{cat:"Groceries",icon:"🛒"},{cat:"Dining Out",icon:"🍽️"},{cat:"Food Delivery",icon:"🛵"},{cat:"Commute / Public Transport",icon:"🚌"},{cat:"Ride-Hailing",icon:"🚗"},{cat:"Miscellaneous / Buffer",icon:"📦"}].filter(q=>allCats().find(c=>c.name===q.cat)).map(q=>`<button class="quick-chip" onclick="quickAdd('${q.cat}')">${q.icon} ${q.cat}</button>`).join('');
  toggleCustom();renderExpenseTemplates();renderExpenseSuggestions();renderIncomeSuggestions();updateAddPreviews();

  // === HISTORY ===
  buildHistoryCategoryFilter(ac);
  renderHistoryQuickRanges();
  renderHistoryPresets();
  const histAcc=document.getElementById('hist-account');const curAcc=histAcc?.value||'all';
  if(histAcc){histAcc.innerHTML='<option value="all">All Accounts</option>'+nwAccounts.map(a=>`<option value="${a.key}">${a.icon} ${esc(a.name)}</option>`).join('');histAcc.value=curAcc}
  const histState=getHistoryState();
  const histGroupMode=getHistoryGroupMode();
  const historyActiveLabels=getHistoryActiveFilterLabels(histState,histGroupMode);
  let{expenseData:filtEnt,incomeData:filtInc,historyCards}=getFilteredHistoryData(histState);
  const expenseTotal=filtEnt.reduce((s,e)=>s+e.amount,0);const incomeTotal=filtInc.reduce((s,i)=>s+i.amount,0);
  const historySummary=getHistorySummaryMetrics(historyCards,expenseTotal,incomeTotal,histState);
  const visibleHistoryCards=getVisibleHistoryCards(historyCards,histState,histGroupMode);
  renderHistoryTopbar(histState,historySummary);
  document.getElementById('history-summary').innerHTML=`<div class="stats-grid" style="margin-bottom:12px"><div class="stat-card"><div class="stat-label">Results</div><div class="stat-value" style="font-size:18px">${historyCards.length}</div><div class="stat-change">${esc(historySummary.periodLabel)}</div></div><div class="stat-card"><div class="stat-label">Expenses</div><div class="stat-value" style="font-size:16px;color:var(--red)">${fmtSigned(-expenseTotal)}</div><div class="stat-change">${historySummary.spanDays?`Avg/day ${fmt(historySummary.avgSpendPerDay)}`:'No spend yet'}</div></div><div class="stat-card"><div class="stat-label">Income</div><div class="stat-value" style="font-size:16px;color:var(--green)">${fmtSigned(incomeTotal)}</div><div class="stat-change">${historySummary.spanDays?`${historySummary.spanDays} day${historySummary.spanDays===1?'':'s'} covered`:'No date range'}</div></div><div class="stat-card"><div class="stat-label">Net</div><div class="stat-value" style="font-size:16px;color:${historySummary.netTotal>=0?'var(--green)':'var(--red)'}">${fmtSigned(historySummary.netTotal)}</div><div class="stat-change">${historySummary.largest?`Largest: ${fmtSigned(historySummary.largest.kind==='income'?historySummary.largest.amount:-historySummary.largest.amount)}`:'No transactions yet'}</div></div></div>`;
  renderHistoryBulkBar(visibleHistoryCards);const hcEl=document.getElementById('history-content');
  hcEl.innerHTML=renderHistoryCardsContent(visibleHistoryCards,histGroupMode,historyCards.length);syncHistoryDrawerState();const ihEl=document.getElementById('income-history');
  const incomeHistoryCard=ihEl?.closest('.card');if(incomeHistoryCard)incomeHistoryCard.style.display=historyActiveLabels.length?'none':'';
  if(!incomes.length)ihEl.innerHTML='<div class="empty"><div class="empty-icon">💵</div><div class="empty-text">No extra income yet</div></div>';
  else{const incomeOnly=[...incomes];sortHistoryItems(incomeOnly,'newest');ihEl.innerHTML=`<div class="tx-list">${incomeOnly.slice(0,20).map(i=>{const clickAction=i.isSalaryDeposit?'':` onclick="openIncomeEdit(${i.id})"`;return`<div class="tx-item"${clickAction}><div class="tx-icon cat-income">💵</div><div class="tx-info"><div class="tx-name">${esc(i.source)}</div><div class="tx-meta">${formatDateTime(i)} · Received in ${esc(getAccountInfo(i.account||'cash').name)}${i.note?' · '+esc(i.note):''}</div></div><div class="tx-amount" style="color:var(--green)">+${fmt(i.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteIncome(${i.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}).join('')}</div>`}

  // === GOALS ===
  document.getElementById('health-score').innerHTML=buildHealthScoreHTML(hs);
  document.getElementById('goals-list').innerHTML=(()=>{
    if(!goals.length)return'<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">No goals yet</div></div>';
    const getGoalIcon=n=>{const l=n.toLowerCase();if(/house|home|bahay|condo|property/.test(l))return'🏠';if(/car|sasakyan/.test(l))return'🚗';if(/travel|trip|vacation|bakasyon|flight/.test(l))return'✈️';if(/phone|gadget|laptop|computer/.test(l))return'📱';if(/school|college|education|tuition/.test(l))return'🎓';if(/wedding|kasal|marriage/.test(l))return'💍';if(/invest|stock|mutual/.test(l))return'📈';if(/business|negosyo|capital/.test(l))return'💼';if(/emergency/.test(l))return'🛡️';if(/health|medical|hospital/.test(l))return'🏥';if(/saving|bank|deposit/.test(l))return'🏦';return'🎯';};
    return goals.map(g=>{
      const pct=g.target>0?Math.min(g.current/g.target*100,100):0;
      const left=Math.max(Number(g.target||0)-Number(g.current||0),0);
      const mo=g.monthly>0?Math.ceil(left/g.monthly):null;
      const barC=pct>=100?'var(--green)':pct>=66?'var(--accent)':pct>=33?'var(--blue)':'var(--amber)';
      const summary=getGoalContributionSummary(g.id);
      let etaStr='',etaDate=null;
      if(pct<100&&mo&&mo!==Infinity){const d=new Date();d.setMonth(d.getMonth()+mo);etaDate=d;etaStr=d.toLocaleDateString('en-PH',{month:'short',year:'numeric'});}
      let badgeText,badgeColor,badgeBg;
      if(pct>=100){badgeText='✓ Completed';badgeColor='var(--green)';badgeBg='var(--green-soft)';}
      else if(g.targetDate&&etaDate){const td=new Date(g.targetDate);const onTrack=etaDate<=td;badgeText=onTrack?'On Track':'Behind';badgeColor=onTrack?'var(--green)':'var(--red)';badgeBg=onTrack?'var(--green-soft)':'var(--red-soft)';}
      else if(g.monthly>0&&g.current>0){badgeText='In Progress';badgeColor='var(--accent)';badgeBg='var(--accent-soft)';}
      else if(g.monthly>0){badgeText='Planned';badgeColor='var(--blue)';badgeBg='var(--blue-soft)';}
      else{badgeText='Not Started';badgeColor='var(--text3)';badgeBg='var(--surface2)';}
      const tdFmt=g.targetDate?new Date(g.targetDate).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'';
      let velocityChip='';
      if(pct>=100)velocityChip='<span class="goal-velocity-chip" style="color:var(--green);background:var(--green-soft)">🎉 Reached!</span>';
      else if(etaDate&&g.targetDate){const td=new Date(g.targetDate);const moLate=Math.round((etaDate-td)/(864e5*30));velocityChip=etaDate<=td?'<span class="goal-velocity-chip" style="color:var(--green);background:var(--green-soft)">✓ On Track</span>':'<span class="goal-velocity-chip" style="color:var(--red);background:var(--red-soft)">⚠ '+moLate+' mo late</span>';}
      else if(!g.monthly&&pct<100)velocityChip='<span class="goal-velocity-chip" style="color:var(--text3);background:var(--surface2)">No ETA</span>';
      const etaChip=etaStr?'<span class="goal-eta-chip">📅 Est. '+etaStr+'</span>':'';
      const etaRow=etaStr||velocityChip?'<div class="goal-eta-row">'+etaChip+velocityChip+'</div>':'';
      const targetDateHtml=tdFmt?'<div class="goal-target-date">📅 Target: '+tdFmt+'</div>':'';
      const lastLine=summary.count&&summary.latest?'<div class="goal-last">Last: '+esc(formatDateTime(summary.latest))+' · <strong>'+fmt(summary.latest.amount)+'</strong>'+(summary.count>1?' · '+summary.count+' contributions':'')+'</div>':'';
      const goalIcon=getGoalIcon(g.name);
      const addLabel=g.monthly>0?'🎯 Add '+fmtShort(g.monthly):'🎯 Add';
      const lateMoStr=etaDate&&g.targetDate&&etaDate>new Date(g.targetDate)?Math.round((etaDate-new Date(g.targetDate))/(864e5*30))+' mo late':'';
      const etaLine=etaStr?'<div class="goal-eta-line">Est. completion: <strong>'+etaStr+'</strong>'+(lateMoStr?' · <span class="goal-eta-late">'+lateMoStr+'</span>':'')+'</div>':'';
      const lastContrib=summary.count&&summary.latest?'<div class="goal-last-line">Last: '+esc(formatDateTime(summary.latest))+' · <strong>'+fmt(summary.latest.amount)+'</strong>'+(summary.count>1?' · '+summary.count+' contributions':'')+'</div>':'';
      return`<div class="goal-card"><div class="goal-top"><div class="goal-top-left"><div class="goal-name">${goalIcon} ${esc(g.name)}</div>${tdFmt?'<div class="goal-target-date">📅 by '+tdFmt+'</div>':''}<div class="goal-badge-row"><span class="goal-status-badge" style="color:${badgeColor};background:${badgeBg}">${badgeText}</span>${velocityChip}</div></div><div class="goal-pct" style="color:${barC}">${pct.toFixed(0)}%</div></div><div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%;background:${barC}"></div><div class="goal-bar-tick" style="left:25%"></div><div class="goal-bar-tick" style="left:50%"></div><div class="goal-bar-tick" style="left:75%"></div></div><div class="goal-bar-labels"><span>${fmt(g.current)}</span><span>${fmt(g.target)}</span></div><div class="goal-stats"><div class="goal-stat goal-stat-saved"><div class="goal-stat-label">Saved</div><div class="goal-stat-val" style="color:var(--green)">${fmtShort(g.current||0)}</div></div><div class="goal-stat goal-stat-togo"><div class="goal-stat-label">To Go</div><div class="goal-stat-val">${fmtShort(left)}</div></div><div class="goal-stat goal-stat-monthly"><div class="goal-stat-label">Monthly</div><div class="goal-stat-val" style="color:${g.monthly>0?'var(--accent)':'var(--text3)'}">${g.monthly>0?fmtShort(g.monthly):'—'}</div></div></div>${etaLine}${lastContrib}<div class="goal-actions"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openGoalContribution(${g.id})">${addLabel}</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openGoalHistory(${g.id})">History</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openGoalEdit(${g.id})">Edit</button></div></div>`;
    }).join('');
  })();
  const _wishTotalCash=Object.values(nwBalances||{}).reduce((s,v)=>s+Number(v||0),0);
  // Monthly savings rate: salary minus average spending over last 3 months
  const _wishMonthlySavings=(()=>{
    let total=0,count=0;
    for(let i=1;i<=3;i++){
      const d=new Date(filterMonth+'-01T00:00:00');d.setMonth(d.getMonth()-i);
      const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const spent=getMonthSpent(mk);
      if(spent>0){total+=spent;count++;}
    }
    const avgSpent=count>0?total/count:Number(salary||0)*0.8;
    return Math.max(Number(salary||0)-avgSpent,0);
  })();
  document.getElementById('wishlist').innerHTML=wishlist.length?wishlist.map(w=>{
    const days=Math.floor((new Date()-new Date(w.addedDate))/864e5);
    const addedFmt=new Date(w.addedDate).toLocaleDateString('en-PH',{month:'short',day:'numeric'});
    const pc={Low:'var(--text3)',Medium:'var(--amber)',Want:'var(--accent)','Need Soon':'var(--red)'};
    const pb={Low:'var(--surface2)',Medium:'var(--amber-soft)',Want:'var(--accent-soft)','Need Soon':'var(--red-soft)'};
    const bc=pc[w.priority]||'var(--text3)';const bbg=pb[w.priority]||'var(--surface2)';
    const price=Number(w.price||0);
    const canAfford=_wishTotalCash>=price;
    const needed=Math.max(price-_wishTotalCash,0);
    const affordBadge=price>0?(canAfford?`<span style="font-size:11px;font-weight:700;color:var(--green);background:var(--green-soft);padding:3px 8px;border-radius:999px">✓ Affordable</span>`:`<span style="font-size:11px;font-weight:700;color:var(--amber);background:var(--amber-soft);padding:3px 8px;border-radius:999px">${fmtShort(needed)} more needed</span>`):'';
    // Affordability timeline
    let affordHint='';
    if(price>0&&!canAfford){
      if(_wishMonthlySavings>0){
        const months=Math.ceil(needed/_wishMonthlySavings);
        const eta=new Date();eta.setMonth(eta.getMonth()+months);
        const etaLabel=eta.toLocaleDateString('en-PH',{month:'short',year:'numeric'});
        const mo=months===1?'~1 month':`~${months} months`;
        affordHint=`<div class="wish-afford-hint"><span class="wish-afford-icon">🗓</span><span class="wish-afford-text">${mo} at current savings rate · <strong>${etaLabel}</strong></span></div>`;
      } else {
        affordHint=`<div class="wish-afford-hint wish-afford-hint-warn"><span class="wish-afford-icon">⚠️</span><span class="wish-afford-text">Increase your monthly savings to reach this</span></div>`;
      }
    }
    return`<div class="wish-card" style="display:block;border-left:3px solid ${bc}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:5px"><div style="font-weight:700;font-size:14px">${esc(w.name)}</div><span style="font-size:11px;font-weight:700;color:${bc};background:${bbg};padding:3px 8px;border-radius:999px;white-space:nowrap;flex-shrink:0">${w.priority}</span></div><div style="font-size:11px;color:var(--text3);margin-bottom:10px">Added ${addedFmt} · ${days===0?'today':days+'d ago'}</div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:${affordHint?'8px':'12px'}"><div style="font-size:20px;font-weight:800;color:var(--amber)">${fmt(price)}</div>${affordBadge}</div>${affordHint?affordHint+'<div style="height:12px"></div>':''}<div style="display:flex;gap:8px"><button class="btn btn-sm btn-primary" style="flex:1" onclick="event.stopPropagation();buyWish(${w.id})">🛒 Buy Now</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();deleteWish(${w.id})">Remove</button></div></div>`;
  }).join(''):'<div class="empty"><div class="empty-icon">🛒</div><div class="empty-text">Wishlist empty 🏆</div></div>';
  const efM=budgets['Emergency Fund (Digital Bank)']||0;const ef3=monthlyExp*3,ef6=monthlyExp*6;const efG=goals.find(g=>g.name.toLowerCase().includes('emergency'));if(efG&&ef6>0&&Math.round(efG.target||0)!==Math.round(ef6)){efG.target=Math.round(ef6);saveData();}const efC=efG?efG.current:0;const efProgress=ef6>0?Math.min(efC/ef6*100,100):0;const efGap=Math.max(ef6-efC,0);const efGap3=Math.max(ef3-efC,0);const efSafeExtra=Math.max(Math.min(Math.floor(Math.max(forecast.projectedBalance,0)*0.35/100)*100,efGap),0);const efMonthsLeft=efM>0&&efGap>0?Math.ceil(efGap/efM):0;const efMonthsCovered=monthlyExp>0?Math.min(efC/monthlyExp,6):0;const efBarColor=efC>=ef6?'var(--green)':efC>=ef3?'var(--blue)':efC>0?'var(--accent)':'var(--border)';const efBadgeText=efC>=ef6?'Fully Covered':efC>=ef3?'Basic Safety Reached':efC>0?'Building':'Not Started';const efBadgeColor=efC>=ef6?'var(--green)':efC>=ef3?'var(--blue)':efC>0?'var(--amber)':'var(--text3)';const efBadgeBg=efC>=ef6?'var(--green-soft)':efC>=ef3?'var(--blue-soft)':efC>0?'var(--amber-soft)':'var(--surface2)';const efEtaStr=efM>0&&efGap>0?(()=>{const d=new Date();d.setMonth(d.getMonth()+Math.ceil(efGap/efM));return d.toLocaleDateString('en-PH',{month:'short',year:'numeric'})})():null;const efActionBtns=efG?`<button class="btn btn-sm btn-primary" onclick="openGoalContribution(${efG.id})">🎯 Add Money</button><button class="btn btn-sm btn-ghost" onclick="openGoalHistory(${efG.id})">View History</button>`:`<button class="btn btn-primary" onclick="document.getElementById('g-name').value='Emergency Fund';document.getElementById('g-target').value=${Math.round(ef6)};document.getElementById('g-current').value=0;document.getElementById('g-monthly').value=${Math.round(efM||1000)};openModal('modal-add-goal')">Create Emergency Fund Goal</button>`;document.getElementById('ef-calc').innerHTML=`<div style="display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px">Coverage</div><div style="font-size:26px;font-weight:800;line-height:1">${efMonthsCovered.toFixed(1)}<span style="font-size:14px;font-weight:600;color:var(--text3)"> / 6 months</span></div>${efC>0?`<div style="font-size:13px;color:var(--text2);margin-top:3px">${fmt(efC)} saved</div>`:''}</div><span style="font-size:11px;font-weight:700;color:${efBadgeColor};background:${efBadgeBg};padding:5px 10px;border-radius:999px;white-space:nowrap;flex-shrink:0">${efBadgeText}</span></div><div style="position:relative;height:14px;margin-bottom:24px"><div style="height:14px;background:var(--border);border-radius:7px;overflow:hidden"><div style="height:100%;width:${efProgress}%;background:${efBarColor};border-radius:7px;transition:width .4s"></div></div><div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);width:2px;height:18px;background:var(--amber);border-radius:1px;opacity:.8"></div><div style="position:absolute;top:17px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--amber);font-weight:700;white-space:nowrap">3 months</div><div style="position:absolute;top:17px;right:0;font-size:10px;color:var(--text3);white-space:nowrap">${fmtShort(ef6)}</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"><div style="padding:8px 6px;background:var(--surface2);border-radius:var(--radius-xs);text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Saved</div><div style="font-size:12px;font-weight:700;color:${efC>0?'var(--green)':'var(--text2)'}">${fmtShort(efC)||'₱0'}</div></div><div style="padding:8px 6px;background:var(--surface2);border-radius:var(--radius-xs);text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">To 3 months</div><div style="font-size:12px;font-weight:700;color:${efC>=ef3?'var(--green)':'inherit'}">${efC>=ef3?'✓ Done':fmtShort(efGap3)}</div></div><div style="padding:8px 6px;background:var(--surface2);border-radius:var(--radius-xs);text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">To 6 months</div><div style="font-size:12px;font-weight:700;color:${efC>=ef6?'var(--green)':'inherit'}">${efC>=ef6?'✓ Done':fmtShort(efGap)}</div></div></div>${efM>0?`<div style="font-size:12px;color:var(--text2);padding:10px 12px;background:var(--surface2);border-radius:var(--radius-xs)">Monthly budget: <strong>${fmtShort(efM)}</strong>${efEtaStr?` · Full coverage est. <strong>${efEtaStr}</strong>`:efC>=ef6?' · Goal reached 🎉':' · Not enough to cover fully'}</div>`:`<div style="font-size:12px;color:var(--amber);padding:10px 12px;background:var(--amber-soft);border-radius:var(--radius-xs)">Set a monthly budget in Settings to see your coverage timeline.</div>`}<div style="display:flex;gap:8px;flex-wrap:wrap">${efActionBtns}</div></div>`;

  // === DEBTS ===

  const activeDebts=getActiveDebts();
  const paidOffDebts=getPaidOffDebts();
  const renderDebtCard=(d,paidOff=false)=>{
    const remaining=Math.max(Number(d.total||0),0);
    const plannedPayment=Number(d.payment||0);
    const minDue=Number(d.minDue||0);
    const mo=plannedPayment>0?Math.ceil(remaining/plannedPayment):Infinity;
    const isTarget=!paidOff&&debtPayoffData.targetDebt&&debtPayoffData.targetDebt.id===d.id;
    const strategyBadge=debtPayoffSettings.method==='minimum'?'Minimum':debtPayoffSettings.method==='avalanche'?'Avalanche target':'Snowball target';
    const isPaid=d.lastPaidMonth===currentMonthKey();
    const paymentSummary=getDebtPaymentSummary(d.id);
    const latest=paymentSummary.latest;
    const clearedDate=d.lastPaidDate||(latest&&latest.date)||'';
    const debtProduct=esc(d.product||d.type||'Debt');
    const badges=[];
    if(isTarget)badges.push(`<span class="debt-badge debt-badge-accent">${strategyBadge}</span>`);
    if(paidOff)badges.push('<span class="debt-badge debt-badge-green">Paid Off</span>');
    else if(isPaid)badges.push('<span class="debt-badge debt-badge-green">Paid this month</span>');

    let deadlineBanner='';
    if(d.deadline&&!paidOff){
      const dl=new Date(d.deadline);
      dl.setHours(0,0,0,0);
      const td=new Date();
      td.setHours(0,0,0,0);
      const daysLeft=Math.round((dl-td)/864e5);
      const dlFmt=dl.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
      let dlColor,dlBg,dlLabel;
      if(daysLeft<0){dlColor='var(--red)';dlBg='var(--red-soft)';dlLabel=`Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft)!==1?'s':''}`;}
      else if(daysLeft===0){dlColor='var(--red)';dlBg='var(--red-soft)';dlLabel='Due today';}
      else if(daysLeft<=7){dlColor='var(--red)';dlBg='var(--red-soft)';dlLabel=`${daysLeft} day${daysLeft!==1?'s':''} left`;}
      else if(daysLeft<=30){dlColor='var(--amber)';dlBg='var(--amber-soft)';dlLabel=`${daysLeft} days left`;}
      else{dlColor='var(--green)';dlBg='var(--green-soft)';dlLabel=`${daysLeft} days left`;}
      deadlineBanner=`<div class="debt-deadline" style="background:${dlBg};color:${dlColor}"><div class="debt-deadline-label">Pay by ${dlFmt}</div><div class="debt-deadline-chip" style="border-color:${dlColor};color:${dlColor}">${dlLabel}</div></div>`;
    }

    const totalPaid=paymentSummary.total||0;
    const originalTotal=remaining+totalPaid;
    const paidPct=originalTotal>0?Math.min(totalPaid/originalTotal*100,100):0;
    const borderColor=paidOff?'var(--green)':isPaid?'var(--amber)':'var(--red)';
    const balanceColor=paidOff?'var(--green)':'var(--red)';
    const progressBar=!paidOff&&originalTotal>0&&totalPaid>0?`<div class="debt-progress"><div class="debt-progress-head"><span>Progress</span><span>${Math.round(paidPct)}% paid</span></div><div class="debt-progress-track"><div class="debt-progress-fill" style="width:${paidPct}%"></div></div></div>`:paidOff?`<div class="debt-progress debt-progress-paid"><div class="debt-progress-track"><div class="debt-progress-fill" style="width:100%"></div></div></div>`:'';

    const summaryBody=paymentSummary.count
      ?`<div class="debt-summary-body">${paidOff&&clearedDate?`<div class="debt-summary-row"><span>Paid off on</span><strong>${esc(formatDateTime({date:clearedDate}))}</strong></div>`:''}<div class="debt-summary-row"><span>Last payment</span><strong>${esc(formatDateTime(latest))} · ${fmt(latest.amount)}${getDebtPaymentFeeMeta(latest)}</strong></div><div class="debt-summary-row"><span>Total paid</span><strong>${fmt(paymentSummary.total)}</strong></div><div class="debt-summary-row"><span>History</span><strong>${paymentSummary.count} payment${paymentSummary.count!==1?'s':''}</strong></div></div>`
      :`<div class="debt-summary-empty">${paidOff?'No payment history saved':'No payments yet'}</div>`;

    const _mr=(extra,label,val)=>`<div class="debt-metric-row${extra}"><span class="debt-metric-label">${label}</span><span class="debt-metric-value">${val}</span></div>`;
    const metricCards=paidOff
      ?[
        _mr('','Status',clearedDate?`Paid off ${esc(formatDateTime({date:clearedDate}))}`:'Balance cleared'),
        _mr(d.lastPaidAmount?'':' debt-metric-empty','Last payment',d.lastPaidAmount?fmt(d.lastPaidAmount):'Not saved')
      ]
      :[
        _mr(plannedPayment?'':' debt-metric-warn','Planned',plannedPayment?`${fmt(plannedPayment)}/mo`:'No plan yet'),
        _mr(minDue?'':' debt-metric-empty','Min due',minDue?fmt(minDue):'Not set'),
        _mr(d.due?'':' debt-metric-empty','Due date',d.due?esc(d.due):'Not set'),
        _mr(plannedPayment?'':' debt-metric-warn','Payoff pace',plannedPayment>0?`~${mo} mo`:'Need payment plan'),
        _mr(d.interest?'':' debt-metric-empty','APR',d.interest?`${esc(String(d.interest))}%`:'0% / not set'),
        _mr(d.lenderType?'':' debt-metric-empty','Lender',d.lenderType?esc(d.lenderType):'Not set'),
        _mr(d.lateFeeRisk==='High'?' debt-metric-danger':d.lateFeeRisk==='Medium'?' debt-metric-warn':d.lateFeeRisk?'':' debt-metric-empty','Late fee risk',d.lateFeeRisk?esc(d.lateFeeRisk):'Not set'),
        _mr(totalPaid?'':' debt-metric-empty','Paid so far',totalPaid>0?fmt(totalPaid):'No payments yet')
      ];

    const _proj=!paidOff&&remaining>0?getDebtPayoffProjection(remaining,Number(d.payment||0),Number(d.interest||0)):null;
    const payoffSection=_proj&&_proj.isViable&&_proj.months>0?(()=>{
      const eta=_proj.payoffDate.toLocaleDateString('en-PH',{month:'short',year:'numeric'});
      const moLabel=_proj.months===1?'1 month':`${_proj.months} months`;
      const interestNote=_proj.totalInterest>0?`<span class="debt-tl-interest">+${fmtShort(_proj.totalInterest)} in interest</span>`:'<span class="debt-tl-interest debt-tl-interest-free">No interest</span>';
      return`<div class="debt-timeline"><div class="debt-tl-header"><span class="debt-tl-title">Payoff Timeline</span><span class="debt-tl-eta">${eta}</span></div><div class="debt-tl-bar-wrap"><div class="debt-tl-bar-track"><div class="debt-tl-bar-fill" style="width:${Math.max(paidPct,0)}%"></div></div><div class="debt-tl-bar-labels"><span>Now</span><span>${eta}</span></div></div><div class="debt-tl-meta"><span>~${moLabel} remaining</span>${interestNote}</div></div>`;
    })():'';

    const actionsHtml=paidOff
      ?`<div class="debt-actions"><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtEdit(${d.id})">Edit</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtHistory(${d.id})">View History</button></div>`
      :`<div class="debt-actions"><button class="btn btn-sm btn-primary debt-action-log" onclick="event.stopPropagation();openDebtPayment(${d.id})">Log Payment</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtEdit(${d.id})">Edit</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtHistory(${d.id})">View History</button></div>`;
    const typeIcon=((t)=>t.includes('credit')?'💳':t.includes('loan')?'🏦':t.includes('friend')||t.includes('family')?'👤':'📋')((d.product||d.type||'').toLowerCase());
    const cardStatusClass=paidOff?'debt-card-cleared':isPaid?'debt-card-paid-month':'debt-card-active';
    return`<div id="debt-card-${d.id}" class="debt-card debt-card-redesign ${cardStatusClass}" style="border-left:2px solid ${borderColor};opacity:${paidOff?'.7':'1'}"><div class="debt-card-toggle" onclick="this.closest('.debt-card').classList.toggle('open')"><div class="debt-card-icon-col"><span>${typeIcon}</span></div><div class="debt-card-title"><div class="debt-card-name-row"><span class="debt-card-name">${esc(d.name)}</span></div><div class="debt-card-meta-row"><span class="debt-card-type">${debtProduct}</span>${badges.join('')}</div></div><div class="debt-card-toggle-right"><div class="debt-card-balance"><div class="debt-card-amount" style="color:${balanceColor}">${fmt(remaining)}</div>${!paidOff&&totalPaid>0?`<div class="debt-card-subamount">${fmtShort(totalPaid)} paid</div>`:''}</div><div class="debt-card-chevron"></div></div></div>${paidPct>0?`<div class="debt-card-mini-bar"><div class="debt-card-mini-fill" style="width:${paidPct}%"></div></div>`:''}<div class="debt-card-body"><div class="debt-card-body-inner">${progressBar}${deadlineBanner}<div class="debt-metrics-list">${metricCards.join('')}</div>${payoffSection}${actionsHtml}<div class="debt-summary"><div class="debt-summary-title">Payment Summary</div>${summaryBody}</div></div></div></div>`;
  };
  if(debts.length){
    const _dp=debtPayoffData;const _m=debtPayoffSettings.method||'snowball';const _chipStyle=(k)=>_m===k?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':'';
    const _recBanner=activeDebts.length&&!_dp.isOnRec?`<div style="padding:10px 12px;background:var(--amber-soft);border-radius:var(--radius-xs);border-left:3px solid var(--amber)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><div style="font-size:12px;font-weight:700;color:var(--amber);margin-bottom:3px">💡 Recommended: ${_dp.recMethod==='avalanche'?'Avalanche':_dp.recMethod==='snowball'?'Snowball':'Minimum Only'}</div><div style="font-size:12px;color:var(--text2);line-height:1.5">${_dp.recReason}</div></div><button class="btn btn-sm" style="font-size:11px;white-space:nowrap;background:var(--amber);color:#fff;border:none;flex-shrink:0" onclick="setDebtPayoffMethod('${_dp.recMethod}')">Switch</button></div></div>`:(activeDebts.length&&_dp.isOnRec?`<div style="padding:10px 12px;background:var(--green-soft);border-radius:var(--radius-xs)"><div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:2px">✓ Optimal strategy selected</div><div style="font-size:12px;color:var(--text2)">${_dp.recReason}</div></div>`:'');
    const _actionPlan=activeDebts.length?(_dp.targetDebt?`<div style="padding:12px;background:var(--surface2);border-radius:var(--radius-xs)"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">This month's focus</div><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px"><div><div style="font-size:14px;font-weight:800">${esc(_dp.targetDebt.name)}</div><div style="font-size:12px;color:var(--text3);margin-top:2px">${_m==='avalanche'?`Highest APR${_dp.targetDebt.interest?` · ${_dp.targetDebt.interest}%`:''}`:_m==='snowball'?`Smallest balance`:'Target'} · ${fmtShort(Number(_dp.targetDebt.total||0))} remaining</div></div></div>${_dp.extraPayment>0?`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--border)"><div style="font-size:12px;color:var(--text2)">Safe extra to add</div><div style="font-size:13px;font-weight:700;color:var(--accent)">+${fmtShort(_dp.extraPayment)}</div></div>`:''}<div style="display:flex;gap:6px;margin-top:4px">${_dp.targetMonthsWithExtra&&_dp.extraPayment>0?`<div style="flex:1;padding:8px;background:var(--accent-soft);border-radius:var(--radius-xs);text-align:center"><div style="font-size:10px;color:var(--accent);font-weight:700;text-transform:uppercase">With extra</div><div style="font-size:15px;font-weight:800;color:var(--accent)">${_dp.targetMonthsWithExtra} mo</div></div>`:''}<div style="flex:1;padding:8px;background:var(--surface);border-radius:var(--radius-xs);text-align:center;border:1px solid var(--border)"><div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase">Min only</div><div style="font-size:15px;font-weight:800;color:var(--text2)">${_dp.targetMonthsMinOnly??'—'} mo</div></div></div></div>`:`<div style="padding:12px;background:var(--surface2);border-radius:var(--radius-xs);font-size:13px;color:var(--text2)">Pay minimums on all ${activeDebts.length} active debts.</div>`):'';
    const _riskRow=_dp.riskFlags&&_dp.riskFlags.length?`<div style="padding:10px 12px;background:var(--red-soft);border-radius:var(--radius-xs);font-size:12px;color:var(--red);font-weight:600">⚠️ ${_dp.riskFlags[0]}</div>`:'';
    document.getElementById('debt-summary').innerHTML=`<div style="display:grid;gap:10px;margin-bottom:14px"><div style="display:flex;gap:10px"><div style="flex:1;padding:12px;background:var(--red-soft);border-radius:var(--radius-xs);text-align:center"><div style="font-size:11px;color:var(--text3)">Total Owed</div><div style="font-size:18px;font-weight:800;color:var(--red)">${fmtShort(totalDebt)}</div></div><div style="flex:1;padding:12px;background:var(--surface2);border-radius:var(--radius-xs);text-align:center"><div style="font-size:11px;color:var(--text3)">Monthly Minimums</div><div style="font-size:18px;font-weight:800">${fmtShort(_dp.monthlyMinimum)}</div></div></div><div class="card" style="padding:14px;margin:0;display:grid;gap:12px"><div><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Strategy</div><div class="quick-actions" style="margin-bottom:8px"><button class="quick-chip" style="${_chipStyle('minimum')}" onclick="setDebtPayoffMethod('minimum')">Minimum Only</button><button class="quick-chip" style="${_chipStyle('snowball')}" onclick="setDebtPayoffMethod('snowball')">Snowball</button><button class="quick-chip" style="${_chipStyle('avalanche')}" onclick="setDebtPayoffMethod('avalanche')">Avalanche</button></div><div style="font-size:12px;color:var(--text3)">${_dp.methodDesc}</div></div>${_recBanner}${_actionPlan}${_riskRow}</div></div>`;
    const _debtGroupMeta={credit_card:{label:'Credit Cards',icon:'💳'},loan:{label:'Loans',icon:'🏦'},friend_family:{label:'Friend / Family',icon:'👤'},other:{label:'Other',icon:'📋'}};
    const _debtGroupOrder=['credit_card','loan','friend_family','other'];
    function _debtGroupKey(d){const t=(d.product||d.type||'').toLowerCase();if(t.includes('credit'))return'credit_card';if(t.includes('loan')||t.includes('personal')||t.includes('bill'))return'loan';if(t.includes('friend')||t.includes('family'))return'friend_family';return'other';}
    const _groupedActive={};
    activeDebts.forEach(d=>{const g=_debtGroupKey(d);(_groupedActive[g]=_groupedActive[g]||[]).push(d);});
    const _activeGroupsHtml=_debtGroupOrder.filter(g=>_groupedActive[g]).map(g=>{
      const gDebts=_groupedActive[g];const gMeta=_debtGroupMeta[g];
      const gTotal=gDebts.reduce((s,d)=>s+Number(d.total||0),0);
      return`<div class="debt-group"><div class="debt-group-header"><span class="debt-group-icon">${gMeta.icon}</span><span class="debt-group-label">${gMeta.label}</span><span class="debt-group-count">${gDebts.length}</span><span class="debt-group-total">${fmtShort(gTotal)}</span></div><div class="debt-group-body">${gDebts.map(d=>renderDebtCard(d)).join('')}</div></div>`;
    }).join('');
    document.getElementById('debt-list').innerHTML=`${activeDebts.length?_activeGroupsHtml:`<div class="card" style="padding:16px;margin:0 0 12px"><div style="font-size:13px;font-weight:700;color:var(--green)">No active debts right now</div><div style="font-size:12px;color:var(--text2);margin-top:6px">Your cleared accounts stay below in Paid Off so the history is still easy to find.</div></div>`}${paidOffDebts.length?`<div style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 10px;display:flex;align-items:center;justify-content:space-between;gap:10px"><span>Paid Off</span><span style="padding:4px 8px;border-radius:999px;background:var(--green-soft);color:var(--green)">${paidOffDebts.length}</span></div>${paidOffDebts.map(d=>renderDebtCard(d,true)).join('')}`:''}`;
  }

  // === MORE ===
  const _assetAccts=nwAccounts.filter(a=>a.accountType!=='credit_card');
  const _ccAccts=nwAccounts.filter(a=>a.accountType==='credit_card');
  const nwT=_assetAccts.reduce((s,a)=>s+Number(nwBalances[a.key]||0),0);
  const _nwCC=_ccAccts.reduce((s,a)=>s+Number(nwBalances[a.key]||0),0);
  const _linkedDebtIds=new Set(_ccAccts.filter(a=>a.linkedDebtId).map(a=>String(a.linkedDebtId)));
  const _unlinkedDebt=debts.reduce((s,d)=>_linkedDebtIds.has(String(d.id))?s:s+Number(d.total||0),0);
  const netW=nwT-_nwCC-_unlinkedDebt;
  const _assetRows=_assetAccts.map(a=>{const bal=Number(nwBalances[a.key]||0);const pct=nwT>0?Math.round(bal/nwT*100):0;return`<div class="nw-account"><div class="nw-name">${a.icon} ${esc(a.name)}${bal>0&&nwT>0?`<span class="nw-pct">${pct}%</span>`:''}</div><div class="nw-row-actions"><span class="nw-currency">₱</span><input type="number" class="nw-input" id="nw-${a.key}" value="${bal}" placeholder="0"><button class="nw-edit-btn" onclick="openNetWorthEdit('${a.key}')" title="Edit">✏️</button></div></div>`;}).join('');
  const _ccRows=_ccAccts.length?`<div class="nw-section-label">Credit Cards</div>`+_ccAccts.map(a=>{const bal=Number(nwBalances[a.key]||0);const limit=Number(a.creditLimit||0);const available=limit>0?Math.max(limit-bal,0):null;const usedPct=limit>0?Math.min(bal/limit*100,100):0;const linkedDebt=a.linkedDebtId?debts.find(d=>String(d.id)===String(a.linkedDebtId)):null;return`<div class="nw-account nw-account-cc"><div class="nw-cc-main"><div class="nw-name">${a.icon} ${esc(a.name)}${linkedDebt?`<span class="nw-cc-linked">linked</span>`:''}</div>${limit>0?`<div class="nw-cc-bar-wrap"><div class="nw-cc-bar-track"><div class="nw-cc-bar-fill" style="width:${usedPct}%;background:${usedPct>=90?'var(--red)':usedPct>=70?'var(--amber)':'var(--accent)'}"></div></div><div class="nw-cc-bar-labels"><span>${fmt(bal)} used</span><span>${fmt(limit)} limit</span></div></div>`:''}</div><div class="nw-row-actions nw-cc-right"><div><span class="nw-amount-cc">${fmt(bal)}</span>${available!==null?`<div class="nw-cc-available">${fmt(available)} left</div>`:''}</div><button class="nw-edit-btn" onclick="openNetWorthEdit('${a.key}')" title="Edit">✏️</button></div></div>`;}).join(''):'';
  document.getElementById('nw-inputs').innerHTML=nwAccounts.length?(_assetRows||'')+(_ccRows||''):'<div class="empty"><div class="empty-icon">🏦</div><div class="empty-text">Add your first account</div></div>';
  const _nwDisplayDebt=_nwCC+_unlinkedDebt;const _nwBarTotal=nwT+_nwDisplayDebt;const _assetPct=_nwBarTotal>0?Math.max(nwT/_nwBarTotal*100,0):50;const _debtPct=_nwBarTotal>0?Math.max(_nwDisplayDebt/_nwBarTotal*100,0):50;const _nwMsg=netW>=0?`You own ${fmtShort(netW)} more than you owe`:`Debts exceed assets by ${fmtShort(Math.abs(netW))}`;
  document.getElementById('nw-total').innerHTML=`<div style="margin-top:14px"><div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px"><span>Assets <strong style="color:var(--blue)">${fmtShort(nwT)}</strong></span><span>Debts <strong style="color:var(--red)">${fmtShort(_nwDisplayDebt)}</strong></span></div><div style="height:5px;background:var(--border);border-radius:999px;overflow:hidden;display:flex"><div style="width:${_assetPct}%;background:var(--blue);opacity:.7;transition:width .4s;flex-shrink:0;min-width:${nwT>0?4:0}px"></div><div style="width:${_debtPct}%;background:var(--red);opacity:.7;flex-shrink:0;min-width:${totalDebt>0?4:0}px"></div></div></div><div style="text-align:center;padding:6px 0 2px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Net Worth</div><div style="font-size:24px;font-weight:800;color:${netW>=0?'var(--green)':'var(--red)'};margin:4px 0">${fmt(netW)}</div><div style="font-size:11px;color:var(--text3)">${_nwMsg}</div></div></div>`;
  const nhEl=document.getElementById('nw-chart');
  if(!nwHistory.length)nhEl.innerHTML='<div class="empty"><div class="empty-text">Save balances to start tracking</div></div>';
  else{const mx=Math.max(...nwHistory.map(h=>Math.abs(h.net||h.total)),1);nhEl.innerHTML=`<div class="bar-chart">${nwHistory.slice(-8).map((h,i,a)=>{const v=h.net!==undefined?h.net:h.total;const dt=new Date(h.month+'-01');return`<div class="bar-row"><div class="bar-label">${dt.toLocaleDateString('en-PH',{month:'short'})}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(Math.abs(v)/mx*100,3)}%;background:${i===a.length-1?'var(--green)':'var(--text3)'};opacity:${i===a.length-1?1:.35}">${Math.abs(v)/mx>.15?fmtShort(v):''}</div></div><div class="bar-amount">${fmtShort(v)}</div></div>`}).join('')}</div>`}
  renderTransferHistory()

  // Yearly
  document.getElementById('year-label').textContent=viewYear;
  const yE=entries.filter(e=>e.date.startsWith(viewYear+''));const yI=incomes.filter(i=>i.date.startsWith(viewYear+''));
  const ySpent=yE.reduce((s,e)=>s+e.amount,0);const yEarned=salary*12+yI.reduce((s,i)=>s+i.amount,0);
  const yMonths=[];for(let m=0;m<12;m++){const key=`${viewYear}-${String(m+1).padStart(2,'0')}`;yMonths.push({label:new Date(viewYear,m).toLocaleDateString('en-PH',{month:'short'}),total:entries.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+e.amount,0)})}
  const best=yMonths.reduce((a,b)=>a.total<b.total&&a.total>0?a:(b.total>0?b:a),yMonths[0]);
  const worst=yMonths.reduce((a,b)=>a.total>b.total?a:b,yMonths[0]);
  const ySaved=yEarned-ySpent;const yRate=yEarned>0?Math.round(ySaved/yEarned*100):0;const yActiveMonths=yMonths.filter(m=>m.total>0).length||1;const yAvgMo=Math.round(ySpent/yActiveMonths);
  document.getElementById('year-stats').innerHTML=[{l:'Earned',v:fmtShort(yEarned),c:'var(--green)'},{l:'Spent',v:fmtShort(ySpent),c:'var(--red)'},{l:'Saved',v:fmtShort(ySaved),c:ySaved>=0?'var(--blue)':'var(--red)'},{l:'Rate',v:yRate+'%',c:yRate>=20?'var(--green)':yRate>=10?'var(--amber)':'var(--red)'},{l:'Best Mo.',v:best.total>0?best.label:'—',c:'var(--green)'},{l:'Avg/Mo',v:yAvgMo>0?fmtShort(yAvgMo):'—',c:'var(--text2)'}].map(s=>`<div class="stat-card"><div class="stat-label">${s.l}</div><div class="stat-value" style="color:${s.c}">${s.v}</div></div>`).join('');
  const yMax=Math.max(...yMonths.map(m=>m.total),1);
  document.getElementById('year-chart').innerHTML=`<div class="year-section-label">Monthly Spending</div><div class="bar-chart">${yMonths.map((m,i)=>`<div class="bar-row"><div class="bar-label">${m.label}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(m.total/yMax*100,1)}%;background:${m.total===worst.total&&m.total>0?'var(--red)':m.total===best.total&&m.total>0?'var(--green)':'var(--accent)'};opacity:${m.total>0?.55:.15}"></div></div><div class="bar-amount">${m.total?fmtShort(m.total):'-'}</div></div>`).join('')}</div>`;
  const yCT={};yE.filter(e=>!e.isDebtPayment).forEach(e=>{yCT[e.category]=(yCT[e.category]||0)+e.amount});const topC=Object.entries(yCT).sort((a,b)=>b[1]-a[1]).slice(0,5);const tcM=topC.length?topC[0][1]:1;const tcTotal=topC.reduce((s,[,v])=>s+v,0);
  document.getElementById('year-top').innerHTML=topC.length?`<div class="year-section-label">Top Categories</div><div class="bar-chart">${topC.map((t,i)=>{const pct=tcTotal>0?Math.round(t[1]/tcTotal*100):0;return`<div class="bar-row"><div class="bar-label" style="width:60px;font-size:10px">${esc(t[0].substring(0,12))}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(t[1]/tcM*100,5)}%;background:${CHART_COLORS[i]};opacity:.7"></div></div><div class="bar-amount" style="min-width:64px;text-align:right">${fmtShort(t[1])} <span style="font-size:10px;color:var(--text3)">${pct}%</span></div></div>`}).join('')}</div>`:'';

  // Journal
  document.getElementById('journal-list').innerHTML=journal.length?journal.map(j=>{const wc=(j.note||'').split(/\s+/).filter(w=>w).length;return`<div class="journal-card" style="border-left:3px solid var(--accent-soft)"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px"><div><div class="journal-date">${esc(j.month||'')} · ${esc(j.date)}</div>${j.title?`<div class="journal-title">${esc(j.title)}</div>`:''}</div><div style="display:flex;align-items:center;gap:8px;flex-shrink:0"><span style="font-size:10px;color:var(--text3)">${wc} word${wc!==1?'s':''}</span><button class="btn-icon" onclick="deleteJournal(${j.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div></div><div class="journal-text" style="color:var(--text2);line-height:1.5">${esc(j.note)}</div></div>`}).join(''):'<div class="empty"><div class="empty-icon">📝</div><div class="empty-text">Start journaling your financial journey</div></div>';

  // 50/30/20
  const np=salary>0?Math.round(needsB/salary*100):0,wp=salary>0?Math.round(wantsB/salary*100):0,sp=salary>0?Math.round(savsB/salary*100):0;
  document.getElementById('rule-content').innerHTML=`<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin-bottom:16px"><div style="width:${np}%;background:var(--blue)"></div><div style="width:${wp}%;background:var(--amber)"></div><div style="width:${sp}%;background:var(--green)"></div></div>${[{label:'Needs',pct:np,ideal:50,color:'var(--blue)',amt:needsB},{label:'Wants',pct:wp,ideal:30,color:'var(--amber)',amt:wantsB},{label:'Savings',pct:sp,ideal:20,color:'var(--green)',amt:savsB}].map(r=>{const diff=r.pct-r.ideal;const diffLabel=diff>0?`▲ ${diff}% over ideal`:diff<0?`▼ ${Math.abs(diff)}% under ideal`:'✓ On target';const diffColor=diff>10?'var(--red)':diff>0?'var(--amber)':diff<-10?'var(--amber)':'var(--green)';return`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><span style="font-weight:700;color:${r.color}">${r.label}</span> <span style="font-size:12px;color:var(--text3)">(${r.ideal}% ideal)</span></div><div style="text-align:right"><div style="font-weight:700">${r.pct}%</div><div style="font-size:10px;color:${diffColor};font-weight:600;margin-top:1px">${diffLabel}</div><div style="font-size:11px;color:var(--text3)">${fmtShort(r.amt)}</div></div></div>`}).join('')}`;

  // Settings
  const smartSalaryEl=document.getElementById('smart-salary');if(smartSalaryEl)smartSalaryEl.value=salary;
  renderBudgetSettingsContent({ac,totalBudgeted,needsB,wantsB,savsB,unalloc,catTotals});

  // Recurring manager
  const rm=document.getElementById('recurring-manager');
  if(rm){const monthKey=currentMonthKey();const recurringList=[...recurring].map(r=>({item:r,status:recurringStatus(r)})).sort((a,b)=>{if(a.status.state==='paid'&&b.status.state!=='paid')return 1;if(a.status.state!=='paid'&&b.status.state==='paid')return-1;return a.status.days-b.status.days});if(!recurringList.length){rm.innerHTML='<div class="empty"><div class="empty-icon">🔁</div><div class="empty-text">Add monthly bills or income</div></div>';}else{const bills=recurringList.filter(({item})=>item.type==='bill');const incomes=recurringList.filter(({item})=>item.type!=='bill');const renderGroup=(list,title)=>list.length?`<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:${title==='Bills'?'0':'14px'} 0 8px">${title} <span style="font-weight:400">(${list.length})</span></div>${list.map(({item,status})=>{const catObj=ac.find(c=>c.name===item.category);const icon=catObj?catObj.icon:(item.type==='bill'?'🧾':'💵');const statusBg=status.state==='paid'?'var(--green-soft)':status.state==='due'?'var(--red-soft)':status.days<=3?'var(--amber-soft)':'var(--surface2)';const statusFg=status.state==='paid'?'var(--green)':status.state==='due'?'var(--red)':status.days<=3?'var(--amber)':'var(--text3)';return`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><div class="tx-icon" style="width:36px;height:36px;flex-shrink:0">${icon}</div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${esc(item.name)}</div><div style="font-size:11px;color:var(--text3);margin-top:1px">${item.type==='bill'?(item.category||'Bill'):'Income'} · ${fmt(item.amount)} · day ${item.day}</div></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0"><span style="font-size:10px;font-weight:700;color:${statusFg};background:${statusBg};padding:3px 7px;border-radius:999px;white-space:nowrap">${status.label}</span>${status.state!=='paid'?`<button class="btn btn-sm btn-primary" onclick="markRecurringPaid(${item.id})">Pay</button>`:`<button class="btn btn-sm btn-ghost" onclick="recurring.find(r=>r.id===${item.id}).lastPaid='';saveData();render()">Reset</button>`}<button class="btn-icon" onclick="deleteRecurring(${item.id})" style="border:none;color:var(--red)">✕</button></div></div>`}).join('')}`:'';rm.innerHTML=renderGroup(bills,'Bills')+renderGroup(incomes,'Income');}}

  // Alert settings
  const alertSettingsEl=document.getElementById('alert-settings');
  if(alertSettingsEl)alertSettingsEl.innerHTML=`<div class="setting-item"><div class="setting-left"><div class="setting-icon">📏</div><div><div class="setting-name">Budget warning threshold</div><div class="setting-desc">Alert when a category reaches this %</div></div></div><div style="display:flex;align-items:center;gap:8px"><input type="number" min="1" max="100" class="input setting-input" value="${alertSettings.budgetThreshold}" onchange="setAlertThreshold(this.value)"><span style="font-size:12px;color:var(--text3)">%</span></div></div>${[['overspendForecast','📉','Forecast overspending','Warn when month-end spend projected to exceed income'],['recurringDueSoon','🧾','Recurring due soon','Bills/income due today or within 3 days'],['spikeAlerts','📈','Spending spikes','Compare against last month'],['lowBalanceAlerts','💸','Low balance','Warn when daily budget gets small'],['badRealityAlerts','🚧','Bad reality alerts','Warn when debt mode, borrowing, and debt allocation conflict with your recovery plan']].map(([key,icon,name,desc])=>{const on=alertSettings[key]!==false;return`<div class="setting-item"><div class="setting-left"><div class="setting-icon">${icon}</div><div><div class="setting-name">${name}</div><div class="setting-desc">${desc}</div></div></div><div onclick="setAlertToggle('${key}',${!on})" style="width:44px;height:24px;border-radius:12px;background:${on?'var(--accent)':'var(--border)'};position:relative;cursor:pointer;transition:background .2s;flex-shrink:0"><div style="position:absolute;top:2px;left:${on?'22':'2'}px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div></div>`}).join('')}`;

  // Custom cats
  const untaggedCount=customCats.filter(c=>!c.groupExplicit).length;
  document.getElementById('custom-cat-list').innerHTML=(customCats.length?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:11px;color:var(--text3)">${untaggedCount>0?`<span style="color:var(--amber);font-weight:700">${untaggedCount} untagged</span> · `:''} Tap pill to change type</div><button class="btn btn-ghost btn-sm" onclick="openCatWizard()" style="font-size:11px;padding:4px 10px">🏷️ Sort All</button></div>`:'')+(customCats.length?customCats.map(c=>{const cnt=entries.filter(e=>!e.isDebtPayment&&e.category===c.name).length;const bgt=budgets[c.name]||0;const spent=catTotals[c.name]||0;const spentPct=bgt>0?Math.min(spent/bgt*100,100):0;const safeName=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");const grpClass=catGroupClass(c.group);const grpLabel=catGroupLabel(c.group);return`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><div class="setting-icon">${c.icon||'📦'}</div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="font-weight:600;font-size:13px">${esc(c.name)}</div><button class="cat-group-pill ${grpClass}" onclick="cycleCatGroup('${safeName}')" title="Tap to change">${grpLabel}</button>${!c.groupExplicit?`<span style="font-size:9px;color:var(--amber);font-weight:700">⚠ Untagged</span>`:''}</div><div style="font-size:11px;color:var(--text3);margin-top:1px">Budget ${fmt(bgt)} · ${cnt} entries this month</div>${bgt>0?`<div style="height:3px;background:var(--border);border-radius:2px;margin-top:4px;overflow:hidden;width:80px"><div style="height:100%;width:${spentPct}%;background:${spent>bgt?'var(--red)':'var(--accent)'};border-radius:2px"></div></div>`:''}</div><button class="btn-icon" onclick="openEditModal('${safeName}')">✏️</button><button class="btn-icon" onclick="openDeleteModal('${safeName}')">🗑️</button></div>`}).join(''):'<div class="empty" style="padding:16px"><div class="empty-icon">🏷️</div><div class="empty-text">No custom categories yet</div></div>');
}

/* Tab switcher for alerts/insights */
function switchAITab(tab){
  document.querySelectorAll('#alerts-insights-card .tab-btn').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase().includes(tab==='alerts'?'alert':'insight')));
  const alertsPane=document.getElementById('ai-pane-alerts');
  const insightsPane=document.getElementById('ai-pane-insights');
  if(alertsPane)alertsPane.classList.toggle('active',tab==='alerts');
  if(insightsPane)insightsPane.classList.toggle('active',tab==='insights');
}

const INFO_CONTENT={
  'net-worth':{title:'Net Worth',body:'Net worth is your total assets minus total debts.'},
  'net-worth-history':{title:'Net Worth History',body:'Every time you save balances, the app stores a snapshot.'},
  'rule-503020':{title:'50/30/20 Rule',body:'50% for needs, 30% for wants, and 20% for savings.'},
  'financial-health':{title:'Financial Health',body:'A score based on savings rate, budget discipline, emergency fund, and debt load.'}
};
function showInfo(key){const info=INFO_CONTENT[key]||{title:'About',body:'No description.'};document.getElementById('info-title').textContent=info.title;document.getElementById('info-body').innerHTML=esc(info.body);openModal('modal-info')}

// Init
document.getElementById('f-date').value=todayStr;
document.getElementById('inc-date').value=todayStr;
document.getElementById('j-month').value=filterMonth;
document.getElementById('hist-month').value=filterMonth;
document.getElementById('hist-quick-preset').value='thisMonth';
document.getElementById('t-date').value=todayStr;
toggleRecurringType();
render();
setTooltipContent('tip-add-expense','add_expense');
setTooltipContent('tip-add-income','add_income');
setTooltipContent('tip-history','history');
setTooltipContent('tip-goals','goals');
setTooltipContent('tip-more','more');
setTooltipContent('tip-recent','recent');
maybeStartOnboarding();
setTimeout(()=>{ if(localStorage.getItem('ft_onboarded')==='1' && !document.getElementById('onboard-overlay').classList.contains('show') && shouldStartTutorial()) startTutorial(); }, 500);
document.addEventListener('click',function(e){const wrap=e.target.closest('.notif-wrap');const panel=document.getElementById('notif-panel');if(!wrap&&panel)panel.classList.remove('show')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeHistoryDrawer()});
document.addEventListener('fullscreenchange',function(){const shell=document.getElementById('money-flow-fullscreen-shell');if(document.fullscreenElement!==shell)unlockMoneyFlowOrientation();syncMoneyFlowOrientationState()});
window.addEventListener('resize',function(){syncMoneyFlowOrientationState()});
window.addEventListener('orientationchange',function(){syncMoneyFlowOrientationState()});

window.addEventListener('DOMContentLoaded',()=>{
  try{ renderCashflowNotification(); }catch(e){}
  try{ renderSafeSpendCard(); }catch(e){}
});


restartGreetingAutoSlide();

document.addEventListener('pointerdown',function(e){
  const slides=e.target.closest('.greeting-slides');
  if(!slides) return;
  slides.dataset.startX=String(e.clientX);
  slides.dataset.dragging='1';
  slides.classList.add('dragging');
});
document.addEventListener('pointerup',function(e){
  const slides=document.querySelector('.greeting-slides.dragging');
  if(!slides) return;
  const startX=Number(slides.dataset.startX||0);
  const diff=e.clientX-startX;
  slides.classList.remove('dragging');
  delete slides.dataset.dragging;
  delete slides.dataset.startX;
  if(Math.abs(diff)<40) return;
  if(diff<0) nextGreetingCard();
  else prevGreetingCard();
});
document.addEventListener('pointercancel',function(){
  const slides=document.querySelector('.greeting-slides.dragging');
  if(!slides) return;
  slides.classList.remove('dragging');
  delete slides.dataset.dragging;
  delete slides.dataset.startX;
});
