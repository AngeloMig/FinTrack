/* ============ DATA & CONFIG (unchanged from original) ============ */

loadData();
function normalizePaySchedule(){const fallbackAccount=(nwAccounts&&nwAccounts[0]&&nwAccounts[0].key)||(DEFAULT_NW_ACCOUNTS[0]&&DEFAULT_NW_ACCOUNTS[0].key)||'bdo';if(!paySchedule||typeof paySchedule!=='object')paySchedule={mode:'twice',days:[5,20]};const mode=paySchedule.mode==='monthly'?'monthly':'twice';let days=(paySchedule.days||[]).map(x=>Math.min(31,Math.max(1,parseInt(x)||1))).filter(Boolean);if(!days.length)days=mode==='monthly'?[30]:[5,20];days=[...new Set(days)].sort((a,b)=>a-b);if(mode==='monthly')days=[days[0]];while(mode==='twice'&&days.length<2)days.push(days.length?20:5);let splits=Array.isArray(paySchedule.splits)?paySchedule.splits:[];if(!splits.length){const even=Math.round((salary||0)/days.length);splits=days.map((day,idx)=>({day,amount:idx===days.length-1?Math.max(0,Math.round((salary||0)-even*(days.length-1))):even,account:fallbackAccount}))}splits=splits.map((s,idx)=>({day:Math.min(31,Math.max(1,parseInt(s.day)||days[idx]||days[0])),amount:Math.max(0,parseFloat(s.amount)||0),account:s.account||fallbackAccount})).sort((a,b)=>a.day-b.day);const received=(paySchedule&&typeof paySchedule.received==='object'&&paySchedule.received)?paySchedule.received:{};paySchedule={...paySchedule,mode,days:splits.map(s=>s.day),splits,received};}
normalizePaySchedule();

const now=new Date();
const toLocal=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayStr=toLocal(now);
let moneyFlowViewerTheme=localStorage.getItem('ft_money_flow_theme')||'auto';
let filterMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
const fmt=n=>"₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtShort=n=>{n=Number(n||0);if(Math.abs(n)>=1e6)return"₱"+(n/1e6).toFixed(1)+"M";if(Math.abs(n)>=1e3)return"₱"+Math.round(n/1e3)+"K";return"₱"+Math.round(n).toLocaleString()};
const esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML};
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
function openHistoryDrawer(){historyDrawerOpen=true;syncHistoryDrawerState()}
function closeHistoryDrawer(){historyDrawerOpen=false;syncHistoryDrawerState()}

