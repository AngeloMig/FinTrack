/* ============================================================
   features.js — extracted feature modules
   Load order: defaults.js → store.js → persistence.js → features.js → app.js
   ============================================================ */

/* ── Budget Rollovers ── */
function computeRolloverForMonth(monthKey){
  const prev=getPreviousMonthKeyFrom(monthKey);
  const prevTotals=getMonthCategoryTotals(prev);
  const result={};
  allCats().filter(c=>c.group!=='savings'&&rolloverSettings[c.name]).forEach(c=>{
    const spent=Number(prevTotals[c.name]||0);
    const budget=Number(budgets[c.name]||0);
    if(budget<=0)return;
    const unused=budget-spent;
    if(unused<=0)return;
    result[c.name]=Math.min(unused,budget);
  });
  return result;
}
function ensureRolloversForMonth(monthKey=filterMonth){
  if(budgetRollovers[monthKey])return;
  const rollovers=computeRolloverForMonth(monthKey);
  if(Object.keys(rollovers).length){budgetRollovers[monthKey]=rollovers;saveData();}
}
function getEffectiveBudget(categoryName,monthKey=filterMonth){
  const base=Number(budgets[categoryName]||0);
  const rollover=Number((budgetRollovers[monthKey]||{})[categoryName]||0);
  return{base,rollover,total:base+rollover};
}
function toggleCategoryRollover(name){rolloverSettings[name]=!rolloverSettings[name];saveData();render();}

