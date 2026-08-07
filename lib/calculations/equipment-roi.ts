import { differenceInMonths, addMonths } from 'date-fns';

export interface Equipment {
  id: string;
  name: string;
  purchase_date: string;
  purchase_price: number;
  maintenance_cost_yearly: number;
  expected_lifespan_years: number;
}

export function calculateEquipmentROI(
  equipment: Equipment,
  treatments: { final_price: number; treatment_date: string; status: string }[]
) {
  const completed = treatments.filter((t) => t.status === 'completed');
  const totalRevenueGenerated = completed.reduce(
    (sum, t) => sum + t.final_price,
    0
  );

  const purchaseDate = new Date(equipment.purchase_date);
  const monthsInUse = Math.max(
    differenceInMonths(new Date(), purchaseDate),
    1
  );
  const maintenanceCostToDate =
    (equipment.maintenance_cost_yearly / 12) * monthsInUse;
  const totalInvestment = equipment.purchase_price + maintenanceCostToDate;
  const netReturn = totalRevenueGenerated - totalInvestment;
  const roiPercent = (netReturn / totalInvestment) * 100;

  const avgMonthlyRevenue = totalRevenueGenerated / monthsInUse;
  const monthlyMaintenance = equipment.maintenance_cost_yearly / 12;
  const monthlyNetRevenue = avgMonthlyRevenue - monthlyMaintenance;
  const paybackMonths =
    monthlyNetRevenue > 0
      ? equipment.purchase_price / monthlyNetRevenue
      : null;
  const breakEvenDate = paybackMonths
    ? addMonths(purchaseDate, paybackMonths)
    : null;
  const isRecouped = breakEvenDate ? new Date() >= breakEvenDate : false;
  const recoveredAmount = Math.min(
    totalRevenueGenerated,
    equipment.purchase_price
  );
  const recoveredPercent =
    (recoveredAmount / equipment.purchase_price) * 100;

  return {
    totalRevenueGenerated,
    totalInvestment,
    netReturn,
    roiPercent,
    paybackMonths,
    breakEvenDate,
    isRecouped,
    recoveredAmount,
    recoveredPercent: Math.min(recoveredPercent, 100),
    monthsInUse,
    treatmentCount: completed.length,
    avgRevenuePerTreatment:
      completed.length > 0
        ? totalRevenueGenerated / completed.length
        : 0,
  };
}