function restartGreetingAutoSlide(){
  if(greetingAutoSlideTimer) clearInterval(greetingAutoSlideTimer);
  greetingAutoSlideTimer=setInterval(()=>{
    greetingCardIndex=(greetingCardIndex+1)%3;
    render();
  },6000);
}
function setGreetingCard(index){
  greetingCardIndex=((index%3)+3)%3;
  render();
  restartGreetingAutoSlide();
}
function nextGreetingCard(){
  greetingCardIndex=(greetingCardIndex+1)%3;
  render();
  restartGreetingAutoSlide();
}
function prevGreetingCard(){
  greetingCardIndex=(greetingCardIndex+2)%3;
  render();
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
  return incomes.filter(i=>(i.date||'').slice(0,7)===monthKey && !i.isSalaryDeposit);
}
function getMonthSpent(monthKey=filterMonth){
  return getMonthEntries(monthKey).reduce((sum,e)=>sum+Number(e.amount||0),0);
}
function getMonthIncomeTotal(monthKey=filterMonth){
  return getMonthIncome(monthKey).reduce((sum,i)=>sum+Number(i.amount||0),0);
}
function getMonthCategoryTotals(monthKey=filterMonth){
  const totals={};
  getMonthEntries(monthKey).forEach(e=>{totals[e.category]=(totals[e.category]||0)+Number(e.amount||0)});
  return totals;
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
  const safe = getSafeSpendRealData();
  const safeDaily = safe.daily;
  const statusClass = safe.status;
  const monthlyStatus = statusClass==='good' ? 'On Track' : statusClass==='warn' ? 'Tight' : 'Risk';
  const statusText = statusClass==='good'
    ? 'You are on track this month.'
    : statusClass==='warn'
      ? 'Your spending room is getting tighter.'
      : 'Your remaining budget is tight.';
  wrap.innerHTML=`
    <div class="summary-grid">
      <div class="summary-stat">
        <div class="summary-label">Spent this month</div>
        <div class="summary-value">${fmt(monthSpent)}</div>
        <div class="summary-sub">Logged expenses in ${filterMonth}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Left to spend</div>
        <div class="summary-value">${fmt(remaining)}</div>
        <div class="summary-sub">Based on income and spending so far</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Same daily limit</div>
        <div class="summary-value">${fmt(safeDaily)}</div>
        <div class="summary-sub">Same number shown on the homepage</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">Monthly status</div>
        <div class="summary-value">${monthlyStatus}</div>
        <div class="summary-sub">A quick read of your current pace</div>
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
  const safe = getSafeSpendRealData();
  const safeDaily = safe.daily;
  const insights=[];
  if(monthEntries.length===0){
    insights.push({icon:'📝',title:'No spending logged yet',body:'Add your first expense this month to unlock more useful breakdowns and patterns.'});
    insights.push({icon:'💸',title:'Your full budget is still available',body:'Because there is no logged spending yet, your daily limit is still wide open.'});
    insights.push({icon:'🎯',title:'Good time to build the habit',body:'The earlier you log this month, the smarter your insights will become.'});
  } else {
    if(sortedCats[0]) insights.push({icon:'📌',title:`${sortedCats[0][0]} is your biggest category`,body:`It accounts for ${fmt(sortedCats[0][1])} of spending so far this month.`});
    insights.push({icon:'📅',title:'Your current daily pace',body:`To stay balanced, try to keep average spending around ${fmt(safeDaily)} per day for the rest of the month.`});
    const totalBudget = Object.values(budgets||{}).reduce((a,b)=>a+Number(b||0),0);
    if(totalBudget>0) insights.push({icon:'🧭',title:'Your spending vs budget',body:`You have used ${Math.round((monthSpent/totalBudget)*100)}% of your visible monthly budgets so far.`});
  }
  wrap.innerHTML=`<div class="insights-list">${insights.slice(0,3).map(x=>`
    <div class="insight-item">
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
  const totals=getMonthCategoryTotals();
  const active=Object.entries(totals).map(([name,spent])=>{
    const budget=Number(budgets[name]||0);
    const pct=budget>0?(spent/budget)*100:0;
    return {name,spent,budget,pct};
  }).filter(x=>x.spent>0 || x.budget>0).sort((a,b)=>b.pct-a.pct || b.spent-a.spent);
  const risky=active.filter(x=>x.pct>=70 || x.spent>0).slice(0,5);
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
    const tag = x.pct>=100 ? 'Over budget' : x.pct>=70 ? 'Near limit' : 'Active';
    const tagClass = x.pct>=100 ? 'risk' : 'warn';
    return `
      <div class="focus-item">
        <div class="focus-top">
          <div>
            <div class="focus-name">${x.name}</div>
            <div class="focus-meta">${fmt(x.spent)} spent${x.budget>0?` of ${fmt(x.budget)}`:''}</div>
          </div>
          <span class="focus-tag ${tagClass}">${tag}</span>
        </div>
        <div class="progress">
          <div class="progress-track"><div class="progress-fill" style="width:${Math.min(x.pct||0,100)}%;background:${x.pct>=100?'var(--red)':'var(--amber)'}"></div></div>
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

function rgbaFromHex(hex,alpha=.35){
  const clean=String(hex||'').replace('#','');
  if(clean.length!==6)return`rgba(99,102,241,${alpha})`;
  const num=parseInt(clean,16);
  if(Number.isNaN(num))return`rgba(99,102,241,${alpha})`;
  return`rgba(${(num>>16)&255},${(num>>8)&255},${num&255},${alpha})`;
}
function truncateMoneyFlowLabel(label,max=18){const text=String(label||'').trim();return text.length>max?text.slice(0,Math.max(max-1,1))+'…':text}
function addMoneyFlowAmount(map,key,amount,seed={}){const next=(map.get(key)||{...seed,amount:0});next.amount=Number(next.amount||0)+Number(amount||0);map.set(key,next);return next}
function getMoneyFlowSourceIcon(source){const lower=String(source||'').toLowerCase();if(lower==='salary')return'💼';if(lower.includes('bonus'))return'✨';if(lower.includes('gift'))return'🎁';if(lower.includes('freelance'))return'🧑‍💻';if(lower==='existing balance')return'🏦';return'💵'}
function getMoneyFlowCategoryMeta(entry){
  if(entry.isGoalContribution)return{label:'Goal Contribution',group:'savings',icon:'🎯'};
  if(entry.isDebtPayment)return{label:'Debt Payment',group:'spending',icon:'💳'};
  const info=getCatInfo(entry.category||'');
  const group=info.group==='savings'?'savings':'spending';
  return{label:entry.category||'Uncategorized',group,icon:info.icon||'📦'};
}
function buildMoneyFlowData(monthKey=currentMonthKey()){
  const monthIncomes=incomes.filter(i=>(i.date||'').slice(0,7)===monthKey&&Number(i.amount||0)>0);
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
    `<div class="money-flow-pill">In <strong>${fmtShort(data.totalIncome)}</strong></div>`,
    `<div class="money-flow-pill">Spending <strong>${fmtShort(spendingOutflow)}</strong></div>`,
    `<div class="money-flow-pill">Savings <strong>${fmtShort(data.savingsOutflow)}</strong></div>`,
    `<div class="money-flow-pill">${data.accountsUsed} account${data.accountsUsed===1?'':'s'}</div>`
  ];
  if(data.existingBalanceUsed>0)summaryPills.push(`<div class="money-flow-pill">Existing balance <strong>${fmtShort(data.existingBalanceUsed)}</strong></div>`);
  return summaryPills.join('');
}
function getMoneyFlowCaption(data){
  return data&&data.existingBalanceUsed>0?'Smaller categories are grouped into Other. Existing Balance appears when an account sent out more than this month’s recorded income.':'Smaller categories are grouped into Other. The chart uses current-month income, account, spending, and savings activity.';
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
  const amount=Number(value||0);
  if(amount===0)return fmt(0);
  return`${amount>0?'+':'-'}${fmt(Math.abs(amount))}`;
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
  const accentWidth=opts.accentWidth||7;
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
    let currentY=marginTop;
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
    return`<g class="${nodeClasses.join(' ')}"${dataAttr}><rect class="money-flow-node" x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${node.height}" rx="${nodeRadius}"></rect><rect class="money-flow-node-accent" x="${node.x}" y="${node.y}" width="${accentWidth}" height="${node.height}" rx="${nodeRadius}" fill="${node.color}"></rect><text class="money-flow-node-label" x="${node.x+labelX}" y="${node.y+labelY}">${esc(label)}</text>${amountLine}</g>`;
  }).join('');
  const defs=linkClipRects.length?`<defs><clipPath id="${linkClipId}" clipPathUnits="userSpaceOnUse">${linkClipRects.map(rect=>`<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"></rect>`).join('')}</clipPath></defs>`:'';
  const linkLayer=linkClipRects.length?`<g clip-path="url(#${linkClipId})">${paths}</g>`:`<g>${paths}</g>`;
  return`<svg${svgIdAttr} class="${svgClass}" data-base-width="${width}" data-base-height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ariaLabel)}">${defs}<g>${stageLabels.map(stage=>`<text class="money-flow-stage" x="${stage.x}" y="${stageLabelY}" text-anchor="middle">${stage.label}</text>`).join('')}</g>${linkLayer}<g>${nodes}</g></svg>`;
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
    mount.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Money Flow This Month</span><span class="card-badge">${monthLabel}</span></div>${helpMode?'<div class="help-inline">Follow how income moves through accounts into this month’s categories.</div>':''}<div class="money-flow-meta">A live view of how money is moving through your current month.</div><div id="money-flow-chart" class="money-flow-chart"><div class="empty"><div class="empty-icon">🌊</div><div class="empty-text">${esc(data.reason||'No money-flow activity recorded yet this month.')}</div></div></div></div>`;
    syncMoneyFlowFullscreen(data);
    return;
  }
  mount.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Money Flow This Month</span>${headerActions}</div>${helpMode?'<div class="help-inline">Tracks this month’s flow from income sources into accounts, then out into your biggest spending and savings categories.</div>':''}<div class="money-flow-meta">Current-month cash movement from income sources into accounts, then into your biggest spending and savings categories.</div><div class="money-flow-summary">${getMoneyFlowSummaryMarkup(data)}</div><div id="money-flow-chart" class="money-flow-chart money-flow-chart-preview" onclick="openMoneyFlowFullscreen()" title="Open fullscreen money flow view">${makeMoneyFlowSvg(data)}</div><div class="money-flow-caption">${getMoneyFlowCaption(data)} <span class="money-flow-inline-link">Tap the chart or use Fullscreen for a closer view.</span></div></div>`;
  syncMoneyFlowFullscreen(data);
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
  const buffer = Math.floor(monthlyIncome * 0.1);
  const remaining = Math.max(monthlyIncome - carryoverOverspend - spent - upcomingBillsTotal - buffer, 0);
  const daily = Math.floor(remaining / Math.max(daysLeft, 1));

  let status = 'good', label = 'On track';
  if (daily < 200) { status = 'risk'; label = 'Risk'; }
  else if (daily < 500) { status = 'warn'; label = 'Tight'; }

  let note = 'Based on your salary, spending, and remaining bills.';
  if (status === 'warn') note = 'You still have room, but need to stay controlled.';
  if (status === 'risk') note = 'Your remaining budget is tight. Limit spending today.';

  return {
    monthlyIncome,
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
      <div class="safe-spend-amount">${fmt(s.daily)}</div>
    </div>
    <div class="safe-spend-meta">${fmt(s.remaining)} remaining this month across ${s.daysLeft} day${s.daysLeft===1?'':'s'}.</div>

    <div class="safe-spend-explainer">
      <div class="safe-spend-breakdown">
        <div class="safe-spend-break-chip base" data-breakdown="salary" onclick="toggleBreakdown('salary', this)">
          Start <strong>${fmtShort(s.monthlyIncome)}</strong>
        </div>
        <div class="safe-spend-break-chip deduct" data-breakdown="spent" onclick="toggleBreakdown('spent', this)">
          Spent <strong><span class="minus">−</span>${fmtShort(s.spent)}</strong>
        </div>
        ${s.carryoverOverspend>0?`<div class="safe-spend-break-chip deduct" data-breakdown="carryover" onclick="toggleBreakdown('carryover', this)">Carryover <strong><span class="minus">−</span>${fmtShort(s.carryoverOverspend)}</strong></div>`:''}
        <div class="safe-spend-break-chip deduct" data-breakdown="bills" onclick="toggleBreakdown('bills', this)">
          Bills <strong><span class="minus">−</span>${fmtShort(s.upcomingBillsTotal)}</strong>
        </div>
        <div class="safe-spend-break-chip deduct" data-breakdown="buffer" onclick="toggleBreakdown('buffer', this)">
          Buffer <strong><span class="minus">−</span>${fmtShort(s.buffer)}</strong>
        </div>
      </div>
      <div id="safe-spend-breakdown-detail" class="safe-spend-detail" data-active="" style="display:none"></div>
    </div>
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

  document.querySelectorAll('.safe-spend-break-chip').forEach(chip=>chip.classList.remove('active'));

  if(el.dataset.active === type){
    el.innerHTML = '';
    el.dataset.active = '';
    el.style.display = 'none';
    return;
  }

  let html = '';
  if(type === 'carryover'){
    const carry=getCarryoverOverspend();
    html = `<div class="safe-spend-detail-title">Previous month overspend</div><div class="safe-spend-detail-item">Last month went over your declared salary by <strong>${fmt(carry)}</strong>. That amount reduces this month’s available room.</div>`;
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
function toggleCustom(){document.getElementById('custom-cat-wrap').style.display=document.getElementById('f-cat').value==='__other__'?'block':'none'}

function makeKeyFromName(name){let base=(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||('account-'+Date.now());let key=base,i=2;while(nwAccounts.find(a=>a.key===key)){key=base+'-'+i;i++}return key}
function openNetWorthAdd(){editingNetWorthKey=null;document.getElementById('nw-modal-title').textContent='Add Net Worth Account';document.getElementById('nw-acc-icon').value='🏦';document.getElementById('nw-acc-name').value='';document.getElementById('nw-acc-balance').value='';document.getElementById('nw-delete-btn').style.display='none';document.getElementById('nw-transfer-btn').style.display='none';openModal('modal-nw-account')}
function openNetWorthEdit(key){const acc=nwAccounts.find(a=>a.key===key);if(!acc)return;editingNetWorthKey=key;document.getElementById('nw-modal-title').textContent='Edit Net Worth Account';document.getElementById('nw-acc-icon').value=acc.icon||'🏦';document.getElementById('nw-acc-name').value=acc.name||'';document.getElementById('nw-acc-balance').value=nwBalances[key]||0;document.getElementById('nw-delete-btn').style.display='inline-flex';document.getElementById('nw-transfer-btn').style.display='inline-flex';openModal('modal-nw-account')}
function saveNetWorthAccount(){const icon=document.getElementById('nw-acc-icon').value||'🏦';const name=document.getElementById('nw-acc-name').value.trim();const balance=parseFloat(document.getElementById('nw-acc-balance').value)||0;if(!name)return alert('Enter an account name.');if(editingNetWorthKey){const acc=nwAccounts.find(a=>a.key===editingNetWorthKey);if(!acc)return;acc.icon=icon;acc.name=name;nwBalances[editingNetWorthKey]=balance}else{const key=makeKeyFromName(name);nwAccounts.push({key,name,icon});nwBalances[key]=balance}closeModal('modal-nw-account');saveData();render()}
function deleteNetWorthAccount(){if(!editingNetWorthKey)return;nwAccounts=nwAccounts.filter(a=>a.key!==editingNetWorthKey);delete nwBalances[editingNetWorthKey];closeModal('modal-nw-account');saveData();render()}
function buildAccountSelect(selId,includeBlank=false){const sel=document.getElementById(selId);if(!sel)return;const prev=sel.value;sel.innerHTML='';if(includeBlank){const blank=document.createElement('option');blank.value='';blank.textContent='Select account';sel.appendChild(blank)}nwAccounts.forEach(a=>{const o=document.createElement('option');o.value=a.key;o.textContent=`${a.icon} ${a.name}`;sel.appendChild(o)});if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;else if(!prev&&sel.options.length)sel.selectedIndex=includeBlank?0:0}
function getDefaultAccountKey(){return nwAccounts.length?nwAccounts[0].key:''}
function adjustAccountBalance(key,delta){if(!key)return;if(nwBalances[key]===undefined)nwBalances[key]=0;nwBalances[key]=Number(nwBalances[key]||0)+Number(delta||0)}
function syncLegacyTransactionAccounts(){entries.forEach(e=>{if(e.account===undefined)e.account=''});incomes.forEach(i=>{if(i.account===undefined)i.account=''});debtPayments.forEach(p=>{if(p.account===undefined)p.account='';if(p.markedMonthly===undefined)p.markedMonthly=true})}
function getAccountInfo(key){return nwAccounts.find(a=>a.key===key)||{name:'No account',icon:'🏷️',key:''}}
function getSpendValidationState(account,amount,refundedAmount=0){const normalizedAmount=Math.max(Number(amount||0),0);const current=Number(nwBalances[account]||0);const available=current+Math.max(Number(refundedAmount||0),0);return{current,available,after:available-normalizedAmount,amount:normalizedAmount,hasEnough:normalizedAmount<=available}}
function renderSpendBalancePreview({wrapId,buttonId,title,account,amount,submitLabel,afterLabel,refundedAmount=0,extraLines=[],okMessage='Enough balance for this expense.',warningMessage='Not enough balance in this account.'}){const wrap=document.getElementById(wrapId);const button=document.getElementById(buttonId);const state=getSpendValidationState(account,amount,refundedAmount);const lines=[`<div><strong>${esc(getAccountInfo(account).name)}</strong> now: ${fmt(state.current)}</div>`];if(refundedAmount>0)lines.push(`<div>Available after refund: <strong>${fmt(state.available)}</strong></div>`);extraLines.filter(Boolean).forEach(line=>lines.push(line));lines.push(`<div>${afterLabel}: <strong>${fmt(state.after)}</strong></div>`);if(state.amount>0)lines.push(state.hasEnough?`<div class="add-balance-ok">${okMessage}</div>`:`<div class="add-balance-warning">${warningMessage}</div>`);if(wrap)wrap.innerHTML=`<div class="add-subtitle" style="margin-bottom:4px">${title}</div>${lines.join('')}`;if(button){const canSubmit=state.amount>0&&!!account&&state.hasEnough;button.disabled=!canSubmit;button.textContent=!state.hasEnough&&state.amount>0?'Not Enough Balance':submitLabel}return state}
function setTransferFee(value){document.getElementById('t-fee').value=value;updateTransferSummary()}
function updateTransferSummary(){const from=document.getElementById('t-from')?.value||'';const to=document.getElementById('t-to')?.value||'';const amount=parseFloat(document.getElementById('t-amount')?.value)||0;const fee=parseFloat(document.getElementById('t-fee')?.value)||0;const summary=document.getElementById('transfer-summary');if(!summary)return;const fromName=from?getAccountInfo(from).name:'Source account';const toName=to?getAccountInfo(to).name:'Destination account';const total=Math.max(0,amount)+Math.max(0,fee);const fromAfter=from?Number(nwBalances[from]||0)-total:0;const toAfter=to?Number(nwBalances[to]||0)+Math.max(0,amount):0;summary.innerHTML=`<div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text3);margin-bottom:6px">Transfer summary</div><div><strong>Transfer amount:</strong> ${fmt(amount)}</div><div><strong>Fee:</strong> ${fmt(fee)}</div><div><strong>Total deducted from ${esc(fromName)}:</strong> ${fmt(total)}</div><div><strong>Amount received in ${esc(toName)}:</strong> ${fmt(amount)}</div><div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><strong>${esc(fromName)} after transfer:</strong> ${fmt(fromAfter)}<br><strong>${esc(toName)} after transfer:</strong> ${fmt(toAfter)}</div>${fee>0?'<div style="margin-top:6px;color:var(--text3)">The fee will be logged as a separate Transfer Fees expense.</div>':''}`;}
function openTransferModal(prefillFrom=''){if(!nwAccounts||nwAccounts.length<2)return alert('Add at least two accounts to transfer money.');const fromEl=document.getElementById('t-from');const toEl=document.getElementById('t-to');const opts=nwAccounts.map(a=>`<option value="${a.key}">${a.icon} ${esc(a.name)}</option>`).join('');fromEl.innerHTML=opts;toEl.innerHTML=opts;const first=prefillFrom&&nwAccounts.find(a=>a.key===prefillFrom)?prefillFrom:nwAccounts[0].key;let second=(nwAccounts.find(a=>a.key!==first)||nwAccounts[0]).key;if(second===first&&nwAccounts[1])second=nwAccounts[1].key;fromEl.value=first;toEl.value=second;document.getElementById('t-date').value=todayStr;document.getElementById('t-amount').value='';document.getElementById('t-fee').value='0';document.getElementById('t-note').value='';updateTransferSummary();openModal('modal-transfer')}
function openTransferFromEditingAccount(){if(!editingNetWorthKey)return;closeModal('modal-nw-account');openTransferModal(editingNetWorthKey)}
function addTransfer(){const from=document.getElementById('t-from').value;const to=document.getElementById('t-to').value;const amount=parseFloat(document.getElementById('t-amount').value);const fee=parseFloat(document.getElementById('t-fee').value)||0;const date=document.getElementById('t-date').value;const note=document.getElementById('t-note').value;if(!from||!to||from===to)return alert('Choose two different accounts.');if(!date||!amount||amount<=0)return alert('Enter date and amount.');if(fee<0)return alert('Fee cannot be negative.');const totalDeduction=amount+fee;if((Number(nwBalances[from]||0))<totalDeduction)return alert('Not enough balance in the selected source account.');adjustAccountBalance(from,-totalDeduction);adjustAccountBalance(to,amount);const transferRecord=stampRecord({id:nextTransferId++,from,to,amount,fee,date,note});transfers.unshift(transferRecord);let feeEntryId=null;if(fee>0){feeEntryId=nextId;entries.unshift(stampRecord({id:nextId++,date,category:'Transfer Fees',amount:fee,account:from,note:`Transfer fee: ${getAccountInfo(from).name} → ${getAccountInfo(to).name}${note?` · ${note}`:''}`}));transferRecord.feeEntryId=feeEntryId}lastTransferUndo={transfer:transferRecord,totalDeduction,feeEntryId};document.getElementById('t-amount').value='';document.getElementById('t-fee').value='0';document.getElementById('t-note').value='';closeModal('modal-transfer');saveData();render();showActionToast(`${fmt(amount)} transferred`,`${getAccountInfo(from).name} → ${getAccountInfo(to).name}${fee>0?` · Fee ${fmt(fee)}`:''}`,'🔁',{showUndo:true,duration:5200})}
function renderTransferHistory(){const wrap=document.getElementById('transfer-history');if(!wrap)return;if(!transfers.length){wrap.innerHTML='<div class="empty"><div class="empty-text">No transfers yet.</div></div>';return;}wrap.innerHTML=`<div class="tx-list">${transfers.slice(0,8).map(t=>`<div class="tx-item"><div class="tx-icon cat-default">🔁</div><div class="tx-info"><div class="tx-name">${esc(getAccountInfo(t.from).name)} → ${esc(getAccountInfo(t.to).name)}</div><div class="tx-meta">${esc(t.date||'')} · ${t.fee&&Number(t.fee)>0?`Fee ${fmt(t.fee)}`:'No fee'}${t.note?` · ${esc(t.note)}`:''}</div></div><div class="tx-amount">${fmt(t.amount)}</div></div>`).join('')}</div>`;}
function findTransferFeeEntryId(transfer){if(transfer.feeEntryId&&entries.some(e=>e.id===transfer.feeEntryId))return transfer.feeEntryId;const feeAmount=Number(transfer.fee||0);if(feeAmount<=0)return null;const match=entries.find(e=>e.category==='Transfer Fees'&&e.account===transfer.from&&Number(e.amount||0)===feeAmount&&e.date===transfer.date&&(e.note||'').startsWith('Transfer fee:'));return match?match.id:null}
function deleteTransfer(id){const t=transfers.find(x=>x.id===id);if(!t)return;const feeEntryId=findTransferFeeEntryId(t);adjustAccountBalance(t.from,Number(t.amount||0)+Number(t.fee||0));adjustAccountBalance(t.to,-Number(t.amount||0));if(feeEntryId)entries=entries.filter(e=>e.id!==feeEntryId);transfers=transfers.filter(x=>x.id!==id);if(lastTransferUndo?.transfer?.id===id)lastTransferUndo=null;saveData();render()}

/* Onboarding */
const ONBOARD_DEFAULT_ACCOUNTS=[{key:'cash',name:'Cash',icon:'💵',selected:true,balance:0},{key:'gcash',name:'GCash',icon:'📱',selected:true,balance:0},{key:'maya',name:'Maya',icon:'📲',selected:false,balance:0},{key:'bdo',name:'BDO Savings',icon:'🏦',selected:true,balance:0},{key:'unionbank',name:'UnionBank',icon:'💳',selected:false,balance:0}];
const ONBOARD_DEFAULT_BILLS=[{name:'Electric Bill',amount:0,day:5,category:'Electric Bill',selected:true},{name:'Water',amount:0,day:10,category:'Water',selected:false},{name:'Spotify',amount:169,day:12,category:'Spotify',selected:false},{name:'Insurance / HMO',amount:0,day:15,category:'Insurance / HMO',selected:false}];
let onboardAccounts=JSON.parse(JSON.stringify(ONBOARD_DEFAULT_ACCOUNTS));
let onboardBills=JSON.parse(JSON.stringify(ONBOARD_DEFAULT_BILLS));

function renderOnboardingProgress(){const el=document.getElementById('onboard-progress');if(!el)return;el.innerHTML=[0,1,2,3,4].map(i=>`<span class="${i<=onboardStep?'active':''}"></span>`).join('');document.querySelectorAll('.onboard-step').forEach((s,idx)=>s.classList.toggle('active',idx===onboardStep))}
function nextOnboardStep(){if(onboardStep===1){const sal=parseFloat(document.getElementById('ob-salary').value)||0;if(sal<=0)return alert('Enter your monthly salary.')}if(onboardStep===2){if(!onboardAccounts.some(a=>a.selected))return alert('Select at least one account.')}onboardStep=Math.min(onboardStep+1,4);renderOnboardingProgress()}
function prevOnboardStep(){onboardStep=Math.max(onboardStep-1,0);renderOnboardingProgress()}
function toggleOnboardPayMode(){const mode=document.getElementById('ob-pay-mode').value;document.getElementById('ob-pay-twice-row').style.display=mode==='twice'?'grid':'none';document.getElementById('ob-pay-monthly-row').style.display=mode==='monthly'?'block':'none';const split2=document.getElementById('ob-salary-split-2');if(split2)split2.style.display=mode==='twice'?'grid':'none'}
function renderOnboardSalaryAccounts(){['ob-pay-account-1','ob-pay-account-2'].forEach((id,idx)=>{const sel=document.getElementById(id);if(!sel)return;const prev=sel.value;sel.innerHTML=onboardAccounts.map(a=>`<option value="${a.key}">${a.icon} ${a.name}</option>`).join('');if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;else sel.value=onboardAccounts[idx]?.key||onboardAccounts[0]?.key||''})}
function syncOnboardSalarySplitAmounts(){const salaryVal=parseFloat(document.getElementById('ob-salary')?.value)||0;const mode=document.getElementById('ob-pay-mode')?.value||'twice';const amt1=document.getElementById('ob-pay-amt-1');const amt2=document.getElementById('ob-pay-amt-2');if(!amt1||!amt2)return;if(mode==='monthly'){amt1.value=salaryVal?Math.round(salaryVal):'';amt2.value='';}else{const first=Math.round(salaryVal/2);const second=Math.max(0,Math.round(salaryVal-first));amt1.value=salaryVal?first:'';amt2.value=salaryVal?second:'';}}
function renderOnboardAccounts(){const wrap=document.getElementById('ob-account-list');if(!wrap)return;wrap.innerHTML=onboardAccounts.map((a,idx)=>`<div class="mini-item"><label style="display:flex;align-items:center;gap:10px;flex:1"><input type="checkbox" ${a.selected?'checked':''} onchange="onboardAccounts[${idx}].selected=this.checked;renderOnboardSalaryAccounts()"><span>${a.icon} ${a.name}</span></label><div style="display:flex;align-items:center;gap:6px"><span style="color:var(--text3)">₱</span><input type="number" class="input" value="${a.balance||0}" style="width:92px;text-align:right" onchange="onboardAccounts[${idx}].balance=parseFloat(this.value)||0"></div></div>`).join('');renderOnboardSalaryAccounts()}
function renderOnboardBills(){const wrap=document.getElementById('ob-bills-list');if(!wrap)return;wrap.innerHTML=onboardBills.map((b,idx)=>`<div class="mini-item" style="align-items:flex-start"><label style="display:flex;align-items:center;gap:10px;flex:1;padding-top:8px"><input type="checkbox" ${b.selected?'checked':''} onchange="onboardBills[${idx}].selected=this.checked"><span>${b.name}</span></label><div style="display:grid;grid-template-columns:84px 72px;gap:6px"><input type="number" class="input" placeholder="Amount" value="${b.amount||0}" onchange="onboardBills[${idx}].amount=parseFloat(this.value)||0"><input type="number" class="input" placeholder="Day" min="1" max="31" value="${b.day||1}" onchange="onboardBills[${idx}].day=parseInt(this.value)||1"></div></div>`).join('')}
function maybeStartOnboarding(){const firstRun=!localStorage.getItem('ft_onboarded');if(firstRun){document.getElementById('ob-salary').value=salary||'';document.getElementById('ob-pay-mode').value=paySchedule?.mode||'twice';if((paySchedule?.days||[]).length){document.getElementById('ob-pay-1').value=paySchedule.days[0]||5;document.getElementById('ob-pay-2').value=paySchedule.days[1]||20;document.getElementById('ob-pay-single').value=paySchedule.days[0]||30}renderOnboardAccounts();renderOnboardSalaryAccounts();const splits=paySchedule?.splits||[];if(splits[0]){document.getElementById('ob-pay-amt-1').value=splits[0].amount||'';document.getElementById('ob-pay-account-1').value=splits[0].account||onboardAccounts[0]?.key||''}if(splits[1]){document.getElementById('ob-pay-amt-2').value=splits[1].amount||'';document.getElementById('ob-pay-account-2').value=splits[1].account||onboardAccounts[1]?.key||onboardAccounts[0]?.key||''}toggleOnboardPayMode();syncOnboardSalarySplitAmounts();renderOnboardBills();onboardStep=0;renderOnboardingProgress();document.getElementById('onboard-overlay').classList.add('show')}}
function skipOnboarding(){localStorage.setItem('ft_onboarded','1');document.getElementById('onboard-overlay').classList.remove('show')}
function finishOnboarding(){const sal=parseFloat(document.getElementById('ob-salary').value)||0;if(sal<=0)return alert('Enter your monthly salary.');salary=sal;const mode=document.getElementById('ob-pay-mode').value;let days=[],splits=[];if(mode==='monthly'){const day=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-single').value)||30));const amount=parseFloat(document.getElementById('ob-pay-amt-1').value)||sal;const account=document.getElementById('ob-pay-account-1').value||onboardAccounts[0]?.key||'';days=[day];splits=[{day,amount,account}]}else{const d1=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-1').value)||5));const d2=Math.min(31,Math.max(1,parseInt(document.getElementById('ob-pay-2').value)||20));const a1=parseFloat(document.getElementById('ob-pay-amt-1').value)||Math.round(sal/2);const a2=parseFloat(document.getElementById('ob-pay-amt-2').value)||Math.max(0,sal-a1);const acc1=document.getElementById('ob-pay-account-1').value||onboardAccounts[0]?.key||'';const acc2=document.getElementById('ob-pay-account-2').value||onboardAccounts[1]?.key||onboardAccounts[0]?.key||'';splits=[{day:d1,amount:a1,account:acc1},{day:d2,amount:a2,account:acc2}].sort((a,b)=>a.day-b.day);days=splits.map(s=>s.day)}if(Math.round(splits.reduce((sum,s)=>sum+Number(s.amount||0),0))!==Math.round(sal))return alert('Your payday amounts should add up to your monthly salary.');paySchedule={mode,days,splits};const requiredSalaryAccounts=new Set(splits.map(s=>s.account).filter(Boolean));onboardAccounts.forEach(a=>{if(requiredSalaryAccounts.has(a.key))a.selected=true});nwAccounts=onboardAccounts.filter(a=>a.selected).map(a=>({key:a.key,name:a.name,icon:a.icon}));if(!nwAccounts.length)nwAccounts=[{key:'cash',name:'Cash',icon:'💵'}];nwBalances={};nwAccounts.forEach(a=>{const found=onboardAccounts.find(x=>x.key===a.key);nwBalances[a.key]=found?Number(found.balance||0):0});recurring=recurring.filter(r=>!ONBOARD_DEFAULT_BILLS.some(b=>b.name===r.name));onboardBills.filter(b=>b.selected&&Number(b.amount||0)>0).forEach(b=>{recurring.push({id:nextRecurringId++,type:'bill',name:b.name,amount:Number(b.amount||0),day:parseInt(b.day)||1,category:b.category,lastPaid:''})});const totalBills=onboardBills.filter(b=>b.selected).reduce((s,b)=>s+Number(b.amount||0),0);const baseNeeds=Math.max(salary*0.5-totalBills,0);const baseWants=Math.max(salary*0.3-169,0);budgets['Electric Bill']=Number(onboardBills.find(b=>b.name==='Electric Bill'&&b.selected)?.amount||budgets['Electric Bill']||0);budgets['Water']=Number(onboardBills.find(b=>b.name==='Water'&&b.selected)?.amount||budgets['Water']||0);budgets['Spotify']=Number(onboardBills.find(b=>b.name==='Spotify'&&b.selected)?.amount||budgets['Spotify']||0);budgets['Insurance / HMO']=Number(onboardBills.find(b=>b.name==='Insurance / HMO'&&b.selected)?.amount||budgets['Insurance / HMO']||0);budgets['Groceries & Food']=Math.round(baseNeeds*0.6);budgets['Transport']=Math.round(baseNeeds*0.15);budgets['Health / Medical']=Math.round(baseNeeds*0.1);budgets['Miscellaneous / Buffer']=Math.round(baseNeeds*0.15);budgets['Entertainment']=Math.round(baseWants*0.55);budgets['Personal / Self-Care']=Math.round(baseWants*0.25);budgets['Education / Self-Improvement']=Math.round(baseWants*0.2);budgets['Savings (BDO)']=Math.max(Math.round(salary*0.1),0);budgets['Emergency Fund (Digital Bank)']=Math.max(Math.round(salary*0.05),0);budgets['Investments (MP2/UITF)']=Math.max(Math.round(salary*0.05),0);budgets['Big Purchases / Goals']=0;localStorage.setItem('ft_onboarded','1');saveData();document.getElementById('onboard-overlay').classList.remove('show');render();setTimeout(()=>{if(shouldStartTutorial())startTutorial()},350)}

