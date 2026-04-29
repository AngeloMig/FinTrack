function saveData(){try{localStorage.setItem('ft_all',JSON.stringify({salary,budgets,entries,nextId,customCats,incomes,nextIncId,goals,nextGoalId,nwBalances,nwHistory,darkMode,debts,nextDebtId,wishlist,nextWishId,journal,nextJournalId,recurring,nextRecurringId,alertSettings,nwAccounts,transfers,nextTransferId,paySchedule,notificationsSeenAt,notifSeenKey,nwViewMode,budgetStrategy,debtPayoffSettings,debtPayments,nextDebtPaymentId,goalContributions,nextGoalContributionId,addFlowState,historySavedPresets,nextHistoryPresetId,recentTags,installments,nextInstallmentId,splits,nextSplitId,budgetRollovers,rolloverSettings}))}catch(e){console.error('FinTrack: failed to save data',e);if(e&&e.name==='QuotaExceededError'&&typeof showActionToast==='function'){showActionToast('Storage full','Your browser storage is full. Consider clearing old data or exporting a backup.','⚠️')}}}
function loadData(){
  try{
    const raw=localStorage.getItem('ft_all');
    if(raw){
      const d=JSON.parse(raw);
      if(d.salary!==undefined)salary=d.salary;
      if(d.budgets)budgets=d.budgets;
      if(d.entries)entries=d.entries;
      if(d.nextId)nextId=d.nextId;
      if(d.customCats)customCats=d.customCats;
      if(d.incomes)incomes=d.incomes||[];
      if(d.nextIncId)nextIncId=d.nextIncId;
      if(d.goals)goals=d.goals;
      if(d.nextGoalId)nextGoalId=d.nextGoalId;
      if(d.nwBalances)nwBalances=d.nwBalances;
      if(d.nwHistory)nwHistory=d.nwHistory;
      if(d.darkMode!==undefined)darkMode=d.darkMode;
      if(d.debts)debts=d.debts;
      if(d.nextDebtId)nextDebtId=d.nextDebtId;
      if(d.wishlist)wishlist=d.wishlist;
      if(d.nextWishId)nextWishId=d.nextWishId;
      if(d.journal)journal=d.journal;
      if(d.nextJournalId)nextJournalId=d.nextJournalId;
      if(d.recurring)recurring=d.recurring;
      if(d.nextRecurringId)nextRecurringId=d.nextRecurringId;
      if(d.alertSettings)alertSettings={...alertSettings,...d.alertSettings};
      if(d.nwAccounts&&d.nwAccounts.length)nwAccounts=d.nwAccounts;
      if(d.transfers)transfers=d.transfers;
      if(d.nextTransferId)nextTransferId=d.nextTransferId;
      if(d.paySchedule)paySchedule=d.paySchedule;
      if(d.notificationsSeenAt)notificationsSeenAt=d.notificationsSeenAt;
      if(d.notifSeenKey)notifSeenKey=d.notifSeenKey;
      if(d.nwViewMode)nwViewMode=d.nwViewMode;
      if(d.debtPayoffSettings)debtPayoffSettings={...debtPayoffSettings,...d.debtPayoffSettings};
      if(d.debtPayments)debtPayments=d.debtPayments;
      if(d.nextDebtPaymentId)nextDebtPaymentId=d.nextDebtPaymentId;
      if(d.goalContributions)goalContributions=d.goalContributions;
      if(d.nextGoalContributionId)nextGoalContributionId=d.nextGoalContributionId;
      if(d.historySavedPresets)historySavedPresets=d.historySavedPresets;
      if(d.nextHistoryPresetId)nextHistoryPresetId=d.nextHistoryPresetId;
      if(d.recentTags)recentTags=d.recentTags;
      if(d.installments)installments=d.installments;
      if(d.nextInstallmentId)nextInstallmentId=d.nextInstallmentId;
      if(d.splits)splits=d.splits;
      if(d.nextSplitId)nextSplitId=d.nextSplitId;
      if(d.budgetRollovers){const sixMonthsAgo=new Date();sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);const cutoff=`${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth()+1).padStart(2,'0')}`;budgetRollovers=Object.fromEntries(Object.entries(d.budgetRollovers).filter(([k])=>k>=cutoff));}
      if(d.rolloverSettings)rolloverSettings=d.rolloverSettings;
      if(d.addFlowState)addFlowState={...addFlowState,...d.addFlowState,lastExpenseByCategory:{...(addFlowState.lastExpenseByCategory||{}),...((d.addFlowState&&d.addFlowState.lastExpenseByCategory)||{})},favoriteExpenseTemplates:(d.addFlowState&&d.addFlowState.favoriteExpenseTemplates)||addFlowState.favoriteExpenseTemplates,lastIncomeBySource:{...(addFlowState.lastIncomeBySource||{}),...((d.addFlowState&&d.addFlowState.lastIncomeBySource)||{})}};
      if(d.budgetStrategy){
        budgetStrategy={
          ...budgetStrategy,
          ...d.budgetStrategy,
          weights:{
            needs:{...budgetStrategy.weights.needs,...((d.budgetStrategy.weights&&d.budgetStrategy.weights.needs)||{})},
            wants:{...budgetStrategy.weights.wants,...((d.budgetStrategy.weights&&d.budgetStrategy.weights.wants)||{})},
            savings:{...budgetStrategy.weights.savings,...((d.budgetStrategy.weights&&d.budgetStrategy.weights.savings)||{})}
          }
        };
      }
      // Migration: ensure XM Wallet account exists with key 'xm'
      if(!nwAccounts.find(a=>a.key==='xm')){
        nwAccounts.push({key:'xm',name:'XM Wallet',icon:'📊'});
        if(nwBalances['xm']===undefined)nwBalances['xm']=0;
      }
      // Migration: ensure Trading Loss budget exists without adding spending by default.
      if(budgets['Trading Loss']===undefined)budgets['Trading Loss']=0;
    }
  }catch(e){}
}
