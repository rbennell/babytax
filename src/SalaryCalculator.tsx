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

interface IncomeState {
  baseSalary: number;
  bonuses: Bonus[];
  carAllowance: number;
  employeePensionPercent: number;
  employerPensionPercent: number;
}

const initialIncomeState: IncomeState = {
  baseSalary: 0,
  bonuses: [],
  carAllowance: 0,
  employeePensionPercent: 0,
  employerPensionPercent: 0,
};

export function SalaryCalculator() {
  const [numPeople, setNumPeople] = useState<1 | 2>(1);
  const [person1, setPerson1] = useState<IncomeState>(initialIncomeState);
  const [person2, setPerson2] = useState<IncomeState>(initialIncomeState);

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

  const calculateAdjustedNetIncome = (person: IncomeState) => {
    const totalGross = calculateTotal(person);
    const employeePensionContribution =
      (person.baseSalary * person.employeePensionPercent) / 100;
    // Adjusted Net Income for childcare is usually Gross - Pension (Net of tax relief)
    // Note: Gift aid could also be subtracted here, but starting with pension
    return totalGross - employeePensionContribution;
  };

  const p1Total = calculateTotal(person1);
  const p1Adjusted = calculateAdjustedNetIncome(person1);
  const p2Total = calculateTotal(person2);
  const p2Adjusted = calculateAdjustedNetIncome(person2);

  const THRESHOLD = 100000;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
        className={`grid gap-8 ${numPeople === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
      >
        <PersonForm
          title="Person 1"
          state={person1}
          update={(u) => updatePerson(1, u)}
          addBonus={() => addBonus(1)}
          removeBonus={(id) => removeBonus(1, id)}
          updateBonus={(id, updates) => updateBonus(1, id, updates)}
          calculateBonusAmount={(b) =>
            calculateBonusAmount(b, person1.baseSalary)
          }
          total={p1Total}
          adjustedNet={p1Adjusted}
        />
        {numPeople === 2 && (
          <PersonForm
            title="Person 2"
            state={person2}
            update={(u) => updatePerson(2, u)}
            addBonus={() => addBonus(2)}
            removeBonus={(id) => removeBonus(2, id)}
            updateBonus={(id, updates) => updateBonus(2, id, updates)}
            calculateBonusAmount={(b) =>
              calculateBonusAmount(b, person2.baseSalary)
            }
            total={p2Total}
            adjustedNet={p2Adjusted}
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg ${p1Adjusted > THRESHOLD ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}
            >
              <h3 className="font-bold mb-1">Person 1</h3>
              <p className="text-2xl font-bold">
                £{p1Adjusted.toLocaleString()}
              </p>
              <p className="text-sm opacity-80">Adjusted Net Income</p>
              {p1Adjusted > THRESHOLD ? (
                <p className="mt-2 text-sm font-semibold text-destructive">
                  Over threshold by £{(p1Adjusted - THRESHOLD).toLocaleString()}
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-green-600">
                  Under threshold
                </p>
              )}
            </div>
            {numPeople === 2 && (
              <div
                className={`p-4 rounded-lg ${p2Adjusted > THRESHOLD ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}
              >
                <h3 className="font-bold mb-1">Person 2</h3>
                <p className="text-2xl font-bold">
                  £{p2Adjusted.toLocaleString()}
                </p>
                <p className="text-sm opacity-80">Adjusted Net Income</p>
                {p2Adjusted > THRESHOLD ? (
                  <p className="mt-2 text-sm font-semibold text-destructive">
                    Over threshold by £
                    {(p2Adjusted - THRESHOLD).toLocaleString()}
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-green-600">
                    Under threshold
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
  calculateBonusAmount: (bonus: Bonus) => number;
  total: number;
  adjustedNet: number;
}

function PersonForm({
  title,
  state,
  update,
  addBonus,
  removeBonus,
  updateBonus,
  calculateBonusAmount,
  total,
  adjustedNet,
}: PersonFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Enter income and pension details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="space-y-2">
          <Label htmlFor={`${title}-baseSalary`}>Base Salary (£)</Label>
          <Input
            id={`${title}-baseSalary`}
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
          <Label htmlFor={`${title}-carAllowance`}>Car Allowance (£)</Label>
          <Input
            id={`${title}-carAllowance`}
            type="number"
            value={state.carAllowance || ""}
            onChange={(e) => update({ carAllowance: Number(e.target.value) })}
            placeholder="Annual car allowance"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${title}-empPension`}>Employee Pension (%)</Label>
            <Input
              id={`${title}-empPension`}
              type="number"
              value={state.employeePensionPercent || ""}
              onChange={(e) =>
                update({ employeePensionPercent: Number(e.target.value) })
              }
              placeholder="e.g. 5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${title}-employerPension`}>
              Employer Pension (%)
            </Label>
            <Input
              id={`${title}-employerPension`}
              type="number"
              value={state.employerPensionPercent || ""}
              onChange={(e) =>
                update({ employerPensionPercent: Number(e.target.value) })
              }
              placeholder="e.g. 3"
            />
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Gross Total:</span>
            <span>£{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Adjusted Net Income:</span>
            <span>£{adjustedNet.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