/* Edit entries/income */
function toggleEditCustom(){const wrap=document.getElementById('me-custom-cat-wrap');if(!wrap)return;wrap.style.display=document.getElementById('me-cat').value==='__other__'?'block':'none'}
function openEntryEdit(id){const e=entries.find(x=>x.id===id);if(!e)return;editingEntryId=id;buildCatSelect('me-cat');document.getElementById('me-date').value=e.date;document.getElementById('me-amount').value=e.amount;document.getElementById('me-note').value=e.note||'';document.getElementById('me-cat').value=e.category;buildAccountSelect('me-account',true);document.getElementById('me-account').value=e.account||'';toggleEditCustom();updateEntryEditPreview();openModal('modal-edit-entry')}
function saveEntryEdit(){const e=entries.find(x=>x.id===editingEntryId);if(!e)return;let cat=document.getElementById('me-cat').value;const date=document.getElementById('me-date').value;const amount=parseFloat(document.getElementById('me-amount').value);const note=document.getElementById('me-note').value;const account=document.getElementById('me-account').value;if(!date||!amount||amount<=0)return alert('Enter date and amount.');if(!account)return alert('Choose an account.');if(cat==='__other__'){const cn=document.getElementById('me-custom-cat').value.trim();if(!cn)return alert('Enter category name.');if(!allCats().find(c=>c.name===cn)){customCats.push({name:cn,budget:0,type:'other',group:'wants',icon:'🏷️',colorClass:'cat-default'});budgets[cn]=0}cat=cn;document.getElementById('me-custom-cat').value=''}const refundedAmount=account===e.account?Number(e.amount||0):0;const balanceState=getSpendValidationState(account,amount,refundedAmount);if(!balanceState.hasEnough)return alert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);adjustAccountBalance(e.account,e.amount);e.date=date;e.amount=amount;e.note=note;e.category=cat;e.account=account;adjustAccountBalance(account,-amount);closeModal('modal-edit-entry');saveData();render()}
function deleteEditingEntry(){if(editingEntryId===null)return;deleteEntry(editingEntryId);closeModal('modal-edit-entry')}
function duplicateEditingEntry(){const e=entries.find(x=>x.id===editingEntryId);if(!e)return;entries.unshift(stampRecord({...e,id:nextId++,date:todayStr,note:e.note?e.note+' (copy)':'Copy'}));closeModal('modal-edit-entry');saveData();render()}
function openIncomeEdit(id){const i=incomes.find(x=>x.id===id);if(!i)return;editingIncomeId=id;document.getElementById('mi-date').value=i.date;document.getElementById('mi-amount').value=i.amount;document.getElementById('mi-source').value=i.source;buildAccountSelect('mi-account',true);document.getElementById('mi-account').value=i.account||'';document.getElementById('mi-note').value=i.note||'';openModal('modal-edit-income')}
function saveIncomeEdit(){const i=incomes.find(x=>x.id===editingIncomeId);if(!i)return;const date=document.getElementById('mi-date').value;const amount=parseFloat(document.getElementById('mi-amount').value);const source=document.getElementById('mi-source').value;const account=document.getElementById('mi-account').value;const note=document.getElementById('mi-note').value;if(!date||!amount||amount<=0)return alert('Enter date and amount.');adjustAccountBalance(i.account,-i.amount);i.date=date;i.amount=amount;i.source=source;i.account=account;i.note=note;adjustAccountBalance(account,amount);closeModal('modal-edit-income');saveData();render()}
function deleteEditingIncome(){if(editingIncomeId===null)return;deleteIncome(editingIncomeId);closeModal('modal-edit-income')}
function duplicateEditingIncome(){const i=incomes.find(x=>x.id===editingIncomeId);if(!i)return;incomes.unshift(stampRecord({...i,id:nextIncId++,date:todayStr,note:i.note?i.note+' (copy)':'Copy'}));closeModal('modal-edit-income');saveData();render()}

/* Recurring */
function monthKeyFromDate(dateStr){return(dateStr||'').slice(0,7)}
function currentMonthKey(){return`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`}
function recurringDueDate(item,baseMonth){const[y,m]=baseMonth.split('-').map(Number);const lastDay=new Date(y,m,0).getDate();const day=Math.min(Math.max(parseInt(item.day||1),1),lastDay);return new Date(y,m-1,day)}
function recurringStatus(item){const monthKey=currentMonthKey();const paid=item.lastPaid===monthKey;const due=recurringDueDate(item,monthKey);const today=new Date(todayStr+'T00:00:00');if(paid)return{state:'paid',label:'Paid',color:'var(--green)',days:0,due};const days=Math.ceil((due-today)/864e5);if(days<0)return{state:'overdue',label:`Overdue by ${Math.abs(days)}d`,color:'var(--red)',days,due};if(days===0)return{state:'due',label:'Due today',color:'var(--amber)',days,due};return{state:'upcoming',label:`Due in ${days}d`,color:'var(--blue)',days,due}}
function toggleRecurringType(){const type=document.getElementById('r-type')?.value||'bill';const wrap=document.getElementById('r-cat-wrap');if(wrap)wrap.style.display=type==='bill'?'block':'none'}
function addRecurring(){const type=document.getElementById('r-type').value;const name=document.getElementById('r-name').value.trim();const amount=parseFloat(document.getElementById('r-amount').value)||0;const day=parseInt(document.getElementById('r-day').value)||0;const category=document.getElementById('r-cat').value;if(!name||amount<=0||day<1||day>31)return alert('Enter a valid name, amount, and day.');if(type==='bill'&&!category)return alert('Choose a category.');recurring.unshift({id:nextRecurringId++,type,name,amount,day,category:type==='bill'?category:'',lastPaid:''});['r-name','r-amount','r-day'].forEach(id=>document.getElementById(id).value='');document.getElementById('r-type').value='bill';toggleRecurringType();closeModal('modal-add-recurring');saveData();render()}
function markRecurringPaid(id){const item=recurring.find(x=>x.id===id);if(!item)return;const monthKey=currentMonthKey();const account=getDefaultAccountKey();if(item.lastPaid===monthKey)return alert('Already marked as paid this month.');if(!account)return alert(item.type==='bill'?'Add an account first to pay recurring bills.':'Add an account first to receive recurring income.');if(item.type==='bill'){const balanceState=getSpendValidationState(account,Number(item.amount||0));if(!balanceState.hasEnough)return alert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);entries.unshift(stampRecord({id:nextId++,date:todayStr,category:item.category||'Miscellaneous / Buffer',amount:item.amount,note:'Recurring: '+item.name,account}));adjustAccountBalance(account,-item.amount)}else{incomes.unshift(stampRecord({id:nextIncId++,date:todayStr,source:item.name,amount:item.amount,note:'Recurring income',account}));adjustAccountBalance(account,item.amount)}item.lastPaid=monthKey;saveData();render()}
function deleteRecurring(id){recurring=recurring.filter(r=>r.id!==id);saveData();render()}

/* Alert settings */
function setAlertToggle(key,val){alertSettings[key]=val;saveData();render()}
function setAlertThreshold(val){alertSettings.budgetThreshold=Math.min(100,Math.max(1,parseInt(val)||80));saveData();render()}

/* Smart alerts */
function getSmartAlerts(ac,catTotals,totalIncome,remaining,monthTotal,daysLeft){const alerts=[];const threshold=alertSettings.budgetThreshold||80;ac.filter(c=>c.group!=='savings'&&(budgets[c.name]||0)>0).forEach(c=>{const spent=catTotals[c.name]||0;const budget=budgets[c.name]||0;const pct=spent/budget*100;if(pct>=100)alerts.push({type:'critical',icon:'🚨',title:`${c.name} is over budget`,detail:`Spent ${fmtShort(spent)} of ${fmtShort(budget)} (${Math.round(pct)}%)`});else if(pct>=threshold)alerts.push({type:'warn',icon:'⚠️',title:`${c.name} is near limit`,detail:`Spent ${Math.round(pct)}% of budget · ${fmtShort(Math.max(budget-spent,0))} left`})});if(alertSettings.overspendForecast){const dayOfMonth=now.getDate();const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();if(dayOfMonth>=5&&dayOfMonth<daysInMonth){const projected=(monthTotal/dayOfMonth)*daysInMonth;if(projected>totalIncome)alerts.push({type:'critical',icon:'📉',title:'On track to overspend this month',detail:`Projected spend ${fmtShort(projected)} vs income ${fmtShort(totalIncome)}`});else if(projected>totalIncome*0.9)alerts.push({type:'warn',icon:'📅',title:'Month-end cash will be tight',detail:`Projected remaining ${fmtShort(totalIncome-projected)} if spending continues`})}}if(alertSettings.lowBalanceAlerts){if(remaining<0)alerts.push({type:'critical',icon:'🧯',title:'You are in the red',detail:`Current remaining balance is ${fmtShort(remaining)}`});else if(daysLeft>0&&remaining/Math.max(daysLeft,1)<200)alerts.push({type:'warn',icon:'💸',title:'Daily budget is very low',detail:`Only ${fmtShort(remaining/Math.max(daysLeft,1))} per day left this month`})}if(alertSettings.recurringDueSoon){recurring.forEach(r=>{const s=recurringStatus(r);if(s.state==='due')alerts.push({type:'warn',icon:r.type==='bill'?'🧾':'💵',title:`${r.name} is due today`,detail:`${r.type==='bill'?'Bill':'Income'} · ${fmtShort(r.amount)}`});else if(s.state==='upcoming'&&s.days<=3)alerts.push({type:'info',icon:r.type==='bill'?'🗓️':'💰',title:`${r.name} due soon`,detail:`In ${s.days} day${s.days!==1?'s':''} · ${fmtShort(r.amount)}`});else if(s.state==='overdue')alerts.push({type:'critical',icon:'⏰',title:`${r.name} is overdue`,detail:`Past due by ${Math.abs(s.days)} day${Math.abs(s.days)!==1?'s':''}`})})}if(alertSettings.spikeAlerts){const lastMonthDate=new Date(now.getFullYear(),now.getMonth()-1,1);const lastMonthKey=`${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth()+1).padStart(2,'0')}`;const lastMonthTotals={};entries.filter(e=>e.date.startsWith(lastMonthKey)&&!e.isDebtPayment).forEach(e=>{lastMonthTotals[e.category]=(lastMonthTotals[e.category]||0)+e.amount});ac.filter(c=>c.group!=='savings').forEach(c=>{const current=catTotals[c.name]||0;const prev=lastMonthTotals[c.name]||0;if(prev>=500&&current>prev*1.5)alerts.push({type:'info',icon:'📈',title:`${c.name} spending spiked`,detail:`${fmtShort(current)} this month vs ${fmtShort(prev)} last month`})})}const seen=new Set();return alerts.filter(a=>{const key=a.title+'|'+a.detail;if(seen.has(key))return false;seen.add(key);return true}).slice(0,6)}