/* ── Spend Forecast ── */
function getSpendForecastData(){
  const monthKey=currentMonthKey();
  if(filterMonth!==monthKey)return null;
  const today=new Date(`${todayStr}T00:00:00`);
  const daysElapsed=Math.max(today.getDate(),1);
  const daysInMonth=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  const catTotals=getMonthCategoryTotals(monthKey);
  const ac=allCats();
  const items=[];
  ac.filter(c=>c.group!=='savings'&&c.type==='variable').forEach(c=>{
    const spent=Number(catTotals[c.name]||0);
    const budget=Number(budgets[c.name]||0);
    if(spent<=0||budget<=0)return;
    const projected=(spent/daysElapsed)*daysInMonth;
    if(projected<=budget)return;
    const overAmt=projected-budget;
    const overPct=Math.round((overAmt/budget)*100);
    items.push({name:c.name,icon:c.icon,spent,budget,projected,overAmt,overPct});
  });
  items.sort((a,b)=>b.overAmt-a.overAmt);
  return{items,daysElapsed,daysInMonth};
}
let _forecastExpanded=false;
function toggleForecastExpand(){_forecastExpanded=!_forecastExpanded;renderSpendForecastCard();}
function renderSpendForecastCard(){
  try{
    const mount=document.getElementById('spend-forecast-card');
    if(!mount)return;
    const data=getSpendForecastData();
    if(!data||!data.items.length){mount.innerHTML='';return;}
    const show=_forecastExpanded?data.items:data.items.slice(0,3);
    mount.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">📈 Spend Forecast</span><span class="card-badge" style="background:var(--red-soft,#fee2e2);color:var(--red)">${data.items.length} at risk</span></div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Based on ${data.daysElapsed}/${data.daysInMonth} days elapsed — projected end-of-month</div>
      ${show.map(item=>`<div class="focus-item"><div class="focus-top"><div><div class="focus-name">${item.icon} ${esc(item.name)}</div><div class="focus-meta">${fmt(item.spent)} spent → ${fmt(item.projected)} projected · ${fmt(item.overAmt)} over</div></div><span class="focus-tag risk">${item.overPct}% over</span></div></div>`).join('')}
      ${data.items.length>3?`<button class="btn btn-ghost btn-sm" onclick="toggleForecastExpand()" style="margin-top:8px">${_forecastExpanded?'Show less':'Show all '+data.items.length}</button>`:''}
    </div>`;
  }catch(e){}
}

/* ── Tag Helpers ── */
function rememberTags(tags){if(!tags||!tags.length)return;tags.forEach(t=>{if(!recentTags.includes(t))recentTags.unshift(t);});recentTags=recentTags.slice(0,30);}
function renderTagSuggestions(){const el=document.getElementById('tag-suggestions');if(!el)return;const input=(document.getElementById('f-tags')?.value||'').toLowerCase();const existing=input.split(',').map(t=>t.trim()).filter(Boolean);const suggestions=recentTags.filter(t=>!existing.includes(t)&&(!input.split(',').pop().trim()||t.includes(input.split(',').pop().trim()))).slice(0,6);el.innerHTML=suggestions.map(t=>`<button type="button" class="quick-chip" onclick="addTagChip('${t.replace(/'/g,"\\'")}')">${esc(t)}</button>`).join('');}
function addTagChip(tag){const el=document.getElementById('f-tags');if(!el)return;const existing=el.value.split(',').map(t=>t.trim()).filter(Boolean);if(!existing.includes(tag)){existing.push(tag);el.value=existing.join(', ');}renderTagSuggestions();}
function setHistoryTagFilter(tag){const el=document.getElementById('hist-tag');if(el){el.value=tag;}showTab('history');render();showActionToast('Filtered by tag',tag,'🏷️');}
function clearHistoryTagFilter(){const el=document.getElementById('hist-tag');if(el)el.value='';render();}

/* ── SMS Auto-Fill ── */
const SMS_MERCHANT_CAT={'jollibee':'Dining Out','mcdo':'Dining Out','mcdonald':'Dining Out','kfc':'Dining Out','chowking':'Dining Out','ministop':'Dining Out','7-eleven':'Coffee & Snacks','711':'Coffee & Snacks','starbucks':'Coffee & Snacks','grab food':'Food Delivery','foodpanda':'Food Delivery','grabfood':'Food Delivery','grab':'Ride-Hailing','angkas':'Ride-Hailing','move it':'Ride-Hailing','sm supermarket':'Groceries','sm market':'Groceries','puregold':'Groceries','landers':'Groceries','robinsons supermarket':'Groceries','lazada':'Shopping','shopee':'Shopping','zalora':'Shopping','meralco':'Electric Bill','maynilad':'Water Bill','manila water':'Water Bill','pldt':'Internet / Subscriptions','converge':'Internet / Subscriptions','globe':'Internet / Subscriptions','smart':'Internet / Subscriptions','netflix':'Streaming Services','spotify':'Streaming Services','mercury drug':'Medicines & Vitamins','rose pharmacy':'Medicines & Vitamins','watsons':'Grooming & Haircut'};
function suggestCategoryFromMerchant(merchant){if(!merchant)return'';const lower=merchant.toLowerCase();for(const[keyword,cat]of Object.entries(SMS_MERCHANT_CAT)){if(lower.includes(keyword))return cat;}return'';}
const SMS_PATTERNS=[
  {name:'GCash Send',re:/[Yy]ou sent (?:Php|PHP) ([\d,]+\.?\d*) to (.+?) on (\d{2}\/\d{2}\/\d{4})/,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'expense',account:'gcash'})},
  {name:'GCash Receive',re:/[Yy]ou received (?:Php|PHP) ([\d,]+\.?\d*) from (.+?) on (\d{2}\/\d{2}\/\d{4})/,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'income',account:'gcash'})},
  {name:'GCash Cash In',re:/[Cc]ash [Ii]n of (?:Php|PHP) ([\d,]+\.?\d*) from (.+?) on (\d{2}\/\d{2}\/\d{4})/,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'income',account:'gcash'})},
  {name:'BDO Debit',re:/BDO acct \.+(\d{4}) (?:was )?debited (?:PHP|Php)? ?([\d,]+\.?\d*) on (\w+) at (.+?)(?:\.|$)/i,parse:m=>({amount:parseFloat(m[2].replace(/,/g,'')),merchant:m[4].trim(),rawDate:m[3],type:'expense',account:'bdo'})},
  {name:'BDO Online',re:/BDO: (?:A payment|Purchase) of (?:PHP|Php)? ?([\d,]+\.?\d*) (?:to|at) (.+?) (?:on|dated) (.+?) /i,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'expense',account:'bdo'})},
  {name:'BPI Debit',re:/BPI: Debit of PHP([\d,]+\.?\d*) at (.+?) on (\d{2}[A-Za-z]{3}\d{2,4})/i,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'expense',account:'bdo'})},
  {name:'Maya Send',re:/(?:Maya|PayMaya).*?PHP ([\d,]+\.?\d*).*?(?:to|at) (.+?) on (\d{2}\/\d{2}\/\d{4})/i,parse:m=>({amount:parseFloat(m[1].replace(/,/g,'')),merchant:m[2].trim(),rawDate:m[3],type:'expense',account:'gcash'})},
];
function parseSmsDate(rawDate){if(!rawDate)return todayStr;const slash=rawDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(slash)return`${slash[3]}-${slash[1]}-${slash[2]}`;const months={JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12'};const compact=rawDate.toUpperCase().match(/^(\d{2})([A-Z]{3})(\d{2,4})$/);if(compact){const yr=compact[3].length===2?'20'+compact[3]:compact[3];return`${yr}-${months[compact[2]]||'01'}-${compact[1]}`;}return todayStr;}
function parseSmsText(text){for(const p of SMS_PATTERNS){const m=text.match(p.re);if(m){const result=p.parse(m);result.date=parseSmsDate(result.rawDate);result.suggestedCategory=suggestCategoryFromMerchant(result.merchant);return result;}}return null;}
let _smsParsed=null;
function openSmsModal(){document.getElementById('sms-text').value='';document.getElementById('sms-result').innerHTML='';document.getElementById('sms-apply-btn').style.display='none';_smsParsed=null;openModal('modal-sms');}
function parseSmsInput(){const text=(document.getElementById('sms-text').value||'').trim();if(!text)return;_smsParsed=parseSmsText(text);const resultEl=document.getElementById('sms-result');const applyBtn=document.getElementById('sms-apply-btn');if(!_smsParsed){resultEl.innerHTML='<div style="color:var(--red);font-size:13px;padding:8px">⚠️ Could not parse this SMS. Supported: GCash, BDO, BPI, Maya. Make sure you paste the full message.</div>';applyBtn.style.display='none';return;}const p=_smsParsed;const typeLabel=p.type==='income'?'💵 Income':'🧾 Expense';const acct=nwAccounts.find(a=>a.key===p.account)||nwAccounts[0];resultEl.innerHTML=`<div style="display:grid;gap:8px;font-size:13px;padding:12px;background:var(--surface2);border-radius:var(--radius-sm);border-left:3px solid var(--accent)"><div style="display:flex;justify-content:space-between"><strong>Type</strong><span>${typeLabel}</span></div><div style="display:flex;justify-content:space-between"><strong>Amount</strong><span style="color:var(--accent);font-weight:800">${fmt(p.amount)}</span></div><div style="display:flex;justify-content:space-between"><strong>Merchant</strong><span>${esc(p.merchant)}</span></div><div style="display:flex;justify-content:space-between"><strong>Date</strong><span>${p.date}</span></div><div style="display:flex;justify-content:space-between"><strong>Account</strong><span>${esc(acct?acct.name:p.account)}</span></div>${p.suggestedCategory?`<div style="display:flex;justify-content:space-between"><strong>Suggested category</strong><span style="color:var(--accent)">${esc(p.suggestedCategory)}</span></div>`:''}</div>`;applyBtn.style.display='block';}
function applySmsToForm(){if(!_smsParsed)return;const p=_smsParsed;if(p.type==='expense'){const amtEl=document.getElementById('f-amount');if(amtEl)amtEl.value=p.amount;const dateEl=document.getElementById('f-date');if(dateEl)dateEl.value=p.date;const noteEl=document.getElementById('f-note');if(noteEl)noteEl.value=p.merchant;if(p.suggestedCategory){const catSel=document.getElementById('f-cat');if(catSel){const exists=[...catSel.options].some(o=>o.value===p.suggestedCategory);if(exists)catSel.value=p.suggestedCategory;toggleCustom();}}const accSel=document.getElementById('f-account');if(accSel){const exists=[...accSel.options].some(o=>o.value===p.account);if(exists)accSel.value=p.account;}updateAddPreviews();}else{const amtEl=document.getElementById('inc-amount');if(amtEl)amtEl.value=p.amount;const dateEl=document.getElementById('inc-date');if(dateEl)dateEl.value=p.date;const noteEl=document.getElementById('inc-note');if(noteEl)noteEl.value=p.merchant;const accSel=document.getElementById('inc-account');if(accSel){const exists=[...accSel.options].some(o=>o.value===p.account);if(exists)accSel.value=p.account;}updateAddPreviews();}closeModal('modal-sms');showActionToast('SMS parsed',`${fmt(p.amount)} · ${esc(p.merchant)}`,'📱');}

/* ── Installment Tracker ── */
function updateInstallmentPreview(){const total=parseFloat(document.getElementById('inst-total')?.value)||0;const months=parseInt(document.getElementById('inst-months')?.value)||0;const el=document.getElementById('inst-preview');if(el)el.textContent=(total>0&&months>0)?`≈ ${fmt(Math.round((total/months)*100)/100)} per month`:'';}
function openAddInstallmentModal(){
  const el=id=>document.getElementById(id);
  if(el('inst-name'))el('inst-name').value='';
  if(el('inst-total'))el('inst-total').value='';
  if(el('inst-months'))el('inst-months').value='';
  if(el('inst-start'))el('inst-start').value=currentMonthKey();
  if(el('inst-preview'))el('inst-preview').textContent='';
  buildAccountSelect('inst-account');
  const accSel=el('inst-account');if(accSel&&!accSel.value)accSel.value=getDefaultAccountKey();
  buildCatSelect('inst-cat');
  openModal('modal-add-installment');
}
function addInstallment(){
  const name=(document.getElementById('inst-name')?.value||'').trim();
  const total=parseFloat(document.getElementById('inst-total')?.value)||0;
  const months=parseInt(document.getElementById('inst-months')?.value)||0;
  const start=document.getElementById('inst-start')?.value||currentMonthKey();
  const account=document.getElementById('inst-account')?.value||'';
  const category=document.getElementById('inst-cat')?.value||'';
  if(!name||total<=0||months<2||!account){showAlert('Fill in all fields (name, total, months ≥ 2, account).');return;}
  const monthly=Math.round((total/months)*100)/100;
  installments.unshift({id:nextInstallmentId++,name,totalAmount:total,months,startMonth:start,monthlyAmount:monthly,account,category,paidMonths:[]});
  closeModal('modal-add-installment');saveData();render();
  showActionToast(`${name} added`,`${fmt(monthly)}/mo × ${months} months`,'💳');
}
function markInstallmentPaid(id,monthKey){
  const inst=installments.find(x=>x.id===id);if(!inst)return;
  if(inst.paidMonths.includes(monthKey)){showAlert('Already marked paid for this month.');return;}
  const bal=getSpendValidationState(inst.account,inst.monthlyAmount);
  if(!bal.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(inst.account).name}. Available: ${fmt(bal.available)}`);return;}
  entries.unshift(stampRecord({id:nextId++,date:todayStr,category:inst.category||'Miscellaneous / Buffer',amount:inst.monthlyAmount,account:inst.account,note:`Installment: ${inst.name} (${monthKey})`,isInstallmentPayment:true,installmentId:id}));
  adjustAccountBalance(inst.account,-inst.monthlyAmount);
  inst.paidMonths.push(monthKey);
  saveData();render();
  showActionToast(`${inst.name} paid`,`${fmt(inst.monthlyAmount)} · ${monthKey}`,'✓');
}
function deleteInstallment(id){
  const inst=installments.find(x=>x.id===id);if(!inst)return;
  showConfirm(`Delete installment "${inst.name}"? This won't reverse past payments logged.`,()=>{installments=installments.filter(x=>x.id!==id);saveData();render();showActionToast('Installment deleted',inst.name,'🗑️');},'Delete',true);
}
function getActiveInstallments(){
  return installments.filter(inst=>{
    const [sy,sm]=inst.startMonth.split('-').map(Number);
    const endDate=new Date(sy,sm-1+inst.months,1);
    return endDate>now&&inst.paidMonths.length<inst.months;
  });
}
function renderInstallmentsCard(){
  try{
    const mounts=[document.getElementById('installments-card'),document.getElementById('installments-card-mini')];
    const active=getActiveInstallments();
    const curMonth=currentMonthKey();
    mounts.forEach((mount,idx)=>{
      if(!mount)return;
      const isMini=idx===1;
      const list=isMini?active.slice(0,2):active;
      if(!list.length&&!installments.length){mount.innerHTML='';return;}
      const done=installments.filter(inst=>inst.paidMonths.length>=inst.months);
      mount.innerHTML=`<div class="card">
        <div class="card-header"><span class="card-title">💳 Installments</span><button class="btn btn-sm btn-ghost" onclick="openAddInstallmentModal()">+ Add</button></div>
        ${list.length?list.map(inst=>{
          const isPaid=inst.paidMonths.includes(curMonth);
          const remaining=inst.months-inst.paidMonths.length;
          const pct=Math.round((inst.paidMonths.length/inst.months)*100);
          const safe=inst.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
          return`<div class="installment-item"><div class="installment-head"><div><div class="installment-name">${esc(inst.name)}</div><div class="installment-meta">${fmt(inst.monthlyAmount)}/mo · ${remaining} left of ${inst.months} months</div></div>${isPaid?`<span class="installment-paid-badge">✓ Paid</span>`:`<button class="btn btn-sm btn-primary" onclick="markInstallmentPaid(${inst.id},'${curMonth}')">Mark Paid</button>`}</div><div class="installment-progress"><div class="installment-bar" style="width:${pct}%"></div></div></div>`;
        }).join(''):'<div style="font-size:13px;color:var(--text3);padding:8px 0">All installments completed!</div>'}
        ${!isMini&&done.length?`<div style="font-size:11px;color:var(--text3);margin-top:10px">✓ ${done.length} completed installment${done.length===1?'':'s'}</div>`:''}
        ${active.length?`<div style="font-size:11px;color:var(--text3);margin-top:8px;display:flex;justify-content:space-between"><span>Total monthly obligation</span><strong>${fmt(active.reduce((s,i)=>s+i.monthlyAmount,0))}</strong></div>`:''}
      </div>`;
    });
  }catch(e){}
}

/* ── Bill Split Tracker ── */
function updateSplitPreview(){const total=parseFloat(document.getElementById('sp-total')?.value)||0;const mine=parseFloat(document.getElementById('sp-my-share')?.value)||0;const el=document.getElementById('sp-preview');if(el)el.textContent=(total>0&&mine>0)?`They owe you: ${fmt(Math.max(total-mine,0))}`:(total>0?'Enter your share':'')}
function toggleSplitAccountWrap(){const show=(document.getElementById('sp-log-expense')?.checked);const wrap=document.getElementById('sp-account-wrap');if(wrap)wrap.style.display=show?'':'none';}
function openAddSplitModal(){
  const el=id=>document.getElementById(id);
  if(el('sp-desc'))el('sp-desc').value='';
  if(el('sp-total'))el('sp-total').value='';
  if(el('sp-my-share'))el('sp-my-share').value='';
  if(el('sp-with'))el('sp-with').value='';
  if(el('sp-date'))el('sp-date').value=todayStr;
  if(el('sp-preview'))el('sp-preview').textContent='';
  if(el('sp-log-expense'))el('sp-log-expense').checked=true;
  buildAccountSelect('sp-account');
  const accSel=el('sp-account');if(accSel&&!accSel.value)accSel.value=getDefaultAccountKey();
  toggleSplitAccountWrap();
  openModal('modal-add-split');
}
function addSplit(){
  const description=(document.getElementById('sp-desc')?.value||'').trim();
  const totalAmount=parseFloat(document.getElementById('sp-total')?.value)||0;
  const splitWith=(document.getElementById('sp-with')?.value||'').trim();
  const myShare=parseFloat(document.getElementById('sp-my-share')?.value)||0;
  const date=document.getElementById('sp-date')?.value||todayStr;
  const logMyShare=document.getElementById('sp-log-expense')?.checked;
  const account=document.getElementById('sp-account')?.value||'';
  if(!description||totalAmount<=0||!splitWith||myShare<=0){showAlert('Fill in all fields.');return;}
  const theyOwe=Math.max(totalAmount-myShare,0);
  splits.unshift({id:nextSplitId++,description,totalAmount,date,splitWith,myShare,theyOwe,settled:false,settledDate:null});
  if(logMyShare&&account){
    const bal=getSpendValidationState(account,myShare);
    if(!bal.hasEnough){showAlert(`Not enough balance in ${getAccountInfo(account).name}. Entry not logged.`);}
    else{entries.unshift(stampRecord({id:nextId++,date,category:'Miscellaneous / Buffer',amount:myShare,account,note:`Split: ${description} with ${splitWith}`}));adjustAccountBalance(account,-myShare);}
  }
  closeModal('modal-add-split');saveData();render();
  showActionToast(`${splitWith} owes you ${fmt(theyOwe)}`,description,'🤝');
}
function markSplitSettled(id){const sp=splits.find(x=>x.id===id);if(!sp)return;sp.settled=true;sp.settledDate=todayStr;saveData();render();showActionToast('Split settled',`${sp.splitWith} · ${fmt(sp.theyOwe)}`,'✓');}
function deleteSplit(id){const sp=splits.find(x=>x.id===id);if(!sp)return;showConfirm(`Delete split with ${sp.splitWith}?`,()=>{splits=splits.filter(x=>x.id!==id);saveData();render();showActionToast('Split deleted',sp.description,'🗑️');},'Delete',true);}
function renderSplitsCard(){
  try{
    const mount=document.getElementById('splits-card');if(!mount)return;
    const unsettled=splits.filter(s=>!s.settled);
    const totalOwed=unsettled.reduce((sum,s)=>sum+s.theyOwe,0);
    if(!splits.length){mount.innerHTML='<div class="empty" style="padding:12px 0"><div class="empty-icon">🤝</div><div class="empty-text">No split expenses yet</div></div>';return;}
    const recent=splits.slice(0,20);
    mount.innerHTML=(unsettled.length?`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--green-soft);border-radius:var(--radius-sm);margin-bottom:12px"><div><div style="font-size:11px;color:var(--text3)">Total owed to you</div><div style="font-size:20px;font-weight:800;color:var(--green)">${fmt(totalOwed)}</div></div><span style="font-size:11px;color:var(--text3)">${unsettled.length} pending</span></div>`:'')
    +`<div class="tx-list">${recent.map(sp=>`<div class="tx-item${sp.settled?' split-settled':''}"><div class="tx-icon" style="background:var(--accent-soft);color:var(--accent);font-size:16px">🤝</div><div class="tx-info"><div class="tx-name">${esc(sp.splitWith)} — ${esc(sp.description)}</div><div class="tx-meta">${sp.date} · My share: ${fmt(sp.myShare)} · ${sp.settled?'Settled':'They owe: '+(fmt(sp.theyOwe))}</div></div>${sp.settled?'':`<button class="btn btn-sm btn-ghost" onclick="markSplitSettled(${sp.id})" style="font-size:11px">Settle</button>`}<button class="btn-icon" onclick="deleteSplit(${sp.id})" style="border:none;color:var(--red);font-size:12px">✕</button></div>`).join('')}</div>`;
  }catch(e){}
}

/* ── Goals Timeline ── */
function buildGoalsTimelineSVG(){
  const W=340,H=110,PAD=24,TY=48;
  const now2=new Date();
  const xFor=i=>PAD+(i/23)*(W-PAD*2);
  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${H}px;display:block;overflow:visible">`;
  svg+=`<line x1="${PAD}" y1="${TY}" x2="${W-PAD}" y2="${TY}" stroke="var(--border)" stroke-width="2" stroke-linecap="round"/>`;
  [0,6,12,18,23].forEach(i=>{
    const x=xFor(i);
    const d=new Date(now2.getFullYear(),now2.getMonth()+i,1);
    const label=i===0?'Now':d.toLocaleDateString('en-PH',{month:'short',year:'2-digit'});
    svg+=`<line x1="${x}" y1="${TY-5}" x2="${x}" y2="${TY+5}" stroke="var(--border)" stroke-width="1.5"/>`;
    svg+=`<text x="${x}" y="${TY+17}" text-anchor="middle" font-size="8" fill="var(--text3)">${label}</text>`;
  });
  goals.filter(g=>g.target>0).forEach((g,idx)=>{
    const left=Math.max(Number(g.target||0)-Number(g.current||0),0);
    const pct=g.target>0?Math.min(g.current/g.target*100,100):0;
    const monthly=Number(g.monthly||0);
    let rawMo=null;
    if(pct>=100)rawMo=0;
    else if(monthly>0)rawMo=Math.ceil(left/monthly);
    if(rawMo===null)return;
    const etaDate=pct<100&&rawMo?new Date(now2.getFullYear(),now2.getMonth()+rawMo,1):null;
    const targetDate=g.targetDate?new Date(g.targetDate):null;
    let color='var(--text3)';
    if(pct>=100)color='var(--green)';
    else if(etaDate&&targetDate)color=etaDate<=targetDate?'var(--green)':'var(--red)';
    else if(monthly>0)color=rawMo<=12?'var(--accent)':'var(--amber)';
    const moIdx=Math.max(0,Math.min(23,rawMo));
    const overflow=rawMo>23;
    const x=xFor(moIdx);
    const y=TY-22-(idx%2)*22;
    const R=8;
    svg+=`<line x1="${x}" y1="${y+R}" x2="${x}" y2="${TY}" stroke="${color}" stroke-width="1" opacity="0.5"${overflow?' stroke-dasharray="3,2"':''}/>`;
    svg+=`<circle cx="${x}" cy="${y}" r="${R}" fill="${pct>=100?color:'var(--surface)'}" stroke="${color}" stroke-width="2"/>`;
    if(pct>=100){svg+=`<text x="${x}" y="${y+3}" text-anchor="middle" font-size="8" fill="white" font-weight="700">✓</text>`;}
    else{svg+=`<text x="${x}" y="${y+3}" text-anchor="middle" font-size="7" fill="${color}">${Math.round(pct)}%</text>`;}
    const shortName=g.name.length>8?g.name.slice(0,7)+'…':g.name;
    svg+=`<text x="${x}" y="${y-R-3}" text-anchor="middle" font-size="7" fill="var(--text2)">${shortName}</text>`;
  });
  svg+='</svg>';
  return svg;
}
function toggleGoalsTimeline(){goalsTimelineVisible=!goalsTimelineVisible;renderGoalsTimeline();}
function renderGoalsTimeline(){
  const el=document.getElementById('goals-timeline-card');if(!el)return;
  const hasTrackable=goals.some(g=>g.target>0&&g.monthly>0&&g.current<g.target)||goals.some(g=>g.target>0&&g.current>=g.target);
  el.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">📅 Goals Timeline</span><button class="btn btn-sm btn-ghost" onclick="toggleGoalsTimeline()">${goalsTimelineVisible?'Hide':'Show'}</button></div>${goalsTimelineVisible?(hasTrackable?`<div class="goals-timeline-wrap" style="padding:8px 12px 4px">${buildGoalsTimelineSVG()}</div>`:'<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">Set a monthly contribution on your goals to see the timeline</div></div>'):''}  </div>`;
}

/* ── History Analytics ── */
function setHistoryViewMode(mode){historyViewMode=mode;render();}
function renderHistoryAnalytics(expenseData,incomeData){
  const el=document.getElementById('history-analytics');if(!el)return;
  const btnList=document.getElementById('hist-view-list');const btnAnalytics=document.getElementById('hist-view-analytics');
  if(btnList){btnList.style.background=historyViewMode==='list'?'var(--accent)':'';btnList.style.color=historyViewMode==='list'?'#fff':'';}
  if(btnAnalytics){btnAnalytics.style.background=historyViewMode==='analytics'?'var(--accent)':'';btnAnalytics.style.color=historyViewMode==='analytics'?'#fff':'';}
  if(historyViewMode!=='analytics'){el.style.display='none';document.getElementById('history-content').style.display='';const incCard=document.getElementById('income-history')?.closest('.card');if(incCard)incCard.style.display='';return;}
  el.style.display='block';
  document.getElementById('history-content').style.display='none';
  const incCard=document.getElementById('income-history')?.closest('.card');if(incCard)incCard.style.display='none';
  const catTotals={};
  expenseData.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
  const totalSpent=expenseData.reduce((s,e)=>s+e.amount,0);
  const sortedCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const dailyTotals={};
  expenseData.forEach(e=>{dailyTotals[e.date]=(dailyTotals[e.date]||0)+e.amount;});
  const maxDay=Math.max(...Object.values(dailyTotals),1);
  const dayKeys=Object.keys(dailyTotals).sort();
  const merchantTotals={};
  expenseData.forEach(e=>{if(e.note)merchantTotals[e.note]=(merchantTotals[e.note]||0)+e.amount;});
  const topMerchants=Object.entries(merchantTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  el.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">By Category</span><span class="card-badge">${expenseData.length} item${expenseData.length===1?'':'s'}</span></div><div style="padding:0 16px 16px">${sortedCats.length===0?'<div style="padding:16px 0;font-size:13px;color:var(--text3)">No expenses in this range</div>':sortedCats.map(([cat,amt])=>{const pct=totalSpent>0?amt/totalSpent*100:0;const info=getCatInfo(cat);return`<div style="margin-bottom:10px"><div class="progress-header"><span class="progress-label">${info.icon} ${esc(cat)}</span><span class="progress-value">${fmt(amt)} · ${pct.toFixed(0)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--accent)"></div></div></div>`;}).join('')}</div></div>${dayKeys.length?`<div class="card"><div class="card-header"><span class="card-title">Daily Spending</span></div><div style="padding:0 16px 16px;overflow-x:auto"><div style="display:flex;align-items:flex-end;gap:3px;height:64px;min-width:${Math.max(dayKeys.length*14,200)}px">${dayKeys.map(d=>{const h=Math.round((dailyTotals[d]/maxDay)*56)+4;const day=new Date(d+'T00:00:00').getDate();return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div title="${d}: ${fmt(dailyTotals[d])}" style="width:100%;height:${h}px;background:var(--accent);border-radius:3px 3px 0 0;min-width:8px;opacity:.75"></div><div style="font-size:8px;color:var(--text3)">${day}</div></div>`;}).join('')}</div></div></div>`:''}${topMerchants.length?`<div class="card"><div class="card-header"><span class="card-title">Top by Note</span></div><div class="tx-list">${topMerchants.map(([note,amt],i)=>`<div class="tx-item"><div class="tx-icon" style="background:var(--accent-soft);color:var(--accent);font-weight:700;font-size:13px">#${i+1}</div><div class="tx-info"><div class="tx-name">${esc(note)}</div></div><div class="tx-amount">${fmt(amt)}</div></div>`).join('')}</div></div>`:''}${incomeData.length?`<div class="card"><div class="card-header"><span class="card-title">Income</span></div><div style="padding:0 16px 16px"><div style="font-size:22px;font-weight:700;color:var(--green)">${fmt(incomeData.reduce((s,i)=>s+i.amount,0))}</div><div style="font-size:12px;color:var(--text3)">${incomeData.length} income record${incomeData.length===1?'':'s'}</div></div></div>`:''}`;
}

/* ── Dashboard Widget Board ── */
const DASHBOARD_WIDGET_DEFAULTS=[
  {id:'greeting-card',label:'Greeting',visible:true},
  {id:'safe-spend-card',label:'Safe Spend',visible:true},
  {id:'salary-prompt-card',label:'Salary Prompt',visible:true},
  {id:'spend-forecast-card',label:'Spend Forecast',visible:true},
  {id:'upcoming-bills-card',label:'Upcoming Bills',visible:true},
  {id:'alerts-insights-card',label:'Alerts & Insights',visible:true},
  {id:'money-flow-card',label:'Money Flow',visible:true},
  {id:'debt-focus-card',label:'Debt Focus',visible:true},
  {id:'installments-card-mini',label:'Installments',visible:true},
  {id:'budget-attention-card',label:'Budget Attention',visible:true},
  {id:'recent-tx-card',label:'Recent Transactions',visible:true},
];
let _dashWidgetConfig=null;
function loadDashboardWidgetConfig(){
  if(_dashWidgetConfig)return _dashWidgetConfig;
  try{const raw=localStorage.getItem('ft_dashboard_widgets');if(raw){const saved=JSON.parse(raw);_dashWidgetConfig=DASHBOARD_WIDGET_DEFAULTS.map(def=>{const found=saved.find(s=>s.id===def.id);return found?{...def,...found}:{...def};});}else{_dashWidgetConfig=DASHBOARD_WIDGET_DEFAULTS.map(d=>({...d}));}}catch(e){_dashWidgetConfig=DASHBOARD_WIDGET_DEFAULTS.map(d=>({...d}));}
  return _dashWidgetConfig;
}
function saveDashboardWidgetConfig(){try{localStorage.setItem('ft_dashboard_widgets',JSON.stringify(_dashWidgetConfig));}catch(e){}}
function applyWidgetOrder(){
  const section=document.getElementById('sec-dashboard');if(!section)return;
  const config=loadDashboardWidgetConfig();
  config.forEach(w=>{const el=document.getElementById(w.id);if(!el)return;el.style.display=w.visible?'':'none';section.appendChild(el);});
  const showMore=document.getElementById('show-more-toggle');if(showMore)section.appendChild(showMore);
  const analyticsExpanded=document.getElementById('analytics-expanded');if(analyticsExpanded)section.appendChild(analyticsExpanded);
}
function openWidgetSettings(){
  const panel=document.getElementById('widget-settings-panel');if(!panel)return;
  const isOpen=panel.style.display!=='none';
  if(isOpen){panel.style.display='none';return;}
  renderWidgetSettingsPanel();
  panel.style.display='block';
  // Position popup below the layout button in the topbar
  const btn=document.getElementById('layout-toggle-btn');
  if(btn){
    const rect=btn.getBoundingClientRect();
    panel.style.top=(rect.bottom+8)+'px';
    panel.style.right=(window.innerWidth-rect.right)+'px';
  }
}
function _closeWidgetPanelOnOutsideClick(e){
  const panel=document.getElementById('widget-settings-panel');
  const btn=document.getElementById('layout-toggle-btn');
  if(panel&&panel.style.display!=='none'&&!panel.contains(e.target)&&e.target!==btn&&!btn?.contains(e.target)){
    panel.style.display='none';
    document.removeEventListener('mousedown',_closeWidgetPanelOnOutsideClick,true);
    document.removeEventListener('touchstart',_closeWidgetPanelOnOutsideClick,true);
  }
}
function toggleWidgetVisible(id){
  const config=loadDashboardWidgetConfig();const w=config.find(x=>x.id===id);if(w){w.visible=!w.visible;saveDashboardWidgetConfig();}
  applyWidgetOrder();renderWidgetSettingsPanel();
}
function moveWidgetUp(id){
  const config=loadDashboardWidgetConfig();const i=config.findIndex(x=>x.id===id);
  if(i>0){[config[i-1],config[i]]=[config[i],config[i-1]];saveDashboardWidgetConfig();}
  applyWidgetOrder();renderWidgetSettingsPanel();
}
function moveWidgetDown(id){
  const config=loadDashboardWidgetConfig();const i=config.findIndex(x=>x.id===id);
  if(i<config.length-1){[config[i],config[i+1]]=[config[i+1],config[i]];saveDashboardWidgetConfig();}
  applyWidgetOrder();renderWidgetSettingsPanel();
}
function resetWidgetOrder(){_dashWidgetConfig=DASHBOARD_WIDGET_DEFAULTS.map(d=>({...d}));saveDashboardWidgetConfig();applyWidgetOrder();renderWidgetSettingsPanel();}
function renderWidgetSettingsPanel(){
  const panel=document.getElementById('widget-settings-panel');if(!panel)return;
  const config=loadDashboardWidgetConfig();
  panel.innerHTML=`<div class="widget-popup"><div class="widget-popup-head"><span class="card-title" style="font-size:14px">⚙ Dashboard Layout</span><button class="notif-close-btn" onclick="openWidgetSettings()">✕</button></div><div style="padding:0 16px 4px;font-size:12px;color:var(--text3)">Show, hide, and reorder cards.</div><div style="padding:0 16px 16px;overflow-y:auto;max-height:60vh">${config.map((w,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="flex:1;font-size:13px;color:${w.visible?'var(--text)':'var(--text3)'}">${w.label}</span><button class="btn btn-sm btn-ghost" style="padding:2px 7px;width:auto" onclick="moveWidgetUp('${w.id}')"${i===0?' disabled':''}>↑</button><button class="btn btn-sm btn-ghost" style="padding:2px 7px;width:auto" onclick="moveWidgetDown('${w.id}')"${i===config.length-1?' disabled':''}>↓</button><button class="btn btn-sm ${w.visible?'btn-primary':'btn-ghost'}" style="padding:2px 8px;min-width:40px;width:auto" onclick="toggleWidgetVisible('${w.id}')">${w.visible?'On':'Off'}</button></div>`).join('')}<button class="btn btn-ghost btn-sm" style="margin-top:12px;width:100%" onclick="resetWidgetOrder()">Reset to Default</button></div></div>`;
  // Register outside-click to dismiss
  setTimeout(()=>{
    document.addEventListener('mousedown',_closeWidgetPanelOnOutsideClick,true);
    document.addEventListener('touchstart',_closeWidgetPanelOnOutsideClick,true);
  },0);
}
