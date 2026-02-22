import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Bonus {
  id: string;
  type: "fixed" | "percentage";
  value: number;
}

interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
}

interface SalarySacrifice {
  id: string;
  name: string;
  amount: number;
  type: "pension" | "ev" | "charity" | "other";
}

interface PensionHistory {
  year: string;
  contribution: number;
  allowance: number;
}

interface IncomeState {
  name: string;
  baseSalary: number;
  bonuses: Bonus[];
  carAllowance: number;
  employeePensionPercent: number;
  employerPensionPercent: number;
  savings: SavingsAccount[];
  sacrifices: SalarySacrifice[];
  pensionHistory: PensionHistory[];
}

const previousYears = ["2023/24", "2022/23", "2021/22"];

const initialIncomeState = (defaultName: string): IncomeState => ({
  name: defaultName,
  baseSalary: 0,
  bonuses: [],
  carAllowance: 0,
  employeePensionPercent: 0,
  employerPensionPercent: 0,
  savings: [],
  sacrifices: [],
  pensionHistory: previousYears.map((year) => ({
    year,
    contribution: 0,
    allowance: year === "2023/24" ? 60000 : 40000,
  })),
});

export function SalaryCalculator() {
  const [numPeople, setNumPeople] = useState<1 | 2>(1);
  const [person1, setPerson1] = useState<IncomeState>(
    initialIncomeState("Person 1"),
  );
  const [person2, setPerson2] = useState<IncomeState>(
    initialIncomeState("Person 2"),
  );

  const updatePerson = (personNum: 1 | 2, updates: Partial<IncomeState>) => {
    if (personNum === 1) {
      setPerson1((prev) => ({ ...prev, ...updates }));
    } else {
      setPerson2((prev) => ({ ...prev, ...updates }));
    }
  };

  const addBonus = (personNum: 1 | 2) => {
    const newBonus: Bonus = {
      id: crypto.randomUUID(),
      type: "fixed",
      value: 0,
    };
    if (personNum === 1) {
      setPerson1((prev) => ({ ...prev, bonuses: [...prev.bonuses, newBonus] }));
    } else {
      setPerson2((prev) => ({ ...prev, bonuses: [...prev.bonuses, newBonus] }));
    }
  };

  const removeBonus = (personNum: 1 | 2, id: string) => {
    if (personNum === 1) {
      setPerson1((prev) => ({
        ...prev,
        bonuses: prev.bonuses.filter((b) => b.id !== id),
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        bonuses: prev.bonuses.filter((b) => b.id !== id),
      }));
    }
  };

  const updateBonus = (
    personNum: 1 | 2,
    id: string,
    updates: Partial<Omit<Bonus, "id">>,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      bonuses: prev.bonuses.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    });

    if (personNum === 1) {
      setPerson1(updater);
    } else {
      setPerson2(updater);
    }
  };

  const addSavings = (personNum: 1 | 2) => {
    const newSavings: SavingsAccount = {
      id: crypto.randomUUID(),
      name: "New Account",
      balance: 0,
      interestRate: 0,
    };
    if (personNum === 1) {
      setPerson1((prev) => ({
        ...prev,
        savings: [...prev.savings, newSavings],
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        savings: [...prev.savings, newSavings],
      }));
    }
  };

  const removeSavings = (personNum: 1 | 2, id: string) => {
    if (personNum === 1) {
      setPerson1((prev) => ({
        ...prev,
        savings: prev.savings.filter((s) => s.id !== id),
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        savings: prev.savings.filter((s) => s.id !== id),
      }));
    }
  };

  const updateSavings = (
    personNum: 1 | 2,
    id: string,
    updates: Partial<Omit<SavingsAccount, "id">>,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      savings: prev.savings.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    });

    if (personNum === 1) {
      setPerson1(updater);
    } else {
      setPerson2(updater);
    }
  };

  const addSacrifice = (personNum: 1 | 2) => {
    const newSacrifice: SalarySacrifice = {
      id: crypto.randomUUID(),
      name: "New Sacrifice",
      amount: 0,
      type: "other",
    };
    if (personNum === 1) {
      setPerson1((prev) => ({
        ...prev,
        sacrifices: [...prev.sacrifices, newSacrifice],
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        sacrifices: [...prev.sacrifices, newSacrifice],
      }));
    }
  };

  const removeSacrifice = (personNum: 1 | 2, id: string) => {
    if (personNum === 1) {
      setPerson1((prev) => ({
        ...prev,
        sacrifices: prev.sacrifices.filter((s) => s.id !== id),
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        sacrifices: prev.sacrifices.filter((s) => s.id !== id),
      }));
    }
  };

  const updateSacrifice = (
    personNum: 1 | 2,
    id: string,
    updates: Partial<Omit<SalarySacrifice, "id">>,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      sacrifices: prev.sacrifices.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    });

    if (personNum === 1) {
      setPerson1(updater);
    } else {
      setPerson2(updater);
    }
  };

  const updatePensionHistory = (
    personNum: 1 | 2,
    year: string,
    contribution: number,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      pensionHistory: prev.pensionHistory.map((h) =>
        h.year === year ? { ...h, contribution } : h,
      ),
    });

    if (personNum === 1) {
      setPerson1(updater);
    } else {
      setPerson2(updater);
    }
  };

  const calculateBonusAmount = (bonus: Bonus, baseSalary: number) => {
    if (bonus.type === "percentage") {
      return (baseSalary * bonus.value) / 100;
    }
    return bonus.value;
  };

  const calculateTotal = (person: IncomeState) => {
    const totalBonuses = person.bonuses.reduce(
      (sum, b) => sum + calculateBonusAmount(b, person.baseSalary),
      0,
    );
    return person.baseSalary + totalBonuses + person.carAllowance;
  };

  const calculateUKNetIncome = (person: IncomeState) => {
    const totalGross = calculateTotal(person);
    const employeePensionContribution =
      (person.baseSalary * person.employeePensionPercent) / 100;

    // Salary sacrifices (Pension, EV, etc.) reduce taxable income and NI
    const salarySacrifices = person.sacrifices
      .filter((s) => s.type !== "charity")
      .reduce((sum, s) => sum + s.amount, 0);

    // Gift Aid donations (grossed up by 1.25 for tax relief and ANI reduction)
    const giftAidRaw = person.sacrifices
      .filter((s) => s.type === "charity")
      .reduce((sum, s) => sum + s.amount, 0);
    const giftAidGrossedUp = giftAidRaw * 1.25;

    // Taxable income (Salary sacrifice is pre-tax)
    const taxableIncome =
      totalGross - employeePensionContribution - salarySacrifices;

    // Adjusted Net Income (ANI) for Childcare/Personal Allowance taper
    // ANI = Taxable Income - Gift Aid (grossed up)
    const adjustedNetIncome = taxableIncome - giftAidGrossedUp;

    // 2024/25 UK Tax Rules
    let personalAllowance = 12570;

    // Personal allowance taper: reduce by £1 for every £2 over £100,000 ANI
    if (adjustedNetIncome > 100000) {
      const reduction = Math.min(
        personalAllowance,
        (adjustedNetIncome - 100000) / 2,
      );
      personalAllowance -= reduction;
    }

    // Tax band extensions (Gift Aid and SIPP/Personal Pension extend the basic rate band)
    const bandExtension = giftAidGrossedUp;
    const basicRateLimit = 37700 + bandExtension;
    const higherRateLimit = 125140 + bandExtension;

    let incomeTax = 0;
    if (taxableIncome > personalAllowance) {
      // Basic Rate (20%)
      const basicRateIncome = Math.min(
        taxableIncome - personalAllowance,
        basicRateLimit,
      );
      incomeTax += basicRateIncome * 0.2;

      // Higher Rate (40%)
      if (taxableIncome > personalAllowance + basicRateLimit) {
        const higherRateIncome = Math.min(
          taxableIncome - (personalAllowance + basicRateLimit),
          higherRateLimit - (personalAllowance + basicRateLimit),
        );
        incomeTax += higherRateIncome * 0.4;

        // Additional Rate (45%)
        if (taxableIncome > higherRateLimit) {
          const additionalRateIncome = taxableIncome - higherRateLimit;
          incomeTax += additionalRateIncome * 0.45;
        }
      }
    }

    // National Insurance (Class 1) - 2024/25 rates (8% and 2%)
    let ni = 0;
    const pt = 12570;
    const uel = 50270;
    const niableIncome = totalGross - salarySacrifices;

    if (niableIncome > pt) {
      const lowerBandNI = Math.min(niableIncome - pt, uel - pt);
      ni += lowerBandNI * 0.08;

      if (niableIncome > uel) {
        const upperBandNI = niableIncome - uel;
        ni += upperBandNI * 0.02;
      }
    }

    // Pension Allowance Tracking
    const currentYearPensionSacrifice = person.sacrifices
      .filter((s) => s.type === "pension")
      .reduce((sum, s) => sum + s.amount, 0);

    const currentYearTotalContribution =
      employeePensionContribution +
      (person.baseSalary * person.employerPensionPercent) / 100 +
      currentYearPensionSacrifice;

    const carryForward = person.pensionHistory.reduce(
      (sum, h) => sum + Math.max(0, h.allowance - h.contribution),
      0,
    );

    const totalAllowanceAvailable = 60000 + carryForward;

    return {
      netIncome: taxableIncome - incomeTax - ni - giftAidRaw,
      incomeTax,
      ni,
      employeePension: employeePensionContribution,
      employerPension:
        (person.baseSalary * person.employerPensionPercent) / 100,
      adjustedNetIncome,
      currentYearContribution: currentYearTotalContribution,
      totalAllowanceAvailable,
      pensionExceeded: currentYearTotalContribution > totalAllowanceAvailable,
      carryForward,
    };
  };

  const calculateSavingsInterest = (person: IncomeState) => {
    return person.savings.reduce(
      (sum, s) => sum + (s.balance * s.interestRate) / 100,
      0,
    );
  };

  const p1Details = calculateUKNetIncome(person1);
  const p2Details = calculateUKNetIncome(person2);
  const p1Adjusted = p1Details.adjustedNetIncome;
  const p2Adjusted = p2Details.adjustedNetIncome;
  const p1Interest = calculateSavingsInterest(person1);
  const p2Interest = calculateSavingsInterest(person2);

  const THRESHOLD = 100000;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={numPeople === 1 ? "default" : "outline"}
          onClick={() => setNumPeople(1)}
        >
          1 Person
        </Button>
        <Button
          variant={numPeople === 2 ? "default" : "outline"}
          onClick={() => setNumPeople(2)}
        >
          2 People
        </Button>
      </div>

      <div
        className={`grid gap-8 ${numPeople === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <PersonForm
          title={person1.name || "Person 1"}
          state={person1}
          update={(u) => updatePerson(1, u)}
          addBonus={() => addBonus(1)}
          removeBonus={(id) => removeBonus(1, id)}
          updateBonus={(id, updates) => updateBonus(1, id, updates)}
          addSavings={() => addSavings(1)}
          removeSavings={(id) => removeSavings(1, id)}
          updateSavings={(id, updates) => updateSavings(1, id, updates)}
          addSacrifice={() => addSacrifice(1)}
          removeSacrifice={(id) => removeSacrifice(1, id)}
          updateSacrifice={(id, updates) => updateSacrifice(1, id, updates)}
          updatePensionHistory={(year, val) =>
            updatePensionHistory(1, year, val)
          }
          calculateBonusAmount={(b) =>
            calculateBonusAmount(b, person1.baseSalary)
          }
          details={p1Details}
          interest={p1Interest}
        />
        {numPeople === 2 && (
          <PersonForm
            title={person2.name || "Person 2"}
            state={person2}
            update={(u) => updatePerson(2, u)}
            addBonus={() => addBonus(2)}
            removeBonus={(id) => removeBonus(2, id)}
            updateBonus={(id, updates) => updateBonus(2, id, updates)}
            addSavings={() => addSavings(2)}
            removeSavings={(id) => removeSavings(2, id)}
            updateSavings={(id, updates) => updateSavings(2, id, updates)}
            addSacrifice={() => addSacrifice(2)}
            removeSacrifice={(id) => removeSacrifice(2, id)}
            updateSacrifice={(id, updates) => updateSacrifice(2, id, updates)}
            updatePensionHistory={(year, val) =>
              updatePensionHistory(2, year, val)
            }
            calculateBonusAmount={(b) =>
              calculateBonusAmount(b, person2.baseSalary)
            }
            details={p2Details}
            interest={p2Interest}
          />
        )}
      </div>

      <Card className="mt-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Summary & Threshold Analysis</CardTitle>
          <CardDescription>
            Estimated adjusted net income vs £100,000 threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummarySection
              person={person1}
              adjustedNet={p1Adjusted}
              details={p1Details}
              interest={p1Interest}
              threshold={THRESHOLD}
            />
            {numPeople === 2 && (
              <SummarySection
                person={person2}
                adjustedNet={p2Adjusted}
                details={p2Details}
                interest={p2Interest}
                threshold={THRESHOLD}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummarySection({
  person,
  adjustedNet,
  details,
  interest,
  threshold,
}: any) {
  return (
    <div
      className={`p-6 rounded-lg ${adjustedNet > threshold ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}
    >
      <h3 className="font-bold text-xl mb-4 border-b pb-2">
        {person.name} Summary
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Adjusted Net Income:</span>
          <span className="font-bold">
            £
            {adjustedNet.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground italic">
            Target for Childcare threshold
          </span>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Take-home Pay (Est.):</span>
            <span className="font-bold text-green-600">
              £
              {details.netIncome.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Income Tax:</span>
            <span>
              - £
              {details.incomeTax.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>National Insurance:</span>
            <span>
              - £
              {details.ni.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pension:</span>
            <span className="font-semibold text-blue-600">
              £
              {(
                details.employeePension + details.employerPension
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Employee:</span>
            <span>
              £
              {details.employeePension.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Employer:</span>
            <span>
              £
              {details.employerPension.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Annual Pension Utilised:
            </span>
            <span
              className={`font-semibold ${details.pensionExceeded ? "text-destructive" : "text-blue-600"}`}
            >
              £
              {details.currentYearContribution.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Current Year (24/25):</span>
            <span>£60,000</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Carry Forward:</span>
            <span>+ £{details.carryForward.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold pt-1 border-t">
            <span>Total Available:</span>
            <span>£{details.totalAllowanceAvailable.toLocaleString()}</span>
          </div>
          {details.pensionExceeded && (
            <p className="text-[10px] text-destructive font-bold text-right pt-1">
              ⚠️ EXCEEDS TOTAL ALLOWANCE
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-dashed">
          {adjustedNet > threshold ? (
            <p className="text-sm font-semibold text-destructive">
              ⚠️ Over threshold by £
              {(adjustedNet - threshold).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          ) : (
            <p className="text-sm font-semibold text-green-600">
              ✅ Under threshold
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PersonFormProps {
  title: string;
  state: IncomeState;
  update: (updates: Partial<IncomeState>) => void;
  addBonus: () => void;
  removeBonus: (id: string) => void;
  updateBonus: (id: string, updates: Partial<Omit<Bonus, "id">>) => void;
  addSavings: () => void;
  removeSavings: (id: string) => void;
  updateSavings: (
    id: string,
    updates: Partial<Omit<SavingsAccount, "id">>,
  ) => void;
  addSacrifice: () => void;
  removeSacrifice: (id: string) => void;
  updateSacrifice: (
    id: string,
    updates: Partial<Omit<SalarySacrifice, "id">>,
  ) => void;
  updatePensionHistory: (year: string, contribution: number) => void;
  calculateBonusAmount: (bonus: Bonus) => number;
  details: any;
  interest: number;
}

function PersonForm({
  title,
  state,
  update,
  addBonus,
  removeBonus,
  updateBonus,
  addSavings,
  removeSavings,
  updateSavings,
  addSacrifice,
  removeSacrifice,
  updateSacrifice,
  updatePensionHistory,
  calculateBonusAmount,
  details,
  interest,
}: PersonFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Input
            className="text-2xl font-bold border-none p-0 focus-visible:ring-0 h-auto w-full"
            value={state.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Person's Name"
          />
        </div>
        <CardDescription>Income, Sacrifices & Savings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="space-y-2">
          <Label>Base Salary (£)</Label>
          <Input
            type="number"
            value={state.baseSalary || ""}
            onChange={(e) => update({ baseSalary: Number(e.target.value) })}
            placeholder="e.g. 50000"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Bonuses</Label>
            <Button variant="outline" size="sm" onClick={addBonus}>
              <Plus className="h-4 w-4 mr-1" /> Add Bonus
            </Button>
          </div>
          {state.bonuses.map((bonus) => (
            <div key={bonus.id} className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <Input
                    type="number"
                    className="flex-1"
                    value={bonus.value || ""}
                    onChange={(e) =>
                      updateBonus(bonus.id, { value: Number(e.target.value) })
                    }
                    placeholder={
                      bonus.type === "fixed" ? "Bonus (£)" : "Bonus (%)"
                    }
                  />
                  <select
                    className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={bonus.type}
                    onChange={(e) =>
                      updateBonus(bonus.id, {
                        type: e.target.value as "fixed" | "percentage",
                      })
                    }
                  >
                    <option value="fixed">£</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBonus(bonus.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {bonus.type === "percentage" && bonus.value > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  Value: £{calculateBonusAmount(bonus).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Car Allowance (£)</Label>
          <Input
            type="number"
            value={state.carAllowance || ""}
            onChange={(e) => update({ carAllowance: Number(e.target.value) })}
            placeholder="Annual car allowance"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Workplace Pension (%)</Label>
            <Input
              type="number"
              value={state.employeePensionPercent || ""}
              onChange={(e) =>
                update({ employeePensionPercent: Number(e.target.value) })
              }
              placeholder="e.g. 5"
            />
          </div>
          <div className="space-y-2">
            <Label>Employer Pension (%)</Label>
            <Input
              type="number"
              value={state.employerPensionPercent || ""}
              onChange={(e) =>
                update({ employerPensionPercent: Number(e.target.value) })
              }
              placeholder="e.g. 3"
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              Salary Sacrifices & Donations
            </Label>
            <Button variant="outline" size="sm" onClick={addSacrifice}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Include EV lease, Cycle to work, SIPP, or Gift Aid.
          </p>
          {state.sacrifices.map((s) => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2 mb-2">
                <Input
                  className="flex-1 bg-transparent"
                  value={s.name}
                  onChange={(e) =>
                    updateSacrifice(s.id, { name: e.target.value })
                  }
                  placeholder="e.g. Electric Car"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSacrifice(s.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Annual Amount (£)</Label>
                  <Input
                    type="number"
                    value={s.amount || ""}
                    onChange={(e) =>
                      updateSacrifice(s.id, { amount: Number(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={s.type}
                    onChange={(e) =>
                      updateSacrifice(s.id, { type: e.target.value as any })
                    }
                  >
                    <option value="other">General</option>
                    <option value="pension">Pension/SIPP</option>
                    <option value="ev">Electric Car</option>
                    <option value="charity">Gift Aid</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-semibold">
            Pension Carry Forward
          </Label>
          <p className="text-[10px] text-muted-foreground italic">
            Enter total contributions in previous years to calculate available
            allowance.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {state.pensionHistory.map((h) => (
              <div
                key={h.year}
                className="flex items-center gap-4 p-2 bg-muted/20 rounded"
              >
                <span className="text-sm font-medium w-20">{h.year}</span>
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px]">Total Contributed (£)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={h.contribution || ""}
                    onChange={(e) =>
                      updatePensionHistory(h.year, Number(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Allowance</p>
                  <p className="text-xs font-semibold">
                    £{h.allowance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Savings Accounts</Label>
            <Button variant="outline" size="sm" onClick={addSavings}>
              <Plus className="h-4 w-4 mr-1" /> Add Account
            </Button>
          </div>
          {state.savings.map((s) => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2 mb-2">
                <Input
                  className="flex-1 bg-transparent"
                  value={s.name}
                  onChange={(e) =>
                    updateSavings(s.id, { name: e.target.value })
                  }
                  placeholder="Account Name"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSavings(s.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Balance (£)</Label>
                  <Input
                    type="number"
                    value={s.balance || ""}
                    onChange={(e) =>
                      updateSavings(s.id, { balance: Number(e.target.value) })
                    }
                    placeholder="Balance"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Interest (%)</Label>
                  <Input
                    type="number"
                    value={s.interestRate || ""}
                    onChange={(e) =>
                      updateSavings(s.id, {
                        interestRate: Number(e.target.value),
                      })
                    }
                    placeholder="Rate"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