/* Forecast */
function getProjectedRecurringImpact(){const monthKey=currentMonthKey();const today=new Date(todayStr+'T00:00:00');let expenses=0,income=0;recurring.forEach(r=>{if(r.lastPaid===monthKey)return;const due=recurringDueDate(r,monthKey);if(due>=today){if(r.type==='bill')expenses+=Number(r.amount||0);else income+=Number(r.amount||0)}});return{expenses,income}}
function getForecastData(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft){const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();const dayOfMonth=Math.max(now.getDate(),1);const safeDays=Math.max(dayOfMonth,7);function getProjectedCategoryValue(cat,spent,budget){spent=Number(spent||0);budget=Number(budget||0);if(cat.type==='fixed'){const recurringMatch=recurring.find(r=>r.type==='bill'&&r.category===cat.name&&r.lastPaid!==currentMonthKey());return recurringMatch?Math.max(spent,Number(recurringMatch.amount||0)):spent}if(cat.type==='variable'){if(spent<=0)return 0;const rawTrend=(spent/safeDays)*daysInMonth;let projected=dayOfMonth<7?Math.max(spent,spent+(rawTrend-spent)*0.35):Math.max(spent,rawTrend);if(dayOfMonth<7&&budget>0)projected=Math.min(projected,Math.max(spent,budget*1.5));return projected}return spent}const avgDailySpend=monthTotal/safeDays;const fixedSpent=ac.filter(c=>c.type==='fixed').reduce((sum,c)=>sum+getProjectedCategoryValue(c,catTotals[c.name]||0,budgets[c.name]||0),0);const variableProjectedSpend=ac.filter(c=>c.type==='variable').reduce((sum,c)=>sum+getProjectedCategoryValue(c,catTotals[c.name]||0,budgets[c.name]||0),0);const recurringImpact=getProjectedRecurringImpact();const projectedSpend=Math.max(fixedSpent+variableProjectedSpend+recurringImpact.expenses,monthTotal);const projectedIncome=totalIncome+recurringImpact.income;const projectedBalance=projectedIncome-projectedSpend;const safeDailySpend=daysLeft>0?Math.max((remaining-recurringImpact.expenses+recurringImpact.income)/daysLeft,0):0;let status='On Track',color='var(--green)',subtitle='Looking healthy.';if(projectedBalance<0){status='Overspending';color='var(--red)';subtitle='May finish the month negative.'}else if(projectedBalance<projectedIncome*0.1){status='Tight';color='var(--amber)';subtitle='Watch daily spending.'}else if(projectedBalance>projectedIncome*0.2){status='Strong';color='var(--blue)';subtitle='Strong month-end cushion.'}return{avgDailySpend,projectedSpend,projectedIncome,projectedBalance,safeDailySpend,recurringImpact,status,color,subtitle}}

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
    const current=Number(nwBalances[incAcc]||0);
    incWrap.innerHTML=`<div class="add-subtitle" style="margin-bottom:4px">Income balance preview</div><div><strong>${esc(getAccountInfo(incAcc).name)}</strong> now: ${fmt(current)}</div><div>After this income: <strong>${fmt(current+incAmount)}</strong></div>`;
  }
}
function updateEntryEditPreview(){const e=entries.find(x=>x.id===editingEntryId);const wrap=document.getElementById('me-balance-preview');if(!e||!wrap)return;const account=document.getElementById('me-account')?.value||'';const amount=parseFloat(document.getElementById('me-amount')?.value)||0;const refundedAmount=account===e.account?Number(e.amount||0):0;const extraLines=account&&account!==e.account?[`<div>${esc(getAccountInfo(e.account).name)} will get back <strong>${fmt(e.amount||0)}</strong> when you save.</div>`]:[];renderSpendBalancePreview({wrapId:'me-balance-preview',buttonId:'me-save-btn',title:'Edit balance preview',account,amount,submitLabel:'Save',afterLabel:'After saving this edit',refundedAmount,extraLines,okMessage:'Enough balance for this edit.',warningMessage:'Not enough balance in this account.'})}
function updateGoalContributionPreview(){const wrap=document.getElementById('gc-balance-preview');if(!wrap)return;const account=document.getElementById('gc-account')?.value||'';const amount=parseFloat(document.getElementById('gc-amount')?.value)||0;renderSpendBalancePreview({wrapId:'gc-balance-preview',buttonId:'gc-save-btn',title:'Contribution balance preview',account,amount,submitLabel:'Save',afterLabel:'After this contribution',okMessage:'Enough balance for this contribution.',warningMessage:'Not enough balance in this account.'})}
function updateDebtPaymentPreview(){const wrap=document.getElementById('dp-balance-preview');const debt=debts.find(d=>d.id===activeDebtPaymentDebtId);if(!wrap||!debt)return;const account=document.getElementById('dp-account')?.value||'';const rawAmount=parseFloat(document.getElementById('dp-amount')?.value)||0;const amount=Math.min(rawAmount,Math.max(Number(debt.total||0),0));const extraLines=rawAmount>amount&&amount>0?[`<div>Only <strong>${fmt(amount)}</strong> will be applied because that is the remaining debt balance.</div>`]:[];renderSpendBalancePreview({wrapId:'dp-balance-preview',buttonId:'dp-save-btn',title:'Payment balance preview',account,amount,submitLabel:'Save Payment',afterLabel:'After this payment',extraLines,okMessage:'Enough balance for this payment.',warningMessage:'Not enough balance in this account.'})}
function renderExpenseTemplates(){const wrap=document.getElementById('expense-templates');if(!wrap)return;wrap.innerHTML=(addFlowState.favoriteExpenseTemplates||[]).map((t,idx)=>`<button type="button" class="template-card" onclick="applyExpenseTemplate(${idx})"><div class="template-title">${esc(t.label)}</div><div class="template-meta">${esc(t.category)}${t.amount?` · ${fmtShort(t.amount)}`:''}</div></button>`).join('');}
function applyExpenseTemplate(idx){const t=(addFlowState.favoriteExpenseTemplates||[])[idx];if(!t)return;document.getElementById('f-cat').value=t.category;toggleCustom();if(t.account)document.getElementById('f-account').value=t.account;if(t.note!==undefined)document.getElementById('f-note').value=t.note;if(t.amount)document.getElementById('f-amount').value=t.amount;updateAddPreviews();renderExpenseSuggestions();}
function applyExpenseAmount(value){document.getElementById('f-amount').value=value;updateAddPreviews();}
function applyExpensePattern(category){const p=(addFlowState.lastExpenseByCategory||{})[category];if(!p)return;if(p.account)document.getElementById('f-account').value=p.account;if(p.note)document.getElementById('f-note').value=p.note;if(p.amount)document.getElementById('f-amount').value=p.amount;updateAddPreviews();}
function renderExpenseSuggestions(){const wrap=document.getElementById('expense-suggestions');if(!wrap)return;const cat=document.getElementById('f-cat')?.value||'';const pattern=(addFlowState.lastExpenseByCategory||{})[cat];const sameCat=entries.filter(e=>e.category===cat).sort((a,b)=>new Date(getSortStamp(b))-new Date(getSortStamp(a))).slice(0,8);const amounts=[...new Set(sameCat.map(e=>Number(e.amount||0)).filter(v=>v>0))].slice(0,3);const notes=[...new Set(sameCat.map(e=>e.note).filter(Boolean))].slice(0,2);let html='<div class="add-suggestion-row">';if(pattern&&pattern.account)html+=`<button type="button" class="quick-chip" onclick="applyExpensePattern(${JSON.stringify(cat)})">Use last ${esc(getAccountInfo(pattern.account).name)}</button>`;amounts.forEach(v=>html+=`<button type="button" class="quick-chip" onclick="applyExpenseAmount(${v})">${fmtShort(v)}</button>`);notes.forEach(n=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('f-note').value=${JSON.stringify(n)}">${esc(n)}</button>`);html+='</div>';wrap.innerHTML=html;}
function applyIncomePattern(source){const p=(addFlowState.lastIncomeBySource||{})[source];if(!p)return;if(p.account)document.getElementById('inc-account').value=p.account;if(p.note)document.getElementById('inc-note').value=p.note;if(p.amount)document.getElementById('inc-amount').value=p.amount;updateAddPreviews();}
function renderIncomeSuggestions(){const wrap=document.getElementById('income-suggestions');if(!wrap)return;const source=document.getElementById('inc-source')?.value||'';const pattern=(addFlowState.lastIncomeBySource||{})[source];const sameSource=incomes.filter(i=>i.source===source).sort((a,b)=>new Date(getSortStamp(b))-new Date(getSortStamp(a))).slice(0,8);const amounts=[...new Set(sameSource.map(i=>Number(i.amount||0)).filter(v=>v>0))].slice(0,3);const notes=[...new Set(sameSource.map(i=>i.note).filter(Boolean))].slice(0,2);let html='<div class="add-suggestion-row">';if(pattern&&pattern.account)html+=`<button type="button" class="quick-chip" onclick="applyIncomePattern(${JSON.stringify(source)})">Use last ${esc(getAccountInfo(pattern.account).name)}</button>`;amounts.forEach(v=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('inc-amount').value=${v};updateAddPreviews()">${fmtShort(v)}</button>`);notes.forEach(n=>html+=`<button type="button" class="quick-chip" onclick="document.getElementById('inc-note').value=${JSON.stringify(n)}">${esc(n)}</button>`);html+='</div>';wrap.innerHTML=html;}
function resetExpenseForm(keepCategory=false){document.getElementById('f-amount').value='';if(!keepCategory){document.getElementById('f-cat').selectedIndex=0;toggleCustom();}document.getElementById('f-date').value=todayStr;document.getElementById('f-note').value='';updateAddPreviews();renderExpenseSuggestions();}
function resetIncomeForm(keepSource=false){document.getElementById('inc-amount').value='';if(!keepSource)document.getElementById('inc-source').selectedIndex=0;document.getElementById('inc-date').value=todayStr;document.getElementById('inc-note').value='';updateAddPreviews();renderIncomeSuggestions();}
function checkLikelyDuplicateExpense(entry){return entries.some(e=>e.date===entry.date&&e.category===entry.category&&Number(e.amount||0)===Number(entry.amount||0)&&(e.note||'')===(entry.note||''));}
function addEntryCore(stayOnAdd=false){const date=document.getElementById('f-date').value||todayStr;const amount=parseFloat(document.getElementById('f-amount').value);let category=document.getElementById('f-cat').value;const account=document.getElementById('f-account').value;const note=document.getElementById('f-note').value.trim();if(category==='__other__'){const c=document.getElementById('f-custom-cat').value.trim();if(!c)return alert('Enter custom category name.');if(!customCats.some(x=>x.name===c)&&!CATS.some(x=>x.name===c)){customCats.push({name:c,budget:0,type:'variable',group:'needs',icon:'📦',colorClass:'cat-default'});budgets[c]=0}category=c}if(!date||!amount||amount<=0||!category||!account)return alert('Please complete all required fields.');const entry=stampRecord({id:nextId++,date,amount,category,account,note});if(checkLikelyDuplicateExpense(entry)&&!confirm('This looks similar to a recent expense. Add anyway?'))return;entries.unshift(entry);adjustAccountBalance(account,-amount);rememberExpensePattern(entry);saveData();render();showActionToast(`${fmt(amount)} expense added`,category,'🧾');if(stayOnAdd){resetExpenseForm(true);showTab('add');}else showTab('dashboard');}
function addIncomeCore(stayOnAdd=false){const date=document.getElementById('inc-date').value||todayStr;const amount=parseFloat(document.getElementById('inc-amount').value);const source=document.getElementById('inc-source').value;const account=document.getElementById('inc-account').value;const note=document.getElementById('inc-note').value.trim();if(!date||!amount||amount<=0||!source||!account)return alert('Please complete all required fields.');const income=stampRecord({id:nextIncId++,date,source,amount,note,account});incomes.unshift(income);adjustAccountBalance(account,amount);rememberIncomePattern(income);saveData();render();showActionToast(`${fmt(amount)} income added`,source,'💰');if(stayOnAdd){resetIncomeForm(true);showTab('add');}else showTab('dashboard');}
function addEntry(){const date=document.getElementById('f-date').value;let cat=document.getElementById('f-cat').value;const amount=parseFloat(document.getElementById('f-amount').value);const note=document.getElementById('f-note').value;const account=document.getElementById('f-account').value;if(!date||!amount||amount<=0)return alert('Enter date and amount.');const currentBalance=Number(nwBalances[account]||0);if(amount>currentBalance)return alert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(currentBalance)}`);if(cat==='__other__'){const cn=document.getElementById('f-custom-cat').value.trim();if(!cn)return alert('Enter category name.');if(!allCats().find(c=>c.name===cn)){customCats.push({name:cn,budget:0,type:'other',group:'wants',icon:'🏷️',colorClass:'cat-default'});budgets[cn]=0}cat=cn;document.getElementById('f-custom-cat').value=''}entries.unshift(stampRecord({id:nextId++,date,category:cat,amount,note,account}));adjustAccountBalance(account,-amount);document.getElementById('f-amount').value='';document.getElementById('f-note').value='';saveData();render();showActionToast(`${fmt(amount)} expense saved`,`${cat}${account?` · ${getAccountInfo(account).name}`:''}`,'💸');if(tutorialActive&&TUTORIAL_STEPS[tutorialStep]&&TUTORIAL_STEPS[tutorialStep].submit){tutorialAfterExpenseSaved()}else{showTab('dashboard')}}
function quickAdd(c){document.getElementById('f-cat').value=c;toggleCustom();showTab('add');document.getElementById('f-amount').focus()}
function deleteEntry(id){const e=entries.find(x=>x.id===id);if(e)adjustAccountBalance(e.account,e.amount);entries=entries.filter(e=>e.id!==id);saveData();render()}
function addIncome(){const date=document.getElementById('inc-date').value;const source=document.getElementById('inc-source').value;const amount=parseFloat(document.getElementById('inc-amount').value);const note=document.getElementById('inc-note').value;const account=document.getElementById('inc-account').value;if(!date||!amount||amount<=0)return alert('Enter date and amount.');incomes.unshift(stampRecord({id:nextIncId++,date,source,amount,note,account}));adjustAccountBalance(account,amount);document.getElementById('inc-amount').value='';document.getElementById('inc-note').value='';saveData();render();showActionToast(`${fmt(amount)} added`,`${source}${account?` · ${getAccountInfo(account).name}`:''}`,'💵')}
function deleteIncome(id){const i=incomes.find(x=>x.id===id);if(i)adjustAccountBalance(i.account,-i.amount);incomes=incomes.filter(i=>i.id!==id);saveData();render()}
function addGoal(){const name=document.getElementById('g-name').value.trim();const target=parseFloat(document.getElementById('g-target').value)||0;const current=parseFloat(document.getElementById('g-current').value)||0;const monthly=parseFloat(document.getElementById('g-monthly').value)||0;if(!name||target<=0)return alert('Enter name and target.');goals.push({id:nextGoalId++,name,target,current,monthly});['g-name','g-target','g-current','g-monthly'].forEach(id=>document.getElementById(id).value='');closeModal('modal-add-goal');saveData();render()}
function getGoalContributions(goalId){return goalContributions.filter(c=>c.goalId===goalId).sort((a,b)=>getSortStamp(b).localeCompare(getSortStamp(a))||b.id-a.id)}
function getGoalContributionSummary(goalId){const list=getGoalContributions(goalId);return{count:list.length,total:list.reduce((s,c)=>s+Number(c.amount||0),0),latest:list[0]||null}}
function openGoalContribution(id){const g=goals.find(x=>x.id===id);if(!g)return;activeGoalContributionGoalId=id;document.getElementById('gc-amount').value=g.monthly||'';document.getElementById('gc-date').value=todayStr;buildAccountSelect('gc-account',true);document.getElementById('gc-account').value=getDefaultAccountKey();document.getElementById('gc-note').value='';updateGoalContributionPreview();openModal('modal-goal-contribution')}
function applyQuickGoalContribution(amount){document.getElementById('gc-amount').value=amount;updateGoalContributionPreview()}
function applyGoalMonthlyContribution(){const g=goals.find(x=>x.id===activeGoalContributionGoalId);if(!g)return;document.getElementById('gc-amount').value=Number(g.monthly||0)||'';updateGoalContributionPreview()}
function saveGoalContribution(){const g=goals.find(x=>x.id===activeGoalContributionGoalId);if(!g)return;const amount=parseFloat(document.getElementById('gc-amount').value)||0;const date=document.getElementById('gc-date').value;const account=document.getElementById('gc-account').value||getDefaultAccountKey();const note=document.getElementById('gc-note').value.trim();if(amount<=0||!date)return alert('Enter a valid amount and date.');if(!account)return alert('Choose an account.');const balanceState=getSpendValidationState(account,amount);if(!balanceState.hasEnough)return alert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);g.current=Math.min(Number(g.target||0),Number(g.current||0)+amount);const contributionId=nextGoalContributionId++;goalContributions.unshift(stampRecord({id:contributionId,goalId:g.id,name:g.name,amount,date,account,note}));entries.unshift(stampRecord({id:nextId++,date,category:'Goal Contribution',amount,note:`Goal Contribution: ${g.name}${note?` · ${note}`:''}`,account,isGoalContribution:true,goalId:g.id,goalContributionId:contributionId}));adjustAccountBalance(account,-amount);const goalDone=Number(g.current||0)>=Number(g.target||0)&&Number(g.target||0)>0;closeModal('modal-goal-contribution');saveData();render();showActionToast(`${fmt(amount)} added to ${g.name}`,`New saved amount: ${fmt(g.current||0)}`,'🎯');if(goalDone)showMilestoneSheet({icon:'🎯',title:'Goal completed',body:`${g.name} is now fully funded.`,statLabel:'Saved total',statValue:fmt(g.current||0)})}
function deleteGoalContribution(id){const gc=goalContributions.find(x=>x.id===id);if(!gc)return;const g=goals.find(x=>x.id===gc.goalId);if(g)g.current=Math.max(0,Number(g.current||0)-Number(gc.amount||0));adjustAccountBalance(gc.account,Number(gc.amount||0));goalContributions=goalContributions.filter(x=>x.id!==id);entries=entries.filter(e=>e.goalContributionId!==id);saveData();render()}
function openGoalHistory(id){const g=goals.find(x=>x.id===id);if(!g)return;document.getElementById('gh-title').textContent=`${g.name} Contributions`;const list=getGoalContributions(id);document.getElementById('gh-list').innerHTML=list.length?`<div class="tx-list">${list.map(c=>{const ai=getAccountInfo(c.account);return `<div class="tx-item"><div class="tx-icon cat-savings">🎯</div><div class="tx-info"><div class="tx-name">${fmt(c.amount)}</div><div class="tx-meta">${c.date}${c.note?` · ${esc(c.note)}`:''}${ai.name?` · ${esc(ai.name)}`:''}</div></div><button class="btn-icon tx-delete" onclick="deleteGoalContribution(${c.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}).join('')}</div>`:'<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">No contributions yet</div></div>';openModal('modal-goal-history')}
function openGoalEdit(id){const g=goals.find(x=>x.id===id);if(!g)return;editingGoalId=id;document.getElementById('mg-name').value=g.name;document.getElementById('mg-target').value=g.target;document.getElementById('mg-current').value=g.current;document.getElementById('mg-monthly').value=g.monthly;openModal('modal-edit-goal')}
function saveGoalEdit(){const g=goals.find(x=>x.id===editingGoalId);if(!g)return;g.name=document.getElementById('mg-name').value.trim()||g.name;g.target=parseFloat(document.getElementById('mg-target').value)||g.target;g.current=parseFloat(document.getElementById('mg-current').value)||0;g.monthly=parseFloat(document.getElementById('mg-monthly').value)||0;closeModal('modal-edit-goal');saveData();render()}
function deleteGoal(){goals=goals.filter(g=>g.id!==editingGoalId);closeModal('modal-edit-goal');saveData();render()}
function addDebt(){const name=document.getElementById('d-name').value.trim();const type=document.getElementById('d-type').value;const total=parseFloat(document.getElementById('d-total').value)||0;const payment=parseFloat(document.getElementById('d-payment').value)||0;const interest=parseFloat(document.getElementById('d-interest').value)||0;const due=document.getElementById('d-due').value.trim();if(!name||total<=0)return alert('Enter name and amount.');debts.push({id:nextDebtId++,name,type,total,payment,interest,due});['d-name','d-total','d-payment','d-interest','d-due'].forEach(id=>document.getElementById(id).value='');closeModal('modal-add-debt');saveData();render()}
function openDebtEdit(id){const d=debts.find(x=>x.id===id);if(!d)return;editingDebtId=id;document.getElementById('md-name').value=d.name;document.getElementById('md-total').value=d.total;document.getElementById('md-payment').value=d.payment;document.getElementById('md-interest').value=d.interest;openModal('modal-edit-debt')}
function saveDebtEdit(){const d=debts.find(x=>x.id===editingDebtId);if(!d)return;d.name=document.getElementById('md-name').value.trim()||d.name;d.total=parseFloat(document.getElementById('md-total').value)||0;d.payment=parseFloat(document.getElementById('md-payment').value)||0;d.interest=parseFloat(document.getElementById('md-interest').value)||0;closeModal('modal-edit-debt');saveData();render()}
function deleteDebt(){debts=debts.filter(d=>d.id!==editingDebtId);closeModal('modal-edit-debt');saveData();render()}
function getDebtPaymentsForDebt(id){return debtPayments.filter(p=>p.debtId===id).sort((a,b)=>getSortStamp(b).localeCompare(getSortStamp(a))||b.id-a.id)}
function getDebtPaymentSummary(id){const list=getDebtPaymentsForDebt(id);const total=list.reduce((sum,p)=>sum+Number(p.amount||0),0);return{count:list.length,total,latest:list[0]||null}}
function getActiveDebts(){return debts.filter(d=>Number(d.total||0)>0)}
function getPaidOffDebts(){return debts.filter(d=>Number(d.total||0)<=0)}
function openDebtHistory(id){const debt=debts.find(d=>d.id===id);if(!debt)return;document.getElementById('dh-title').textContent=`${debt.name} Payments`;const list=getDebtPaymentsForDebt(id);document.getElementById('dh-list').innerHTML=list.length?list.map(p=>`<div class="tx-item"><div class="tx-icon cat-debt">💳</div><div class="tx-info"><div class="tx-name">${fmt(p.amount)}</div><div class="tx-meta">${esc(formatDateTime(p))}${p.markedMonthly?' · monthly':''}${p.account?` · ${esc(getAccountInfo(p.account).name)}`:''}${p.note?` · ${esc(p.note)}`:''}</div></div></div>`).join(''):`<div class="empty"><div class="empty-text">No payments yet</div></div>`;openModal('modal-debt-history')}
function openDebtPayment(id){const debt=debts.find(x=>x.id===id);if(!debt)return;activeDebtPaymentDebtId=id;document.getElementById('dp-debt-name').textContent=`Payment for ${debt.name}`;document.getElementById('dp-amount').value=debt.payment||debt.total||'';document.getElementById('dp-date').value=todayStr;document.getElementById('dp-note').value='';document.getElementById('dp-mark-paid').value='yes';buildAccountSelect('dp-account',true);document.getElementById('dp-account').value=getDefaultAccountKey();updateDebtPaymentPreview();openModal('modal-debt-payment')}
function saveDebtPayment(){const debt=debts.find(d=>d.id===activeDebtPaymentDebtId);if(!debt)return;const rawAmount=parseFloat(document.getElementById('dp-amount').value)||0;const date=document.getElementById('dp-date').value;const account=document.getElementById('dp-account').value||getDefaultAccountKey();const note=document.getElementById('dp-note').value.trim();const markPaid=document.getElementById('dp-mark-paid').value==='yes';if(rawAmount<=0||!date)return alert('Enter a valid amount and date.');if(!account)return alert('Choose an account.');const amount=Math.min(rawAmount,Math.max(Number(debt.total||0),0));if(amount<=0)return alert('This debt is already fully paid.');const balanceState=getSpendValidationState(account,amount);if(!balanceState.hasEnough)return alert(`Not enough balance in ${getAccountInfo(account).name}. Available: ${fmt(balanceState.available)}`);debt.total=Math.max(0,Number(debt.total||0)-amount);if(markPaid)debt.lastPaidMonth=(date||todayStr).slice(0,7);debt.lastPaidDate=date;debt.lastPaidAmount=amount;const paymentId=nextDebtPaymentId++;debtPayments.unshift(stampRecord({id:paymentId,debtId:debt.id,name:debt.name,amount,date,account,note,markedMonthly:markPaid}));entries.unshift(stampRecord({id:nextId++,date,category:'Debt Payment',amount,note:`Debt Payment: ${debt.name}${note?` · ${note}`:''}`,account,isDebtPayment:true,debtId:debt.id,debtPaymentId:paymentId}));adjustAccountBalance(account,-amount);const cleared=Number(debt.total||0)<=0;closeModal('modal-debt-payment');saveData();render();showActionToast(`${fmt(amount)} paid to ${debt.name}`,`Remaining balance: ${fmt(debt.total||0)}`,'💳');if(cleared)showMilestoneSheet({icon:'🎉',title:'Debt cleared',body:`${debt.name} is now fully paid.`,statLabel:'Amount cleared',statValue:fmt(amount)})}
function deleteDebtPayment(paymentId){const payment=debtPayments.find(p=>p.id===paymentId);if(!payment)return;const debt=debts.find(d=>d.id===payment.debtId);if(debt){debt.total=Number(debt.total||0)+Number(payment.amount||0);const remaining=getDebtPaymentsForDebt(payment.debtId).filter(p=>p.id!==paymentId);const latest=remaining[0];if(latest&&latest.markedMonthly){debt.lastPaidMonth=(latest.date||'').slice(0,7);debt.lastPaidDate=latest.date;debt.lastPaidAmount=latest.amount}else{delete debt.lastPaidMonth;delete debt.lastPaidDate;delete debt.lastPaidAmount}}adjustAccountBalance(payment.account,Number(payment.amount||0));debtPayments=debtPayments.filter(p=>p.id!==paymentId);entries=entries.filter(e=>e.debtPaymentId!==paymentId);saveData();render()}
function addWish(){const name=document.getElementById('w-name').value.trim();const price=parseFloat(document.getElementById('w-price').value)||0;const priority=document.getElementById('w-priority').value;if(!name)return alert('Enter item name.');wishlist.push({id:nextWishId++,name,price,priority,addedDate:todayStr});document.getElementById('w-name').value='';document.getElementById('w-price').value='';closeModal('modal-add-wish');saveData();render()}
function deleteWish(id){wishlist=wishlist.filter(w=>w.id!==id);saveData();render()}
function buyWish(id){const w=wishlist.find(x=>x.id===id);if(!w)return;if(confirm(`Buy "${w.name}" and log ${fmt(w.price)}?`)){entries.unshift({id:nextId++,date:todayStr,category:'Big Purchases / Goals',amount:w.price,note:'Wishlist: '+w.name,account:getDefaultAccountKey()});adjustAccountBalance(getDefaultAccountKey(),-w.price);wishlist=wishlist.filter(x=>x.id!==id);saveData();render()}}
function addJournal(){const month=document.getElementById('j-month').value;const title=document.getElementById('j-title').value.trim();const note=document.getElementById('j-note').value.trim();if(!note)return alert('Write something!');journal.unshift({id:nextJournalId++,month:month||filterMonth,title,note,date:todayStr});document.getElementById('j-title').value='';document.getElementById('j-note').value='';closeModal('modal-add-journal');saveData();render()}
function deleteJournal(id){journal=journal.filter(j=>j.id!==id);saveData();render()}
function saveNetWorth(){nwAccounts.forEach(a=>{const el=document.getElementById('nw-'+a.key);if(el)nwBalances[a.key]=parseFloat(el.value)||0});const total=nwAccounts.reduce((s,a)=>s+(nwBalances[a.key]||0),0);const totalDebt=debts.reduce((s,d)=>s+d.total,0);const mo=filterMonth;const existing=nwHistory.findIndex(h=>h.month===mo);const rec={month:mo,total,debt:totalDebt,net:total-totalDebt,balances:{...nwBalances}};if(existing>=0)nwHistory[existing]=rec;else nwHistory.push(rec);nwHistory.sort((a,b)=>a.month.localeCompare(b.month));saveData();render()}
function openEditModal(n){editingCat=n;document.getElementById('modal-edit-name').value=n;openModal('modal-edit-cat')}
function openDeleteModal(n){deletingCat=n;const cnt=entries.filter(e=>e.category===n).length;document.getElementById('modal-delete-msg').innerHTML=`Delete <strong>"${esc(n)}"</strong>?`+(cnt?` (${cnt} transaction${cnt>1?'s':''} will move to Misc)`:' No transactions to move.');openModal('modal-delete-cat')}
function confirmEdit(){const nn=document.getElementById('modal-edit-name').value.trim();if(!nn)return;if(nn===editingCat){closeModal('modal-edit-cat');return}if(allCats().find(c=>c.name===nn))return alert('Name exists.');const idx=customCats.findIndex(c=>c.name===editingCat);if(idx===-1)return;entries.forEach(e=>{if(e.category===editingCat)e.category=nn});budgets[nn]=budgets[editingCat]||0;delete budgets[editingCat];customCats[idx].name=nn;closeModal('modal-edit-cat');saveData();render()}
function confirmDelete(){if(!deletingCat)return;entries.forEach(e=>{if(e.category===deletingCat)e.category='Miscellaneous / Buffer'});delete budgets[deletingCat];customCats=customCats.filter(c=>c.name!==deletingCat);closeModal('modal-delete-cat');saveData();render()}

/* Rebalance & Smart Budget */
let rebalanceMode='503020',pendingBudgetPreview=null,pendingSmartRefreshPreview=null,smartBudgetMode='503020';
function selectRebalanceMode(mode){rebalanceMode=mode;['503020','lastmonth','savemore'].forEach(m=>{const el=document.getElementById('rebalance-mode-'+m);if(el)el.classList.toggle('active',m===mode)});renderBudgetPreview()}
function getLastMonthKey(){const d=new Date(now.getFullYear(),now.getMonth()-1,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function getFixedBudgetMap(useCurrentFallback=true){const fixedMap={};allCats().filter(c=>c.type==='fixed').forEach(c=>{const recurringAmt=recurring.filter(r=>r.type==='bill'&&r.category===c.name).reduce((s,r)=>s+Number(r.amount||0),0);const currentBudget=Number(budgets[c.name]||0);if(recurringAmt>0&&currentBudget>0)fixedMap[c.name]=Math.min(recurringAmt,currentBudget);else fixedMap[c.name]=recurringAmt||(useCurrentFallback?currentBudget:0)});return fixedMap}
function computeBudgetPreview(mode,salaryValue){const ac=allCats();const fixedMap=getFixedBudgetMap(true);const fixedTotal=Object.values(fixedMap).reduce((s,v)=>s+Number(v||0),0);const variableNeedsCats=ac.filter(c=>c.type==='variable'&&c.group==='needs');const variableWantsCats=ac.filter(c=>c.type==='variable'&&c.group==='wants');const savingsCats=ac.filter(c=>c.group==='savings');const result={};Object.keys(fixedMap).forEach(k=>result[k]=Math.round(fixedMap[k]||0));if(mode==='503020'||mode==='savemore'){const split=mode==='savemore'?{needs:50,wants:20,savings:30}:{needs:50,wants:30,savings:20};const targetNeeds=Math.max((salaryValue*split.needs/100)-fixedTotal,0);const targetWants=Math.max(salaryValue*split.wants/100,0);const targetSavings=Math.max(salaryValue*split.savings/100,0);const nw={'Groceries & Food':.55,Transport:.15,'Health / Medical':.10,'Education / Self-Improvement':.08,'Miscellaneous / Buffer':.12};const ww={Entertainment:.45,'Personal / Self-Care':.30,'Education / Self-Improvement':.10,'Miscellaneous / Buffer':.15};const sw={'Savings (BDO)':.40,'Emergency Fund (Digital Bank)':.30,'Investments (MP2/UITF)':.20,'Big Purchases / Goals':.10};variableNeedsCats.forEach(c=>{result[c.name]=Math.round(targetNeeds*(nw[c.name]??(1/Math.max(variableNeedsCats.length,1))))});variableWantsCats.forEach(c=>{result[c.name]=Math.round(targetWants*(ww[c.name]??(1/Math.max(variableWantsCats.length,1))))});savingsCats.forEach(c=>{result[c.name]=Math.round(targetSavings*(sw[c.name]??(1/Math.max(savingsCats.length,1))))})}else if(mode==='lastmonth'){const lastMonthKey=getLastMonthKey();const lastTotals={};entries.filter(e=>e.date.startsWith(lastMonthKey)).forEach(e=>{lastTotals[e.category]=(lastTotals[e.category]||0)+Number(e.amount||0)});variableNeedsCats.forEach(c=>{result[c.name]=Math.round(Number(lastTotals[c.name]||budgets[c.name]||0)*1.1)});variableWantsCats.forEach(c=>{result[c.name]=Math.round(Number(lastTotals[c.name]||budgets[c.name]||0)*1.05)});savingsCats.forEach(c=>{result[c.name]=Math.round(Number(budgets[c.name]||0))});const totalPlanned=Object.values(result).reduce((s,v)=>s+Number(v||0),0);if(totalPlanned>salaryValue){const trimTarget=totalPlanned-salaryValue;const reducible=variableWantsCats.reduce((s,c)=>s+Number(result[c.name]||0),0);if(reducible>0)variableWantsCats.forEach(c=>{const share=Number(result[c.name]||0)/reducible;result[c.name]=Math.max(0,Math.round(Number(result[c.name]||0)-trimTarget*share))})}}const total=Object.values(result).reduce((s,v)=>s+Number(v||0),0);return{budgets:result,total,fixedTotal}}
function renderBudgetPreview(){const salaryValue=parseFloat(document.getElementById('rebalance-salary')?.value)||0;if(salaryValue<=0){document.getElementById('rebalance-summary').innerHTML='';document.getElementById('rebalance-preview').innerHTML='<div class="empty"><div class="empty-text">Enter a salary to preview.</div></div>';pendingBudgetPreview=null;return}const preview=computeBudgetPreview(rebalanceMode,salaryValue);pendingBudgetPreview=preview;const changed=Object.keys(preview.budgets).map(name=>{const current=Number(budgets[name]||0);const next=Number(preview.budgets[name]||0);return{name,current,next,diff:next-current}}).filter(x=>x.current!==x.next).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));document.getElementById('rebalance-summary').innerHTML=`<div class="card" style="padding:14px;margin:0"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div style="font-size:13px;font-weight:700">Planned: ${fmtShort(preview.total)}</div><div style="font-size:13px;font-weight:700;color:${preview.total>salaryValue?'var(--red)':'var(--green)'}">Salary: ${fmtShort(salaryValue)}</div></div></div>`;if(!changed.length){document.getElementById('rebalance-preview').innerHTML='<div class="empty"><div class="empty-text">No changes.</div></div>';return}document.getElementById('rebalance-preview').innerHTML=`<div style="display:grid;gap:8px;margin-top:10px">${changed.slice(0,12).map(item=>`<div style="padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm)"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-size:13px;font-weight:600">${esc(item.name)}</div><div style="font-size:12px;font-weight:700;color:${item.diff>0?'var(--green)':item.diff<0?'var(--red)':'var(--text3)'}">${item.diff>0?'+':''}${fmtShort(item.diff)}</div></div><div style="font-size:12px;color:var(--text3);margin-top:4px">${fmtShort(item.current)} → ${fmtShort(item.next)}</div></div>`).join('')}</div>`}
function openBudgetRebalance(){document.getElementById('rebalance-salary').value=salary||'';selectRebalanceMode(rebalanceMode);renderBudgetPreview();openModal('modal-budget-rebalance')}
function applyBudgetRebalance(){if(!pendingBudgetPreview)return alert('Preview first.');Object.keys(pendingBudgetPreview.budgets).forEach(name=>{budgets[name]=Math.round(Number(pendingBudgetPreview.budgets[name]||0))});saveData();closeModal('modal-budget-rebalance');render();showTab('more')}

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
function applySmartRefresh(){if(!pendingSmartRefreshPreview)return alert('Preview suggestions first.');Object.keys(pendingSmartRefreshPreview.budgets).forEach(name=>{budgets[name]=Math.round(Number(pendingSmartRefreshPreview.budgets[name]||0))});saveData();closeModal('modal-smart-refresh');render();showActionToast('Smart Refresh applied','Suggested budgets were applied to your categories.','🧠');showTab('more')}
function selectSmartMode(mode){smartBudgetMode=mode;const a=document.getElementById('smart-mode-503020');const b=document.getElementById('smart-mode-conservative');if(a)a.classList.toggle('active',mode==='503020');if(b)b.classList.toggle('active',mode==='conservative')}
function getRecurringBillAmount(categoryName){return recurring.filter(r=>r.type==='bill'&&r.category===categoryName).reduce((sum,r)=>sum+Number(r.amount||0),0)}
function runSmartBudgetSetup(){const newSalary=parseFloat(document.getElementById('smart-salary').value)||0;const billMode=document.getElementById('smart-bill-mode').value;if(newSalary<=0)return alert('Enter a valid salary.');salary=newSalary;const split=smartBudgetMode==='conservative'?{needs:45,wants:20,savings:35}:{needs:50,wants:30,savings:20};const fixedCats=allCats().filter(c=>c.type==='fixed');const variableNeedsCats=allCats().filter(c=>c.type==='variable'&&c.group==='needs');const variableWantsCats=allCats().filter(c=>c.type==='variable'&&c.group==='wants');const savingsCats=allCats().filter(c=>c.group==='savings');let fixedTotal=0;fixedCats.forEach(c=>{const recurringAmt=getRecurringBillAmount(c.name);let amount=0;if(billMode==='keep')amount=Math.max(Number(budgets[c.name]||0),recurringAmt);else amount=recurringAmt||Number(budgets[c.name]||0)||0;budgets[c.name]=Math.round(amount);fixedTotal+=budgets[c.name]});const targetNeeds=Math.max((salary*split.needs/100)-fixedTotal,0);const targetWants=Math.max(salary*split.wants/100,0);const targetSavings=Math.max(salary*split.savings/100,0);const nw={'Groceries & Food':.55,Transport:.15,'Health / Medical':.10,'Education / Self-Improvement':.08,'Miscellaneous / Buffer':.12};const ww={Entertainment:.45,'Personal / Self-Care':.30,'Education / Self-Improvement':.10,'Miscellaneous / Buffer':.15};const sw={'Savings (BDO)':.40,'Emergency Fund (Digital Bank)':.30,'Investments (MP2/UITF)':.20,'Big Purchases / Goals':.10};variableNeedsCats.forEach(c=>{budgets[c.name]=Math.round(targetNeeds*(nw[c.name]??(1/Math.max(variableNeedsCats.length,1))))});variableWantsCats.forEach(c=>{budgets[c.name]=Math.round(targetWants*(ww[c.name]??(1/Math.max(variableWantsCats.length,1))))});savingsCats.forEach(c=>{budgets[c.name]=Math.round(targetSavings*(sw[c.name]??(1/Math.max(savingsCats.length,1))))});saveData();closeModal('modal-smart-budget');render();showTab('more')}

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
  if(!name)return alert('Enter a preset name first.');
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
  if(!confirm(`Delete preset "${preset.name}"?`))return;
  historySavedPresets=historySavedPresets.filter(p=>p.id!==id);
  if(historyActivePresetId===id)historyActivePresetId=null;
  saveData();
  render();
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
function getHistoryItemLabel(item){
  if(item.kind==='income')return item.source||'Income';
  if(item.isDebtPayment)return'Debt Payment';
  if(item.isGoalContribution)return'Goal Contribution';
  return item.category||'Expense';
}
function getHistoryItemMeta(item){
  if(item.kind==='income')return `${formatDateTime(item)} · Received in ${getAccountInfo(item.account||'cash').name}${item.note?` · ${item.note}`:''}`;
  if(item.isDebtPayment)return `${formatDateTime(item)} · ${(item.note||'').replace(/^Debt Payment:\s*/,'')}${item.account?` · ${getAccountInfo(item.account).name}`:''}`;
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
  if(historyBulkMode)return`toggleHistoryItemSelection('${getHistoryCardKey(item)}',${!historySelectedKeys.has(getHistoryCardKey(item))})`;
  if(item.kind==='income')return`openIncomeEdit(${item.id})`;
  if(item.isDebtPayment||item.isGoalContribution)return'';
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
function canChangeHistoryItemCategory(item){return item.kind==='expense'&&!item.isDebtPayment&&!item.isGoalContribution}
function canChangeHistoryItemAccount(item){return !!item.account}
function syncHistorySelection(historyCards){
  historyVisibleSelectionKeys=historyCards.map(getHistoryCardKey);
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
    adjustAccountBalance(income.account,-Number(income.amount||0));
    incomes=incomes.filter(x=>x.id!==item.id);
    return true;
  }
  if(item.isDebtPayment){
    const payment=debtPayments.find(p=>p.id===item.debtPaymentId);
    if(!payment)return false;
    const debt=debts.find(d=>d.id===payment.debtId);
    if(debt){
      debt.total=Number(debt.total||0)+Number(payment.amount||0);
      const remaining=getDebtPaymentsForDebt(payment.debtId).filter(p=>p.id!==payment.id);
      const latest=remaining[0];
      if(latest&&latest.markedMonthly){
        debt.lastPaidMonth=(latest.date||'').slice(0,7);
        debt.lastPaidDate=latest.date;
        debt.lastPaidAmount=latest.amount;
      }else{
        delete debt.lastPaidMonth;
        delete debt.lastPaidDate;
        delete debt.lastPaidAmount;
      }
    }
    adjustAccountBalance(payment.account,Number(payment.amount||0));
    debtPayments=debtPayments.filter(p=>p.id!==payment.id);
    entries=entries.filter(e=>e.debtPaymentId!==payment.id);
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
  removeHistoryItem(item);
  saveData();
  render();
}
function bulkDeleteHistorySelection(){
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  if(!selectedItems.length)return alert('Select at least one transaction.');
  if(!confirm(`Delete ${selectedItems.length} selected transaction${selectedItems.length===1?'':'s'}?`))return;
  selectedItems.forEach(removeHistoryItem);
  historySelectedKeys=new Set();
  saveData();
  render();
  showActionToast('Selected transactions deleted',`${selectedItems.length} item${selectedItems.length===1?'':'s'} removed.`,'🗑️');
}
function exportHistoryItemsCSV(items,filename){
  if(!items.length)return alert('No transactions selected.');
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
  if(!category)return alert('Choose a category first.');
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  const changed=selectedItems.filter(item=>applyHistoryItemCategoryChange(item,category)).length;
  if(!changed)return alert('Select at least one regular expense to change category.');
  saveData();
  render();
  showActionToast('Category updated',`${changed} expense${changed===1?'':'s'} moved to ${category}.`,'🏷️');
}
function getHistoryAccountDeltas(items,newAccount){
  const deltas={};
  items.forEach(item=>{
    if(!canChangeHistoryItemAccount(item)||item.account===newAccount)return;
    const amount=Number(item.amount||0);
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
    if(income)income.account=newAccount;
    return true;
  }
  adjustAccountBalance(oldAccount,amount);
  adjustAccountBalance(newAccount,-amount);
  if(item.isDebtPayment){
    const payment=debtPayments.find(p=>p.id===item.debtPaymentId);
    if(payment)payment.account=newAccount;
    const entry=entries.find(e=>e.debtPaymentId===item.debtPaymentId);
    if(entry)entry.account=newAccount;
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
  if(!newAccount)return alert('Choose an account first.');
  const {historyCards}=getFilteredHistoryData(getHistoryState());
  const selectedItems=getSelectedHistoryItems(historyCards);
  if(!selectedItems.length)return alert('Select at least one transaction.');
  const deltas=getHistoryAccountDeltas(selectedItems,newAccount);
  const insufficient=Object.entries(deltas).find(([account,delta])=>Number(nwBalances[account]||0)+delta<0);
  if(insufficient)return alert(`Not enough balance in ${getAccountInfo(insufficient[0]).name} after this move.`);
  const changed=selectedItems.filter(item=>applyHistoryItemAccountChange(item,newAccount)).length;
  if(!changed)return alert('Selected transactions are already using that account.');
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
  const selectionMarkup=historyBulkMode?`<label class="history-select-box" onclick="event.stopPropagation()"><input type="checkbox" ${selected?'checked':''} onchange="toggleHistoryItemSelection('${key}',this.checked)"></label>`:'';
  const deleteMarkup=historyBulkMode?'':`<button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteHistorySingle('${key}')" style="border:none;color:var(--red);font-size:12px">✕</button>`;
  return`<div class="tx-item history-tx-item ${historyBulkMode?'history-tx-item-selectable':''} ${selected?'history-tx-item-selected':''}" ${clickAction?`onclick="${clickAction}"`:''}>${selectionMarkup}<div class="tx-icon ${iconInfo.className}">${iconInfo.icon}</div><div class="tx-info"><div class="tx-name">${esc(getHistoryItemLabel(item))}</div><div class="tx-meta">${esc(getHistoryItemMeta(item))}</div></div><div class="tx-amount" style="color:${item.kind==='income'?'var(--green)':'var(--red)'}">${item.kind==='income'?'+':'-'}${fmt(item.amount)}</div>${deleteMarkup}</div>`;
}
function renderHistoryCardsContent(historyCards,groupMode){
  if(!historyCards.length)return'<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions match</div></div>';
  if(groupMode==='none')return`<div class="tx-list">${historyCards.slice(0,75).map(renderHistoryCard).join('')}</div>`;
  return buildHistoryGroups(historyCards.slice(0,75),groupMode).map(group=>`<div class="history-group"><div class="history-group-head"><div class="history-group-title">${esc(group.label)}</div><div class="history-group-meta">${group.items.length} item${group.items.length===1?'':'s'} · -${fmtShort(group.expenseTotal)} / +${fmtShort(group.incomeTotal)}</div></div><div class="tx-list">${group.items.map(renderHistoryCard).join('')}</div></div>`).join('');
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
  render();
}
function toCsvCell(value){return `"${String(value??'').replace(/"/g,'""')}"`}
function exportCSV(){
  const hs=getHistoryState();
  let{expenseData,incomeData}=filterHistoryCollections(hs);
  if(hs.type==='expense')incomeData=[];
  if(hs.type==='income')expenseData=[];
  if(!expenseData.length&&!incomeData.length)return alert('No data.');
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
function backupData(){const data=localStorage.getItem('ft_all');if(!data)return alert('No data.');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=`finance-backup-${todayStr}.json`;a.click();document.getElementById('backup-msg').textContent='✅ Backup downloaded!'}
function restoreData(evt){const file=evt.target.files[0];if(!file)return;const r=new FileReader();r.onload=function(e){try{const d=JSON.parse(e.target.result);if(!d.salary&&!d.entries)return alert('Invalid file.');localStorage.setItem('ft_all',e.target.result);location.reload()}catch(err){alert('Error.')}};r.readAsText(file)}

function getPaydayInfo(){const d=now.getDate();const days=[...(paySchedule?.days||[5,20])].map(x=>parseInt(x)).filter(x=>x>=1&&x<=31).sort((a,b)=>a-b);if(!days.length)return{daysUntil:0,nextDate:now,periodLabel:'No paydays set'};let next=null;for(const day of days){if(d<=day){next=new Date(now.getFullYear(),now.getMonth(),day);break}}if(!next)next=new Date(now.getFullYear(),now.getMonth()+1,days[0]);let periodLabel='';if(paySchedule?.mode==='monthly')periodLabel=`Every month on the ${days[0]}${days[0]===1?'st':days[0]===2?'nd':days[0]===3?'rd':'th'}`;else periodLabel=days.map(day=>`${day}${day===1?'st':day===2?'nd':day===3?'rd':'th'}`).join(' & ');return{daysUntil:Math.ceil((next-now)/864e5),nextDate:next,periodLabel}}

let activeSalaryReceiptKey='';
function getSalaryReceiptKey(monthKey,day){return `${monthKey}-${parseInt(day)}`}
function getPendingSalarySplits(){normalizePaySchedule();const monthKey=currentMonthKey();const todayDay=now.getDate();const received=paySchedule.received||{};return (paySchedule.splits||[]).filter(split=>split.day<=todayDay&&!received[getSalaryReceiptKey(monthKey,split.day)]).sort((a,b)=>a.day-b.day)}
function openSalaryReceiptModal(day){normalizePaySchedule();const monthKey=currentMonthKey();const split=(paySchedule.splits||[]).find(s=>parseInt(s.day)===parseInt(day));if(!split)return;activeSalaryReceiptKey=getSalaryReceiptKey(monthKey,split.day);document.getElementById('salary-receive-subtext').textContent=`Confirm your salary deposit for day ${split.day}.`;document.getElementById('sr-amount').value=split.amount||'';document.getElementById('sr-date').value=todayStr;buildAccountSelect('sr-account',false);document.getElementById('sr-account').value=split.account||getDefaultAccountKey();document.getElementById('sr-note').value='';openModal('modal-salary-receive')}
function saveSalaryReceipt(){normalizePaySchedule();const amount=parseFloat(document.getElementById('sr-amount').value)||0;const date=document.getElementById('sr-date').value||todayStr;const account=document.getElementById('sr-account').value||getDefaultAccountKey();const note=(document.getElementById('sr-note').value||'').trim();if(amount<=0)return alert('Enter a valid salary amount.');const split=(paySchedule.splits||[]).find(s=>getSalaryReceiptKey(currentMonthKey(),s.day)===activeSalaryReceiptKey);if(!split)return alert('Salary schedule not found.');const incomeNote=note||`Scheduled salary · day ${split.day}`;incomes.unshift(stampRecord({id:nextIncId++,date,source:'Salary',amount,note:incomeNote,account,isSalaryDeposit:true}));adjustAccountBalance(account,amount);paySchedule.received=paySchedule.received||{};paySchedule.received[activeSalaryReceiptKey]={amount,date,account,note:incomeNote,createdAt:new Date().toISOString()};closeModal('modal-salary-receive');saveData();render();showActionToast(`${fmt(amount)} salary received`,`${getAccountInfo(account).name}`,'💼');showTab('dashboard')}
function renderSalaryPromptCard(){const wrap=document.getElementById('salary-prompt-card');if(!wrap)return;const pending=getPendingSalarySplits();if(!pending.length){wrap.innerHTML='';return}const nextSplit=pending[0];const accountInfo=getAccountInfo(nextSplit.account);wrap.innerHTML=`<div class="card"><div class="card-header"><div><div class="card-title">Receive Salary</div><div class="card-subtitle">Payday for the ${nextSplit.day}${nextSplit.day===1?'st':nextSplit.day===2?'nd':nextSplit.day===3?'rd':'th'} is ready to confirm</div></div><span class="card-badge" style="background:var(--green-soft);color:var(--green)">${fmt(nextSplit.amount)}</span></div><div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:12px">Default account: <strong>${esc(accountInfo.name)}</strong>. You can change it before saving.</div><button class="btn btn-primary" onclick="openSalaryReceiptModal(${nextSplit.day})">💵 Receive Salary</button></div>`}


function makeDonutSVG(data,size){const total=data.reduce((s,d)=>s+d.value,0);if(total===0)return'';let cum=0;const r=size/2-6,ir=r*0.62,cx=size/2,cy=size/2;const paths=data.map(d=>{const pct=d.value/total;const s=cum*2*Math.PI-Math.PI/2;cum+=pct;const e=cum*2*Math.PI-Math.PI/2;const lg=pct>0.5?1:0;return`<path d="M${cx+r*Math.cos(s)},${cy+r*Math.sin(s)} A${r},${r} 0 ${lg} 1 ${cx+r*Math.cos(e)},${cy+r*Math.sin(e)} L${cx+ir*Math.cos(e)},${cy+ir*Math.sin(e)} A${ir},${ir} 0 ${lg} 0 ${cx+ir*Math.cos(s)},${cy+ir*Math.sin(s)}Z" fill="${d.color}" opacity="0.9"/>`}).join('');return`<svg viewBox="0 0 ${size} ${size}" class="donut-svg">${paths}<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="800">${fmtShort(total)}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" fill="var(--text3)" font-size="9" font-weight="500">Total Spent</text></svg>`}

function calcHealthScore(){const ac=allCats();const savsB=ac.filter(c=>c.group==='savings').reduce((s,c)=>s+(budgets[c.name]||0),0);const needsB=ac.filter(c=>c.group==='needs').reduce((s,c)=>s+(budgets[c.name]||0),0);const wantsB=ac.filter(c=>c.group==='wants').reduce((s,c)=>s+(budgets[c.name]||0),0);const monthlyExp=needsB+wantsB;const me=entries.filter(e=>e.date.startsWith(filterMonth));const totalDebt=debts.reduce((s,d)=>s+d.total,0);const efGoal=goals.find(g=>g.name.toLowerCase().includes('emergency'));const efCur=efGoal?efGoal.current:0;const factors=[];const sr=salary>0?savsB/salary:0;factors.push({name:'Savings Rate',score:Math.round(Math.min(sr/.55*25,25)),max:25,detail:`${Math.round(sr*100)}%`,color:'var(--green)'});const overCats=ac.filter(c=>{const sp=me.filter(e=>!e.isDebtPayment&&e.category===c.name).reduce((s,e)=>s+e.amount,0);return sp>(budgets[c.name]||0)&&(budgets[c.name]||0)>0}).length;const adherence=ac.length>0?Math.max(0,(ac.length-overCats)/ac.length):1;factors.push({name:'Budget Discipline',score:Math.round(adherence*25),max:25,detail:`${overCats} over`,color:'var(--blue)'});const efTarget=monthlyExp*3;const efPct=efTarget>0?Math.min(efCur/efTarget,1):0;factors.push({name:'Emergency Fund',score:Math.round(efPct*25),max:25,detail:efTarget>0?`${Math.round(efPct*100)}% of 3mo`:'Set goal',color:'var(--amber)'});const dti=salary>0?totalDebt/(salary*12):0;factors.push({name:'Debt Health',score:Math.round(totalDebt===0?25:Math.max(0,25*(1-dti))),max:25,detail:totalDebt===0?'Debt-free!':fmtShort(totalDebt),color:'var(--purple)'});const total=factors.reduce((s,f)=>s+f.score,0);let grade,color;if(total>=90){grade='Excellent';color='var(--green)'}else if(total>=75){grade='Great';color='var(--blue)'}else if(total>=60){grade='Good';color='var(--amber)'}else if(total>=40){grade='Fair';color='#f97316'}else{grade='Needs Work';color='var(--red)'}return{total,grade,color,factors}}


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
    if(!(val>0)){ alert('Please enter an amount first.'); return false; }
  }
  if(step.require==='category'){
    const val=document.getElementById('f-cat')?.value||'';
    if(!val || val==='__other__'){ alert('Please choose a category first.'); return false; }
  }
  if(step.require==='account'){
    const val=document.getElementById('f-account')?.value||'';
    if(!val){ alert('Please choose an account first.'); return false; }
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
    if(!(amount>0)){ alert('Enter an amount first.'); return; }
    if(!category || category==='__other__'){ alert('Choose a category first.'); return; }
    if(!account){ alert('Choose an account first.'); return; }
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


function applyBudgetPreset(preset){
  budgetStrategy.preset=preset;
  budgetStrategy.custom=false;
  if(preset==='balanced'){
    budgetStrategy.needsPct=50; budgetStrategy.wantsPct=30; budgetStrategy.savingsPct=20;
  }else if(preset==='aggressive'){
    budgetStrategy.needsPct=40; budgetStrategy.wantsPct=20; budgetStrategy.savingsPct=40;
  }else if(preset==='survival'){
    budgetStrategy.needsPct=70; budgetStrategy.wantsPct=20; budgetStrategy.savingsPct=10;
  }
  saveData();
  render();
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

function setDebtPayoffMethod(method){
  debtPayoffSettings.method=method;
  saveData();
  render();
}
function getDebtPayoffData(remaining, forecast, needsBudget){
  const activeDebts=getActiveDebts();
  const monthlyMinimum=activeDebts.reduce((s,d)=>s+Number(d.payment||0),0);
  const safeBuffer=Math.max(Number(needsBudget||0)*0.05, 1000);
  const projectedCushion=Math.max(Number(forecast?.projectedBalance||0)-safeBuffer,0);
  const remainingCushion=Math.max(Number(remaining||0)-safeBuffer,0);
  const extraPayment=Math.max(Math.min(projectedCushion,remainingCushion),0);
  const method=debtPayoffSettings.method||'snowball';
  let sorted=[];
  if(method==='avalanche'){
    sorted=[...activeDebts].sort((a,b)=>{
      const byInterest=Number(b.interest||0)-Number(a.interest||0);
      if(byInterest!==0) return byInterest;
      return Number(a.total||0)-Number(b.total||0);
    });
  }else if(method==='snowball'){
    sorted=[...activeDebts].sort((a,b)=>{
      const byBalance=Number(a.total||0)-Number(b.total||0);
      if(byBalance!==0) return byBalance;
      return Number(b.interest||0)-Number(a.interest||0);
    });
  }else{
    sorted=[...activeDebts];
  }
  const targetDebt=method==='minimum'?null:(sorted.find(d=>Number(d.total||0)>0)||null);
  const debtPressurePct=needsBudget>0?Math.round(monthlyMinimum/needsBudget*100):0;
  const riskFlags=[];
  if(monthlyMinimum>needsBudget&&needsBudget>0) riskFlags.push('Debt payments are higher than your full Needs allocation.');
  else if(debtPressurePct>=60) riskFlags.push(`Debt payments are using ${debtPressurePct}% of your Needs allocation.`);
  if(forecast?.projectedBalance<0) riskFlags.push('Month-end forecast is negative, so avoid extra debt payments for now.');
  const targetMonths=targetDebt&&Number(targetDebt.payment||0)>0?Math.ceil(Number(targetDebt.total||0)/Number(targetDebt.payment||0)):null;
  return {method, monthlyMinimum, extraPayment:forecast?.projectedBalance<0?0:extraPayment, targetDebt, debtPressurePct, riskFlags, targetMonths};
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
  const monthInc=incomes.filter(i=>i.date.startsWith(filterMonth)&&!i.isSalaryDeposit);const extraIncome=monthInc.reduce((s,i)=>s+i.amount,0);
  const carryoverOverspend=getCarryoverOverspend();
  const totalIncome=Number(salary||0);const totalDebt=debts.reduce((s,d)=>s+d.total,0);
  const me=entries.filter(e=>e.date.startsWith(filterMonth));
  const monthTotal=me.reduce((s,e)=>s+e.amount,0);
  const todayTotal=entries.filter(e=>e.date===todayStr).reduce((s,e)=>s+e.amount,0);
  const weekStart=getStartOfWeek(now);
  const todayEnd=new Date(`${todayStr}T23:59:59`);
  const weekTotal=entries.filter(e=>{const d=new Date(`${e.date}T00:00:00`);return d>=weekStart&&d<=todayEnd}).reduce((s,e)=>s+e.amount,0);
  const remaining=totalIncome-carryoverOverspend-monthTotal;const savRate=totalIncome>0?Math.round(savsB/totalIncome*100):0;
  const catTotals={};ac.forEach(c=>catTotals[c.name]=0);me.filter(e=>!e.isDebtPayment&&!e.isGoalContribution).forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount});
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const daysLeft=Math.max(daysInMonth-now.getDate()+1,1);
  const dailyLeft=daysLeft>0?remaining/daysLeft:0;


  // Budget strategy card
  const strategyMeta=getStrategyMeta();
  const bsEl=document.getElementById('budget-strategy-card');
  if(bsEl){
    const totalPct=budgetStrategy.needsPct+budgetStrategy.wantsPct+budgetStrategy.savingsPct;
    const presetLabel=budgetStrategy.preset==='balanced'?'50/30/20':budgetStrategy.preset==='aggressive'?'40/20/40':budgetStrategy.preset==='survival'?'70/20/10':'Custom';
    bsEl.innerHTML=`
      <div style="font-size:12px;color:var(--text3);margin-bottom:10px">
        This feature helps the app recommend and auto-build category budgets from your salary.
      </div>

      <div class="quick-actions" style="margin-bottom:12px">
        <button class="quick-chip" style="${budgetStrategy.preset==='balanced'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('balanced')">Balanced 50/30/20</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='aggressive'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('aggressive')">Aggressive 40/20/40</button>
        <button class="quick-chip" style="${budgetStrategy.preset==='survival'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="applyBudgetPreset('survival')">Survival 70/20/10</button>
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

      <div class="stats-grid" style="margin-bottom:12px">
        <div class="stat-card">
          <div class="stat-label">Fixed needs used</div>
          <div class="stat-value" style="font-size:18px;color:var(--blue)">${fmtShort(strategyMeta.fixedNeeds)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Fixed wants used</div>
          <div class="stat-value" style="font-size:18px;color:var(--amber)">${fmtShort(strategyMeta.fixedWants)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Fixed savings used</div>
          <div class="stat-value" style="font-size:18px;color:var(--green)">${fmtShort(strategyMeta.fixedSavings)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Mode</div>
          <div class="stat-value" style="font-size:18px">${presetLabel}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="autoDistributeByStrategy()">Auto Balance Budgets</button>
        <button class="btn btn-ghost btn-sm" onclick="openStrategyAdvanced()">Advanced distribution</button>
      </div>
    `;
  }

  // Greeting carousel
  const hour=now.getHours();const greet=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  let payInfo=null;
  try{ payInfo=getPaydayInfo(); }catch(e){ payInfo=null; }
  const payChip=payInfo && Number.isFinite(payInfo.daysUntil) ? `<div class="g-tag">💸 Payday in ${payInfo.daysUntil}d</div>` : '';
  const spentPct=Math.max(0,Math.min(totalIncome>0?(monthTotal/totalIncome)*100:0,100));
  const safeNow=getSafeSpendRealData();
  const safeDaily=safeNow&&safeNow.daily?safeNow.daily:0;
  const savingsTone=savRate>=30?'Strong':savRate>=20?'Healthy':'Building';
  const spendProgressText=totalIncome>0?`Spent ${fmt(monthTotal)} of ${fmt(totalIncome)}`:`Spent ${fmt(monthTotal)} this month`;
  const spendRhythm=`<div class="greeting-mini-stats"><div class="greeting-mini-stat"><span class="greeting-mini-label">Today</span><strong>${fmt(todayTotal)}</strong></div><div class="greeting-mini-stat"><span class="greeting-mini-label">This week</span><strong>${fmt(weekTotal)}</strong></div></div>`;
  const slide0 = `
    <div class="greeting-slide ${greetingCardIndex===0?'active':''}">
      <div class="greeting-top">
        <div class="greeting-kicker">${greet}</div>
        <div class="greeting-side-pill">✨ Monthly overview</div>
      </div>
      <div class="greeting-value">${fmt(remaining)}</div>
      <div class="greeting-label">Available this month</div>
      <div class="greeting-subline"><span>${fmtShort(monthTotal)} spent</span>${carryoverOverspend>0?`<span>• ${fmtShort(carryoverOverspend)} carryover</span>`:""}<span>• ${daysLeft} days left</span></div>
      <div class="greeting-chip-row">${savRate>=20?`<div class="g-tag">🔥 ${savRate}% savings</div>`:''}${payChip}</div>
      ${spendRhythm}
      <div class="greeting-progress">
        <div class="greeting-progress-track"><div class="greeting-progress-fill" style="width:${spentPct}%"></div></div>
        <div class="greeting-progress-meta"><span>${spendProgressText}${carryoverOverspend>0?` · Carryover ${fmt(carryoverOverspend)}`:''}</span><span>${Math.round(spentPct)}% used</span></div>
      </div>
    </div>`;
  const slide1 = `
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
  const slide2 = `
    <div class="greeting-slide ${greetingCardIndex===2?'active':''}">
      <div class="greeting-top">
        <div class="greeting-kicker">Looking good this month</div>
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
        <div class="greeting-dots">
          <button class="greeting-dot ${greetingCardIndex===0?'active':''}" onclick="setGreetingCard(0)" aria-label="Greeting card 1"></button>
          <button class="greeting-dot ${greetingCardIndex===1?'active':''}" onclick="setGreetingCard(1)" aria-label="Greeting card 2"></button>
          <button class="greeting-dot ${greetingCardIndex===2?'active':''}" onclick="setGreetingCard(2)" aria-label="Greeting card 3"></button>
        </div>
      </div>
    </div>`;

  // Compact forecast + payday
  const forecast=getForecastData(ac,catTotals,totalIncome,monthTotal,remaining,daysLeft);
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
  const nonSavings=ac.filter(c=>c.group!=='savings');
  const problemCats=nonSavings.map(c=>{const spent=catTotals[c.name]||0;const bgt=budgets[c.name]||0;const pct=bgt>0?(spent/bgt)*100:0;return{...c,spent,bgt,pct}}).filter(c=>c.bgt>0&&c.pct>=75).sort((a,b)=>b.pct-a.pct);
  const budgetAttCard=document.getElementById('budget-attention-card');
  if(problemCats.length){
    budgetAttCard.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">Budget Attention</span><span style="font-size:12px;color:var(--text3);cursor:pointer;font-weight:600" onclick="toggleShowMore();if(!showMoreExpanded)toggleShowMore()">All budgets →</span></div>${problemCats.slice(0,4).map(c=>{const over=c.spent>c.bgt;const color=over?'var(--red)':c.pct>=90?'var(--amber)':'var(--amber)';return`<div class="progress"><div class="progress-header"><span class="progress-label">${c.icon||'📦'} ${esc(c.name.length>22?c.name.substring(0,22)+'…':c.name)} ${over?'<span style="color:var(--red);font-size:11px">⚠️ over</span>':''}</span><span class="progress-value" style="color:${color}">${fmtShort(c.spent)} / ${fmtShort(c.bgt)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(c.pct,100)}%;background:${color}"></div></div></div>`}).join('')}</div>`;
  }else{
    budgetAttCard.innerHTML='';
  }

  // Recent tx
  const recent=entries.slice(0,5);
  document.getElementById('recent-tx').innerHTML=recent.length?`<div class="tx-list">${recent.map(e=>{if(e.isDebtPayment){const ai=getAccountInfo(e.account);return`<div class="tx-item"><div class="tx-icon cat-debt">💳</div><div class="tx-info"><div class="tx-name">Debt Payment</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}${ai.name?' · '+esc(ai.name):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}if(e.isGoalContribution){const ai=getAccountInfo(e.account);return`<div class="tx-item"><div class="tx-icon cat-savings">🎯</div><div class="tx-info"><div class="tx-name">Goal Contribution</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}${ai.name?' · '+esc(ai.name):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}const ci=getCatInfo(e.category);return`<div class="tx-item" onclick="openEntryEdit(${e.id})"><div class="tx-icon ${ci.colorClass}">${ci.icon||'📦'}</div><div class="tx-info"><div class="tx-name">${esc(e.category)}</div><div class="tx-meta">${formatDateTime(e)}${e.note?' · '+esc(e.note):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(e.amount)}</div></div>`}).join('')}</div>`:'<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions yet</div></div>';

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
  document.getElementById('budget-bars').innerHTML=nonSavings.map(c=>{const spent=catTotals[c.name]||0,bgt=budgets[c.name]||0;const pct=bgt>0?Math.min((spent/bgt)*100,100):0;const over=spent>bgt&&bgt>0;const color=over?'var(--red)':pct>=80?'var(--amber)':'var(--green)';return`<div class="progress"><div class="progress-header"><span class="progress-label">${c.icon||'📦'} ${esc(c.name.length>22?c.name.substring(0,22)+'…':c.name)}</span><span class="progress-value" style="color:${color}">${fmtShort(spent)} / ${fmtShort(bgt)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div></div>`}).join('');

  // Month chart
  const months=[];for(let i=5;i>=0;i--){const dt=new Date(now.getFullYear(),now.getMonth()-i,1);const key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;months.push({label:dt.toLocaleDateString('en-PH',{month:'short'}),total:entries.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+e.amount,0)})}const maxM=Math.max(...months.map(m=>m.total),1);
  document.getElementById('month-chart').innerHTML=`<div class="bar-chart">${months.map((m,i)=>`<div class="bar-row"><div class="bar-label">${m.label}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(m.total/maxM*100,2)}%;background:${i===5?'var(--accent)':'var(--text3)'};opacity:${i===5?1:.4}">${m.total/maxM>.15?fmtShort(m.total):''}</div></div><div class="bar-amount">${fmtShort(m.total)}</div></div>`).join('')}</div>`;

  // === FORMS ===
  buildCatSelect('f-cat');buildCatSelect('me-cat');
  buildAccountSelect('f-account',true);if(!document.getElementById('f-account').value)document.getElementById('f-account').value=getDefaultAccountKey();
  buildAccountSelect('inc-account',true);if(!document.getElementById('inc-account').value)document.getElementById('inc-account').value=getDefaultAccountKey();
  buildAccountSelect('me-account',true);buildAccountSelect('mi-account',true);buildAccountSelect('t-from',true);buildAccountSelect('t-to',true);buildCatSelect('r-cat');
  const meCat=document.getElementById('me-cat');if(meCat)meCat.onchange=toggleEditCustom;
  document.getElementById('quick-buttons').innerHTML=[{cat:"Groceries & Food",icon:"🛒"},{cat:"Transport",icon:"🚗"},{cat:"Entertainment",icon:"🍕"},{cat:"Health / Medical",icon:"💊"},{cat:"Miscellaneous / Buffer",icon:"📦"}].filter(q=>allCats().find(c=>c.name===q.cat)).map(q=>`<button class="quick-chip" onclick="quickAdd('${q.cat}')">${q.icon} ${q.cat}</button>`).join('');

  // === HISTORY ===
  buildHistoryCategoryFilter(ac);
  renderHistoryQuickRanges();
  renderHistoryPresets();
  const histAcc=document.getElementById('hist-account');const curAcc=histAcc?.value||'all';
  if(histAcc){histAcc.innerHTML='<option value="all">All Accounts</option>'+nwAccounts.map(a=>`<option value="${a.key}">${a.icon} ${esc(a.name)}</option>`).join('');histAcc.value=curAcc}
  const histState=getHistoryState();
  const histGroupMode=getHistoryGroupMode();
  let{expenseData:filtEnt,incomeData:filtInc,historyCards}=getFilteredHistoryData(histState);
  const expenseTotal=filtEnt.reduce((s,e)=>s+e.amount,0);const incomeTotal=filtInc.reduce((s,i)=>s+i.amount,0);
  const historySummary=getHistorySummaryMetrics(historyCards,expenseTotal,incomeTotal,histState);
  renderHistoryTopbar(histState,historySummary);
  document.getElementById('history-summary').innerHTML=`<div class="stats-grid" style="margin-bottom:12px"><div class="stat-card"><div class="stat-label">Results</div><div class="stat-value" style="font-size:18px">${historyCards.length}</div><div class="stat-change">${esc(historySummary.periodLabel)}</div></div><div class="stat-card"><div class="stat-label">Expenses</div><div class="stat-value" style="font-size:16px;color:var(--red)">-${fmtShort(expenseTotal)}</div><div class="stat-change">${historySummary.spanDays?`Avg/day ${fmtShort(historySummary.avgSpendPerDay)}`:'No spend yet'}</div></div><div class="stat-card"><div class="stat-label">Income</div><div class="stat-value" style="font-size:16px;color:var(--green)">+${fmtShort(incomeTotal)}</div><div class="stat-change">${historySummary.spanDays?`${historySummary.spanDays} day${historySummary.spanDays===1?'':'s'} covered`:'No date range'}</div></div><div class="stat-card"><div class="stat-label">Net</div><div class="stat-value" style="font-size:16px;color:${historySummary.netTotal>=0?'var(--green)':'var(--red)'}">${historySummary.netTotal>=0?'+':'-'}${fmtShort(Math.abs(historySummary.netTotal))}</div><div class="stat-change">${historySummary.largest?`Largest: ${historySummary.largest.kind==='income'?'+':'-'}${fmtShort(historySummary.largest.amount)}`:'No transactions yet'}</div></div></div>`;
  renderHistoryBulkBar(historyCards);const hcEl=document.getElementById('history-content');
  if(!historyCards.length)hcEl.innerHTML='<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions match</div></div>';
  else hcEl.innerHTML=`<div class="tx-list">${historyCards.slice(0,75).map(item=>{if(item.kind==='income'){return`<div class="tx-item" onclick="openIncomeEdit(${item.id})"><div class="tx-icon cat-income">💵</div><div class="tx-info"><div class="tx-name">${esc(item.source)}</div><div class="tx-meta">${formatDateTime(item)} · Received in ${esc(getAccountInfo(item.account||'cash').name)}${item.note?' · '+esc(item.note):''}</div></div><div class="tx-amount" style="color:var(--green)">+${fmt(item.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteIncome(${item.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}if(item.isDebtPayment){const ai=getAccountInfo(item.account);return`<div class="tx-item"><div class="tx-icon cat-debt">💳</div><div class="tx-info"><div class="tx-name">Debt Payment</div><div class="tx-meta">${formatDateTime(item)} · ${esc((item.note||'').replace(/^Debt Payment:\s*/,''))}${ai.name?' · '+esc(ai.name):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(item.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteDebtPayment(${item.debtPaymentId})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}if(item.isGoalContribution){const ai=getAccountInfo(item.account);return`<div class="tx-item"><div class="tx-icon cat-savings">🎯</div><div class="tx-info"><div class="tx-name">Goal Contribution</div><div class="tx-meta">${formatDateTime(item)} · ${esc((item.note||'').replace(/^Goal Contribution:\s*/,''))}${ai.name?' · '+esc(ai.name):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(item.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteGoalContribution(${item.goalContributionId})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}const ci=getCatInfo(item.category);return`<div class="tx-item" onclick="openEntryEdit(${item.id})"><div class="tx-icon ${ci.colorClass}">${ci.icon||'📦'}</div><div class="tx-info"><div class="tx-name">${esc(item.category)}</div><div class="tx-meta">${formatDateTime(item)}${item.note?' · '+esc(item.note):''}</div></div><div class="tx-amount" style="color:var(--red)">-${fmt(item.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteEntry(${item.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}).join('')}</div>`;
  hcEl.innerHTML=renderHistoryCardsContent(historyCards,histGroupMode);syncHistoryDrawerState();const ihEl=document.getElementById('income-history');
  if(!incomes.length)ihEl.innerHTML='<div class="empty"><div class="empty-icon">💵</div><div class="empty-text">No extra income yet</div></div>';
  else{const incomeOnly=[...incomes];sortHistoryItems(incomeOnly,'newest');ihEl.innerHTML=`<div class="tx-list">${incomeOnly.slice(0,20).map(i=>{return`<div class="tx-item" onclick="openIncomeEdit(${i.id})"><div class="tx-icon cat-income">💵</div><div class="tx-info"><div class="tx-name">${esc(i.source)}</div><div class="tx-meta">${formatDateTime(i)} · Received in ${esc(getAccountInfo(i.account||'cash').name)}${i.note?' · '+esc(i.note):''}</div></div><div class="tx-amount" style="color:var(--green)">+${fmt(i.amount)}</div><button class="btn-icon tx-delete" onclick="event.stopPropagation();deleteIncome(${i.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`}).join('')}</div>`}

  // === GOALS ===
  const fullCirc2=2*Math.PI*42;const scoreOff2=fullCirc2-(hs.total/100)*fullCirc2;
  document.getElementById('health-score').innerHTML=`<div style="text-align:center;margin-bottom:16px"><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="score-bg" stroke-width="8"/><circle cx="50" cy="50" r="42" fill="none" stroke="${hs.color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${fullCirc2}" stroke-dashoffset="${scoreOff2}" class="score-fill"/><text x="50" y="50" class="score-text">${hs.total}</text></svg><div style="font-size:16px;font-weight:700;color:${hs.color};margin-top:4px">${hs.grade}</div></div>${hs.factors.map(f=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.detail}</div></div><div style="font-weight:800;color:${f.color}">${f.score}/${f.max}</div></div>`).join('')}`;
  document.getElementById('goals-list').innerHTML=goals.length?goals.map(g=>{const pct=g.target>0?Math.min(g.current/g.target*100,100):0;const left=g.target-g.current;const mo=g.monthly>0?Math.ceil(Math.max(left,0)/g.monthly):Infinity;const c=pct>=100?'var(--green)':pct>=50?'var(--accent)':'var(--amber)';const summary=getGoalContributionSummary(g.id);return`<div class="goal-card"><div class="goal-top"><span class="goal-name">${esc(g.name)}</span><span class="goal-pct" style="color:${c}">${pct.toFixed(0)}%</span></div><div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:${c}"></div></div><div class="goal-sub">${fmt(g.current)} / ${fmt(g.target)} ${left>0?(g.monthly>0?`· ~${mo} months`:''):'· Done! 🎉'}</div><div style="margin-top:10px;font-size:12px;color:var(--text2)">${summary.count?`<div><strong>Last:</strong> ${formatDateTime(summary.latest)} — ${fmt(summary.latest.amount)}</div><div><strong>Total added:</strong> ${fmt(summary.total)}</div><div><strong>${summary.count} contribution${summary.count>1?'s':''}</strong></div>`:'<div style="color:var(--text3)">No contributions yet</div>'}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openGoalContribution(${g.id})">🎯 Log Contribution</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openGoalHistory(${g.id})">History</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openGoalEdit(${g.id})">Edit</button></div></div>`}).join(''):'<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">No goals yet</div></div>';
  document.getElementById('wishlist').innerHTML=wishlist.length?wishlist.map(w=>{const days=Math.floor((new Date()-new Date(w.addedDate))/864e5);const pc={Low:'var(--text3)',Medium:'var(--amber)',Want:'var(--blue)','Need Soon':'var(--red)'};return`<div class="wish-card"><div style="flex:1"><div style="font-weight:700;font-size:13px">${esc(w.name)} <span style="font-size:11px;color:${pc[w.priority]||'var(--text3)'};font-weight:600">${w.priority}</span></div><div style="font-size:11px;color:var(--text3)">${days}d ago</div></div><div style="font-weight:700;color:var(--amber)">${fmtShort(w.price)}</div><button class="btn-sm btn-success" style="padding:6px 10px" onclick="buyWish(${w.id})">Buy</button><button class="btn-icon" onclick="deleteWish(${w.id})" style="border:none;color:var(--red);font-size:14px">✕</button></div>`}).join(''):'<div class="empty"><div class="empty-icon">🛒</div><div class="empty-text">Wishlist empty 🏆</div></div>';
  const efM=budgets['Emergency Fund (Digital Bank)']||0;const ef3=monthlyExp*3,ef6=monthlyExp*6;const efG=goals.find(g=>g.name.toLowerCase().includes('emergency'));const efC=efG?efG.current:0;const efProgress=ef6>0?Math.min(efC/ef6*100,100):0;const efGap=Math.max(ef6-efC,0);const efGap3=Math.max(ef3-efC,0);const efSafeExtra=Math.max(Math.min(Math.floor(Math.max(forecast.projectedBalance,0)*0.35/100)*100,efGap),0);const efMonthsLeft=efM>0&&efGap>0?Math.ceil(efGap/efM):0;let efStatus='Start building your safety cushion';let efStatusColor='var(--amber)';let efInsight='An emergency fund helps cover job loss, medical needs, or urgent surprises without using debt.';let efAction=efG?`Add ${fmt(efM||1000)} to your emergency fund to keep momentum.`:'Create an Emergency Fund goal first so FinTrack can track your progress.';if(efC>=ef6){efStatus='Fully covered';efStatusColor='var(--green)';efInsight='You already have 6 months of expenses saved. That is a strong emergency cushion.';efAction='You can keep adding slowly or redirect new savings to other goals.';}else if(efC>=ef3){efStatus='Basic safety reached';efStatusColor='var(--blue)';efInsight=`You have at least 3 months covered. You need ${fmt(efGap)} more to reach the full 6-month target.`;efAction=efSafeExtra>0?`You can safely add about ${fmt(efSafeExtra)} now.`:efM>0?`Keep adding around ${fmt(efM)} per month to finish in about ${efMonthsLeft} month${efMonthsLeft!==1?'s':''}.`:'Set a monthly contribution so this grows automatically over time.';}else if(efC>0){efStatus='Still below safe level';efStatusColor='var(--amber)';efInsight=`You need ${fmt(efGap3)} more just to reach the 3-month safety level.`;efAction=efSafeExtra>0?`Good month to add ${fmt(efSafeExtra)} if you can.`:efM>0?`Try to add at least ${fmt(efM)} this month.`:'Add a monthly contribution target to make this easier.';}if(!efG){document.getElementById('ef-calc').innerHTML=`<div style="display:grid;gap:10px"><div style="padding:14px;background:var(--surface2);border-radius:var(--radius-sm)"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Emergency Fund Guide</div><div style="font-size:20px;font-weight:800">${fmt(ef6)}</div><div style="font-size:12px;color:var(--text2);margin-top:4px">Suggested full target based on 6 months of expenses</div></div><div style="padding:14px;background:var(--surface2);border-radius:var(--radius-sm)"><div style="font-size:13px;font-weight:700;color:${efStatusColor}">${efStatus}</div><div style="font-size:12px;color:var(--text2);line-height:1.6;margin-top:6px">${efInsight}</div><div style="font-size:12px;color:var(--text2);line-height:1.6;margin-top:8px">${efAction}</div></div><button class="btn btn-primary" onclick="document.getElementById('g-name').value='Emergency Fund';document.getElementById('g-target').value=${Math.round(ef6)};document.getElementById('g-current').value=0;document.getElementById('g-monthly').value=${Math.round(efM||1000)};openModal('modal-add-goal')">Create Emergency Fund Goal</button></div>`;}else{document.getElementById('ef-calc').innerHTML=`<div style="display:grid;gap:10px"><div style="padding:14px;background:var(--surface2);border-radius:var(--radius-sm)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px"><div><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">Emergency Fund Status</div><div style="font-size:22px;font-weight:800;margin-top:2px">${fmt(efC)} <span style="font-size:13px;font-weight:600;color:var(--text3)">/ ${fmt(ef6)}</span></div></div><div style="font-size:11px;font-weight:700;color:${efStatusColor};background:${efStatusColor==='var(--green)'?'var(--green-soft)':efStatusColor==='var(--blue)'?'var(--blue-soft)':'var(--amber-soft)'};padding:6px 10px;border-radius:999px">${efStatus}</div></div><div class="goal-bar" style="margin-bottom:8px"><div class="goal-fill" style="width:${efProgress}%;background:${efStatusColor}"></div></div><div style="display:grid;gap:6px;font-size:12px;color:var(--text2)"><div><strong>Full target:</strong> ${fmt(ef6)} · 6 months of expenses</div><div><strong>Basic safety:</strong> ${fmt(ef3)} · 3 months</div><div><strong>Still needed:</strong> ${fmt(efGap)}</div></div></div><div style="padding:14px;background:var(--surface2);border-radius:var(--radius-sm)"><div style="font-size:13px;font-weight:700;margin-bottom:6px">What this means</div><div style="font-size:12px;color:var(--text2);line-height:1.6">${efInsight}</div><div style="font-size:13px;font-weight:700;margin:12px 0 6px">Recommended next step</div><div style="font-size:12px;color:var(--text2);line-height:1.6">${efAction}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm btn-primary" onclick="openGoalContribution(${efG.id})">🎯 Add Money</button><button class="btn btn-sm btn-ghost" onclick="openGoalHistory(${efG.id})">View History</button></div></div>`;}

  // === DEBTS ===

  const activeDebts=getActiveDebts();
  const paidOffDebts=getPaidOffDebts();
  const renderDebtCard=(d,paidOff=false)=>{const remaining=Math.max(Number(d.total||0),0);const mo=d.payment>0?Math.ceil(remaining/d.payment):Infinity;const isTarget=!paidOff&&debtPayoffData.targetDebt&&debtPayoffData.targetDebt.id===d.id;const strategyBadge=debtPayoffSettings.method==='minimum'?'Minimum':debtPayoffSettings.method==='avalanche'?'Avalanche target':'Snowball target';const isPaid=d.lastPaidMonth===currentMonthKey();const paymentSummary=getDebtPaymentSummary(d.id);const latest=paymentSummary.latest;const clearedDate=d.lastPaidDate||(latest&&latest.date)||'';const badges=[];if(isTarget)badges.push(`<span style="font-size:10px;font-weight:700;color:var(--accent);background:var(--accent-soft);padding:3px 8px;border-radius:999px;display:inline-block;margin-top:4px">${strategyBadge}</span>`);if(paidOff)badges.push(`<span style="font-size:10px;font-weight:700;color:var(--green);background:var(--green-soft);padding:3px 8px;border-radius:999px;display:inline-block;margin-top:4px">Paid Off</span>`);else if(isPaid)badges.push(`<span style="font-size:10px;font-weight:700;color:var(--green);background:var(--green-soft);padding:3px 8px;border-radius:999px;display:inline-block;margin-top:4px">Paid this month</span>`);const summaryBody=paymentSummary.count?`<div style="display:grid;gap:4px;font-size:12px;color:var(--text2)">${paidOff&&clearedDate?`<div><strong>Paid off on:</strong> ${esc(formatDateTime({date:clearedDate}))}</div>`:''}<div><strong>Last:</strong> ${esc(formatDateTime(latest))} - ${fmt(latest.amount)}</div><div><strong>Total paid:</strong> ${fmt(paymentSummary.total)}</div><div><strong>${paymentSummary.count} payment${paymentSummary.count!==1?'s':''}</strong></div></div>`:`<div style="font-size:12px;color:var(--text3)">${paidOff?'No payment history saved':'No payments yet'}</div>`;const meta=paidOff?`${clearedDate?`Paid off on ${esc(formatDateTime({date:clearedDate}))}`:'Balance cleared'}${d.lastPaidAmount?` - Last payment ${fmt(d.lastPaidAmount)}`:''}`:`${fmt(d.payment)}/mo ${d.interest?`· ${d.interest}% APR`:''} ${d.due?`· Due: ${esc(d.due)}`:''} · ${d.payment>0?`~${mo} mo`:'—'}`;return`<div class="debt-card"><div style="display:flex;justify-content:space-between;margin-bottom:4px;gap:8px"><div><span style="font-weight:700">${esc(d.name)}</span> <span style="font-size:11px;color:var(--text3)">${esc(d.type)}</span>${badges.length?` ${badges.join(' ')}`:''}</div><div style="font-weight:700;color:${paidOff?'var(--green)':'var(--red)'}">${fmt(remaining)}</div></div><div style="font-size:12px;color:var(--text3)">${meta}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${paidOff?'':`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openDebtPayment(${d.id})">💳 Log Payment</button>`}<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtEdit(${d.id})">Edit</button><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openDebtHistory(${d.id})">View History</button></div><div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Payment summary</div>${summaryBody}</div></div>`};
  if(debts.length){
    document.getElementById('debt-summary').innerHTML=`<div style="display:grid;gap:10px;margin-bottom:14px"><div style="display:flex;gap:10px"><div style="flex:1;padding:12px;background:var(--red-soft);border-radius:var(--radius-xs);text-align:center"><div style="font-size:11px;color:var(--text3)">Total Owed</div><div style="font-size:18px;font-weight:800;color:var(--red)">${fmtShort(totalDebt)}</div></div><div style="flex:1;padding:12px;background:var(--surface2);border-radius:var(--radius-xs);text-align:center"><div style="font-size:11px;color:var(--text3)">Monthly Payments</div><div style="font-size:18px;font-weight:800">${fmtShort(debtPayoffData.monthlyMinimum)}</div></div></div><div class="card" style="padding:14px;margin:0"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Payoff method</div><div class="quick-actions" style="margin-bottom:10px"><button class="quick-chip" style="${debtPayoffSettings.method==='minimum'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="setDebtPayoffMethod('minimum')">Minimum Only</button><button class="quick-chip" style="${debtPayoffSettings.method==='snowball'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="setDebtPayoffMethod('snowball')">Snowball</button><button class="quick-chip" style="${debtPayoffSettings.method==='avalanche'?'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)':''}" onclick="setDebtPayoffMethod('avalanche')">Avalanche</button></div><div style="font-size:13px;font-weight:700">${activeDebts.length&&debtPayoffData.targetDebt?`Focus on ${esc(debtPayoffData.targetDebt.name)}`:activeDebts.length?'Pay minimums on all active debts':'All tracked debts are fully paid'}</div><div style="font-size:12px;color:var(--text2);margin-top:4px">${activeDebts.length?(debtPayoffData.extraPayment>0&&debtPayoffData.targetDebt?`Suggested extra payment: ${fmtShort(debtPayoffData.extraPayment)}`:'No safe extra payment right now'):`${paidOffDebts.length} paid-off account${paidOffDebts.length!==1?'s':''} kept below for reference`}</div></div></div>`;
    document.getElementById('debt-list').innerHTML=`${activeDebts.length?`<div style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:4px 0 10px;display:flex;align-items:center;justify-content:space-between;gap:10px"><span>Active Debts</span><span style="padding:4px 8px;border-radius:999px;background:var(--surface2);color:var(--text2)">${activeDebts.length}</span></div>${activeDebts.map(d=>renderDebtCard(d)).join('')}`:`<div class="card" style="padding:16px;margin:0 0 12px"><div style="font-size:13px;font-weight:700;color:var(--green)">No active debts right now</div><div style="font-size:12px;color:var(--text2);margin-top:6px">Your cleared accounts stay below in Paid Off so the history is still easy to find.</div></div>`}${paidOffDebts.length?`<div style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:${activeDebts.length?'14px 0 10px':'4px 0 10px'};display:flex;align-items:center;justify-content:space-between;gap:10px"><span>Paid Off</span><span style="padding:4px 8px;border-radius:999px;background:var(--green-soft);color:var(--green)">${paidOffDebts.length}</span></div>${paidOffDebts.map(d=>renderDebtCard(d,true)).join('')}`:''}`;
  }

  // === MORE ===
  document.getElementById('nw-inputs').innerHTML=nwAccounts.length?nwAccounts.map(a=>`<div class="nw-account"><div class="nw-name">${a.icon} ${a.name}</div><div class="nw-row-actions"><span style="color:var(--text3)">₱</span><input type="number" class="input" id="nw-${a.key}" value="${nwBalances[a.key]||0}" style="width:96px;text-align:right"><button class="btn-icon" onclick="openNetWorthEdit('${a.key}')" title="Edit">✏️</button></div></div>`).join(''):'<div class="empty"><div class="empty-icon">🏦</div><div class="empty-text">Add your first account</div></div>';
  const nwT=nwAccounts.reduce((s,a)=>s+(nwBalances[a.key]||0),0);const netW=nwT-totalDebt;
  document.getElementById('nw-total').innerHTML=`<div style="text-align:center;margin-top:16px"><div style="font-size:11px;color:var(--text3)">Net Worth</div><div style="font-size:28px;font-weight:800;color:${netW>=0?'var(--green)':'var(--red)'}">${fmt(netW)}</div><div style="font-size:12px;color:var(--text3)">Assets ${fmtShort(nwT)} — Debts ${fmtShort(totalDebt)}</div></div>`;
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
  document.getElementById('year-stats').innerHTML=[{l:'Earned',v:fmtShort(yEarned),c:'var(--green)'},{l:'Spent',v:fmtShort(ySpent),c:'var(--red)'},{l:'Saved',v:fmtShort(yEarned-ySpent),c:'var(--blue)'},{l:'Best Mo.',v:best.label,c:'var(--green)'}].map(s=>`<div class="stat-card"><div class="stat-label">${s.l}</div><div class="stat-value" style="color:${s.c};font-size:16px">${s.v}</div></div>`).join('');
  const yMax=Math.max(...yMonths.map(m=>m.total),1);
  document.getElementById('year-chart').innerHTML=`<div style="font-size:13px;font-weight:700;margin-bottom:8px">Monthly Spending</div><div class="bar-chart">${yMonths.map((m,i)=>`<div class="bar-row"><div class="bar-label">${m.label}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(m.total/yMax*100,1)}%;background:${m.total===worst.total&&m.total>0?'var(--red)':m.total===best.total&&m.total>0?'var(--green)':'var(--text3)'};opacity:${m.total>0?.7:.2}">${m.total/yMax>.15?fmtShort(m.total):''}</div></div><div class="bar-amount">${m.total?fmtShort(m.total):'-'}</div></div>`).join('')}</div>`;
  const yCT={};yE.filter(e=>!e.isDebtPayment).forEach(e=>{yCT[e.category]=(yCT[e.category]||0)+e.amount});const topC=Object.entries(yCT).sort((a,b)=>b[1]-a[1]).slice(0,5);const tcM=topC.length?topC[0][1]:1;
  document.getElementById('year-top').innerHTML=topC.length?`<div style="font-size:13px;font-weight:700;margin-bottom:8px">Top Categories</div><div class="bar-chart">${topC.map((t,i)=>`<div class="bar-row"><div class="bar-label" style="width:60px;font-size:10px">${esc(t[0].substring(0,12))}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(t[1]/tcM*100,5)}%;background:${CHART_COLORS[i]}">${t[1]/tcM>.2?fmtShort(t[1]):''}</div></div><div class="bar-amount">${fmtShort(t[1])}</div></div>`).join('')}</div>`:'';

  // Journal
  document.getElementById('journal-list').innerHTML=journal.length?journal.map(j=>`<div class="journal-card"><div class="journal-date">${esc(j.month||'')} · ${esc(j.date)}</div>${j.title?`<div class="journal-title">${esc(j.title)}</div>`:''}<div class="journal-text">${esc(j.note)}</div><button class="btn-icon" onclick="deleteJournal(${j.id})" style="border:none;color:var(--red);font-size:12px;margin-top:8px">✕ Delete</button></div>`).join(''):'<div class="empty"><div class="empty-icon">📝</div><div class="empty-text">Start journaling your financial journey</div></div>';

  // 50/30/20
  const np=salary>0?Math.round(needsB/salary*100):0,wp=salary>0?Math.round(wantsB/salary*100):0,sp=salary>0?Math.round(savsB/salary*100):0;
  document.getElementById('rule-content').innerHTML=`<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin-bottom:16px"><div style="width:${np}%;background:var(--blue)"></div><div style="width:${wp}%;background:var(--amber)"></div><div style="width:${sp}%;background:var(--green)"></div></div>${[{label:'Needs',pct:np,ideal:50,color:'var(--blue)',amt:needsB},{label:'Wants',pct:wp,ideal:30,color:'var(--amber)',amt:wantsB},{label:'Savings',pct:sp,ideal:20,color:'var(--green)',amt:savsB}].map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><span style="font-weight:700;color:${r.color}">${r.label}</span> <span style="font-size:12px;color:var(--text3)">(${r.ideal}% ideal)</span></div><div style="text-align:right"><div style="font-weight:700">${r.pct}%</div><div style="font-size:11px;color:var(--text3)">${fmtShort(r.amt)}</div></div></div>`).join('')}`;

  // Settings
  const smartSalaryEl=document.getElementById('smart-salary');if(smartSalaryEl)smartSalaryEl.value=salary;
  document.getElementById('settings-content').innerHTML=`<div class="setting-item"><div class="setting-left"><div class="setting-icon">💵</div><div><div class="setting-name">Monthly Salary</div><div class="setting-desc">Take-home pay</div></div></div><div style="display:flex;align-items:center;gap:4px"><span style="color:var(--text3)">₱</span><input type="number" class="input setting-input" id="s-salary" value="${salary}" onchange="salary=parseFloat(this.value)||0;saveData();render()"></div></div>${ac.map(c=>{const key='b-'+c.name.replace(/[^a-zA-Z0-9]/g,'');return`<div class="setting-item"><div class="setting-left"><div class="setting-icon">${c.icon||'📦'}</div><div><div class="setting-name" style="font-size:12px">${esc(c.name)}</div></div></div><div style="display:flex;align-items:center;gap:4px"><span style="color:var(--text3)">₱</span><input type="number" class="input setting-input" id="${key}" value="${budgets[c.name]||0}" onchange="budgets['${c.name.replace(/'/g,"\\'")}']  =parseFloat(this.value)||0;saveData();render()"></div></div>`}).join('')}<div style="padding:12px;background:var(--surface2);border-radius:var(--radius-xs);margin-top:10px;font-size:13px;text-align:center">Total: <strong>${fmt(totalBudgeted)}</strong> · Unallocated: <strong style="color:${unalloc>=0?'var(--accent)':'var(--red)'}">${fmt(unalloc)}</strong></div>`;

  // Recurring manager
  const rm=document.getElementById('recurring-manager');
  if(rm){const monthKey=currentMonthKey();const recurringList=[...recurring].map(r=>({item:r,status:recurringStatus(r)})).sort((a,b)=>{if(a.status.state==='paid'&&b.status.state!=='paid')return 1;if(a.status.state!=='paid'&&b.status.state==='paid')return-1;return a.status.days-b.status.days});rm.innerHTML=recurringList.length?recurringList.map(({item,status})=>`<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)"><div class="tx-icon ${item.type==='bill'?'cat-electric':'cat-income'}" style="width:36px;height:36px">${item.type==='bill'?'🧾':'💵'}</div><div style="flex:1"><div style="font-weight:700;font-size:13px">${esc(item.name)}</div><div style="font-size:11px;color:var(--text3)">${item.type==='bill'?(item.category||'Bill'):'Income'} · ${fmt(item.amount)} · day ${item.day}</div><div style="font-size:11px;color:${status.color};margin-top:2px">${status.label}</div></div>${status.state!=='paid'?`<button class="btn btn-sm btn-primary" onclick="markRecurringPaid(${item.id})">Pay</button>`:`<button class="btn btn-sm btn-ghost" onclick="recurring.find(r=>r.id===${item.id}).lastPaid='';saveData();render()">Reset</button>`}<button class="btn-icon" onclick="deleteRecurring(${item.id})" style="border:none;color:var(--red)">✕</button></div>`).join(''):'<div class="empty"><div class="empty-icon">🔁</div><div class="empty-text">Add monthly bills or income</div></div>'}

  // Alert settings
  const alertSettingsEl=document.getElementById('alert-settings');
  if(alertSettingsEl)alertSettingsEl.innerHTML=`<div class="setting-item"><div class="setting-left"><div class="setting-icon">📏</div><div><div class="setting-name">Budget warning threshold</div><div class="setting-desc">Alert when a category reaches this %</div></div></div><div style="display:flex;align-items:center;gap:8px"><input type="number" min="1" max="100" class="input setting-input" value="${alertSettings.budgetThreshold}" onchange="setAlertThreshold(this.value)"><span style="font-size:12px;color:var(--text3)">%</span></div></div>${[['overspendForecast','📉','Forecast overspending','Warn when month-end spend projected to exceed income'],['recurringDueSoon','🧾','Recurring due soon','Bills/income due today or within 3 days'],['spikeAlerts','📈','Spending spikes','Compare against last month'],['lowBalanceAlerts','💸','Low balance','Warn when daily budget gets small']].map(([key,icon,name,desc])=>`<div class="setting-item"><div class="setting-left"><div class="setting-icon">${icon}</div><div><div class="setting-name">${name}</div><div class="setting-desc">${desc}</div></div></div><input type="checkbox" ${alertSettings[key]?'checked':''} onchange="setAlertToggle('${key}',this.checked)"></div>`).join('')}`;

  // Custom cats
  document.getElementById('custom-cat-list').innerHTML=customCats.length?customCats.map(c=>{const cnt=entries.filter(e=>!e.isDebtPayment&&e.category===c.name).length;return`<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">${esc(c.name)}</div><div style="font-size:11px;color:var(--text3)">${fmt(budgets[c.name]||0)} · ${cnt} entries</div></div><button class="btn-icon" onclick="openEditModal('${esc(c.name).replace(/'/g,"\\'")}')">✏️</button><button class="btn-icon" onclick="openDeleteModal('${esc(c.name).replace(/'/g,"\\'")}')">🗑️</button></div>`}).join(''):'<div style="font-size:13px;color:var(--text3);text-align:center;padding:16px">No custom categories</div>';
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
