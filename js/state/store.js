let customCats=[],salary=20000,budgets={},entries=[],nextId=1,nwAccounts=[...DEFAULT_NW_ACCOUNTS];
let incomes=[],nextIncId=1,goals=[],nextGoalId=1,transfers=[],nextTransferId=1,lastTransferUndo=null;
let nwBalances={bdo:0,gcash:0,mp2:0,xm:0},nwHistory=[];
let darkMode=false,debts=[],nextDebtId=1;
let wishlist=[],nextWishId=1,journal=[],nextJournalId=1,recurring=[],nextRecurringId=1;
let editingCat=null,deletingCat=null,editingGoalId=null,editingDebtId=null,editingEntryId=null,editingIncomeId=null,editingNetWorthKey=null;
let viewYear=new Date().getFullYear();
let addFlowState={lastExpenseByCategory:{},favoriteExpenseTemplates:[{label:'Lunch',category:'Dining Out',account:'gcash',note:'Lunch',amount:150},{label:'Grab',category:'Ride-Hailing',account:'gcash',note:'Grab ride',amount:220},{label:'Groceries',category:'Groceries',account:'bdo',note:'Groceries',amount:800},{label:'Coffee',category:'Coffee & Snacks',account:'gcash',note:'Coffee',amount:120}],lastIncomeBySource:{}};
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
    needs:{'Groceries':50,'Commute / Public Transport':12,'Ride-Hailing':7,'Fuel / Gas':5,'Medicines & Vitamins':8,'Doctor / Dental':5,'Online Courses':3,'Books & Materials':2,'Miscellaneous / Buffer':8,'Transfer Fees':0},
    wants:{'Dining Out':28,'Food Delivery':13,'Coffee & Snacks':8,'Gym / Fitness':8,'Clothing & Accessories':8,'Grooming & Haircut':5,'Skincare & Beauty':5,'Movies & Events':7,'Hobbies & Recreation':12,'Gifts & Celebrations':6,'Trading Loss':0},
    savings:{'Savings (BDO)':35,'Emergency Fund (Digital Bank)':35,'Investments (MP2/UITF)':20,'Big Purchases / Goals':10}
  }
};
CATS.forEach(c=>budgets[c.name]=c.budget);
