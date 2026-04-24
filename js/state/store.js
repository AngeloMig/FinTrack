let customCats=[],salary=20000,budgets={},entries=[],nextId=1,nwAccounts=[...DEFAULT_NW_ACCOUNTS];
let incomes=[],nextIncId=1,goals=[],nextGoalId=1,transfers=[],nextTransferId=1,lastTransferUndo=null;
let nwBalances={bdo:0,gcash:0,mp2:0,xm:0},nwHistory=[];
let darkMode=false,debts=[],nextDebtId=1;
let wishlist=[],nextWishId=1,journal=[],nextJournalId=1,recurring=[],nextRecurringId=1;
let editingCat=null,deletingCat=null,editingGoalId=null,editingDebtId=null,editingEntryId=null,editingIncomeId=null,editingNetWorthKey=null;
let viewYear=new Date().getFullYear();
let addFlowState={lastExpenseByCategory:{},favoriteExpenseTemplates:[{label:'Lunch',category:'Groceries & Food',account:'gcash',note:'Lunch',amount:150},{label:'Grab',category:'Transport',account:'gcash',note:'Grab ride',amount:220},{label:'Groceries',category:'Groceries & Food',account:'bdo',note:'Groceries',amount:800},{label:'Coffee',category:'Personal / Self-Care',account:'gcash',note:'Coffee',amount:120}],lastIncomeBySource:{}};
let notificationsSeenAt=0;
let notifSeenKey='';
let _lastNotifKey='';
let nwViewMode='carousel';
let paySchedule={mode:'twice',days:[5,20]};
let onboardStep=0;
let alertSettings={budgetThreshold:80,overspendForecast:true,recurringDueSoon:true,spikeAlerts:true,lowBalanceAlerts:true,badRealityAlerts:true};
let showMoreExpanded=false;
let greetingCardIndex=0;
let greetingAutoSlideTimer=null;
let debtPayoffSettings={method:'snowball'};
let debtPayments=[],nextDebtPaymentId=1,activeDebtPaymentDebtId=null;
let goalContributions=[],nextGoalContributionId=1,activeGoalContributionGoalId=null;
let historySavedPresets=[],nextHistoryPresetId=1;
let historyBulkMode=false,historySelectedKeys=new Set(),historyVisibleSelectionKeys=[],historyActivePresetId=null;
let historyVisibleCount=20,historyLastViewKey='';
let historyDrawerOpen=false;
let budgetStrategy={
  preset:'balanced',
  needsPct:50,
  wantsPct:30,
  savingsPct:20,
  custom:false,
  weights:{
    needs:{'Groceries & Food':50,'Transport':15,'Health / Medical':10,'Insurance / HMO':10,'Electric Bill':0,'Water':0,'Miscellaneous / Buffer':15},
    wants:{'Entertainment':45,'Personal / Self-Care':25,'Education / Self-Improvement':15,'Spotify':0},
    savings:{'Savings (BDO)':35,'Emergency Fund (Digital Bank)':35,'Investments (MP2/UITF)':20,'Big Purchases / Goals':10}
  }
};
CATS.forEach(c=>budgets[c.name]=c.budget);
