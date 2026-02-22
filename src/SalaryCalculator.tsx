import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, LogOut, Save, Calculator, Calendar } from "lucide-react";

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
}

const API_URL = "http://localhost:3001";

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

interface YearlyIncomeData {
  baseSalary: number;
  bonuses: Bonus[];
  carAllowance: number;
  employeePensionPercent: number;
  employerPensionPercent: number;
  savings: SavingsAccount[];
  sacrifices: SalarySacrifice[];
}

interface IncomeState {
  name: string;
  yearlyData: Record<string, YearlyIncomeData>;
}

const TAX_YEARS = ["2022/23", "2023/24", "2024/25", "2025/26", "2026/27"];
const DEFAULT_YEAR = "2025/26";

const TAX_YEAR_CONFIG: Record<string, any> = {
  "2022/23": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 150000,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.12,
    niRate2: 0.02,
    pensionAllowance: 40000,
  },
  "2023/24": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.1,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2024/25": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2025/26": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2026/27": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
};

const initialYearlyData = (): YearlyIncomeData => ({
  baseSalary: 0,
  bonuses: [],
  carAllowance: 0,
  employeePensionPercent: 0,
  employerPensionPercent: 0,
  savings: [],
  sacrifices: [],
});

const initialIncomeState = (defaultName: string): IncomeState => ({
  name: defaultName,
  yearlyData: TAX_YEARS.reduce(
    (acc, year) => ({
      ...acc,
      [year]: initialYearlyData(),
    }),
    {},
  ),
});

