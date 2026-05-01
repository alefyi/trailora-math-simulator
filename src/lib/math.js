export function generateProjectionData({
  currentAge,
  retirementAge,
  maxAge,
  startingBalance,
  monthlyContribution,
  annualGrowthRate,
  annualInflationRate,
  withdrawalRate,
  useBuggedMath = false
}) {
  const data = [];
  
  let currentBalance = startingBalance;
  let annualWithdrawal = 0;
  
  const monthlyGrowthRate = annualGrowthRate / 12;
  // This is the bug the client originally complained about
  const buggedPostRetirementMonthlyGrowthRate = (annualGrowthRate * 0.4) / 12;

  let currentYear = currentAge;
  let currentMonth = 0;

  // We'll generate data points yearly for the chart to keep it clean,
  // but we will calculate the compounding monthly to match the Dart code exactly.
  
  while (currentYear <= maxAge) {
    let yearStartBalance = currentBalance;
    let totalYearWithdrawal = 0;

    for (let m = 0; m < 12; m++) {
      const isRetirementStartMonth = (currentYear === retirementAge && m === 0);
      const isRetirementAnniversaryMonth = (currentYear > retirementAge && m === 0);

      if (isRetirementStartMonth) {
        annualWithdrawal = currentBalance * withdrawalRate;
      } else if (isRetirementAnniversaryMonth && annualWithdrawal > 0) {
        annualWithdrawal = annualWithdrawal * (1 + annualInflationRate);
      }

      let currentWithdrawal = annualWithdrawal > 0 ? Math.round(annualWithdrawal / 12) : 0;

      if (currentYear < retirementAge) {
        // Pre-retirement accumulation
        currentBalance = Math.round((currentBalance + monthlyContribution) * (1 + monthlyGrowthRate));
      } else {
        // Post-retirement decumulation
        let effectiveGrowthRate = useBuggedMath ? buggedPostRetirementMonthlyGrowthRate : monthlyGrowthRate;
        
        currentBalance = Math.round((currentBalance - currentWithdrawal) * (1 + effectiveGrowthRate));
        currentBalance = Math.max(0, currentBalance);
        totalYearWithdrawal += currentWithdrawal;
      }
    }

    data.push({
      age: currentYear,
      balance: currentBalance,
      withdrawal: totalYearWithdrawal,
    });

    currentYear++;
  }

  return data;
}