export function SalaryCalculator() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("babytax_auth");
    return saved ? JSON.parse(saved) : { token: null, user: null };
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [numPeople, setNumPeople] = useState<1 | 2>(1);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [person1, setPerson1] = useState<IncomeState>(
    initialIncomeState("Person 1"),
  );
  const [person2, setPerson2] = useState<IncomeState>(
    initialIncomeState("Person 2"),
  );

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/calculation`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (data.id) {
        setNumPeople(data.numPeople);
        const mergeData = (prev: IncomeState, newData: any) => ({
          ...prev,
          name: newData.name || prev.name,
          yearlyData: {
            ...prev.yearlyData,
            ...(newData.yearlyData || {}),
          },
        });
        if (data.person1Data)
          setPerson1((prev) => mergeData(prev, data.person1Data));
        if (data.person2Data)
          setPerson2((prev) => mergeData(prev, data.person2Data));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("babytax_auth", JSON.stringify(auth));
      fetchData();
    } else {
      localStorage.removeItem("babytax_auth");
    }
  }, [auth.token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuth(data);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    setPerson1(initialIncomeState("Person 1"));
    setPerson2(initialIncomeState("Person 2"));
    setNumPeople(1);
  };

  const saveData = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/calculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          numPeople,
          person1Data: person1,
          person2Data: numPeople === 2 ? person2 : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const getYearlyData = (person: IncomeState, year: string) => {
    return person.yearlyData[year] || initialYearlyData();
  };

  const updateYearlyData = (
    personNum: 1 | 2,
    year: string,
    updates: Partial<YearlyIncomeData>,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      yearlyData: {
        ...prev.yearlyData,
        [year]: {
          ...getYearlyData(prev, year),
          ...updates,
        },
      },
    });

    if (personNum === 1) setPerson1(updater);
    else setPerson2(updater);
  };

  const updatePersonName = (personNum: 1 | 2, name: string) => {
    if (personNum === 1) setPerson1((prev) => ({ ...prev, name }));
    else setPerson2((prev) => ({ ...prev, name }));
  };

  const calculateBonusAmount = (bonus: Bonus, baseSalary: number) => {
    return bonus.type === "percentage"
      ? (baseSalary * bonus.value) / 100
      : bonus.value;
  };

  const calculateSavingsInterest = (yearlyData: YearlyIncomeData) => {
    return yearlyData.savings.reduce(
      (sum, s) => sum + (s.balance * s.interestRate) / 100,
      0,
    );
  };

  const calculateTotalGross = (yearlyData: YearlyIncomeData) => {
    const totalBonuses = yearlyData.bonuses.reduce(
      (sum, b) => sum + calculateBonusAmount(b, yearlyData.baseSalary),
      0,
    );
    return (
      yearlyData.baseSalary +
      totalBonuses +
      yearlyData.carAllowance +
      calculateSavingsInterest(yearlyData)
    );
  };

  const calculateYearlyPensionContribution = (yearlyData: YearlyIncomeData) => {
    const employee =
      (yearlyData.baseSalary * yearlyData.employeePensionPercent) / 100;
    const employer =
      (yearlyData.baseSalary * yearlyData.employerPensionPercent) / 100;
    const sacrifice = yearlyData.sacrifices
      .filter((s) => s.type === "pension")
      .reduce((sum, s) => sum + s.amount, 0);
    return {
      total: employee + employer + sacrifice,
      employee,
      employer,
      sacrifice,
    };
  };

  const calculateUKNetIncome = (person: IncomeState, year: string) => {
    const data = getYearlyData(person, year);
    const config = TAX_YEAR_CONFIG[year] || TAX_YEAR_CONFIG[DEFAULT_YEAR];
    const totalGross = calculateTotalGross(data);
    const pensionInfo = calculateYearlyPensionContribution(data);
    const savingsInterest = calculateSavingsInterest(data);
    const salarySacrifices = data.sacrifices
      .filter((s) => s.type !== "charity")
      .reduce((sum, s) => sum + s.amount, 0);
    const giftAidRaw = data.sacrifices
      .filter((s) => s.type === "charity")
      .reduce((sum, s) => sum + s.amount, 0);
    const giftAidGrossedUp = giftAidRaw * 1.25;

    const taxableIncome = totalGross - pensionInfo.employee - salarySacrifices;
    const adjustedNetIncome = taxableIncome - giftAidGrossedUp;

    let pa = config.personalAllowance;
    if (adjustedNetIncome > 100000)
      pa = Math.max(0, pa - (adjustedNetIncome - 100000) / 2);

    const basicLimit = config.basicRateLimit + giftAidGrossedUp;
    const higherLimit = config.higherRateLimit + giftAidGrossedUp;

    let incomeTax = 0;
    if (taxableIncome > pa) {
      const basic = Math.min(taxableIncome - pa, basicLimit);
      incomeTax += basic * 0.2;
      if (taxableIncome > pa + basicLimit) {
        const higher = Math.min(
          taxableIncome - (pa + basicLimit),
          higherLimit - basicLimit,
        );
        incomeTax += higher * 0.4;
        if (taxableIncome > higherLimit + pa) {
          incomeTax += (taxableIncome - (higherLimit + pa)) * 0.45;
        }
      }
    }

    let ni = 0;
    const niable = totalGross - salarySacrifices - savingsInterest;
    if (niable > config.niPt) {
      ni +=
        Math.min(niable - config.niPt, config.niUel - config.niPt) *
        config.niRate1;
      if (niable > config.niUel) ni += (niable - config.niUel) * config.niRate2;
    }

    const curIdx = TAX_YEARS.indexOf(year);
    let carryForward = 0;
    const breakdown: Record<string, number> = {};
    for (let i = 1; i <= 3; i++) {
      const pIdx = curIdx - i;
      if (pIdx >= 0) {
        const pYear = TAX_YEARS[pIdx];
        if (pYear) {
          const pData = getYearlyData(person, pYear);
          const pConfig = TAX_YEAR_CONFIG[pYear];
          if (pConfig) {
            const unused = Math.max(
              0,
              pConfig.pensionAllowance -
                calculateYearlyPensionContribution(pData).total,
            );
            carryForward += unused;
            breakdown[pYear] = unused;
          }
        }
      }
    }

    return {
      netIncome: taxableIncome - incomeTax - ni - giftAidRaw,
      incomeTax,
      ni,
      employeePension: pensionInfo.employee,
      employerPension: pensionInfo.employer,
      adjustedNetIncome,
      currentYearContribution: pensionInfo.total,
      totalAllowanceAvailable: config.pensionAllowance + carryForward,
      pensionExceeded:
        pensionInfo.total > config.pensionAllowance + carryForward,
      carryForward,
      carryForwardBreakdown: breakdown,
      interest: savingsInterest,
    };
  };

  const p1Details = calculateUKNetIncome(person1, selectedYear);
  const p2Details = calculateUKNetIncome(person2, selectedYear);
  const THRESHOLD = 100000;

  if (!auth.token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isRegistering ? "Create Account" : "Login"}</CardTitle>
            <CardDescription>
              Access your baby tax calculator data securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive font-medium">
                  {authError}
                </p>
              )}
              <Button type="submit" className="w-full">
                {isRegistering ? "Register" : "Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Need an account? Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between bg-muted/30 p-4 rounded-lg gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{auth.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] h-8 text-xs font-medium">
                <SelectValue placeholder="Tax Year" />
              </SelectTrigger>
              <SelectContent>
                {TAX_YEARS.map((year) => (
                  <SelectItem key={year} value={year} className="text-xs">
                    {year} {year === DEFAULT_YEAR ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant={numPeople === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setNumPeople(1)}
            className="flex-1 md:flex-none"
          >
            1 Person
          </Button>
          <Button
            variant={numPeople === 2 ? "default" : "outline"}
            size="sm"
            onClick={() => setNumPeople(2)}
            className="flex-1 md:flex-none"
          >
            2 People
          </Button>
          <div className="w-px h-8 bg-border mx-1 hidden md:block" />
          <Button
            variant="outline"
            size="sm"
            onClick={saveData}
            disabled={isSaving}
            className="flex-1 md:flex-none"
          >
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 md:flex-none"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-8 ${numPeople === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <PersonForm
          personNum={1}
          name={person1.name}
          onNameChange={(name) => updatePersonName(1, name)}
          yearlyData={getYearlyData(person1, selectedYear)}
          onUpdate={(updates) => updateYearlyData(1, selectedYear, updates)}
          details={p1Details}
          year={selectedYear}
        />
        {numPeople === 2 && (
          <PersonForm
            personNum={2}
            name={person2.name}
            onNameChange={(name) => updatePersonName(2, name)}
            yearlyData={getYearlyData(person2, selectedYear)}
            onUpdate={(updates) => updateYearlyData(2, selectedYear, updates)}
            details={p2Details}
            year={selectedYear}
          />
        )}
      </div>

      <Card className="mt-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Summary & Threshold Analysis ({selectedYear})</CardTitle>
          <CardDescription>
            Estimated adjusted net income vs £100,000 threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummarySection
              personName={person1.name}
              details={p1Details}
              threshold={THRESHOLD}
              year={selectedYear}
            />
            {numPeople === 2 && (
              <SummarySection
                personName={person2.name}
                details={p2Details}
                threshold={THRESHOLD}
                year={selectedYear}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummarySection({
  personName,
  details,
  threshold,
  year,
}: {
  personName: string;
  details: any;
  threshold: number;
  year: string;
}) {
  const adjustedNet = details.adjustedNetIncome;
  const config = TAX_YEAR_CONFIG[year];

  return (
    <div
      className={`p-6 rounded-lg ${adjustedNet > threshold ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}
    >
      <h3 className="font-bold text-xl mb-4 border-b pb-2">
        {personName} Summary
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
        <div className="flex justify-between text-sm italic text-muted-foreground">
          <span>Target for Childcare threshold</span>
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
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Savings Interest (Included):</span>
            <span>
              + £
              {details.interest.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm font-semibold text-blue-600">
            <span className="text-muted-foreground font-normal">
              Total Pension:
            </span>
            <span>
              £
              {(
                details.employeePension + details.employerPension
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pl-4">
            <span>Employee: £{details.employeePension.toLocaleString()}</span>
            <span>Employer: £{details.employerPension.toLocaleString()}</span>
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Pension Allowance Used:
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
            <span>
              Current Year ({year}): £{config.pensionAllowance.toLocaleString()}
            </span>
            <span className="text-green-600">
              + Carry Forward: £{details.carryForward.toLocaleString()}
            </span>
          </div>
          {Object.entries(details.carryForwardBreakdown).map(([y, val]) => (
            <div
              key={y}
              className="flex justify-between text-[10px] text-muted-foreground pl-8"
            >
              <span>Unused from {y}:</span>
              <span>£{(val as number).toLocaleString()}</span>
            </div>
          ))}
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
  personNum: 1 | 2;
  name: string;
  onNameChange: (name: string) => void;
  yearlyData: YearlyIncomeData;
  onUpdate: (updates: Partial<YearlyIncomeData>) => void;
  details: any;
  year: string;
}

function PersonForm({
  name,
  onNameChange,
  yearlyData,
  onUpdate,
  year,
}: PersonFormProps) {
  const addBonus = () =>
    onUpdate({
      bonuses: [
        ...yearlyData.bonuses,
        { id: crypto.randomUUID(), type: "fixed", value: 0 },
      ],
    });
  const updateBonus = (id: string, updates: any) =>
    onUpdate({
      bonuses: yearlyData.bonuses.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    });
  const removeBonus = (id: string) =>
    onUpdate({ bonuses: yearlyData.bonuses.filter((b) => b.id !== id) });

  const addSacrifice = () =>
    onUpdate({
      sacrifices: [
        ...yearlyData.sacrifices,
        {
          id: crypto.randomUUID(),
          name: "New Sacrifice",
          amount: 0,
          type: "other",
        },
      ],
    });
  const updateSacrifice = (id: string, updates: any) =>
    onUpdate({
      sacrifices: yearlyData.sacrifices.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    });
  const removeSacrifice = (id: string) =>
    onUpdate({ sacrifices: yearlyData.sacrifices.filter((s) => s.id !== id) });

  const addSavings = () =>
    onUpdate({
      savings: [
        ...yearlyData.savings,
        {
          id: crypto.randomUUID(),
          name: "Account",
          balance: 0,
          interestRate: 0,
        },
      ],
    });
  const updateSavings = (id: string, updates: any) =>
    onUpdate({
      savings: yearlyData.savings.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    });
  const removeSavings = (id: string) =>
    onUpdate({ savings: yearlyData.savings.filter((s) => s.id !== id) });

  return (
    <Card className="w-full">
      <CardHeader>
        <Input
          className="text-2xl font-bold border-none p-0 focus-visible:ring-0 h-auto w-full"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <CardDescription>Income & Savings for {year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="space-y-2">
          <Label>Base Salary (£)</Label>
          <Input
            type="number"
            value={yearlyData.baseSalary || ""}
            onChange={(e) => onUpdate({ baseSalary: Number(e.target.value) })}
            placeholder="e.g. 50000"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Bonuses</Label>
            <Button variant="outline" size="sm" onClick={addBonus}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {yearlyData.bonuses.map((b) => (
            <div key={b.id} className="flex gap-2">
              <Input
                type="number"
                className="flex-1"
                value={b.value || ""}
                onChange={(e) =>
                  updateBonus(b.id, { value: Number(e.target.value) })
                }
              />
              <select
                className="h-10 w-24 rounded-md border border-input px-3 py-2 text-sm"
                value={b.type}
                onChange={(e) => updateBonus(b.id, { type: e.target.value })}
              >
                <option value="fixed">£</option>
                <option value="percentage">%</option>
              </select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBonus(b.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pension (%)</Label>
            <Input
              type="number"
              value={yearlyData.employeePensionPercent || ""}
              onChange={(e) =>
                onUpdate({ employeePensionPercent: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Employer (%)</Label>
            <Input
              type="number"
              value={yearlyData.employerPensionPercent || ""}
              onChange={(e) =>
                onUpdate({ employerPensionPercent: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              Sacrifices & Donations
            </Label>
            <Button variant="outline" size="sm" onClick={addSacrifice}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {yearlyData.sacrifices.map((s) => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2">
                <Input
                  className="flex-1 bg-transparent"
                  value={s.name}
                  onChange={(e) =>
                    updateSacrifice(s.id, { name: e.target.value })
                  }
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
                <Input
                  type="number"
                  className="flex-1"
                  value={s.amount || ""}
                  onChange={(e) =>
                    updateSacrifice(s.id, { amount: Number(e.target.value) })
                  }
                />
                <select
                  className="h-10 w-32 rounded-md border border-input px-3 py-2 text-sm"
                  value={s.type}
                  onChange={(e) =>
                    updateSacrifice(s.id, { type: e.target.value })
                  }
                >
                  <option value="other">General</option>
                  <option value="pension">Pension</option>
                  <option value="ev">Electric Car</option>
                  <option value="charity">Gift Aid</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Savings Accounts</Label>
            <Button variant="outline" size="sm" onClick={addSavings}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {yearlyData.savings.map((s) => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2">
                <Input
                  className="flex-1 bg-transparent"
                  value={s.name}
                  onChange={(e) =>
                    updateSavings(s.id, { name: e.target.value })
                  }
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
                <Input
                  type="number"
                  className="flex-1"
                  placeholder="Balance"
                  value={s.balance || ""}
                  onChange={(e) =>
                    updateSavings(s.id, { balance: Number(e.target.value) })
                  }
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="Rate %"
                  value={s.interestRate || ""}
                  onChange={(e) =>
                    updateSavings(s.id, {
                      interestRate: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
